import { Router } from 'express';
import { login, logout, register, verifyAccount } from '../controllers/user/auth.controller';
import { isAuthenticated } from '../middlewares/auth';

const router = Router();

router.post('/register', register);

router.post('/verify', verifyAccount);

router.post('/login', login);

router.get('/logout', isAuthenticated, logout);

export default router;