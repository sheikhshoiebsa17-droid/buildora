import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/;

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name is required').max(140),
  code: z.string().trim().max(40).optional().or(z.literal('')),
  type: z.enum(['interior', 'construction', 'renovation', 'other']).optional(),
  customer: z.string().trim().optional().or(z.literal('')),
  manager: z.string().trim().optional().or(z.literal('')),
  siteAddress: z.string().trim().max(300).optional().or(z.literal('')),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  status: z.enum(['planning', 'design', 'in_progress', 'on_hold', 'completed', 'cancelled']).optional(),
  startDate: z.string().regex(dateRegex, 'Start date must be YYYY-MM-DD').optional().or(z.literal('')),
  targetDate: z.string().regex(dateRegex, 'Target date must be YYYY-MM-DD').optional().or(z.literal('')),
  budget: z.object({ allocated: z.number().min(0).optional() }).optional(),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createTaskSchema = z.object({
  title: z.string().trim().min(2, 'Task title is required').max(200),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignee: z.string().trim().optional().or(z.literal('')),
  dueDate: z.string().regex(dateRegex, 'Due date must be YYYY-MM-DD').optional().or(z.literal('')),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  progress: z.number().min(0).max(100).optional(),
});
