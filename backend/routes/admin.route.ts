import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import { adminPermission } from '../middlewares/permission';
import { allUsers } from '../controllers/admin.controller';

const router = Router();

router.get('/users', [protectRoute, adminPermission], allUsers);


export default router;