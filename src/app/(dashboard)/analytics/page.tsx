'use client';

import { useState, useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Upload, ArrowUpDown, Trash2, FileSpreadsheet, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, DataTable } from '@/components/common';
import { formatCurrency, formatNumber, formatPercent, formatDateTime } from '@/lib/format';
import {
  useExcelData,
  useCategorySummary,
  useProductRecommendations,
  useColumnManager,
  useAnalyticsStore,
} from '@/features/analytics/hooks';
import { exportToCSV } from '@/features/analytics/utils';
import type { ExcelProductData, AnalyticsFilters } from '@/features/analytics/types';
import { ExcelUpload } from '@/features/analytics/components/excel-upload';
import { DataOverview } from '@/features/analytics/components/data-overview';
import { CategorySummaryChart } from '@/features/analytics/components/category-summary-chart';
import { CategoryDetailTable } from '@/features/analytics/components/category-detail-table';
import { PeriodComparison } from '@/features/analytics/components/period-comparison';
import { ProductRanking } from '@/features/analytics/components/product-ranking';
import { PriceSimulator } from '@/features/analytics/components/price-simulator';
import { QuantitySimulator } from '@/features/analytics/components/quantity-simulator';
import { RecommendationPanel } from '@/features/analytics/components/recommendation-panel';
import { ColumnManager } from '@/features/analytics/components/column-manager';
import { SalesChannelAnalysis } from '@/features/analytics/components/sales-channel-analysis';
import { PaymentAnalysis } from '@/features/analytics/components/payment-analysis';
import { MemberAnalysis } from '@/features/analytics/components/member-analysis';

const DEFAULT_FILTERS: AnalyticsFilters = {
  categories: [],
  searchProduct: '',
  minSalesAmount: 0,
  maxSalesAmount: 0,
  sortBy: 'actualSalesAmount',
  sortOrder: 'desc',
  comparisonPeriod: 'monthly',
};

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>(DEFAULT_FILTERS);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data, totalCount, hasData } = useExcelData(filters);
  const fileName = useAnalyticsStore((s) => s.fileName);
  const uploadedAt = useAnalyticsStore((s) => s.uploadedAt);
  const clearData = useAnalyticsStore((s) => s.clearData);

  const categories = useCategorySummary(data);
  const recommendations = useProductRecommendations(data);
  const {
    columns,
    visibleColumns,
    groups,
    toggleColumn,
    toggleGroup,
    resetColumns,
  } = useColumnManager();

  const handleCategoryFilter = useCallback((categoryName: string) => {
    setFilters((prev) => {
      const exists = prev.categories.includes(categoryName);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== categoryName)
          : [...prev.categories, categoryName],
      };
    });
  }, []);

  const handleExport = useCallback(() => {
    exportToCSV(data, columns);
  }, [data, columns]);

  const handleDataImported = useCallback(() => {
    setActiveTab('overview');
  }, []);

  const handleClearData = useCallback(() => {
    clearData();
    setFilters(DEFAULT_FILTERS);
  }, [clearData]);

  // Build dynamic columns based on visibility
  const tableColumns = useMemo<ColumnDef<ExcelProductData>[]>(() => {
    return visibleColumns.map((col) => {
      const colDef: ColumnDef<ExcelProductData> = {
        accessorKey: col.key,
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs -ml-3"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          >
            {col.label}
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = row.getValue(col.key);
          if (value === null || value === undefined) return '-';
          switch (col.format) {
            case 'currency':
              return (
                <span className="text-right block">
                  {formatCurrency(Number(value))}
                </span>
              );
            case 'percent':
              return (
                <span className="text-right block">
                  {formatPercent(Number(value))}
                </span>
              );
            case 'number':
              return (
                <span className="text-right block">
                  {formatNumber(Number(value))}
                </span>
              );
            default:
              return <span>{String(value)}</span>;
          }
        },
        size: col.width,
      };
      return colDef;
    });
  }, [visibleColumns]);

  // Available categories for filter
  const availableCategories = useMemo(() => {
    const cats = new Set(data.map((p) => p.categoryName).filter(Boolean));
    return Array.from(cats).sort();
  }, [data]);

  // If no data is uploaded, show upload prompt
  if (!hasData) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="엑셀 통계 분석"
          description="POS 판매 데이터를 업로드하여 인사이트를 도출합니다"
        />

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Upload className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              판매 데이터를 업로드하세요
            </h2>
            <p className="text-sm text-muted-foreground">
              판매현황 엑셀 파일(.xls, .xlsx)을 업로드하면 상품별, 카테고리별,
              기간별 분석을 제공합니다
            </p>
          </div>
          <ExcelUpload onDataImported={handleDataImported} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="엑셀 통계 분석"
        description="POS 판매 데이터를 분석하여 인사이트를 도출합니다"
      >
        <div className="flex items-center gap-3">
          {/* File info */}
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground border rounded-md px-3 py-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span className="font-medium">{fileName}</span>
            {uploadedAt && (
              <>
                <Clock className="h-3 w-3 ml-1" />
                <span>{formatDateTime(uploadedAt)}</span>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearData}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            데이터 초기화
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            CSV 내보내기
          </Button>
        </div>
      </PageHeader>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">데이터 개요</TabsTrigger>
          <TabsTrigger value="products">상품 분석</TabsTrigger>
          <TabsTrigger value="period">기간 비교</TabsTrigger>
          <TabsTrigger value="channel">채널 분석</TabsTrigger>
          <TabsTrigger value="simulation">가격 시뮬레이션</TabsTrigger>
          <TabsTrigger value="recommendations">추천</TabsTrigger>
          <TabsTrigger value="members">회원 분석</TabsTrigger>
        </TabsList>

        {/* Tab: Data Overview */}
        <TabsContent value="overview" className="space-y-4">
          <DataOverview data={data} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CategorySummaryChart
              categories={categories}
              onCategoryClick={handleCategoryFilter}
            />
            <ProductRanking data={data} />
          </div>

          <CategoryDetailTable categories={categories} products={data} />
        </TabsContent>

        {/* Tab: Product Analysis */}
        <TabsContent value="products" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="상품명 / 코드 검색..."
              value={filters.searchProduct}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  searchProduct: e.target.value,
                }))
              }
              className="w-64"
            />
            <Select
              value={
                filters.categories.length === 1
                  ? filters.categories[0]
                  : 'all'
              }
              onValueChange={(v) =>
                setFilters((prev) => ({
                  ...prev,
                  categories: v === 'all' ? [] : [v],
                }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="전체 카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColumnManager((v) => !v)}
            >
              컬럼 설정 ({visibleColumns.length}/{columns.length})
            </Button>
            <div className="ml-auto text-sm text-muted-foreground">
              총 {formatNumber(data.length)}개 상품 (전체{' '}
              {formatNumber(totalCount)}개)
            </div>
          </div>

          <div
            className={`grid gap-4 ${showColumnManager ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'}`}
          >
            {showColumnManager && (
              <div className="lg:col-span-1">
                <ColumnManager
                  groups={groups}
                  onToggleColumn={toggleColumn}
                  onToggleGroup={toggleGroup}
                  onReset={resetColumns}
                  visibleCount={visibleColumns.length}
                  totalCount={columns.length}
                />
              </div>
            )}
            <div className={showColumnManager ? 'lg:col-span-3' : ''}>
              <div className="overflow-auto">
                <DataTable
                  columns={tableColumns}
                  data={data}
                  searchKey="productName"
                  searchPlaceholder="상품명으로 검색..."
                  pageSize={30}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Period Comparison */}
        <TabsContent value="period" className="space-y-4">
          <PeriodComparison />
        </TabsContent>

        {/* Tab: Channel Analysis */}
        <TabsContent value="channel" className="space-y-4">
          <SalesChannelAnalysis categories={categories} data={data} />
          <PaymentAnalysis data={data} categories={categories} />
        </TabsContent>

        {/* Tab: Price Simulation */}
        <TabsContent value="simulation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PriceSimulator data={data} />
            <QuantitySimulator data={data} />
          </div>
        </TabsContent>

        {/* Tab: Recommendations */}
        <TabsContent value="recommendations" className="space-y-4">
          <RecommendationPanel recommendations={recommendations} />
        </TabsContent>

        {/* Tab: Member Analysis */}
        <TabsContent value="members" className="space-y-4">
          <MemberAnalysis data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
