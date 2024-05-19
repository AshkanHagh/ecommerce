import { Router } from 'express';
import { login, logout, refreshToken, register, verifyAccount } from '../controllers/user/auth.controller';
import { accountInfo, address, addressInfo, updateAccountInfo, updateAccountPassword, 
    updateAccountProfilePic } from '../controllers/user/user.controller';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { report } from '../controllers/user/report.controller';
import { getRoleRequests, permissionToAdmin, permissionToSeller, rejectRoleRequest, roleRequest } from '../controllers/user/role.controller';


const router = Router();

// Auth
router.post('/auth/register', register);

router.post('/auth/verify', verifyAccount);

router.post('/auth/login', login);

router.get('/auth/logout', isAuthenticated, logout);

router.get('/auth/refresh', refreshToken);

// Roles
router.post('/role/request', [isAuthenticated, authorizeRoles('user')], roleRequest);

router.get('/role', [isAuthenticated, authorizeRoles('admin')], getRoleRequests);

router.patch('/role/confirm/admin/:id', [isAuthenticated, authorizeRoles('admin')], permissionToAdmin);

router.patch('/role/confirm/seller/:id', [isAuthenticated, authorizeRoles('admin')], permissionToSeller);

router.delete('/role/reject/:id', [isAuthenticated, authorizeRoles('admin')], rejectRoleRequest);

// Users
router.get('/me', isAuthenticated, accountInfo);

router.patch('/me/info', isAuthenticated, updateAccountInfo);

router.patch('/me/password', isAuthenticated, updateAccountPassword);

router.patch('/me/address', isAuthenticated, address);

router.get('/me/address', isAuthenticated, addressInfo);

router.post('/me/avatar', isAuthenticated, updateAccountProfilePic);

router.post('/report/:id', isAuthenticated, report);

export default router;