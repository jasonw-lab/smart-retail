import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationTranslation = ReturnType<typeof useTranslations<'validation'>>;

export const createDeptFormSchema = (t: ValidationTranslation) =>
  z.object({
    id: z.number().optional(),
    parentId: z.number(),
    name: z.string().min(1, t('required')),
    code: z.string().min(1, t('required')),
    sort: z.number().min(0),
    status: z.number(),
  });

export type DeptFormValues = z.infer<ReturnType<typeof createDeptFormSchema>>;

export const deptFormSchema = createDeptFormSchema(
  ((key: string) => (key === 'required' ? '必須です' : 'エラー')) as unknown as ValidationTranslation
);

