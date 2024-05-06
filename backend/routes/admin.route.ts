import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import { adminPermission } from '../middlewares/permission';
import { allUsers, banUser, count, deleteSingleUser } from '../controllers/admin/admin.user';
import { allProducts, comments, deleteProduct, inventory } from '../controllers/admin/admin.product';

const router = Router();

// Users, Admin
router.get('/users', [protectRoute, adminPermission], allUsers);

router.delete('/users/:id', [protectRoute, adminPermission], deleteSingleUser);

router.put('/users/ban/:id', [protectRoute, adminPermission], banUser);

router.get('/count', [protectRoute, adminPermission], count);


// Products, Admin
router.get('/product', [protectRoute, adminPermission], allProducts);

router.delete('/product/:id', [protectRoute, adminPermission], deleteProduct);

router.get('/product/comment', [protectRoute, adminPermission], comments);

router.get('/product/inventory', [protectRoute, adminPermission], inventory);


export default router;