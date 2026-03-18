'use client';

import { useRef } from 'react';
import { Upload, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useChecklistUpload } from '../hooks';

export function ChecklistUpload() {
  const { upload, reset, uploading, error } = useChecklistUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-3 py-4">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFile}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={14} className="mr-1.5" />
          {uploading ? '업로드 중...' : '엑셀 업로드'}
        </Button>

        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw size={14} className="mr-1.5" />
          기본 템플릿으로 초기화
        </Button>

        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileSpreadsheet size={14} />
          체크리스트.xlsx 템플릿을 업로드하거나 기본 템플릿을 사용하세요
        </span>

        {error && <span className="text-xs text-destructive">{error}</span>}
      </CardContent>
    </Card>
  );
}
