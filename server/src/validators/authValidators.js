import { z } from 'zod';

const phoneRegex = /^[+()\-\s\d]{7,20}$/;

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('A valid email address is required').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72)
    .regex(/[a-zA-Z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  phone: z.string().trim().regex(phoneRegex, 'Valid phone number required').optional().or(z.literal('')),
  organization: z
    .object({
      id: z.string().optional(),
      name: z.string().trim().min(2).max(120).optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('A valid email address is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});
