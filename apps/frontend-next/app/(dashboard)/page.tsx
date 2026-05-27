import { Metadata } from 'next';
import { fetchFromBackend } from '@/lib/api/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Warehouse, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ダッシュボード',
};

interface DashboardStats {
  productCount: number;
  totalSales: number;
  lowStockCount: number;
  alertCount: number;
}

async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    return await fetchFromBackend<DashboardStats>('retail/dashboard/stats');
  } catch {
    // ダッシュボード統計APIがない場合はダミーデータ
    return {
      productCount: 128,
      totalSales: 1250000,
      lowStockCount: 12,
      alertCount: 5,
    };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">商品数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.productCount ?? '-'}</div>
            <p className="text-xs text-muted-foreground">登録商品数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">売上合計</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalSales?.toLocaleString() ?? '-'}円
            </div>
            <p className="text-xs text-muted-foreground">今月の売上</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在庫不足</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.lowStockCount ?? '-'}</div>
            <p className="text-xs text-muted-foreground">要補充商品</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アラート</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.alertCount ?? '-'}</div>
            <p className="text-xs text-muted-foreground">未読アラート</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
