import { http, HttpResponse } from 'msw';

const mockProducts = [
  {
    id: 1,
    productCode: 'P001',
    productName: 'テスト商品1',
    categoryId: 1,
    categoryName: 'カテゴリA',
    unitPrice: 1000,
    description: 'テスト商品1の説明',
    status: 1,
  },
  {
    id: 2,
    productCode: 'P002',
    productName: 'テスト商品2',
    categoryId: 1,
    categoryName: 'カテゴリA',
    unitPrice: 2000,
    description: 'テスト商品2の説明',
    status: 1,
  },
  {
    id: 3,
    productCode: 'P003',
    productName: 'サンプル商品',
    categoryId: 2,
    categoryName: 'カテゴリB',
    unitPrice: 1500,
    description: 'サンプル商品の説明',
    status: 0,
  },
];

export const productHandlers = [
  // 商品一覧
  http.get(
    'http://localhost:3001/api/proxy/retail/products/page',
    ({ request }) => {
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
      const end = start + pageSize;
      const list = filtered.slice(start, end);

      return HttpResponse.json({
        list,
        total: filtered.length,
      });
    }
  ),

  // 商品詳細
  http.get(
    'http://localhost:3001/api/proxy/retail/products/:id',
    ({ params }) => {
      const id = Number(params.id);
      const product = mockProducts.find((p) => p.id === id);

      if (!product) {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      }

      return HttpResponse.json(product);
    }
  ),

  // 商品作成
  http.post('http://localhost:3001/api/proxy/retail/products', () => {
    return new HttpResponse(null, { status: 201 });
  }),

  // 商品更新
  http.put('http://localhost:3001/api/proxy/retail/products/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // 商品削除
  http.delete('http://localhost:3001/api/proxy/retail/products/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
