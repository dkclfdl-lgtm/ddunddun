'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Tag,
  Package,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSalesSimulation } from '../hooks';
import type { SimulationRecommendation } from '../types';

const recommendationIcons: Record<SimulationRecommendation['type'], React.ReactNode> = {
  price_optimization: <Tag className="h-4 w-4" />,
  discount: <TrendingDown className="h-4 w-4" />,
  bundle: <Package className="h-4 w-4" />,
  time_based: <Clock className="h-4 w-4" />,
};

const recommendationColors: Record<SimulationRecommendation['type'], string> = {
  price_optimization: 'bg-blue-50 border-blue-200 text-blue-700',
  discount: 'bg-green-50 border-green-200 text-green-700',
  bundle: 'bg-purple-50 border-purple-200 text-purple-700',
  time_based: 'bg-orange-50 border-orange-200 text-orange-700',
};

export function SalesSimulation() {
  const { products, simulation, simulatePriceChange } = useSalesSimulation();
  const [selectedProduct, setSelectedProduct] = useState<string>('none');
  const [newPrice, setNewPrice] = useState<number>(0);

  const currentProduct = useMemo(
    () => products.find((p) => p.productCode === selectedProduct),
    [products, selectedProduct]
  );

  const handleProductChange = (productCode: string) => {
    setSelectedProduct(productCode);
    const product = products.find((p) => p.productCode === productCode);
    if (product) {
      setNewPrice(product.unitPrice);
    }
  };

  const handleSimulate = () => {
    if (selectedProduct && selectedProduct !== 'none' && newPrice > 0) {
      simulatePriceChange(selectedProduct, newPrice);
    }
  };

  const priceChangePercent = currentProduct
    ? ((newPrice - currentProduct.unitPrice) / currentProduct.unitPrice) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Input section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#03C75A]" />
            가격 시뮬레이션
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>상품 선택</Label>
              <Select value={selectedProduct} onValueChange={handleProductChange}>
                <SelectTrigger>
                  <SelectValue placeholder="상품을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {products.filter((p) => p.productCode).map((p, idx) => (
                    <SelectItem key={`${p.productCode}-${idx}`} value={p.productCode || `product-${idx}`}>
                      {p.productName} ({formatCurrency(p.unitPrice)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                새 가격{' '}
                {priceChangePercent !== 0 && (
                  <span
                    className={cn(
                      'text-xs',
                      priceChangePercent > 0 ? 'text-red-500' : 'text-[#03C75A]'
                    )}
                  >
                    ({priceChangePercent > 0 ? '+' : ''}
                    {formatPercent(priceChangePercent)})
                  </span>
                )}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  min={0}
                  step={500}
                  disabled={!selectedProduct || selectedProduct === 'none'}
                />
                <span className="flex items-center text-sm text-muted-foreground">원</span>
              </div>
              {currentProduct && (
                <div className="flex gap-1">
                  {[-20, -10, -5, 5, 10, 20].map((pct) => (
                    <Button
                      key={pct}
                      variant="outline"
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={() =>
                        setNewPrice(
                          Math.round(currentProduct.unitPrice * (1 + pct / 100) / 100) * 100
                        )
                      }
                    >
                      {pct > 0 ? '+' : ''}{pct}%
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleSimulate}
                disabled={!selectedProduct || selectedProduct === 'none' || newPrice <= 0}
                className="w-full bg-[#03C75A] hover:bg-[#02b350]"
              >
                시뮬레이션 실행
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {simulation && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">시뮬레이션 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {/* Price comparison */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">가격 변화</h4>
                  <div className="flex items-center gap-2">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">현재</p>
                      <p className="text-lg font-bold">{formatCurrency(simulation.currentPrice)}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">변경</p>
                      <p className="text-lg font-bold text-[#03C75A]">
                        {formatCurrency(simulation.newPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quantity comparison */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">예상 판매량</h4>
                  <div className="flex items-center gap-2">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">현재</p>
                      <p className="text-lg font-bold">{formatNumber(simulation.currentQuantity)}개</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">예상</p>
                      <p
                        className={cn(
                          'text-lg font-bold',
                          simulation.estimatedQuantity > simulation.currentQuantity
                            ? 'text-[#03C75A]'
                            : 'text-red-500'
                        )}
                      >
                        {formatNumber(simulation.estimatedQuantity)}개
                      </p>
                    </div>
                  </div>
                </div>

                {/* Revenue comparison */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">예상 매출</h4>
                  <div className="flex items-center gap-2">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">현재</p>
                      <p className="text-lg font-bold">{formatCurrency(simulation.currentRevenue)}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">예상</p>
                      <p
                        className={cn(
                          'text-lg font-bold',
                          simulation.revenueChange >= 0 ? 'text-[#03C75A]' : 'text-red-500'
                        )}
                      >
                        {formatCurrency(simulation.estimatedRevenue)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium',
                      simulation.revenueChange >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    )}
                  >
                    {simulation.revenueChange >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {simulation.revenueChange >= 0 ? '+' : ''}
                    {formatCurrency(simulation.revenueChange)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {simulation.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">추천 사항</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {simulation.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={cn(
                        'rounded-lg border p-4 space-y-2',
                        recommendationColors[rec.type]
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {recommendationIcons[rec.type]}
                        <span className="font-medium text-sm">{rec.title}</span>
                      </div>
                      <p className="text-sm">{rec.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {rec.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
