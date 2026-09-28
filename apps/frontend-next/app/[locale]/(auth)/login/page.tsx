import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LoginForm } from '@/features/auth/components/login-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return {
    title: t('login'),
  };
}

export default async function LoginPage() {
  const t = await getTranslations('auth');

  return (
    <div className="max-w-md mx-auto w-full space-y-8">
      {/* Header */}
      <div className="text-center md:text-left">
        <h3 className="text-3xl font-bold text-on-surface mb-2">{t('welcomeBack')}</h3>
        <p className="text-sm text-on-surface-variant">
          {t('welcomeSubtitle')}
        </p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Footer */}
      <div className="pt-6 text-center">
        <p className="text-sm text-on-surface-variant">
          {t('noAccount')}{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
