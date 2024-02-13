import { Router } from 'express';
import { AddToCart, AddToWishlist, DeleteProductFromCart, GetCartPage, GetWishlistPage, RemoveFromWishlist, UpdateProductQty } from '../../controllers/user/cartController.js';
import { isLoggedIn } from '../../middlewares/authMiddleware.js';

const router = Router();

router.get('/wishlist', isLoggedIn, GetWishlistPage);
router.post('/wishlist', isLoggedIn, AddToWishlist);
router.delete('/wishlist/:productId', isLoggedIn, RemoveFromWishlist);

router.get('/cart', isLoggedIn, GetCartPage);
router.post('/cart', isLoggedIn, AddToCart);
router.put('/cart/:productId', isLoggedIn, UpdateProductQty);
router.delete('/cart/:productId', isLoggedIn, DeleteProductFromCart);

export default router;