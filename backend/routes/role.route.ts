import { Router } from 'express';
import { confirmEmail, permissionToAdmin, permissionToSeller } from '../controllers/role.controller';

const router = Router();

router.post('/confirm', confirmEmail);

router.put('/admin/:token', permissionToAdmin);

router.put('/seller/:token', permissionToSeller);


export default router;