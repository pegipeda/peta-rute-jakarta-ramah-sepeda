import fs from 'node:fs';
import path from 'node:path';

export type GpxInfo = {
  coords: [number, number][]; // [lon, lat]
  jarakKm: number;
  tanjakanM: number | null;
  nama: string;
  draft: boolean;
};

function haversine(a: [number, number], b: [number, number]) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Membaca public/gpx/<ID>.gpx. Jarak dan tanjakan dihitung otomatis,
// jadi update rute cukup dengan mengganti file GPX-nya.
export function readGpx(id: string): GpxInfo | null {
  const file = path.resolve('public/gpx', `${id}.gpx`);
  if (!fs.existsSync(file)) return null;
  const xml = fs.readFileSync(file, 'utf8');
  const pts = [...xml.matchAll(/<(?:trkpt|rtept)\b([^>]*)>([\s\S]*?)<\/(?:trkpt|rtept)>|<(?:trkpt|rtept)\b([^>]*)\/>/g)];
  const coords: [number, number][] = [];
  const eles: number[] = [];
  for (const m of pts) {
    const attrs = m[1] ?? m[3] ?? '';
    const lat = Number(/lat="([^"]+)"/.exec(attrs)?.[1]);
    const lon = Number(/lon="([^"]+)"/.exec(attrs)?.[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    coords.push([lon, lat]);
    const ele = /<ele>([^<]+)<\/ele>/.exec(m[2] ?? '')?.[1];
    if (ele !== undefined) eles.push(Number(ele));
  }
  let jarak = 0;
  for (let i = 1; i < coords.length; i++) jarak += haversine(coords[i - 1], coords[i]);
  let gain: number | null = null;
  if (eles.length === coords.length && eles.length > 1) {
    gain = 0;
    for (let i = 1; i < eles.length; i++) {
      const d = eles[i] - eles[i - 1];
      if (d > 0) gain += d;
    }
  }
  const nama = /<name>([^<]*)<\/name>/.exec(xml)?.[1] ?? id;
  return {
    coords,
    jarakKm: Math.round(jarak * 10) / 10,
    tanjakanM: gain === null ? null : Math.round(gain),
    nama,
    draft: /DRAFT/i.test(xml),
  };
}
