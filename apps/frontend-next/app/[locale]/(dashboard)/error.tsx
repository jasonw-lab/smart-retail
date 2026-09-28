'use client';

import { useEffect, startTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { TESTIDS } from '@/lib/testing/testids';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const t = useTranslations('common');

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleReset = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <div
      data-testid={TESTIDS.ERROR_BOUNDARY}
      className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <h2 className="text-xl font-semibold">{t('error')}</h2>
      <p className="text-muted-foreground">{t('fetchError')}</p>
      <button
        onClick={handleReset}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        {t('retry')}
      </button>
    </div>
  );
}
