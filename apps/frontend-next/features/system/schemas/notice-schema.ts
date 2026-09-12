import { z } from 'zod';

export const noticeFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  content: z.string().optional(),
  type: z.union([z.literal(1), z.literal(2)]),
  level: z.union([z.literal('L'), z.literal('M'), z.literal('H')]),
  targetType: z.union([z.literal(0), z.literal(1)]),
  targetUserIds: z.string().optional(),
  priority: z.number().optional(),
});

export type NoticeFormValues = z.infer<typeof noticeFormSchema>;
