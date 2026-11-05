import express from 'express';
import {
  handleBuatDistribusi,
  handleSetujui,
  handleTolak,
  handleGetDistribusi
} from '../controllers/distribusiController.js';

const router = express.Router();

router.get('/', handleGetDistribusi);
router.post('/', handleBuatDistribusi);
router.patch('/:id/setujui', handleSetujui);
router.patch('/:id/tolak', handleTolak);

export default router;