import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import { confirmPermission } from '../middlewares/permission';
import { checkReport } from '../middlewares/checkReports';
import { uploadFile } from '../middlewares/upload';
import { products, newProduct, searchProduct, singleProduct, editProduct } from '../controllers/product.controller';
import { addToCart, getCart, newOrder, orderDetail, removeCart, updateOrder } from '../controllers/cart.controller';
import { addToWishList, getWishList, removeWishList } from '../controllers/wishList.controller';

const router = Router();

// cart route
router.post('/cart', [protectRoute, checkReport], addToCart);

router.delete('/cart', [protectRoute, checkReport], removeCart);

router.get('/cart', [protectRoute, checkReport], getCart);


// wishList route
router.post('/wishList', [protectRoute, checkReport], addToWishList);

router.delete('/wishList', [protectRoute, checkReport], removeWishList);

router.get('/wishList', [protectRoute, checkReport], getWishList);


// order route
router.post('/order', [protectRoute, checkReport], newOrder);

router.get('/order/:id', [protectRoute, checkReport], orderDetail);

router.put('/order/status/:id', [protectRoute, confirmPermission, checkReport], updateOrder);


// product route
router.post('/new', [protectRoute, confirmPermission, checkReport], newProduct);

router.get('/search/:query', searchProduct);

router.get('/', products);

router.get('/:id', singleProduct);

router.put('/update/:id', [protectRoute, confirmPermission, checkReport], editProduct);



export default router;