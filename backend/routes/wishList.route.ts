import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import { addToWishList, getWishList, removeWishList } from '../controllers/wishList.controller';

const router = Router();

router.post('/wishList', protectRoute, addToWishList);

router.delete('/wishList', protectRoute, removeWishList);

router.get('/wishList', protectRoute, getWishList);


export default router;