'use client';

import { useRef, useState, useCallback } from 'react';
import { Download, FileText, Presentation, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { ExcelProductData, CategorySummary, ProductRecommendation } from '../types';
import { ReportPreview } from './report-preview';
import { downloadPDFReport, downloadPPTReport, downloadSectionPPT, downloadSectionPDF } from '../report-generator';

// ────────────────────────────────────────────────────────
// Section definitions
// ────────────────────────────────────────────────────────
type SectionId = 'kpi' | 'category' | 'top-products' | 'channel-payment' | 'recommendations';

const REPORT_SECTIONS: { id: SectionId; icon: string; title: string; desc: (data: ExcelProductData[], categories: CategorySummary[], recommendations: ProductRecommendation[]) => string }[] = [
  {
    id: 'kpi',
    icon: '01',
    title: '핵심 지표',
    desc: (data) => {
      const totalRevenue = data.reduce((s, p) => s + (p.actualSalesAmount || 0), 0);
      const totalOrders = data.reduce((s, p) => s + (p.orderCount || 0), 0);
      return `총 매출 ${fmtCur(totalRevenue)}  ·  총 주문 ${totalOrders.toLocaleString()}건`;
    },
  },
  {
    id: 'category',
    icon: '02',
    title: '카테고리별 매출 현황 (Top 10)',
    desc: (_, categories) => {
      const top = [...categories].sort((a, b) => b.totalSalesAmount - a.totalSalesAmount).slice(0, 5);
      return top.map(c => c.categoryName).join(', ') + (categories.length > 5 ? ' 외...' : '');
    },
  },
  {
    id: 'top-products',
    icon: '03',
    title: '매출 Top 20 상품',
    desc: (data) => `전체 ${data.length}개 상품 중 상위 20개`,
  },
  {
    id: 'channel-payment',
    icon: '04',
    title: '채널별 · 결제 수단 분석',
    desc: () => '매장/포장/배달  ·  카드/현금/기타',
  },
  {
    id: 'recommendations',
    icon: '05',
    title: '추천 인사이트',
    desc: (_, __, recs) => `${Math.min(recs.length, 5)}개 추천 항목`,
  },
];

function fmtCur(v: number) {
  if (v >= 100000000) return `${(v / 100000000).toFixed(1)}억원`;
  if (v >= 10000) return `${Math.round(v / 10000)}만원`;
  return `${v.toLocaleString()}원`;
}

interface ReportDownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ExcelProductData[];
  categories: CategorySummary[];
  recommendations: ProductRecommendation[];
  fileName: string;
  uploadedAt: string | null;
}

export function ReportDownloadModal({
  open,
  onOpenChange,
  data,
  categories,
  recommendations,
  fileName,
  uploadedAt,
}: ReportDownloadModalProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const isLoading = loadingKey !== null;

  const handleFullPDF = useCallback(async () => {
    if (!pdfRef.current) return;
    setLoadingKey('pdf-full');
    try {
      await downloadPDFReport(pdfRef.current, fileName);
      toast.success('PDF 리포트 다운로드 완료');
    } catch (err) {
      console.error(err);
      toast.error('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setLoadingKey(null);
    }
  }, [fileName]);

  const handleFullPPT = useCallback(async () => {
    setLoadingKey('ppt-full');
    try {
      await downloadPPTReport({ data, categories, recommendations, fileName, uploadedAt });
      toast.success('PPT 리포트 다운로드 완료');
    } catch (err) {
      console.error(err);
      toast.error('PPT 생성 중 오류가 발생했습니다.');
    } finally {
      setLoadingKey(null);
    }
  }, [data, categories, recommendations, fileName, uploadedAt]);

  const handleSectionPPT = useCallback(async (sectionId: SectionId) => {
    setLoadingKey(`ppt-${sectionId}`);
    try {
      await downloadSectionPPT({ data, categories, recommendations, fileName, uploadedAt }, sectionId);
      toast.success('PPT 섹션 다운로드 완료');
    } catch (err) {
      console.error(err);
      toast.error('PPT 생성 중 오류가 발생했습니다.');
    } finally {
      setLoadingKey(null);
    }
  }, [data, categories, recommendations, fileName, uploadedAt]);

  const handleSectionPDF = useCallback(async (sectionId: SectionId) => {
    setLoadingKey(`pdf-${sectionId}`);
    try {
      await downloadSectionPDF({ data, categories, recommendations, fileName, uploadedAt }, sectionId);
      toast.success('PDF 섹션 다운로드 완료');
    } catch (err) {
      console.error(err);
      toast.error('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setLoadingKey(null);
    }
  }, [data, categories, recommendations, fileName, uploadedAt]);

  return (
    <>
      {/* PDF 캡처용 오프스크린 ReportPreview */}
      {open && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: '-10000px',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          <ReportPreview
            ref={pdfRef}
            data={data}
            categories={categories}
            recommendations={recommendations}
            fileName={fileName}
            uploadedAt={uploadedAt}
          />
        </div>
      )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-primary" />
              통계 리포트 다운로드
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              섹션별 또는 종합 보고서를 PPT/PDF 형식으로 저장합니다.
            </DialogDescription>
          </DialogHeader>

          {/* 파일 정보 */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{fileName}</span>
            <span>&middot;</span>
            <span>{data.length.toLocaleString()}개 상품</span>
            <span>&middot;</span>
            <span>{categories.length}개 카테고리</span>
          </div>

          {/* 섹션별 다운로드 */}
          <div className="border rounded-lg divide-y">
            <div className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              섹션별 다운로드
            </div>
            {REPORT_SECTIONS.map((section) => (
              <div key={section.id} className="flex items-center gap-3 px-4 py-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{section.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {section.desc(data, categories, recommendations)}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={isLoading}
                    onClick={() => handleSectionPPT(section.id)}
                  >
                    {loadingKey === `ppt-${section.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Presentation className="h-3 w-3" />}
                    <span className="ml-1">PPT</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={isLoading}
                    onClick={() => handleSectionPDF(section.id)}
                  >
                    {loadingKey === `pdf-${section.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                    <span className="ml-1">PDF</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* 종합 보고서 다운로드 */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              size="lg"
              onClick={handleFullPDF}
              disabled={isLoading}
              className="gap-2 h-14 flex-col"
            >
              {loadingKey === 'pdf-full' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
              <div className="flex flex-col items-center leading-tight">
                <span className="text-sm font-semibold">
                  {loadingKey === 'pdf-full' ? 'PDF 생성 중...' : '종합 PDF 다운로드'}
                </span>
                <span className="text-[10px] opacity-75">A4 세로 · 페이지 분할</span>
              </div>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleFullPPT}
              disabled={isLoading}
              className="gap-2 h-14 flex-col border-2"
            >
              {loadingKey === 'ppt-full' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Presentation className="h-5 w-5" />
              )}
              <div className="flex flex-col items-center leading-tight">
                <span className="text-sm font-semibold">
                  {loadingKey === 'ppt-full' ? 'PPT 생성 중...' : '종합 PPT 다운로드'}
                </span>
                <span className="text-[10px] opacity-60">와이드스크린 · 전체 슬라이드</span>
              </div>
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center -mt-1">
            PDF는 현재 화면 기반 렌더링, PPT는 구조화된 슬라이드로 생성됩니다.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
