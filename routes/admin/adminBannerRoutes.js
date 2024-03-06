import { Router } from 'express';
import { GetBannerPage, PostAddBanner, GetAddBannerPage, DeleteBanner } from '../../controllers/admin/adminBannerController.js';
import { getBannerImage } from '../../utils/setupMulter.js';
import { isAdmin } from '../../middlewares/adminAuthMiddleware.js';

const router = Router();
router.use(isAdmin);

router.get('/', GetBannerPage);
router.get('/add-banner', GetAddBannerPage);
router.post('/add-banner', getBannerImage.single('bannerImage'), (err, req, res, next) => {
    req.imageError = true;
    next();
}, PostAddBanner);
router.delete('/:id', DeleteBanner);

export default router;