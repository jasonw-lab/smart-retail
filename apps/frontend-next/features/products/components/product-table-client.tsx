'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { FilterBar, type FilterField } from '@/components/ui/filter-bar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency } from '@/lib/format';
import { useProducts, useDeleteProduct } from '../hooks/use-products';
import type {
  Product,
  ProductQuery,
  ProductPageResult,
} from '../types/product';

interface ProductTableClientProps {
  initialData: ProductPageResult;
  initialParams: ProductQuery;
}

// Category badge colors
const categoryColors: Record<string, string> = {
  飲料: 'bg-blue-100 text-blue-800',
  食品: 'bg-green-100 text-green-800',
  日用品: 'bg-purple-100 text-purple-800',
  お菓子: 'bg-pink-100 text-pink-800',
  酒類: 'bg-amber-100 text-amber-800',
  default: 'bg-gray-100 text-gray-800',
};

export function ProductTableClient({
  initialData,
  initialParams,
}: ProductTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [params, setParams] = useState<ProductQuery>(initialParams);
  const [filterValues, setFilterValues] = useState({
    productName: initialParams.productName || '',
    categoryId: initialParams.categoryId
      ? String(initialParams.categoryId)
      : '',
  });
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const {
    data = initialData,
    isLoading,
    isError,
  } = useProducts(params, {
    placeholderData: initialData,
  });

  // エラー時は初期データを使用し続ける（SSRで取得したデータ）
  const displayData = isError ? initialData : data;

  const deleteProduct = useDeleteProduct();

  const filterFields: FilterField[] = [
    {
      key: 'productName',
      label: '商品名',
      type: 'text',
      placeholder: '商品名を入力...',
      width: 'w-48',
    },
    {
      key: 'categoryId',
      label: 'カテゴリ',
      type: 'select',
      options: [
        { value: '', label: 'カテゴリを選択' },
        { value: '1', label: '飲料' },
        { value: '2', label: '食品' },
        { value: '3', label: '日用品' },
        { value: '4', label: 'お菓子' },
        { value: '5', label: '酒類' },
      ],
    },
  ];

  const handleSearch = () => {
    const newParams = {
      ...params,
      pageNum: 1,
      productName: filterValues.productName || undefined,
      categoryId: filterValues.categoryId
        ? parseInt(filterValues.categoryId, 10)
        : undefined,
    };
    setParams(newParams);
    updateURL(newParams);
  };

  const handleReset = () => {
    setFilterValues({ productName: '', categoryId: '' });
    const newParams = { pageNum: 1, pageSize: params.pageSize };
    setParams(newParams);
    router.push(pathname);
  };

  const updateURL = (params: ProductQuery) => {
    const urlParams = new URLSearchParams();
    urlParams.set('page', String(params.pageNum));
    if (params.productName) urlParams.set('search', params.productName);
    if (params.categoryId) urlParams.set('category', String(params.categoryId));
    router.push(`${pathname}?${urlParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const newParams = { ...params, pageNum: page };
    setParams(newParams);
    updateURL(newParams);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast.success('商品を削除しました');
      setDeleteTarget(null);
    } catch (error) {
      toast.error('削除に失敗しました');
    }
  };

  const getCategoryColor = (categoryName?: string) => {
    if (!categoryName) return categoryColors.default;
    return categoryColors[categoryName] || categoryColors.default;
  };

  const columns: Column<Product>[] = [
    {
      key: 'image',
      header: '画像',
      width: '70px',
      render: (_, row) => (
        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
          {row.imageUrl ? (
            <img
              src={row.imageUrl}
              alt={row.productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      ),
    },
    {
      key: 'productName',
      header: '商品名',
      sortable: true,
      render: (_, row) => <div className="font-medium">{row.productName}</div>,
    },
    {
      key: 'categoryName',
      header: 'カテゴリ',
      width: '100px',
      render: (_, row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(row.categoryName)}`}
        >
          {row.categoryName || '-'}
        </span>
      ),
    },
    {
      key: 'unitPrice',
      header: '価格',
      width: '100px',
      align: 'right',
      sortable: true,
      render: (_, row) => (
        <span className="font-mono">{formatCurrency(row.unitPrice)}</span>
      ),
    },
    {
      key: 'stockQuantity',
      header: '在庫数',
      width: '80px',
      align: 'right',
      render: (_, row) => {
        // Mock stock quantity (would come from API in real app)
        const stockQty = Math.floor(Math.random() * 200);
        const isLowStock = stockQty < 20;
        return (
          <span className={isLowStock ? 'text-destructive font-medium' : ''}>
            {stockQty}
          </span>
        );
      },
    },
    {
      key: 'salesCount',
      header: '売上数',
      width: '80px',
      align: 'right',
      render: (_, row) => {
        // Mock sales count (would come from API in real app)
        const salesCount = Math.floor(Math.random() * 500) + 50;
        return <span>{salesCount}</span>;
      },
    },
    {
      key: 'status',
      header: 'ステータス',
      width: '90px',
      align: 'center',
      render: (_, row) => (
        <Badge variant={row.status === 1 ? 'success' : 'destructive'}>
          {row.status === 1 ? '有効' : '無効'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      width: '100px',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/products/${row.id}/edit`)}
          >
            編集
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row)}
          >
            削除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FilterBar
        fields={filterFields}
        values={filterValues}
        onChange={setFilterValues}
        onSearch={handleSearch}
        onReset={handleReset}
        actions={
          <Button onClick={() => router.push('/products/new')}>
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Button>
        }
      />

      {/* Table Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">商品一覧</h2>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={displayData?.list || []}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="商品が見つかりません"
        pagination={{
          pageNum: params.pageNum,
          pageSize: params.pageSize,
          total: displayData?.total || 0,
          onPageChange: handlePageChange,
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="商品を削除"
        description="この操作は取り消せません。関連する在庫データも影響を受ける可能性があります。"
        confirmLabel="削除"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteProduct.isPending}
      >
        {deleteTarget && (
          <div className="space-y-2">
            <p className="text-sm">
              商品名:{' '}
              <span className="font-medium">{deleteTarget.productName}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              商品コード: {deleteTarget.productCode}
            </p>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
