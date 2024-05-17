import { Router } from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { activeUsers, ban, delSellerAccount, delUsersAccount, users } from '../controllers/admin/admin.user';

const router = Router();

router.get('/user/active', [isAuthenticated, authorizeRoles('admin')], activeUsers);

router.get('/user', [isAuthenticated, authorizeRoles('admin')], users);

router.patch('/user/ban/:id', [isAuthenticated, authorizeRoles('admin')], ban);

router.delete('/user/del/seller/:id', [isAuthenticated, authorizeRoles('admin')], delSellerAccount);

router.delete('/user/del/:id', [isAuthenticated, authorizeRoles('admin')], delUsersAccount);

export default router;