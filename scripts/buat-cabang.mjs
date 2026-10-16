// Menghitung garis cabang yang mengikuti jalan, dari titik terdekat di rute
// sampai ke setiap tempat mampir (kafe, bengkel). Hasilnya disimpan di
// data/cabang.json dan dipakai web. Jalankan ulang setelah menambah
// checkpoint baru atau mengganti file GPX:  npm run buat-cabang
import fs from 'node:fs';

const BATAS_KM = 2;
const csv = (text) => {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [h, ...b] = rows.filter((r) => r.some((v) => v.trim()));
  return b.map((r) => Object.fromEntries(h.map((k, i) => [k.trim(), (r[i] ?? '').trim()])));
};
const gpxCoords = (file) => [...fs.readFileSync(`public/gpx/${file}`, 'utf8').matchAll(/<(?:trkpt|rtept)\b[^>]*?lat="([^"]+)"[^>]*?lon="([^"]+)"|<(?:trkpt|rtept)\b[^>]*?lon="([^"]+)"[^>]*?lat="([^"]+)"/g)]
  .map((m) => (m[1] ? [Number(m[2]), Number(m[1])] : [Number(m[3]), Number(m[4])]));

function terdekat(lon, lat, coords) {
  const kx = 111.32 * Math.cos((lat * Math.PI) / 180), ky = 110.57;
  let best = { km: Infinity, titik: coords[0] };
  for (let i = 1; i < coords.length; i++) {
    const [a, b] = [coords[i - 1], coords[i]];
    const ax = (a[0] - lon) * kx, ay = (a[1] - lat) * ky, dx = (b[0] - a[0]) * kx, dy = (b[1] - a[1]) * ky;
    const l2 = dx * dx + dy * dy;
    const t = l2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / l2)) : 0;
    const km = Math.hypot(ax + t * dx, ay + t * dy);
    if (km < best.km) best = { km, titik: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] };
  }
  return best;
}

const cps = csv(fs.readFileSync('data/snapshot/checkpoint.csv', 'utf8'))
  .filter((r) => r['ID'] && r['Kategori'] !== 'Transit' && r['Status'] !== 'Tutup permanen');
const opsi = JSON.parse(fs.readFileSync('data/opsi.json', 'utf8'));
const fileGpx = [...new Set(Object.values(opsi).filter(Array.isArray).flat().flatMap((o) => o.ruas).filter((r) => r.jenis === 'gowes').map((r) => r.gpx))];

const lama = fs.existsSync('data/cabang.json') ? JSON.parse(fs.readFileSync('data/cabang.json', 'utf8')) : {};
const hasil = {};
for (const gpx of fileGpx) {
  const coords = gpxCoords(gpx);
  for (const c of cps) {
    const lon = Number(c['Bujur']), lat = Number(c['Lintang']);
    const t = terdekat(lon, lat, coords);
    if (t.km > BATAS_KM) continue;
    const kunci = `${c['ID']}|${gpx}`;
    const url = `https://brouter.de/brouter?lonlats=${t.titik[0].toFixed(6)},${t.titik[1].toFixed(6)}|${lon},${lat}&profile=trekking&alternativeidx=0&format=geojson`;
    try {
      const res = await fetch(url);
      const g = await res.json();
      const f = g.features[0];
      hasil[kunci] = {
        coords: f.geometry.coordinates.map((p) => [Number(p[0].toFixed(6)), Number(p[1].toFixed(6))]),
        jarakM: Number(f.properties['track-length']),
      };
      console.log(`${kunci}: ${hasil[kunci].jarakM} m`);
    } catch (e) {
      if (lama[kunci]) hasil[kunci] = lama[kunci];
      console.warn(`${kunci}: gagal (${e.message}), ${lama[kunci] ? 'pakai data lama' : 'dilewati'}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
}
fs.writeFileSync('data/cabang.json', JSON.stringify(hasil, null, 1) + '\n');
console.log(`Tersimpan ${Object.keys(hasil).length} garis cabang di data/cabang.json`);
