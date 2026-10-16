import fs from 'node:fs';
import path from 'node:path';
import type { Checkpoint } from './data';
import { readGpx } from './gpx';

type StasiunMentah = string | { nama: string; lat: number; lon: number };
type RuasMentah =
  | { jenis: 'gowes'; gpx: string; dari: string; ke: string }
  | { jenis: 'kereta'; moda: string; catatan?: string; stasiun: StasiunMentah[] };
type OpsiMentah = { id: string; nama: string; sepeda: string; ringkas: string; ruas: RuasMentah[] };

export type Stasiun = { nama: string; lat: number; lon: number; cpId?: string; nonLipat?: boolean };
export type Ruas =
  | { jenis: 'gowes'; gpx: string; dari: string; ke: string; coords: [number, number][]; jarakKm: number; tanjakanM: number | null; draft: boolean }
  | { jenis: 'kereta'; moda: string; catatan?: string; stasiun: Stasiun[]; coords: [number, number][] };
export type Opsi = { id: string; nama: string; sepeda: string; ringkas: string; ruas: Ruas[]; jarakGowesKm: number; draft: boolean };

const semua: Record<string, OpsiMentah[]> = JSON.parse(fs.readFileSync(path.resolve('data/opsi.json'), 'utf8'));

export function opsiJalur(jalurId: string, checkpoints: Checkpoint[]): Opsi[] {
  return (semua[jalurId] ?? []).map((o) => {
    const ruas: Ruas[] = o.ruas.map((r) => {
      if (r.jenis === 'gowes') {
        const g = readGpx(r.gpx);
        return { ...r, coords: g?.coords ?? [], jarakKm: g?.jarakKm ?? 0, tanjakanM: g?.tanjakanM ?? null, draft: g?.draft ?? true };
      }
      const stasiun: Stasiun[] = r.stasiun.map((s) => {
        if (typeof s === 'string') {
          const cp = checkpoints.find((c) => c.id === s);
          if (!cp) throw new Error(`Stasiun ${s} di data/opsi.json tidak ada di sheet Checkpoint`);
          return { nama: cp.nama, lat: cp.lat, lon: cp.lon, cpId: cp.id, nonLipat: cp.sepedaNonLipat === 'Ya' };
        }
        return s;
      });
      return { ...r, stasiun, coords: stasiun.map((s) => [s.lon, s.lat] as [number, number]) };
    });
    const gowes = ruas.filter((r) => r.jenis === 'gowes') as Extract<Ruas, { jenis: 'gowes' }>[];
    return {
      ...o,
      ruas,
      jarakGowesKm: Math.round(gowes.reduce((a, r) => a + r.jarakKm, 0) * 10) / 10,
      draft: gowes.some((r) => r.draft),
    };
  });
}
