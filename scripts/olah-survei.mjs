// Membaca satu rekaman GPX hasil survei, mencocokkannya ke ruas yang ada,
// memotong awal/akhir (privasi: rumah surveyor), dan membuang titik diam.
// Pemakaian: node scripts/olah-survei.mjs <file-mentah.gpx> [--ruas NAMA.gpx] [--simpan]
//   tanpa --simpan: hanya laporan. Dengan --simpan: menulis public/gpx/<ruas>.
import fs from 'node:fs';

const arg = process.argv.slice(2);
const mentah = arg.find((a) => !a.startsWith('--'));
const paksaRuas = arg.includes('--ruas') ? arg[arg.indexOf('--ruas') + 1] : null;
const simpan = arg.includes('--simpan');
if (!mentah) { console.error('Pakai: node scripts/olah-survei.mjs <file.gpx> [--ruas NAMA.gpx] [--simpan]'); process.exit(1); }

const baca = (xml) => [...xml.matchAll(/<trkpt\b([^>]*)>([\s\S]*?)<\/trkpt>|<trkpt\b([^>]*)\/>/g)].map((m) => {
  const a = m[1] ?? m[3];
  return {
    lat: Number(/lat="([^"]+)"/.exec(a)[1]), lon: Number(/lon="([^"]+)"/.exec(a)[1]),
    ele: /<ele>([^<]+)<\/ele>/.exec(m[2] ?? '')?.[1], time: /<time>([^<]+)<\/time>/.exec(m[2] ?? '')?.[1],
  };
});
const m = (a, b) => {
  const kx = 111320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot((a.lon - b.lon) * kx, (a.lat - b.lat) * 110570);
};
const jarakKeGaris = (p, garis) => {
  let best = Infinity;
  for (let i = 1; i < garis.length; i += 1) {
    const a = garis[i - 1], b = garis[i];
    const kx = 111320 * Math.cos((p.lat * Math.PI) / 180), ky = 110570;
    const ax = (a.lon - p.lon) * kx, ay = (a.lat - p.lat) * ky, dx = (b.lon - a.lon) * kx, dy = (b.lat - a.lat) * ky;
    const l2 = dx * dx + dy * dy, t = l2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / l2)) : 0;
    best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return best;
};
const panjang = (pts) => pts.reduce((s, p, i) => (i ? s + m(pts[i - 1], p) : 0), 0);

let rek = baca(fs.readFileSync(mentah, 'utf8'));
if (rek.length < 2) { console.error('File tidak berisi trek.'); process.exit(1); }

// 1. Cocokkan ke ruas: persentase titik rekaman dalam 75 m dari ruas tersebut.
const ruas = fs.readdirSync('public/gpx').filter((f) => f.endsWith('.gpx'));
const sampel = rek.filter((_, i) => i % Math.max(1, Math.floor(rek.length / 300)) === 0);
const skor = ruas.map((f) => {
  const g = baca(fs.readFileSync(`public/gpx/${f}`, 'utf8'));
  const dekat = sampel.filter((p) => jarakKeGaris(p, g) <= 75).length / sampel.length;
  // seberapa banyak ruas yang tercakup oleh rekaman
  const gs = g.filter((_, i) => i % Math.max(1, Math.floor(g.length / 200)) === 0);
  const tercakup = gs.filter((p) => jarakKeGaris(p, sampel) <= 150).length / gs.length;
  return { f, g, dekat, tercakup, nilai: dekat * tercakup };
}).sort((a, b) => b.nilai - a.nilai);
const pilih = paksaRuas ? skor.find((s) => s.f === paksaRuas) : skor[0];
console.log('Kecocokan dengan ruas yang ada:');
skor.slice(0, 4).forEach((s) => console.log(`  ${s.f.padEnd(32)} rekaman di dekat ruas ${(s.dekat * 100).toFixed(0)}%, ruas tercakup ${(s.tercakup * 100).toFixed(0)}%`));
if (!pilih || pilih.tercakup < 0.6) console.log('PERHATIAN: tidak ada ruas yang cocok kuat. Mungkin rute baru, atau salah unggah.');

// 2. Potong awal dan akhir: mulai dari titik pertama yang dekat (<= 250 m) titik awal ruas,
//    selesai di titik terakhir yang dekat titik akhir ruas.
const awal = pilih.g[0], akhir = pilih.g[pilih.g.length - 1];
let i0 = rek.findIndex((p) => m(p, awal) <= 250);
let i1 = rek.length - 1 - [...rek].reverse().findIndex((p) => m(p, akhir) <= 250);
let potongOk = i0 >= 0 && i1 > i0 && i1 < rek.length;
if (!potongOk) {
  // cadangan: buang 500 m pertama dan terakhir
  let s = 0; i0 = 0; while (i0 < rek.length - 1 && s < 500) { s += m(rek[i0], rek[i0 + 1]); i0++; }
  s = 0; i1 = rek.length - 1; while (i1 > i0 && s < 500) { s += m(rek[i1], rek[i1 - 1]); i1--; }
}
const dibuangAwal = panjang(rek.slice(0, i0 + 1)), dibuangAkhir = panjang(rek.slice(i1));
rek = rek.slice(i0, i1 + 1);

// 3. Buang titik diam (berdekatan < 4 m).
const bersih = [rek[0]];
for (const p of rek.slice(1)) if (m(bersih[bersih.length - 1], p) >= 4) bersih.push(p);

// 4. Bagian yang menyimpang dari ruas lama (> 150 m), sebagai bahan cek.
const simpang = []; let mulai = null, jalan = 0;
for (let i = 0; i < bersih.length; i++) {
  if (i) jalan += m(bersih[i - 1], bersih[i]);
  const jauh = jarakKeGaris(bersih[i], pilih.g) > 150;
  if (jauh && mulai === null) mulai = jalan;
  if (!jauh && mulai !== null) { if (jalan - mulai > 200) simpang.push([mulai, jalan]); mulai = null; }
}

console.log(`\nRuas terpilih: ${pilih.f}`);
console.log(`Potong awal ${Math.round(dibuangAwal)} m, potong akhir ${Math.round(dibuangAkhir)} m${potongOk ? '' : ' (cadangan 500 m, titik awal/akhir ruas tidak ditemukan di rekaman)'}`);
console.log(`Panjang setelah dirapikan: ${(panjang(bersih) / 1000).toFixed(1)} km, ${bersih.length} titik`);
console.log(simpang.length ? `Menyimpang dari rute lama di km: ${simpang.map(([a, b]) => `${(a / 1000).toFixed(1)}–${(b / 1000).toFixed(1)}`).join(', ')}` : 'Tidak ada simpangan berarti dari rute lama.');

if (simpan) {
  const nama = /<name>([^<]*)<\/name>/.exec(fs.readFileSync(`public/gpx/${pilih.f}`, 'utf8'))?.[1]?.replace(/\s*\(draft\)/i, '') ?? pilih.f;
  const trk = bersih.map((p) => `      <trkpt lat="${p.lat}" lon="${p.lon}">${p.ele ? `<ele>${p.ele}</ele>` : ''}</trkpt>`).join('\n');
  fs.writeFileSync(`public/gpx/${pilih.f}`, `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="pegipeda" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${nama}</name>
    <desc>Rekaman survei pegipeda, sudah dirapikan.</desc>
  </metadata>
  <trk>
    <name>${nama}</name>
    <trkseg>
${trk}
    </trkseg>
  </trk>
</gpx>
`);
  console.log(`Tersimpan ke public/gpx/${pilih.f} (tanpa waktu rekaman, tanpa tanda DRAFT).`);
}
