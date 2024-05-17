import { Router } from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { createProduct, editProductInfo, products, searchProduct, singleProduct } from '../controllers/shop/product.controller';
import { addToWishList, removeWishList, wishList } from '../controllers/shop/wishList.controller';
import { addToCart, cart, removeCart } from '../controllers/shop/cart.controller';
import { getPayment, orderDetail, updateOrderStatus, verifyPayment } from '../controllers/shop/order.controller';
import { createComment, deleteComment, editCommentText, likeComment, replay } from '../controllers/shop/comment.controller';
import { comments } from '../controllers/shop/comment.controller';

const router = Router();

// WishList
router.post('/wishList/:id', isAuthenticated, addToWishList);

router.get('/wishList', isAuthenticated, wishList);

router.delete('/wishList/:id', isAuthenticated, removeWishList);

// Cart
router.post('/cart/:id', isAuthenticated, addToCart);

router.get('/cart', isAuthenticated, cart);

router.patch('/cart/:id', isAuthenticated, removeCart);

// payment || orders
router.get('/order/payment', isAuthenticated, getPayment);

router.post('/order/payment/verify', isAuthenticated, verifyPayment);

router.get('/order/payment/detail/:id', isAuthenticated, orderDetail);

router.patch('/order/status/:id', [isAuthenticated, authorizeRoles('admin' || 'seller')], updateOrderStatus);

// comments
router.post('/comment/:id', isAuthenticated, createComment);

router.get('/comment/:id', comments);

router.patch('/comment/replay/:id', isAuthenticated, replay);

router.patch('/comment/like/:id', isAuthenticated, likeComment);

router.patch('/comment/:id', isAuthenticated, editCommentText);

router.delete('/comment/:id', isAuthenticated, deleteComment);

// Product
router.post('/', [isAuthenticated, authorizeRoles('seller' || 'admin')], createProduct);

router.get('/', products);

router.get('/search/:query', searchProduct);

router.get('/:id', singleProduct);

router.patch('/:id', [isAuthenticated, authorizeRoles('seller' || 'admin')], editProductInfo);

export default router;