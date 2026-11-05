import { cekPeringatanKedaluwarsa } from '../services/notifikasiService.js';

export async function handleCekKedaluwarsa(req, res) {
  try {
    const data = await cekPeringatanKedaluwarsa();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}