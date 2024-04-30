import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import { updateAddress, updateProfile, userProfile } from '../controllers/user.controller';

const router = Router();

router.get('/', protectRoute, userProfile);

router.put('/profile/:id', protectRoute, updateProfile);

router.put('/address/:id', protectRoute, updateAddress);


export default router;