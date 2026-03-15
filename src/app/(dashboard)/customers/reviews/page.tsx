'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants';
import { useReviews, useReviewStats } from '@/features/customers/hooks';
import { ReviewTable } from '@/features/customers/components/review-table';
import { ReviewStatsCards } from '@/features/customers/components/review-stats';
import { RatingDistribution } from '@/features/customers/components/rating-distribution';
import { SentimentChart } from '@/features/customers/components/sentiment-chart';
import { PlatformBreakdown } from '@/features/customers/components/platform-breakdown';
import { KeywordCloud } from '@/features/customers/components/keyword-cloud';
import { getStoreOptions } from '@/features/customers/mock';

const platformOptions = [
  { value: 'all', label: '전체 플랫폼' },
  { value: '네이버', label: '네이버' },
  { value: '카카오', label: '카카오' },
  { value: '구글', label: '구글' },
  { value: '배민', label: '배민' },
  { value: '요기요', label: '요기요' },
  { value: '쿠팡이츠', label: '쿠팡이츠' },
  { value: '직접', label: '직접' },
];

const sentimentOptions = [
  { value: 'all', label: '전체 감성' },
  { value: 'positive', label: '긍정' },
  { value: 'neutral', label: '중립' },
  { value: 'negative', label: '부정' },
];

const ratingOptions = [
  { value: 'all', label: '전체 별점' },
  { value: '5', label: '5점' },
  { value: '4', label: '4점' },
  { value: '3', label: '3점' },
  { value: '2', label: '2점' },
  { value: '1', label: '1점' },
];

const replyOptions = [
  { value: 'all', label: '답글 상태' },
  { value: 'true', label: '답글 완료' },
  { value: 'false', label: '미답변' },
];

export default function ReviewsPage() {
  const { reviews, filters, updateFilter, resetFilters, updateReviewReply } = useReviews();
  const stats = useReviewStats();
  const storeOptions = useMemo(() => getStoreOptions(), []);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href={ROUTES.customers}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">리뷰 모니터링</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              고객 리뷰를 모니터링하고 답글을 관리하세요
            </p>
          </div>
        </div>
      </div>

      {/* KPI 카드 */}
      <ReviewStatsCards stats={stats} />

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SentimentChart data={stats.sentimentTrend} />
        <PlatformBreakdown data={stats.platformDistribution} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RatingDistribution data={stats.ratingDistribution} />
        <KeywordCloud keywords={stats.topKeywords} />
      </div>

      {/* 필터 및 테이블 */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">리뷰 목록</CardTitle>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs">
              <RotateCcw size={14} className="mr-1" />
              필터 초기화
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 필터 바 */}
          <div className="mb-4 flex flex-wrap gap-2">
            <Input
              placeholder="리뷰 검색..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-[200px]"
            />
            <Select
              value={filters.storeId}
              onValueChange={(value) => updateFilter('storeId', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="매장 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 매장</SelectItem>
                {storeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.platform}
              onValueChange={(value) => updateFilter('platform', value)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="플랫폼" />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.rating === null ? 'all' : String(filters.rating)}
              onValueChange={(value) =>
                updateFilter('rating', value === 'all' ? null : Number(value))
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="별점" />
              </SelectTrigger>
              <SelectContent>
                {ratingOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.sentiment}
              onValueChange={(value) => updateFilter('sentiment', value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="감성" />
              </SelectTrigger>
              <SelectContent>
                {sentimentOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.hasReply === null ? 'all' : String(filters.hasReply)}
              onValueChange={(value) =>
                updateFilter('hasReply', value === 'all' ? null : value === 'true')
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="답글 상태" />
              </SelectTrigger>
              <SelectContent>
                {replyOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ReviewTable reviews={reviews} onReply={updateReviewReply} />
        </CardContent>
      </Card>
    </div>
  );
}
