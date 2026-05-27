import { createServer } from 'http';
import { mockUsers, mockProducts, mockDashboardStats, mockAlerts } from './handlers';

const PORT = 8080;

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
    // Routes
    if (path === '/auth/login' && method === 'POST') {
      const { username, password } = body as { username: string; password: string };
      const user = Object.values(mockUsers).find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        res.writeHead(401);
        res.end(JSON.stringify({ code: 'A0001', msg: 'Invalid credentials', data: null }));
        return;
      }

      res.writeHead(200);
      res.end(apiResponse({
        accessToken: `mock_token_${user.username}_${Date.now()}`,
        refreshToken: `mock_refresh_${user.username}`,
        tokenType: 'Bearer',
        expiresIn: 3600,
      }));
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
      res.end(apiResponse({
        userId: user.userId,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        roles: user.roles,
        perms: user.perms,
      }));
      return;
    }

    if (path === '/auth/refresh' && method === 'POST') {
      res.writeHead(200);
      res.end(apiResponse({
        accessToken: `mock_token_admin_${Date.now()}`,
        refreshToken: `mock_refresh_admin`,
        tokenType: 'Bearer',
        expiresIn: 3600,
      }));
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
          res.end(JSON.stringify({ code: 'B0001', msg: 'Product not found', data: null }));
          return;
        }
        res.writeHead(200);
        res.end(apiResponse(product));
        return;
      }

      if (method === 'PUT') {
        if (!product) {
          res.writeHead(404);
          res.end(JSON.stringify({ code: 'B0001', msg: 'Product not found', data: null }));
          return;
        }
        res.writeHead(200);
        res.end(apiResponse({ ...product, ...body, updateTime: new Date().toISOString() }));
        return;
      }

      if (method === 'DELETE') {
        if (!product) {
          res.writeHead(404);
          res.end(JSON.stringify({ code: 'B0001', msg: 'Product not found', data: null }));
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

    if (path === '/ws/ticket' && method === 'POST') {
      res.writeHead(200);
      res.end(apiResponse({
        ticket: `mock_ws_ticket_${Date.now()}`,
        expiresIn: 30,
      }));
      return;
    }

    // Not found
    res.writeHead(404);
    res.end(JSON.stringify({ code: 'B9999', msg: `Not found: ${path}`, data: null }));
  } catch (error) {
    console.error('Mock server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ code: 'E0001', msg: 'Internal server error', data: null }));
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
