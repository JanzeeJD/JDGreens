import {Router} from 'express';
import { GetShopPage, GetProductPage } from '../../controllers/user/shopController.js';

const router = Router();

router.get('/shop',GetShopPage)
router.get('/shop/:id',GetProductPage)

export default router;


