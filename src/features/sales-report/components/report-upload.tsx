'use client';

import { useCallback, useRef, useState, useMemo } from 'react';
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { formatNumber, formatCurrency } from '@/lib/format';
import { useReportUpload } from '../hooks';

interface ReportUploadProps {
  onDataImported?: () => void;
}

export function ReportUpload({ onDataImported }: ReportUploadProps) {
  const {
    isUploading,
    progress,
    error,
    parsedData,
    fileName,
    upload,
    importData,
    reset,
  } = useReportUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const summary = useMemo(() => {
    if (!parsedData) return null;
    const totalSales = parsedData.stores.reduce(
      (s, st) => s + st.totalSales,
      0
    );
    const totalOrders = parsedData.stores.reduce(
      (s, st) => s + st.totalOrders,
      0
    );
    const tags = new Set(parsedData.stores.map((s) => s.storeTag));
    return {
      storeCount: parsedData.stores.length,
      totalSales,
      totalOrders,
      tagCount: tags.size,
      channelCount: parsedData.channels.length,
      period: parsedData.period,
    };
  }, [parsedData]);

  const handleFile = useCallback(
    (file: File) => {
      upload(file);
    },
    [upload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleImport = useCallback(() => {
    importData();
    toast.success('데이터가 로드되었습니다', {
      description: `${summary?.storeCount ?? 0}개 매장, ${summary?.channelCount ?? 0}개 채널`,
    });
    onDataImported?.();
  }, [importData, onDataImported, summary]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          종합보고서 엑셀 업로드
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!parsedData && !isUploading && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">
              종합보고서 엑셀 파일을 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              .xlsx 파일 지원 (종합보고서_채널별(월)매출보고서 형식)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        )}

        {isUploading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span>{fileName}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              파일 분석 중... {progress}%
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">업로드 실패</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-6 w-6"
              onClick={reset}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {parsedData && !isUploading && summary && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 text-sm">
              <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{fileName}</p>
                {summary.period && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    기간: {summary.period}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatNumber(summary.storeCount)}개 매장 데이터 발견
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={reset}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">매장 수</p>
                <p className="text-xl font-bold">
                  {formatNumber(summary.storeCount)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">채널 수</p>
                <p className="text-xl font-bold">
                  {formatNumber(summary.channelCount)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">총 매출</p>
                <p className="text-lg font-bold">
                  {formatCurrency(summary.totalSales)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">총 주문건수</p>
                <p className="text-lg font-bold">
                  {formatNumber(summary.totalOrders)}건
                </p>
              </div>
            </div>

            {/* Store preview */}
            <div className="rounded-md border overflow-auto max-h-48">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-2 py-1 text-left">매장</th>
                    <th className="px-2 py-1 text-left">태그</th>
                    <th className="px-2 py-1 text-right">매출</th>
                    <th className="px-2 py-1 text-right">주문</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.stores.slice(0, 8).map((store, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-1">{store.storeName}</td>
                      <td className="px-2 py-1">{store.storeTag}</td>
                      <td className="px-2 py-1 text-right">
                        {store.totalSales.toLocaleString()}원
                      </td>
                      <td className="px-2 py-1 text-right">
                        {store.totalOrders.toLocaleString()}건
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.stores.length > 8 && (
                <p className="text-xs text-muted-foreground p-2 text-center">
                  외 {parsedData.stores.length - 8}개 매장...
                </p>
              )}
            </div>

            <Button onClick={handleImport} className="w-full">
              데이터 가져오기 ({formatNumber(summary.storeCount)}개 매장)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
