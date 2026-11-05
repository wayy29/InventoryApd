import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import router yang BENAR-BENAR ADA di folder src/routes/ kamu
import authRoutes from './routes/authRoutes.js';
import apdRoutes from './routes/apdRoutes.js';
import distribusiRoutes from './routes/distribusiRoutes.js';
import notifikasiRoutes from './routes/notifikasiRoutes.js';

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

// Endpoint Health Check API
app.get('/api/health', (req, res) => {
  res
    .status(200)
    .json({ status: 'OK', message: 'Backend Inventory APD Running' });
});

// Mounting Routes (Hanya yang ada filenya)
app.use('/api/auth', authRoutes);
app.use('/api/apd', apdRoutes);
app.use('/api/distribusi', distribusiRoutes);
app.use('/api/notifikasi', notifikasiRoutes);

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

// Jalankan listener port hanya untuk lingkungan lokal
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

export default app;
