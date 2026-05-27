import { Metadata } from 'next';
import { productApiServer } from '@/features/products/lib/product-api.server';
import { ProductTableClient } from '@/features/products/components/product-table-client';

export const metadata: Metadata = {
  title: '商品管理',
};

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const pageNum = Number(params.page) || 1;
  const productName = params.search || undefined;

  const queryParams = {
    pageNum,
    pageSize: 10,
    productName,
  };

  // Server ComponentでBackend直接fetch
  let initialData;
  try {
    initialData = await productApiServer.getPage(queryParams);
  } catch {
    // エラー時は空データ
    initialData = { list: [], total: 0 };
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">商品管理</h1>
      <ProductTableClient initialData={initialData} initialParams={queryParams} />
    </div>
  );
}
