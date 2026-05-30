'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Search, RotateCcw, Download, Settings, Globe } from 'lucide-react';
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
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { useLogs } from '../hooks/use-log';
import type { LogQuery, LogPageResult } from '../types/log';

interface LogTableClientProps {
  initialData: LogPageResult;
  initialParams: LogQuery;
}

const MODULE_COLORS: Record<string, string> = {
  'Login Events': '#2dd4bf',
  'Inventory Updates': '#f97316',
  'System Config': '#ef4444',
  'User': '#3b82f6',
  'Product': '#22c55e',
  'Role': '#8b5cf6',
  'Alert': '#ec4899',
};

export function LogTableClient({ initialData, initialParams }: LogTableClientProps) {
  const [params, setParams] = useState<LogQuery>(initialParams);
  const [keywords, setKeywords] = useState(initialParams.keywords || '');
  const [startTime, setStartTime] = useState(initialParams.startTime || '');
  const [endTime, setEndTime] = useState(initialParams.endTime || '');
  const [pageSize, setPageSize] = useState(String(params.pageSize));

  const { data = initialData, isLoading, isError } = useLogs(params);
  const displayData = isError ? initialData : data;

  // Calculate module activity stats
  const moduleStats = useMemo(() => {
    const stats: Record<string, number> = {};
    displayData.list.forEach((log) => {
      const module = log.module;
      stats[module] = (stats[module] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({
      name,
      value,
      color: MODULE_COLORS[name] || '#9ca3af',
    }));
  }, [displayData.list]);

  // Mock response time data
  const responseTimeData = [
    { time: '09:45 AM', value: 45 },
    { time: 'PEAK HOUR (01:00 PM)', value: 120 },
    { time: '04:00 PM', value: 75 },
  ];

  const handleSearch = () => {
    setParams({
      ...params,
      pageNum: 1,
      keywords: keywords || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
    });
  };

  const handleReset = () => {
    setKeywords('');
    setStartTime('');
    setEndTime('');
    setParams({ pageNum: 1, pageSize: params.pageSize });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, pageNum: page });
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(size);
    setParams({ ...params, pageNum: 1, pageSize: Number(size) });
  };

  const totalPages = Math.ceil((displayData.total || 0) / params.pageSize);

  const getModuleBadgeVariant = (module: string): 'warning' | 'success' | 'error' | 'info' => {
    switch (module) {
      case 'DICTIONARY':
        return 'warning';
      case 'DEPT':
        return 'success';
      case 'MENU':
        return 'info';
      case 'ROLE':
        return 'error';
      case 'USER':
        return 'info';
      case 'LOGIN':
        return 'success';
      default:
        return 'info';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Keyword</span>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter log content"
                className="w-48"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Operation Time Range</span>
              <Input
                type="date"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-36"
                placeholder="Start Date"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="date"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-36"
                placeholder="End Date"
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

      {/* Table Header */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            System Log Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[160px]">OPERATION TIME</TableHead>
                <TableHead className="w-[100px]">OPERATOR</TableHead>
                <TableHead className="w-[100px]">MODULE</TableHead>
                <TableHead>CONTENT</TableHead>
                <TableHead className="w-[130px]">IP ADDRESS</TableHead>
                <TableHead className="w-[80px]">REGION</TableHead>
                <TableHead className="w-[100px]">BROWSER</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && displayData.list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No logs found
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                displayData.list.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm font-mono">{log.createTime}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">
                          {log.operator.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm">{log.operator}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={getModuleBadgeVariant(log.module)}>
                        {log.module}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm" title={log.content}>
                      {log.content}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                    <TableCell className="text-sm">{log.region || '0.0'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        {log.browser || 'Chrome'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Total {displayData.total} records
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Page size</span>
            <Select value={pageSize} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
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
            {totalPages > 5 && (
              <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)}>
                {totalPages}
              </Button>
            )}
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
            <span className="text-sm text-muted-foreground">Goto</span>
            <Input
              className="w-16"
              placeholder=""
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  const page = parseInt(target.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Module Activity Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Module Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moduleStats.length > 0 ? moduleStats : [
                        { name: 'Login Events', value: 24, color: '#2dd4bf' },
                        { name: 'Inventory Updates', value: 47, color: '#f97316' },
                        { name: 'System Config', value: 12, color: '#ef4444' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {(moduleStats.length > 0 ? moduleStats : [
                        { name: 'Login Events', value: 24, color: '#2dd4bf' },
                        { name: 'Inventory Updates', value: 47, color: '#f97316' },
                        { name: 'System Config', value: 12, color: '#ef4444' },
                      ]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-teal-500" />
                  <span className="text-sm">Login Events</span>
                  <span className="text-sm font-medium ml-auto">24%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm">Inventory Updates</span>
                  <span className="text-sm font-medium ml-auto">47%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">System Config</span>
                  <span className="text-sm font-medium ml-auto">12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Response Time Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Avg. Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={responseTimeData}>
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 150]}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="#2dd4bf"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground py-4 border-t">
        2026 SmartRetail Pro Management System. All rights reserved.
      </div>
    </div>
  );
}
