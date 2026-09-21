'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit, Shield, Search, RotateCcw, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
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
import { useTranslations } from 'next-intl';
import { useRoles, useDeleteRoles } from '../hooks/use-role';
import { RoleDialog } from './role-dialog';
import { RolePermissionDialog } from './role-permission-dialog';
import { DataScopeLabel, type Role, type RoleQuery, type RolePageResult } from '../types/role';

interface RoleTableClientProps {
  initialData: RolePageResult;
  initialParams: RoleQuery;
}

export function RoleTableClient({ initialData, initialParams }: RoleTableClientProps) {
  const t = useTranslations('system.role');
  const tCommon = useTranslations('common');
  const [params, setParams] = useState<RoleQuery>(initialParams);
  const [keywords, setKeywords] = useState(initialParams.keywords || '');
  const [status, setStatus] = useState<string>(
    initialParams.status !== undefined ? String(initialParams.status) : ''
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permTarget, setPermTarget] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number[] | null>(null);

  const { data = initialData, isLoading, isError } = useRoles(params);
  const displayData = isError ? initialData : data;
  const deleteMutation = useDeleteRoles();

  const handleSearch = () => {
    setParams({
      ...params,
      pageNum: 1,
      keywords: keywords || undefined,
      status: status ? parseInt(status, 10) : undefined,
    });
  };

  const handleReset = () => {
    setKeywords('');
    setStatus('');
    setParams({ pageNum: 1, pageSize: params.pageSize });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, pageNum: page });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayData.list.map((r) => r.id));
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
    await deleteMutation.mutateAsync(deleteTarget.join(','));
    setDeleteTarget(null);
    setSelectedIds([]);
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
                {t('keyword')}
              </span>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-48"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">{t('status')}</span>
              <Select
                value={status || 'all'}
                onValueChange={(v) => setStatus(v === 'all' ? '' : v)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('statusAll')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('statusAll')}</SelectItem>
                  <SelectItem value="1">{t('statusActive')}</SelectItem>
                  <SelectItem value="0">{t('statusDisabled')}</SelectItem>
                </SelectContent>
              </Select>
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
                <TableHead>{t('roleName')}</TableHead>
                <TableHead className="w-[140px]">{t('roleCode')}</TableHead>
                <TableHead className="w-24">{t('status')}</TableHead>
                <TableHead className="w-24 text-center">{t('sort')}</TableHead>
                <TableHead className="w-[200px]">{t('operations')}</TableHead>
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
                    {t('noData')}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                displayData.list.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(role.id)}
                        onCheckedChange={(checked) => handleSelectOne(role.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <code className="text-sm px-2 py-0.5 bg-muted rounded text-orange-600">
                        {role.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={role.status === 1 ? 'success' : 'muted'}>
                        {role.status === 1 ? t('statusActive') : t('statusDisabled')}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-center">{role.sort}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-blue-600 p-0 h-auto"
                          onClick={() => setPermTarget(role)}
                        >
                          <Shield className="mr-1 h-3 w-3" />
                          {t('permissions')}
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-green-600 p-0 h-auto"
                          onClick={() => {
                            setEditTarget(role);
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
                          onClick={() => setDeleteTarget([role.id])}
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
            {(params.pageNum - 1) * params.pageSize + 1} -{' '}
            {Math.min(params.pageNum * params.pageSize, displayData.total)} / {displayData.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(params.pageNum - 1)}
              disabled={params.pageNum === 1}
            >
              {tCommon('previous')}
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={params.pageNum === page ? 'default' : 'outline'}
                  size="sm"
                  className={params.pageNum === page ? 'bg-teal-600' : ''}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
            {totalPages > 5 && <span className="px-2">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(params.pageNum + 1)}
              disabled={params.pageNum >= totalPages}
            >
              {tCommon('next')}
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground py-4 border-t">
        2024 SMARTRETAIL PRO V2.4.1 | SERVER STATUS: HEALTHY | SYSTEM TIME:{' '}
        {new Date().toLocaleTimeString()}
      </div>

      {/* Dialogs */}
      <RoleDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditTarget(null);
        }}
        role={editTarget}
      />

      <RolePermissionDialog
        open={!!permTarget}
        onClose={() => setPermTarget(null)}
        role={permTarget}
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
