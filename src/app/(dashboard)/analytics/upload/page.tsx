'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common';
import { formatNumber, formatCurrency } from '@/lib/format';
import { ExcelUpload } from '@/features/analytics/components/excel-upload';
import { useAnalyticsStore } from '@/features/analytics/store';

export default function AnalyticsUploadPage() {
  const router = useRouter();
  const uploadedData = useAnalyticsStore((s) => s.uploadedData);
  const fileName = useAnalyticsStore((s) => s.fileName);

  const hasData = uploadedData.length > 0;

  const uniqueCategories = useMemo(
    () =>
      hasData
        ? Array.from(new Set(uploadedData.map((p) => p.categoryName)))
        : [],
    [uploadedData, hasData]
  );

  const handleGoToAnalytics = useCallback(() => {
    router.push('/analytics');
  }, [router]);

  const handleDataImported = useCallback(() => {
    router.push('/analytics');
  }, [router]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="엑셀 데이터 업로드"
        description="POS 판매 데이터 엑셀 파일을 업로드하여 분석합니다"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/analytics')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          분석 대시보드
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ExcelUpload onDataImported={handleDataImported} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                지원 파일 형식
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">지원 확장자</p>
                <p className="text-muted-foreground">.xls, .xlsx</p>
              </div>
              <div>
                <p className="font-medium">필수 컬럼</p>
                <p className="text-muted-foreground">
                  분류명, 상품코드, 상품명, 판매일, 주문수, 주문량, 판매단가,
                  판매가, 취소수, 취소금액, 판매량, 실판매금액, 결제금액
                </p>
              </div>
              <div>
                <p className="font-medium">선택 컬럼 (74개 전체 지원)</p>
                <p className="text-muted-foreground">
                  매장건/포장건/배달건, 현금결제/카드결제, 회원건/회원매상고,
                  로얄티율/로얄티금액, 공급가액/VAT 등
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {hasData && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  업로드 결과
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fileName && (
                  <p className="text-sm text-muted-foreground">
                    파일: {fileName}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">총 상품수</p>
                    <p className="text-xl font-bold">
                      {formatNumber(uploadedData.length)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">카테고리수</p>
                    <p className="text-xl font-bold">
                      {formatNumber(uniqueCategories.length)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">총 매출</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(
                        uploadedData.reduce(
                          (s, p) => s + p.actualSalesAmount,
                          0
                        )
                      )}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">총 주문수</p>
                    <p className="text-xl font-bold">
                      {formatNumber(
                        uploadedData.reduce((s, p) => s + p.orderCount, 0)
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">카테고리 목록</p>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueCategories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                      >
                        {cat} (
                        {
                          uploadedData.filter(
                            (p) => p.categoryName === cat
                          ).length
                        }
                        )
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGoToAnalytics}
                  className="w-full"
                >
                  분석 대시보드에서 확인
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
