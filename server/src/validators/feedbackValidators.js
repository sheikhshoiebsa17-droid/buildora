import { z } from 'zod';

export const createFeedbackSchema = z.object({
  customer: z.string().trim().optional().or(z.literal('')),
  project: z.string().trim().optional().or(z.literal('')),
  rating: z.number().int().min(1, 'Rating must be 1–5').max(5, 'Rating must be 1–5'),
  title: z.string().trim().min(2, 'Title is required').max(140),
  message: z.string().trim().max(1000).optional().or(z.literal('')),
  reviewer: z.string().trim().max(120).optional().or(z.literal('')),
});
