import { cookies } from 'next/headers';
import { redirect } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Sidebar } from '@/components/layout/sidebar';
import { MainContent } from '@/components/layout/main-content';
import { getLocalMockUserFromToken } from '@/lib/auth/mock-auth';

async function getUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return null;
  }

  const mockUser = getLocalMockUserFromToken(accessToken);
  if (mockUser) {
    return mockUser;
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    if (result.code !== '00000') {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
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
      <MainContent user={user}>{children}</MainContent>
    </div>
  );
}
