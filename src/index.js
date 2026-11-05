import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routers (Pastikan path dan nama berkas route sesuai dengan struktur proyek Anda)
import authRoutes from './routes/authRoutes.js';
import apdRoutes from './routes/apdRoutes.js';
import stokRoutes from './routes/stokRoutes.js';
import distribusiRoutes from './routes/distribusiRoutes.js';
import notifikasiRoutes from './routes/notifikasiRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Penanganan __dirname pada ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Melayani File Statis Frontend (Folder public)
app.use(express.static(path.join(__dirname, '../public')));

// Health Check API Endpoint
app.get('/api/health', (req, res) => {
  res
    .status(200)
    .json({ status: 'OK', message: 'Backend Inventory APD Running' });
});

// Mounting Routes API
app.use('/api/auth', authRoutes);
app.use('/api/apd', apdRoutes);
app.use('/api/stok', stokRoutes);
app.use('/api/distribusi', distribusiRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api/users', userRoutes);

// Fallback Route untuk Single Page Application (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server.',
  });
});

// Jalankan listener port hanya untuk lingkungan lokal (Non-Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server berjalan lokal di http://localhost:${PORT}`);
  });
}

// Ekspor default wajib untuk Vercel Serverless
export default app;
