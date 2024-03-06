import { Router } from 'express';
import { isAdmin } from '../../middlewares/adminAuthMiddleware.js';
import { GenerateSalesReport, GetSalesReportPage } from '../../controllers/admin/adminSalesController.js';

const router = Router();
router.use(isAdmin);

router.get("/", GetSalesReportPage);
router.post("/:format", GenerateSalesReport);

export default router;