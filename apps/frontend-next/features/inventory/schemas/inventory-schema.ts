import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationTranslation = ReturnType<typeof useTranslations<'validation'>>;

export const createInventoryFormSchema = (t: ValidationTranslation) =>
  z.object({
    storeId: z
      .number({ invalid_type_error: t('selectStore') })
      .min(1, t('selectStore')),
    productId: z
      .number({ invalid_type_error: t('selectProduct') })
      .min(1, t('selectProduct')),
    lotNumber: z
      .string()
      .min(1, t('required'))
      .max(50, t('maxLength', { max: 50 })),
    quantity: z
      .number({ invalid_type_error: t('number') })
      .int()
      .min(1, t('minValue', { min: 1 })),
    expiryDate: z.string().optional().or(z.literal('')),
    location: z.string().max(100, t('maxLength', { max: 100 })).optional().or(z.literal('')),
    remarks: z.string().max(500, t('maxLength', { max: 500 })).optional().or(z.literal('')),
  });

export type InventoryFormValues = z.infer<ReturnType<typeof createInventoryFormSchema>>;

// 後方互換用
export const inventoryFormSchema = createInventoryFormSchema(((
  key: string,
  params?: Record<string, unknown>
) => {
  if (key === 'maxLength' && params?.max) return `Must be at most ${params.max} characters`;
  if (key === 'minValue' && params?.min) return `Must be at least ${params.min}`;
  if (key === 'selectStore') return 'Please select a store';
  if (key === 'selectProduct') return 'Please select a product';
  if (key === 'number') return 'Please enter a number';
  return 'Required';
}) as unknown as ValidationTranslation);
