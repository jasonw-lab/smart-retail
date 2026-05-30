import { http, HttpResponse } from 'msw';

export const dashboardHandlers = [
  // ダッシュボード統計
  http.get('http://localhost:3001/api/proxy/retail/dashboard/stats', () => {
    return HttpResponse.json({
      productCount: 128,
      totalSales: 1250000,
      lowStockCount: 12,
      alertCount: 5,
    });
  }),
];
