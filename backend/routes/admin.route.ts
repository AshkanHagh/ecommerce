import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import { adminPermission } from '../middlewares/permission';
import { allUsers, banUser, deleteSingleUser } from '../controllers/admin.controller';

const router = Router();

router.get('/users', [protectRoute, adminPermission], allUsers);

router.delete('/users/:id', [protectRoute, adminPermission], deleteSingleUser);

router.put('/users/ban/:id', [protectRoute, adminPermission], banUser);


export default router;