import { z } from 'zod';

export const createDesignSchema = z.object({
  projectId: z.string().trim().min(1, 'Project is required'),
  customer: z.string().trim().optional().or(z.literal('')),
  title: z.string().trim().min(2, 'Design title is required').max(160),
  room: z.string().trim().max(80).optional().or(z.literal('')),
  scope: z.string().trim().max(2000).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const updateDesignSchema = createDesignSchema.partial();

export const versionDesignSchema = z.object({
  label: z.string().trim().max(120).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  sendForApproval: z.boolean().optional(),
});

export const clientResponseSchema = z.object({
  decision: z.enum(['approved', 'changes_requested', 'rejected']),
  note: z.string().trim().max(2000).optional().or(z.literal('')),
  versionIndex: z.number().int().optional(),
});
