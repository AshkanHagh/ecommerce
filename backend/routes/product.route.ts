import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import confirmPermission from '../middlewares/permission';
import { products, newProduct, searchProduct, singleProduct, getProductWithCategory } from '../controllers/product.controller';
import { addToCart, getCart, removeCart } from '../controllers/cart.controller';
import { addToWishList, getWishList, removeWishList } from '../controllers/wishList.controller';

const router = Router();

// cart route
router.post('/cart', protectRoute, addToCart);

router.delete('/cart', protectRoute, removeCart);

router.get('/cart', protectRoute, getCart);


// wishList route
router.post('/wishList', protectRoute, addToWishList);

router.delete('/wishList', protectRoute, removeWishList);

router.get('/wishList', protectRoute, getWishList);


// product route
router.post('/new', [protectRoute, confirmPermission], newProduct);

router.get('/search/:query', searchProduct);

router.get('/', products);

router.get('/:id', singleProduct);

router.get('/category/:category', getProductWithCategory);



export default router;