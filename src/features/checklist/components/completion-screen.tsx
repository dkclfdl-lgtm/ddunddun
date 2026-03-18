'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, Check, Download, Printer, FileCheck2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createKoreanPdf } from '@/lib/pdf-utils';
import type { ChecklistData } from '../types';
import { calcSectionProgress, calcOverallProgress } from '../utils';
import { SignatureCanvas } from './signature-canvas';

interface CompletionScreenProps {
  data: ChecklistData;
  onBack: () => void;
}

export function CompletionScreen({ data, onBack }: CompletionScreenProps) {
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);

  const overall = calcOverallProgress(data.sections);
  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleConfirmSignature = useCallback(() => {
    if (!signatureDataUrl) return;
    setSigned(true);
  }, [signatureDataUrl]);

  const handleDownloadPdf = useCallback(async () => {
    const doc = await createKoreanPdf({ orientation: 'portrait' });

    const brandLabel = data.brandName || '브랜드명';
    const storeLabel = data.storeName || '매장명';

    // Header
    doc.setFontSize(20);
    doc.text('체크리스트 완료 확인서', 105, 25, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`${dateStr} ${timeStr}`, 105, 33, { align: 'center' });

    // Info box
    doc.setDrawColor(200);
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(20, 40, 170, 24, 3, 3, 'FD');
    doc.setTextColor(30);
    doc.setFontSize(10);
    doc.text(`브랜드: ${brandLabel}`, 28, 49);
    doc.text(`매장: ${storeLabel}`, 90, 49);
    doc.text(`담당자: ${data.assignee || '-'}`, 140, 49);
    doc.text(
      `진행률: ${overall.progress}/${overall.total} (${Math.round(overall.percent)}%)`,
      28,
      58,
    );

    let y = 74;

    for (const sec of data.sections) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      const sp = calcSectionProgress(sec);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30);
      doc.text(
        `${sec.title} (${sp.progress}/${sp.total})`,
        20,
        y,
      );
      y += 7;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      for (const item of sec.items) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        const check = item.checked ? '[v]' : '[ ]';
        const line = `${check} [${item.category}] ${item.title}${item.responsible ? ` (${item.responsible})` : ''}`;
        doc.setTextColor(item.checked ? 100 : 30);
        doc.text(line, 24, y);
        y += 5;

        if (item.notes) {
          doc.setTextColor(130);
          doc.setFontSize(8);
          doc.text(`  메모: ${item.notes}`, 28, y);
          y += 4;
          doc.setFontSize(9);
        }
      }
      y += 4;
    }

    // Signature at the bottom
    if (signatureDataUrl) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }
      doc.setDrawColor(200);
      doc.line(20, y + 2, 190, y + 2);
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(30);
      doc.text('서명:', 20, y);
      try {
        doc.addImage(signatureDataUrl, 'PNG', 40, y - 8, 60, 24);
      } catch {
        // signature image failed
      }
      y += 22;
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`서명일시: ${dateStr} ${timeStr}`, 20, y);
    }

    const filename = `체크리스트_완료_${brandLabel}_${storeLabel}_${now.toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  }, [data, signatureDataUrl, dateStr, timeStr, overall]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileCheck2 size={24} className="text-green-500" />
            체크리스트 완료
          </h2>
          <p className="text-sm text-muted-foreground">
            {dateStr} {timeStr}
          </p>
        </div>
      </div>

      {/* Summary card */}
      <Card>
        <CardContent className="py-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">브랜드</p>
              <p className="text-sm font-semibold">{data.brandName || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">매장</p>
              <p className="text-sm font-semibold">{data.storeName || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">담당자</p>
              <p className="text-sm font-semibold">{data.assignee || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">완료율</p>
              <p className="text-sm font-bold text-green-600">
                {overall.progress}/{overall.total} ({Math.round(overall.percent)}%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed items by section */}
      <div className="space-y-4">
        {data.sections.map((sec) => {
          const sp = calcSectionProgress(sec);
          return (
            <Card key={sec.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{sec.icon}</span>
                  <h3 className="font-semibold text-foreground">{sec.title}</h3>
                  <Badge variant={sp.percent === 100 ? 'default' : 'secondary'} className="text-xs">
                    {sp.progress}/{sp.total}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {sec.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                        item.checked
                          ? 'bg-green-50 dark:bg-green-950/20'
                          : 'bg-red-50 dark:bg-red-950/20'
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                          item.checked
                            ? 'bg-green-500 text-white'
                            : 'border-2 border-red-300'
                        }`}
                      >
                        {item.checked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span
                        className={
                          item.checked
                            ? 'text-muted-foreground'
                            : 'text-foreground font-medium'
                        }
                      >
                        [{item.category}] {item.title}
                      </span>
                      {item.responsible && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {item.responsible}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Signature area */}
      {!signed ? (
        <Card>
          <CardContent className="py-5">
            <div className="mx-auto w-full max-w-lg">
              <SignatureCanvas
                onSignatureChange={setSignatureDataUrl}
                height={200}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleConfirmSignature}
                disabled={!signatureDataUrl}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check size={16} className="mr-1.5" />
                서명 완료
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
          <CardContent className="py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                <Check size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">
                  서명이 완료되었습니다
                </p>
                <p className="text-xs text-muted-foreground">
                  {dateStr} {timeStr}
                </p>
              </div>
            </div>

            {signatureDataUrl && (
              <div className="mb-4 rounded-lg border bg-white p-3">
                <img
                  src={signatureDataUrl}
                  alt="서명"
                  className="max-h-24 mx-auto"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownloadPdf}
              >
                <Download size={16} className="mr-1.5" />
                PDF 다운로드
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePrint}
              >
                <Printer size={16} className="mr-1.5" />
                인쇄
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
