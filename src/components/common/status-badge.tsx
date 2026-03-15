'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusConfig {
  label: string;
  color: string;
}

interface StatusBadgeProps {
  status: string;
  statusMap: Record<string, StatusConfig>;
}

export function StatusBadge({ status, statusMap }: StatusBadgeProps) {
  const config = statusMap[status];

  if (!config) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn('border-transparent font-medium', config.color)}
    >
      {config.label}
    </Badge>
  );
}
