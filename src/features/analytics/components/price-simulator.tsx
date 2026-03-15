'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Calculator, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { CHART_COLORS } from '@/constants';
import { usePriceSimulation } from '../hooks';
import type { ExcelProductData } from '../types';

interface PriceSimulatorProps {
  data: ExcelProductData[];
}

export function PriceSimulator({ data }: PriceSimulatorProps) {
  const { simulations, simulate, batchSimulate, clearSimulations } = usePriceSimulation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ExcelProductData | null>(null);
  const [pricePercent, setPricePercent] = useState(0);
  const [batchCategory, setBatchCategory] = useState('none');
  const [batchPercent, setBatchPercent] = useState(0);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return data.slice(0, 20);
    const q = searchQuery.toLowerCase();
    return data.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.productCode.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [data, searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set(data.map((p) => p.categoryName).filter(Boolean));
    return Array.from(cats).sort();
  }, [data]);

  const handleSelectProduct = useCallback((product: ExcelProductData) => {
    setSelectedProduct(product);
    setPricePercent(0);
  }, []);

  const handleSimulate = useCallback(() => {
    if (!selectedProduct) return;
    const newPrice = Math.floor(selectedProduct.unitPrice * (1 + pricePercent / 100));
    simulate(selectedProduct, newPrice);
  }, [selectedProduct, pricePercent, simulate]);

  const handleBatchSimulate = useCallback(() => {
    if (!batchCategory || batchCategory === 'none') return;
    const categoryProducts = data.filter((p) => p.categoryName === batchCategory && p.unitPrice > 0);
    batchSimulate(categoryProducts, batchPercent);
  }, [data, batchCategory, batchPercent, batchSimulate]);

  const currentSimulation = simulations.find(
    (s) => s.productCode === selectedProduct?.productCode
  );

  const chartData = currentSimulation
    ? [
        { name: '현재', 매출: currentSimulation.currentRevenue, 판매량: currentSimulation.currentQuantity },
        { name: '예상', 매출: currentSimulation.estimatedRevenue, 판매량: currentSimulation.estimatedQuantity },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Single Product Simulation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              개별 상품 가격 시뮬레이션
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

            {/* Product List */}
            {searchQuery && (
              <div className="max-h-36 overflow-auto rounded-md border">
                {filteredProducts.map((p, idx) => (
                  <button
                    key={`${p.productCode}-${idx}`}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
                      selectedProduct?.productCode === p.productCode ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => handleSelectProduct(p)}
                  >
                    <span className="font-medium">{p.productName}</span>
                    <span className="text-muted-foreground ml-2">
                      ({p.categoryName}) {formatCurrency(p.unitPrice)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Product Info */}
            {selectedProduct && (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium">{selectedProduct.productName}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">현재 가격: </span>
                      <span className="font-medium">{formatCurrency(selectedProduct.unitPrice)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">판매량: </span>
                      <span className="font-medium">{formatNumber(selectedProduct.salesQuantity)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">매출: </span>
                      <span className="font-medium">{formatCurrency(selectedProduct.actualSalesAmount)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">탄력성: </span>
                      <span className="font-medium">{currentSimulation?.elasticity.toFixed(2) ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Price Adjustment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">가격 변동률</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={-50}
                      max={100}
                      value={pricePercent}
                      onChange={(e) => setPricePercent(Number(e.target.value))}
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className={`text-sm font-bold w-16 text-right ${pricePercent > 0 ? 'text-green-600' : pricePercent < 0 ? 'text-red-600' : ''}`}>
                      {pricePercent > 0 ? '+' : ''}{pricePercent}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    새 가격: {formatCurrency(Math.floor(selectedProduct.unitPrice * (1 + pricePercent / 100)))}
                  </p>
                </div>

                <Button onClick={handleSimulate} className="w-full">
                  시뮬레이션 실행
                </Button>

                {/* Results */}
                {currentSimulation && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded bg-muted/30 text-center">
                        <p className="text-xs text-muted-foreground">예상 판매량</p>
                        <p className="font-bold">{formatNumber(currentSimulation.estimatedQuantity)}</p>
                      </div>
                      <div className="p-2 rounded bg-muted/30 text-center">
                        <p className="text-xs text-muted-foreground">예상 매출</p>
                        <p className="font-bold">{formatCurrency(currentSimulation.estimatedRevenue)}</p>
                      </div>
                      <div className="p-2 rounded bg-muted/30 text-center">
                        <p className="text-xs text-muted-foreground">매출 변동</p>
                        <p className={`font-bold ${currentSimulation.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {currentSimulation.revenueChange > 0 ? '+' : ''}
                          {formatCurrency(currentSimulation.revenueChange)}
                        </p>
                      </div>
                      <div className="p-2 rounded bg-muted/30 text-center">
                        <p className="text-xs text-muted-foreground">변동률</p>
                        <p className={`font-bold ${currentSimulation.revenueChangePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {currentSimulation.revenueChangePercent > 0 ? '+' : ''}
                          {formatPercent(currentSimulation.revenueChangePercent)}
                        </p>
                      </div>
                    </div>

                    {/* Before/After Chart */}
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(v: number) => `${Math.floor(v / 10000)}만`} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Bar dataKey="매출" radius={[4, 4, 0, 0]}>
                            <Cell fill={CHART_COLORS[0]} />
                            <Cell fill={currentSimulation.revenueChange >= 0 ? CHART_COLORS[0] : CHART_COLORS[4]} />
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

        {/* Batch Simulation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">카테고리 일괄 시뮬레이션</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">카테고리 선택</label>
              <Select value={batchCategory} onValueChange={setBatchCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(Boolean).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">가격 변동률</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={-50}
                  max={100}
                  value={batchPercent}
                  onChange={(e) => setBatchPercent(Number(e.target.value))}
                  className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className={`text-sm font-bold w-16 text-right ${batchPercent > 0 ? 'text-green-600' : batchPercent < 0 ? 'text-red-600' : ''}`}>
                  {batchPercent > 0 ? '+' : ''}{batchPercent}%
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleBatchSimulate} className="flex-1" disabled={!batchCategory || batchCategory === 'none'}>
                일괄 시뮬레이션
              </Button>
              <Button variant="outline" onClick={clearSimulations}>
                초기화
              </Button>
            </div>

            {/* Batch Results */}
            {simulations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{simulations.length}개 상품 결과</p>
                  <Badge variant={
                    simulations.reduce((s, r) => s + r.revenueChange, 0) >= 0 ? 'default' : 'destructive'
                  }>
                    총 {simulations.reduce((s, r) => s + r.revenueChange, 0) >= 0 ? '+' : ''}
                    {formatCurrency(simulations.reduce((s, r) => s + r.revenueChange, 0))}
                  </Badge>
                </div>
                <div className="max-h-[400px] overflow-auto rounded-md border">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b bg-muted/50">
                        <th className="px-2 py-1.5 text-left">상품</th>
                        <th className="px-2 py-1.5 text-right">현재가격</th>
                        <th className="px-2 py-1.5 text-right">새가격</th>
                        <th className="px-2 py-1.5 text-right">예상매출변동</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulations.map((sim, idx) => (
                        <tr key={`${sim.productCode}-${idx}`} className="border-b">
                          <td className="px-2 py-1.5">{sim.productName}</td>
                          <td className="px-2 py-1.5 text-right">{formatCurrency(sim.currentPrice)}</td>
                          <td className="px-2 py-1.5 text-right">{formatCurrency(sim.newPrice)}</td>
                          <td className={`px-2 py-1.5 text-right font-medium ${sim.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {sim.revenueChange >= 0 ? '+' : ''}{formatCurrency(sim.revenueChange)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
