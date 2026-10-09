import { z } from 'zod';

export const createItemSchema = z.object({
  sku: z.string().trim().min(1, 'SKU is required').max(40).toUpperCase(),
  name: z.string().trim().min(2, 'Item name is required').max(160),
  category: z.string().trim().max(80).optional().or(z.literal('')),
  unit: z.string().trim().max(20).optional().or(z.literal('')),
  quantity: z.number().min(0).optional(),
  reorderLevel: z.number().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  warehouseLocation: z.string().trim().max(120).optional().or(z.literal('')),
});

export const updateItemSchema = createItemSchema.partial();

export const movementSchema = z.object({
  type: z.enum(['in', 'out']),
  quantity: z.number().min(0.001, 'Quantity must be greater than 0'),
  reason: z.string().trim().max(500).optional().or(z.literal('')),
});
