import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function cekPeringatanKedaluwarsa() {
  const hariIni = new Date();
  const target30Hari = new Date();
  target30Hari.setDate(hariIni.getDate() + 30);

  // Ambil hanya batch yang stok fisiknya MASIH TERSEDIA (> 0)
  const batches = await prisma.stokBatch.findMany({
    where: {
      jumlah: { gt: 0 }, // Memastikan batch yang stoknya sudah 0 tersembunyi dari notifikasi
      tglKedaluwarsa: {
        lte: target30Hari
      }
    },
    include: {
      apd: true
    },
    orderBy: {
      tglKedaluwarsa: 'asc'
    }
  });

  return batches.map(b => {
    const sisaHari = Math.ceil((new Date(b.tglKedaluwarsa) - hariIni) / (1000 * 60 * 60 * 24));
    let status = `Kedaluwarsa dalam ${sisaHari} hari`;
    if (sisaHari <= 0) status = 'SUDAH KEDALUWARSA';

    return {
      idBatch: b.id,
      kodeApd: b.apd.kodeApd,
      namaApd: b.apd.namaApd,
      sisaStok: b.jumlah,
      tanggalKedaluwarsa: b.tglKedaluwarsa,
      status: status
    };
  });
}