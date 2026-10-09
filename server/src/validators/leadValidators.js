import { z } from 'zod';

const phoneRegex = /^[+()\-\s\d]{7,20}$/;

export const createLeadSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().trim().email('Valid email required').optional().or(z.literal('')),
  phone: z.string().trim().regex(phoneRegex, 'Valid phone number required').optional().or(z.literal('')),
  source: z.string().trim().max(100).optional(),
  interest: z.string().trim().max(200).optional(),
  city: z.string().trim().max(80).optional(),
  estimateValue: z.number().min(0).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.string().optional(),
  followUpDate: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  note: z.string().trim().max(2000).optional(),
});
