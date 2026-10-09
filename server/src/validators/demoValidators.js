import { z } from 'zod';

const phoneRegex = /^[+()\-\s\d]{7,20}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createDemoRequestSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(120),
  email: z.string().trim().email('A valid work email is required'),
  company: z.string().trim().min(2, 'Company name is required').max(140),
  phone: z.string().trim().regex(phoneRegex, 'A valid phone number is required'),
  businessType: z.string().trim().max(120).optional().or(z.literal('')),
  companySize: z.string().trim().max(60).optional().or(z.literal('')),
  preferredDate: z.string().trim().optional().or(z.literal('')).refine((v) => !v || dateRegex.test(v), {
    message: 'Preferred date must be a valid date',
  }),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
});
