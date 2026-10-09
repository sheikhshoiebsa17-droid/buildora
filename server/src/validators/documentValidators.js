import { z } from 'zod';

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1, 'Document title is required').max(200),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  category: z.enum(['legal', 'design', 'invoice', 'site_photo', 'contract', 'other']).optional(),
  project: z.string().trim().optional().or(z.literal('')),
  customer: z.string().trim().optional().or(z.literal('')),
  visibility: z.enum(['staff', 'customer']).optional(),
  tags: z.string().optional().or(z.literal('')),
  url: z.string().trim().max(500).optional().or(z.literal('')),
});

export const updateDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  category: z.enum(['legal', 'design', 'invoice', 'site_photo', 'contract', 'other']).optional(),
  visibility: z.enum(['staff', 'customer']).optional(),
});
