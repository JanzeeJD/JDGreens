import { Router } from 'express';
import { DeleteCoupon, GetAddCouponPage, GetEditCouponPage, PostAddCoupon, PostEditCoupon, GetCouponPage } from '../../controllers/admin/adminCouponController.js';

import { isAdmin } from '../../middlewares/adminAuthMiddleware.js';

const router = Router();

router.use(isAdmin);

router.get("/", GetCouponPage)
router.get('/add-coupon', GetAddCouponPage);
router.post('/add-coupon', PostAddCoupon);

router.get('/edit-coupon/:id', GetEditCouponPage);
router.post('/edit-coupon/:id', PostEditCoupon);

router.delete('/:id', DeleteCoupon);

export default router;