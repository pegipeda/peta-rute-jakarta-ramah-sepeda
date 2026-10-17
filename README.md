# Peta Rute Jakarta Ramah Sepeda

Web peta rute ramah pesepeda di Jabodetabek oleh komunitas pegipeda. Berisi jalur bergaya peta KRL, checkpoint (kafe, bengkel, stasiun yang menerima sepeda), file GPX, dan QR untuk ditempel di lokasi.

Kata yang dipakai adalah **ramah**, bukan aman. Jalan dipakai bersama, jadi pesepeda tetap harus waspada.

## Isi MVP

- **Jalur Inti** (INT): Sudirman–Thamrin, Bundaran Senayan sampai Bundaran HI.
- **Jalur Tangsel** (TGS): BSD–Bintaro–Lebak Bulus–Fatmawati–Blok M–Senayan.
- 28 checkpoint (kafe, stasiun, bengkel dan toko sepeda), sebagian besar masih berstatus *Kandidat* sampai diverifikasi di lapangan.

## Cara memperbarui data

| Yang diubah | Di mana | Perlu coding? |
|---|---|---|
| Checkpoint (tambah, edit, tutup) | Google Sheet, tab **Checkpoint** | Tidak |
| Info jalur (nama, warna, status) | Google Sheet, tab **Jalur** | Tidak |
| Garis rute | Ganti file di `public/gpx/` | Tidak, cukup unggah file |
| Pilihan perjalanan (gowes penuh, gowes + MRT, KRL + gowes) | `data/opsi.json` | Sedikit |
| Peta skematik beranda | Ganti file `src/assets/peta-skematik.svg` | Tidak |
| Semua teks dan kata di tampilan web | `src/teks.ts` | Tidak, cukup ganti kata di antara tanda kutip |
| Warna dan huruf web | `src/styles/global.css`, bagian paling atas | Sedikit |
| Nyala/mati fitur | `src/config.ts`, bagian `FITUR` | Sedikit |

### Mengubah kata-kata di web

Semua teks tampilan (judul, tombol, label, keterangan) dikumpulkan di `src/teks.ts`. Cara mengubahnya langsung dari GitHub:

1. Buka file `src/teks.ts` di GitHub, klik ikon pensil (Edit).
2. Ganti kata di antara tanda kutip `'...'`. Bagian `{seperti_ini}` jangan dihapus, karena akan diganti angka atau nama secara otomatis.
3. Klik **Commit changes**. Cloudflare membangun ulang web dalam beberapa menit.

### Google Sheet

Sumber data: Google Sheet "Peta Jalur Sepeda Jakarta" milik akun pegipeda. Agar web membaca sheet secara langsung setiap kali dibangun, sheet harus dibagikan **"Siapa saja yang memiliki link: Pelihat"**. Kalau sheet tidak bisa dibaca, web memakai salinan terakhir di `data/snapshot/`.

Untuk memperbarui salinan itu: `npm run sync-data`.

### Aturan ID checkpoint

ID seperti `TGS-07` menjadi alamat halaman `/cp/tgs-07/` dan dicetak di QR. **Jangan pernah mengubah atau memakai ulang ID.** Kalau tempatnya tutup, ubah statusnya menjadi *Tutup permanen*; halamannya hilang dari web, tapi ID-nya tetap tidak dipakai lagi.

### Pilihan perjalanan dan file GPX

Setiap jalur punya satu atau lebih pilihan perjalanan di `data/opsi.json`. Satu pilihan terdiri dari ruas **gowes** (menunjuk file GPX) dan ruas **kereta** (daftar stasiun). Kafe dan bengkel bukan bagian dari rute: web otomatis menampilkannya sebagai tempat mampir kalau letaknya dalam 2 km dari ruas gowes, lengkap dengan garis cabang dari rute dan tombol menuju Google Maps.

Garis cabang mengikuti jalan sungguhan dan disimpan di `data/cabang.json`. Setelah menambah checkpoint baru di sheet atau mengganti file GPX, jalankan `npm run sync-data` lalu `npm run buat-cabang` (atau minta Claude). Kalau belum dijalankan, tempat mampir yang baru tetap muncul, hanya saja garis cabangnya lurus.

File GPX yang dipakai Jalur Tangsel:

| File | Isi |
|---|---|
| `TGS-gowes.gpx` | Taman Kota 1 BSD sampai Bundaran Senayan, gowes penuh |
| `TGS-ke-lebakbulus.gpx` | Taman Kota 1 BSD sampai Stasiun MRT Lebak Bulus |
| `TGS-tanahabang-sudirman.gpx` | Stasiun Tanah Abang sampai Sudirman |

Jarak dan total tanjakan dihitung otomatis dari GPX. Semua file sekarang masih **draft**: dibuat otomatis dengan [BRouter](https://brouter.de) (profil sepeda *trekking*, data OpenStreetMap), sudah mengikuti jalan tapi belum digowes. Setelah rute disurvei, ganti dengan rekaman GPX dari Strava, Komoot, atau Garmin, dengan nama file yang sama. Selama di dalam file masih ada kata `DRAFT`, halaman jalur menampilkan peringatan draft.

### Peta skematik

`src/assets/peta-skematik.svg` adalah versi sementara. Ganti dengan ekspor SVG dari Figma. Satu aturan: setiap garis jalur dibungkus grup dengan `id="jalur-KODE"` (contoh `id="jalur-TGS"`). Web otomatis menjadikan grup itu bisa diklik menuju halaman jalurnya.

## Survei rute

Ada dua pintu masuk rute baru:

- **Folder Drive "Survey Rute"**: untuk surveyor pegipeda. Rekaman langsung diolah dan terbit saat admin bilang "rapikan".
- **Halaman Saran rute** di web: untuk relawan di luar pegipeda, lewat Google Form (isi dari mana ke mana plus file GPX). Saran tidak terbit otomatis; Claude merangkumnya saat "rapikan", lalu dikurasi bareng tim.

Alur surveyor:

1. Surveyor merekam rute dengan Strava, Komoot, atau Garmin, lalu mengunggah file GPX ke folder Google Drive **Survey Rute** milik akun pegipeda. Nama file bebas.
2. Admin membuka Claude dengan repo ini dan cukup bilang **"rapikan"**. Catatan surveyor boleh ditempel apa adanya, misalnya "Comum ada parkir sepeda, LooPs udah pindah".
3. Claude mencocokkan rekaman ke jalur, memotong awal dan akhir rekaman supaya lokasi rumah surveyor tidak ikut terbit, memperbarui web, lalu melapor apa saja yang berubah.

Prosedur lengkapnya untuk Claude ada di `CLAUDE.md`.

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
src/pages/                 halaman: beranda, jalur, checkpoint, panduan, saran rute, QR
public/gpx/                file GPX per jalur
data/snapshot/             salinan data dari Google Sheet
```
