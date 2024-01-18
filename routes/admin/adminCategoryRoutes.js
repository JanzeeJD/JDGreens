import { Router } from 'express';
import {
  GetAddCategoryPage,
  PostAddCategory,
  GetEditCategoryPage,
  PostEditCategory,
  DeleteCategory
} from '../../controllers/admin/adminCategoryController.js';
import { isAdmin } from '../../middlewares/adminAuthMiddleware.js';

const router = Router();

router.use(isAdmin);

router.get('/add-category', GetAddCategoryPage);
router.post('/add-category', PostAddCategory);

router.get('/edit-category/:id', GetEditCategoryPage);
router.post('/edit-category/:id', PostEditCategory);

router.delete('/:id', DeleteCategory);

export default router;