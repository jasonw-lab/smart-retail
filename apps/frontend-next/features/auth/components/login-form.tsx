'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, Lock, ShieldCheck, RefreshCw, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from '@/i18n/navigation';
import { TESTIDS } from '@/lib/testing/testids';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  captchaCode: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface CaptchaData {
  captchaId: string;
  captchaBase64: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const t = useTranslations('auth');
  const tValidation = useTranslations('validation');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: 'admin',
      password: '123456',
      captchaCode: '',
      rememberMe: false,
    },
  });

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const response = await fetch('/api/auth/captcha');
      if (response.ok) {
        const data = await response.json();
        setCaptcha(data);
      }
    } catch {
      // Captcha fetch failed
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const payload: Record<string, unknown> = {
        username: values.username,
        password: values.password,
      };
      if (values.captchaCode && values.captchaCode.trim() !== '') {
        payload.captchaId = captcha?.captchaId;
        payload.captchaCode = values.captchaCode.trim();
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        let displayError = data.error || t('loginFailed');
        if (displayError === 'Invalid username or password') {
          displayError = 'ユーザー名またはパスワードが正しくありません (admin: 123456 / demo: demo123)';
        } else if (displayError === 'Invalid captcha') {
          displayError = '認証コード（キャプチャ）が正しくありません';
        }
        setError(displayError);
        fetchCaptcha();
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError(t('loginFailed'));
      fetchCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      data-testid={TESTIDS.LOGIN_FORM}
    >
      {error && (
        <div
          className="rounded-lg bg-error-container p-3 text-sm text-on-error-container"
          data-testid={TESTIDS.LOGIN_ERROR}
        >
          {error}
        </div>
      )}

      {/* 開発用テストアカウント簡単入力 */}
      <div className="bg-surface-container/60 border border-outline-variant/60 rounded-lg p-3 text-xs space-y-1.5">
        <div className="font-medium text-on-surface flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-primary font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
            開発用アカウント
          </span>
          <span className="text-[11px] text-on-surface-variant">クリックで自動入力</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              form.setValue('username', 'admin');
              form.setValue('password', '123456');
              form.setValue('captchaCode', '');
            }}
            className="px-2.5 py-1.5 rounded bg-surface border border-outline-variant hover:border-primary text-on-surface hover:text-primary transition-all text-left shadow-2xs hover:shadow-xs"
          >
            <div className="font-medium text-[12px]">管理者 (admin)</div>
            <div className="text-[10px] text-on-surface-variant font-mono">PW: 123456</div>
          </button>
          <button
            type="button"
            onClick={() => {
              form.setValue('username', 'demo');
              form.setValue('password', 'demo123');
              form.setValue('captchaCode', '');
            }}
            className="px-2.5 py-1.5 rounded bg-surface border border-outline-variant hover:border-primary text-on-surface hover:text-primary transition-all text-left shadow-2xs hover:shadow-xs"
          >
            <div className="font-medium text-[12px]">デモ (demo)</div>
            <div className="text-[10px] text-on-surface-variant font-mono">PW: demo123</div>
          </button>
        </div>
      </div>

      {/* Username Field */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-xs font-medium text-on-surface-variant ml-1">
          {t('username')}
        </Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
            <User className="h-5 w-5" />
          </div>
          <Input
            id="username"
            type="text"
            placeholder="admin または demo"
            autoComplete="username"
            disabled={isLoading}
            className="pl-10 py-3 bg-surface border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            data-testid={TESTIDS.LOGIN_USERNAME}
            {...form.register('username')}
          />
        </div>
        {form.formState.errors.username && (
          <p className="text-sm text-error">{tValidation('required')}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs font-medium text-on-surface-variant ml-1">
          {t('password')}
        </Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
            <Lock className="h-5 w-5" />
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoading}
            className="pl-10 pr-12 py-3 bg-surface border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            data-testid={TESTIDS.LOGIN_PASSWORD}
            {...form.register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline-variant hover:text-on-surface transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-error">{tValidation('required')}</p>
        )}
      </div>

      {/* Verification Code (Captcha) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="captchaCode" className="text-xs font-medium text-on-surface-variant ml-1">
            {t('captcha')}
          </Label>
          <span className="text-[10px] text-on-surface-variant">開発環境では入力省略可</span>
        </div>
        <div className="flex gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <Input
              id="captchaCode"
              type="text"
              placeholder="省略可能（入力時は画像と一致要）"
              disabled={isLoading}
              className="pl-10 py-3 bg-surface border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              data-testid={TESTIDS.LOGIN_CAPTCHA}
              {...form.register('captchaCode')}
            />
          </div>
          <div className="w-32 h-12 bg-surface-container rounded-lg border border-outline-variant flex items-center justify-center overflow-hidden">
            {captchaLoading ? (
              <div className="animate-pulse bg-surface-container-high w-full h-full" />
            ) : captcha?.captchaBase64 ? (
              <img
                src={captcha.captchaBase64}
                alt="Captcha"
                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={fetchCaptcha}
              />
            ) : (
              <button
                type="button"
                onClick={fetchCaptcha}
                className="text-xs text-outline-variant hover:text-on-surface transition-colors"
              >
                Load
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={fetchCaptcha}
            disabled={captchaLoading}
            aria-label="キャプチャを更新"
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${captchaLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {form.formState.errors.captchaCode && (
          <p className="text-sm text-error">{tValidation('required')}</p>
        )}
      </div>

      {/* Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            checked={form.watch('rememberMe')}
            onCheckedChange={(checked) => form.setValue('rememberMe', checked as boolean)}
            className="border-outline-variant"
          />
          <Label htmlFor="rememberMe" className="text-sm text-on-surface-variant cursor-pointer">
            {t('rememberMe')}
          </Label>
        </div>
        <Link
          href="/forgot-password"
          className="text-xs text-primary hover:underline transition-all font-medium"
        >
          {t('forgotPassword')}
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        disabled={isLoading}
        data-testid={TESTIDS.LOGIN_SUBMIT}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <span>{t('login')}</span>
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  );
}
