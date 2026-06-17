import { createServer } from 'http';
import {
  mockUsers,
  mockProducts,
  mockDashboardStats,
  mockAlerts,
  mockStores,
  mockDevices,
  mockInventory,
  mockTransactions,
  mockSystemUsers,
  mockRoles,
  mockDepts,
  mockMenus,
  mockDicts,
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
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
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
        (u) => u.username === username && u.password === password
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
        res.end(
          JSON.stringify({ code: 'A0002', msg: 'Unauthorized', data: null })
        );
        return;
      }

      const match = authHeader.match(/mock_token_(\w+)_/);
      const username = match?.[1] || 'admin';
      const user =
        mockUsers[username as keyof typeof mockUsers] || mockUsers.admin;

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

    if (path === '/retail/products/page' && method === 'GET') {
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
      res.writeHead(200);
      res.end(apiResponse(mockAlerts));
      return;
    }

    // Stores (supports both /retail/stores and /retail/stores/page)
    if (
      (path === '/retail/stores' || path === '/retail/stores/page') &&
      method === 'GET'
    ) {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;

      const start = (pageNum - 1) * pageSize;
      const list = mockStores.slice(start, start + pageSize);

      res.writeHead(200);
      res.end(apiResponse({ list, total: mockStores.length }));
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

    // Stores: List all (for select boxes)
    if (path === '/retail/stores/list' && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse(mockStores));
      return;
    }

    // Devices (supports both /retail/devices and /retail/devices/page)
    if (
      (path === '/retail/devices' || path === '/retail/devices/page') &&
      method === 'GET'
    ) {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;

      const start = (pageNum - 1) * pageSize;
      const list = mockDevices.slice(start, start + pageSize);

      res.writeHead(200);
      res.end(apiResponse({ list, total: mockDevices.length }));
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

    // Inventory (supports both /retail/inventories and /retail/inventory/page)
    if (
      (path === '/retail/inventories' || path === '/retail/inventory/page') &&
      method === 'GET'
    ) {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;

      const start = (pageNum - 1) * pageSize;
      const list = mockInventory.slice(start, start + pageSize);

      res.writeHead(200);
      res.end(apiResponse({ list, total: mockInventory.length }));
      return;
    }

    // Transactions/Sales (supports both /retail/sales and /retail/transactions/page)
    if (
      (path === '/retail/sales' || path === '/retail/transactions/page') &&
      method === 'GET'
    ) {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 20;

      const start = (pageNum - 1) * pageSize;
      const list = mockTransactions.slice(start, start + pageSize);

      res.writeHead(200);
      res.end(apiResponse({ list, total: mockTransactions.length }));
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

      const start = (pageNum - 1) * pageSize;
      const list = mockSystemUsers.slice(start, start + pageSize);

      res.writeHead(200);
      res.end(apiResponse({ list, total: mockSystemUsers.length }));
      return;
    }

    // System: Roles
    if ((path === '/roles' || path === '/roles/page') && method === 'GET') {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;

      const start = (pageNum - 1) * pageSize;
      const list = mockRoles.slice(start, start + pageSize);

      res.writeHead(200);
      res.end(apiResponse({ list, total: mockRoles.length }));
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

    // System: Departments
    if (path === '/depts' && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse(mockDepts));
      return;
    }

    // System: Department options (for select dropdowns)
    if (path === '/depts/options' && method === 'GET') {
      // Flatten department tree to options format
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

    // System: Menus
    if ((path === '/menus' || path === '/menus/options') && method === 'GET') {
      res.writeHead(200);
      res.end(apiResponse(mockMenus));
      return;
    }

    // System: Dictionaries
    if ((path === '/dicts' || path === '/dicts/page') && method === 'GET') {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;

      const start = (pageNum - 1) * pageSize;
      const list = mockDicts.slice(start, start + pageSize);

      res.writeHead(200);
      res.end(apiResponse({ list, total: mockDicts.length }));
      return;
    }

    // System: Logs
    if ((path === '/logs' || path === '/logs/page') && method === 'GET') {
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;

      const start = (pageNum - 1) * pageSize;
      const list = mockLogs.slice(start, start + pageSize);

      res.writeHead(200);
      res.end(apiResponse({ list, total: mockLogs.length }));
      return;
    }

    // Not found
    res.writeHead(404);
    res.end(
      JSON.stringify({ code: 'B9999', msg: `Not found: ${path}`, data: null })
    );
  } catch (error) {
    console.error('Mock server error:', error);
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
