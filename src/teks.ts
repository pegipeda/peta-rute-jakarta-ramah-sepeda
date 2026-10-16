// ============================================================
// SEMUA TEKS YANG TAMPIL DI WEB ADA DI FILE INI.
// Ubah kata di antara tanda kutip '...' sesuka hati, lalu simpan.
// Bagian bertanda {seperti_ini} akan diganti angka atau nama
// secara otomatis, jadi biarkan tetap ada di kalimatnya.
// Jangan menghapus tanda kutip, koma, atau nama di sebelah kiri titik dua.
// ============================================================

export const TEKS = {
  umum: {
    menuPeta: 'Peta',
    menuPanduan: 'Panduan',
    menuLapor: 'Lapor',
    kakiRamah: 'Rute di sini ramah pesepeda, bukan berarti bebas risiko. Jalan dipakai bersama, jadi tetap waspada.',
    kakiData: 'Data checkpoint dikelola komunitas {komunitas}. Peta dasar © OpenStreetMap contributors.',
    oleh: 'oleh {komunitas}',
  },

  beranda: {
    judul: 'Rute ramah sepeda di Jabodetabek',
    pengantar: 'Pilih jalur untuk melihat rute, tempat mampir, dan stasiun yang bisa dinaiki bersama sepeda. File GPX tersedia di setiap jalur.',
    judulDaftar: 'Jalur',
    jumlahPilihan: '{n} pilihan perjalanan',
  },

  jalur: {
    labelDraft: 'Draft',
    draftJudul: 'Rute ini masih draft.',
    draftIsi: 'Garisnya dibuat otomatis dari data peta dan belum digowes untuk verifikasi. Pakai sebagai gambaran dulu, bukan panduan navigasi.',
    statJarak: 'Jarak gowes',
    statJarakDraft: 'Jarak gowes (perkiraan)',
    statTanjakan: 'Total tanjakan',
    statSepeda: 'Sepeda',
    statMampir: 'Tempatnya mampir-able',
    tombolGpx: 'Unduh GPX',
    tombolGpxRuas: 'Unduh GPX: {dari} – {ke}',
    tombolTransum: 'Aturan bawa sepeda di transum',
    judulAlur: 'Alur perjalanan',
    alurGowes: 'Gowes {km} sampai {ke}',
    alurNaik: 'Naik {moda}',
    alurNaikLewat: 'Naik {moda}, melewati {n} stasiun',
    alurBisaTurun: 'Bisa juga turun di {stasiun}',
    alurTurun: 'Turun di sini',
    judulMampir: 'Mampir duls',
    mampirKosong: 'Belum ada tempat mampir yang tercatat di dekat rute ini.',
    mampirJarak: '{jarak} dari rute',
    mampirArahkan: 'Lihat jalan ke sini',
    mampirCatatan: 'Tempat mampir bukan bagian dari rute. Ikuti rute utama dulu, lalu belok ke tempat yang kamu tuju.',
  },

  checkpoint: {
    belumVerifikasi: 'Belum diverifikasi',
    terverifikasi: 'Terverifikasi',
    perluCekUlang: 'Perlu dicek ulang',
    wilayah: 'Wilayah',
    alamat: 'Alamat',
    jamBuka: 'Jam buka',
    parkirSepeda: 'Parkir sepeda',
    sepedaNonLipat: 'Sepeda non-lipat',
    bolehDibawa: 'Boleh dibawa',
    belumDicek: 'Belum dicek',
    diverifikasi: 'Diverifikasi',
    catatanBelumVerifikasi: 'Data titik ini belum dicek langsung di lapangan. Jam buka dan fasilitas bisa berbeda.',
    tombolMaps: 'Buka di Google Maps',
    tombolJalur: 'Lihat {jalur}',
    unduhQr: 'Unduh QR',
    unduhQrKeterangan: 'untuk dicetak di lokasi.',
  },

  panduan: {
    judul: 'Panduan',
    pembuka: 'Semua rute di web ini ramah pesepeda, bukan dijamin aman. Jalan dipakai bersama pejalan kaki, motor, mobil, dan angkutan umum, jadi tetap berhati-hati di setiap ruas.',
    judulLevel: 'Level keramahan',
    pengantarLevel: 'Setiap ruas rute diberi salah satu dari tiga level berikut setelah digowes dan diverifikasi.',
    level1Nama: 'Ramah pemula.',
    level1Isi: 'Jalur sepeda terproteksi atau jalan lingkungan yang sepi.',
    level2Nama: 'Perlu pengalaman.',
    level2Isi: 'Bercampur dengan lalu lintas, tapi masih wajar dilalui.',
    level3Nama: 'Waspada.',
    level3Isi: 'Ruas yang terpaksa dilewati karena belum ada alternatif. Kurangi kecepatan dan perhatikan sekitar.',
    judulTransum: 'Membawa sepeda di transportasi umum',
    kolomModa: 'Moda',
    kolomLipat: 'Sepeda lipat',
    kolomNonLipat: 'Sepeda non-lipat',
    catatanTransum: 'Ketentuan jam, gerbong, dan cara masuk stasiun bisa berubah. Cek pengumuman resmi operator sebelum berangkat.',
    judulPersiapan: 'Persiapan dan etika bersepeda',
    isiPersiapan: 'Bagian ini sedang disusun bersama program PAGI dan akan segera ditambahkan.',
  },

  lapor: {
    judul: 'Lapor perubahan di jalan',
    pengantar: 'Bantu jaga data tetap akurat. Laporkan jalan rusak, ruas yang sering banjir, tempat yang sudah tutup, atau usulan checkpoint baru. Setiap laporan dicek dulu oleh tim {komunitas} sebelum masuk ke peta.',
    tombol: 'Buka formulir laporan',
    belumSiap: 'Formulir laporan sedang disiapkan. Sementara ini, sampaikan laporan langsung ke pengurus {komunitas}.',
  },

  halamanTidakAda: {
    judul: 'Halaman tidak ditemukan',
    isi: 'Alamat ini tidak ada atau sudah dipindahkan. Kalau kamu memindai QR di lokasi, kemungkinan checkpoint tersebut sedang diperbarui.',
    tombol: 'Kembali ke peta',
  },
};

// Mengganti {nama} di dalam teks dengan nilainya.
export function isi(teks: string, nilai: Record<string, string | number> = {}) {
  return teks.replace(/\{(\w+)\}/g, (_, k) => String(nilai[k] ?? `{${k}}`));
}
