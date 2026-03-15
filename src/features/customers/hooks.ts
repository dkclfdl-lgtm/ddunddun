'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Review, ReviewStats, CustomerAnalytics, ReviewFilters } from './types';
import {
  mockReviews,
  mockReviewStats,
  mockCustomerAnalytics,
  getReviewsByFilters,
} from './mock';

const defaultFilters: ReviewFilters = {
  search: '',
  storeId: 'all',
  platform: 'all',
  rating: null,
  sentiment: 'all',
  hasReply: null,
  dateRange: null,
};

export function useReviews(initialFilters?: Partial<ReviewFilters>) {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [filters, setFilters] = useState<ReviewFilters>({
    ...defaultFilters,
    ...initialFilters,
  });

  const filteredReviews = useMemo(() => {
    return getReviewsByFilters(reviews, {
      search: filters.search,
      storeId: filters.storeId,
      platform: filters.platform,
      rating: filters.rating,
      sentiment: filters.sentiment,
      hasReply: filters.hasReply,
    });
  }, [reviews, filters]);

  const updateFilter = useCallback(<K extends keyof ReviewFilters>(key: K, value: ReviewFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const updateReviewReply = useCallback((reviewId: string, reply: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, reply, repliedAt: new Date().toISOString() }
          : r,
      ),
    );
  }, []);

  return {
    reviews: filteredReviews,
    allReviews: reviews,
    filters,
    updateFilter,
    resetFilters,
    updateReviewReply,
  };
}

export function useReviewStats(): ReviewStats {
  return mockReviewStats;
}

export function useCustomerAnalytics(): CustomerAnalytics {
  return mockCustomerAnalytics;
}

export function useReviewReply() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReply = useCallback(
    async (reviewId: string, reply: string): Promise<boolean> => {
      setIsSubmitting(true);
      // 시뮬레이션된 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsSubmitting(false);
      void reviewId;
      void reply;
      return true;
    },
    [],
  );

  return { isSubmitting, submitReply };
}
