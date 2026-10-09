import { z } from 'zod';

const itemSchema = z.object({
  description: z.string().trim().min(1, 'Item description is required').max(300),
  quantity: z.number().min(0.001, 'Quantity must be greater than 0'),
  rate: z.number().min(0, 'Rate must be ≥ 0'),
  discountPercent: z.number().min(0).max(100).optional(),
  gstPercent: z.number().min(0).max(28).optional(),
});

export const createInvoiceSchema = z.object({
  project: z.string().trim().optional().or(z.literal('')),
  customer: z.string().trim().min(1, 'Customer is required'),
  milestone: z.string().trim().max(160).optional().or(z.literal('')),
  items: z.array(itemSchema).default([]),
  issueDate: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  status: z.enum(['draft', 'pending']).optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: z.enum(['draft', 'pending', 'partially_paid', 'paid', 'overdue', 'cancelled']).optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Payment amount must be greater than zero'),
  mode: z.enum(['cash', 'bank_transfer', 'upi', 'cheque', 'card']).optional(),
  reference: z.string().trim().max(120).optional().or(z.literal('')),
  paidOn: z.string().optional().or(z.literal('')),
});
