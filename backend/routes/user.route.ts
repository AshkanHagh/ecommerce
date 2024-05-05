import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import { checkReport } from '../middlewares/checkReports';
import { updateAddress, updateProfile, userProfile } from '../controllers/user/user.controller';
import { newReport } from '../controllers/shop/report.controller';
import errorHandler from '../middlewares/errorHandler';

const router = Router();

router.post('/report/:id', protectRoute, newReport);

router.get('/', [protectRoute, checkReport], userProfile);

router.put('/profile/:id', [protectRoute, checkReport], updateProfile);

router.put('/address/:id', [protectRoute, checkReport], updateAddress);


export default router;