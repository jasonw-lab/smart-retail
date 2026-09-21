import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationTranslation = ReturnType<typeof useTranslations<'validation'>>;

export const createConfigFormSchema = (t: ValidationTranslation) =>
  z.object({
    configName: z.string().min(1, t('required')),
    configKey: z.string().min(1, t('required')),
    configValue: z.string().min(1, t('required')),
    remark: z.string().optional(),
  });

export type ConfigFormValues = z.infer<ReturnType<typeof createConfigFormSchema>>;

export const configFormSchema = createConfigFormSchema(
  ((key: string) => (key === 'required' ? '必須です' : 'エラー')) as unknown as ValidationTranslation
);

