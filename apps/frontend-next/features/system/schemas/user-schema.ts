import { z } from 'zod';

/**
 * ユーザー作成・編集フォームのZodスキーマ
 */
export const userFormSchema = z.object({
  username: z.string().min(1, 'ユーザー名は必須です'),
  nickname: z.string().min(1, 'ニックネームは必須です'),
  deptId: z.number().min(1, '部門は必須です'),
  gender: z.number(),
  mobile: z.string().optional(),
  email: z.string().email('メール形式が正しくありません').optional().or(z.literal('')),
  status: z.number(),
  roleIds: z.array(z.number()).min(1, '役割は必須です'),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

/**
 * プロフィール更新フォームのZodスキーマ
 */
export const profileFormSchema = z.object({
  nickname: z.string().min(1, 'ニックネームは必須です'),
  email: z.string().email('メール形式が正しくありません').optional().or(z.literal('')),
  mobile: z.string().optional(),
  avatar: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

/**
 * パスワード変更フォームのZodスキーマ
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, '現在のパスワードは必須です'),
    newPassword: z.string().min(6, '6文字以上で入力してください'),
    confirmPassword: z.string().min(1, '確認用パスワードは必須です'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '新しいパスワードと確認用パスワードが一致しません',
    path: ['confirmPassword'],
  });

export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;
