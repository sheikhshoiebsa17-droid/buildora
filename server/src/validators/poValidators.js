import { z } from 'zod';

const itemSchema = z.object({
  description: z.string().trim().min(1, 'Item description is required').max(300),
  quantity: z.number().min(0.001, 'Quantity must be greater than 0'),
  unit: z.string().trim().min(1).max(20).optional(),
  rate: z.number().min(0, 'Rate must be ≥ 0'),
  discountPercent: z.number().min(0).max(100).optional(),
  gstPercent: z.number().min(0).max(28).optional(),
});

export const createPOSchema = z.object({
  project: z.string().trim().optional().or(z.literal('')),
  vendor: z.string().trim().min(1, 'Vendor is required'),
  request: z.string().trim().optional().or(z.literal('')),
  items: z.array(itemSchema).default([]),
  expectedDate: z.string().optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const updatePOSchema = createPOSchema.partial();
