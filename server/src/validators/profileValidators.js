import { z } from 'zod';

const phoneRegex = /^[+()\-\s\d]{7,20}$/;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().regex(phoneRegex, 'Valid phone required').optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  current: z.string().min(1, 'Current password is required'),
  next: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});
