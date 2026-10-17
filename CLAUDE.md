# Instruksi untuk Claude

Repo ini adalah web peta rute ramah sepeda milik komunitas pegipeda (Jabodetabek), online di https://peta-rute-jakarta-ramah-sepeda.pages.dev dan dibangun ulang otomatis oleh Cloudflare Pages setiap ada push ke `main`. Admin dan surveyor bukan programmer: jelaskan hasil dalam bahasa Indonesia santai, tanpa istilah teknis yang tidak perlu. Pakai kata "ramah", jangan "aman", untuk menyebut rute. Nama komunitas selalu ditulis huruf kecil semua: "pegipeda" (bukan PegiPeda atau Pegi Peda), di web, sheet, maupun pesan commit.

## Sumber data

- Google Sheet "Peta Jalur Sepeda Jakarta", ID `1FZQ8hgiDadSPEhXDnIANdqpmeqMSfCy2kUXEEAppRCY`: tab Checkpoint, Jalur, Pilihan, Sumber. Baca dan tulis lewat konektor Google Sheets. Setelah mengubah sheet, perbarui juga `data/snapshot/*.csv` agar sama.
- Folder Google Drive "Survey Rute", ID `1Y2qMIMVuVfpc1pgfB5fmYS1booqDi0wQ`, milik pegipeda@gmail.com: tempat surveyor mengunggah rekaman GPX mentah.
- `data/opsi.json`: pilihan perjalanan per jalur. `public/gpx/`: GPX per ruas. `data/cabang.json`: garis cabang ke tempat mampir. `src/teks.ts`: semua teks tampilan.
- Aturan ID checkpoint: jangan pernah mengubah atau memakai ulang ID, karena dicetak di QR.

## Jaringan

Perlu akses ke `brouter.de` (rute sepeda) dan `tiles.openfreemap.org` (peta, untuk screenshot cek). Node tidak memakai proxy otomatis; jalankan skrip yang memanggil internet dengan:
`NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/...`

## Perintah "rapikan"

Kalau admin bilang "rapikan" (boleh diikuti catatan bebas dari surveyor), kerjakan semua ini tanpa meminta admin mengisi apa pun:

1. **Cari rekaman baru.** Daftar file di folder Survey Rute, bandingkan dengan `data/survei-log.json` (`diproses`: daftar ID file Drive yang sudah diolah). File GPX, FIT, atau TCX yang belum ada di log adalah rekaman baru. Unduh ke scratchpad, jangan ke repo.
2. **Olah setiap rekaman** dengan `node scripts/olah-survei.mjs <file>`. Skrip menebak ruasnya, memotong awal dan akhir (privasi: rekaman sering mulai dari rumah surveyor), membuang titik diam, dan melaporkan simpangan dari rute lama.
   - Cocok kuat (ruas tercakup ≥ 60%): simpan dengan `--simpan`. Waktu rekaman dan nama surveyor tidak ikut tersimpan.
   - Tidak cocok dengan ruas mana pun: jangan simpan. Tanyakan ke admin apakah ini rute baru atau salah unggah.
   - Ada simpangan berarti: tetap simpan (rekaman survei lebih dipercaya daripada draft BRouter), sebutkan simpangannya di ringkasan.
3. **Catatan bebas** dari admin atau surveyor diubah menjadi data: status parkir sepeda, jam buka, tempat tutup (Status "Tutup permanen"), checkpoint baru (cari lokasinya, beri ID baru berurutan), dan titik waspada.
4. **Level keramahan per ruas.** Usulkan dari data OpenStreetMap di sepanjang rekaman (jalur sepeda terproteksi atau jalan lingkungan → Ramah pemula; jalan kolektor atau arteri bercampur lalu lintas → Perlu pengalaman; ruas yang disebut rawan di catatan → Waspada). Kalau tampilan level per ruas belum ada di web, buat dulu: simpan di `data/level.json` per file GPX sebagai daftar `{dariKm, sampaiKm, level, catatan}` dan warnai garis rute sesuai level di halaman jalur.
5. **Perbarui checkpoint yang dilewati** survei: isi "Diverifikasi tanggal" (tanggal survei) dan "Diverifikasi oleh" (nama panggilan surveyor kalau disebut, kalau tidak "Tim pegipeda"). Ubah Status ke "Terverifikasi" hanya untuk titik yang benar-benar disebut sudah dicek.
6. **Hitung ulang garis cabang**: `npm run buat-cabang` (dengan variabel proxy di atas).
7. **Build dan cek**: `npm run build`, lihat halaman jalur yang berubah sekali lewat screenshot.
8. **Catat dan terbitkan**: tambahkan ID file Drive ke `data/survei-log.json` beserta tanggal dan ruasnya, commit dengan pesan berbahasa Indonesia, push ke `main`.
9. **Lapor ke admin** dalam beberapa kalimat: ruas apa yang diperbarui, apa yang berubah (jarak, simpangan, checkpoint), dan pertanyaan untuk hal yang tidak bisa ditebak. Jangan minta admin mengisi sheet atau mengganti nama file.

10. **Cek saran rute dari relawan.** Relawan di luar pegipeda mengisi Google Form di halaman Saran rute (link di `SARAN_RUTE_FORM_URL`, `src/config.ts`). Jawabannya masuk ke tab sheet "Form Responses 1" (atau tab lain berawalan "Saran", "Jawaban Formulir", atau "Form Responses"), file GPX-nya ke folder Drive milik formulir. Saran rute **tidak pernah diterbitkan otomatis**: untuk setiap saran baru (catat ID baris atau file di `data/survei-log.json` bagian `saran`), olah GPX-nya dengan `olah-survei.mjs` tanpa `--simpan` untuk melihat jarak dan apakah bersinggungan dengan jalur yang ada, cek sekilas jenis jalannya di OpenStreetMap, lalu laporkan ringkas ke admin (dari mana ke mana, jarak, catatan relawan, kesan awal) dan tanyakan apakah mau dikurasi lebih lanjut. Jangan cantumkan kontak relawan di repo.

Rute yang sudah dari rekaman survei tidak lagi berstatus draft (tanda `DRAFT` hilang dari file GPX). Kalau semua ruas di satu jalur sudah dari survei, ubah Status jalur di tab Jalur menjadi "Terverifikasi".

## Commit

Pakai nama `Tubeg` dan email `tubagus2695@gmail.com` untuk commit, kecuali admin lain meminta sebaliknya.
