import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationTranslation = ReturnType<typeof useTranslations<'validation'>>;

export const createRoleFormSchema = (t: ValidationTranslation) =>
  z.object({
    name: z.string().min(1, t('required')),
    code: z.string().min(1, t('required')),
    dataScope: z.number(),
    status: z.number(),
    sort: z.number().min(0),
  });

export type RoleFormValues = z.infer<ReturnType<typeof createRoleFormSchema>>;

export const roleFormSchema = createRoleFormSchema(
  ((key: string) => (key === 'required' ? '必須です' : 'エラー')) as unknown as ValidationTranslation
);

