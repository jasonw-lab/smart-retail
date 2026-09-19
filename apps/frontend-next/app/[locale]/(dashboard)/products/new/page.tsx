import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ProductForm } from '@/features/products/components/product-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('products');
  return {
    title: t('newProductTitle'),
  };
}

export default async function NewProductPage() {
  const t = await getTranslations('products');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('newProductTitle')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('productInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
