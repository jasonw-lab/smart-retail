import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationTranslation = ReturnType<typeof useTranslations<'validation'>>;

export const createDictItemFormSchema = (t: ValidationTranslation) =>
  z.object({
    label: z.string().min(1, t('required')),
    value: z.string().min(1, t('required')),
    sort: z.number().int().min(0, t('minValue', { min: 0 })),
    status: z.number(),
    remark: z.string().optional(),
  });

export type DictItemFormValues = z.infer<ReturnType<typeof createDictItemFormSchema>>;

export const dictItemFormSchema = createDictItemFormSchema(
  ((key: string, params?: Record<string, unknown>) => {
    if (key === 'minValue' && params?.min !== undefined) return '0以上で入力してください';
    return '必須です';
  }) as unknown as ValidationTranslation
);

