'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import { CHART_COLORS } from '@/constants';
import type { ExcelProductData } from '../types';

interface QuantitySimulatorProps {
  data: ExcelProductData[];
}

interface QuantityResult {
  productName: string;
  currentQty: number;
  newQty: number;
  currentRevenue: number;
  newRevenue: number;
  revenueChange: number;
  supplyCostChange: number;
  royaltyChange: number;
  breakEvenQty: number;
}

export function QuantitySimulator({ data }: QuantitySimulatorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ExcelProductData | null>(null);
  const [quantityPercent, setQuantityPercent] = useState(0);
  const [results, setResults] = useState<QuantityResult | null>(null);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return data.filter((p) => p.unitPrice > 0).slice(0, 20);
    const q = searchQuery.toLowerCase();
    return data.filter(
      (p) =>
        p.unitPrice > 0 &&
        (p.productName.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [data, searchQuery]);

  const handleSimulate = useCallback(() => {
    if (!selectedProduct) return;

    const currentQty = selectedProduct.salesQuantity;
    const newQty = Math.max(0, Math.floor(currentQty * (1 + quantityPercent / 100)));
    const currentRevenue = currentQty * selectedProduct.unitPrice;
    const newRevenue = newQty * selectedProduct.unitPrice;

    // Estimate supply cost as ~40% of revenue
    const costRatio = 0.4;
    const supplyCostChange = (newQty - currentQty) * selectedProduct.unitPrice * costRatio;

    // Royalty change
    const royaltyRate = selectedProduct.royaltyRate / 100;
    const royaltyChange = (newRevenue - currentRevenue) * royaltyRate;

    // Break-even: how much quantity needed to cover fixed costs (assume fixed costs = current supply cost)
    const fixedCosts = currentQty * selectedProduct.unitPrice * costRatio;
    const marginPerUnit = selectedProduct.unitPrice * (1 - costRatio - royaltyRate);
    const breakEvenQty = marginPerUnit > 0 ? Math.ceil(fixedCosts / marginPerUnit) : 0;

    setResults({
      productName: selectedProduct.productName,
      currentQty,
      newQty,
      currentRevenue,
      newRevenue,
      revenueChange: newRevenue - currentRevenue,
      supplyCostChange,
      royaltyChange,
      breakEvenQty,
    });
  }, [selectedProduct, quantityPercent]);

  const chartData = results
    ? [
        {
          name: '매출',
          현재: results.currentRevenue,
          예상: results.newRevenue,
        },
      ]
    : [];

  const impactData = results
    ? [
        { name: '매출 변동', value: results.revenueChange },
        { name: '원가 변동', value: -results.supplyCostChange },
        { name: '로열티 변동', value: -results.royaltyChange },
        { name: '순이익 변동', value: results.revenueChange - results.supplyCostChange - results.royaltyChange },
      ]
    : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          판매량 시뮬레이션
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="상품명 또는 코드로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {searchQuery && (
          <div className="max-h-36 overflow-auto rounded-md border">
            {filteredProducts.map((p, idx) => (
              <button
                key={`${p.productCode}-${idx}`}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 border-b last:border-b-0 ${
                  selectedProduct?.productCode === p.productCode ? 'bg-primary/10' : ''
                }`}
                onClick={() => {
                  setSelectedProduct(p);
                  setQuantityPercent(0);
                  setResults(null);
                }}
              >
                <span className="font-medium">{p.productName}</span>
                <span className="text-muted-foreground ml-2">
                  현재 {formatNumber(p.salesQuantity)}개
                </span>
              </button>
            ))}
          </div>
        )}

        {selectedProduct && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">{selectedProduct.productName}</p>
              <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">현재 판매량: </span>
                  <span className="font-medium">{formatNumber(selectedProduct.salesQuantity)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">단가: </span>
                  <span className="font-medium">{formatCurrency(selectedProduct.unitPrice)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">현재 매출: </span>
                  <span className="font-medium">{formatCurrency(selectedProduct.actualSalesAmount)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">판매량 변동률</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={-80}
                  max={200}
                  value={quantityPercent}
                  onChange={(e) => setQuantityPercent(Number(e.target.value))}
                  className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className={`text-sm font-bold w-16 text-right ${quantityPercent > 0 ? 'text-green-600' : quantityPercent < 0 ? 'text-red-600' : ''}`}>
                  {quantityPercent > 0 ? '+' : ''}{quantityPercent}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                예상 판매량: {formatNumber(Math.max(0, Math.floor(selectedProduct.salesQuantity * (1 + quantityPercent / 100))))}개
              </p>
            </div>

            <Button onClick={handleSimulate} className="w-full">
              시뮬레이션 실행
            </Button>

            {results && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">매출 변동</p>
                    <p className={`font-bold ${results.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {results.revenueChange >= 0 ? '+' : ''}{formatCurrency(results.revenueChange)}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">원가 변동</p>
                    <p className="font-bold text-red-600">
                      {results.supplyCostChange > 0 ? '+' : ''}{formatCurrency(results.supplyCostChange)}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">로열티 변동</p>
                    <p className="font-bold">
                      {results.royaltyChange >= 0 ? '+' : ''}{formatCurrency(results.royaltyChange)}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">손익분기 판매량</p>
                    <p className="font-bold">{formatNumber(results.breakEvenQty)}개</p>
                  </div>
                </div>

                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={impactData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v: number) => `${Math.floor(v / 10000)}만`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {impactData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.value >= 0 ? CHART_COLORS[0] : CHART_COLORS[4]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
