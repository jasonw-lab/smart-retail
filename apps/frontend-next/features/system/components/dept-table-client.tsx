'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  ChevronRight,
  ChevronDown,
  Search,
  RotateCcw,
  Download,
  ChevronUp,
  Users,
  BarChart3,
  FileText,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useDepts, useDeleteDepts } from '../hooks/use-dept';
import { DeptDialog } from './dept-dialog';
import type { Dept, DeptQuery } from '../types/dept';

interface DeptTableClientProps {
  initialData: Dept[];
}

interface TabItem {
  id: string;
  label: string;
  closable?: boolean;
}

export function DeptTableClient({ initialData }: DeptTableClientProps) {
  const [params, setParams] = useState<DeptQuery>({});
  const [keywords, setKeywords] = useState('');
  const [status, setStatus] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [editTarget, setEditTarget] = useState<{
    parentId?: number;
    dept?: Dept;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number[] | null>(null);
  const [activeTab, setActiveTab] = useState('dept-management');
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'dept-management', label: 'Department Management', closable: true },
    { id: 'user-management', label: 'User Management', closable: true },
  ]);

  const { data = initialData, isLoading, isError } = useDepts(params);
  const displayData = isError ? initialData : data;
  const deleteMutation = useDeleteDepts();

  // Calculate stats
  const stats = useMemo(() => {
    let totalDepts = 0;
    let maxDepth = 0;

    const countDepts = (depts: Dept[], depth: number = 1) => {
      depts.forEach((dept) => {
        totalDepts++;
        maxDepth = Math.max(maxDepth, depth);
        if (dept.children && dept.children.length > 0) {
          countDepts(dept.children, depth + 1);
        }
      });
    };

    countDepts(displayData);
    return {
      activeDepts: totalDepts,
      averageDepth: maxDepth > 0 ? (maxDepth / 2).toFixed(1) : '0',
    };
  }, [displayData]);

  const handleSearch = () => {
    setParams({
      keywords: keywords || undefined,
      status: status ? parseInt(status) : undefined,
    });
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
    const collectIds = (depts: Dept[]) => {
      depts.forEach((dept) => {
        if (dept.children && dept.children.length > 0) {
          allIds.add(dept.id);
          collectIds(dept.children);
        }
      });
    };
    collectIds(displayData);
    setExpandedIds(allIds);
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.join(','));
    setDeleteTarget(null);
    setSelectedIds([]);
  };

  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1].id);
    }
  };

  // Count total items for pagination
  const countTotal = (depts: Dept[]): number => {
    return depts.reduce((acc, dept) => {
      return acc + 1 + (dept.children ? countTotal(dept.children) : 0);
    }, 0);
  };
  const totalItems = countTotal(displayData);

  const renderDeptRow = (dept: Dept, level: number = 0): React.ReactNode => {
    const hasChildren = dept.children && dept.children.length > 0;
    const isExpanded = expandedIds.has(dept.id);

    return (
      <React.Fragment key={dept.id}>
        <TableRow>
          <TableCell>
            <Checkbox
              checked={selectedIds.includes(dept.id)}
              onCheckedChange={(checked) => handleSelectOne(dept.id, !!checked)}
            />
          </TableCell>
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
                  onClick={() => toggleExpand(dept.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {!hasChildren && <span className="w-7" />}
              <span className="font-medium">{dept.name}</span>
            </div>
          </TableCell>
          <TableCell>
            <code className="text-sm px-2 py-0.5 bg-muted rounded">
              {dept.code}
            </code>
          </TableCell>
          <TableCell>
            <StatusBadge variant={dept.status === 1 ? 'success' : 'error'}>
              {dept.status === 1 ? 'NORMAL' : 'DISABLED'}
            </StatusBadge>
          </TableCell>
          <TableCell className="text-center">{dept.sort}</TableCell>
          <TableCell>
            <div className="flex items-center gap-1">
              <Button
                variant="link"
                size="sm"
                className="text-blue-600 p-0 h-auto"
                onClick={() => {
                  setEditTarget({ dept });
                  setDialogOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="link"
                size="sm"
                className="text-teal-600 p-0 h-auto"
                onClick={() => {
                  setEditTarget({ parentId: dept.id });
                  setDialogOpen(true);
                }}
              >
                Add Sub
              </Button>
              <Button
                variant="link"
                size="sm"
                className="text-red-600 p-0 h-auto"
                onClick={() => setDeleteTarget([dept.id])}
              >
                Delete
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {hasChildren &&
          isExpanded &&
          dept.children!.map((child) => renderDeptRow(child, level + 1))}
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
                Keyword
              </span>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Department Name"
                className="w-48"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Department Status
              </span>
              <Select
                value={status || 'all'}
                onValueChange={(v) => setStatus(v === 'all' ? '' : v)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="1">Normal</SelectItem>
                  <SelectItem value="0">Disabled</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => {
              setEditTarget({ parentId: 0 });
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            New Department
          </Button>
          <Button variant="outline" onClick={expandAll}>
            <ChevronDown className="mr-1 h-4 w-4" />
            Expand All
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12" />
                <TableHead>Department Name</TableHead>
                <TableHead className="w-[150px]">Department Code</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24 text-center">Sort Order</TableHead>
                <TableHead className="w-[200px]">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && displayData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No departments found
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && displayData.map((dept) => renderDeptRow(dept))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Total {totalItems} items
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="default" size="sm" className="bg-teal-600">
            1
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="grid grid-cols-3 gap-4">
        {/* Structure Visualization */}
        <Card className="col-span-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Structure Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm opacity-90 mb-4">
              Manage your organizational hierarchy with precision. Drag and drop
              functionality for departments is coming in the next update.
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white/20"
              >
                <BarChart3 className="mr-1 h-4 w-4" />
                View Org Chart
              </Button>
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white/20"
              >
                <FileText className="mr-1 h-4 w-4" />
                Audit Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              QUICK STATS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Depts</span>
              <span className="text-2xl font-bold">{stats.activeDepts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Average Depth</span>
              <span className="text-2xl font-bold">{stats.averageDepth}</span>
            </div>
            <Button variant="outline" className="w-full">
              Detailed Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <DeptDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditTarget(null);
        }}
        parentId={editTarget?.parentId}
        dept={editTarget?.dept}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Department"
        description="Are you sure you want to delete the selected department(s)? Child departments will also be deleted."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
