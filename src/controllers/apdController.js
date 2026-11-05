import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getApd(req, res) {
  try {
    const listApd = await prisma.apd.findMany({
      include: { stokBatches: true },
    });
    return res.status(200).json({ success: true, data: listApd });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createApd(req, res) {
  try {
    const { kodeApd, namaApd, jenis, satuan } = req.body;
    if (!kodeApd || !namaApd || !jenis || !satuan) {
      return res
        .status(400)
        .json({ success: false, message: 'Semua field wajib diisi.' });
    }

    const apdBaru = await prisma.apd.create({
      data: { kodeApd, namaApd, jenis, satuan },
    });

    return res.status(201).json({ success: true, data: apdBaru });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function createStokBatch(req, res) {
  try {
    const { apdId, jumlah, lokasi, tglKedaluwarsa } = req.body;
    if (!apdId || !jumlah || !lokasi || !tglKedaluwarsa) {
      return res
        .status(400)
        .json({ success: false, message: 'Semua field wajib diisi.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const batchBaru = await tx.stokBatch.create({
        data: {
          apdId: Number(apdId),
          jumlah: Number(jumlah),
          lokasi,
          tglKedaluwarsa: new Date(tglKedaluwarsa),
        },
      });

      await tx.riwayatTransaksi.create({
        data: {
          jenisTransaksi: 'MASUK',
          apdId: Number(apdId),
          batchId: batchBaru.id,
          jumlah: Number(jumlah),
          keterangan: `Penerimaan stok batch baru di ${lokasi}`,
        },
      });

      return batchBaru;
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteApd(req, res) {
  try {
    const { id } = req.params;
    const apdId = Number(id);

    const apdExist = await prisma.apd.findUnique({ where: { id: apdId } });
    if (!apdExist) {
      return res
        .status(404)
        .json({ success: false, message: 'Data APD tidak ditemukan.' });
    }

    await prisma.apd.delete({ where: { id: apdId } });

    return res
      .status(200)
      .json({ success: true, message: 'Data APD berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
