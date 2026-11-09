import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routers
import authRoutes from './routes/authRoutes.js';
import apdRoutes from './routes/apdRoutes.js';
import distribusiRoutes from './routes/distribusiRoutes.js';
import notifikasiRoutes from './routes/notifikasiRoutes.js';
import kondisiRoutes from './routes/kondisiRoutes.js';   
import riwayatRoutes from './routes/riwayatRoutes.js';   

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend Inventory APD Running' });
});

// Mounting Routes API
app.use('/api/auth', authRoutes);
app.use('/api/apd', apdRoutes);
app.use('/api/distribusi', distribusiRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api/kondisi', kondisiRoutes);   
app.use('/api/riwayat', riwayatRoutes);   

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server.',
  });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

export default app;