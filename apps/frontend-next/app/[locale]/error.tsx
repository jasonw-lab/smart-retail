'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div data-testid="error-boundary" className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">{t('error')}</h2>
      <p className="text-muted-foreground">{t('unexpectedError')}</p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        {t('retry')}
      </button>
    </div>
  );
}
