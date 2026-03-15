'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROUTES } from '@/constants';
import { useInspectionForm } from '@/features/inspection/hooks';
import { InspectionChecklist } from '@/features/inspection/components/inspection-checklist';

const storeOptions = [
  { value: 'store-1', label: '강남점' },
  { value: 'store-2', label: '홍대점' },
  { value: 'store-3', label: '명동점' },
  { value: 'store-4', label: '잠실점' },
  { value: 'store-5', label: '신촌점' },
  { value: 'store-7', label: '건대점' },
  { value: 'store-8', label: '여의도점' },
];

export default function NewInspectionPage() {
  const router = useRouter();
  const {
    templates,
    selectedTemplate,
    selectedTemplateId,
    setSelectedTemplateId,
    isSubmitting,
    submitInspection,
  } = useInspectionForm();

  const [storeId, setStoreId] = useState('');
  const [inspectionDate, setInspectionDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [scores, setScores] = useState<Record<string, number>>({});
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [generalNotes, setGeneralNotes] = useState('');

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setScores({});
    setItemNotes({});
  };

  const handleScoreChange = (itemId: string, score: number) => {
    setScores((prev) => ({ ...prev, [itemId]: score }));
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setItemNotes((prev) => ({ ...prev, [itemId]: notes }));
  };

  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const maxScore = selectedTemplate?.maxScore ?? 0;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const canSubmit = selectedTemplateId && storeId && inspectionDate && Object.keys(scores).length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await submitInspection({
      templateId: selectedTemplateId,
      storeId,
      inspectionDate,
      itemScores: scores,
      notes: generalNotes,
    });
    router.push(ROUTES.inspection);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={ROUTES.inspection}>
            <Button variant="ghost" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">새 점검</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              매장 점검을 실시합니다
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
          <Save size={16} className="mr-1.5" />
          {isSubmitting ? '저장 중...' : '점검 완료'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">점검 기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label>점검 템플릿</Label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="템플릿을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((tmpl) => (
                    <SelectItem key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>매장</Label>
              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="매장을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {storeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>점검일</Label>
              <Input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <>
          <div className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <p className="text-sm text-muted-foreground">현재 점수</p>
              <p className="text-2xl font-bold">
                {totalScore} / {maxScore}점
              </p>
            </div>
            <div
              className="text-3xl font-bold"
              style={{
                color: percentage >= 80 ? '#03C75A' : percentage >= 60 ? '#FFAA00' : '#FF4444',
              }}
            >
              {percentage}%
            </div>
          </div>

          <InspectionChecklist
            items={selectedTemplate.items}
            scores={scores}
            notes={itemNotes}
            onScoreChange={handleScoreChange}
            onNotesChange={handleNotesChange}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">종합 의견</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="점검에 대한 종합 의견을 입력하세요..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="h-24"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
