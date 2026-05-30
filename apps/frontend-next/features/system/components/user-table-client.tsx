'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit, KeyRound, Upload, Download, Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsers, useDeleteUsers } from '../hooks/use-user';
import { UserDialog } from './user-dialog';
import { ResetPasswordDialog } from './reset-password-dialog';
import { DeptTree } from './dept-tree';
import { GenderLabel, type User, type UserQuery, type UserPageResult } from '../types/user';

interface UserTableClientProps {
  initialData: UserPageResult;
  initialParams: UserQuery;
}

export function UserTableClient({ initialData, initialParams }: UserTableClientProps) {
  const [params, setParams] = useState<UserQuery>(initialParams);
  const [keywords, setKeywords] = useState(initialParams.keywords || '');
  const [status, setStatus] = useState<string>(
    initialParams.status !== undefined ? String(initialParams.status) : ''
  );
  const [deptId, setDeptId] = useState<number | undefined>(initialParams.deptId);
  const [startTime, setStartTime] = useState(initialParams.startTime || '');
  const [endTime, setEndTime] = useState(initialParams.endTime || '');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number[] | null>(null);

  const { data = initialData, isLoading, isError } = useUsers(params);
  const displayData = isError ? initialData : data;
  const deleteMutation = useDeleteUsers();

  const handleSearch = () => {
    setParams({
      ...params,
      pageNum: 1,
      keywords: keywords || undefined,
      status: status ? parseInt(status) : undefined,
      deptId,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
    });
  };

  const handleReset = () => {
    setKeywords('');
    setStatus('');
    setDeptId(undefined);
    setStartTime('');
    setEndTime('');
    setParams({ pageNum: 1, pageSize: params.pageSize });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, pageNum: page });
  };

  const handleDeptSelect = (id: number | undefined) => {
    setDeptId(id);
    setParams({ ...params, pageNum: 1, deptId: id });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayData.list.map((u) => u.id));
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
    <div className="flex gap-6">
      {/* Dept Tree Sidebar */}
      <Card className="w-64 flex-shrink-0">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Search className="h-4 w-4" />
            Department Name
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <DeptTree selectedId={deptId} onSelect={handleDeptSelect} />
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* Search Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Keyword</span>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Username/Nickname/Mobile"
                  className="w-48"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Status</span>
                <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Creation Date Range</span>
                <Input
                  type="date"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-36"
                  placeholder="Start Time"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-36"
                  placeholder="End Time"
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
              Add User
            </Button>
            <Button
              variant="destructive"
              disabled={selectedIds.length === 0}
              onClick={() => setDeleteTarget(selectedIds)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Bulk Delete
            </Button>
            <Button variant="outline" className="bg-amber-500 hover:bg-amber-600 text-white border-amber-500">
              <Upload className="mr-1 h-4 w-4" />
              Import
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
                      checked={displayData.list.length > 0 && selectedIds.length === displayData.list.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Nickname</TableHead>
                  <TableHead className="w-20">Gender</TableHead>
                  <TableHead className="w-[120px]">Department</TableHead>
                  <TableHead className="w-[130px]">Mobile Number</TableHead>
                  <TableHead className="w-20">En</TableHead>
                  <TableHead className="w-[180px]">Operations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && displayData.list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  displayData.list.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectOne(user.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.nickname}</TableCell>
                      <TableCell>
                        <StatusBadge variant={user.gender === 1 ? 'info' : 'warning'}>
                          {GenderLabel[user.gender] || '-'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>{user.deptName || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{user.mobile || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge variant={user.status === 1 ? 'success' : 'muted'}>
                          {user.status === 1 ? 'ye' : 'no'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="link"
                            size="sm"
                            className="text-blue-600 p-0 h-auto"
                            onClick={() => {
                              setEditTarget(user);
                              setDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-red-600 p-0 h-auto"
                            onClick={() => setDeleteTarget([user.id])}
                          >
                            Delete
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-amber-600 p-0 h-auto"
                            onClick={() => setResetTarget(user)}
                          >
                            Reset
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
              Showing {(params.pageNum - 1) * params.pageSize + 1} to{' '}
              {Math.min(params.pageNum * params.pageSize, displayData.total)} of {displayData.total} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(params.pageNum - 1)}
                disabled={params.pageNum === 1}
              >
                Previous
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
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Dialogs */}
        <UserDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setEditTarget(null);
          }}
          user={editTarget}
        />

        <ResetPasswordDialog
          open={!!resetTarget}
          onClose={() => setResetTarget(null)}
          user={resetTarget}
        />

        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete User"
          description="Are you sure you want to delete the selected user(s)? This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
