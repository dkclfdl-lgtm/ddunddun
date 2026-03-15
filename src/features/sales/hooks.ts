'use client';

import { useMemo, useCallback, useState } from 'react';
import { isWithinInterval } from 'date-fns';
import type {
  SalesDailyData,
  SalesHourlyData,
  SalesByMenuData,
  SalesComparison,
  SalesTarget,
  SalesFilters,
  ProductSalesData,
  SalesSimulation,
  SimulationRecommendation,
} from './types';
import {
  getDailySalesData,
  getHourlySalesData,
  getSalesByMenu,
  getSalesComparison,
  getSalesTargets,
  getProductSalesData,
} from './mock';
import { useAnalyticsStore } from '@/features/analytics/store';

export function useSalesOverview(filters?: SalesFilters) {
  const analyticsData = useAnalyticsStore((s) => s.uploadedData);
  const hasAnalytics = analyticsData.length > 0;

  const data = useMemo(() => {
    const allData = getDailySalesData();
    if (!filters?.dateRange) return allData;

    return allData.filter((item) => {
      const itemDate = new Date(item.date);
      return isWithinInterval(itemDate, {
        start: filters.dateRange!.from,
        end: filters.dateRange!.to,
      });
    });
  }, [filters?.dateRange]);

  const summary = useMemo(() => {
    // If analytics data is available, use it for totals
    if (hasAnalytics) {
      const totalRevenue = analyticsData.reduce((s, p) => s + p.actualSalesAmount, 0);
      const totalOrders = analyticsData.reduce((s, p) => s + p.orderCount, 0);
      const salesDays = analyticsData[0]?.salesDays || 73;
      const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
      const totalCardSales = analyticsData.reduce((s, p) => s + p.cardPayment, 0);
      const totalPayment = analyticsData.reduce((s, p) => s + p.paymentAmount, 0);
      const cardPaymentRate = totalPayment > 0 ? (totalCardSales / totalPayment) * 100 : 0;
      const dailyRevenue = Math.round(totalRevenue / salesDays);

      return {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        cardPaymentRate,
        previousRevenue: Math.round(totalRevenue * 0.92),
        previousOrders: Math.round(totalOrders * 0.95),
        previousAvgOrderValue: Math.round(avgOrderValue * 0.97),
        previousCardPaymentRate: cardPaymentRate - 2.3,
        dailyRevenue,
      };
    }

    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const totalCardSales = data.reduce((sum, d) => sum + d.cardSales, 0);
    const cardPaymentRate = totalRevenue > 0 ? (totalCardSales / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      cardPaymentRate,
      previousRevenue: Math.round(totalRevenue * 0.92),
      previousOrders: Math.round(totalOrders * 0.95),
      previousAvgOrderValue: Math.round(avgOrderValue * 0.97),
      previousCardPaymentRate: cardPaymentRate - 2.3,
    };
  }, [data, hasAnalytics, analyticsData]);

  return { data, summary, isLoading: false };
}

export function useSalesHourly(filters?: SalesFilters) {
  const data = useMemo(() => {
    return getHourlySalesData();
  }, []);

  return { data, isLoading: false };
}

export function useSalesByMenu(filters?: SalesFilters) {
  const analyticsData = useAnalyticsStore((s) => s.uploadedData);
  const hasAnalytics = analyticsData.length > 0;

  const allData = useMemo(() => {
    if (hasAnalytics) {
      // Generate menu sales from analytics data
      const totalRevenue = analyticsData.reduce((s, p) => s + p.actualSalesAmount, 0);
      return analyticsData
        .filter((p) => p.actualSalesAmount > 0)
        .sort((a, b) => b.actualSalesAmount - a.actualSalesAmount)
        .slice(0, 50)
        .map((p): SalesByMenuData => ({
          menuName: p.productName,
          category: p.categoryName,
          quantity: p.salesQuantity,
          revenue: p.actualSalesAmount,
          percentage: totalRevenue > 0
            ? Number(((p.actualSalesAmount / totalRevenue) * 100).toFixed(1))
            : 0,
        }));
    }
    return getSalesByMenu();
  }, [hasAnalytics, analyticsData]);

  const data = useMemo(() => {
    if (!filters?.category || filters.category === 'all') return allData;
    return allData.filter((item) => item.category === filters.category);
  }, [allData, filters?.category]);

  const categories = useMemo(() => {
    const cats = new Set(allData.map((item) => item.category).filter(Boolean));
    return Array.from(cats);
  }, [allData]);

  return { data, categories, isLoading: false };
}

export function useSalesComparison(filters?: SalesFilters) {
  const analyticsData = useAnalyticsStore((s) => s.uploadedData);
  const hasAnalytics = analyticsData.length > 0;

  const data = useMemo(() => {
    if (hasAnalytics) {
      const totalRevenue = analyticsData.reduce((s, p) => s + p.actualSalesAmount, 0);
      const salesDays = analyticsData[0]?.salesDays || 73;
      // Distribute into Jan, Feb, Mar
      const janDays = 31;
      const febDays = 28;
      const marDays = Math.max(0, salesDays - 59);
      const dailyAvg = totalRevenue / salesDays;

      const months = [
        { period: '1월', days: janDays, factor: 0.95 },
        { period: '2월', days: febDays, factor: 0.92 },
        { period: '3월', days: marDays, factor: 1.15 },
      ];

      return months
        .filter((m) => m.days > 0)
        .map((m) => {
          const current = Math.round(dailyAvg * m.days * m.factor);
          const previous = Math.round(current * 0.92);
          return {
            period: m.period,
            current,
            previous,
            change: current - previous,
            changePercent: previous > 0
              ? Number((((current - previous) / previous) * 100).toFixed(2))
              : 0,
          };
        });
    }
    return getSalesComparison().filter((item) => item.current > 0);
  }, [hasAnalytics, analyticsData]);

  return { data, isLoading: false };
}

export function useSalesTargets() {
  const data = useMemo(() => getSalesTargets(), []);

  const overallAchievement = useMemo(() => {
    const withData = data.filter((t) => t.actualRevenue > 0);
    if (withData.length === 0) return 0;
    const totalTarget = withData.reduce((sum, t) => sum + t.targetRevenue, 0);
    const totalActual = withData.reduce((sum, t) => sum + t.actualRevenue, 0);
    return Number(((totalActual / totalTarget) * 100).toFixed(1));
  }, [data]);

  return { data, overallAchievement, isLoading: false };
}

export function useProductSales(filters?: SalesFilters) {
  const analyticsData = useAnalyticsStore((s) => s.uploadedData);
  const hasAnalytics = analyticsData.length > 0;

  const allData = useMemo(() => {
    if (hasAnalytics) {
      // Convert analytics ExcelProductData to ProductSalesData
      return analyticsData.map((p): ProductSalesData => ({
        productCode: p.productCode,
        productName: p.productName,
        category: p.categoryName,
        categoryCode: p.categoryCode,
        salesDays: p.salesDays,
        orderCount: p.orderCount,
        orderItems: p.orderItems,
        orderQuantity: p.orderQuantity,
        unitPrice: p.unitPrice,
        totalSalesAmount: p.totalSalesAmount,
        cancelCount: p.cancelCount,
        cancelQuantity: p.cancelQuantity,
        cancelAmount: p.cancelAmount,
        discountQuantity: p.discountQuantity,
        discountAmount: p.discountAmount,
        actualSalesQty: p.salesQuantity,
        actualUnitPrice: p.actualUnitPrice,
        actualSalesAmount: p.actualSalesAmount,
        supplyPrice: p.supplyPrice,
        vat: p.vat,
        netSalesAmount: p.netSalesAmount,
        paymentAmount: p.paymentAmount,
        cashPayment: p.cashPayment,
        cardPayment: p.cardPayment,
        dineInOrders: p.dineInOrders,
        dineInSales: p.dineInSales,
        takeoutOrders: p.takeoutOrders,
        takeoutSales: p.takeoutSales,
        deliveryOrders: p.deliveryOrders,
        deliverySales: p.deliverySales,
        royaltyRate: p.royaltyRate,
        royaltyAmount: p.royaltyAmount,
        normalSalesQty: p.normalSalesQty,
        serviceQuantity: p.serviceQuantity,
        returnQuantity: p.returnQuantity,
        memberOrders: p.memberOrders,
        customerAverage: p.customerAverage,
        setQuantity: p.setQuantity,
        setAmount: p.setAmount,
      }));
    }
    return getProductSalesData();
  }, [hasAnalytics, analyticsData]);

  const data = useMemo(() => {
    if (!filters?.category || filters.category === 'all') return allData;
    return allData.filter((item) => item.category === filters.category);
  }, [allData, filters?.category]);

  const categories = useMemo(() => {
    const cats = new Set(allData.map((item) => item.category).filter(Boolean));
    return Array.from(cats);
  }, [allData]);

  const summary = useMemo(() => {
    return {
      totalSalesAmount: data.reduce((s, d) => s + d.totalSalesAmount, 0),
      totalOrders: data.reduce((s, d) => s + d.orderCount, 0),
      totalCancelAmount: data.reduce((s, d) => s + d.cancelAmount, 0),
      totalDiscountAmount: data.reduce((s, d) => s + d.discountAmount, 0),
      totalActualSales: data.reduce((s, d) => s + d.actualSalesAmount, 0),
      totalCashPayment: data.reduce((s, d) => s + d.cashPayment, 0),
      totalCardPayment: data.reduce((s, d) => s + d.cardPayment, 0),
    };
  }, [data]);

  return { data, categories, summary, isLoading: false };
}

export function useSalesSimulation() {
  const analyticsData = useAnalyticsStore((s) => s.uploadedData);
  const hasAnalytics = analyticsData.length > 0;

  const products = useMemo(() => {
    if (hasAnalytics) {
      return analyticsData.map((p): ProductSalesData => ({
        productCode: p.productCode,
        productName: p.productName,
        category: p.categoryName,
        categoryCode: p.categoryCode,
        salesDays: p.salesDays,
        orderCount: p.orderCount,
        orderItems: p.orderItems,
        orderQuantity: p.orderQuantity,
        unitPrice: p.unitPrice,
        totalSalesAmount: p.totalSalesAmount,
        cancelCount: p.cancelCount,
        cancelQuantity: p.cancelQuantity,
        cancelAmount: p.cancelAmount,
        discountQuantity: p.discountQuantity,
        discountAmount: p.discountAmount,
        actualSalesQty: p.salesQuantity,
        actualUnitPrice: p.actualUnitPrice,
        actualSalesAmount: p.actualSalesAmount,
        supplyPrice: p.supplyPrice,
        vat: p.vat,
        netSalesAmount: p.netSalesAmount,
        paymentAmount: p.paymentAmount,
        cashPayment: p.cashPayment,
        cardPayment: p.cardPayment,
        dineInOrders: p.dineInOrders,
        dineInSales: p.dineInSales,
        takeoutOrders: p.takeoutOrders,
        takeoutSales: p.takeoutSales,
        deliveryOrders: p.deliveryOrders,
        deliverySales: p.deliverySales,
        royaltyRate: p.royaltyRate,
        royaltyAmount: p.royaltyAmount,
        normalSalesQty: p.normalSalesQty,
        serviceQuantity: p.serviceQuantity,
        returnQuantity: p.returnQuantity,
        memberOrders: p.memberOrders,
        customerAverage: p.customerAverage,
        setQuantity: p.setQuantity,
        setAmount: p.setAmount,
      }));
    }
    return getProductSalesData();
  }, [hasAnalytics, analyticsData]);

  const [simulation, setSimulation] = useState<SalesSimulation | null>(null);

  const simulatePriceChange = useCallback(
    (productCode: string, newPrice: number) => {
      const product = products.find((p) => p.productCode === productCode);
      if (!product) return;

      const priceChangeRatio = (newPrice - product.unitPrice) / product.unitPrice;
      const elasticity = -1.2;
      const quantityChangeRatio = priceChangeRatio * elasticity;
      const estimatedQuantity = Math.round(
        product.orderQuantity * (1 + quantityChangeRatio)
      );
      const estimatedRevenue = estimatedQuantity * newPrice;
      const currentRevenue = product.orderQuantity * product.unitPrice;

      const recommendations: SimulationRecommendation[] = [];

      const optimalPrice = Math.round(
        product.unitPrice / (1 + 1 / elasticity)
      );
      recommendations.push({
        type: 'price_optimization',
        title: '매출 최대화 가격',
        description: `최적 가격: ${optimalPrice.toLocaleString()}원 (현재 대비 ${Math.round(((optimalPrice - product.unitPrice) / product.unitPrice) * 100)}%)`,
        impact: `예상 매출 변화: ${(((estimatedRevenue - currentRevenue) / currentRevenue) * 100).toFixed(1)}%`,
      });

      if (priceChangeRatio < 0) {
        recommendations.push({
          type: 'discount',
          title: '할인 추천',
          description: `${Math.abs(Math.round(priceChangeRatio * 100))}% 할인 시 판매량 ${Math.round(quantityChangeRatio * 100)}% 증가 예상`,
          impact: `추가 매출: ${(estimatedRevenue - currentRevenue).toLocaleString()}원`,
        });
      }

      const complementary = products
        .filter(
          (p) =>
            p.productCode !== productCode &&
            p.category !== product.category
        )
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 2);

      if (complementary.length > 0) {
        recommendations.push({
          type: 'bundle',
          title: '번들 추천',
          description: `${product.productName} + ${complementary.map((c) => c.productName).join(', ')} 세트 구성 추천`,
          impact: '세트 구성 시 객단가 15-20% 상승 예상',
        });
      }

      recommendations.push({
        type: 'time_based',
        title: '시간대별 가격 추천',
        description:
          '11:00-14:00 점심 할인, 17:00-19:00 해피아워 추천',
        impact: '비수기 시간대 매출 20-30% 증가 예상',
      });

      const result: SalesSimulation = {
        productCode: product.productCode,
        productName: product.productName,
        currentPrice: product.unitPrice,
        newPrice,
        currentQuantity: product.orderQuantity,
        estimatedQuantity,
        currentRevenue,
        estimatedRevenue,
        revenueChange: estimatedRevenue - currentRevenue,
        recommendations,
      };

      setSimulation(result);
      return result;
    },
    [products]
  );

  const simulateQuantityChange = useCallback(
    (productCode: string, newQuantity: number) => {
      const product = products.find((p) => p.productCode === productCode);
      if (!product) return;

      const currentRevenue = product.orderQuantity * product.unitPrice;
      const estimatedRevenue = newQuantity * product.unitPrice;

      const result: SalesSimulation = {
        productCode: product.productCode,
        productName: product.productName,
        currentPrice: product.unitPrice,
        newPrice: product.unitPrice,
        currentQuantity: product.orderQuantity,
        estimatedQuantity: newQuantity,
        currentRevenue,
        estimatedRevenue,
        revenueChange: estimatedRevenue - currentRevenue,
        recommendations: [],
      };

      setSimulation(result);
      return result;
    },
    [products]
  );

  return {
    products,
    simulation,
    simulatePriceChange,
    simulateQuantityChange,
  };
}
