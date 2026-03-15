export interface Review {
  id: string;
  brandId: string;
  storeId: string;
  storeName: string;
  platform: '네이버' | '카카오' | '구글' | '배민' | '요기요' | '쿠팡이츠' | '직접';
  author: string;
  rating: number;
  content: string;
  reply: string | null;
  repliedAt: string | null;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  reviewDate: string;
  createdAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  avgRating: number;
  positiveRate: number;
  negativeRate: number;
  repliedRate: number;
  ratingDistribution: { rating: number; count: number }[];
  platformDistribution: { platform: string; count: number; avgRating: number }[];
  sentimentTrend: { date: string; positive: number; neutral: number; negative: number }[];
  topKeywords: { keyword: string; count: number; sentiment: string }[];
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningRate: number;
  avgVisitFrequency: number;
  avgSpendPerVisit: number;
  memberCount: number;
  memberSalesRatio: number;
}

export interface ReviewFilters {
  search: string;
  storeId: string;
  platform: string;
  rating: number | null;
  sentiment: string;
  hasReply: boolean | null;
  dateRange: { from: string; to: string } | null;
}
