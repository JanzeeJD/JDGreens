import { Router } from 'express';
import { isAdmin } from '../../middlewares/adminAuthMiddleware.js';
import {DeleteOffer, GetAddOfferPage, GetEditOfferPage, GetOfferPage, PostAddOffer, PostEditOffer} from '../../controllers/admin/adminOfferController.js';

const router = Router();

router.use(isAdmin);

router.get("/", GetOfferPage)
router.get('/add-offer', GetAddOfferPage);
router.post('/add-offer', PostAddOffer);

router.get('/edit-offer/:offerId', GetEditOfferPage);
router.post('/edit-offer/:offerId', PostEditOffer);

router.delete('/:offerId', DeleteOffer);

export default router;