import { Store, BarChart3, Package, TrendingUp } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface AuthLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AuthLayout({
  children,
  params,
}: AuthLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('auth');
  const tCommon = await getTranslations('common');

  return (
    <div className="min-h-screen flex items-center justify-center p-6 grid-pattern bg-surface">
      {/* Main Container - Stitch design card */}
      <main className="w-full max-w-5xl bg-surface-container-lowest rounded-xl login-card-shadow flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        {/* Left Section: Branding & Value Prop */}
        <section className="w-full md:w-[45%] p-10 md:p-12 flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-surface to-surface-container-low">
          {/* Decorative atmospheric element */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-12">
            {/* Brand Anchor */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-md">
                <Store className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-on-surface tracking-tight">
                  {tCommon('appName')}
                </h1>
                <p className="text-xs text-on-surface-variant">
                  Retail Management
                </p>
              </div>
            </div>

            {/* Tagline */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-on-surface tracking-tight">
                {t('tagline')}
              </h2>
              <p className="text-base text-on-surface-variant leading-relaxed">
                {t('description')}
              </p>
            </div>

            {/* Feature Icons */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary-container group-hover:text-on-primary-container">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="text-base font-medium text-on-surface-variant">
                  {t('feature1')}
                </span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary-container group-hover:text-on-primary-container">
                  <Package className="h-5 w-5" />
                </div>
                <span className="text-base font-medium text-on-surface-variant">
                  {t('feature2')}
                </span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary-container group-hover:text-on-primary-container">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-base font-medium text-on-surface-variant">
                  {t('feature3')}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom decorative */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
        </section>

        {/* Right Section: Login Form */}
        <section className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-center bg-surface-container-lowest">
          {children}
        </section>
      </main>
    </div>
  );
}
