import express from 'express';
import {
  getApd,
  createApd,
  createStokBatch,
  deleteApd,
} from '../controllers/apdController.js';

const router = express.Router();

router.get('/', getApd);
router.post('/', createApd);
router.post('/stok', createStokBatch);
router.delete('/:id', deleteApd);

export default router;
