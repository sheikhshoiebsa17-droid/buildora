import { z } from 'zod';

export const createMoneySchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.enum(['client_payment', 'vendor_bill', 'salary', 'logistics', 'tools', 'marketing', 'misc']),
  amount: z.number().min(0.01, 'Amount must be greater than zero'),
  date: z.string().optional().or(z.literal('')),
  project: z.string().trim().optional().or(z.literal('')),
  description: z.string().trim().max(500).optional().or(z.literal('')),
});
