# ADR-007: 状態管理方針

## ステータス
承認済み (2025-05)

## 背景
既存のVue3版フロントエンドではPiniaで全ての状態を一元管理している。Next.js App Router版では、Server ComponentsとClient Componentsの境界が存在し、状態管理の方針を再設計する必要がある。

状態は以下の種類に分類される:
1. **サーバー状態**: APIから取得するデータ（商品一覧、ユーザー情報等）
2. **クライアント状態（グローバル）**: アプリ全体で共有するUI状態（サイドバー開閉、テーマ等）
3. **クライアント状態（ローカル）**: コンポーネント内で完結するUI状態（モーダル開閉等）
4. **フォーム状態**: フォーム入力値・バリデーション
5. **URL状態**: 検索条件、ページネーション

## 検討した選択肢

### 選択肢1: 状態種別ごとに最適なライブラリを選択（採用）
- サーバー状態: TanStack Query
- クライアント状態: Zustand
- フォーム状態: React Hook Form
- URL状態: nuqs or useSearchParams

### 選択肢2: 統一的な状態管理（Redux Toolkit）
- RTK Query + Redux Slicesで全状態を管理

### 選択肢3: React標準のみ
- useState, useReducer, useContext

### 選択肢4: Jotai（アトミック状態管理）
- アトム単位で状態を分割

## 決定
**状態種別ごとに最適なライブラリを選択（選択肢1）を採用する。**

具体的には:
- **サーバー状態**: TanStack Query v5
- **クライアント状態**: Zustand v4
- **フォーム状態**: React Hook Form v7 + Zod
- **URL状態**: useSearchParams（Next.js標準）

### 採用理由

1. **関心の分離**
   - サーバー状態とクライアント状態は本質的に異なる
   - それぞれに最適化されたライブラリを使用

2. **サーバー状態のキャッシュ最適化**
   - TanStack Queryはキャッシュ、再検証、楽観的更新を自動化
   - Server ComponentでprefetchしてClient Componentでhydrate可能

3. **バンドルサイズの最小化**
   - Zustand: ~1KB
   - TanStack Query: ~12KB
   - 合計でもRedux Toolkit + RTK Queryより小さい

4. **App Routerとの相性**
   - TanStack QueryはRSCでのprefetchをサポート
   - ZustandはClient Component内で自然に動作

### 状態分類と管理方法

| 状態種別 | 管理方法 | 配置場所 | 例 |
|---------|---------|---------|-----|
| サーバー状態 | TanStack Query | `features/*/hooks/` | 商品一覧、ユーザー情報 |
| グローバルUI状態 | Zustand | `store/` | サイドバー開閉、テーマ |
| 機能固有状態 | Zustand | `features/*/store/` | 受信アラート（STOMP） |
| ローカルUI状態 | useState | コンポーネント内 | モーダル開閉、タブ選択 |
| フォーム状態 | React Hook Form | コンポーネント内 | 入力値、バリデーション |
| URL状態 | useSearchParams | ページコンポーネント | 検索条件、ページ番号 |

### TanStack Query の設計

```typescript
// features/products/hooks/use-products.ts
// Client Component専用（TanStack Query + Client用API）
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApiClient } from '../lib/product-api.client';
import type { Product, ProductQuery, PageResult } from '../types/product';

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductQuery) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

// 一覧取得
export function useProducts(params: ProductQuery) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productApiClient.getPage(params),
    staleTime: 1000 * 60 * 5, // 5分
  });
}

// 詳細取得
export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApiClient.getById(id),
    enabled: !!id,
  });
}

// 作成
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApiClient.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// 更新
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductDto }) =>
      productApiClient.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

// 削除
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApiClient.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
```

### Server Component での Prefetch

**重要**: Server Component用とClient Component用のAPI関数を分離する（ハイブリッドアプローチ）。

```typescript
// features/products/lib/product-api.server.ts
// Server Component専用（Backend直接fetch）
import { fetchFromBackend } from '@/lib/api/server';
import type { Product, ProductQuery, PageResult } from '../types/product';

export const productApiServer = {
  getPage: (params: ProductQuery) =>
    fetchFromBackend<PageResult<Product>>(
      `retail/products/page?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
    ),

  getById: (id: number) =>
    fetchFromBackend<Product>(`retail/products/${id}`),
};
```

```typescript
// features/products/lib/product-api.client.ts
// Client Component専用（Route Handler経由、相対URL）
import type { Product, ProductQuery, PageResult } from '../types/product';

const BASE_URL = '/api/proxy/retail/products';

export const productApiClient = {
  getPage: async (params: ProductQuery): Promise<PageResult<Product>> => {
    const searchParams = new URLSearchParams({
      pageNum: String(params.pageNum),
      pageSize: String(params.pageSize),
      ...(params.productName && { productName: params.productName }),
    });
    const response = await fetch(`${BASE_URL}/page?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  getById: async (id: number): Promise<Product> => {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  // create, update, delete も同様...
};
```

```typescript
// app/(dashboard)/products/page.tsx
// Server Component用APIを使用（Backend直接fetch）
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { productApiServer } from '@/features/products/lib/product-api.server';
import { productKeys } from '@/features/products/hooks/use-products';
import { ProductTableClient } from '@/features/products/components/product-table';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const queryClient = new QueryClient();

  const queryParams = {
    pageNum: Number(params.page) || 1,
    pageSize: 10,
    productName: params.search,
  };

  // Server側でprefetch（Backend直接fetch、Route Handler経由しない）
  await queryClient.prefetchQuery({
    queryKey: productKeys.list(queryParams),
    queryFn: () => productApiServer.getPage(queryParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <h1>商品一覧</h1>
      <ProductTableClient initialParams={queryParams} />
    </HydrationBoundary>
  );
}
```

**ルール**:
- Server Componentから `*.client.ts` / `hooks/` をimportしない
- Server ComponentはBackend直接fetch（ハイブリッドアプローチ、ADR-002参照）

### Zustand の設計

```typescript
// store/app-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // サイドバー
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;

  // テーマ（next-themesと併用）
  // ...
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleSidebarCollapse: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
```

```typescript
// features/alerts/store/alert-store.ts
import { create } from 'zustand';
import type { Alert } from '../types/alert';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  addAlert: (alert: Alert) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 100), // 最新100件
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, read: true } : a
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  clearAll: () => set({ alerts: [], unreadCount: 0 }),
}));
```

### React Hook Form + Zod の設計

```typescript
// features/products/schemas/product-schema.ts
import { z } from 'zod';

export const productFormSchema = z.object({
  productCode: z.string().min(1, '商品コードは必須です'),
  productName: z.string().min(1, '商品名は必須です').max(100),
  categoryId: z.number().min(1, 'カテゴリを選択してください'),
  unitPrice: z.number().min(0, '価格は0以上で入力してください'),
  description: z.string().max(500).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
```

```typescript
// features/products/components/product-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema, type ProductFormValues } from '../schemas/product-schema';
import { useCreateProduct, useUpdateProduct } from '../hooks/use-products';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  defaultValues?: Partial<ProductFormValues>;
  productId?: number;
  onSuccess?: () => void;
}

export function ProductForm({ defaultValues, productId, onSuccess }: Props) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productCode: '',
      productName: '',
      categoryId: 0,
      unitPrice: 0,
      description: '',
      ...defaultValues,
    },
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const onSubmit = async (values: ProductFormValues) => {
    if (productId) {
      await updateMutation.mutateAsync({ id: productId, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>商品コード</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ... other fields */}
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {productId ? '更新' : '作成'}
        </Button>
      </form>
    </Form>
  );
}
```

### URL状態の設計

```typescript
// features/products/hooks/use-product-filters.ts
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useProductFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;

  const setFilters = useCallback(
    (filters: { page?: number; search?: string; categoryId?: number }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (filters.page !== undefined) {
        params.set('page', String(filters.page));
      }
      if (filters.search !== undefined) {
        if (filters.search) {
          params.set('search', filters.search);
        } else {
          params.delete('search');
        }
      }
      if (filters.categoryId !== undefined) {
        if (filters.categoryId) {
          params.set('categoryId', String(filters.categoryId));
        } else {
          params.delete('categoryId');
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  return {
    page,
    search,
    categoryId,
    setFilters,
  };
}
```

## 却下した選択肢の理由

### Redux Toolkit + RTK Queryを却下した理由
- **ボイラープレートが多い**: action、reducer、slice、selectorの定義が必要
- **バンドルサイズ**: TanStack Query + Zustandの合計より大きい
- **過剰な設計**: 小〜中規模の管理画面にはオーバーヘッドが大きい
- **App Routerとの相性**: Server ComponentでのprefetchパターンがTanStack Queryの方が成熟

### React標準のみを却下した理由
- **キャッシュ管理の欠如**: サーバー状態のキャッシュ・再検証を自前実装する必要
- **Context地獄**: useContextはリレンダリングの最適化が困難
- **スケーラビリティ**: 規模拡大時にスケールしにくい

### Jotaiを却下した理由
- **学習コスト**: アトミック設計は強力だが習熟が必要
- **Zustandとの比較**: 管理画面のUI状態にはZustandのシンプルさが適している
- **エコシステム**: TanStack Query + Zustandの組み合わせの方が事例が多い

## トレードオフ

### 受け入れるリスク
- 複数のライブラリを併用するため、どれを使うかの判断が必要
- TanStack QueryとZustandの責務境界をチーム全員が理解する必要

### 軽減策
- 明確な判断基準を本ADRでドキュメント化
- Query Keysの命名規則を統一
- features/配下に関連ファイルをコロケーション

## 影響範囲

| カテゴリ | 影響 |
|---------|------|
| Provider設定 | `components/providers/query-provider.tsx` |
| サーバー状態 | `features/*/hooks/use-*.ts` (TanStack Query) |
| グローバル状態 | `store/app-store.ts` (Zustand) |
| 機能固有状態 | `features/*/store/*.ts` (Zustand) |
| フォーム | `features/*/components/*-form.tsx` (React Hook Form) |
| URL状態 | `features/*/hooks/use-*-filters.ts` (useSearchParams) |

## Vue版（Pinia）との比較

| 観点 | Pinia (Vue) | TanStack Query + Zustand (React) |
|------|-------------|----------------------------------|
| 一元管理 | ○ 全てPinia | × 種別ごとに分離 |
| サーバー状態キャッシュ | △ 手動実装 | ◎ 自動 |
| DevTools | ○ | ◎ TQ DevTools + Zustand DevTools |
| 学習コスト | ○ | △ 複数ライブラリ |
| バンドルサイズ | ○ | ◎ |
| RSC対応 | - | ◎ |
