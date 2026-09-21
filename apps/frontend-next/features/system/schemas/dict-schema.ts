import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationTranslation = ReturnType<typeof useTranslations<'validation'>>;

export const createDictFormSchema = (t: ValidationTranslation) =>
  z.object({
    name: z.string().min(1, t('required')),
    dictCode: z.string().min(1, t('required')),
    status: z.number(),
    remark: z.string().optional(),
  });

export type DictFormValues = z.infer<ReturnType<typeof createDictFormSchema>>;

export const dictFormSchema = createDictFormSchema(
  ((key: string) => (key === 'required' ? '必須です' : 'エラー')) as unknown as ValidationTranslation
);

