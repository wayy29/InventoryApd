import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getRiwayatTransaksi(req, res) {
  try {
    const riwayat = await prisma.riwayatTransaksi.findMany({
      include: {
        apd: true,
        batch: true,
      },
      orderBy: {
        tanggal: 'desc', // Menampilkan transaksi terbaru di paling atas
      },
    });

    return res.status(200).json({ success: true, data: riwayat });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
