import type { Checkpoint } from './data';

const toRad = (d: number) => (d * Math.PI) / 180;

// Jarak titik ke ruas garis (km), pendekatan datar yang cukup untuk skala kota.
function jarakKeRuas(p: [number, number], a: [number, number], b: [number, number]) {
  const kx = 111.32 * Math.cos(toRad(p[1]));
  const ky = 110.57;
  const ax = (a[0] - p[0]) * kx, ay = (a[1] - p[1]) * ky;
  const bx = (b[0] - p[0]) * kx, by = (b[1] - p[1]) * ky;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
  const x = ax + t * dx, y = ay + t * dy;
  return { jarak: Math.hypot(x, y), t };
}

// Mengurutkan checkpoint sesuai posisinya di sepanjang rute.
// Checkpoint yang lebih jauh dari batasKm dari garis dipisahkan.
export function urutkanSepanjangRute(cps: Checkpoint[], coords: [number, number][], batasKm = 1.5) {
  const diRute: { cp: Checkpoint; posisi: number }[] = [];
  const diLuar: Checkpoint[] = [];
  for (const cp of cps) {
    let terbaik = { jarak: Infinity, posisi: 0 };
    for (let i = 1; i < coords.length; i++) {
      const r = jarakKeRuas([cp.lon, cp.lat], coords[i - 1], coords[i]);
      if (r.jarak < terbaik.jarak) terbaik = { jarak: r.jarak, posisi: i - 1 + r.t };
    }
    if (coords.length < 2 || terbaik.jarak <= batasKm) diRute.push({ cp, posisi: terbaik.posisi });
    else diLuar.push(cp);
  }
  diRute.sort((a, b) => a.posisi - b.posisi);
  return { diRute: diRute.map((d) => d.cp), diLuar };
}
