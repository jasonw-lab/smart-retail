import { z } from 'zod';
import type { useTranslations } from 'next-intl';
import { StoreStatus } from '../types/store';

type ValidationTranslation = ReturnType<typeof useTranslations<'validation'>>;

export const createStoreFormSchema = (t: ValidationTranslation) =>
  z.object({
    storeCode: z
      .string()
      .min(1, t('required'))
      .max(20, t('maxLength', { max: 20 }))
      .regex(/^[A-Za-z0-9-]+$/, t('alphanumericHyphen')),
    storeName: z
      .string()
      .min(1, t('required'))
      .max(100, t('maxLength', { max: 100 })),
    address: z
      .string()
      .max(200, t('maxLength', { max: 200 }))
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .max(20, t('maxLength', { max: 20 }))
      .optional()
      .or(z.literal('')),
    email: z.string().email(t('email')).optional().or(z.literal('')),
    status: z.enum([StoreStatus.ACTIVE, StoreStatus.MAINTENANCE, StoreStatus.INACTIVE]),
  });

export type StoreFormValues = z.infer<ReturnType<typeof createStoreFormSchema>>;

// 後方互換用
export const storeFormSchema = createStoreFormSchema(((
  key: string,
  params?: Record<string, unknown>
) => {
  if (key === 'maxLength' && params?.max) return `Must be at most ${params.max} characters`;
  if (key === 'email') return 'Please enter a valid email address';
  if (key === 'alphanumericHyphen') return 'Only alphanumeric characters and hyphens are allowed';
  return 'Required';
}) as unknown as ValidationTranslation);
