'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Bell, Maximize, Globe, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';

interface HeaderProps {
  user?: {
    username: string;
    nickname?: string;
    avatar?: string;
  };
}

// Breadcrumb mapping
const pathTitleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/stores': 'Store Management',
  '/devices': 'Device Management',
  '/products': 'Product Management',
  '/inventory': 'Product/Inventory',
  '/transactions': 'Payments',
  '/alerts': 'Alert Information',
  '/system': 'System Management',
  '/system/user': 'User Management',
  '/system/role': 'Role Management',
  '/system/menu': 'Menu Management',
  '/system/dept': 'Dept Management',
  '/system/dict': 'Dict Management',
  '/system/log': 'System Log',
};

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [
    { label: 'Dashboard', href: '/' },
  ];

  if (segments.length === 0) return breadcrumbs;

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const title = pathTitleMap[currentPath];
    if (title && title !== 'Dashboard') {
      breadcrumbs.push({ label: title, href: currentPath });
    }
  }

  return breadcrumbs;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleSidebarCollapse } = useAppStore();
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
              {index > 0 && <span className="text-outline-variant mx-2">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-primary font-semibold">{crumb.label}</span>
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

        {/* Language */}
        <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors">
          <Globe className="h-5 w-5" />
        </button>

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
                {(user?.nickname || user?.username || 'D').charAt(0).toUpperCase()}
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
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
