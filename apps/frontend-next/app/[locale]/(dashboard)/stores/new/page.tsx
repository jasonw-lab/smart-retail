import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { StoreForm } from '@/features/stores/components/store-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('stores');
  return {
    title: t('newStoreTitle'),
  };
}

export default async function NewStorePage() {
  const t = await getTranslations('stores');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('newStoreTitle')}</h1>
        <p className="text-muted-foreground">{t('newStoreDescription')}</p>
      </div>

      <StoreForm mode="create" />
    </div>
  );
}
