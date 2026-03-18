'use client';

import { useState, useCallback } from 'react';
import { Upload, Trash2, FileSpreadsheet, Clock, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common';
import { formatDateTime } from '@/lib/format';
import {
  useSalesReportStore,
  useStoreSummary,
  useChannelSummary,
  useTagSummary,
} from '@/features/sales-report';
import { ReportUpload } from '@/features/sales-report/components/report-upload';
import { SalesOverview } from '@/features/sales-report/components/sales-overview';
import { ChannelChart } from '@/features/sales-report/components/channel-chart';
import { StoreRanking } from '@/features/sales-report/components/store-ranking';
import { TagSummary } from '@/features/sales-report/components/tag-summary';
import { StoreDetailTable } from '@/features/sales-report/components/store-detail-table';
import { StoreChannelDetail } from '@/features/sales-report/components/store-channel-detail';
import { ChannelBreakdown } from '@/features/sales-report/components/channel-breakdown';
import { ReportGenerator } from '@/features/sales-report/components/report-generator';

export default function SalesReportPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const reportData = useSalesReportStore((s) => s.reportData);
  const fileName = useSalesReportStore((s) => s.fileName);
  const uploadedAt = useSalesReportStore((s) => s.uploadedAt);
  const clearData = useSalesReportStore((s) => s.clearData);

  const storeSummary = useStoreSummary(reportData);
  const channelSummary = useChannelSummary(reportData);
  const tagSummary = useTagSummary(reportData);

  const handleDataImported = useCallback(() => {
    setActiveTab('overview');
  }, []);

  const handleClearData = useCallback(() => {
    clearData();
  }, [clearData]);

  // No data uploaded - show upload UI
  if (!reportData) {
    return (
      <div className="space-y-6 p-6">

        <PageHeader
          title="종합보고서 통계"
          description="종합보고서 채널별 매출 데이터를 업로드하여 대시보드를 확인합니다"
        />

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Upload className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              종합보고서를 업로드하세요
            </h2>
            <p className="text-sm text-muted-foreground">
              종합보고서_채널별(월)매출보고서 엑셀 파일(.xlsx)을 업로드하면
              <br />
              매장별, 채널별, 담당자별 분석 대시보드를 제공합니다
            </p>
          </div>
          <ReportUpload onDataImported={handleDataImported} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      <PageHeader
        title="종합보고서 통계"
        description="종합보고서 채널별 매출 데이터 분석 대시보드"
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

          {reportData.period && (
            <div className="hidden lg:flex items-center text-xs text-muted-foreground border rounded-md px-3 py-1.5">
              기간: {reportData.period}
            </div>
          )}

          <Button variant="outline" size="sm" onClick={handleClearData}>
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
          <TabsTrigger value="stores">매장별</TabsTrigger>
          <TabsTrigger value="store-detail">매장 상세</TabsTrigger>
          <TabsTrigger value="channels">채널별</TabsTrigger>
          <TabsTrigger value="managers">담당자별</TabsTrigger>
          <TabsTrigger value="report">보고서</TabsTrigger>
        </TabsList>

        {/* Tab: Overview */}
        <TabsContent value="overview" className="space-y-4">
          <SalesOverview data={reportData} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChannelChart channelData={channelSummary} />
            <StoreRanking stores={storeSummary} />
          </div>
        </TabsContent>

        {/* Tab: By Store */}
        <TabsContent value="stores" className="space-y-4">
          <StoreDetailTable data={reportData} />
        </TabsContent>

        {/* Tab: Store Detail */}
        <TabsContent value="store-detail" className="space-y-4">
          <StoreChannelDetail data={reportData} />
        </TabsContent>

        {/* Tab: By Channel */}
        <TabsContent value="channels" className="space-y-4">
          <ChannelBreakdown
            data={reportData}
            channelData={channelSummary}
          />
        </TabsContent>

        {/* Tab: By Manager */}
        <TabsContent value="managers" className="space-y-4">
          <TagSummary tags={tagSummary} />
        </TabsContent>

        {/* Tab: Report */}
        <TabsContent value="report" className="space-y-4">
          <ReportGenerator
            data={reportData}
            channelData={channelSummary}
            tagData={tagSummary}
            storeData={storeSummary}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
