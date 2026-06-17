'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  ChevronRight,
  ChevronDown,
  Search,
  RotateCcw,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMenus, useDeleteMenu } from '../hooks/use-menu';
import { MenuDialog } from './menu-dialog';
import {
  MenuType,
  MenuTypeLabel,
  MenuTypeColor,
  type Menu,
  type MenuQuery,
} from '../types/menu';

interface MenuTableClientProps {
  initialData: Menu[];
}

interface TabItem {
  id: string;
  label: string;
  closable?: boolean;
}

export function MenuTableClient({ initialData }: MenuTableClientProps) {
  const [params, setParams] = useState<MenuQuery>({});
  const [keywords, setKeywords] = useState('');
  const [status, setStatus] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [editTarget, setEditTarget] = useState<{
    parentId?: number;
    menu?: Menu;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('menu-management');
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'menu-management', label: 'Menu Management', closable: true },
    { id: 'inventory-list', label: 'Inventory List', closable: true },
    { id: 'role-management', label: 'Role Management', closable: true },
  ]);

  const { data = initialData, isLoading, isError } = useMenus(params);
  const displayData = isError ? initialData : data;
  const deleteMutation = useDeleteMenu();

  const handleSearch = () => {
    setParams({ keywords: keywords || undefined });
  };

  const handleReset = () => {
    setKeywords('');
    setStatus('');
    setParams({});
  };

  const toggleExpand = (id: number) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const expandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (menus: Menu[]) => {
      menus.forEach((menu) => {
        if (menu.children && menu.children.length > 0) {
          allIds.add(menu.id);
          collectIds(menu.children);
        }
      });
    };
    collectIds(displayData);
    setExpandedIds(allIds);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget);
    setDeleteTarget(null);
  };

  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1].id);
    }
  };

  const getTypeVariant = (
    type: number
  ): 'warning' | 'success' | 'error' | 'info' => {
    switch (type) {
      case MenuType.CATALOG:
        return 'warning';
      case MenuType.MENU:
        return 'success';
      case MenuType.BUTTON:
        return 'error';
      case MenuType.EXTLINK:
        return 'info';
      default:
        return 'info';
    }
  };

  const renderMenuRow = (menu: Menu, level: number = 0): React.ReactNode => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedIds.has(menu.id);
    const canAddChild =
      menu.type === MenuType.CATALOG || menu.type === MenuType.MENU;

    return (
      <React.Fragment key={menu.id}>
        <TableRow>
          <TableCell>
            <div
              className="flex items-center"
              style={{ paddingLeft: level * 24 }}
            >
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mr-1"
                  onClick={() => toggleExpand(menu.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {!hasChildren && <span className="w-7" />}
              <span className="font-medium">{menu.name}</span>
            </div>
          </TableCell>
          <TableCell>
            <StatusBadge variant={getTypeVariant(menu.type)}>
              {MenuTypeLabel[menu.type]}
            </StatusBadge>
          </TableCell>
          <TableCell className="font-mono text-sm text-muted-foreground">
            {menu.routePath || '-'}
          </TableCell>
          <TableCell className="font-mono text-sm text-muted-foreground max-w-[200px] truncate">
            {menu.component || 'Layout'}
          </TableCell>
          <TableCell>
            <StatusBadge variant={menu.visible === 1 ? 'success' : 'muted'}>
              {menu.visible === 1 ? 'Visible' : 'Hidden'}
            </StatusBadge>
          </TableCell>
          <TableCell className="text-center">{menu.sort}</TableCell>
          <TableCell>
            <div className="flex items-center gap-1">
              {canAddChild && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setEditTarget({ parentId: menu.id });
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setEditTarget({ menu });
                  setDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(menu.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {hasChildren &&
          isExpanded &&
          menu.children!.map((child) => renderMenuRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-600 bg-teal-50'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="text-sm">{tab.label}</span>
            {tab.closable && (
              <X
                className="h-3 w-3 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Keyword Search
              </span>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter menu name..."
                className="w-48"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Status
              </span>
              <Select
                value={status || 'all'}
                onValueChange={(v) => setStatus(v === 'all' ? '' : v)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="1">Visible</SelectItem>
                  <SelectItem value="0">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSearch}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Search className="mr-1 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-1 h-4 w-4" />
                Reset
              </Button>
            </div>
            <div className="ml-auto">
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => {
                  setEditTarget({ parentId: 0 });
                  setDialogOpen(true);
                }}
              >
                <Plus className="mr-1 h-4 w-4" />
                Create Menu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="min-w-[250px]">MENU NAME</TableHead>
                <TableHead className="w-24">TYPE</TableHead>
                <TableHead className="w-[150px]">ROUTE PATH</TableHead>
                <TableHead className="w-[200px]">COMPONENT</TableHead>
                <TableHead className="w-24">STATUS</TableHead>
                <TableHead className="w-20 text-center">SORT</TableHead>
                <TableHead className="w-32">OPER</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && displayData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No menus found
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && displayData.map((menu) => renderMenuRow(menu))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 1 to 8 of 42 entries
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="default" size="sm" className="bg-teal-600">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <span className="px-2">...</span>
          <Button variant="outline" size="sm">
            6
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground py-4 border-t">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            System Online
          </span>
          <span>Server Load: 72%</span>
          <span>Sync Interval: 5m</span>
        </div>
        <div>2024 SmartRetail Pro V2.4.1</div>
      </div>

      {/* Dialogs */}
      <MenuDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditTarget(null);
        }}
        parentId={editTarget?.parentId}
        menu={editTarget?.menu}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Menu"
        description="Are you sure you want to delete this menu? Child menus will also be deleted."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
