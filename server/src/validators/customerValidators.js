import { z } from 'zod';

const phoneRegex = /^[+()\-\s\d]{7,20}$/;

const base = {
  name: z.string().trim().min(2, 'Customer name is required').max(120),
  email: z.string().trim().email('Valid email required').optional().or(z.literal('')),
  phone: z.string().trim().regex(phoneRegex, 'Valid phone number required'),
  address: z.string().trim().max(300).optional().or(z.literal('')),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
};

export const createCustomerSchema = z.object(base);

export const updateCustomerSchema = z.object(base).partial();
