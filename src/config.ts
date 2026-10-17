// Pengaturan utama web. Fitur dinyalakan/dimatikan dari sini.

export const SITE = {
  nama: 'Rute Ramah Sepeda',
  oleh: 'pegipeda',
  deskripsi:
    'Peta rute ramah pesepeda di Jabodetabek: jalur, checkpoint, dan opsi transportasi umum yang bisa membawa sepeda.',
};

// ID Google Sheet sumber data checkpoint dan jalur.
// Agar web bisa membaca langsung, sheet harus dibagikan
// "Siapa saja yang memiliki link: Pelihat". Kalau tidak bisa dibaca,
// web memakai salinan di folder data/snapshot.
export const SHEET_ID = '1FZQ8hgiDadSPEhXDnIANdqpmeqMSfCy2kUXEEAppRCY';

export const FITUR = {
  // Halaman Saran rute (formulir untuk relawan di luar pegipeda).
  saranRute: true,
  // Badge "Mitra pegipeda" di checkpoint. Belum dipakai di MVP.
  badgeMitra: false,
  // Tampilkan QR di halaman checkpoint.
  qr: true,
};

// Link Google Form untuk saran rute. Kosongkan kalau formulir belum siap.
export const SARAN_RUTE_FORM_URL = 'https://forms.gle/Dpxqt5vrryQQMyt4A';

// Warna cadangan per jalur, dipakai kalau kolom "Warna" di sheet masih kosong.
export const WARNA_JALUR: Record<string, string> = {
  INT: '#1F5C63',
  TGS: '#D9A21B',
};

// Gaya peta dasar (gratis, tanpa API key).
export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
