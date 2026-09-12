import { z } from 'zod';

export const deptFormSchema = z.object({
  id: z.number().optional(),
  parentId: z.number(),
  name: z.string().min(1, '部門名は必須です'),
  code: z.string().min(1, 'コードは必須です'),
  sort: z.number().min(0),
  status: z.number(),
});

export type DeptFormValues = z.infer<typeof deptFormSchema>;
