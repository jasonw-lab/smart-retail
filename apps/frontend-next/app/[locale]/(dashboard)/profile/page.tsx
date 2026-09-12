'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, User, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  profileFormSchema,
  passwordChangeSchema,
  type ProfileFormValues,
  type PasswordChangeValues,
} from '@/features/system/schemas/user-schema';
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
} from '@/features/system/hooks/use-user';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { data: profile, isPending: isLoadingProfile, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nickname: '',
      email: '',
      mobile: '',
      avatar: '',
    },
  });

  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        nickname: profile.nickname || '',
        email: profile.email || '',
        mobile: profile.mobile || '',
        avatar: profile.avatar || '',
      });
    }
  }, [profile, profileForm]);

  const onSubmitProfile = async (values: ProfileFormValues) => {
    try {
      await updateProfile.mutateAsync(values);
      toast.success(t('updateSuccess'));
    } catch {
      toast.error(t('updateFailed'));
    }
  };

  const onSubmitPassword = async (values: PasswordChangeValues) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success(t('passwordChangeSuccess'));
      passwordForm.reset();
    } catch {
      toast.error(t('passwordChangeFailed'));
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
        <p>{t('loadError')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {/* 基本情報 */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary text-xl font-medium">
            {(profile.nickname || profile.username).charAt(0).toUpperCase()}
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('information')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{profile.username}</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nickname">{t('nickname')}</Label>
                <Input id="nickname" {...profileForm.register('nickname')} />
                {profileForm.formState.errors.nickname && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.nickname.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" type="email" {...profileForm.register('email')} />
                {profileForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mobile">{t('mobile')}</Label>
                <Input id="mobile" {...profileForm.register('mobile')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">{t('avatarUrl')}</Label>
                <Input id="avatar" {...profileForm.register('avatar')} placeholder="https://..." />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('update')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* パスワード変更 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t('passwordChange')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register('currentPassword')}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('newPassword')}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register('newPassword')}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register('confirmPassword')}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('passwordChangeSubmit')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
