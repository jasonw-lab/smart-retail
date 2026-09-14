'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { SalesChartData, TimeRange, SalesDataPoint } from '../types/dashboard';

interface SalesChartProps {
  data?: SalesChartData;
}

function formatYAxis(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}

function formatTooltip(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(value);
}

export function SalesChart({ data }: SalesChartProps) {
  const t = useTranslations('dashboard');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const getPointsForRange = (range: TimeRange): SalesDataPoint[] => {
    const directPoints = data?.[range];
    if (directPoints && directPoints.length > 0) {
      return directPoints;
    }

    // 指定レンジのデータがない場合、利用可能な他のレンジから安全に補完
    const points7d = data?.['7d'];
    const points30d = data?.['30d'];
    const points1y = data?.['1y'];

    if (range === '7d') {
      if (points30d && points30d.length > 0) return points30d.slice(-7);
      if (points1y && points1y.length > 0) return points1y.slice(-7);
    } else if (range === '30d') {
      if (points7d && points7d.length > 0) return points7d;
      if (points1y && points1y.length > 0) return points1y;
    } else if (range === '1y') {
      if (points30d && points30d.length > 0) return points30d;
      if (points7d && points7d.length > 0) return points7d;
    }

    if (points7d && points7d.length > 0) return points7d;
    if (points30d && points30d.length > 0) return points30d;
    if (points1y && points1y.length > 0) return points1y;

    return [];
  };

  const renderChart = (range: TimeRange) => {
    const points = getPointsForRange(range);

    return (
      <div className="h-[300px] w-full">
        {points.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <Tooltip
                formatter={(value: number) => formatTooltip(value)}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{
                  color: '#111827',
                  fontWeight: 600,
                }}
                itemStyle={{ color: '#111827' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (value === 'sales' ? t('chart.sales') : t('chart.profit'))}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#0d9488"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#0d9488' }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#5eead4"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#5eead4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-foreground">
            {t('chart.noData')}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="col-span-2">
      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold">{t('salesTrend')}</CardTitle>
          <TabsList className="h-8">
            <TabsTrigger value="7d" className="text-xs px-2 py-1">
              {t('tabs.7d')}
            </TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-2 py-1">
              {t('tabs.30d')}
            </TabsTrigger>
            <TabsTrigger value="1y" className="text-xs px-2 py-1">
              {t('tabs.1y')}
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="7d">{renderChart('7d')}</TabsContent>
          <TabsContent value="30d">{renderChart('30d')}</TabsContent>
          <TabsContent value="1y">{renderChart('1y')}</TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
