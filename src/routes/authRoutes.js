import express from 'express';
import { register, login, getUsers, getRiwayatLogin, deleteUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getUsers);
router.get('/riwayat-login', getRiwayatLogin);
router.delete('/users/:id', deleteUser);

export default router;