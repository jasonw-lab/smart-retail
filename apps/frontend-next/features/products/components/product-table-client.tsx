'use client';

import { useState } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { FilterBar, type FilterField } from '@/components/ui/filter-bar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency } from '@/lib/format';
import { TESTIDS, testId } from '@/lib/testing/testids';
import { useProducts, useDeleteProduct } from '../hooks/use-products';
import { useCategories } from '@/features/categories/hooks/use-categories';
import type { Product, ProductQuery, ProductPageResult } from '../types/product';

interface ProductTableClientProps {
  initialData: ProductPageResult;
  initialParams: ProductQuery;
}

// Category badge colors
const categoryBadgeColors: Record<string, string> = {
  beverages: 'bg-blue-100 text-blue-800',
  food: 'bg-green-100 text-green-800',
  daily: 'bg-purple-100 text-purple-800',
  snacks: 'bg-pink-100 text-pink-800',
  alcohol: 'bg-amber-100 text-amber-800',
  default: 'bg-gray-100 text-gray-800',
};

const getCategoryColor = (categoryName?: string) => {
  if (!categoryName) return categoryBadgeColors.default;
  return categoryBadgeColors[categoryName.toLowerCase()] || categoryBadgeColors.default;
};

export function ProductTableClient({ initialData, initialParams }: ProductTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('products');
  const tCommon = useTranslations('common');

  const [params, setParams] = useState<ProductQuery>(initialParams);
  const [filterValues, setFilterValues] = useState({
    productName: initialParams.productName || '',
    categoryId: initialParams.categoryId ? String(initialParams.categoryId) : '',
  });
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data: categories = [] } = useCategories();

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

  const categoryOptions = [
    { value: '', label: t('selectCategory') },
    ...categories.map((c) => ({ value: String(c.id), label: c.categoryName })),
  ];

  const filterFields: FilterField[] = [
    {
      key: 'productName',
      label: t('productName'),
      type: 'text',
      placeholder: t('searchPlaceholder'),
      width: 'w-48',
    },
    {
      key: 'categoryId',
      label: t('category'),
      type: 'select',
      options: categoryOptions,
    },
  ];

  const handleSearch = () => {
    const newParams = {
      ...params,
      pageNum: 1,
      productName: filterValues.productName || undefined,
      categoryId: filterValues.categoryId ? parseInt(filterValues.categoryId, 10) : undefined,
    };
    setParams(newParams);
    updateURL(newParams);
  };

  const handleReset = () => {
    setFilterValues({ productName: '', categoryId: '' });
    const newParams = { pageNum: 1, pageSize: params.pageSize };
    setParams(newParams);
    window.history.replaceState(null, '', window.location.pathname);
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
      toast.success(t('deleteSuccess'));
      setDeleteTarget(null);
    } catch {
      toast.error(t('deleteFailed'));
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'image',
      header: t('image'),
      width: '70px',
      render: (_, row) => (
        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
          {row.imageUrl ? (
            <img src={row.imageUrl} alt={row.productName} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      ),
    },
    {
      key: 'productName',
      header: t('productName'),
      sortable: true,
      render: (_, row) => <div className="font-medium">{row.productName}</div>,
    },
    {
      key: 'categoryName',
      header: t('category'),
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
      header: t('price'),
      width: '100px',
      align: 'right',
      sortable: true,
      render: (_, row) => <span className="font-mono">{formatCurrency(row.unitPrice)}</span>,
    },
    {
      key: 'stockQuantity',
      header: t('stockQuantity'),
      width: '80px',
      align: 'right',
      render: (_, row) => (
        <span
          className={
            typeof row.stockQuantity === 'number' && row.stockQuantity < 20
              ? 'text-destructive font-medium'
              : undefined
          }
        >
          {typeof row.stockQuantity === 'number' ? row.stockQuantity : '-'}
        </span>
      ),
    },
    {
      key: 'salesCount',
      header: t('salesCount'),
      width: '80px',
      align: 'right',
      render: (_, row) => <span>{typeof row.salesCount === 'number' ? row.salesCount : '-'}</span>,
    },
    {
      key: 'status',
      header: t('status'),
      width: '90px',
      align: 'center',
      render: (_, row) => (
        <Badge variant={row.status === 1 ? 'success' : 'destructive'}>
          {row.status === 1 ? t('statusActive') : t('statusInactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('actions'),
      width: '100px',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            data-testid={testId(TESTIDS.PRODUCT_EDIT_BUTTON, row.id)}
            variant="outline"
            size="sm"
            onClick={() => router.push(`/products/${row.id}/edit`)}
          >
            {tCommon('edit')}
          </Button>
          <Button
            data-testid={testId(TESTIDS.PRODUCT_DELETE_BUTTON, row.id)}
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row)}
          >
            {tCommon('delete')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div data-testid={TESTIDS.PRODUCT_PAGE} className="space-y-6">
      {/* Filters */}
      <FilterBar
        fields={filterFields}
        values={filterValues}
        onChange={setFilterValues}
        onSearch={handleSearch}
        onReset={handleReset}
        actions={
          <Button
            data-testid={TESTIDS.PRODUCT_NEW_BUTTON}
            onClick={() => router.push('/products/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('newProduct')}
          </Button>
        }
      />

      {/* Table Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('listTitle')}</h2>
      </div>

      {isError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {t('fetchError')}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        dataTestId={TESTIDS.PRODUCT_TABLE}
        columns={columns}
        data={displayData?.list || []}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage={t('emptyMessage')}
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
        title={t('deleteConfirm')}
        description={t('deleteConfirmDescription')}
        confirmLabel={tCommon('delete')}
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteProduct.isPending}
      >
        {deleteTarget && (
          <div className="space-y-2">
            <p className="text-sm">
              {t('productName')}: <span className="font-medium">{deleteTarget.productName}</span>
            </p>
            <p className="text-sm text-muted-foreground">{t('productCode')}: {deleteTarget.productCode}</p>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
