'use client';

import { useState } from 'react';
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

export function ResetPasswordDialog({
  open,
  onClose,
  user,
}: ResetPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const resetMutation = useResetPassword();

  const handleSubmit = async () => {
    if (!user) return;

    if (!password || password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
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
          <DialogTitle>パスワードリセット</DialogTitle>
          <DialogDescription>
            {user?.username} の新しいパスワードを入力してください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="password">新しいパスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="6文字以上"
              autoComplete="new-password"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={resetMutation.isPending}>
            {resetMutation.isPending ? 'リセット中...' : 'リセット'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
