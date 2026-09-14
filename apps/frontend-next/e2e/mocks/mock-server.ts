import { createServer } from 'http';
import {
  mockUsers,
  mockProducts,
  mockCategories,
  mockDashboardStats,
  mockDashboardKpi,
  mockDashboardAlerts,
  mockDashboardSales,
  mockAlerts,
  mockAlertMonitoring,
  mockStores,
  mockDevices,
  mockInventory,
  mockTransactions,
  mockSystemUsers,
  mockRoles,
  mockDepts,
  mockMenus,
  mockDicts,
  mockDictItems,
  mockLogs,
} from './handlers';

const PORT = Number(process.env.MOCK_PORT || process.env.PORT || 8091);

/**
 * Helper to wrap response in API format
 */
function apiResponse<T>(data: T) {
  return JSON.stringify({
    code: '00000',
    msg: 'success',
    data,
  });
}

function errorResponse(code: string, msg: string, status: number) {
  return {
    body: JSON.stringify({ code, msg, data: null }),
    status,
  };
}

/**
 * Simple mock API server for E2E testing
 */
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const path = url.pathname.replace('/api/v1', '');
  const method = req.method || 'GET';

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse body for POST/PUT
  let body: Record<string, unknown> = {};
  if (method === 'POST' || method === 'PUT') {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    try {
      body = JSON.parse(Buffer.concat(chunks).toString());
    } catch {
      body = {};
    }
  }

  // Auth header check helper
  const authHeader = req.headers.authorization || '';
  const isAuthenticated = authHeader.startsWith('Bearer mock_token_');

  try {
    // Health check (no /api/v1 prefix required)
    if (path === '/health' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'UP' }));
      return;
    }

    // Routes

    // Auth: Captcha (GET)
    if (path === '/auth/captcha' && method === 'GET') {
      res.writeHead(200);
      res.end(
        apiResponse({
          captchaId: 'mock_captcha_id_' + Date.now(),
          captchaBase64:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        })
      );
      return;
    }

    if (path === '/auth/login' && method === 'POST') {
      const { username, password } = body as {
        username: string;
        password: string;
      };
      const user = Object.values(mockUsers).find(
        (u) =>
          u.username === username &&
          (u.password === password ||
            (u.username === 'admin' && (password === '123456' || password === 'password')))
      );

      if (!user) {
        res.writeHead(401);
        res.end(
          JSON.stringify({
            code: 'A0001',
            msg: 'Invalid credentials',
            data: null,
          })
        );
        return;
      }

      res.writeHead(200);
      res.end(
        apiResponse({
          accessToken: `mock_token_${user.username}_${Date.now()}`,
          refreshToken: `mock_refresh_${user.username}`,
          tokenType: 'Bearer',
          expiresIn: 3600,
        })
      );
      return;
    }

    if (path === '/users/me' && method === 'GET') {
      if (!isAuthenticated) {
        res.writeHead(401);
        res.end(JSON.stringify({ code: 'A0002', msg: 'Unauthorized', data: null }));
        return;
      }

      const match = authHeader.match(/mock_token_(\w+)_/);
      const username = match?.[1] || 'admin';
      const user = mockUsers[username as keyof typeof mockUsers] || mockUsers.admin;

      res.writeHead(200);
      res.end(
        apiResponse({
          userId: user.userId,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          roles: user.roles,
          perms: user.perms,
        })
      );
      return;
    }

    if (path === '/auth/refresh' && method === 'POST') {
      res.writeHead(200);
      res.end(
        apiResponse({
          accessToken: `mock_token_admin_${Date.now()}`,
          refreshToken: `mock_refresh_admin`,
          tokenType: 'Bearer',
          expiresIn: 3600,
        })
      );
      return;
    }

    // Auth: Refresh Token (backend endpoint format)
    if (path === '/auth/refresh-token' && method === 'POST') {
      const refreshToken = url.searchParams.get('refreshToken');
      if (!refreshToken || !refreshToken.startsWith('mock_refresh_')) {
        res.writeHead(401);
        res.end(
          JSON.stringify({
            code: 'A0003',
            msg: 'Invalid refresh token',
            data: null,
          })
        );
        return;
      }
      res.writeHead(200);
      res.end(
        apiResponse({
          accessToken: `mock_token_admin_${Date.now()}`,
          refreshToken: `mock_refresh_admin`,
          tokenType: 'Bearer',
          expiresIn: 3600,
        })
      );
      return;
    }

    if (path === '/retail/dashboard/stats' && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse(mockDashboardStats));
      return;
    }

    if (path === '/retail/dashboard/kpi' && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse(mockDashboardKpi));
      return;
    }

    if (path === '/retail/dashboard/alerts' && method === 'GET') {
      const limit = Number(url.searchParams.get('limit')) || mockDashboardAlerts.length;
      res.writeHead(200);
      res.end(apiResponse(mockDashboardAlerts.slice(0, limit)));
      return;
    }

    if (path === '/retail/dashboard/sales' && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse(mockDashboardSales));
      return;
    }

    if (path === '/retail/products' && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse(mockProducts));
      return;
    }

    if (path === '/retail/products/page' && method === 'GET') {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;
      const productName = url.searchParams.get('productName') || '';
      const categoryId = url.searchParams.get('categoryId') || '';

      let filtered = [...mockProducts];
      if (productName) {
        filtered = filtered.filter((p) =>
          p.productName.toLowerCase().includes(productName.toLowerCase())
        );
      }
      if (categoryId) {
        filtered = filtered.filter((p) => String(p.categoryId) === categoryId);
      }

      const start = (pageNum - 1) * pageSize;
      const list = filtered.slice(start, start + pageSize);

      res.writeHead(200);
      res.end(apiResponse({ list, total: filtered.length }));
      return;
    }

    const productMatch = path.match(/^\/retail\/products\/(\d+)$/);
    if (productMatch) {
      const id = Number(productMatch[1]);
      const product = mockProducts.find((p) => p.id === id);

      if (method === 'GET') {
        if (!product) {
          res.writeHead(404);
          res.end(
            JSON.stringify({
              code: 'B0001',
              msg: 'Product not found',
              data: null,
            })
          );
          return;
        }
        res.writeHead(200);
        res.end(apiResponse(product));
        return;
      }

      if (method === 'PUT') {
        if (!product) {
          res.writeHead(404);
          res.end(
            JSON.stringify({
              code: 'B0001',
              msg: 'Product not found',
              data: null,
            })
          );
          return;
        }
        res.writeHead(200);
        res.end(
          apiResponse({
            ...product,
            ...body,
            updateTime: new Date().toISOString(),
          })
        );
        return;
      }

      if (method === 'DELETE') {
        if (!product) {
          res.writeHead(404);
          res.end(
            JSON.stringify({
              code: 'B0001',
              msg: 'Product not found',
              data: null,
            })
          );
          return;
        }
        res.writeHead(200);
        res.end(apiResponse(null));
        return;
      }
    }

    if (path === '/retail/products' && method === 'POST') {
      const newProduct = {
        id: mockProducts.length + 1,
        ...body,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      };
      res.writeHead(200);
      res.end(apiResponse(newProduct));
      return;
    }

    if (path === '/retail/alerts' && method === 'GET') {
      let filtered = [...mockAlerts];
      const status = url.searchParams.get('status') || '';
      const priority = url.searchParams.get('priority') || '';
      const category = url.searchParams.get('category') || '';
      const storeId = url.searchParams.get('storeId') || '';
      if (status) {
        // Backend status values are NEW/ACK/RESOLVED; mockAlerts uses frontend values.
        // Simple equality fallback for tests.
        filtered = filtered.filter((a) => a.status === status || a.status === 'unread');
      }
      if (priority) {
        filtered = filtered.filter((a) => String(a.priority) === priority.replace('P', ''));
      }
      if (category) {
        filtered = filtered.filter((a) => a.category === category);
      }
      if (storeId) {
        filtered = filtered.filter((a) => String(a.storeId) === storeId);
      }
      res.writeHead(200);
      res.end(apiResponse(filtered));
      return;
    }

    if (path === '/retail/alerts/monitoring' && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse(mockAlertMonitoring));
      return;
    }

    // Stores: List all (no pagination params)
    if (path === '/retail/stores' && method === 'GET' && !url.searchParams.has('pageNum')) {
      const storeName = url.searchParams.get('storeName') || '';
      const address = url.searchParams.get('address') || '';
      const status = url.searchParams.get('status') || '';

      let filtered = [...mockStores];
      if (storeName) {
        filtered = filtered.filter((s) =>
          s.storeName.toLowerCase().includes(storeName.toLowerCase())
        );
      }
      if (address) {
        filtered = filtered.filter(
          (s) => s.address && s.address.toLowerCase().includes(address.toLowerCase())
        );
      }
      if (status) {
        filtered = filtered.filter((s) => s.status === status);
      }

      res.writeHead(200);
      res.end(apiResponse(filtered));
      return;
    }

    // Stores: List with pagination
    if ((path === '/retail/stores' || path === '/retail/stores/page') && method === 'GET') {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;
      const storeName = url.searchParams.get('storeName') || '';
      const address = url.searchParams.get('address') || '';
      const status = url.searchParams.get('status') || '';

      let filtered = [...mockStores];
      if (storeName) {
        filtered = filtered.filter((s) =>
          s.storeName.toLowerCase().includes(storeName.toLowerCase())
        );
      }
      if (address) {
        filtered = filtered.filter(
          (s) => s.address && s.address.toLowerCase().includes(address.toLowerCase())
        );
      }
      if (status) {
        filtered = filtered.filter((s) => s.status === status);
      }

      const start = (pageNum - 1) * pageSize;
      const list = filtered.slice(start, start + pageSize);

      res.writeHead(200);
      res.end(apiResponse({ list, total: filtered.length }));
      return;
    }

    // Stores: Create
    if (path === '/retail/stores' && method === 'POST') {
      const newStore = {
        id: mockStores.length + 1,
        ...body,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      };
      res.writeHead(200);
      res.end(apiResponse(newStore));
      return;
    }

    // Stores: Single store by ID
    const storeMatch = path.match(/^\/retail\/stores\/(\d+)$/);
    if (storeMatch) {
      const id = Number(storeMatch[1]);
      const store = mockStores.find((s) => s.id === id);

      if (method === 'GET') {
        if (!store) {
          res.writeHead(404);
          res.end(
            JSON.stringify({
              code: 'B0001',
              msg: 'Store not found',
              data: null,
            })
          );
          return;
        }
        res.writeHead(200);
        res.end(apiResponse(store));
        return;
      }

      if (method === 'PUT') {
        if (!store) {
          res.writeHead(404);
          res.end(
            JSON.stringify({
              code: 'B0001',
              msg: 'Store not found',
              data: null,
            })
          );
          return;
        }
        res.writeHead(200);
        res.end(
          apiResponse({
            ...store,
            ...body,
            updateTime: new Date().toISOString(),
          })
        );
        return;
      }

      if (method === 'DELETE') {
        if (!store) {
          res.writeHead(404);
          res.end(
            JSON.stringify({
              code: 'B0001',
              msg: 'Store not found',
              data: null,
            })
          );
          return;
        }
        res.writeHead(200);
        res.end(apiResponse(null));
        return;
      }
    }

    // Devices (supports both /retail/devices and /retail/devices/page)
    if ((path === '/retail/devices' || path === '/retail/devices/page') && method === 'GET') {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;
      const deviceName = url.searchParams.get('deviceName') || '';
      const storeId = url.searchParams.get('storeId') || '';
      const deviceType = url.searchParams.get('deviceType') || '';
      const status = url.searchParams.get('status') || '';

      let filtered = [...mockDevices];
      if (deviceName) {
        filtered = filtered.filter((d) =>
          d.deviceName.toLowerCase().includes(deviceName.toLowerCase())
        );
      }
      if (storeId) {
        filtered = filtered.filter((d) => String(d.storeId) === storeId);
      }
      if (deviceType) {
        filtered = filtered.filter((d) => d.deviceType === deviceType);
      }
      if (status) {
        filtered = filtered.filter((d) => d.status === status);
      }

      const start = (pageNum - 1) * pageSize;
      const list = filtered.slice(start, start + pageSize);

      res.writeHead(200);
      res.end(apiResponse({ list, total: filtered.length }));
      return;
    }

    // Devices: Create
    if (path === '/retail/devices' && method === 'POST') {
      const newDevice = {
        id: mockDevices.length + 1,
        ...body,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      };
      res.writeHead(200);
      res.end(apiResponse(newDevice));
      return;
    }

    // Devices: Single device by ID
    const deviceMatch = path.match(/^\/retail\/devices\/(\d+)$/);
    if (deviceMatch) {
      const id = Number(deviceMatch[1]);
      const device = mockDevices.find((d) => d.id === id);

      if (method === 'GET') {
        if (!device) {
          res.writeHead(404);
          res.end(
            JSON.stringify({
              code: 'B0001',
              msg: 'Device not found',
              data: null,
            })
          );
          return;
        }
        res.writeHead(200);
        res.end(apiResponse(device));
        return;
      }

      if (method === 'PUT') {
        if (!device) {
          res.writeHead(404);
          res.end(
            JSON.stringify({
              code: 'B0001',
              msg: 'Device not found',
              data: null,
            })
          );
          return;
        }
        res.writeHead(200);
        res.end(
          apiResponse({
            ...device,
            ...body,
            updateTime: new Date().toISOString(),
          })
        );
        return;
      }

      if (method === 'DELETE') {
        if (!device) {
          res.writeHead(404);
          res.end(
            JSON.stringify({
              code: 'B0001',
              msg: 'Device not found',
              data: null,
            })
          );
          return;
        }
        res.writeHead(200);
        res.end(apiResponse(null));
        return;
      }
    }

    // Inventory: List with pagination
    // 実Backend（InventoryController.java）は storeId/productId のみ受領し productName/status はフィルタしない。
    // フロントエンド（aggregateInventoryItems）の防衛的クライアントフィルタの動作を検証するため、
    // mock-server でも実Backendと同様に storeId のみフィルタして全件を返す。
    if ((path === '/retail/inventories' || path === '/retail/inventory/page') && method === 'GET') {
      const storeId = url.searchParams.get('storeId') || '';

      let filtered = [...mockInventory];
      if (storeId) {
        filtered = filtered.filter((i) => String(i.storeId) === storeId);
      }

      res.writeHead(200);
      res.end(apiResponse(filtered));
      return;
    }

    // Inventory: Single item by ID
    const inventoryMatch = path.match(/^\/retail\/inventories\/(\d+)$/);
    if (inventoryMatch) {
      const id = Number(inventoryMatch[1]);
      const inventory = mockInventory.find((i) => i.id === id);

      if (method === 'GET') {
        if (!inventory) {
          res.writeHead(404);
          res.end(JSON.stringify({ code: 'B0001', msg: 'Inventory not found', data: null }));
          return;
        }
        res.writeHead(200);
        res.end(apiResponse(inventory));
        return;
      }

      if (method === 'PUT') {
        if (!inventory) {
          res.writeHead(404);
          res.end(JSON.stringify({ code: 'B0001', msg: 'Inventory not found', data: null }));
          return;
        }
        res.writeHead(200);
        res.end(apiResponse({ ...inventory, ...body, updateTime: new Date().toISOString() }));
        return;
      }

      if (method === 'DELETE') {
        if (!inventory) {
          res.writeHead(404);
          res.end(JSON.stringify({ code: 'B0001', msg: 'Inventory not found', data: null }));
          return;
        }
        res.writeHead(200);
        res.end(apiResponse(null));
        return;
      }
    }

    // Inventory transactions: history list
    if (path === '/retail/inventory-transactions' && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse([]));
      return;
    }

    // Inventory transactions: page
    if (path === '/retail/inventory-transactions/page' && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse({ list: [], total: 0 }));
      return;
    }

    // Inventory transactions: inbound page
    if (path === '/retail/inventory-transactions/inbound/page' && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse({ list: [], total: 0 }));
      return;
    }

    // Inventory transactions: inbound (replenish)
    if (path === '/retail/inventory-transactions/inbound' && method === 'POST') {
      res.writeHead(200);
      res.end(apiResponse(null));
      return;
    }

    // Inventory transactions: outbound page
    if (path === '/retail/inventory-transactions/outbound/page' && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse({ list: [], total: 0 }));
      return;
    }

    // Inventory transactions: outbound (dispose)
    if (path === '/retail/inventory-transactions/outbound' && method === 'POST') {
      res.writeHead(200);
      res.end(apiResponse(null));
      return;
    }

    // Inventory transactions: update
    const inventoryTransactionMatch = path.match(/^\/retail\/inventory-transactions\/(\d+)$/);
    if (inventoryTransactionMatch && (method === 'PUT' || method === 'GET')) {
      res.writeHead(200);
      res.end(apiResponse({ id: Number(inventoryTransactionMatch[1]), ...body }));
      return;
    }

    // Transactions/Sales: List all
    if (path === '/retail/sales' && method === 'GET' && !url.searchParams.has('pageNum')) {
      const storeId = url.searchParams.get('storeId') || '';
      let filtered = [...mockTransactions];
      if (storeId) {
        filtered = filtered.filter((t) => String(t.storeId) === storeId);
      }
      res.writeHead(200);
      res.end(apiResponse(filtered));
      return;
    }

    // Transactions/Sales (supports both /retail/sales and /retail/transactions/page)
    if ((path === '/retail/sales' || path === '/retail/transactions/page') && method === 'GET') {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 20;
      const orderNumber = url.searchParams.get('orderNumber') || '';
      const storeId = url.searchParams.get('storeId') || '';
      const paymentMethod = url.searchParams.get('paymentMethod') || '';

      let filtered = [...mockTransactions];
      if (orderNumber) {
        filtered = filtered.filter((t) =>
          t.orderNumber.toLowerCase().includes(orderNumber.toLowerCase())
        );
      }
      if (storeId) {
        filtered = filtered.filter((t) => String(t.storeId) === storeId);
      }
      if (paymentMethod) {
        filtered = filtered.filter((t) => t.paymentMethod === paymentMethod);
      }

      const start = (pageNum - 1) * pageSize;
      const list = filtered.slice(start, start + pageSize);

      res.writeHead(200);
      res.end(apiResponse({ list, total: filtered.length }));
      return;
    }

    // Sales: Create
    if (path === '/retail/sales' && method === 'POST') {
      const newSale = {
        id: mockTransactions.length + 1,
        ...body,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      };
      res.writeHead(200);
      res.end(apiResponse(newSale));
      return;
    }

    // Categories: List all
    if (path === '/retail/categories' && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse(mockCategories));
      return;
    }

    // Categories: Create
    if (path === '/retail/categories' && method === 'POST') {
      const newCategory = {
        id: mockCategories.length + 1,
        ...body,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      };
      res.writeHead(200);
      res.end(apiResponse(newCategory));
      return;
    }

    // Categories: Single item by ID / Update / Delete
    const categoryMatch = path.match(/^\/retail\/categories\/(\d+)$/);
    if (categoryMatch) {
      const id = Number(categoryMatch[1]);
      const category = mockCategories.find((c) => c.id === id);

      if (method === 'GET') {
        if (!category) {
          res.writeHead(404);
          res.end(JSON.stringify({ code: 'B0001', msg: 'Category not found', data: null }));
          return;
        }
        res.writeHead(200);
        res.end(apiResponse(category));
        return;
      }

      if (method === 'PUT') {
        if (!category) {
          res.writeHead(404);
          res.end(JSON.stringify({ code: 'B0001', msg: 'Category not found', data: null }));
          return;
        }
        res.writeHead(200);
        res.end(apiResponse({ ...category, ...body, updateTime: new Date().toISOString() }));
        return;
      }

      if (method === 'DELETE') {
        if (!category) {
          res.writeHead(404);
          res.end(JSON.stringify({ code: 'B0001', msg: 'Category not found', data: null }));
          return;
        }
        res.writeHead(200);
        res.end(apiResponse(null));
        return;
      }
    }

    // Payments: Receive
    if (path === '/retail/payments' && method === 'POST') {
      res.writeHead(200);
      res.end(apiResponse(mockTransactions.length + 1000));
      return;
    }

    // Heartbeat: Simple
    if (path === '/retail/heartbeat' && method === 'POST') {
      res.writeHead(200);
      res.end(apiResponse(null));
      return;
    }

    // Heartbeat: Store
    if (path === '/retail/heartbeat/store' && method === 'POST') {
      res.writeHead(200);
      res.end(apiResponse(null));
      return;
    }

    // AI Alerts Priority
    if (path === '/retail/ai/alerts/priority' && method === 'POST') {
      res.writeHead(200);
      res.end(
        apiResponse({
          prioritizedAlertIds: mockAlerts.map((a) => a.id),
          summary: '在庫関連のアラートが優先度順に整理されています',
          recommendedActions: ['在庫補充を確認', '期限切れ間近商品を優先'],
          generatedAt: new Date().toISOString(),
        })
      );
      return;
    }

    if (path === '/ws/ticket' && method === 'POST') {
      res.writeHead(200);
      res.end(
        apiResponse({
          ticket: `mock_ws_ticket_${Date.now()}`,
          expiresIn: 30,
        })
      );
      return;
    }

    // System: Users
    if ((path === '/users' || path === '/users/page') && method === 'GET') {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;
      const keywords = url.searchParams.get('keywords') || '';
      const status = url.searchParams.get('status') || '';

      let filtered = [...mockSystemUsers];
      if (keywords) {
        const kw = keywords.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.username.toLowerCase().includes(kw) ||
            u.nickname.toLowerCase().includes(kw) ||
            (u.mobile && u.mobile.toLowerCase().includes(kw))
        );
      }
      if (status) {
        const s = parseInt(status, 10);
        filtered = filtered.filter((u) => u.status === s);
      }

      const start = (pageNum - 1) * pageSize;
      const list = filtered.slice(start, start + pageSize);
      res.writeHead(200);
      res.end(apiResponse({ list, total: filtered.length }));
      return;
    }

    // System: User by ID
    const userMatch = path.match(/^\/users\/(\d+)$/);
    if (userMatch) {
      const id = Number(userMatch[1]);
      const user = mockSystemUsers.find((u) => u.id === id);
      if (!user) {
        res.writeHead(404);
        res.end(JSON.stringify({ code: 'B0001', msg: 'User not found', data: null }));
        return;
      }
      if (method === 'GET' || method === 'PUT') {
        res.writeHead(200);
        res.end(apiResponse({ ...user, ...body, updateTime: new Date().toISOString() }));
        return;
      }
    }

    if (path === '/users' && (method === 'POST' || method === 'DELETE')) {
      res.writeHead(200);
      res.end(apiResponse(null));
      return;
    }

    const userPasswordMatch = path.match(/^\/users\/(\d+)\/password$/);
    if (userPasswordMatch && method === 'PATCH') {
      res.writeHead(200);
      res.end(apiResponse(null));
      return;
    }

    // System: Roles
    if ((path === '/roles' || path === '/roles/page') && method === 'GET') {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;
      const keywords = url.searchParams.get('keywords') || '';
      const status = url.searchParams.get('status') || '';

      let filtered = [...mockRoles];
      if (keywords) {
        const kw = keywords.toLowerCase();
        filtered = filtered.filter(
          (r) => r.name.toLowerCase().includes(kw) || r.code.toLowerCase().includes(kw)
        );
      }
      if (status) {
        const s = parseInt(status, 10);
        filtered = filtered.filter((r) => r.status === s);
      }

      const start = (pageNum - 1) * pageSize;
      const list = filtered.slice(start, start + pageSize);
      res.writeHead(200);
      res.end(apiResponse({ list, total: filtered.length }));
      return;
    }

    // System: Role options (for select dropdowns)
    if (path === '/roles/options' && method === 'GET') {
      const options = mockRoles.map((role) => ({
        value: role.id,
        label: role.name,
      }));
      res.writeHead(200);
      res.end(apiResponse(options));
      return;
    }

    // System: Role form
    const roleFormMatch = path.match(/^\/roles\/(\d+)\/form$/);
    if (roleFormMatch && method === 'GET') {
      const id = Number(roleFormMatch[1]);
      const role = mockRoles.find((r) => r.id === id);
      if (!role) {
        res.writeHead(404);
        res.end(JSON.stringify({ code: 'B0001', msg: 'Role not found', data: null }));
        return;
      }
      res.writeHead(200);
      res.end(apiResponse(role));
      return;
    }

    // System: Role menu ids
    const roleMenuIdsMatch = path.match(/^\/roles\/(\d+)\/menu-ids$/);
    if (roleMenuIdsMatch && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse([1, 2]));
      return;
    }

    // System: Role menus
    const roleMenusMatch = path.match(/^\/roles\/(\d+)\/menus$/);
    if (roleMenusMatch && method === 'PUT') {
      res.writeHead(200);
      res.end(apiResponse(null));
      return;
    }

    // System: Role CRUD
    const roleMatch = path.match(/^\/roles\/(\d+)$/);
    if (roleMatch) {
      const id = Number(roleMatch[1]);
      const role = mockRoles.find((r) => r.id === id);
      if (!role) {
        res.writeHead(404);
        res.end(JSON.stringify({ code: 'B0001', msg: 'Role not found', data: null }));
        return;
      }
      if (method === 'GET' || method === 'PUT') {
        res.writeHead(200);
        res.end(apiResponse({ ...role, ...body, updateTime: new Date().toISOString() }));
        return;
      }
      if (method === 'DELETE') {
        res.writeHead(200);
        res.end(apiResponse(null));
        return;
      }
    }

    if (path === '/roles' && method === 'POST') {
      const newRole = {
        id: mockRoles.length + 1,
        ...body,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      };
      res.writeHead(200);
      res.end(apiResponse(newRole));
      return;
    }

    // System: Menus
    if (path === '/menus' && method === 'GET') {
      const keywords = url.searchParams.get('keywords') || '';
      const visible = url.searchParams.get('visible') || '';
      let filtered = [...mockMenus];
      if (keywords) {
        const kw = keywords.toLowerCase();
        filtered = filtered.filter((m) => m.name.toLowerCase().includes(kw));
      }
      if (visible) {
        const v = parseInt(visible, 10);
        filtered = filtered.filter((m) => m.visible === v);
      }
      res.writeHead(200);
      res.end(apiResponse(filtered));
      return;
    }

    if (path === '/menus/options' && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse(mockMenus));
      return;
    }

    // System: Menu form
    const menuFormMatch = path.match(/^\/menus\/(\d+)\/form$/);
    if (menuFormMatch && method === 'GET') {
      const id = Number(menuFormMatch[1]);
      const menu = mockMenus.find((m) => m.id === id);
      if (!menu) {
        res.writeHead(404);
        res.end(JSON.stringify({ code: 'B0001', msg: 'Menu not found', data: null }));
        return;
      }
      res.writeHead(200);
      res.end(apiResponse(menu));
      return;
    }

    // System: Menu CRUD
    const menuMatch = path.match(/^\/menus\/(\d+)$/);
    if (menuMatch) {
      const id = Number(menuMatch[1]);
      const menu = mockMenus.find((m) => m.id === id);
      if (!menu) {
        res.writeHead(404);
        res.end(JSON.stringify({ code: 'B0001', msg: 'Menu not found', data: null }));
        return;
      }
      if (method === 'GET' || method === 'PUT') {
        res.writeHead(200);
        res.end(apiResponse({ ...menu, ...body, updateTime: new Date().toISOString() }));
        return;
      }
      if (method === 'DELETE') {
        res.writeHead(200);
        res.end(apiResponse(null));
        return;
      }
    }

    if (path === '/menus' && method === 'POST') {
      const newMenu = {
        id: mockMenus.length + 1,
        ...body,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      };
      res.writeHead(200);
      res.end(apiResponse(newMenu));
      return;
    }

    // System: Departments
    if (path === '/depts' && method === 'GET') {
      const keywords = url.searchParams.get('keywords') || '';
      const status = url.searchParams.get('status') || '';

      const filterDepts = (depts: typeof mockDepts) => {
        return depts
          .map((d) => {
            const children = d.children ? filterDepts(d.children as typeof mockDepts) : [];
            const matchesKeyword = keywords
              ? d.name.toLowerCase().includes(keywords.toLowerCase())
              : true;
            const matchesStatus = status ? String(d.status) === status : true;
            if ((matchesKeyword && matchesStatus) || children.length > 0) {
              return { ...d, children };
            }
            return null;
          })
          .filter(Boolean);
      };

      res.writeHead(200);
      res.end(apiResponse(filterDepts(mockDepts)));
      return;
    }

    // System: Department options (for select dropdowns)
    if (path === '/depts/options' && method === 'GET') {
      const flattenDepts = (
        depts: typeof mockDepts,
        result: Array<{ value: number; label: string }> = []
      ) => {
        for (const dept of depts) {
          result.push({ value: dept.id, label: dept.name });
          if (dept.children && dept.children.length > 0) {
            flattenDepts(dept.children as typeof mockDepts, result);
          }
        }
        return result;
      };
      res.writeHead(200);
      res.end(apiResponse(flattenDepts(mockDepts)));
      return;
    }

    // System: Dept form
    const deptFormMatch = path.match(/^\/depts\/(\d+)\/form$/);
    if (deptFormMatch && method === 'GET') {
      const id = Number(deptFormMatch[1]);
      const findDept = (depts: typeof mockDepts): (typeof mockDepts)[0] | undefined => {
        for (const d of depts) {
          if (d.id === id) return d;
          if (d.children) {
            const found = findDept(d.children as typeof mockDepts);
            if (found) return found;
          }
        }
        return undefined;
      };
      const dept = findDept(mockDepts);
      if (!dept) {
        res.writeHead(404);
        res.end(JSON.stringify({ code: 'B0001', msg: 'Dept not found', data: null }));
        return;
      }
      res.writeHead(200);
      res.end(apiResponse(dept));
      return;
    }

    // System: Dept CRUD
    const deptMatch = path.match(/^\/depts\/(\d+)$/);
    if (deptMatch) {
      const id = Number(deptMatch[1]);
      const findDept = (depts: typeof mockDepts): (typeof mockDepts)[0] | undefined => {
        for (const d of depts) {
          if (d.id === id) return d;
          if (d.children) {
            const found = findDept(d.children as typeof mockDepts);
            if (found) return found;
          }
        }
        return undefined;
      };
      const dept = findDept(mockDepts);
      if (!dept) {
        res.writeHead(404);
        res.end(JSON.stringify({ code: 'B0001', msg: 'Dept not found', data: null }));
        return;
      }
      if (method === 'GET' || method === 'PUT') {
        res.writeHead(200);
        res.end(apiResponse({ ...dept, ...body, updateTime: new Date().toISOString() }));
        return;
      }
      if (method === 'DELETE') {
        res.writeHead(200);
        res.end(apiResponse(null));
        return;
      }
    }

    if (path === '/depts' && method === 'POST') {
      const newDept = {
        id: 10 + mockDepts.length,
        ...body,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      };
      res.writeHead(200);
      res.end(apiResponse(newDept));
      return;
    }

    // System: Dictionaries
    if ((path === '/dicts' || path === '/dicts/page') && method === 'GET') {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;
      const keywords = url.searchParams.get('keywords') || '';
      const status = url.searchParams.get('status') || '';

      let filtered = [...mockDicts];
      if (keywords) {
        const kw = keywords.toLowerCase();
        filtered = filtered.filter(
          (d) => d.name.toLowerCase().includes(kw) || d.code.toLowerCase().includes(kw)
        );
      }
      if (status) {
        const s = parseInt(status, 10);
        filtered = filtered.filter((d) => d.status === s);
      }

      const start = (pageNum - 1) * pageSize;
      const list = filtered.slice(start, start + pageSize);
      res.writeHead(200);
      res.end(apiResponse({ list, total: filtered.length }));
      return;
    }

    // System: Dict form
    const dictFormMatch = path.match(/^\/dicts\/(\d+)\/form$/);
    if (dictFormMatch && method === 'GET') {
      const id = Number(dictFormMatch[1]);
      const dict = mockDicts.find((d) => d.id === id);
      if (!dict) {
        res.writeHead(404);
        res.end(JSON.stringify({ code: 'B0001', msg: 'Dict not found', data: null }));
        return;
      }
      res.writeHead(200);
      res.end(apiResponse(dict));
      return;
    }

    // System: Dict CRUD
    const dictMatch = path.match(/^\/dicts\/(\d+)$/);
    if (dictMatch) {
      const id = Number(dictMatch[1]);
      const dict = mockDicts.find((d) => d.id === id);
      if (!dict) {
        res.writeHead(404);
        res.end(JSON.stringify({ code: 'B0001', msg: 'Dict not found', data: null }));
        return;
      }
      if (method === 'GET' || method === 'PUT') {
        res.writeHead(200);
        res.end(apiResponse({ ...dict, ...body, updateTime: new Date().toISOString() }));
        return;
      }
      if (method === 'DELETE') {
        res.writeHead(200);
        res.end(apiResponse(null));
        return;
      }
    }

    if (path === '/dicts' && method === 'POST') {
      const newDict = {
        id: mockDicts.length + 1,
        ...body,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      };
      res.writeHead(200);
      res.end(apiResponse(newDict));
      return;
    }

    // System: Dict Items Form
    const dictItemFormMatch = path.match(/^\/dicts\/([a-zA-Z0-9_-]+)\/items\/(\d+)\/form$/);
    if (dictItemFormMatch && method === 'GET') {
      const dictCode = dictItemFormMatch[1];
      const itemId = Number(dictItemFormMatch[2]);
      const item = mockDictItems.find((d) => d.dictCode === dictCode && d.id === itemId);
      if (!item) {
        res.writeHead(404);
        res.end(JSON.stringify({ code: 'B0001', msg: 'Dict item not found', data: null }));
        return;
      }
      res.writeHead(200);
      res.end(apiResponse(item));
      return;
    }

    // System: Dict Items Detail / Update / Delete
    const dictItemDetailMatch = path.match(/^\/dicts\/([a-zA-Z0-9_-]+)\/items\/([0-9,]+)$/);
    if (dictItemDetailMatch) {
      const dictCode = dictItemDetailMatch[1];
      const idsStr = dictItemDetailMatch[2];

      if (method === 'GET') {
        const itemId = Number(idsStr);
        const item = mockDictItems.find((d) => d.dictCode === dictCode && d.id === itemId);
        if (!item) {
          res.writeHead(404);
          res.end(JSON.stringify({ code: 'B0001', msg: 'Dict item not found', data: null }));
          return;
        }
        res.writeHead(200);
        res.end(apiResponse(item));
        return;
      }

      if (method === 'PUT') {
        const itemId = Number(idsStr);
        const item = mockDictItems.find((d) => d.dictCode === dictCode && d.id === itemId);
        if (item) {
          Object.assign(item, body);
        }
        res.writeHead(200);
        res.end(apiResponse(null));
        return;
      }

      if (method === 'DELETE') {
        const idList = idsStr.split(',').map(Number);
        const remaining = mockDictItems.filter(
          (d) => !(d.dictCode === dictCode && idList.includes(d.id))
        );
        mockDictItems.length = 0;
        mockDictItems.push(...remaining);
        res.writeHead(200);
        res.end(apiResponse(null));
        return;
      }
    }

    // System: Dict Items List / Create
    const dictItemsMatch = path.match(/^\/dicts\/([a-zA-Z0-9_-]+)\/items$/);
    if (dictItemsMatch) {
      const dictCode = dictItemsMatch[1];
      if (method === 'GET') {
        const pageNum = Number(url.searchParams.get('pageNum')) || 1;
        const pageSize = Number(url.searchParams.get('pageSize')) || 10;
        const keywords = url.searchParams.get('keywords') || '';

        let filtered = mockDictItems.filter((d) => d.dictCode === dictCode);
        if (keywords) {
          const kw = keywords.toLowerCase();
          filtered = filtered.filter(
            (d) => d.label.toLowerCase().includes(kw) || d.value.toLowerCase().includes(kw)
          );
        }
        const start = (pageNum - 1) * pageSize;
        const list = filtered.slice(start, start + pageSize);
        res.writeHead(200);
        res.end(apiResponse({ list, total: filtered.length }));
        return;
      }

      if (method === 'POST') {
        const dict = mockDicts.find(
          (d) => d.code === dictCode || (d as { dictCode?: string }).dictCode === dictCode
        );
        const newItem = {
          id: mockDictItems.length + 1,
          dictId: dict?.id || 1,
          dictCode,
          label: String(body.label || ''),
          value: String(body.value || ''),
          sort: Number(body.sort) || 1,
          status: Number(body.status) ?? 1,
          remark: body.remark ? String(body.remark) : undefined,
        };
        mockDictItems.push(newItem);
        res.writeHead(200);
        res.end(apiResponse(null));
        return;
      }
    }


    // System: Logs
    if ((path === '/logs' || path === '/logs/page') && method === 'GET') {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;
      const keywords = url.searchParams.get('keywords') || '';

      let filtered = [...mockLogs];
      if (keywords) {
        const kw = keywords.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.module.toLowerCase().includes(kw) ||
            l.content.toLowerCase().includes(kw) ||
            l.operator.toLowerCase().includes(kw)
        );
      }

      const start = (pageNum - 1) * pageSize;
      const list = filtered.slice(start, start + pageSize);
      res.writeHead(200);
      res.end(apiResponse({ list, total: filtered.length }));
      return;
    }

    // Not found
    res.writeHead(404);
    res.end(JSON.stringify({ code: 'B9999', msg: `Not found: ${path}`, data: null }));
  } catch (error) {
    process.stderr.write(
      `Mock server error: ${error instanceof Error ? error.message : String(error)}\n`
    );
    res.writeHead(500);
    res.end(
      JSON.stringify({
        code: 'E0001',
        msg: 'Internal server error',
        data: null,
      })
    );
  }
});

server.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}/api/v1`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Mock API server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});
