import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import { products, newProduct, searchProduct, singleProduct, getProductWithCategory } from '../controllers/product.controller';
import { addToCart, getCart, removeCart } from '../controllers/cart.controller';
import confirmPermission from '../middlewares/permission';

const router = Router();

router.post('/new', [protectRoute, confirmPermission], newProduct);

router.get('/search/:query', searchProduct);

router.get('/', products);

router.get('/:id', singleProduct);

router.get('/category/:category', getProductWithCategory)

// cart route
router.post('/cart', protectRoute, addToCart);

router.delete('/cart', protectRoute, removeCart);

router.get('/cart', protectRoute, getCart);


export default router;