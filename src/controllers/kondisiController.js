import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Ambil Semua Stok Batch beserta Kondisi Fisik
export async function getStokBatch(req, res) {
  try {
    const batches = await prisma.stokBatch.findMany({
      include: { apd: true },
      orderBy: { id: 'desc' }
    });
    return res.status(200).json({ success: true, data: batches });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Ubah Kondisi Fisik Batch APD (Admin)
export async function ubahKondisiBatch(req, res) {
  try {
    const { batchId, kondisiBaru, catatan } = req.body;

    if (!batchId || !kondisiBaru) {
      return res.status(400).json({ success: false, message: 'Pilih Batch dan Kondisi Baru.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const batchLama = await tx.stokBatch.findUnique({
        where: { id: Number(batchId) },
        include: { apd: true }
      });

      if (!batchLama) throw new Error('Batch APD tidak ditemukan.');

      // Update status kondisi batch
      const batchUpdated = await tx.stokBatch.update({
        where: { id: Number(batchId) },
        data: { kondisi: kondisiBaru }
      });

      // Catat log di tabel RiwayatKondisi
      await tx.riwayatKondisi.create({
        data: {
          batchId: Number(batchId),
          kondisiLama: batchLama.kondisi,
          kondisiBaru: kondisiBaru,
          catatan: catatan || 'Pembaruan kondisi fisik APD'
        }
      });

      // Catat log transaksi PENYESUAIAN
      await tx.riwayatTransaksi.create({
        data: {
          jenisTransaksi: 'PENYESUAIAN',
          apdId: batchLama.apdId,
          batchId: Number(batchId),
          jumlah: batchLama.jumlah,
          keterangan: `Perubahan kondisi Batch #${batchId} dari ${batchLama.kondisi} ke ${kondisiBaru}`
        }
      });

      return batchUpdated;
    });

    return res.status(200).json({ success: true, message: 'Kondisi APD berhasil diperbarui!', data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// Ambil Seluruh Log Riwayat Perubahan Kondisi
export async function getRiwayatKondisi(req, res) {
  try {
    const riwayat = await prisma.riwayatKondisi.findMany({
      include: {
        batch: { include: { apd: true } }
      },
      orderBy: { tanggalUbah: 'desc' }
    });
    return res.status(200).json({ success: true, data: riwayat });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}