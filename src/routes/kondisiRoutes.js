import express from 'express';
import {
  ubahKondisiBatch,
  getRiwayatKondisi,
  getStokBatch,
} from '../controllers/kondisiController.js';

const router = express.Router();

router.get('/batch', getStokBatch);
router.get('/riwayat', getRiwayatKondisi);
router.post('/ubah', ubahKondisiBatch);

export default router;
