import { Router } from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { activeUsers, ban, checkReports, comments, delSellerAccount, delUsersAccount, deleteComment, deleteProduct, logs, users } from '../controllers/admin/admin';

const router = Router();

router.get('/user/active', [isAuthenticated, authorizeRoles('admin')], activeUsers);

router.get('/user', [isAuthenticated, authorizeRoles('admin')], users);

router.patch('/user/ban/:id', [isAuthenticated, authorizeRoles('admin')], ban);

router.delete('/user/del/seller/:id', [isAuthenticated, authorizeRoles('admin')], delSellerAccount);

router.delete('/user/del/:id', [isAuthenticated, authorizeRoles('admin')], delUsersAccount);

// product
router.delete('/product/:id', [isAuthenticated, authorizeRoles('admin')], deleteProduct);

router.get('/product/comment', [isAuthenticated, authorizeRoles('admin')], comments);

router.delete('/product/comment/:id', [isAuthenticated, authorizeRoles('admin')], deleteComment);

// report
router.get('/report', [isAuthenticated, authorizeRoles('admin')], checkReports);

// logs
router.get('/log', [isAuthenticated, authorizeRoles('admin')], logs);

export default router;