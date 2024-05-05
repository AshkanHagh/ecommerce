import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import { adminPermission } from '../middlewares/permission';
import { allProducts, allUsers, banUser, count, deleteProduct, deleteSingleUser } from '../controllers/admin.controller';

const router = Router();

router.get('/users', [protectRoute, adminPermission], allUsers);

router.delete('/users/:id', [protectRoute, adminPermission], deleteSingleUser);

router.put('/users/ban/:id', [protectRoute, adminPermission], banUser);

router.get('/count', [protectRoute, adminPermission], count);

router.get('/products', [protectRoute, adminPermission], allProducts);

router.delete('/products/:id', [protectRoute, adminPermission], deleteProduct);


export default router;