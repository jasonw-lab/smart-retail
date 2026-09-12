'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import {
  Plus,
  Trash2,
  Edit,
  Search,
  RotateCcw,
  Download,
  Settings,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  List,
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
import { useDictItems, useDeleteDictItems } from '../hooks/use-dict-items';
import { DictItemDialog } from './dict-item-dialog';
import type { DictItem, DictItemQuery, DictItemPageResult } from '../types/dict';

interface DictItemTableClientProps {
  dictCode: string;
  initialData: DictItemPageResult;
  initialParams: DictItemQuery;
}

export function DictItemTableClient({
  dictCode,
  initialData,
  initialParams,
}: DictItemTableClientProps) {
  const router = useRouter();
  const [params, setParams] = useState<DictItemQuery>(initialParams);
  const [keywords, setKeywords] = useState(initialParams.keywords || '');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editTarget, setEditTarget] = useState<DictItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number[] | null>(null);

  const {
    data = initialData,
    isLoading,
    isError,
  } = useDictItems(dictCode, params, {
    placeholderData: initialData,
  });
  const displayData = isError ? initialData : data;
  const deleteMutation = useDeleteDictItems();

  const handleSearch = () => {
    setParams({ ...params, pageNum: 1, keywords: keywords || undefined });
  };

  const handleReset = () => {
    setKeywords('');
    setParams({ dictCode, pageNum: 1, pageSize: params.pageSize });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, pageNum: page });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayData.list.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
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
    await deleteMutation.mutateAsync({ dictCode, ids: deleteTarget.join(',') });
    setDeleteTarget(null);
    setSelectedIds([]);
  };

  const totalPages = Math.ceil((displayData.total || 0) / params.pageSize);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Item Search</span>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Label / Value"
                className="w-48"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700">
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => {
              setEditTarget(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add New Item
          </Button>
          <Button
            variant="destructive"
            disabled={selectedIds.length === 0}
            onClick={() => setDeleteTarget(selectedIds)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Batch Delete
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      displayData.list.length > 0 && selectedIds.length === displayData.list.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>LABEL</TableHead>
                <TableHead className="w-[200px]">VALUE</TableHead>
                <TableHead className="w-24">SORT</TableHead>
                <TableHead className="w-24">STATUS</TableHead>
                <TableHead className="w-[200px]">OPERATIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && displayData.list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No items found
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                displayData.list.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectOne(item.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <List className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                        {item.value}
                      </code>
                    </TableCell>
                    <TableCell>{item.sort}</TableCell>
                    <TableCell>
                      <StatusBadge variant={item.status === 1 ? 'success' : 'muted'}>
                        {item.status === 1 ? 'Enabled' : 'Disabled'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-green-600 p-0 h-auto"
                          onClick={() => {
                            setEditTarget(item);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-red-600 p-0 h-auto"
                          onClick={() => setDeleteTarget([item.id])}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing 1-{Math.min(params.pageSize, displayData.total)} of {displayData.total} items
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Lines per page</span>
              <Select
                value={String(params.pageSize)}
                onValueChange={(v) => setParams({ ...params, pageSize: Number(v) })}
              >
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(params.pageNum - 1)}
                disabled={params.pageNum === 1}
              >
                Previous
              </Button>
              <Button variant="default" size="sm" className="bg-teal-600">
                {params.pageNum}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(params.pageNum + 1)}
                disabled={params.pageNum >= totalPages}
              >
                Next
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Go to</span>
              <Input className="w-16" placeholder="1" />
              <span className="text-sm text-muted-foreground">Page</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <List className="h-5 w-5" />
              Dictionary Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm opacity-90">
              Items define the actual values shown in dropdowns across the platform. Keep labels
              clear and values stable.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">RECENT CHANGE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-8 w-8 text-teal-600" />
              <div>
                <div className="text-2xl font-bold">02</div>
                <div className="text-sm text-muted-foreground">New items added this week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">PLATFORM STATUS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-lg font-bold text-green-600">Synchronized</div>
                <div className="text-sm text-muted-foreground">Last sync: 2 mins ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DictItemDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditTarget(null);
        }}
        dictCode={dictCode}
        dictItem={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Dictionary Item"
        description="Are you sure you want to delete the selected item(s)? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
