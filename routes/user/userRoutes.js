import {Router} from 'express';
import { GetCartPage, GetShopPage } from '../../controllers/user/userController.js';

const router = Router();

// todo: need a route to render my-account.ejs, / route
router.get('/cart', GetCartPage);

export default router;

