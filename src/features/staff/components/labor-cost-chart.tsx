'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCompactCurrency, formatNumber } from '@/lib/format';
import { CHART_COLORS } from '@/constants';
import { useLaborCost } from '../hooks';

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-white p-3 shadow-md">
      <p className="mb-2 text-sm font-medium">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {entry.dataKey === 'headcount'
              ? `${formatNumber(entry.value)}명`
              : formatCompactCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LaborCostChart() {
  const { data } = useLaborCost();

  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 인건비 추이</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickFormatter={(v: string) => {
                  const [, month] = v.split('-');
                  return `${parseInt(month, 10)}월`;
                }}
              />
              <YAxis
                yAxisId="cost"
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) => formatCompactCurrency(v)}
              />
              <YAxis
                yAxisId="count"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) => `${v}명`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar
                yAxisId="cost"
                dataKey="totalCost"
                name="총 인건비"
                fill={CHART_COLORS[0]}
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
              <Bar
                yAxisId="cost"
                dataKey="overtimeCost"
                name="초과근무 비용"
                fill={CHART_COLORS[2]}
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
              <Line
                yAxisId="count"
                type="monotone"
                dataKey="headcount"
                name="인원수"
                stroke={CHART_COLORS[1]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
