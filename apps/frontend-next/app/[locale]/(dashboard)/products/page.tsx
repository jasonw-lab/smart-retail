import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { productApiServer } from '@/features/products/lib/product-api.server';
import { ProductTableClient } from '@/features/products/components/product-table-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('products');
  return {
    title: t('title'),
  };
}

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const t = await getTranslations('products');
  const params = await searchParams;
  const pageNum = Number(params.page) || 1;
  const productName = params.search || undefined;

  const queryParams = {
    pageNum,
    pageSize: 10,
    productName,
  };

  const initialData = await productApiServer.getPage(queryParams);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <ProductTableClient initialData={initialData} initialParams={queryParams} />
    </div>
  );
}
