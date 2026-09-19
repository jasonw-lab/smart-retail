import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { StoreForm } from '@/features/stores/components/store-form';
import { storeApiServer } from '@/features/stores/lib/store-api.server';
import { isRedirectError } from '@/lib/api/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('stores');
  return {
    title: t('editStoreTitle'),
  };
}

export default async function EditStorePage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('stores');
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (isNaN(id)) {
    notFound();
  }

  let store;
  try {
    store = await storeApiServer.getById(id);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    // ID不存在時のみ404
    notFound();
  }

  if (!store) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('editStoreTitle')}</h1>
        <p className="text-muted-foreground">{t('editStoreDescription')}</p>
      </div>

      <StoreForm store={store} mode="edit" />
    </div>
  );
}
