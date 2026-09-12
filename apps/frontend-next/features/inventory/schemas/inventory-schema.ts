import { z } from 'zod';

export const inventoryFormSchema = z.object({
  storeId: z.number({ invalid_type_error: '店舗を選択してください' }).min(1, '店舗を選択してください'),
  productId: z.number({ invalid_type_error: '商品を選択してください' }).min(1, '商品を選択してください'),
  lotNumber: z.string().min(1, 'ロット番号は必須です').max(50, 'ロット番号は50文字以内で入力してください'),
  quantity: z.number({ invalid_type_error: '数量は数値で入力してください' }).int().min(1, '数量は1以上を入力してください'),
  expiryDate: z.string().optional(),
  location: z.string().max(100, '保管場所は100文字以内で入力してください').optional(),
  remarks: z.string().max(500, '備考は500文字以内で入力してください').optional(),
});

export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;
