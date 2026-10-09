import { z } from 'zod';

export const createVendorSchema = z.object({
  name: z.string().trim().min(2, 'Vendor name is required').max(140),
  contactPerson: z.string().trim().max(120).optional().or(z.literal('')),
  email: z.string().trim().email('Valid email required').optional().or(z.literal('')),
  phone: z.string().trim().regex(/^[+()\-\s\d]{7,20}$/, 'Valid phone required').optional().or(z.literal('')),
  address: z.string().trim().max(300).optional().or(z.literal('')),
  gstin: z.string().trim().toUpperCase().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}$|^$/, 'Valid GSTIN required or blank').optional().or(z.literal('')),
  rating: z.number().min(0).max(5).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  categories: z.array(z.string().trim()).optional(),
  specialties: z.array(z.string().trim()).optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const updateVendorSchema = createVendorSchema.partial();
