import { Router } from 'express';
import * as invoiceController from '../controllers/invoiceController.js';
import { validate } from '../middleware/validate.js';
import { createInvoiceSchema, updateInvoiceSchema, recordPaymentSchema } from '../validators/invoiceValidators.js';
import { requireRoleOrPermission } from '../middleware/context.js';

const router = Router({ mergeParams: true });

const staff = requireRoleOrPermission([
  'super_admin', 'admin', 'finance_manager', 'project_manager', 'sales_manager',
]);
const financeTeam = requireRoleOrPermission(['super_admin', 'admin', 'finance_manager']);

router.get('/', staff, invoiceController.list);
router.post('/', financeTeam, validate(createInvoiceSchema), invoiceController.create);
router.get('/:id', staff, invoiceController.getOne);
router.patch('/:id', financeTeam, validate(updateInvoiceSchema), invoiceController.update);
router.post('/:id/payments', financeTeam, validate(recordPaymentSchema), invoiceController.recordPayment);
router.post('/:id/cancel', financeTeam, invoiceController.cancel);

export default router;
