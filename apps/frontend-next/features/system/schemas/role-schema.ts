import { z } from 'zod';

export const roleFormSchema = z.object({
  name: z.string().min(1, '役割名は必須です'),
  code: z.string().min(1, 'コードは必須です'),
  dataScope: z.number(),
  status: z.number(),
  sort: z.number().min(0),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
