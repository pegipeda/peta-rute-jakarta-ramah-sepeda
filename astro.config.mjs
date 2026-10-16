import { defineConfig } from 'astro/config';

// Alamat web final. Ganti lewat environment variable SITE_URL di Cloudflare
// begitu domain resmi sudah ada. QR checkpoint dibuat dari alamat ini.
const site = process.env.SITE_URL || 'https://peta-rute-jakarta-ramah-sepeda.pages.dev';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
