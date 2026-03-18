'use client';

import { useState, useMemo } from 'react';
import { Upload, Trash2, FileSpreadsheet, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common';
import { formatDateTime } from '@/lib/format';
import { useCostData, useCostAnalysisStore } from '@/features/cost-analysis/hooks';
import { CostUpload } from '@/features/cost-analysis/components/cost-upload';
import { MenuOverview } from '@/features/cost-analysis/components/menu-overview';
import { MenuCostTable } from '@/features/cost-analysis/components/menu-cost-table';
import { CostSimulator } from '@/features/cost-analysis/components/cost-simulator';
import { TargetSimulator } from '@/features/cost-analysis/components/target-simulator';
import { CostComparisonChart } from '@/features/cost-analysis/components/cost-comparison-chart';
import { CategoryCostChart } from '@/features/cost-analysis/components/category-cost-chart';
import { IngredientDetailCard } from '@/features/cost-analysis/components/ingredient-detail';
import { CostReportGenerator } from '@/features/cost-analysis/components/cost-report-generator';
import type { MenuItem } from '@/features/cost-analysis/types';

export default function CostAnalysisPage() {
  const { hasData, fileName, uploadedAt, menuItems, categories } = useCostData();
  const clearData = useCostAnalysisStore((s) => s.clearData);
  const selectedMenuId = useCostAnalysisStore((s) => s.selectedMenuId);
  const simulations = useCostAnalysisStore((s) => s.simulations);
  const [activeTab, setActiveTab] = useState('overview');

  const selectedItem = useMemo<MenuItem | null>(
    () => menuItems.find((m) => m.id === selectedMenuId) ?? null,
    [menuItems, selectedMenuId]
  );

  if (!hasData) {
    return (
      <div className="space-y-6 p-6">

        <PageHeader
          title="원가 분석"
          description="원가표 엑셀을 업로드하여 메뉴별 원가를 분석하고 시뮬레이션합니다"
        />
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Upload className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              원가표를 업로드하세요
            </h2>
            <p className="text-sm text-muted-foreground">
              메뉴별 원가 분석표 엑셀 파일(.xls, .xlsx)을 업로드하면
              원가 분석 및 시뮬레이션 기능을 이용할 수 있습니다
            </p>
          </div>
          <CostUpload />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      <PageHeader
        title="원가 분석"
        description="메뉴별 원가를 분석하고 시뮬레이션합니다"
      >
        <div className="flex items-center gap-3">
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
          <Button variant="outline" size="sm" onClick={clearData}>
            <Trash2 className="h-4 w-4 mr-1" />
            데이터 초기화
          </Button>
        </div>
      </PageHeader>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="menu-costs">메뉴별 원가</TabsTrigger>
          <TabsTrigger value="simulation">원가 시뮬레이션</TabsTrigger>
          <TabsTrigger value="target">목표 원가 시뮬레이션</TabsTrigger>
          <TabsTrigger value="category">카테고리 분석</TabsTrigger>
          <TabsTrigger value="report">보고서</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-4">
          <MenuOverview />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CostComparisonChart />
            <CategoryCostChart />
          </div>
        </TabsContent>

        {/* Menu Costs tab */}
        <TabsContent value="menu-costs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <MenuCostTable />
            </div>
            <div>
              <IngredientDetailCard item={selectedItem} />
            </div>
          </div>
        </TabsContent>

        {/* Cost Simulation tab */}
        <TabsContent value="simulation" className="space-y-4">
          <CostSimulator />
        </TabsContent>

        {/* Target Simulation tab */}
        <TabsContent value="target" className="space-y-4">
          <TargetSimulator />
        </TabsContent>

        {/* Category Analysis tab */}
        <TabsContent value="category" className="space-y-4">
          <CategoryCostChart />
        </TabsContent>

        {/* Report tab */}
        <TabsContent value="report" className="space-y-4">
          <CostReportGenerator menuItems={menuItems} categories={categories} simulations={simulations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
