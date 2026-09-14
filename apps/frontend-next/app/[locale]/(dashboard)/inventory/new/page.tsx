import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { InventoryForm } from '@/features/inventory/components/inventory-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('inventory');
  return {
    title: t('newInventory'),
  };
}

export default async function NewInventoryPage() {
  const t = await getTranslations('inventory');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('newInventory')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('inventoryInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryForm />
        </CardContent>
      </Card>
    </div>
  );
}
