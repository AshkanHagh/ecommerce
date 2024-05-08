import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import { adminPermission } from '../middlewares/permission';
import { users, banUser, count, deleteUser } from '../controllers/admin/admin.user';
import { products, comments, deleteProduct, inventory } from '../controllers/admin/admin.product';

const router = Router();

// Users, Admin
router.get('/users', [protectRoute, adminPermission], users);

router.delete('/user/:id', [protectRoute, adminPermission], deleteUser);

router.put('/user/ban/:id', [protectRoute, adminPermission], banUser);

router.get('/count', [protectRoute, adminPermission], count);


// Products, Admin
router.get('/product', [protectRoute, adminPermission], products);

router.delete('/product/:id', [protectRoute, adminPermission], deleteProduct);

router.get('/product/comment', [protectRoute, adminPermission], comments);

router.get('/product/inventory', [protectRoute, adminPermission], inventory);


export default router;