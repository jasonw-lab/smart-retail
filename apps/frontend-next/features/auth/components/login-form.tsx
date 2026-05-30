'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, Lock, ShieldCheck, RefreshCw, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  captchaCode: z.string().min(1, 'Verification code is required'),
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

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: 'admin',
      password: 'password',
      captchaCode: 'A1B2',
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          captchaId: captcha?.captchaId,
          captchaCode: values.captchaCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Login failed');
        fetchCaptcha();
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError('Login failed');
      fetchCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-error-container p-3 text-sm text-on-error-container">
          {error}
        </div>
      )}

      {/* Username Field */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-xs font-medium text-on-surface-variant ml-1">
          Username or Email
        </Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
            <User className="h-5 w-5" />
          </div>
          <Input
            id="username"
            type="text"
            placeholder="demo@smartretail.pro"
            autoComplete="username"
            disabled={isLoading}
            className="pl-10 py-3 bg-surface border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            {...form.register('username')}
          />
        </div>
        {form.formState.errors.username && (
          <p className="text-sm text-error">{form.formState.errors.username.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs font-medium text-on-surface-variant ml-1">
          Password
        </Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
            <Lock className="h-5 w-5" />
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isLoading}
            className="pl-10 pr-12 py-3 bg-surface border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            {...form.register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline-variant hover:text-on-surface transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-error">{form.formState.errors.password.message}</p>
        )}
      </div>

      {/* Verification Code (Captcha) */}
      <div className="space-y-2">
        <Label htmlFor="captchaCode" className="text-xs font-medium text-on-surface-variant ml-1">
          Verification Code
        </Label>
        <div className="flex gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <Input
              id="captchaCode"
              type="text"
              placeholder="Enter code"
              disabled={isLoading}
              className="pl-10 py-3 bg-surface border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                title="Click to refresh"
              />
            ) : (
              <button
                type="button"
                onClick={fetchCaptcha}
                className="text-xs text-outline-variant hover:text-on-surface transition-colors"
              >
                Load captcha
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={fetchCaptcha}
            disabled={captchaLoading}
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${captchaLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {form.formState.errors.captchaCode && (
          <p className="text-sm text-error">{form.formState.errors.captchaCode.message}</p>
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
            Remember me
          </Label>
        </div>
        <Link href="/forgot-password" className="text-xs text-primary hover:underline transition-all font-medium">
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <span>Login</span>
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  );
}
