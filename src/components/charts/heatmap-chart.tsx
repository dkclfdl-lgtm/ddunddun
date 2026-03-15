'use client';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeatmapChartProps {
  data: { x: number; y: number; value: number }[];
  xLabels: string[];
  yLabels: string[];
  colorRange?: { min: string; max: string };
  valueFormatter?: (value: number) => string;
}

function getColorIntensity(value: number, maxValue: number): string {
  if (maxValue === 0 || value === 0) return 'bg-gray-50';
  const ratio = value / maxValue;

  if (ratio < 0.1) return 'bg-green-50';
  if (ratio < 0.2) return 'bg-green-100';
  if (ratio < 0.35) return 'bg-green-200';
  if (ratio < 0.5) return 'bg-green-300';
  if (ratio < 0.65) return 'bg-green-400';
  if (ratio < 0.8) return 'bg-green-500 text-white';
  if (ratio < 0.9) return 'bg-green-600 text-white';
  return 'bg-green-700 text-white';
}

export function HeatmapChart({
  data,
  xLabels,
  yLabels,
  valueFormatter = (v) => String(v),
}: HeatmapChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const getValue = (x: number, y: number) => {
    const item = data.find((d) => d.x === x && d.y === y);
    return item?.value ?? 0;
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header row */}
          <div className="flex">
            <div className="w-16 shrink-0" />
            {xLabels.map((label, i) => (
              <div
                key={i}
                className="flex-1 min-w-[40px] text-center text-xs text-muted-foreground py-1"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {yLabels.map((yLabel, y) => (
            <div key={y} className="flex">
              <div className="w-16 shrink-0 flex items-center text-xs text-muted-foreground pr-2 justify-end">
                {yLabel}
              </div>
              {xLabels.map((xLabel, x) => {
                const value = getValue(x, y);
                const colorClass = getColorIntensity(value, maxValue);

                return (
                  <Tooltip key={`${x}-${y}`}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'flex-1 min-w-[40px] h-8 border border-white/50 rounded-sm flex items-center justify-center text-[10px] font-medium cursor-default transition-transform hover:scale-105',
                          colorClass
                        )}
                      >
                        {value > 0 ? value : ''}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">
                        {yLabel} / {xLabel}
                      </p>
                      <p className="text-sm">{valueFormatter(value)}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 justify-end">
            <span className="text-xs text-muted-foreground">낮음</span>
            <div className="flex gap-0.5">
              {['bg-green-50', 'bg-green-100', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700'].map((c) => (
                <div key={c} className={cn('w-5 h-3 rounded-sm', c)} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">높음</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
