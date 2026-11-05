import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import apdRoutes from './routes/apdRoutes.js';
import distribusiRoutes from './routes/distribusiRoutes.js';
import notifikasiRoutes from './routes/notifikasiRoutes.js';
import riwayatRoutes from './routes/riwayatRoutes.js';
import kondisiRoutes from './routes/kondisiRoutes.js'; // 1. Impor Route Kondisi

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/apd', apdRoutes);
app.use('/api/distribusi', distribusiRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api/riwayat', riwayatRoutes);
app.use('/api/kondisi', kondisiRoutes); // 2. Registrasi Endpoint Kondisi

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
