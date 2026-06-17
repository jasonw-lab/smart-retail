'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { LogOut, Bell, Maximize, ChevronDown, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/store/app-store';
import { LanguageSwitcher } from '@/components/language-switcher';

interface HeaderProps {
  user?: {
    username: string;
    nickname?: string;
    avatar?: string;
  };
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleSidebarCollapse } = useAppStore();
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');

  // Breadcrumb mapping using translation keys
  const pathTitleMap: Record<string, string> = {
    '/': t('dashboard'),
    '/stores': t('stores'),
    '/devices': t('devices'),
    '/products': t('products'),
    '/inventory': t('inventory'),
    '/transactions': t('transactions'),
    '/alerts': t('alerts'),
    '/system': t('system'),
    '/system/user': t('user'),
    '/system/role': t('role'),
    '/system/menu': t('menu'),
    '/system/dept': t('dept'),
    '/system/dict': t('dict'),
    '/system/log': t('log'),
  };

  function getBreadcrumbs(
    currentPath: string
  ): { label: string; href: string }[] {
    const segments = currentPath.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href: string }[] = [
      { label: t('dashboard'), href: '/' },
    ];

    if (segments.length === 0) return breadcrumbs;

    let accPath = '';
    for (const segment of segments) {
      accPath += `/${segment}`;
      const title = pathTitleMap[accPath];
      if (title && title !== t('dashboard')) {
        breadcrumbs.push({ label: title, href: accPath });
      }
    }

    return breadcrumbs;
  }

  const breadcrumbs = getBreadcrumbs(pathname);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header className="flex justify-between items-center w-full px-6 h-16 bg-surface-container-lowest border-b border-outline-variant/30 shadow-sm sticky top-0 z-40">
      {/* Left: Menu toggle and Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebarCollapse}
          className="p-2 rounded-full text-outline hover:bg-surface-container-low transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.href} className="flex items-center">
              {index > 0 && (
                <span className="text-outline-variant mx-2">/</span>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-primary font-semibold">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right: Actions and User */}
      <div className="flex items-center gap-2">
        {/* Fullscreen */}
        <button
          onClick={handleFullscreen}
          className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
        >
          <Maximize className="h-5 w-5" />
        </button>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-white" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-outline-variant mx-2" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-2 cursor-pointer group hover:bg-surface-container-low rounded-lg pr-2 py-1 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-medium border border-outline-variant group-hover:border-primary transition-colors">
                {(user?.nickname || user?.username || 'D')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                {user?.nickname || user?.username || 'demo'}
              </span>
              <ChevronDown className="h-4 w-4 text-outline" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-on-surface">
                  {user?.nickname || user?.username || 'demo'}
                </p>
                <p className="text-xs text-on-surface-variant">Administrator</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-error cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {tAuth('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
