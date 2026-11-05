import {
  buatPermintaanDistribusi,
  setujuiDistribusi,
  tolakDistribusi,
  getAllDistribusi
} from '../services/distribusiService.js';

export async function handleBuatDistribusi(req, res) {
  try {
    const { apdId, jumlah, penerima, unit } = req.body;
    if (!apdId || !jumlah || !penerima || !unit) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
    }
    const data = await buatPermintaanDistribusi(Number(apdId), Number(jumlah), penerima, unit);
    return res.status(201).json({
      success: true,
      message: 'Permintaan distribusi berhasil diajukan, menunggu persetujuan admin.',
      data
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function handleSetujui(req, res) {
  try {
    const { id } = req.params;
    const result = await setujuiDistribusi(Number(id));
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function handleTolak(req, res) {
  try {
    const { id } = req.params;
    const result = await tolakDistribusi(Number(id));
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function handleGetDistribusi(req, res) {
  try {
    const data = await getAllDistribusi();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}