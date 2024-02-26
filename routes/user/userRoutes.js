import {Router} from 'express';
import { isLoggedIn } from '../../middlewares/authMiddleware.js';
import {  GetShopPage, 
  GetCheckoutPage, 
  GetProfilePage,
  GetAccountPage,
  GetAddAddressPage,
  GetEditAddressPage,
  EditAddressPost,
  DeleteAddress,
  GetOrdersPage,
  GetOrderDetailPage,
  GetAddressPage,
  AddAddressPost,
  PlaceOrderFromCheckoutPost,
  PatchOrderDetailPage,
  PostChangePasswordLoggedIn,
  PlaceOrderForPayment,
  GetWalletPage,
  GenerateOrderInvoiceAsPDF
}from '../../controllers/user/userController.js';

const router = Router();



router.post('/payment', PlaceOrderForPayment)

router.get('/checkout',GetCheckoutPage)
router.post('/checkout', PlaceOrderFromCheckoutPost)
router.get('/my-account',GetAccountPage)
router.get('/profile',GetProfilePage)
router.post('/profile/change-password', isLoggedIn, PostChangePasswordLoggedIn);

router.get('/address',GetAddressPage);
router.delete('/address/:addressId', DeleteAddress);

router.get('/address/add',GetAddAddressPage)
router.post("/address", AddAddressPost);

router.get('/address/edit/:addressId',GetEditAddressPage)
router.post('/address/edit/:addressId',EditAddressPost)

router.get('/orders',GetOrdersPage)
router.get('/orders/:orderId',GetOrderDetailPage)
router.patch('/orders/:orderId',PatchOrderDetailPage)
router.get("/orders/:orderId/report", GenerateOrderInvoiceAsPDF);

router.get("/wallet", GetWalletPage);

export default router;

