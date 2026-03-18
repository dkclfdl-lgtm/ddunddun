'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  X,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCostUpload } from '../hooks';

interface CostUploadProps {
  onDataImported?: () => void;
}

export function CostUpload({ onDataImported }: CostUploadProps) {
  const { isUploading, progress, error, upload, reset } = useCostUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      await upload(file);
      onDataImported?.();
    },
    [upload, onDataImported]
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          원가표 엑셀 업로드
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isUploading && (
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
              원가표 엑셀 파일을 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              .xls, .xlsx 파일 지원 (메뉴별 원가 분석표)
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
              <FileSpreadsheet className="h-4 w-4 text-primary animate-pulse" />
              <span>파일 분석 중...</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              원가 데이터 파싱 중... {progress}%
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
      </CardContent>
    </Card>
  );
}
