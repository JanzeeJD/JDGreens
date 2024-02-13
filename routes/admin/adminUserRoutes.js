import { Router } from 'express';
import {
  GetAdminOrdersPage,
  GetAdminOrderDetailPage,
  GetUserPage,
  SetBlockStatus,
  PatchAdminOrderDetailPage,
} from '../../controllers/admin/adminUserController.js';
import { isAdmin } from '../../middlewares/adminAuthMiddleware.js';

const router = Router();
router.use(isAdmin);

router.get('/', GetUserPage);
router.put('/:userId/block', SetBlockStatus);

router.get('/orders', GetAdminOrdersPage);
router.get('/orders/:orderId', GetAdminOrderDetailPage);
router.patch('/orders/:orderId', PatchAdminOrderDetailPage);


export default router;