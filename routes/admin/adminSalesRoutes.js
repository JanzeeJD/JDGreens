import { Router } from 'express';
import { isAdmin } from '../../middlewares/adminAuthMiddleware.js';
import { GenerateSalesReportAsPDF, GetSalesReportPage } from '../../controllers/admin/adminSalesController.js';

const router = Router();
router.use(isAdmin);

router.get("/", GetSalesReportPage);
router.post("/:format", GenerateSalesReportAsPDF);

export default router;