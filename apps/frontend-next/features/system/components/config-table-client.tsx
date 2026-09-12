'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Search,
  RotateCcw,
  Download,
  RefreshCw,
  Cog,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useConfigs, useDeleteConfigs, useRefreshConfigCache } from '../hooks/use-config';
import { ConfigDialog } from './config-dialog';
import type { Config, ConfigQuery, ConfigPageResult } from '../types/config';

interface ConfigTableClientProps {
  initialData: ConfigPageResult;
  initialParams: ConfigQuery;
}

export function ConfigTableClient({ initialData, initialParams }: ConfigTableClientProps) {
  const t = useTranslations('system.config');
  const tCommon = useTranslations('common');

  const [params, setParams] = useState<ConfigQuery>(initialParams);
  const [keywords, setKeywords] = useState(initialParams.keywords || '');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editTarget, setEditTarget] = useState<Config | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null);

  const { data = initialData, isLoading, isError } = useConfigs(params);
  const displayData = isError ? initialData : data;
  const deleteMutation = useDeleteConfigs();
  const refreshMutation = useRefreshConfigCache();

  const handleSearch = () => {
    setParams({ ...params, pageNum: 1, keywords: keywords || undefined });
  };

  const handleReset = () => {
    setKeywords('');
    setParams({ pageNum: 1, pageSize: params.pageSize });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, pageNum: page });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayData.list.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
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

  const handleRefreshCache = () => {
    refreshMutation.mutate();
  };

  const totalPages = Math.ceil((displayData.total || 0) / params.pageSize);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {t('searchLabel')}
              </span>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-56"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700">
                <Search className="mr-1 h-4 w-4" />
                {tCommon('search')}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-1 h-4 w-4" />
                {tCommon('reset')}
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
              setEditTarget(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            {t('add')}
          </Button>
          <Button
            variant="destructive"
            disabled={selectedIds.length === 0}
            onClick={() => setDeleteTarget(selectedIds)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            {tCommon('batchDelete')}
          </Button>
          <Button variant="outline" onClick={handleRefreshCache} disabled={refreshMutation.isPending}>
            <RefreshCw className="mr-1 h-4 w-4" />
            {t('refreshCache')}
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
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      displayData.list.length > 0 && selectedIds.length === displayData.list.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{t('configName')}</TableHead>
                <TableHead className="w-[200px]">{t('configKey')}</TableHead>
                <TableHead className="w-[240px]">{t('configValue')}</TableHead>
                <TableHead className="w-[200px]">{t('remark')}</TableHead>
                <TableHead className="w-[160px]">{tCommon('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {tCommon('loading')}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && displayData.list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {tCommon('noData')}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                displayData.list.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(config.id)}
                        onCheckedChange={(checked) => handleSelectOne(config.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Cog className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{config.configName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                        {config.configKey}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate" title={config.configValue}>
                      {config.configValue}
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate">
                      {config.remark || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-green-600 p-0 h-auto"
                          onClick={() => {
                            setEditTarget(config);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          {tCommon('edit')}
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-red-600 p-0 h-auto"
                          onClick={() => setDeleteTarget([config.id])}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          {tCommon('delete')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('showing', {
              start: 1,
              end: Math.min(params.pageSize, displayData.total),
              total: displayData.total,
            })}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{tCommon('rowsPerPage')}</span>
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
                {tCommon('previous')}
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
                {tCommon('next')}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('goTo')}</span>
              <Input
                className="w-16"
                placeholder="1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const page = parseInt((e.target as HTMLInputElement).value, 10);
                    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
                      handlePageChange(page);
                    }
                  }
                }}
              />
              <span className="text-sm text-muted-foreground">{t('page')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">{t('tipTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('tipDescription')}</p>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ConfigDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditTarget(null);
        }}
        config={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('deleteConfirm')}
        description={t('deleteConfirmMessage')}
        confirmLabel={tCommon('delete')}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
