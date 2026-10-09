import { Router } from 'express';
import * as vendorBillController from '../controllers/vendorBillController.js';
import { validate } from '../middleware/validate.js';
import { createVendorBillSchema, updateVendorBillSchema } from '../validators/vendorBillValidators.js';
import { requireRoleOrPermission } from '../middleware/context.js';

const router = Router({ mergeParams: true });

const financeTeam = requireRoleOrPermission(['super_admin', 'admin', 'finance_manager']);

router.get('/', financeTeam, vendorBillController.list);
router.post('/', financeTeam, validate(createVendorBillSchema), vendorBillController.create);
router.get('/:id', financeTeam, vendorBillController.getOne);
router.patch('/:id', financeTeam, validate(updateVendorBillSchema), vendorBillController.update);

export default router;
