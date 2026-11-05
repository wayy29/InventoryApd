import express from 'express';
import { getRiwayatTransaksi } from '../controllers/riwayatController.js';

const router = express.Router();

router.get('/', getRiwayatTransaksi);

export default router;
