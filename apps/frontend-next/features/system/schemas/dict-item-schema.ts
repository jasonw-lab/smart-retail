import { z } from 'zod';

export const dictItemFormSchema = z.object({
  label: z.string().min(1, 'ラベルは必須です'),
  value: z.string().min(1, '値は必須です'),
  sort: z.number().int().min(0, '表示順は0以上の整数です'),
  status: z.number(),
  remark: z.string().optional(),
});

export type DictItemFormValues = z.infer<typeof dictItemFormSchema>;
