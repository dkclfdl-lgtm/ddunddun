'use client';

import Link from 'next/link';
import { MapPin, Phone, User, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STORE_STATUS_MAP, ROUTES } from '@/constants';
import type { StoreWithOwner } from '../types';

interface StoreGridProps {
  stores: StoreWithOwner[];
}

export function StoreGrid({ stores }: StoreGridProps) {
  if (stores.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        등록된 매장이 없습니다
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stores.map((store) => {
        const statusInfo = STORE_STATUS_MAP[store.status];
        return (
          <Link key={store.id} href={ROUTES.storeDetail(store.id)}>
            <Card className="border-border transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-semibold text-foreground">{store.name}</h3>
                  <Badge variant="secondary" className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="shrink-0" />
                    <span>{store.phone ?? '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="shrink-0" />
                    <span>{store.owner_name ?? '미배정'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="shrink-0" />
                    <span>{store.opening_date ?? '미정'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
