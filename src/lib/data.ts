import fs from 'node:fs';
import path from 'node:path';
import { parseCsv } from './csv';
import { SHEET_ID, WARNA_JALUR } from '../config';

export type Checkpoint = {
  id: string;
  nama: string;
  kategori: string;
  kategoriLain: string;
  jalur: string;
  wilayah: string;
  alamat: string;
  lat: number;
  lon: number;
  jamBuka: string;
  parkirSepeda: string;
  sepedaNonLipat: string;
  status: string;
  diverifikasiTanggal: string;
  diverifikasiOleh: string;
  catatan: string;
  mapsUrl: string;
};

export type Jalur = {
  id: string;
  nama: string;
  arah: string;
  dari: string;
  ke: string;
  warna: string;
  status: string;
  catatan: string;
};

const SNAPSHOT_DIR = path.resolve('data/snapshot');

async function loadTab(tab: 'Checkpoint' | 'Jalur'): Promise<Record<string, string>[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${tab}`;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    const text = await res.text();
    if (res.ok && !text.trimStart().startsWith('<')) {
      const rows = parseCsv(text);
      if (rows.length) return rows;
    }
  } catch {
    /* jatuh ke snapshot */
  }
  const file = path.join(SNAPSHOT_DIR, `${tab.toLowerCase()}.csv`);
  return parseCsv(fs.readFileSync(file, 'utf8'));
}

let cache: { checkpoints: Checkpoint[]; jalur: Jalur[] } | null = null;

export async function loadData() {
  if (cache) return cache;
  const [cpRows, jRows] = await Promise.all([loadTab('Checkpoint'), loadTab('Jalur')]);

  const checkpoints = cpRows
    .filter((r) => r['ID'] && r['Status'] !== 'Tutup permanen')
    .map<Checkpoint>((r) => ({
      id: r['ID'],
      nama: r['Nama'],
      kategori: r['Kategori'],
      kategoriLain: r['Kategori lain'],
      jalur: r['Jalur'],
      wilayah: r['Wilayah'],
      alamat: r['Alamat'],
      lat: Number(r['Lintang']),
      lon: Number(r['Bujur']),
      jamBuka: r['Jam buka'],
      parkirSepeda: r['Parkir sepeda'],
      sepedaNonLipat: r['Sepeda non-lipat'],
      status: r['Status'],
      diverifikasiTanggal: r['Diverifikasi tanggal'],
      diverifikasiOleh: r['Diverifikasi oleh'],
      catatan: r['Catatan'],
      mapsUrl: r['Google Maps'],
    }))
    .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lon));

  const jalur = jRows
    .filter((r) => r['ID'])
    .map<Jalur>((r) => ({
      id: r['ID'],
      nama: r['Nama jalur'],
      arah: r['Arah'],
      dari: r['Dari'],
      ke: r['Ke'],
      warna: r['Warna'] || WARNA_JALUR[r['ID']] || '#444444',
      status: r['Status'],
      catatan: r['Catatan'],
    }));

  cache = { checkpoints, jalur };
  return cache;
}

// ID checkpoint dipakai di URL dan QR yang dicetak, jadi dibuat huruf kecil
// dan tidak boleh berubah: TGS-07 -> /cp/tgs-07
export const cpSlug = (id: string) => id.toLowerCase();
export const jalurSlug = (id: string) => id.toLowerCase();
