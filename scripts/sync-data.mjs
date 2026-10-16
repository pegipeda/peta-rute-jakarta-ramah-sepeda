// Mengambil data terbaru dari Google Sheet dan menyimpannya ke data/snapshot.
// Snapshot dipakai kalau saat build web tidak bisa membaca sheet langsung.
// Jalankan: npm run sync-data
import fs from 'node:fs';

const SHEET_ID = '1FZQ8hgiDadSPEhXDnIANdqpmeqMSfCy2kUXEEAppRCY';

for (const tab of ['Checkpoint', 'Jalur']) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${tab}`;
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok || text.trimStart().startsWith('<')) {
    console.error(`Gagal membaca tab ${tab}. Pastikan sheet dibagikan "Siapa saja yang memiliki link".`);
    process.exit(1);
  }
  fs.writeFileSync(`data/snapshot/${tab.toLowerCase()}.csv`, text);
  console.log(`Tersimpan: data/snapshot/${tab.toLowerCase()}.csv`);
}
