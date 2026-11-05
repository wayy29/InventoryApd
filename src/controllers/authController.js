import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Registrasi Akun Baru
export async function register(req, res) {
  try {
    const { username, nama, password, role } = req.body;

    if (!username || !nama || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, nama, dan password wajib diisi.',
      });
    }

    // Cek apakah username sudah ada
    const userExist = await prisma.user.findUnique({ where: { username } });
    if (userExist) {
      return res
        .status(400)
        .json({ success: false, message: 'Username sudah terdaftar.' });
    }

    // Enkripsi Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke Tabel User
    const userBaru = await prisma.user.create({
      data: {
        username,
        nama,
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'KARYAWAN',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran akun berhasil.',
      user: {
        id: userBaru.id,
        username: userBaru.username,
        nama: userBaru.nama,
        role: userBaru.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Login Akun
export async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Username atau password salah.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Username atau password salah.' });
    }

    // Catatan log login ke tabel RiwayatLogin
    await prisma.riwayatLogin.create({
      data: { userId: user.id },
    });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Ambil Semua Daftar Akun Terdaftar
export async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, nama: true, role: true },
    });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Ambil Semua Riwayat Login
export async function getRiwayatLogin(req, res) {
  try {
    const logs = await prisma.riwayatLogin.findMany({
      include: {
        user: { select: { username: true, nama: true, role: true } },
      },
      orderBy: { waktu: 'desc' },
    });
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Hapus Akun Pengguna (Khusus Admin)
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const userId = Number(id);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'Akun tidak ditemukan.' });
    }

    // Hapus riwayat login terkait terlebih dahulu, kemudian hapus akun user
    await prisma.$transaction([
      prisma.riwayatLogin.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return res
      .status(200)
      .json({ success: true, message: 'Akun berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
