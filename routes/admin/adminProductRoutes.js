import { Router } from 'express';
import {
  GetProductListingPage,
  GetAddProductPage,
  PostAddProduct,
  SoftDeleteProduct,
  SetProductListing
} from '../../controllers/admin/adminProductController.js';
import { getProductImages } from '../../utils/setupMulter.js';
import { isAdmin } from '../../middlewares/adminAuthMiddleware.js';

const router = Router();
router.use(isAdmin);

router.get('/', GetProductListingPage);
router.delete('/:id', SoftDeleteProduct);
router.patch('/:id', SetProductListing);
router.get('/add-product', GetAddProductPage);
router.post('/add-product', getProductImages.array("productImages", 4), (err, req, res, next) => {
  req.imageError = true;
  next();
}, PostAddProduct);
// router.post('/add-product', upload.array('productImages', 4), PostAddProduct);




export default router;