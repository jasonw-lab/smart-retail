import { http, HttpResponse } from 'msw';

const BACKEND_URL = 'http://localhost:8080/api/v1';

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
  user: {
    userId: 2,
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
    message: '商品「テスト商品1」の在庫が補充点を下回りました',
    productId: 1,
    productName: 'テスト商品1',
    severity: 'warning',
    read: false,
    createdAt: '2026-05-26T10:00:00',
  },
  {
    id: 'alert-2',
    type: 'EXPIRING',
    message: '商品「テスト商品2」の賞味期限が近づいています',
    productId: 2,
    productName: 'テスト商品2',
    severity: 'info',
    read: true,
    createdAt: '2026-05-25T15:30:00',
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
    const body = await request.json() as { username: string; password: string };
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
    const user = mockUsers[username as keyof typeof mockUsers] || mockUsers.admin;

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
  http.put(`${BACKEND_URL}/retail/products/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = await request.json();
    const product = mockProducts.find((p) => p.id === id);
    if (!product) {
      return HttpResponse.json(
        { code: 'B0001', msg: 'Product not found', data: null },
        { status: 404 }
      );
    }
    return apiResponse({ ...product, ...body, updateTime: new Date().toISOString() });
  }),

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

  // WebSocket ticket
  http.post(`${BACKEND_URL}/ws/ticket`, () => {
    return apiResponse({
      ticket: `mock_ws_ticket_${Date.now()}`,
      expiresIn: 30,
    });
  }),
];
