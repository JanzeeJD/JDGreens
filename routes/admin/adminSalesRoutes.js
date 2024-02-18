import { Router } from 'express';
import { isAdmin } from '../../middlewares/adminAuthMiddleware.js';
import { GenerateSalesReportAsPDF } from '../../controllers/admin/adminSalesController.js';

const router = Router();

router.post("/:format", isAdmin, GenerateSalesReportAsPDF);

export default router;