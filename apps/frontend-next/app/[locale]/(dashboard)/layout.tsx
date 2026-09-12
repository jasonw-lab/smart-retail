import { cookies } from 'next/headers';
import { redirect } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Sidebar } from '@/components/layout/sidebar';
import { MainContent } from '@/components/layout/main-content';
import { fetchFromBackend, isRedirectError } from '@/lib/api/server';
import type { UserInfo } from '@/types/api';

async function getUser(): Promise<UserInfo | null> {
  try {
    return await fetchFromBackend<UserInfo>('users/me');
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return null;
  }
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    redirect({ href: '/login', locale });
  }

  const user = await getUser();

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <MainContent user={user ?? undefined}>{children}</MainContent>
    </div>
  );
}
