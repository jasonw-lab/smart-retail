'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Store,
  Monitor,
  Boxes,
  CreditCard,
  Bell,
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
  Shield,
  Menu,
  Building2,
  Book,
  FileText,
  ChevronDown,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { useAppStore } from '@/store/app-store';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: '',
    items: [
      { title: 'Dashboard', href: '/', icon: LayoutDashboard },
      { title: 'Store Management', href: '/stores', icon: Store },
      { title: 'Product/Inventory', href: '/inventory', icon: Boxes },
      { title: 'Alert Information', href: '/alerts', icon: Bell },
    ],
  },
  {
    title: 'System Management',
    items: [
      { title: 'User Management', href: '/system/user', icon: Users },
      { title: 'Role Management', href: '/system/role', icon: Shield },
      { title: 'Menu Management', href: '/system/menu', icon: Menu },
      { title: 'Dept Management', href: '/system/dept', icon: Building2 },
      { title: 'Dict Management', href: '/system/dict', icon: Book },
      { title: 'Logs', href: '/system/log', icon: FileText },
    ],
  },
];

function NavItemComponent({
  item,
  pathname,
  collapsed,
  isSubItem = false,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  isSubItem?: boolean;
}) {
  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
  const Icon = item.icon;

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              'flex h-10 w-full items-center justify-center rounded-md transition-all duration-200',
              isActive
                ? 'bg-primary-container text-on-primary-container border-l-4 border-primary'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white'
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'flex h-10 items-center gap-3 rounded-md px-4 transition-all duration-200',
        isActive
          ? 'bg-primary-container text-on-primary-container border-l-4 border-primary font-medium'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white',
        isSubItem && 'text-sm'
      )}
    >
      <Icon className={cn('h-5 w-5', isSubItem && 'h-4 w-4')} />
      <span className="text-sm">{item.title}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebarCollapse } = useAppStore();
  const [systemExpanded, setSystemExpanded] = useState(false);

  // Auto-expand system menu when on system pages
  useEffect(() => {
    if (pathname.startsWith('/system')) {
      setSystemExpanded(true);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const isSystemActive = pathname.startsWith('/system');

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 h-full flex flex-col bg-sidebar z-50 shadow-lg transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo Header */}
        <div className={cn('py-6 mb-2', sidebarCollapsed ? 'px-3 flex justify-center' : 'px-6')}>
          {!sidebarCollapsed ? (
            <>
              <h1 className="text-lg font-bold text-sidebar-primary">SmartRetail Pro</h1>
              <p className="text-xs text-sidebar-muted/70">Admin Console</p>
            </>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent">
              <Package className="h-6 w-6 text-sidebar-primary" />
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {/* Main menu items */}
          {navSections[0].items.map((item) => (
            <NavItemComponent
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={sidebarCollapsed}
            />
          ))}

          {/* System Management Section */}
          <div className="pt-4">
            {!sidebarCollapsed ? (
              <>
                <button
                  onClick={() => setSystemExpanded(!systemExpanded)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2 transition-colors',
                    isSystemActive ? 'text-sidebar-primary' : 'text-sidebar-primary/80'
                  )}
                >
                  <Settings className="h-5 w-5" />
                  <span className="text-sm font-medium">System Management</span>
                  <ChevronDown
                    className={cn(
                      'ml-auto h-4 w-4 transition-transform duration-200',
                      systemExpanded && 'rotate-180'
                    )}
                  />
                </button>
                {systemExpanded && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-sidebar-border pl-2">
                    {navSections[1].items.map((item) => (
                      <NavItemComponent
                        key={item.href}
                        item={item}
                        pathname={pathname}
                        collapsed={false}
                        isSubItem
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/system/user"
                    className={cn(
                      'flex h-10 w-full items-center justify-center rounded-md transition-all duration-200',
                      isSystemActive
                        ? 'bg-primary-container text-on-primary-container'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white'
                    )}
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">System Management</TooltipContent>
              </Tooltip>
            )}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto border-t border-sidebar-border/30 pt-4 px-3 pb-4 space-y-1">
          {/* Help Center */}
          {!sidebarCollapsed ? (
            <Link
              href="/help"
              className="flex h-10 items-center gap-3 rounded-md px-4 text-sidebar-foreground/80 hover:text-white transition-all"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="text-sm">Help Center</span>
            </Link>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/help"
                  className="flex h-10 w-full items-center justify-center rounded-md text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white transition-all"
                >
                  <HelpCircle className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Help Center</TooltipContent>
            </Tooltip>
          )}

          {/* Logout */}
          {!sidebarCollapsed ? (
            <button
              onClick={handleLogout}
              className="flex h-10 w-full items-center gap-3 rounded-md px-4 text-sidebar-foreground/80 hover:text-white transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm">Logout</span>
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="flex h-10 w-full items-center justify-center rounded-md text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white transition-all"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          )}

          {/* Collapse Toggle */}
          <button
            onClick={toggleSidebarCollapse}
            className="flex h-10 w-full items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white transition-all mt-2"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
