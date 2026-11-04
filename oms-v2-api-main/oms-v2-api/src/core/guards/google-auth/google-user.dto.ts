import { z } from 'zod';

export const GoogleUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
});

export type GoogleUserDto = z.infer<typeof GoogleUserSchema>;
