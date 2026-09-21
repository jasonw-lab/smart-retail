'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useResetPassword } from '../hooks/use-user';
import type { User } from '../types/user';

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function ResetPasswordDialog({ open, onClose, user }: ResetPasswordDialogProps) {
  const t = useTranslations('system.user');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const resetMutation = useResetPassword();

  const handleSubmit = async () => {
    if (!user) return;

    if (!password || password.length < 6) {
      setError(tValidation('minLength', { min: 6 }));
      return;
    }

    await resetMutation.mutateAsync({ userId: user.id, password });
    setPassword('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('resetPassword')}</DialogTitle>
          <DialogDescription>
            {t('resetPasswordDesc', { username: user?.username ?? '' })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="password">{t('newPassword')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder={t('newPasswordPlaceholder')}
              autoComplete="new-password"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={resetMutation.isPending}>
            {resetMutation.isPending ? t('reset') + '...' : t('reset')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
