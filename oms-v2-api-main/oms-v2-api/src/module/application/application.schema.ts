import { z } from 'zod';

export const createApplicationSchema = z.object({
  name: z.string().min(1),
  type_id: z.number().int().positive(),
  size_id: z.number().int().positive(),
});

export const updateApplicationSchema = createApplicationSchema.partial();
