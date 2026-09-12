'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Search,
  RotateCcw,
  Download,
  Megaphone,
  Send,
  Undo2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
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
import {
  useNotices,
  useDeleteNotices,
  usePublishNotice,
  useRevokeNotice,
} from '../hooks/use-notice';
import { NoticeDialog } from './notice-dialog';
import type { Notice, NoticeQuery, NoticePageResult } from '../types/notice';

interface NoticeTableClientProps {
  initialData: NoticePageResult;
  initialParams: NoticeQuery;
}

export function NoticeTableClient({ initialData, initialParams }: NoticeTableClientProps) {
  const t = useTranslations('system.notice');
  const tCommon = useTranslations('common');

  const [params, setParams] = useState<NoticeQuery>(initialParams);
  const [title, setTitle] = useState(initialParams.title || '');
  const [publishStatus, setPublishStatus] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editTarget, setEditTarget] = useState<Notice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null);
  const [publishTarget, setPublishTarget] = useState<Notice | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Notice | null>(null);

  const { data = initialData, isLoading, isError } = useNotices(params);
  const displayData = isError ? initialData : data;
  const deleteMutation = useDeleteNotices();
  const publishMutation = usePublishNotice();
  const revokeMutation = useRevokeNotice();

  const handleSearch = () => {
    setParams({
      ...params,
      pageNum: 1,
      title: title || undefined,
      publishStatus: publishStatus ? parseInt(publishStatus, 10) : undefined,
    });
  };

  const handleReset = () => {
    setTitle('');
    setPublishStatus('');
    setParams({ pageNum: 1, pageSize: params.pageSize });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, pageNum: page });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayData.list.map((n) => n.id));
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

  const handlePublish = async () => {
    if (!publishTarget) return;
    await publishMutation.mutateAsync(publishTarget.id);
    setPublishTarget(null);
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    await revokeMutation.mutateAsync(revokeTarget.id);
    setRevokeTarget(null);
  };

  const getPublishStatusVariant = (status?: number) => {
    switch (status) {
      case 1:
        return 'success';
      case 2:
        return 'warning';
      default:
        return 'muted';
    }
  };

  const getPublishStatusLabel = (status?: number) => {
    switch (status) {
      case 1:
        return t('statusPublished');
      case 2:
        return t('statusRevoked');
      default:
        return t('statusDraft');
    }
  };

  const getPriorityVariant = (priority?: number) => {
    switch (priority) {
      case 2:
        return 'error';
      case 1:
        return 'warning';
      default:
        return 'info';
    }
  };

  const getPriorityLabel = (priority?: number) => {
    switch (priority) {
      case 2:
        return t('priorityHigh');
      case 1:
        return t('priorityMedium');
      default:
        return t('priorityLow');
    }
  };

  const getTypeLabel = (type?: number) => {
    switch (type) {
      case 2:
        return t('typeOption2');
      default:
        return t('typeOption1');
    }
  };

  const getTargetTypeLabel = (targetType?: number) => {
    return targetType === 1 ? t('targetSpecific') : t('targetAll');
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-56"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {t('publishStatusLabel')}
              </span>
              <Select
                value={publishStatus || 'all'}
                onValueChange={(v) => setPublishStatus(v === 'all' ? '' : v)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('statusAll')}</SelectItem>
                  <SelectItem value="0">{t('statusDraft')}</SelectItem>
                  <SelectItem value="1">{t('statusPublished')}</SelectItem>
                  <SelectItem value="2">{t('statusRevoked')}</SelectItem>
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
                <TableHead>{t('titleLabel')}</TableHead>
                <TableHead className="w-28">{t('typeLabel')}</TableHead>
                <TableHead className="w-28">{t('priorityLabel')}</TableHead>
                <TableHead className="w-28">{t('targetTypeLabel')}</TableHead>
                <TableHead className="w-32">{t('publishStatusLabel')}</TableHead>
                <TableHead className="w-40">{t('publishTimeLabel')}</TableHead>
                <TableHead className="w-[200px]">{tCommon('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    {tCommon('loading')}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && displayData.list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    {tCommon('noData')}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                displayData.list.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(notice.id)}
                        onCheckedChange={(checked) => handleSelectOne(notice.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium max-w-[240px] truncate" title={notice.title}>
                          {notice.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeLabel(notice.type)}</TableCell>
                    <TableCell>
                      <StatusBadge variant={getPriorityVariant(notice.priority)}>
                        {getPriorityLabel(notice.priority)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{getTargetTypeLabel(notice.targetType)}</TableCell>
                    <TableCell>
                      <StatusBadge variant={getPublishStatusVariant(notice.publishStatus)}>
                        {getPublishStatusLabel(notice.publishStatus)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {notice.publishTime ? new Date(notice.publishTime).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        {notice.publishStatus === 0 && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-blue-600 p-0 h-auto"
                            onClick={() => setPublishTarget(notice)}
                          >
                            <Send className="mr-1 h-3 w-3" />
                            {t('publish')}
                          </Button>
                        )}
                        {notice.publishStatus === 1 && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-amber-600 p-0 h-auto"
                            onClick={() => setRevokeTarget(notice)}
                          >
                            <Undo2 className="mr-1 h-3 w-3" />
                            {t('revoke')}
                          </Button>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="text-green-600 p-0 h-auto"
                          onClick={() => {
                            setEditTarget(notice);
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
                          onClick={() => setDeleteTarget([notice.id])}
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
      <NoticeDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditTarget(null);
        }}
        notice={editTarget}
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

      <ConfirmDialog
        open={!!publishTarget}
        onOpenChange={(open) => !open && setPublishTarget(null)}
        onConfirm={handlePublish}
        title={t('publishConfirm')}
        description={t('publishConfirmMessage')}
        confirmLabel={t('publish')}
        isLoading={publishMutation.isPending}
      />

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title={t('revokeConfirm')}
        description={t('revokeConfirmMessage')}
        confirmLabel={t('revoke')}
        isLoading={revokeMutation.isPending}
      />
    </div>
  );
}
