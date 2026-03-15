'use client';

import { Mail, Bell, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { AppSettings } from '../types';

const NOTIFICATION_CATEGORIES: Array<{
  key: keyof AppSettings['notifications'];
  label: string;
  description: string;
}> = [
  { key: 'sales', label: '매출 알림', description: '매출 목표 달성, 급감 경고 등' },
  { key: 'inventory', label: '재고 알림', description: '재고 부족, 유통기한 임박 등' },
  { key: 'inspection', label: '점검 알림', description: '점검 예정, 결과 보고 등' },
  { key: 'review', label: '리뷰 알림', description: '새 리뷰, 부정 리뷰 등' },
  { key: 'staff', label: '직원 알림', description: '결근, 연차 신청 등' },
  { key: 'system', label: '시스템 알림', description: '업데이트, 점검 안내 등' },
];

const CHANNELS = [
  { key: 'email' as const, label: '이메일', icon: Mail },
  { key: 'push' as const, label: '푸시', icon: Bell },
  { key: 'sms' as const, label: 'SMS', icon: MessageSquare },
];

interface NotificationPreferencesProps {
  notifications: AppSettings['notifications'];
  onPreferenceChange: (
    category: keyof AppSettings['notifications'],
    channel: 'email' | 'push' | 'sms',
    value: boolean,
  ) => void;
}

export function NotificationPreferences({
  notifications,
  onPreferenceChange,
}: NotificationPreferencesProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">알림 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* 헤더 */}
          <div className="hidden items-center border-b border-border pb-3 sm:flex">
            <div className="flex-1" />
            {CHANNELS.map((channel) => {
              const Icon = channel.icon;
              return (
                <div
                  key={channel.key}
                  className="flex w-20 flex-col items-center gap-1"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{channel.label}</span>
                </div>
              );
            })}
          </div>

          {/* 카테고리별 설정 */}
          {NOTIFICATION_CATEGORIES.map((category) => {
            const prefs = notifications[category.key];
            return (
              <div
                key={category.key}
                className="flex flex-col gap-3 border-b border-border py-4 last:border-0 sm:flex-row sm:items-center"
              >
                <div className="flex-1">
                  <Label className="text-sm font-medium">{category.label}</Label>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
                <div className="flex items-center gap-4 sm:gap-0">
                  {CHANNELS.map((channel) => (
                    <div
                      key={channel.key}
                      className="flex w-20 items-center justify-center gap-2 sm:gap-0"
                    >
                      <span className="text-xs text-muted-foreground sm:hidden">
                        {channel.label}
                      </span>
                      <Switch
                        checked={prefs[channel.key]}
                        onCheckedChange={(value) =>
                          onPreferenceChange(category.key, channel.key, value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
