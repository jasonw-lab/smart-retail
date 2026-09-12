import { z } from 'zod';

export const dictFormSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  dictCode: z.string().min(1, 'コードは必須です'),
  status: z.number(),
  remark: z.string().optional(),
});

export type DictFormValues = z.infer<typeof dictFormSchema>;
