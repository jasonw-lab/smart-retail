import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationTranslation = ReturnType<typeof useTranslations<'validation'>>;

/**
 * ユーザー作成・編集フォームのZodスキーマ生成関数
 */
export const createUserFormSchema = (t: ValidationTranslation) =>
  z.object({
    username: z.string().min(1, t('required')),
    nickname: z.string().min(1, t('required')),
    deptId: z.number().min(1, t('required')),
    gender: z.number(),
    mobile: z.string().optional(),
    email: z.string().email(t('email')).optional().or(z.literal('')),
    status: z.number(),
    roleIds: z.array(z.number()).min(1, t('required')),
  });

export type UserFormValues = z.infer<ReturnType<typeof createUserFormSchema>>;

/**
 * プロフィール更新フォームのZodスキーマ生成関数
 */
export const createProfileFormSchema = (t: ValidationTranslation) =>
  z.object({
    nickname: z.string().min(1, t('required')),
    email: z.string().email(t('email')).optional().or(z.literal('')),
    mobile: z.string().optional(),
    avatar: z.string().optional(),
  });

export type ProfileFormValues = z.infer<ReturnType<typeof createProfileFormSchema>>;

/**
 * パスワード変更フォームのZodスキーマ生成関数
 */
export const createPasswordChangeSchema = (t: ValidationTranslation) =>
  z
    .object({
      currentPassword: z.string().min(1, t('required')),
      newPassword: z.string().min(6, t('minLength', { min: 6 })),
      confirmPassword: z.string().min(1, t('required')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('passwordMismatch'),
      path: ['confirmPassword'],
    });

export type PasswordChangeValues = z.infer<ReturnType<typeof createPasswordChangeSchema>>;

const fallbackValidation = ((key: string, params?: Record<string, unknown>) => {
  if (key === 'email') return 'メール形式が正しくありません';
  if (key === 'minLength' && params?.min) return `${params.min}文字以上で入力してください`;
  if (key === 'passwordMismatch') return '新しいパスワードと確認用パスワードが一致しません';
  return '必須です';
}) as unknown as ValidationTranslation;

export const userFormSchema = createUserFormSchema(fallbackValidation);
export const profileFormSchema = createProfileFormSchema(fallbackValidation);
export const passwordChangeSchema = createPasswordChangeSchema(fallbackValidation);

