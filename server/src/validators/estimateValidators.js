import { z } from 'zod';

const itemSchema = z.object({
  description: z.string().trim().min(1, 'Item description is required').max(300),
  unit: z.string().trim().min(1).max(20),
  quantity: z.number().min(0.001, 'Quantity must be greater than 0'),
  rate: z.number().min(0, 'Rate must be ≥ 0'),
  discountPercent: z.number().min(0).max(100).optional(),
  gstPercent: z.number().min(0).max(28).optional(),
});

export const createEstimateSchema = z.object({
  title: z.string().trim().min(2, 'Estimate title is required').max(160),
  project: z.string().trim().optional().or(z.literal('')),
  customer: z.string().trim().optional().or(z.literal('')),
  status: z.enum(['draft', 'internal_review', 'sent', 'client_approved', 'rejected', 'superseded']).optional(),
  validUntil: z.string().optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  items: z.array(itemSchema).default([]),
});

export const updateEstimateSchema = createEstimateSchema.partial();

export const versionEstimateSchema = z.object({
  items: z.array(itemSchema),
  notes: z.string().max(2000).optional().or(z.literal('')),
});
