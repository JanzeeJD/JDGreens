import { Router } from 'express';
import {
  GetAdminLogin,
  GetAdminLogout,
  PostAdminLogin,
  GetAdminDashboard,
  GetCategoryPage
} from '../../controllers/admin/adminAuthController.js';
import { isAdmin } from '../../middlewares/adminAuthMiddleware.js';

const router = Router();

router.get('/login', (req, res) => { res.redirect('/admin/') });

router.get('/', GetAdminLogin);
router.post('/', PostAdminLogin);

router.get('/logout', GetAdminLogout);
router.post('/users', isAdmin, PostAdminLogin);
router.get('/dashboard', isAdmin, GetAdminDashboard);

router.get('/category', isAdmin, GetCategoryPage);


export default router;