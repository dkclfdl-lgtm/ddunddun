'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AppSettings } from '../types';

interface ThemeToggleProps {
  theme: AppSettings['theme'];
  onThemeChange: (theme: AppSettings['theme']) => void;
}

const THEME_OPTIONS: Array<{
  value: AppSettings['theme'];
  label: string;
  icon: typeof Sun;
  description: string;
}> = [
  {
    value: 'light',
    label: '라이트',
    icon: Sun,
    description: '밝은 화면으로 표시합니다',
  },
  {
    value: 'dark',
    label: '다크',
    icon: Moon,
    description: '어두운 화면으로 표시합니다',
  },
  {
    value: 'system',
    label: '시스템',
    icon: Monitor,
    description: '시스템 설정에 따릅니다',
  },
];

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">테마 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onThemeChange(option.value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                  isSelected
                    ? 'border-[#03C75A] bg-green-50'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full',
                    isSelected ? 'bg-[#03C75A] text-white' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-[#03C75A]' : 'text-foreground'
                  )}
                >
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
