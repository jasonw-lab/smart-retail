import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationTranslation = ReturnType<typeof useTranslations<'validation'>>;

export const createNoticeFormSchema = (t: ValidationTranslation) =>
  z.object({
    title: z.string().min(1, t('required')),
    content: z.string().optional(),
    type: z.union([z.literal(1), z.literal(2)]),
    level: z.union([z.literal('L'), z.literal('M'), z.literal('H')]),
    targetType: z.union([z.literal(0), z.literal(1)]),
    targetUserIds: z.string().optional(),
    priority: z.number().optional(),
  });

export type NoticeFormValues = z.infer<ReturnType<typeof createNoticeFormSchema>>;

export const noticeFormSchema = createNoticeFormSchema(
  ((key: string) => (key === 'required' ? '必須です' : 'エラー')) as unknown as ValidationTranslation
);

