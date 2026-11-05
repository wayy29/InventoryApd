import express from 'express';
import { handleCekKedaluwarsa } from '../controllers/notifikasiController.js';

const router = express.Router();

router.get('/kedaluwarsa', handleCekKedaluwarsa);

export default router;