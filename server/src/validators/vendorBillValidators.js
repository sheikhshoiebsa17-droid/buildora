import { z } from 'zod';

const itemSchema = z.object({
  description: z.string().trim().min(1).max(300),
  quantity: z.number().min(0.001),
  rate: z.number().min(0),
  gstPercent: z.number().min(0).max(28).optional(),
});

export const createVendorBillSchema = z.object({
  billNumber: z.string().trim().max(60).optional().or(z.literal('')),
  vendor: z.string().trim().min(1, 'Vendor is required'),
  purchaseOrder: z.string().trim().optional().or(z.literal('')),
  items: z.array(itemSchema).default([]),
  issueDate: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
  status: z.enum(['draft', 'pending', 'partially_paid', 'paid', 'cancelled']).optional(),
});

export const updateVendorBillSchema = createVendorBillSchema.partial();
