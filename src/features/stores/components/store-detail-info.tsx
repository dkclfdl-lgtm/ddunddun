'use client';

import { MapPin, Phone, User, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STORE_STATUS_MAP } from '@/constants';
import type { StoreWithOwner } from '../types';

interface StoreDetailInfoProps {
  store: StoreWithOwner;
}

export function StoreDetailInfo({ store }: StoreDetailInfoProps) {
  const statusInfo = STORE_STATUS_MAP[store.status];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">상태</span>
            <Badge variant="secondary" className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">주소</p>
              <p className="text-sm text-muted-foreground">{store.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">연락처</p>
              <p className="text-sm text-muted-foreground">{store.phone ?? '-'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">오픈일</p>
              <p className="text-sm text-muted-foreground">{store.opening_date ?? '미정'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">등록일</p>
              <p className="text-sm text-muted-foreground">
                {new Date(store.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">점주 정보</CardTitle>
        </CardHeader>
        <CardContent>
          {store.owner_name ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">이름</p>
                  <p className="text-sm text-muted-foreground">{store.owner_name}</p>
                </div>
              </div>
              {store.owner_email && (
                <div>
                  <p className="text-sm font-medium">이메일</p>
                  <p className="text-sm text-muted-foreground">{store.owner_email}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">배정된 점주가 없습니다</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
