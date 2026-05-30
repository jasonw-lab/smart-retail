import { z } from 'zod';

export const productFormSchema = z.object({
  productCode: z.string().min(1, '商品コードは必須です'),
  productName: z.string().min(1, '商品名は必須です').max(100, '100文字以内で入力してください'),
  categoryId: z.number().min(1, 'カテゴリを選択してください'),
  unitPrice: z.number().min(0, '価格は0以上で入力してください'),
  description: z.string().max(500, '500文字以内で入力してください').optional(),
  status: z.number().min(0).max(1),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
