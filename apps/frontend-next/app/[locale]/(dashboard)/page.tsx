import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { fetchFromBackend, isRedirectError } from '@/lib/api/server';
import { dashboardApiServer } from '@/features/dashboard/lib/dashboard-api.server';
import {
  WelcomeMessage,
  KPICards,
  KPICardsBottom,
  SalesChart,
  AlertPanel,
  type KPIData,
  type AlertItem,
  type SalesChartData,
} from '@/features/dashboard/components';
import type { UserInfo } from '@/types/api';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');
  return {
    title: t('title'),
  };
}

async function getDashboardKPI(): Promise<KPIData> {
  return dashboardApiServer.getKPI();
}

async function getDashboardAlerts(): Promise<AlertItem[]> {
  return dashboardApiServer.getAlerts();
}

async function getDashboardSalesTrend(): Promise<SalesChartData | undefined> {
  try {
    return await dashboardApiServer.getSalesTrend();
  } catch {
    return undefined;
  }
}

async function getUserInfo(): Promise<UserInfo | null> {
  try {
    return await fetchFromBackend<UserInfo>('users/me');
  } catch (error) {
    // 認証エラーは再throw（ログインへリダイレクト）
    if (isRedirectError(error)) {
      throw error;
    }
    return null;
  }
}

export default async function DashboardPage() {
  const [userInfo, kpiData, alerts, salesChartData] = await Promise.all([
    getUserInfo(),
    getDashboardKPI(),
    getDashboardAlerts(),
    getDashboardSalesTrend(),
  ]);

  const userName = userInfo?.nickname || userInfo?.username || 'ユーザー';

  return (
    <div className="space-y-6">
      {/* ウェルカムメッセージ */}
      <WelcomeMessage userName={userName} avatarUrl={userInfo?.avatar} />

      {/* KPIカード (上段4つ) */}
      <KPICards data={kpiData} />

      {/* 売上グラフとアラートパネル */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SalesChart data={salesChartData || kpiData.salesChart} />
        <AlertPanel alerts={alerts} className="lg:col-span-1" />
      </div>

      {/* 下段KPIカード (3つ) */}
      <KPICardsBottom data={kpiData} />
    </div>
  );
}
