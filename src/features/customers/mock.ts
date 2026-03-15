import type { Review, ReviewStats, CustomerAnalytics } from './types';

const storeNames = [
  { id: 'store-1', name: '강남점' },
  { id: 'store-2', name: '홍대점' },
  { id: 'store-3', name: '명동점' },
  { id: 'store-4', name: '잠실점' },
  { id: 'store-5', name: '신촌점' },
  { id: 'store-7', name: '건대점' },
  { id: 'store-8', name: '여의도점' },
  { id: 'store-10', name: '수원점' },
];

const platforms: Review['platform'][] = ['네이버', '카카오', '구글', '배민', '요기요', '쿠팡이츠', '직접'];

const positiveContents = [
  '음식이 정말 맛있어요! 특히 시그니처 메뉴가 최고였습니다. 다음에 또 방문할게요.',
  '직원분들이 너무 친절하시고 서비스가 좋았습니다. 분위기도 깔끔하고 좋아요.',
  '배달이 빠르고 음식도 따뜻하게 잘 왔어요. 포장도 깔끔합니다.',
  '재료가 신선하고 양도 푸짐해서 만족스러웠습니다. 가성비 최고!',
  '매장이 깨끗하고 인테리어도 예뻐요. 음식 맛도 좋고 재방문 의사 100%입니다.',
  '항상 맛이 일정하고 좋아요. 우리 가족 단골집이에요!',
  '신메뉴 먹어봤는데 기대 이상이었어요. 친구들한테도 추천했습니다.',
  '점심 특선 메뉴가 정말 좋아요. 가격도 합리적이고 양도 충분합니다.',
  '디저트가 맛있어서 자주 방문합니다. 커피도 맛있어요!',
  '아이들도 좋아하는 메뉴가 많아서 가족 외식하기 좋은 곳이에요.',
  '여기 파스타 진짜 맛있어요! 정성이 느껴지는 음식입니다.',
  '매번 올 때마다 서비스가 좋아서 기분이 좋습니다.',
  '깔끔한 매장에 맛있는 음식, 완벽한 조합이에요!',
  '배달 시켜먹었는데 매장에서 먹는 것처럼 맛있었어요.',
  '소스가 특별하고 맛있어요. 비법이 뭔지 궁금합니다.',
];

const neutralContents = [
  '맛은 괜찮은데 가격이 조금 비싼 편이에요. 양이 좀 더 많으면 좋겠어요.',
  '보통이에요. 나쁘지는 않은데 특별히 좋다고 할 정도는 아니에요.',
  '위치가 좋아서 자주 가는데, 메뉴가 좀 더 다양하면 좋겠습니다.',
  '음식은 괜찮은데 대기 시간이 좀 길었어요. 주말이라 그런 것 같기도 해요.',
  '전반적으로 무난합니다. 가격 대비 적당한 수준이에요.',
  '맛은 좋은데 주차가 불편해요. 주차장이 있으면 좋겠어요.',
  '테이크아웃으로 이용했는데 괜찮았어요. 포장은 깔끔했습니다.',
  '평범한 맛이에요. 특출나지는 않지만 나쁘지도 않아요.',
];

const negativeContents = [
  '주문한 지 40분이나 지나서 음식이 왔어요. 너무 느리네요.',
  '음식이 식어서 왔고 맛도 별로였습니다. 좀 실망스러웠어요.',
  '직원 태도가 불친절했습니다. 기본적인 서비스 교육이 필요해 보여요.',
  '위생 상태가 좀 걱정됩니다. 테이블이 깨끗하지 않았어요.',
  '양이 너무 적어서 가격 대비 만족스럽지 않았습니다.',
  '음식에서 이물질이 나왔어요. 정말 불쾌했습니다.',
  '예전에 비해 맛이 많이 떨어진 것 같아요. 아쉽습니다.',
  '소음이 너무 심해서 대화가 안 됐어요. 방음이 필요합니다.',
];

const positiveKeywords = ['맛있다', '친절', '깨끗', '빠르다', '신선', '가성비', '맛집', '재방문', '추천', '만족'];
const neutralKeywords = ['보통', '무난', '괜찮다', '가격', '대기', '주차', '평범'];
const negativeKeywords = ['불친절', '느리다', '식었다', '위생', '양적다', '비싸다', '실망', '이물질'];

const authorNames = [
  '김**', '이**', '박**', '최**', '정**', '강**', '조**', '윤**', '장**', '임**',
  '한**', '오**', '서**', '신**', '권**', '황**', '안**', '송**', '류**', '홍**',
];

const replyTemplates = [
  '소중한 리뷰 감사합니다! 앞으로도 좋은 맛과 서비스로 보답하겠습니다.',
  '방문해 주셔서 감사합니다. 말씀해 주신 부분 개선하도록 노력하겠습니다.',
  '리뷰 감사합니다. 더 나은 서비스를 위해 최선을 다하겠습니다.',
  '불편을 드려 죄송합니다. 해당 사항 바로 개선 조치하겠습니다. 다시 한번 사과드립니다.',
  '감사합니다! 또 방문해 주세요. 더 맛있는 메뉴로 준비하겠습니다.',
];

function generateReviewDate(index: number): string {
  const base = new Date('2026-03-15');
  const daysAgo = Math.floor(index * 1.5);
  base.setDate(base.getDate() - daysAgo);
  return base.toISOString().split('T')[0];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateReviews(): Review[] {
  const reviews: Review[] = [];

  const reviewData: { content: string; sentiment: Review['sentiment']; rating: number; keywords: string[] }[] = [];

  positiveContents.forEach((content) => {
    const rating = Math.random() > 0.3 ? 5 : 4;
    const kws = [pickRandom(positiveKeywords), pickRandom(positiveKeywords)].filter((v, i, a) => a.indexOf(v) === i);
    reviewData.push({ content, sentiment: 'positive', rating, keywords: kws });
  });

  neutralContents.forEach((content) => {
    const rating = Math.random() > 0.5 ? 3 : 4;
    const kws = [pickRandom(neutralKeywords), pickRandom(neutralKeywords)].filter((v, i, a) => a.indexOf(v) === i);
    reviewData.push({ content, sentiment: 'neutral', rating, keywords: kws });
  });

  negativeContents.forEach((content) => {
    const rating = Math.random() > 0.5 ? 2 : 1;
    const kws = [pickRandom(negativeKeywords), pickRandom(negativeKeywords)].filter((v, i, a) => a.indexOf(v) === i);
    reviewData.push({ content, sentiment: 'negative', rating, keywords: kws });
  });

  // Additional reviews to reach 55+
  for (let i = 0; i < 24; i++) {
    const sentimentRoll = Math.random();
    let sentiment: Review['sentiment'];
    let content: string;
    let rating: number;
    let keywords: string[];

    if (sentimentRoll < 0.55) {
      sentiment = 'positive';
      content = pickRandom(positiveContents);
      rating = Math.random() > 0.3 ? 5 : 4;
      keywords = [pickRandom(positiveKeywords), pickRandom(positiveKeywords)].filter((v, i, a) => a.indexOf(v) === i);
    } else if (sentimentRoll < 0.8) {
      sentiment = 'neutral';
      content = pickRandom(neutralContents);
      rating = Math.random() > 0.5 ? 3 : 4;
      keywords = [pickRandom(neutralKeywords)];
    } else {
      sentiment = 'negative';
      content = pickRandom(negativeContents);
      rating = Math.random() > 0.5 ? 2 : 1;
      keywords = [pickRandom(negativeKeywords), pickRandom(negativeKeywords)].filter((v, i, a) => a.indexOf(v) === i);
    }

    reviewData.push({ content, sentiment, rating, keywords });
  }

  reviewData.forEach((data, index) => {
    const store = storeNames[index % storeNames.length];
    const reviewDate = generateReviewDate(index);
    const hasReply = Math.random() > 0.35;
    const repliedDate = hasReply
      ? new Date(new Date(reviewDate).getTime() + 86400000 * Math.ceil(Math.random() * 3)).toISOString()
      : null;

    reviews.push({
      id: `review-${String(index + 1).padStart(3, '0')}`,
      brandId: 'brand-1',
      storeId: store.id,
      storeName: store.name,
      platform: platforms[index % platforms.length],
      author: authorNames[index % authorNames.length],
      rating: data.rating,
      content: data.content,
      reply: hasReply ? pickRandom(replyTemplates) : null,
      repliedAt: repliedDate,
      sentiment: data.sentiment,
      keywords: data.keywords,
      reviewDate,
      createdAt: reviewDate + 'T09:00:00Z',
    });
  });

  return reviews.sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime());
}

export const mockReviews: Review[] = generateReviews();

export const mockReviewStats: ReviewStats = {
  totalReviews: mockReviews.length,
  avgRating: 4.1,
  positiveRate: 58.2,
  negativeRate: 15.4,
  repliedRate: 64.5,
  ratingDistribution: [
    { rating: 5, count: 22 },
    { rating: 4, count: 15 },
    { rating: 3, count: 8 },
    { rating: 2, count: 5 },
    { rating: 1, count: 5 },
  ],
  platformDistribution: [
    { platform: '네이버', count: 18, avgRating: 4.3 },
    { platform: '카카오', count: 12, avgRating: 4.0 },
    { platform: '구글', count: 8, avgRating: 4.2 },
    { platform: '배민', count: 15, avgRating: 3.9 },
    { platform: '요기요', count: 10, avgRating: 3.8 },
    { platform: '쿠팡이츠', count: 7, avgRating: 4.1 },
    { platform: '직접', count: 5, avgRating: 4.4 },
  ],
  sentimentTrend: [
    { date: '03.01', positive: 8, neutral: 3, negative: 2 },
    { date: '03.03', positive: 6, neutral: 4, negative: 1 },
    { date: '03.05', positive: 9, neutral: 2, negative: 3 },
    { date: '03.07', positive: 7, neutral: 5, negative: 2 },
    { date: '03.09', positive: 10, neutral: 3, negative: 1 },
    { date: '03.11', positive: 5, neutral: 4, negative: 3 },
    { date: '03.13', positive: 8, neutral: 2, negative: 2 },
    { date: '03.15', positive: 7, neutral: 3, negative: 1 },
  ],
  topKeywords: [
    { keyword: '맛있다', count: 28, sentiment: 'positive' },
    { keyword: '친절', count: 22, sentiment: 'positive' },
    { keyword: '깨끗', count: 18, sentiment: 'positive' },
    { keyword: '가성비', count: 15, sentiment: 'positive' },
    { keyword: '빠르다', count: 12, sentiment: 'positive' },
    { keyword: '추천', count: 11, sentiment: 'positive' },
    { keyword: '보통', count: 9, sentiment: 'neutral' },
    { keyword: '가격', count: 8, sentiment: 'neutral' },
    { keyword: '대기', count: 7, sentiment: 'neutral' },
    { keyword: '느리다', count: 6, sentiment: 'negative' },
    { keyword: '불친절', count: 5, sentiment: 'negative' },
    { keyword: '위생', count: 4, sentiment: 'negative' },
    { keyword: '식었다', count: 3, sentiment: 'negative' },
    { keyword: '신선', count: 10, sentiment: 'positive' },
    { keyword: '재방문', count: 9, sentiment: 'positive' },
    { keyword: '실망', count: 4, sentiment: 'negative' },
  ],
};

export const mockCustomerAnalytics: CustomerAnalytics = {
  totalCustomers: 8542,
  newCustomers: 623,
  returningRate: 42.5,
  avgVisitFrequency: 2.8,
  avgSpendPerVisit: 28500,
  memberCount: 3215,
  memberSalesRatio: 62.3,
};

export const mockMonthlyCustomers = [
  { month: '2025.10', total: 7200, newCustomers: 480, returning: 2950 },
  { month: '2025.11', total: 7650, newCustomers: 520, returning: 3100 },
  { month: '2025.12', total: 8100, newCustomers: 580, returning: 3250 },
  { month: '2026.01', total: 7900, newCustomers: 450, returning: 3150 },
  { month: '2026.02', total: 8300, newCustomers: 560, returning: 3350 },
  { month: '2026.03', total: 8542, newCustomers: 623, returning: 3630 },
];

export const mockCustomerAgeGroups = [
  { group: '10대', count: 512, ratio: 6.0 },
  { group: '20대', count: 2135, ratio: 25.0 },
  { group: '30대', count: 2648, ratio: 31.0 },
  { group: '40대', count: 1879, ratio: 22.0 },
  { group: '50대+', count: 1368, ratio: 16.0 },
];

export const mockMemberSalesData = [
  { name: '회원', value: 62.3 },
  { name: '비회원', value: 37.7 },
];

export function getReviewsByFilters(
  reviews: Review[],
  filters: {
    search?: string;
    storeId?: string;
    platform?: string;
    rating?: number | null;
    sentiment?: string;
    hasReply?: boolean | null;
  },
): Review[] {
  return reviews.filter((review) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        review.content.toLowerCase().includes(searchLower) ||
        review.author.toLowerCase().includes(searchLower) ||
        review.storeName.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (filters.storeId && filters.storeId !== 'all' && review.storeId !== filters.storeId) {
      return false;
    }

    if (filters.platform && filters.platform !== 'all' && review.platform !== filters.platform) {
      return false;
    }

    if (filters.rating !== null && filters.rating !== undefined && review.rating !== filters.rating) {
      return false;
    }

    if (filters.sentiment && filters.sentiment !== 'all' && review.sentiment !== filters.sentiment) {
      return false;
    }

    if (filters.hasReply !== null && filters.hasReply !== undefined) {
      const hasReplyValue = review.reply !== null;
      if (filters.hasReply !== hasReplyValue) return false;
    }

    return true;
  });
}

export function getStoreOptions() {
  return storeNames.map((s) => ({ value: s.id, label: s.name }));
}
