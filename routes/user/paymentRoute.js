import express from 'express';
import { Router } from 'express';
import { PostPaymentController} from '../../controllers/user/paymentController.js'
import { isLoggedIn } from '../../middlewares/authMiddleware.js';
const router = Router();

router.post('/create/orderId', isLoggedIn, PostPaymentController)

export default router;