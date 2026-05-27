'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Trash2, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts, useDeleteProduct, productKeys } from '../hooks/use-products';
import type { Product, ProductQuery, ProductPageResult } from '../types/product';

interface ProductTableClientProps {
  initialData: ProductPageResult;
  initialParams: ProductQuery;
}

export function ProductTableClient({
  initialData,
  initialParams,
}: ProductTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [params, setParams] = useState<ProductQuery>(initialParams);
  const [searchInput, setSearchInput] = useState(initialParams.productName || '');

  const { data = initialData, isLoading } = useProducts(params, {
    placeholderData: initialData,
  });

  const deleteProduct = useDeleteProduct();

  const handleSearch = () => {
    const newParams = { ...params, pageNum: 1, productName: searchInput || undefined };
    setParams(newParams);

    // URLを更新
    const urlParams = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      urlParams.set('search', searchInput);
    } else {
      urlParams.delete('search');
    }
    urlParams.set('page', '1');
    router.push(`${pathname}?${urlParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const newParams = { ...params, pageNum: page };
    setParams(newParams);

    const urlParams = new URLSearchParams(searchParams.toString());
    urlParams.set('page', String(page));
    router.push(`${pathname}?${urlParams.toString()}`);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(id);
      toast.success('商品を削除しました');
    } catch (error) {
      toast.error('削除に失敗しました');
    }
  };

  const totalPages = Math.ceil((data?.total || 0) / params.pageSize);

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="商品名で検索..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-64"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => router.push('/products/new')}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">商品コード</th>
              <th className="px-4 py-3 text-left text-sm font-medium">商品名</th>
              <th className="px-4 py-3 text-left text-sm font-medium">カテゴリ</th>
              <th className="px-4 py-3 text-right text-sm font-medium">単価</th>
              <th className="px-4 py-3 text-center text-sm font-medium">ステータス</th>
              <th className="px-4 py-3 text-center text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  読み込み中...
                </td>
              </tr>
            )}
            {!isLoading && data?.list?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  商品が見つかりません
                </td>
              </tr>
            )}
            {data?.list?.map((product: Product) => (
              <tr key={product.id} className="border-b">
                <td className="px-4 py-3 text-sm">{product.productCode}</td>
                <td className="px-4 py-3 text-sm font-medium">{product.productName}</td>
                <td className="px-4 py-3 text-sm">{product.categoryName || '-'}</td>
                <td className="px-4 py-3 text-right text-sm">
                  {product.unitPrice.toLocaleString()}円
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      product.status === 1
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {product.status === 1 ? '有効' : '無効'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/products/${product.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id, product.productName)}
                      disabled={deleteProduct.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            全{data?.total || 0}件中 {(params.pageNum - 1) * params.pageSize + 1}〜
            {Math.min(params.pageNum * params.pageSize, data?.total || 0)}件
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(params.pageNum - 1)}
              disabled={params.pageNum === 1}
            >
              前へ
            </Button>
            <span className="text-sm">
              {params.pageNum} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(params.pageNum + 1)}
              disabled={params.pageNum >= totalPages}
            >
              次へ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
