import { Router } from 'express';
import { addResponseHelpers, requireAuth, optionalAuth } from '../middleware/context.js';
import authRoutes from './auth.routes.js';
import leadRoutes from './lead.routes.js';
import customerRoutes from './customer.routes.js';
import projectRoutes from './project.routes.js';
import estimateRoutes from './estimate.routes.js';
import designRoutes from './design.routes.js';
import taskRoutes from './task.routes.js';
import vendorRoutes from './vendor.routes.js';
import prRoutes from './purchaseRequest.routes.js';
import poRoutes from './purchaseOrder.routes.js';
import inventoryRoutes from './inventory.routes.js';
import invoiceRoutes from './invoice.routes.js';
import vendorBillRoutes from './vendorBill.routes.js';
import moneyRoutes from './money.routes.js';
import documentRoutes from './document.routes.js';
import notificationRoutes from './notification.routes.js';
import feedbackRoutes from './feedback.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import analyticsRoutes from './analytics.routes.js';
import copilotRoutes from './copilot.routes.js';
import demoRoutes from './demo.routes.js';
import financeRoutes from './finance.routes.js';
import profileRoutes from './profile.routes.js';

export function mountRoutes(router) {
  router.use(addResponseHelpers);

  router.use('/demo-requests', demoRoutes);
  router.use('/copilot', copilotRoutes);

  router.use('/auth', authRoutes);

  // Everything below requires a signed-in user
  const api = Router({ mergeParams: true });
  api.use(requireAuth);
  api.use('/profile', profileRoutes);
  api.use('/leads', leadRoutes);
  api.use('/customers', customerRoutes);
  api.use('/projects', projectRoutes);
  api.use('/estimates', estimateRoutes);
  api.use('/designs', designRoutes);
  api.use('/tasks', taskRoutes);
  api.use('/vendors', vendorRoutes);
  api.use('/purchase-requests', prRoutes);
  api.use('/purchase-orders', poRoutes);
  api.use('/inventory', inventoryRoutes);
  api.use('/invoices', invoiceRoutes);
  api.use('/vendor-bills', vendorBillRoutes);
  api.use('/money', moneyRoutes);
  api.use('/finance', financeRoutes);
  api.use('/documents', documentRoutes);
  api.use('/notifications', notificationRoutes);
  api.use('/feedback', feedbackRoutes);
  api.use('/dashboard', dashboardRoutes);
  api.use('/analytics', analyticsRoutes);

  router.use(api);
}
