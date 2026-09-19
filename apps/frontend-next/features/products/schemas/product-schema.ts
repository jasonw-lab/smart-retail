import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationTranslation = ReturnType<typeof useTranslations<'validation'>>;

export const createProductFormSchema = (t: ValidationTranslation) =>
  z.object({
    productCode: z.string().min(1, t('required')),
    productName: z.string().min(1, t('required')).max(100, t('maxLength', { max: 100 })),
    categoryId: z.number().min(1, t('required')),
    unitPrice: z.number().min(0, t('minValue', { min: 0 })),
    description: z.string().max(500, t('maxLength', { max: 500 })).optional(),
    imageUrl: z.string().url(t('invalidUrl')).optional().or(z.literal('')),
    status: z.number().min(0).max(1),
  });

export type ProductFormValues = z.infer<ReturnType<typeof createProductFormSchema>>;

// 後方互換用
export const productFormSchema = createProductFormSchema(((key: string, params?: Record<string, unknown>) => {
  if (key === 'maxLength' && params?.max) return `Must be at most ${params.max} characters`;
  if (key === 'minValue' && params?.min !== undefined) return `Must be at least ${params.min}`;
  if (key === 'invalidUrl') return 'Invalid URL';
  return 'Required';
}) as unknown as ValidationTranslation);

