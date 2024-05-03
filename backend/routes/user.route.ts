import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import { checkReport } from '../middlewares/checkReports';
import { updateAddress, updateProfile, userProfile } from '../controllers/user.controller';
import { newReport } from '../controllers/report.controller';

const router = Router();

router.post('/report/:id', [protectRoute, checkReport], newReport);

router.get('/', [protectRoute, checkReport], userProfile);

router.put('/profile/:id', [protectRoute, checkReport], updateProfile);

router.put('/address/:id', [protectRoute, checkReport], updateAddress);


export default router;