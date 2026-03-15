'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import type { CategorySummary } from '../types';
import type { ExcelProductData } from '../types';

interface CategoryDetailTableProps {
  categories: CategorySummary[];
  products: ExcelProductData[];
}

export function CategoryDetailTable({ categories, products }: CategoryDetailTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const sorted = [...categories].sort((a, b) => b.totalSalesAmount - a.totalSalesAmount);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">카테고리 상세</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-8"></TableHead>
                <TableHead>분류명</TableHead>
                <TableHead className="text-right">상품수</TableHead>
                <TableHead className="text-right">총매출</TableHead>
                <TableHead className="text-right">총판매량</TableHead>
                <TableHead className="text-right">평균단가</TableHead>
                <TableHead className="text-right">주문수</TableHead>
                <TableHead className="text-right">취소율</TableHead>
                <TableHead className="text-right">매장비율</TableHead>
                <TableHead className="text-right">포장비율</TableHead>
                <TableHead className="text-right">배달비율</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((cat, catIdx) => {
                const isExpanded = expandedCategories.has(cat.categoryName);
                const categoryProducts = products
                  .filter((p) => p.categoryName === cat.categoryName)
                  .sort((a, b) => b.actualSalesAmount - a.actualSalesAmount);

                return (
                  <TableRow key={cat.categoryCode || cat.categoryName || catIdx} className="group">
                    <TableCell className="p-0" colSpan={11}>
                      <table className="w-full">
                        <tbody>
                          <tr
                            className="cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => toggleCategory(cat.categoryName)}
                          >
                            <td className="w-8 px-2 py-2">
                              <Button variant="ghost" size="icon" className="h-5 w-5">
                                {isExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </Button>
                            </td>
                            <td className="px-4 py-2 font-medium">{cat.categoryName}</td>
                            <td className="px-4 py-2 text-right">{formatNumber(cat.productCount)}</td>
                            <td className="px-4 py-2 text-right font-medium">{formatCurrency(cat.totalSalesAmount)}</td>
                            <td className="px-4 py-2 text-right">{formatNumber(cat.totalQuantity)}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(cat.avgUnitPrice)}</td>
                            <td className="px-4 py-2 text-right">{formatNumber(cat.totalOrders)}</td>
                            <td className="px-4 py-2 text-right">{formatPercent(cat.cancelRate)}</td>
                            <td className="px-4 py-2 text-right">{formatPercent(cat.dineInRatio)}</td>
                            <td className="px-4 py-2 text-right">{formatPercent(cat.takeoutRatio)}</td>
                            <td className="px-4 py-2 text-right">{formatPercent(cat.deliveryRatio)}</td>
                          </tr>
                          {isExpanded &&
                            categoryProducts.map((prod, prodIdx) => (
                              <tr key={`${prod.productCode}-${prodIdx}`} className="bg-muted/20 text-sm">
                                <td className="w-8 px-2 py-1.5"></td>
                                <td className="px-4 py-1.5 pl-10 text-muted-foreground">{prod.productName}</td>
                                <td className="px-4 py-1.5 text-right text-muted-foreground">-</td>
                                <td className="px-4 py-1.5 text-right">{formatCurrency(prod.actualSalesAmount)}</td>
                                <td className="px-4 py-1.5 text-right">{formatNumber(prod.salesQuantity)}</td>
                                <td className="px-4 py-1.5 text-right">{formatCurrency(prod.unitPrice)}</td>
                                <td className="px-4 py-1.5 text-right">{formatNumber(prod.orderCount)}</td>
                                <td className="px-4 py-1.5 text-right">
                                  {formatPercent(
                                    prod.orderCount > 0
                                      ? (prod.cancelCount / prod.orderCount) * 100
                                      : 0
                                  )}
                                </td>
                                <td className="px-4 py-1.5 text-right">{formatNumber(prod.dineInOrders)}</td>
                                <td className="px-4 py-1.5 text-right">{formatNumber(prod.takeoutOrders)}</td>
                                <td className="px-4 py-1.5 text-right">{formatNumber(prod.deliveryOrders)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
