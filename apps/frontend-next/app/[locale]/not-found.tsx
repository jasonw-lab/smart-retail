import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="text-muted-foreground">{t('notFound')}</p>
      <p className="text-sm text-muted-foreground max-w-md text-center">
        {t('notFoundDescription')}
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        {t('back')}
      </Link>
    </div>
  );
}
