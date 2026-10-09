import { z } from 'zod';

const itemSchema = z.object({
  description: z.string().trim().min(1, 'Item description is required').max(300),
  quantity: z.number().min(0.001, 'Quantity must be greater than 0'),
  unit: z.string().trim().min(1).max(20),
  rate: z.number().min(0).optional(),
});

export const createPRSchema = z.object({
  project: z.string().trim().optional().or(z.literal('')),
  vendor: z.string().trim().optional().or(z.literal('')),
  requiredBy: z.string().optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  items: z.array(itemSchema).default([]),
});

export const updatePRSchema = createPRSchema.partial();
