import { z } from 'zod';
import { StoreStatus } from '../types/store';

export const storeFormSchema = z.object({
  storeCode: z
    .string()
    .min(1, '店舗コードを入力してください')
    .max(20, '店舗コードは20文字以内で入力してください')
    .regex(/^[A-Za-z0-9-]+$/, '英数字とハイフンのみ使用可能です'),
  storeName: z
    .string()
    .min(1, '店舗名を入力してください')
    .max(100, '店舗名は100文字以内で入力してください'),
  address: z
    .string()
    .max(200, '住所は200文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, '電話番号は20文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('有効なメールアドレスを入力してください')
    .optional()
    .or(z.literal('')),
  status: z.enum([StoreStatus.ACTIVE, StoreStatus.MAINTENANCE, StoreStatus.INACTIVE]),
});

export type StoreFormValues = z.infer<typeof storeFormSchema>;
