'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Star, MessageCircle } from 'lucide-react';
import { DataTable } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import type { Review } from '../types';
import { ReviewDetailDialog } from './review-detail-dialog';

const sentimentMap: Record<string, { label: string; color: string }> = {
  positive: { label: '긍정', color: 'bg-green-100 text-green-700 border-transparent' },
  neutral: { label: '중립', color: 'bg-gray-100 text-gray-700 border-transparent' },
  negative: { label: '부정', color: 'bg-red-100 text-red-700 border-transparent' },
};

const platformColorMap: Record<string, string> = {
  '네이버': 'bg-green-100 text-green-700 border-transparent',
  '카카오': 'bg-yellow-100 text-yellow-700 border-transparent',
  '구글': 'bg-blue-100 text-blue-700 border-transparent',
  '배민': 'bg-cyan-100 text-cyan-700 border-transparent',
  '요기요': 'bg-red-100 text-red-700 border-transparent',
  '쿠팡이츠': 'bg-orange-100 text-orange-700 border-transparent',
  '직접': 'bg-gray-100 text-gray-700 border-transparent',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

interface ReviewTableProps {
  reviews: Review[];
  onReply: (reviewId: string, reply: string) => void;
}

export function ReviewTable({ reviews, onReply }: ReviewTableProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const columns: ColumnDef<Review>[] = [
    {
      accessorKey: 'reviewDate',
      header: '날짜',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(row.original.reviewDate, 'MM.dd')}
        </span>
      ),
      size: 80,
    },
    {
      accessorKey: 'storeName',
      header: '매장',
      cell: ({ row }) => (
        <span className="text-sm font-medium whitespace-nowrap">{row.original.storeName}</span>
      ),
      size: 80,
    },
    {
      accessorKey: 'platform',
      header: '플랫폼',
      cell: ({ row }) => (
        <Badge variant="outline" className={platformColorMap[row.original.platform] ?? ''}>
          {row.original.platform}
        </Badge>
      ),
      size: 90,
    },
    {
      accessorKey: 'author',
      header: '작성자',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.author}</span>
      ),
      size: 70,
    },
    {
      accessorKey: 'rating',
      header: '별점',
      cell: ({ row }) => <StarRating rating={row.original.rating} />,
      size: 100,
    },
    {
      accessorKey: 'content',
      header: '내용',
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground line-clamp-1 max-w-[280px]">
          {row.original.content}
        </p>
      ),
    },
    {
      accessorKey: 'sentiment',
      header: '감성',
      cell: ({ row }) => {
        const config = sentimentMap[row.original.sentiment];
        return (
          <Badge variant="outline" className={config?.color}>
            {config?.label}
          </Badge>
        );
      },
      size: 70,
    },
    {
      id: 'replyStatus',
      header: '답글',
      cell: ({ row }) => {
        const hasReply = row.original.reply !== null;
        return (
          <div className="flex items-center gap-1">
            <MessageCircle size={14} className={hasReply ? 'text-primary' : 'text-muted-foreground'} />
            <span className={`text-xs ${hasReply ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {hasReply ? '완료' : '미답변'}
            </span>
          </div>
        );
      },
      size: 80,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setSelectedReview(row.original)}
        >
          상세
        </Button>
      ),
      size: 60,
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={reviews}
        searchKey="content"
        searchPlaceholder="리뷰 내용 검색..."
        pageSize={10}
      />
      <ReviewDetailDialog
        review={selectedReview}
        open={selectedReview !== null}
        onClose={() => setSelectedReview(null)}
        onReply={onReply}
      />
    </>
  );
}
