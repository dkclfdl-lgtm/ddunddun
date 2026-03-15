'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/format';
import { ROUTES } from '@/constants';
import type { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onToggleAvailable: (id: string, isAvailable: boolean) => void;
  onTogglePopular: (id: string, isPopular: boolean) => void;
}

export function MenuItemCard({ item, onToggleAvailable, onTogglePopular }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link href={ROUTES.menuItemDetail(item.id)}>
        <div className="relative aspect-square bg-muted">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
              이미지 없음
            </div>
          )}
          {item.isPopular && (
            <Badge className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
              <Star className="h-3 w-3 mr-0.5 fill-current" />
              인기
            </Badge>
          )}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                품절
              </Badge>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={ROUTES.menuItemDetail(item.id)}
              className="font-medium text-sm text-foreground hover:underline line-clamp-1"
            >
              {item.name}
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">{item.code}</p>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {item.categoryName}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">{formatCurrency(item.price)}</span>
          <span className="text-xs text-muted-foreground">원가 {formatCurrency(item.costPrice)}</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t">
          <div className="flex items-center gap-2">
            <Switch
              checked={item.isAvailable}
              onCheckedChange={(checked) => onToggleAvailable(item.id, checked)}
              className="scale-75"
            />
            <span className={item.isAvailable ? 'text-green-600 text-xs' : 'text-red-500 text-xs'}>
              {item.isAvailable ? '판매중' : '품절'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onTogglePopular(item.id, !item.isPopular)}
            className="p-1"
          >
            <Star
              className={
                item.isPopular
                  ? 'h-4 w-4 fill-yellow-400 text-yellow-400'
                  : 'h-4 w-4 text-muted-foreground'
              }
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
