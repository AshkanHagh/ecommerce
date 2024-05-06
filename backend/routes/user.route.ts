import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import { checkReport } from '../middlewares/checkReports';
import { updateAddress, updateProfile, userProfile } from '../controllers/user/user.controller';
import { newReport } from '../controllers/shop/report.controller';
import { confirmEmail, permissionToAdmin, permissionToSeller } from '../controllers/user/role.controller';

const router = Router();

// role
router.post('/confirm/:query', confirmEmail);

router.put('/admin/:token', permissionToAdmin);

router.put('/seller/:token', permissionToSeller);

// users
router.post('/report/:id', protectRoute, newReport);

router.get('/', [protectRoute, checkReport], userProfile);

router.put('/profile/:id', protectRoute, updateProfile);

router.put('/address/:id', protectRoute, updateAddress);


export default router;