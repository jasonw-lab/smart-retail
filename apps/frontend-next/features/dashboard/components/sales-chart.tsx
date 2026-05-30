'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

type TimeRange = '7d' | '30d' | '1y';

interface SalesDataPoint {
  date: string;
  sales: number;
  profit: number;
}

interface SalesChartProps {
  data?: Record<TimeRange, SalesDataPoint[]>;
}

// モックデータ生成
function generateMockData(): Record<TimeRange, SalesDataPoint[]> {
  const generate7Days = (): SalesDataPoint[] => {
    const data: SalesDataPoint[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const sales = Math.floor(Math.random() * 50000) + 80000;
      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        sales,
        profit: Math.floor(sales * 0.25),
      });
    }
    return data;
  };

  const generate30Days = (): SalesDataPoint[] => {
    const data: SalesDataPoint[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const sales = Math.floor(Math.random() * 60000) + 70000;
      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        sales,
        profit: Math.floor(sales * 0.23),
      });
    }
    return data;
  };

  const generate1Year = (): SalesDataPoint[] => {
    const data: SalesDataPoint[] = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const sales = Math.floor(Math.random() * 500000) + 2000000;
      data.push({
        date: `${date.getFullYear()}/${date.getMonth() + 1}`,
        sales,
        profit: Math.floor(sales * 0.22),
      });
    }
    return data;
  };

  return {
    '7d': generate7Days(),
    '30d': generate30Days(),
    '1y': generate1Year(),
  };
}

const defaultData = generateMockData();

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

export function SalesChart({ data = defaultData }: SalesChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const chartData = data[timeRange];

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">売上推移</CardTitle>
        <Tabs
          value={timeRange}
          onValueChange={(v) => setTimeRange(v as TimeRange)}
        >
          <TabsList className="h-8">
            <TabsTrigger value="7d" className="text-xs px-2 py-1">
              7日間
            </TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-2 py-1">
              30日
            </TabsTrigger>
            <TabsTrigger value="1y" className="text-xs px-2 py-1">
              1年
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
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
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (value === 'sales' ? '売上' : '純利益')}
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
        </div>
      </CardContent>
    </Card>
  );
}
