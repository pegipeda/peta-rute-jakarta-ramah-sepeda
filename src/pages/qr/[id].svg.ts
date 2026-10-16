import type { APIRoute } from 'astro';
import QRCode from 'qrcode';
import { loadData, cpSlug } from '../../lib/data';

// Membuat QR vektor untuk setiap checkpoint, berisi alamat halaman checkpoint.
// QR dibuat dari alamat web di astro.config.mjs (SITE_URL). Pastikan domain final
// sudah benar sebelum QR dicetak.
export async function getStaticPaths() {
  const { checkpoints } = await loadData();
  return checkpoints.map((c) => ({ params: { id: cpSlug(c.id) } }));
}

export const GET: APIRoute = async ({ params, site }) => {
  const url = new URL(`/cp/${params.id}/`, site).toString();
  const svg = await QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#16201f', light: '#ffffff' } });
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
