import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getLaporanSummary(req, res) {
  try {
    const totalApd = await prisma.apd.count();
    const totalStokBatch = await prisma.stokBatch.aggregate({
      _sum: { jumlah: true },
    });
    const totalDistribusi = await prisma.distribusi.aggregate({
      _sum: { jumlahDiberikan: true },
    });

    const listApd = await prisma.apd.findMany({
      include: { stokBatches: true, distribusi: true },
    });

    const rekap = listApd.map((item) => {
      const stokMasuk = item.stokBatches.reduce((acc, b) => acc + b.jumlah, 0);
      const stokKeluar = item.distribusi.reduce(
        (acc, d) => acc + d.jumlahDiberikan,
        0,
      );
      return {
        kodeApd: item.kodeApd,
        namaApd: item.namaApd,
        jenis: item.jenis,
        satuan: item.satuan,
        totalStokAvailable: stokMasuk,
        totalTerdistribusi: stokKeluar,
      };
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalJenisApd: totalApd,
        totalStokTersedia: totalStokBatch._sum.jumlah || 0,
        totalStokTersalurkan: totalDistribusi._sum.jumlahDiberikan || 0,
      },
      rekap,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
