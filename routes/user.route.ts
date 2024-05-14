import { Router } from 'express';
import { login, logout, refreshToken, register, verifyAccount } from '../controllers/user/auth.controller';
import { accountInfo, address, addressInfo, updateAccountInfo, updateAccountPassword, updateAccountProfilePic } from '../controllers/user/user.controller';
import { isAuthenticated } from '../middlewares/auth';
import { checkReport } from '../middlewares/reportChecker';


const router = Router();

// Auth
router.post('/auth/register', register);

router.post('/auth/verify', verifyAccount);

router.post('/auth/login', login);

router.get('/auth/logout', isAuthenticated, logout);

router.get('/auth/refresh', refreshToken);

// Roles
// router.post('/confirm/:query', confirmEmail);

// router.put('/admin/:token', permissionToAdmin);

// router.put('/seller/:token', permissionToSeller);

// Users
// router.post('/report/:id', protectRoute, newReport);

router.get('/me', [isAuthenticated, checkReport], accountInfo);

router.patch('/me/info', isAuthenticated, updateAccountInfo);

router.patch('/me/password', isAuthenticated, updateAccountPassword);

router.patch('/me/address', isAuthenticated, address);

router.get('/me/address', isAuthenticated, addressInfo);

router.post('/me/avatar', isAuthenticated, updateAccountProfilePic);

export default router;