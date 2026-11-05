import express from 'express';
import { getLaporanSummary } from '../controllers/laporanController.js';

const router = express.Router();

router.get('/summary', getLaporanSummary);

export default router;
