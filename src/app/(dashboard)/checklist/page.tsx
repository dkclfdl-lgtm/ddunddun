'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Settings2,
  ChevronLeft,
  ChevronRight,
  Check,
  Pencil,
  PencilOff,
  Filter,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChecklistStore } from '@/features/checklist/store';
import { useChecklistState, useChecklistProgress } from '@/features/checklist/hooks';
import {
  ChecklistUpload,
  ChecklistOverview,
  ChecklistSectionCard,
  AddItemDialog,
  EditItemDialog,
  SectionManager,
  DocumentGenerator,
  CompletionScreen,
} from '@/features/checklist/components';
import type { ChecklistItem, ChecklistSection } from '@/features/checklist/types';

// IDs for grouping
const OPEN_CHECKLIST_ID = 'open-checklist';
const DELIVERY_SECTION_IDS = ['baemin', 'coupangeats', 'yogiyo', 'ddangyoyo'];

export default function ChecklistPage() {
  const {
    data,
    toggleItem,
    addItem,
    updateItem,
    removeItem,
  } = useChecklistState();

  const { overall } = useChecklistProgress();

  const setBrandName = useChecklistStore((s) => s.setBrandName);
  const setStoreName = useChecklistStore((s) => s.setStoreName);
  const setAssignee = useChecklistStore((s) => s.setAssignee);

  const [mainTab, setMainTab] = useState('hq');
  const [hqSubTab, setHqSubTab] = useState('open');
  const [showSettings, setShowSettings] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Wizard step navigation (for delivery platform sub-tab)
  const [deliveryStep, setDeliveryStep] = useState(0);

  // Responsible person filter (for open checklist)
  const [responsibleFilter, setResponsibleFilter] = useState('__all__');

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogSectionId, setAddDialogSectionId] = useState('');
  const [addDialogSectionTitle, setAddDialogSectionTitle] = useState('');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDialogSectionId, setEditDialogSectionId] = useState('');
  const [editDialogItem, setEditDialogItem] = useState<ChecklistItem | null>(null);

  // ── Section groups ──
  const openSection = data.sections.find((s) => s.id === OPEN_CHECKLIST_ID) ?? null;
  const deliverySections = data.sections.filter((s) => DELIVERY_SECTION_IDS.includes(s.id));

  // Franchisee view sections - 오픈전 + 배달플랫폼 모두 포함
  const franchiseeSections = data.sections.filter((s) =>
    [OPEN_CHECKLIST_ID, ...DELIVERY_SECTION_IDS].includes(s.id),
  );

  // ── Responsible persons for open checklist filter (개별 담당자 추출) ──
  const responsiblePersons = useMemo(() => {
    const set = new Set<string>();
    for (const section of data.sections) {
      for (const item of section.items) {
        if (!item.responsible?.trim()) continue;
        // "오픈바이저 / 배수빈 대리" → ["오픈바이저", "배수빈 대리"]
        const parts = item.responsible.split(/[/,]/).map((p) => p.trim()).filter(Boolean);
        for (const part of parts) {
          set.add(part);
        }
      }
    }
    return Array.from(set).sort();
  }, [data.sections]);

  // ── Filtered open section ──
  const filteredOpenSection = useMemo(() => {
    if (!openSection) return null;
    if (responsibleFilter === '__all__') return openSection;
    return {
      ...openSection,
      items: openSection.items.filter(
        (item) => item.responsible?.includes(responsibleFilter),
      ),
    };
  }, [openSection, responsibleFilter]);

  // ── Existing categories for current dialog section ──
  const addDialogExistingCategories = useMemo(() => {
    const section = data.sections.find((s) => s.id === addDialogSectionId);
    if (!section) return [];
    const cats = new Set<string>();
    for (const item of section.items) {
      if (item.category?.trim()) cats.add(item.category.trim());
    }
    return Array.from(cats).sort();
  }, [data.sections, addDialogSectionId]);

  // Compute section progress for delivery wizard step indicator
  const deliveryProgressMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const sec of deliverySections) {
      const total = sec.items.length;
      const done = sec.items.filter((i) => i.checked).length;
      map.set(sec.id, total > 0 ? (done / total) * 100 : 0);
    }
    return map;
  }, [deliverySections]);

  const deliveryTotalSteps = deliverySections.length;
  const safeDeliveryStep = Math.min(deliveryStep, deliveryTotalSteps - 1);
  const currentDeliverySection = deliverySections[safeDeliveryStep] ?? null;
  const isDeliveryLastStep = safeDeliveryStep === deliveryTotalSteps - 1;
  const isDeliveryFirstStep = safeDeliveryStep === 0;

  // Franchisee wizard state
  const [franchiseeStep, setFranchiseeStep] = useState(0);
  const franchiseeProgressMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const sec of franchiseeSections) {
      const total = sec.items.length;
      const done = sec.items.filter((i) => i.checked).length;
      map.set(sec.id, total > 0 ? (done / total) * 100 : 0);
    }
    return map;
  }, [franchiseeSections]);

  const handleAddOpen = useCallback((sectionId: string, sectionTitle: string) => {
    setAddDialogSectionId(sectionId);
    setAddDialogSectionTitle(sectionTitle);
    setAddDialogOpen(true);
  }, []);

  const handleEditOpen = useCallback((sectionId: string, item: ChecklistItem) => {
    setEditDialogSectionId(sectionId);
    setEditDialogItem(item);
    setEditDialogOpen(true);
  }, []);

  const handleAddItem = useCallback(
    (item: { category: string; title: string; responsible: string; notes: string; guide: string }) => {
      addItem(addDialogSectionId, { ...item, checked: false });
    },
    [addItem, addDialogSectionId],
  );

  const handleSaveItem = useCallback(
    (updates: Partial<ChecklistItem>) => {
      if (editDialogItem) {
        updateItem(editDialogSectionId, editDialogItem.id, updates);
      }
    },
    [updateItem, editDialogSectionId, editDialogItem],
  );

  const goDeliveryNext = useCallback(() => {
    if (!isDeliveryLastStep) {
      setDeliveryStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isDeliveryLastStep]);

  const goDeliveryPrev = useCallback(() => {
    if (!isDeliveryFirstStep) {
      setDeliveryStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isDeliveryFirstStep]);

  const handleComplete = useCallback(() => {
    setShowCompletion(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // When switching tabs, reset step
  const handleTabChange = useCallback((tab: string) => {
    setMainTab(tab);
    setDeliveryStep(0);
    setFranchiseeStep(0);
    setShowCompletion(false);
  }, []);

  const handleHqSubTabChange = useCallback((tab: string) => {
    setHqSubTab(tab);
    setDeliveryStep(0);
    setResponsibleFilter('__all__');
  }, []);

  // Completion screen
  if (showCompletion) {
    return (
      <div className="space-y-6">

        <CompletionScreen
          data={data}
          onBack={() => setShowCompletion(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            브랜드별 체크리스트
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            오픈 체크리스트 및 배달 플랫폼 세팅을 관리하세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={editMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <PencilOff size={14} className="mr-1.5" />
                편집 완료
              </>
            ) : (
              <>
                <Pencil size={14} className="mr-1.5" />
                편집 모드
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 size={14} className="mr-1.5" />
            설정
          </Button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <Card>
          <CardContent className="grid gap-4 py-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">브랜드명</Label>
              <Input
                value={data.brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="브랜드명 입력"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">매장명</Label>
              <Input
                value={data.storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="매장명 입력"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">담당자</Label>
              <Input
                value={data.assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="담당자명"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload / Reset */}
      <ChecklistUpload />

      {/* Overview */}
      <ChecklistOverview />

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="hq">오픈 체크리스트 (본사직원용)</TabsTrigger>
          <TabsTrigger value="franchisee">운영 매뉴얼 (가맹점주용)</TabsTrigger>
        </TabsList>

        <TabsContent value="hq" className="mt-4 space-y-6">
          {editMode && <SectionManager />}
          {editMode && <DocumentGenerator />}

          {/* HQ Sub-tabs: Open Checklist vs Delivery Platform */}
          <Tabs value={hqSubTab} onValueChange={handleHqSubTabChange}>
            <TabsList className="w-full">
              <TabsTrigger value="open" className="flex-1">
                오픈전 체크리스트
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex-1">
                배달플랫폼 체크리스트
              </TabsTrigger>
            </TabsList>

            {/* ─── Open Checklist Sub-tab ─── */}
            <TabsContent value="open" className="mt-4 space-y-4">
              {openSection ? (
                <>
                  {/* Responsible person filter */}
                  {responsiblePersons.length > 0 && (
                    <div className="flex items-center gap-3">
                      <Filter size={14} className="text-muted-foreground shrink-0" />
                      <Label className="text-sm font-medium shrink-0">담당자 필터</Label>
                      <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="전체" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">전체</SelectItem>
                          {responsiblePersons.map((person) => (
                            <SelectItem key={person} value={person}>
                              {person}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Card>
                    <CardContent className="py-6">
                      <ChecklistSectionCard
                        section={filteredOpenSection!}
                        onToggleItem={(itemId) => toggleItem(openSection.id, itemId)}
                        onEditItem={(item) => handleEditOpen(openSection.id, item)}
                        onDeleteItem={(itemId) => removeItem(openSection.id, itemId)}
                        onAddItem={() => handleAddOpen(openSection.id, openSection.title)}
                        editMode={editMode}
                      />
                    </CardContent>
                  </Card>

                  {/* Complete button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleComplete}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check size={16} className="mr-1" />
                      완료
                    </Button>
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      오픈전 체크리스트 섹션이 없습니다.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      섹션 관리에서 &apos;open-checklist&apos; ID로 섹션을 추가해 주세요.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ─── Delivery Platform Sub-tab ─── */}
            <TabsContent value="delivery" className="mt-4 space-y-6">
              {deliverySections.length > 0 ? (
                <WizardContent
                  sections={deliverySections}
                  currentStep={safeDeliveryStep}
                  currentSection={currentDeliverySection}
                  sectionProgressMap={deliveryProgressMap}
                  totalSteps={deliveryTotalSteps}
                  isFirstStep={isDeliveryFirstStep}
                  isLastStep={isDeliveryLastStep}
                  editMode={editMode}
                  overallPercent={overall.percent}
                  onGoNext={goDeliveryNext}
                  onGoPrev={goDeliveryPrev}
                  onComplete={handleComplete}
                  onStepClick={setDeliveryStep}
                  onToggleItem={(itemId) =>
                    currentDeliverySection && toggleItem(currentDeliverySection.id, itemId)
                  }
                  onEditItem={(item) =>
                    currentDeliverySection && handleEditOpen(currentDeliverySection.id, item)
                  }
                  onDeleteItem={(itemId) =>
                    currentDeliverySection && removeItem(currentDeliverySection.id, itemId)
                  }
                  onAddItem={() =>
                    currentDeliverySection &&
                    handleAddOpen(currentDeliverySection.id, currentDeliverySection.title)
                  }
                />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      배달플랫폼 체크리스트 섹션이 없습니다.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      배민, 쿠팡이츠, 요기요, 땡겨요 섹션을 추가해 주세요.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="franchisee" className="mt-4 space-y-6">
          {editMode && <DocumentGenerator />}
          {franchiseeSections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  가맹점주용 체크리스트 항목이 없습니다.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  오픈전 체크리스트 섹션을 추가해 주세요.
                </p>
              </CardContent>
            </Card>
          ) : (
            <WizardContent
              sections={franchiseeSections}
              currentStep={Math.min(franchiseeStep, franchiseeSections.length - 1)}
              currentSection={
                franchiseeSections[Math.min(franchiseeStep, franchiseeSections.length - 1)] ?? null
              }
              sectionProgressMap={franchiseeProgressMap}
              totalSteps={franchiseeSections.length}
              isFirstStep={franchiseeStep === 0}
              isLastStep={franchiseeStep >= franchiseeSections.length - 1}
              editMode={editMode}
              overallPercent={overall.percent}
              onGoNext={() => {
                if (franchiseeStep < franchiseeSections.length - 1) {
                  setFranchiseeStep((s) => s + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              onGoPrev={() => {
                if (franchiseeStep > 0) {
                  setFranchiseeStep((s) => s - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              onComplete={handleComplete}
              onStepClick={setFranchiseeStep}
              onToggleItem={(itemId) => {
                const sec = franchiseeSections[Math.min(franchiseeStep, franchiseeSections.length - 1)];
                if (sec) toggleItem(sec.id, itemId);
              }}
              onEditItem={(item) => {
                const sec = franchiseeSections[Math.min(franchiseeStep, franchiseeSections.length - 1)];
                if (sec) handleEditOpen(sec.id, item);
              }}
              onDeleteItem={(itemId) => {
                const sec = franchiseeSections[Math.min(franchiseeStep, franchiseeSections.length - 1)];
                if (sec) removeItem(sec.id, itemId);
              }}
              onAddItem={() => {
                const sec = franchiseeSections[Math.min(franchiseeStep, franchiseeSections.length - 1)];
                if (sec) handleAddOpen(sec.id, sec.title);
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        sectionTitle={addDialogSectionTitle}
        existingCategories={addDialogExistingCategories}
        onAdd={handleAddItem}
      />

      <EditItemDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={editDialogItem}
        onSave={handleSaveItem}
      />
    </div>
  );
}

// ────────────────────────────────────────
// Wizard content sub-component
// ────────────────────────────────────────

interface WizardContentProps {
  sections: ChecklistSection[];
  currentStep: number;
  currentSection: ChecklistSection | null;
  sectionProgressMap: Map<string, number>;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  editMode: boolean;
  overallPercent: number;
  onGoNext: () => void;
  onGoPrev: () => void;
  onComplete: () => void;
  onStepClick: (step: number) => void;
  onToggleItem: (itemId: string) => void;
  onEditItem: (item: ChecklistItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: () => void;
}

function WizardContent({
  sections,
  currentStep,
  currentSection,
  sectionProgressMap,
  totalSteps,
  isFirstStep,
  isLastStep,
  editMode,
  overallPercent,
  onGoNext,
  onGoPrev,
  onComplete,
  onStepClick,
  onToggleItem,
  onEditItem,
  onDeleteItem,
  onAddItem,
}: WizardContentProps) {
  if (!currentSection) return null;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max px-1 py-2">
          {sections.map((sec, idx) => {
            const pct = sectionProgressMap.get(sec.id) ?? 0;
            const isActive = idx === currentStep;
            const isComplete = pct === 100;

            return (
              <button
                key={sec.id}
                onClick={() => onStepClick(idx)}
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : isComplete
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold border-2 shrink-0 ${
                  isActive ? 'border-primary-foreground' : isComplete ? 'border-green-500 bg-green-500 text-white' : 'border-muted-foreground/40'
                }`}>
                  {isComplete && !isActive ? (
                    <Check size={12} strokeWidth={3} />
                  ) : (
                    idx + 1
                  )}
                </span>
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {sec.icon} {sec.title}
                </span>
                <span className="sm:hidden">{sec.icon}</span>
                {!isActive && (
                  <span className="text-[10px] opacity-70">
                    {Math.round(pct)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current step number */}
      <div className="text-center text-xs text-muted-foreground">
        {currentStep + 1} / {totalSteps} 단계
      </div>

      {/* Section content */}
      <Card>
        <CardContent className="py-6">
          <ChecklistSectionCard
            section={currentSection}
            onToggleItem={onToggleItem}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            onAddItem={onAddItem}
            editMode={editMode}
          />
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={onGoPrev}
          disabled={isFirstStep}
          className="min-w-[100px]"
        >
          <ChevronLeft size={16} className="mr-1" />
          이전
        </Button>

        <div className="flex-1 text-center">
          <div className="text-xs text-muted-foreground">
            전체 진행률 {Math.round(overallPercent)}%
          </div>
        </div>

        {isLastStep ? (
          <Button
            onClick={onComplete}
            className="min-w-[100px] bg-green-600 hover:bg-green-700"
          >
            <Check size={16} className="mr-1" />
            완료
          </Button>
        ) : (
          <Button
            onClick={onGoNext}
            className="min-w-[100px]"
          >
            다음
            <ChevronRight size={16} className="ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
