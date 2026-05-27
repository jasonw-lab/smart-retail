# ADR-008: E2Eテスト戦略（UIのみ）

## ステータス
検討中 (2026-05)

## 背景
frontend-nextの品質保証として、E2Eテストの導入を検討する。バックエンドAPIは別リポジトリで管理されているため、フロントエンドUIのみを対象としたテスト戦略が必要。

### 要件
- UIコンポーネントの動作検証
- ユーザーフロー（ログイン→操作→ログアウト）の検証
- バックエンド非依存でCI実行可能
- 開発者が容易にテスト作成・実行できる

## 検討した選択肢

### 選択肢1: Playwright + MSW（採用候補）
- Playwrightでブラウザ操作
- MSW (Mock Service Worker) でAPIモック
- Next.js App Routerとの統合が良好

### 選択肢2: Cypress + MSW
- Cypressでブラウザ操作
- MSWでAPIモック
- 豊富なエコシステム

### 選択肢3: Playwright + Route Handler モック
- PlaywrightでE2E
- Next.js Route Handlerレベルでモック
- MSW不要

### 選択肢4: Storybook + Chromatic
- コンポーネント単位のVisual Regression
- インタラクションテスト
- E2Eフローは対象外

## 評価基準

| 基準 | Playwright+MSW | Cypress+MSW | Playwright+RH | Storybook |
|------|---------------|-------------|---------------|-----------|
| App Router対応 | ◎ | ○ | ◎ | ○ |
| セットアップ容易性 | ○ | ○ | ◎ | ◎ |
| CI実行速度 | ◎ | △ | ◎ | ○ |
| デバッグ体験 | ◎ | ◎ | ○ | ◎ |
| APIモック柔軟性 | ◎ | ◎ | ○ | △ |
| ユーザーフロー検証 | ◎ | ◎ | ◎ | △ |
| バンドルサイズ影響 | なし | なし | なし | なし |
| 学習コスト | ○ | ○ | ◎ | ○ |

## 決定
**Playwright + MSW（選択肢1）を採用候補とする。**

### 採用理由

1. **App Router完全対応**
   - PlaywrightはNext.js公式推奨
   - Server Components、Route Handlersの動作検証可能

2. **MSWによる柔軟なAPIモック**
   - リクエストレベルでインターセプト
   - 成功/エラー/遅延など多様なシナリオ
   - 本番コードに影響なし

3. **CI最適化**
   - 並列実行サポート
   - ヘッドレス実行が高速
   - GitHub Actions連携が容易

4. **開発体験**
   - UI Modeでインタラクティブデバッグ
   - Trace Viewerで失敗原因特定
   - VS Code拡張でIDE統合

## テスト構成

### ディレクトリ構成
```
apps/frontend-next/
├── e2e/
│   ├── fixtures/
│   │   └── auth.ts              # 認証フィクスチャ
│   ├── mocks/
│   │   ├── handlers/
│   │   │   ├── auth.ts          # 認証APIモック
│   │   │   ├── products.ts      # 商品APIモック
│   │   │   └── alerts.ts        # アラートAPIモック
│   │   └── server.ts            # MSWセットアップ
│   ├── specs/
│   │   ├── auth.spec.ts         # 認証フロー
│   │   ├── products.spec.ts     # 商品管理フロー
│   │   └── dashboard.spec.ts    # ダッシュボード
│   └── playwright.config.ts
├── tests/                        # ユニット/統合テスト（別途）
└── ...
```

### テストシナリオ（優先度順）

#### 優先度: 高
| シナリオ | 内容 |
|---------|------|
| ログインフロー | 正常ログイン、バリデーションエラー、認証エラー |
| 認証リダイレクト | 未認証時のログインページリダイレクト |
| ログアウト | セッション終了、リダイレクト |

#### 優先度: 中
| シナリオ | 内容 |
|---------|------|
| 商品一覧表示 | データ表示、ページネーション、検索 |
| 商品CRUD | 新規作成、編集、削除 |
| ダッシュボード | KPI表示、レイアウト |

#### 優先度: 低
| シナリオ | 内容 |
|---------|------|
| アラート受信 | WebSocketモック、リアルタイム表示 |
| テーマ切り替え | ダークモード/ライトモード |
| レスポンシブ | モバイル/デスクトップ表示 |

### MSWモック設計

```typescript
// e2e/mocks/handlers/auth.ts
import { http, HttpResponse } from 'msw';

export const authHandlers = [
  // ログイン成功
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    if (body.username === 'admin' && body.password === 'password') {
      return HttpResponse.json({ success: true });
    }
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // ユーザー情報取得
  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      userId: 1,
      username: 'admin',
      nickname: '管理者',
      roles: ['ADMIN'],
    });
  }),

  // ログアウト
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),
];
```

```typescript
// e2e/mocks/handlers/products.ts
import { http, HttpResponse } from 'msw';

const mockProducts = [
  { id: 1, productCode: 'P001', productName: 'テスト商品1', unitPrice: 1000, status: 1 },
  { id: 2, productCode: 'P002', productName: 'テスト商品2', unitPrice: 2000, status: 1 },
];

export const productHandlers = [
  // 商品一覧
  http.get('/api/proxy/retail/products/page', ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const search = url.searchParams.get('productName') || '';

    const filtered = mockProducts.filter(p =>
      p.productName.includes(search)
    );

    return HttpResponse.json({
      list: filtered.slice((pageNum - 1) * pageSize, pageNum * pageSize),
      total: filtered.length,
    });
  }),

  // 商品詳細
  http.get('/api/proxy/retail/products/:id', ({ params }) => {
    const product = mockProducts.find(p => p.id === Number(params.id));
    if (!product) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  // 商品作成
  http.post('/api/proxy/retail/products', async ({ request }) => {
    const body = await request.json();
    const newProduct = { id: mockProducts.length + 1, ...body };
    mockProducts.push(newProduct);
    return HttpResponse.json(null, { status: 201 });
  }),

  // 商品削除
  http.delete('/api/proxy/retail/products/:id', () => {
    return HttpResponse.json(null, { status: 204 });
  }),
];
```

### Playwright設定

```typescript
// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### テスト例

```typescript
// e2e/specs/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test('正常ログイン', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // ダッシュボードにリダイレクト
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('ダッシュボード');
  });

  test('バリデーションエラー', async ({ page }) => {
    await page.goto('/login');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=ユーザー名を入力してください')).toBeVisible();
    await expect(page.locator('text=パスワードを入力してください')).toBeVisible();
  });

  test('認証エラー', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="username"]', 'wrong');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=ログインに失敗しました')).toBeVisible();
  });

  test('未認証リダイレクト', async ({ page }) => {
    // Cookieなしで保護ページにアクセス
    await page.goto('/products');

    // ログインページにリダイレクト
    await expect(page).toHaveURL(/\/login\?redirect=/);
  });
});
```

```typescript
// e2e/specs/products.spec.ts
import { test, expect } from '@playwright/test';

test.describe('商品管理', () => {
  test.beforeEach(async ({ page }) => {
    // 認証済み状態をセットアップ（fixture使用）
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('商品一覧表示', async ({ page }) => {
    await page.goto('/products');

    await expect(page.locator('h1')).toContainText('商品管理');
    await expect(page.locator('table tbody tr')).toHaveCount(2);
  });

  test('商品検索', async ({ page }) => {
    await page.goto('/products');

    await page.fill('input[placeholder="商品名で検索..."]', 'テスト商品1');
    await page.click('button:has-text("検索")');

    await expect(page.locator('table tbody tr')).toHaveCount(1);
    await expect(page.locator('table tbody')).toContainText('テスト商品1');
  });

  test('商品新規作成', async ({ page }) => {
    await page.goto('/products');
    await page.click('button:has-text("新規作成")');

    await expect(page).toHaveURL('/products/new');

    await page.fill('input[name="productCode"]', 'P003');
    await page.fill('input[name="productName"]', '新商品');
    await page.fill('input[name="categoryId"]', '1');
    await page.fill('input[name="unitPrice"]', '3000');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/products');
  });
});
```

## 却下した選択肢の理由

### Cypress + MSWを却下した理由
- CI実行速度がPlaywrightより遅い
- Next.js App Router対応がPlaywrightほど成熟していない
- Playwrightが公式推奨

### Route Handlerモックを却下した理由
- テストごとにモック切り替えが煩雑
- MSWの方がリクエストレベルで柔軟
- 本番コードへの変更が必要になる可能性

### Storybookのみを却下した理由
- ユーザーフロー（画面遷移）のテストに不向き
- 認証フロー検証ができない
- 補完として併用は検討

## トレードオフ

### 受け入れるリスク
- MSWのセットアップ・メンテナンスコスト
- モックと実APIの乖離リスク
- WebSocketモックの複雑性

### 軽減策
- 型定義をAPIモックにも適用
- CI以外でのAPI結合テスト（手動/ステージング）
- モックデータの一元管理

## 依存パッケージ

```json
{
  "devDependencies": {
    "@playwright/test": "^1.45.0",
    "msw": "^2.3.0"
  }
}
```

## 実装フェーズ

| フェーズ | 内容 | 見積 |
|---------|------|------|
| Phase 1 | Playwright + MSW セットアップ | - |
| Phase 2 | 認証フローテスト | - |
| Phase 3 | 商品CRUDテスト | - |
| Phase 4 | CI統合 (GitHub Actions) | - |
| Phase 5 | その他ページテスト追加 | - |

## 影響範囲

| カテゴリ | 影響 |
|---------|------|
| 開発依存 | @playwright/test, msw |
| CI | GitHub Actions workflow 追加 |
| ディレクトリ | e2e/ 追加 |
| package.json | test:e2e スクリプト追加 |
