import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Buat Permintaan Distribusi (Status DIPROSES)
export async function buatPermintaanDistribusi(apdId, jumlah, penerima, unit) {
  const apd = await prisma.apd.findUnique({ where: { id: apdId } });
  if (!apd) throw new Error('APD tidak ditemukan.');

  return await prisma.distribusi.create({
    data: {
      apdId,
      jumlahDiberikan: jumlah,
      namaPenerima: penerima,
      unitPenerima: unit,
      status: 'DIPROSES',
      keterangan: 'Menunggu persetujuan admin',
    },
  });
}

// Setujui Distribusi & Potong Stok FEFO
export async function setujuiDistribusi(id) {
  const dist = await prisma.distribusi.findUnique({
    where: { id },
    include: { apd: true },
  });

  if (!dist) throw new Error('Data distribusi tidak ditemukan.');
  if (dist.status !== 'DIPROSES')
    throw new Error('Permintaan ini sudah diproses sebelumnya.');

  const apdId = dist.apdId;
  const jumlahDibutuhkan = dist.jumlahDiberikan;

  // Cek stok tersedia berdasarkan FEFO
  const stokTersedia = await prisma.stokBatch.findMany({
    where: {
      apdId: apdId,
      jumlah: { gt: 0 },
      kondisi: 'BAIK',
      tglKedaluwarsa: { gt: new Date() },
    },
    orderBy: { tglKedaluwarsa: 'asc' },
  });

  const totalStok = stokTersedia.reduce((acc, b) => acc + b.jumlah, 0);
  if (totalStok < jumlahDibutuhkan) {
    throw new Error(
      `Stok APD tidak mencukupi. Tersedia: ${totalStok}, Dibutuhkan: ${jumlahDibutuhkan}`,
    );
  }

  let sisaKebutuhan = jumlahDibutuhkan;

  await prisma.$transaction(async (tx) => {
    for (const batch of stokTersedia) {
      if (sisaKebutuhan <= 0) break;

      const jumlahDiambil = Math.min(batch.jumlah, sisaKebutuhan);

      await tx.stokBatch.update({
        where: { id: batch.id },
        data: { jumlah: batch.jumlah - jumlahDiambil },
      });

      // Catat log transaksi KELUAR
      await tx.riwayatTransaksi.create({
        data: {
          jenisTransaksi: 'KELUAR',
          apdId: apdId,
          batchId: batch.id,
          jumlah: jumlahDiambil,
          keterangan: `Distribusi ke ${dist.namaPenerima} (${dist.unitPenerima}) - Disetujui Admin`,
        },
      });

      sisaKebutuhan -= jumlahDiambil;
    }

    // Ubah status distribusi menjadi DISETUJUI
    await tx.distribusi.update({
      where: { id },
      data: {
        status: 'DISETUJUI',
        keterangan: 'Disetujui oleh Admin (Stok terpotong via FEFO)',
      },
    });
  });

  return { message: 'Distribusi berhasil disetujui dan stok telah dipotong.' };
}

// Tolak Distribusi
export async function tolakDistribusi(id) {
  const dist = await prisma.distribusi.findUnique({ where: { id } });
  if (!dist) throw new Error('Data distribusi tidak ditemukan.');
  if (dist.status !== 'DIPROSES')
    throw new Error('Permintaan ini sudah diproses sebelumnya.');

  await prisma.distribusi.update({
    where: { id },
    data: {
      status: 'DITOLAK',
      keterangan: 'Ditolak oleh Admin',
    },
  });

  return { message: 'Permintaan distribusi telah ditolak.' };
}

// Ambil Seluruh Data Distribusi
export async function getAllDistribusi() {
  return await prisma.distribusi.findMany({
    include: { apd: true },
    orderBy: { tanggal: 'desc' },
  });
}
