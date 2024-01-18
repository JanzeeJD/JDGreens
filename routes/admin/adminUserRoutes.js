import { Router } from 'express';
import {
  GetUserPage,
  SetBlockStatus,
} from '../../controllers/admin/adminUserController.js';
import { isAdmin } from '../../middlewares/adminAuthMiddleware.js';

const router = Router();
router.use(isAdmin);

router.get('/', GetUserPage);
router.put('/:userId/block', SetBlockStatus);


export default router;