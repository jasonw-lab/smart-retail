import { http, HttpResponse } from 'msw';

const BACKEND_URL = 'http://localhost:8091/api/v1';

/**
 * Mock data
 */
export const mockUsers = {
  admin: {
    userId: 1,
    username: 'admin',
    password: 'password',
    nickname: '管理者',
    avatar: null,
    roles: ['ADMIN'],
    perms: ['*'],
  },
  demo: {
    userId: 2,
    username: 'demo',
    password: 'demo123',
    nickname: 'Demo User',
    avatar: null,
    roles: ['ADMIN'],
    perms: ['*'],
  },
  user: {
    userId: 3,
    username: 'user',
    password: 'password',
    nickname: '一般ユーザー',
    avatar: null,
    roles: ['USER'],
    perms: ['product:read'],
  },
};

export const mockProducts = [
  {
    id: 1,
    productCode: 'PRD-001',
    productName: 'テスト商品1',
    categoryId: 1,
    categoryName: 'カテゴリA',
    unitPrice: 1000,
    description: 'テスト商品1の説明',
    status: 1,
    createTime: '2026-01-01T00:00:00',
    updateTime: '2026-01-01T00:00:00',
  },
  {
    id: 2,
    productCode: 'PRD-002',
    productName: 'テスト商品2',
    categoryId: 1,
    categoryName: 'カテゴリA',
    unitPrice: 2000,
    description: 'テスト商品2の説明',
    status: 1,
    createTime: '2026-01-02T00:00:00',
    updateTime: '2026-01-02T00:00:00',
  },
  {
    id: 3,
    productCode: 'PRD-003',
    productName: 'サンプル商品',
    categoryId: 2,
    categoryName: 'カテゴリB',
    unitPrice: 1500,
    description: 'サンプル商品の説明',
    status: 0,
    createTime: '2026-01-03T00:00:00',
    updateTime: '2026-01-03T00:00:00',
  },
];

export const mockDashboardStats = {
  productCount: 1234,
  totalSales: 12345678,
  lowStockCount: 12,
  alertCount: 5,
};

export const mockAlerts = [
  {
    id: 'alert-1',
    type: 'LOW_STOCK',
    category: '在庫異常',
    message: '商品「テスト商品1」の在庫が補充点を下回りました',
    productId: 1,
    productName: 'テスト商品1',
    storeId: 1,
    storeName: '東京本店',
    severity: 'warning',
    priority: 2,
    status: 'unread',
    read: false,
    createdAt: '2026-05-26T10:00:00',
  },
  {
    id: 'alert-2',
    type: 'EXPIRING',
    category: '在庫異常',
    message: '商品「テスト商品2」の賞味期限が近づいています',
    productId: 2,
    productName: 'テスト商品2',
    storeId: 1,
    storeName: '東京本店',
    severity: 'info',
    priority: 3,
    status: 'acknowledged',
    read: true,
    createdAt: '2026-05-25T15:30:00',
  },
];

export const mockStores = [
  {
    id: 1,
    storeCode: 'STR-001',
    storeName: '東京本店',
    address: '東京都渋谷区1-1-1',
    phone: '03-1234-5678',
    status: 'ACTIVE',
    openingHours: '09:00-21:00',
    createTime: '2026-01-01T00:00:00',
  },
  {
    id: 2,
    storeCode: 'STR-002',
    storeName: '大阪支店',
    address: '大阪府大阪市北区2-2-2',
    phone: '06-1234-5678',
    status: 'ACTIVE',
    openingHours: '10:00-20:00',
    createTime: '2026-01-15T00:00:00',
  },
];

export const mockDevices = [
  {
    id: 1,
    deviceCode: 'DEV-001',
    deviceName: 'レジ端末1',
    deviceType: 'PAYMENT_TERMINAL',
    storeId: 1,
    storeName: '東京本店',
    status: 'ONLINE',
    lastHeartbeat: '2026-05-29T10:00:00',
  },
  {
    id: 2,
    deviceCode: 'DEV-002',
    deviceName: 'プリンター1',
    deviceType: 'PRINTER',
    storeId: 1,
    storeName: '東京本店',
    status: 'ONLINE',
    lastHeartbeat: '2026-05-29T10:05:00',
  },
];

export const mockInventory = [
  {
    id: 1,
    storeId: 1,
    storeName: '東京本店',
    productId: 1,
    productName: 'テスト商品1',
    quantity: 100,
    minQuantity: 10,
    status: 'NORMAL',
    lastUpdated: '2026-05-29T08:00:00',
  },
  {
    id: 2,
    storeId: 1,
    storeName: '東京本店',
    productId: 2,
    productName: 'テスト商品2',
    quantity: 5,
    minQuantity: 10,
    status: 'LOW_STOCK',
    lastUpdated: '2026-05-29T08:30:00',
  },
];

export const mockTransactions = [
  {
    id: 1,
    orderNumber: 'TXN-20260529-001',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 3500,
    paymentMethod: 'CREDIT_CARD',
    status: 'COMPLETED',
    transactionTime: '2026-05-29T09:15:00',
  },
  {
    id: 2,
    orderNumber: 'TXN-20260529-002',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 1200,
    paymentMethod: 'CASH',
    status: 'COMPLETED',
    transactionTime: '2026-05-29T09:30:00',
  },
];

// System: Users
export const mockSystemUsers = [
  {
    id: 1,
    username: 'admin',
    nickname: '管理者',
    mobile: '090-1234-5678',
    gender: 1,
    avatar: null,
    email: 'admin@smartretail.pro',
    status: 1,
    deptId: 1,
    deptName: '本社',
    roleIds: [1],
    roleNames: '管理者',
    createTime: '2026-01-01T00:00:00',
  },
  {
    id: 2,
    username: 'user',
    nickname: '一般ユーザー',
    mobile: '090-2345-6789',
    gender: 1,
    avatar: null,
    email: 'user@smartretail.pro',
    status: 1,
    deptId: 2,
    deptName: '営業部',
    roleIds: [2],
    roleNames: '一般',
    createTime: '2026-01-15T00:00:00',
  },
];

// System: Roles
export const mockRoles = [
  {
    id: 1,
    name: '管理者',
    code: 'ADMIN',
    sort: 1,
    status: 1,
    dataScope: 1,
    createTime: '2026-01-01T00:00:00',
  },
  {
    id: 2,
    name: '一般',
    code: 'USER',
    sort: 2,
    status: 1,
    dataScope: 2,
    createTime: '2026-01-01T00:00:00',
  },
];

// System: Departments
export const mockDepts = [
  {
    id: 1,
    name: '本社',
    parentId: 0,
    sort: 1,
    status: 1,
    children: [
      { id: 2, name: '営業部', parentId: 1, sort: 1, status: 1, children: [] },
      { id: 3, name: '開発部', parentId: 1, sort: 2, status: 1, children: [] },
    ],
  },
];

// System: Menus
export const mockMenus = [
  {
    id: 1,
    parentId: 0,
    name: 'ダッシュボード',
    type: 'CATALOG',
    path: '/',
    icon: 'dashboard',
    sort: 1,
    visible: 1,
    children: [],
  },
  {
    id: 2,
    parentId: 0,
    name: '商品管理',
    type: 'CATALOG',
    path: '/products',
    icon: 'product',
    sort: 2,
    visible: 1,
    children: [],
  },
];

// System: Dictionaries
export const mockDicts = [
  {
    id: 1,
    name: 'ステータス',
    code: 'status',
    status: 1,
    remark: '有効/無効ステータス',
  },
  {
    id: 2,
    name: '性別',
    code: 'gender',
    status: 1,
    remark: '性別',
  },
];

// System: Logs
export const mockLogs = [
  {
    id: 1,
    module: '認証',
    content: 'ユーザーログイン',
    requestUri: '/api/v1/auth/login',
    method: 'POST',
    ip: '127.0.0.1',
    executionTime: 150,
    createTime: '2026-05-29T09:00:00',
    operator: 'admin',
  },
  {
    id: 2,
    module: '商品',
    content: '商品一覧取得',
    requestUri: '/api/v1/retail/products/page',
    method: 'GET',
    ip: '127.0.0.1',
    executionTime: 50,
    createTime: '2026-05-29T09:05:00',
    operator: 'admin',
  },
];

/**
 * Helper to wrap response in API format
 */
function apiResponse<T>(data: T) {
  return HttpResponse.json({
    code: '00000',
    msg: 'success',
    data,
  });
}

/**
 * MSW handlers for backend API mocking
 */
export const handlers = [
  // Auth: Login
  http.post(`${BACKEND_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      password: string;
    };
    const user = Object.values(mockUsers).find(
      (u) => u.username === body.username && u.password === body.password
    );

    if (!user) {
      return HttpResponse.json(
        { code: 'A0001', msg: 'Invalid credentials', data: null },
        { status: 401 }
      );
    }

    return apiResponse({
      accessToken: `mock_token_${user.username}_${Date.now()}`,
      refreshToken: `mock_refresh_${user.username}`,
      tokenType: 'Bearer',
      expiresIn: 3600,
    });
  }),

  // Auth: Get current user
  http.get(`${BACKEND_URL}/users/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer mock_token_')) {
      return HttpResponse.json(
        { code: 'A0002', msg: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    // Extract username from token
    const match = authHeader.match(/mock_token_(\w+)_/);
    const username = match?.[1] || 'admin';
    const user =
      mockUsers[username as keyof typeof mockUsers] || mockUsers.admin;

    return apiResponse({
      userId: user.userId,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      roles: user.roles,
      perms: user.perms,
    });
  }),

  // Auth: Refresh token
  http.post(`${BACKEND_URL}/auth/refresh`, () => {
    return apiResponse({
      accessToken: `mock_token_admin_${Date.now()}`,
      refreshToken: `mock_refresh_admin`,
      tokenType: 'Bearer',
      expiresIn: 3600,
    });
  }),

  // Dashboard: Stats
  http.get(`${BACKEND_URL}/retail/dashboard/stats`, () => {
    return apiResponse(mockDashboardStats);
  }),

  // Products: List with pagination
  http.get(`${BACKEND_URL}/retail/products/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const productName = url.searchParams.get('productName') || '';

    let filtered = [...mockProducts];
    if (productName) {
      filtered = filtered.filter((p) =>
        p.productName.toLowerCase().includes(productName.toLowerCase())
      );
    }

    const start = (pageNum - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);

    return apiResponse({ list, total: filtered.length });
  }),

  // Products: Get by ID
  http.get(`${BACKEND_URL}/retail/products/:id`, ({ params }) => {
    const id = Number(params.id);
    const product = mockProducts.find((p) => p.id === id);
    if (!product) {
      return HttpResponse.json(
        { code: 'B0001', msg: 'Product not found', data: null },
        { status: 404 }
      );
    }
    return apiResponse(product);
  }),

  // Products: Create
  http.post(`${BACKEND_URL}/retail/products`, async ({ request }) => {
    const body = await request.json();
    const newProduct = {
      id: mockProducts.length + 1,
      ...body,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };
    return apiResponse(newProduct);
  }),

  // Products: Update
  http.put(
    `${BACKEND_URL}/retail/products/:id`,
    async ({ params, request }) => {
      const id = Number(params.id);
      const body = await request.json();
      const product = mockProducts.find((p) => p.id === id);
      if (!product) {
        return HttpResponse.json(
          { code: 'B0001', msg: 'Product not found', data: null },
          { status: 404 }
        );
      }
      return apiResponse({
        ...product,
        ...body,
        updateTime: new Date().toISOString(),
      });
    }
  ),

  // Products: Delete
  http.delete(`${BACKEND_URL}/retail/products/:id`, ({ params }) => {
    const id = Number(params.id);
    const product = mockProducts.find((p) => p.id === id);
    if (!product) {
      return HttpResponse.json(
        { code: 'B0001', msg: 'Product not found', data: null },
        { status: 404 }
      );
    }
    return apiResponse(null);
  }),

  // Alerts: List
  http.get(`${BACKEND_URL}/retail/alerts`, () => {
    return apiResponse(mockAlerts);
  }),

  // Stores: List with pagination
  http.get(`${BACKEND_URL}/retail/stores/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockStores.slice(start, start + pageSize);

    return apiResponse({ list, total: mockStores.length });
  }),

  // Stores: List all (for select boxes)
  http.get(`${BACKEND_URL}/retail/stores/list`, () => {
    return apiResponse(mockStores);
  }),

  // Devices: List with pagination
  http.get(`${BACKEND_URL}/retail/devices/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockDevices.slice(start, start + pageSize);

    return apiResponse({ list, total: mockDevices.length });
  }),

  // Inventory: List with pagination
  http.get(`${BACKEND_URL}/retail/inventory/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockInventory.slice(start, start + pageSize);

    return apiResponse({ list, total: mockInventory.length });
  }),

  // Transactions: List with pagination
  http.get(`${BACKEND_URL}/retail/transactions/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 20;

    const start = (pageNum - 1) * pageSize;
    const list = mockTransactions.slice(start, start + pageSize);

    return apiResponse({ list, total: mockTransactions.length });
  }),

  // WebSocket ticket
  http.post(`${BACKEND_URL}/ws/ticket`, () => {
    return apiResponse({
      ticket: `mock_ws_ticket_${Date.now()}`,
      expiresIn: 30,
    });
  }),

  // System: Users list
  http.get(`${BACKEND_URL}/users`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockSystemUsers.slice(start, start + pageSize);

    return apiResponse({ list, total: mockSystemUsers.length });
  }),

  // System: Users page (alias)
  http.get(`${BACKEND_URL}/users/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockSystemUsers.slice(start, start + pageSize);

    return apiResponse({ list, total: mockSystemUsers.length });
  }),

  // System: Roles list
  http.get(`${BACKEND_URL}/roles`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockRoles.slice(start, start + pageSize);

    return apiResponse({ list, total: mockRoles.length });
  }),

  // System: Roles page (alias)
  http.get(`${BACKEND_URL}/roles/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockRoles.slice(start, start + pageSize);

    return apiResponse({ list, total: mockRoles.length });
  }),

  // System: Departments
  http.get(`${BACKEND_URL}/depts`, () => {
    return apiResponse(mockDepts);
  }),

  // System: Menus
  http.get(`${BACKEND_URL}/menus`, () => {
    return apiResponse(mockMenus);
  }),

  // System: Menu options
  http.get(`${BACKEND_URL}/menus/options`, () => {
    return apiResponse(mockMenus);
  }),

  // System: Dictionaries
  http.get(`${BACKEND_URL}/dicts`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockDicts.slice(start, start + pageSize);

    return apiResponse({ list, total: mockDicts.length });
  }),

  // System: Dictionaries page (alias)
  http.get(`${BACKEND_URL}/dicts/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockDicts.slice(start, start + pageSize);

    return apiResponse({ list, total: mockDicts.length });
  }),

  // System: Logs
  http.get(`${BACKEND_URL}/logs`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockLogs.slice(start, start + pageSize);

    return apiResponse({ list, total: mockLogs.length });
  }),

  // System: Logs page (alias)
  http.get(`${BACKEND_URL}/logs/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockLogs.slice(start, start + pageSize);

    return apiResponse({ list, total: mockLogs.length });
  }),

  // Captcha
  http.get(`${BACKEND_URL}/auth/captcha`, () => {
    return apiResponse({
      captchaId: `mock_captcha_${Date.now()}`,
      captchaBase64:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzMzMyI+QTFCMjwvdGV4dD48L3N2Zz4=',
    });
  }),
];
