import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import { confirmPermission } from '../middlewares/permission';
import { checkReport } from '../middlewares/checkReports';
import { uploadFile } from '../middlewares/upload';
import { products, newProduct, searchProduct, singleProduct, editProduct } from '../controllers/shop/product.controller';
import { addToCart, getCart, removeCart } from '../controllers/shop/cart.controller';
import { addToWishList, getWishList, removeWishList } from '../controllers/shop/wishList.controller';
import { getPayment, orderDetail, updateOrder, verifyPayment } from '../controllers/shop/order.controller';
import { deleteComment, editComment, getProductComments, likeComment, newComment, replay } from '../controllers/shop/comment.controller';

const router = Router();

// cart route
router.post('/cart', [protectRoute, checkReport], addToCart);

router.delete('/cart', protectRoute, removeCart);

router.get('/cart', [protectRoute, checkReport], getCart);


// wishList route
router.post('/wishList', [protectRoute, checkReport], addToWishList);

router.delete('/wishList', protectRoute, removeWishList);

router.get('/wishList', [protectRoute, checkReport], getWishList);


// order route
router.get('/payment', [protectRoute, checkReport], getPayment);

router.post('/payment/verify', [protectRoute, checkReport], verifyPayment);

router.get('/order/:id', protectRoute, orderDetail);

router.put('/order/status/:id', [protectRoute, confirmPermission], updateOrder);


// product route
router.post('/new', [protectRoute, confirmPermission, checkReport], newProduct);

router.get('/search/:query', searchProduct);

router.get('/', products);

router.get('/:id', singleProduct);

router.put('/update/:id', [protectRoute, confirmPermission, checkReport], editProduct);


// Comment Route
router.post('/comment/new/:id', [protectRoute, checkReport], newComment);

router.put('/comment/replay/:id', [protectRoute, checkReport], replay);

router.put('/comment/edit/:id', protectRoute, editComment);

router.delete('/comment/del/:id', protectRoute, deleteComment);

router.put('/comment/like/:id', [protectRoute, checkReport], likeComment);

router.get('/comment/:id', protectRoute, getProductComments);



export default router;