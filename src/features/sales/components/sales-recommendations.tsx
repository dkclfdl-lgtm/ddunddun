'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent } from '@/lib/format';
import {
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Clock,
  BarChart3,
  Sparkles,
  Thermometer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProductSales, useSalesHourly } from '../hooks';

export function SalesRecommendations() {
  const { data: products } = useProductSales();
  const { data: hourlyData } = useSalesHourly();

  const topByRevenue = useMemo(
    () => [...products].sort((a, b) => b.totalSalesAmount - a.totalSalesAmount).slice(0, 5),
    [products]
  );

  const decliningProducts = useMemo(() => {
    // Simulate declining: products with high cancel rates
    return products
      .filter((p) => p.cancelCount / p.orderCount > 0.005)
      .sort((a, b) => b.cancelCount / b.orderCount - a.cancelCount / a.orderCount)
      .slice(0, 5);
  }, [products]);

  const categoryRanking = useMemo(() => {
    const catMap = new Map<string, number>();
    products.forEach((p) => {
      catMap.set(p.category, (catMap.get(p.category) || 0) + p.totalSalesAmount);
    });
    return Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, revenue], index) => ({ category, revenue, rank: index + 1 }));
  }, [products]);

  const peakHours = useMemo(() => {
    return [...hourlyData]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
  }, [hourlyData]);

  const pricingSuggestions = useMemo(() => {
    return products
      .filter((p) => p.orderCount > 300)
      .map((p) => {
        const avgActualPrice = p.actualSalesAmount / p.actualSalesQty;
        const priceDiff = ((p.unitPrice - avgActualPrice) / p.unitPrice) * 100;
        return {
          productName: p.productName,
          currentPrice: p.unitPrice,
          avgActualPrice: Math.round(avgActualPrice),
          discount: priceDiff,
        };
      })
      .filter((p) => p.discount > 1)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 5);
  }, [products]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Top selling by revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Award className="h-5 w-5 text-[#03C75A]" />
          <CardTitle className="text-base">매출 상위 상품</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topByRevenue.map((product, index) => (
              <div key={`${product.productCode}-${index}`} className="flex items-center gap-3">
                <div
                  className={cn(
                    'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold',
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-muted text-muted-foreground'
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">{product.productName}</span>
                  <span className="text-xs text-muted-foreground ml-2">{product.category}</span>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(product.totalSalesAmount)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Declining products */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <CardTitle className="text-base">주의 필요 상품</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {decliningProducts.map((product, idx) => {
              const cancelRate = (product.cancelCount / product.orderCount) * 100;
              return (
                <div key={`${product.productCode}-${idx}`} className="flex items-center gap-3">
                  <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{product.productName}</span>
                    <div className="flex gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs text-red-500 border-red-200">
                        취소율 {formatPercent(cancelRate)}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    취소 {product.cancelCount}건
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pricing suggestions */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-base">가격 최적화 제안</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pricingSuggestions.map((item, idx) => (
              <div key={`${item.productName}-${idx}`} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{item.productName}</span>
                  <p className="text-xs text-muted-foreground">
                    정가 {formatCurrency(item.currentPrice)} / 실평균 {formatCurrency(item.avgActualPrice)}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                  할인율 {formatPercent(item.discount)}
                </Badge>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              실판매단가가 정가보다 낮은 상품입니다. 정가 조정을 검토하세요.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category performance */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-base">카테고리별 순위</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryRanking.map((cat) => (
              <div key={cat.category} className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted-foreground w-5">
                  {cat.rank}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cat.category}</span>
                    <span className="text-sm">{formatCurrency(cat.revenue)}</span>
                  </div>
                  <div className="bg-muted rounded-full h-1.5 mt-1">
                    <div
                      className="bg-purple-500 h-1.5 rounded-full"
                      style={{
                        width: `${(cat.revenue / categoryRanking[0].revenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Peak hours */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-base">피크 시간대</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {peakHours.map((hour, index) => (
              <div key={hour.hour} className="flex items-center gap-3">
                <div
                  className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold',
                    index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {hour.hour}시
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      {hour.hour}:00 ~ {hour.hour + 1}:00
                    </span>
                    <span className="text-sm font-semibold">{formatCurrency(hour.revenue)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{hour.orders}건 주문</span>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              피크 시간대에 인력 배치와 재고를 충분히 확보하세요.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seasonal trends */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Thermometer className="h-5 w-5 text-cyan-500" />
          <CardTitle className="text-base">시즌 트렌드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-cyan-600" />
              <div>
                <p className="text-sm font-medium text-cyan-800">봄 시즌 상승 예상</p>
                <p className="text-xs text-cyan-600">
                  3-4월 매출 전년 대비 8-12% 상승 추세
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">주류 카테고리 성장</p>
                <p className="text-xs text-green-600">
                  하이볼, 크림생맥주 등 신규 주류 매출 증가 중
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-800">배달 채널 비중 확인</p>
                <p className="text-xs text-orange-600">
                  배달 비중 증가 시 수수료 관리 필요
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
