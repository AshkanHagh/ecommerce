import { Router } from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { activeUsers, ban, checkReports, comments, delSellerAccount, delUsersAccount, deleteProduct, getTopProducts, users } from '../controllers/admin/admin.user';

const router = Router();

router.get('/user/active', [isAuthenticated, authorizeRoles('admin')], activeUsers);

router.get('/user', [isAuthenticated, authorizeRoles('admin')], users);

router.patch('/user/ban/:id', [isAuthenticated, authorizeRoles('admin')], ban);

router.delete('/user/del/seller/:id', [isAuthenticated, authorizeRoles('admin')], delSellerAccount);

router.delete('/user/del/:id', [isAuthenticated, authorizeRoles('admin')], delUsersAccount);

// product
router.delete('/product/:id', [isAuthenticated, authorizeRoles('admin')], deleteProduct);

router.get('/product/top', [isAuthenticated, authorizeRoles('admin')], getTopProducts);

router.get('/product/comment', [isAuthenticated, authorizeRoles('admin')], comments);

// report
router.get('/report', [isAuthenticated, authorizeRoles('admin')], checkReports);

export default router;