import { Router } from 'express';
import { GetHomePage, 
  GetGalleryPage, 
  GetAboutPage, 
  GetSignupPage, 
  GetLoginPage,
  GetContactPage,
  PostLogin ,
  PostSignup,
  GetOTPPage,
  PostOTPPage,
  GetLogout,
  PostResendOTP,
  PostForgotPassword,
  GetChangePasswordPage,
  PostChangePassword,
  // GetForgotPasswordOTPPage
} from '../../controllers/user/homeController.js';
import { alreadyLoggedIn } from '../../middlewares/authMiddleware.js';
 
const router = Router();

router.get('/', GetHomePage);

router.get('/login', alreadyLoggedIn, GetLoginPage);
router.post('/login', PostLogin);
router.post("/forgot-password", PostForgotPassword);
router.get('/change-password/:token', GetChangePasswordPage);
router.post('/change-password/:token', PostChangePassword);

router.get('/signup', alreadyLoggedIn, GetSignupPage);
router.post('/signup', PostSignup);


router.get('/signup-otp', alreadyLoggedIn, GetOTPPage);
router.post('/signup-otp', PostOTPPage);
router.post('/resend-otp', PostResendOTP);

router.get('/logout', GetLogout);

router.get('/about', GetAboutPage);
router.get('/gallery', GetGalleryPage);
router.get('/contact-us', GetContactPage);

export default router;