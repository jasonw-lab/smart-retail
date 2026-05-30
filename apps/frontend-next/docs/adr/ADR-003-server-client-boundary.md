# ADR-003: Server/Client Componentの境界設計

## ステータス
承認済み (2025-05) / 改訂 (2026-05)

## 背景
App RouterではデフォルトでReact Server Components（RSC）として動作する。認証必須のダッシュボード画面において、Server Componentsをどこまで活用するかを決定する必要がある。

SmartRetail Proは業務システムであり、以下の特性を持つ:
- 認証必須のダッシュボード画面が主
- テーブル操作（ソート、フィルタ、ページネーション）が多い
- フォーム入力・バリデーションが必要
- リアルタイム更新が一部の画面で必要（アラート通知）

## 検討した選択肢

### 選択肢1: 最大限Server Component活用（採用）
- ページ（page.tsx）はServer Componentとしてデータ取得
- インタラクティブな部分のみClient Componentに切り出し
- `"use client"`の配置を最小限に

### 選択肢2: ページ単位でClient Component
- 各page.tsxに`"use client"`を配置
- Vue版と同様のメンタルモデル

### 選択肢3: 全てClient Component
- RSCを使わない従来のSPA方式

## 決定
**最大限Server Component活用（選択肢1）を採用する。**

### 採用理由

1. **初回ロードの高速化**
   - Server Componentでデータ取得することで、クライアントサイドのfetch待ちを削減
   - RSC Payloadとしてデータが含まれるため、ローディング状態の短縮

2. **バンドルサイズ削減**
   - Server Component内のロジック・依存関係はクライアントに送信されない
   - 特にデータ変換、バリデーションライブラリなどの削減効果

3. **認証済みダッシュボードでも活用可能**
   - ADR-002に基づき、Server ComponentはBackend直接fetch（ハイブリッドアプローチ）
   - 事前トークンリフレッシュにより、Server Componentでの401発生を最小化

4. **段階的なClient Component化**
   - 必要な部分だけClient Componentに切り出すことで、責務が明確化

### 境界設計の原則

```
Server Component（デフォルト）
├── page.tsx          # データ取得、初期表示
├── layout.tsx        # レイアウト構造
└── Client Component（"use client"）
    ├── インタラクティブテーブル
    ├── フォーム
    ├── モーダル/ドロワー
    ├── 検索フィルタ
    └── リアルタイム更新（STOMP）
```

### コンポーネント分類基準

| 種別 | Server Component | Client Component |
|------|-----------------|------------------|
| 静的表示 | ○ | - |
| データ取得（初期） | ○ | - |
| イベントハンドラ | - | ○ |
| useState/useReducer | - | ○ |
| useEffect | - | ○ |
| ブラウザAPI | - | ○ |
| フォーム入力 | - | ○ |
| テーブル操作 | - | ○ |
| WebSocket/STOMP | - | ○ |

### 具体的なコンポーネント設計

#### 商品一覧ページ
```
app/(dashboard)/products/page.tsx [Server]
├── 初期データをfetchFromBackend()で取得（Backend直接）
├── Breadcrumb [Server]
├── ページタイトル [Server]
└── ProductTableClient [Client]
    ├── 検索フォーム
    ├── テーブル（ソート、選択）
    ├── ページネーション（Route Handler経由）
    └── 削除確認ダイアログ
```

#### ダッシュボードページ
```
app/(dashboard)/page.tsx [Server]
├── KPIデータをfetchFromBackend()で取得（Backend直接）
├── KPIカード群 [Server - 静的表示]
├── SalesTrendChart [Client - recharts]
├── InventoryStatusChart [Client - recharts]
└── AlertList [Client - リアルタイム更新]
```

### Server → Client のデータ受け渡し

```typescript
// app/(dashboard)/products/page.tsx [Server Component]
import { fetchFromBackend } from '@/lib/api/server';
import { ProductTableClient } from '@/features/products/components/product-table-client';
import type { PageResult, Product } from '@/features/products/types/product';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const pageNum = Number(params.page) || 1;
  const productName = params.search || '';

  // Server Component から Backend へ直接fetch（Route Handler経由しない）
  // Result<T> のunwrapはfetchFromBackend内で完了
  const initialData = await fetchFromBackend<PageResult<Product>>(
    `retail/products/page?pageNum=${pageNum}&pageSize=10&productName=${encodeURIComponent(productName)}`
  );

  return (
    <div>
      <h1>商品一覧</h1>
      {/* Client ComponentにpropsでinitialDataを渡す */}
      <ProductTableClient
        initialData={initialData}
        initialParams={{ pageNum, pageSize: 10, productName }}
      />
    </div>
  );
}
```

```typescript
// features/products/components/product-table-client.tsx
'use client';

import { useState } from 'react';
import { useProducts } from '../hooks/use-products';
import type { Product, ProductQuery, PageResult } from '../types/product';

interface Props {
  initialData: PageResult<Product>;
  initialParams: ProductQuery;
}

export function ProductTableClient({ initialData, initialParams }: Props) {
  const [params, setParams] = useState(initialParams);

  // TanStack Query（Client Component）
  // initialDataをplaceholderDataとして使用
  const { data = initialData, isLoading } = useProducts(params, {
    placeholderData: initialData,
  });

  // ... テーブルレンダリング
}
```

### API関数の分離（Server用 / Client用）

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
import type { Product, ProductQuery, PageResult, CreateProductDto, UpdateProductDto } from '../types/product';

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

  create: async (data: CreateProductDto): Promise<void> => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create product');
  },

  update: async (id: number, data: UpdateProductDto): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update product');
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
  },
};
```

```typescript
// features/products/hooks/use-products.ts
// Client Component専用（TanStack Query）
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApiClient } from '../lib/product-api.client';
import type { Product, ProductQuery, PageResult } from '../types/product';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductQuery) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

export function useProducts(
  params: ProductQuery,
  options?: { placeholderData?: PageResult<Product> }
) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productApiClient.getPage(params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 5, // 5分
  });
}
```

## 却下した選択肢の理由

### ページ単位でClient Componentを却下した理由
- 全ページがClient Componentになり、RSCのメリット（バンドル削減、初期ロード高速化）を失う
- Server Componentでのデータ取得が使えず、useEffectでのfetchに逆戻り
- App Router採用の意味が薄れる

### 全てClient Componentを却下した理由
- App Routerを採用する意義がない
- バンドルサイズがVue版と同等以上になる可能性
- SEO、初回表示速度の改善が見込めない

## トレードオフ

### 受け入れるリスク
- Server/Client境界を跨ぐデータはシリアライズ可能でなければならない（関数、Date等に注意）
- API関数をServer用とClient用に分離する必要がある
- Server Componentで401発生時はログインへリダイレクト（自動リフレッシュなし）

### 軽減策
- 型定義で`Serializable`な型を明確にする
- `*.server.ts` / `*.client.ts` のサフィックスで明確に分離
- 初期データはServer Component、後続のインタラクションはClient Componentの二層構成
- TanStack Queryの`placeholderData`で初期データを活用
- 事前トークンリフレッシュにより、Server Componentでの401発生を最小化（ADR-002参照）

## 影響範囲

| カテゴリ | 影響 |
|---------|------|
| page.tsx | Server Component（fetchFromBackendでBackend直接fetch） |
| インタラクティブUI | Client Component（features/*/components/） |
| レイアウト | Server Component（layout.tsx） |
| API関数 | `*.server.ts` / `*.client.ts` に分離 |
| データフェッチ | Server: fetchFromBackend / Client: TanStack Query + Route Handler |
| 状態管理 | Client Component内でZustand（グローバル状態最小化） |

## フォルダ規約

```
features/products/
├── components/
│   ├── product-table-client.tsx    # [Client] "use client"
│   ├── product-form.tsx            # [Client]
│   └── product-card.tsx            # [Server]
├── lib/
│   ├── product-api.server.ts       # [Server専用] fetchFromBackend（Backend直接）
│   └── product-api.client.ts       # [Client専用] Route Handler経由
├── hooks/
│   └── use-products.ts             # [Client専用] TanStack Query
└── types/
    └── product.ts                  # 共通型定義
```

**ルール**: Server Componentから `*.client.ts` / `hooks/` をimportしない

## 関連ADR
- ADR-002: JWT認証（ハイブリッドアプローチ）
- ADR-005: STOMPリアルタイム（Client Componentに閉じ込め）
- ADR-007: 状態管理（TanStack Query + Zustand）
