import { Metadata } from 'next';
import { fetchFromBackend, isRedirectError } from '@/lib/api/server';
import {
  WelcomeMessage,
  KPICards,
  KPICardsBottom,
  SalesChart,
  AlertPanel,
  getMockKPIData,
  getMockAlerts,
  type KPIData,
  type AlertItem,
} from '@/features/dashboard/components';

export const metadata: Metadata = {
  title: 'ダッシュボード',
};

interface UserInfo {
  userId: number;
  username: string;
  nickname?: string;
  avatar?: string;
  roles: string[];
  perms: string[];
}

async function getDashboardKPI(): Promise<KPIData> {
  try {
    const data = await fetchFromBackend<KPIData>('retail/dashboard/kpi');
    return data;
  } catch (error) {
    // 認証エラーは再throw（ログインへリダイレクト）
    if (isRedirectError(error)) {
      throw error;
    }
    // ダッシュボードKPI APIがない場合はモックデータ
    return getMockKPIData();
  }
}

async function getDashboardAlerts(): Promise<AlertItem[]> {
  try {
    const data = await fetchFromBackend<AlertItem[]>('retail/dashboard/alerts');
    return data;
  } catch (error) {
    // 認証エラーは再throw（ログインへリダイレクト）
    if (isRedirectError(error)) {
      throw error;
    }
    // ダッシュボードアラートAPIがない場合はモックデータ
    return getMockAlerts();
  }
}

async function getUserInfo(): Promise<UserInfo | null> {
  try {
    const data = await fetchFromBackend<UserInfo>('users/me');
    return data;
  } catch (error) {
    // 認証エラーは再throw（ログインへリダイレクト）
    if (isRedirectError(error)) {
      throw error;
    }
    return null;
  }
}

export default async function DashboardPage() {
  const [userInfo, kpiData, alerts] = await Promise.all([
    getUserInfo(),
    getDashboardKPI(),
    getDashboardAlerts(),
  ]);

  const userName = userInfo?.nickname || userInfo?.username || 'デモユーザー';

  return (
    <div className="space-y-6">
      {/* ウェルカムメッセージ */}
      <WelcomeMessage userName={userName} />

      {/* KPIカード (上段4つ) */}
      <KPICards data={kpiData} />

      {/* 売上グラフとアラートパネル */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SalesChart />
        <AlertPanel alerts={alerts} className="lg:col-span-1" />
      </div>

      {/* 下段KPIカード (3つ) */}
      <KPICardsBottom data={kpiData} />
    </div>
  );
}
