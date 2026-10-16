# Peta Rute Jakarta Ramah Sepeda

Web peta rute ramah pesepeda di Jabodetabek oleh komunitas PegiPeda. Berisi jalur bergaya peta KRL, checkpoint (kafe, bengkel, stasiun yang menerima sepeda), file GPX, dan QR untuk ditempel di lokasi.

Kata yang dipakai adalah **ramah**, bukan aman. Jalan dipakai bersama, jadi pesepeda tetap harus waspada.

## Isi MVP

- **Jalur Inti** (INT): Sudirman–Thamrin, Bundaran Senayan sampai Bundaran HI.
- **Jalur Tangsel** (TGS): BSD–Bintaro–Lebak Bulus–Fatmawati–Blok M–Senayan.
- 12 checkpoint, semuanya masih berstatus *Kandidat* sampai diverifikasi di lapangan.

## Cara memperbarui data

| Yang diubah | Di mana | Perlu coding? |
|---|---|---|
| Checkpoint (tambah, edit, tutup) | Google Sheet, tab **Checkpoint** | Tidak |
| Info jalur (nama, warna, status) | Google Sheet, tab **Jalur** | Tidak |
| Garis rute | Ganti file `public/gpx/KODE.gpx` | Tidak, cukup unggah file |
| Peta skematik beranda | Ganti file `src/assets/peta-skematik.svg` | Tidak |
| Warna dan huruf web | `src/styles/global.css`, bagian paling atas | Sedikit |
| Nyala/mati fitur | `src/config.ts`, bagian `FITUR` | Sedikit |

### Google Sheet

Sumber data: Google Sheet "Peta Jalur Sepeda Jakarta" milik akun PegiPeda. Agar web membaca sheet secara langsung setiap kali dibangun, sheet harus dibagikan **"Siapa saja yang memiliki link: Pelihat"**. Kalau sheet tidak bisa dibaca, web memakai salinan terakhir di `data/snapshot/`.

Untuk memperbarui salinan itu: `npm run sync-data`.

### Aturan ID checkpoint

ID seperti `TGS-07` menjadi alamat halaman `/cp/tgs-07/` dan dicetak di QR. **Jangan pernah mengubah atau memakai ulang ID.** Kalau tempatnya tutup, ubah statusnya menjadi *Tutup permanen*; halamannya hilang dari web, tapi ID-nya tetap tidak dipakai lagi.

### File GPX

Jarak dan total tanjakan dihitung otomatis dari GPX. File sekarang masih **draft** (garis kasar antar titik, belum mengikuti jalan). Ganti dengan rekaman hasil survei dari Strava, Komoot, atau Garmin, dengan nama file sesuai kode jalur (`TGS.gpx`, `INT.gpx`). Selama di dalam file masih ada kata `DRAFT`, halaman jalur menampilkan peringatan draft.

### Peta skematik

`src/assets/peta-skematik.svg` adalah versi sementara. Ganti dengan ekspor SVG dari Figma. Satu aturan: setiap garis jalur dibungkus grup dengan `id="jalur-KODE"` (contoh `id="jalur-TGS"`). Web otomatis menjadikan grup itu bisa diklik menuju halaman jalurnya.

## QR dan domain

QR dibuat dari alamat web yang diatur lewat environment variable `SITE_URL` (lihat `astro.config.mjs`). **Pastikan domain final sudah benar sebelum QR dicetak.** Kalau domain berganti setelah QR tertempel, semua QR di lapangan ikut mati.

## Deploy ke Cloudflare Pages

1. Di dashboard Cloudflare: Workers & Pages → Create → Pages → hubungkan ke repo ini.
2. Framework preset: **Astro**. Build command: `npm run build`. Output directory: `dist`.
3. Tambahkan environment variable `SITE_URL` berisi alamat web final.
4. Setiap perubahan di repo otomatis memicu deploy ulang. Perubahan di Google Sheet baru tampil setelah build berikutnya.

## Menjalankan di komputer

```bash
npm install
npm run dev      # buka http://localhost:4321
npm run build    # hasil di folder dist/
```

## Struktur

```
src/config.ts              pengaturan, fitur, warna cadangan jalur
src/lib/data.ts            membaca Google Sheet atau snapshot
src/lib/gpx.ts             membaca GPX, menghitung jarak dan tanjakan
src/lib/urutan.ts          mengurutkan checkpoint di sepanjang rute
src/pages/                 halaman: beranda, jalur, checkpoint, panduan, lapor, QR
public/gpx/                file GPX per jalur
data/snapshot/             salinan data dari Google Sheet
```
