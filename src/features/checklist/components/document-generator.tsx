'use client';

import { useState } from 'react';
import { FileText, Presentation, Download, Loader2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChecklistStore } from '../store';
import { useDocumentGenerator } from '../hooks';
import type { DocumentType, DocumentFormat } from '../types';

const DOCUMENT_TYPES: {
  type: DocumentType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    type: 'executive',
    label: '윗선 보고용',
    description: '진행률 요약 및 미완료 항목 보고서',
    icon: <Presentation size={18} />,
  },
  {
    type: 'hq-training',
    label: '본사직원용 교육문서',
    description: '전체 체크리스트 + 가이드 포함',
    icon: <FileText size={18} />,
  },
  {
    type: 'franchisee-training',
    label: '가맹점주용 교육문서',
    description: '점주 필수 항목 중심 간소화 매뉴얼',
    icon: <FileText size={18} />,
  },
  {
    type: 'blank-template',
    label: '기본 양식 (빈 템플릿)',
    description: '체크하지 않은 기본 양식 - 서면 작성용',
    icon: <ClipboardList size={18} />,
  },
];

export function DocumentGenerator() {
  const { generate, generateSection, generating } = useDocumentGenerator();
  const data = useChecklistStore((s) => s.data);

  const handleGenerate = (type: DocumentType, format: DocumentFormat) => {
    generate(type, format);
  };

  const handleSectionGenerate = (sectionId: string, format: DocumentFormat) => {
    generateSection(sectionId, format);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Download size={16} />
          문서 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document type cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DOCUMENT_TYPES.map(({ type, label, description, icon }) => (
            <div
              key={type}
              className="rounded-lg border p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{icon}</span>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={generating !== null}
                  onClick={() => handleGenerate(type, 'ppt')}
                >
                  {generating === `${type}-ppt` ? <Loader2 size={12} className="mr-1 animate-spin" /> : <Presentation size={12} className="mr-1" />}
                  PPT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={generating !== null}
                  onClick={() => handleGenerate(type, 'pdf')}
                >
                  {generating === `${type}-pdf` ? <Loader2 size={12} className="mr-1 animate-spin" /> : <FileText size={12} className="mr-1" />}
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Section-level downloads */}
        {data.sections.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">섹션별 다운로드</h3>
            <div className="grid gap-2">
              {data.sections.map((section) => (
                <div key={section.id} className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg border">
                  <span className="text-sm font-medium flex-1">
                    {section.icon} {section.title}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({section.items.filter(i => i.checked).length}/{section.items.length})
                    </span>
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={generating !== null}
                      onClick={() => handleSectionGenerate(section.id, 'ppt')}
                    >
                      {generating === `section-${section.id}-ppt` ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Presentation className="h-3 w-3 mr-1" />}
                      PPT
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={generating !== null}
                      onClick={() => handleSectionGenerate(section.id, 'pdf')}
                    >
                      {generating === `section-${section.id}-pdf` ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
