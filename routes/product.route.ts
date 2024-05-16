import { Router } from 'express';
import { checkReport } from '../middlewares/reportChecker';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { createProduct, editProductInfo, products, searchProduct, singleProduct } from '../controllers/shop/product.controller';
import { addToWishList, removeWishList, wishList } from '../controllers/shop/wishList.controller';

const router = Router();

// WishList
router.post('/wishList/:id', isAuthenticated, addToWishList);

router.get('/wishList', isAuthenticated, wishList);

router.delete('/wishList/:id', isAuthenticated, removeWishList);

// Product
router.post('/', [isAuthenticated, authorizeRoles('seller' && 'admin')], createProduct);

router.get('/', products);

router.get('/search/:query', searchProduct);

router.get('/:id', singleProduct);

router.patch('/:id', [isAuthenticated, authorizeRoles('seller' && 'admin')], editProductInfo);

export default router;