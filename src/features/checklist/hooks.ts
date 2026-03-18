'use client';

import { useCallback, useMemo, useState } from 'react';
import { useChecklistStore } from './store';
import { parseChecklistExcel, calcSectionProgress, calcOverallProgress } from './utils';
import type { ChecklistItem, ChecklistSection, ChecklistData, DocumentType, DocumentFormat } from './types';
import { toast } from 'sonner';
import { createKoreanPdf, ensureKoreanFont } from '@/lib/pdf-utils';

// ────────────────────────────────────────
// useChecklistUpload
// ────────────────────────────────────────

export function useChecklistUpload() {
  const setData = useChecklistStore((s) => s.setData);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        const data = await parseChecklistExcel(file);
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '파일 파싱 실패');
      } finally {
        setUploading(false);
      }
    },
    [setData],
  );

  const reset = useCallback(() => {
    useChecklistStore.getState().resetToDefault();
    setError(null);
  }, []);

  return { upload, reset, uploading, error };
}

// ────────────────────────────────────────
// useChecklistState
// ────────────────────────────────────────

export function useChecklistState() {
  const data = useChecklistStore((s) => s.data);
  const toggleItem = useChecklistStore((s) => s.toggleItem);
  const addItem = useChecklistStore((s) => s.addItem);
  const updateItem = useChecklistStore((s) => s.updateItem);
  const removeItem = useChecklistStore((s) => s.removeItem);
  const addSection = useChecklistStore((s) => s.addSection);
  const updateSection = useChecklistStore((s) => s.updateSection);
  const removeSection = useChecklistStore((s) => s.removeSection);
  const reorderSections = useChecklistStore((s) => s.reorderSections);

  return {
    data,
    toggleItem,
    addItem,
    updateItem,
    removeItem,
    addSection,
    updateSection,
    removeSection,
    reorderSections,
  };
}

// ────────────────────────────────────────
// useChecklistProgress
// ────────────────────────────────────────

export function useChecklistProgress() {
  const sections = useChecklistStore((s) => s.data.sections);

  const sectionProgress = useMemo(
    () =>
      sections.map((sec) => ({
        id: sec.id,
        title: sec.title,
        icon: sec.icon,
        ...calcSectionProgress(sec),
      })),
    [sections],
  );

  const overall = useMemo(() => calcOverallProgress(sections), [sections]);

  return { sectionProgress, overall };
}

// ────────────────────────────────────────
// useChecklistCompletion
// ────────────────────────────────────────

export function useChecklistCompletion() {
  const data = useChecklistStore((s) => s.data);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const overall = useMemo(() => calcOverallProgress(data.sections), [data.sections]);

  const allChecked = overall.total > 0 && overall.progress === overall.total;

  const confirmCompletion = useCallback((signature: string) => {
    setSignatureDataUrl(signature);
    setIsCompleted(true);
  }, []);

  const resetCompletion = useCallback(() => {
    setSignatureDataUrl(null);
    setIsCompleted(false);
  }, []);

  return {
    data,
    overall,
    allChecked,
    signatureDataUrl,
    setSignatureDataUrl,
    isCompleted,
    confirmCompletion,
    resetCompletion,
  };
}

// ────────────────────────────────────────
// useDocumentGenerator
// ────────────────────────────────────────

export function useDocumentGenerator() {
  const data = useChecklistStore((s) => s.data);
  const [generating, setGenerating] = useState<string | null>(null);

  const generate = useCallback(
    async (type: DocumentType, format: DocumentFormat) => {
      const key = `${type}-${format}`;
      setGenerating(key);
      try {
        if (format === 'ppt') {
          await generatePPT(data, type);
        } else {
          await generatePDF(data, type);
        }
        toast.success('문서 다운로드 완료');
      } catch (err) {
        console.error(err);
        toast.error('문서 생성 중 오류가 발생했습니다');
      } finally {
        setGenerating(null);
      }
    },
    [data],
  );

  const generateSection = useCallback(
    async (sectionId: string, format: DocumentFormat) => {
      const key = `section-${sectionId}-${format}`;
      setGenerating(key);
      try {
        const section = data.sections.find(s => s.id === sectionId);
        if (!section) throw new Error('Section not found');

        if (format === 'ppt') {
          await generateSectionPPT(data, section);
        } else {
          await generateSectionPDF(data, section);
        }
        toast.success(`${section.title} 다운로드 완료`);
      } catch (err) {
        console.error(err);
        toast.error('문서 생성 중 오류가 발생했습니다');
      } finally {
        setGenerating(null);
      }
    },
    [data],
  );

  return { generate, generateSection, generating };
}

// ════════════════════════════════════════════════
// Design constants
// ════════════════════════════════════════════════

const CC = {
  primary: '03C75A',
  primaryDark: '029A47',
  dark: '1E1E1E',
  darkSlate: '1e293b',
  gray: '64748b',
  lightGray: '94a3b8',
  lightBg: 'F8F9FA',
  altRow: 'F1F5F9',
  white: 'FFFFFF',
  border: 'E2E8F0',
  red: 'EF4444',
  amber: 'F59E0B',
  blue: '3B82F6',
  purple: '8B5CF6',
  green: '22c55e',
  yellow: 'EAB308',
};
const FONT = '맑은 고딕';
const BRAND = 'DDUNDDUN 뛰뛰 F&B Dashboard';

function todayStr() {
  return new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ════════════════════════════════════════════════
// PPT helpers
// ════════════════════════════════════════════════

function addPptFooter(slide: any, pptx: any, pageNum: number) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.0, w: '100%', h: 0.5, fill: { color: CC.darkSlate } });
  slide.addText(BRAND, { x: 0.3, y: 7.0, w: 6, h: 0.5, fontSize: 7, color: CC.lightGray, fontFace: FONT });
  slide.addText(`${todayStr()}  |  ${pageNum}`, { x: 7, y: 7.0, w: 6, h: 0.5, fontSize: 7, color: CC.lightGray, align: 'right', fontFace: FONT });
}

function addPptHeader(slide: any, pptx: any, title: string) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.85, fill: { color: CC.dark } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.85, fill: { color: CC.primary } });
  slide.addText(title, { x: 0.3, y: 0, w: 12, h: 0.85, fontSize: 22, bold: true, color: CC.white, fontFace: FONT });
}

function hdrCell(text: string, align: 'left' | 'center' | 'right' = 'center') {
  return { text, options: { bold: true, color: CC.white, fill: { color: CC.primary }, align, valign: 'middle' as const, fontSize: 9, fontFace: FONT } };
}

function dataCell(text: string, rowIdx: number, opts?: Record<string, unknown>) {
  return { text, options: { fill: { color: rowIdx % 2 === 0 ? CC.white : CC.altRow }, fontSize: 9, color: CC.darkSlate, fontFace: FONT, ...opts } };
}

// ════════════════════════════════════════════════
// PPT: Title slide builder
// ════════════════════════════════════════════════

function buildChecklistTitleSlide(pptx: any, data: ChecklistData, title: string) {
  const slide = pptx.addSlide();
  slide.background = { color: CC.dark };

  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: CC.primary } });

  slide.addText('DDUNDDUN 뛰뛰', {
    x: 0.5, y: 1.0, w: 12.33, h: 0.5, fontSize: 14, color: CC.primary, fontFace: FONT, charSpacing: 4, align: 'center',
  });

  slide.addText(title, {
    x: 0.5, y: 2.0, w: 12.33, h: 1.2, fontSize: 38, bold: true, color: CC.white, fontFace: FONT, align: 'center',
  });

  slide.addShape(pptx.ShapeType.rect, { x: 4.67, y: 3.4, w: 4, h: 0.04, fill: { color: CC.primary } });

  const brandLabel = data.brandName || '브랜드명';
  const storeLabel = data.storeName || '매장명';
  const assigneeLabel = data.assignee || '';

  slide.addText(`${brandLabel}  |  ${storeLabel}`, {
    x: 0.5, y: 3.7, w: 12.33, h: 0.6, fontSize: 18, color: CC.lightGray, fontFace: FONT, align: 'center',
  });

  if (assigneeLabel) {
    slide.addText(`담당자: ${assigneeLabel}`, {
      x: 0.5, y: 4.4, w: 12.33, h: 0.4, fontSize: 12, color: CC.gray, fontFace: FONT, align: 'center',
    });
  }

  const overall = calcOverallProgress(data.sections);
  slide.addText(
    `전체 진행률: ${overall.progress}/${overall.total} (${Math.round(overall.percent)}%)  |  ${data.sections.length}개 섹션`,
    { x: 0.5, y: 5.1, w: 12.33, h: 0.45, fontSize: 12, color: CC.lightGray, fontFace: FONT, align: 'center' },
  );

  slide.addText(`보고서 생성일: ${todayStr()}`, {
    x: 0.5, y: 6.0, w: 12.33, h: 0.4, fontSize: 10, color: CC.gray, fontFace: FONT, align: 'center',
  });

  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.0, w: '100%', h: 0.5, fill: { color: CC.primary } });
  slide.addText('Confidential', {
    x: 0.5, y: 7.0, w: 12.33, h: 0.5, fontSize: 9, color: CC.white, fontFace: FONT, align: 'center',
  });
}

// ════════════════════════════════════════════════
// PPT: Progress overview slide
// ════════════════════════════════════════════════

function buildProgressSlide(pptx: any, data: ChecklistData, pageNum: number) {
  const slide = pptx.addSlide();
  addPptHeader(slide, pptx, '전체 진행 현황');

  const overall = calcOverallProgress(data.sections);

  // Overall progress badge
  const pct = Math.round(overall.percent);
  const progressColor = pct >= 80 ? CC.green : pct >= 50 ? CC.amber : CC.red;

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.3, y: 1.1, w: 12.73, h: 0.8,
    fill: { color: CC.lightBg }, line: { color: progressColor, pt: 1.5 }, rectRadius: 0.06,
  });
  slide.addText(`전체 진행률: ${overall.progress}/${overall.total} (${pct}%)`, {
    x: 0.5, y: 1.1, w: 12.33, h: 0.8, fontSize: 18, bold: true, color: progressColor, fontFace: FONT, align: 'center', valign: 'middle',
  });

  // Progress bar representation (visual bar using shapes)
  const barY = 2.1;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.3, y: barY, w: 12.73, h: 0.25,
    fill: { color: CC.border }, rectRadius: 0.06,
  });
  if (overall.percent > 0) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.3, y: barY, w: Math.max(0.1, 12.73 * (overall.percent / 100)), h: 0.25,
      fill: { color: progressColor }, rectRadius: 0.06,
    });
  }

  // Per-section progress
  data.sections.forEach((sec, i) => {
    const sp = calcSectionProgress(sec);
    const y = 2.6 + i * 0.65;
    if (y > 6.5) return;

    const secPct = Math.round(sp.percent);
    const secColor = secPct >= 80 ? CC.green : secPct >= 50 ? CC.amber : CC.red;

    // Section row background
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.3, y, w: 12.73, h: 0.55,
      fill: { color: i % 2 === 0 ? CC.white : CC.altRow },
      line: { color: CC.border, pt: 0.3 },
      rectRadius: 0.04,
    });

    // Section name
    slide.addText(`${sec.icon} ${sec.title}`, {
      x: 0.5, y, w: 4.5, h: 0.55, fontSize: 11, bold: true, color: CC.darkSlate, fontFace: FONT, valign: 'middle',
    });

    // Progress bar for section
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 5.2, y: y + 0.16, w: 5.5, h: 0.24,
      fill: { color: CC.border }, rectRadius: 0.04,
    });
    if (sp.percent > 0) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 5.2, y: y + 0.16, w: Math.max(0.08, 5.5 * (sp.percent / 100)), h: 0.24,
        fill: { color: secColor }, rectRadius: 0.04,
      });
    }

    // Count & percent
    slide.addText(`${sp.progress}/${sp.total} (${secPct}%)`, {
      x: 10.8, y, w: 2.2, h: 0.55, fontSize: 10, bold: true, color: secColor, fontFace: FONT, align: 'right', valign: 'middle',
    });
  });

  addPptFooter(slide, pptx, pageNum);
}

// ════════════════════════════════════════════════
// PPT: Section detail slide(s)
// ════════════════════════════════════════════════

function buildSectionDetailSlides(pptx: any, section: ChecklistSection, startPage: number, showGuide: boolean): number {
  const sp = calcSectionProgress(section);
  const ITEMS_PER_SLIDE = 12;
  let page = startPage;

  for (let i = 0; i < section.items.length; i += ITEMS_PER_SLIDE) {
    const chunk = section.items.slice(i, i + ITEMS_PER_SLIDE);
    const slide = pptx.addSlide();

    const slideLabel = section.items.length > ITEMS_PER_SLIDE
      ? `${section.icon} ${section.title} (${i + 1}~${Math.min(i + ITEMS_PER_SLIDE, section.items.length)})`
      : `${section.icon} ${section.title}`;
    addPptHeader(slide, pptx, slideLabel);

    // Section progress badge
    const secPct = Math.round(sp.percent);
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.3, y: 1.0, w: 12.73, h: 0.4,
      fill: { color: CC.lightBg }, rectRadius: 0.04,
    });
    slide.addText(`완료: ${sp.progress}/${sp.total} (${secPct}%)`, {
      x: 0.5, y: 1.0, w: 12.33, h: 0.4, fontSize: 10, color: secPct >= 80 ? CC.green : secPct >= 50 ? CC.amber : CC.red, fontFace: FONT, align: 'center', valign: 'middle',
    });

    // Build table
    const headerRow = [
      hdrCell('상태', 'center'),
      hdrCell('카테고리', 'center'),
      hdrCell('항목', 'left'),
      hdrCell('담당자', 'center'),
      ...(showGuide ? [hdrCell('비고/가이드', 'left')] : []),
    ];

    const rows = chunk.map((item, idx) => {
      const statusText = item.checked ? '\u2713' : '\u2717';
      const statusColor = item.checked ? CC.green : CC.red;
      const rowColor = item.checked ? CC.lightGray : CC.darkSlate;
      const bgColor = item.checked ? CC.lightBg : (idx % 2 === 0 ? CC.white : CC.altRow);

      const row = [
        { text: statusText, options: { fill: { color: bgColor }, fontSize: 13, bold: true, color: statusColor, fontFace: FONT, align: 'center' as const } },
        dataCell(item.category, idx, { align: 'center' as const, fill: { color: bgColor }, color: rowColor }),
        dataCell(item.title, idx, { align: 'left' as const, fill: { color: bgColor }, color: rowColor, bold: !item.checked }),
        dataCell(item.responsible || '-', idx, { align: 'center' as const, fill: { color: bgColor }, color: rowColor }),
      ];
      if (showGuide) {
        const guideText = [item.notes, item.guide].filter(Boolean).join(' | ');
        row.push(dataCell(guideText || '-', idx, { fill: { color: bgColor }, color: CC.gray, fontSize: 9 }));
      }
      return row;
    });

    const colW = showGuide ? [0.6, 1.6, 4.4, 1.2, 5.0] : [0.6, 1.8, 6.5, 1.6];

    slide.addTable([headerRow, ...rows], {
      x: 0.3, y: 1.6, w: 12.73,
      rowH: showGuide ? 0.33 : 0.35,
      colW,
      fontSize: 10,
      border: { type: 'solid', color: CC.border, pt: 0.5 },
      fontFace: FONT,
      margin: [3, 5, 3, 5],
    });

    addPptFooter(slide, pptx, page);
    page++;
  }

  return page;
}

// ════════════════════════════════════════════════
// PPT: Pending items highlight slide
// ════════════════════════════════════════════════

function buildPendingSlide(pptx: any, data: ChecklistData, pageNum: number) {
  const allPending: { section: string; item: ChecklistItem }[] = [];
  data.sections.forEach(sec => {
    sec.items.filter(i => !i.checked).forEach(item => {
      allPending.push({ section: `${sec.icon} ${sec.title}`, item });
    });
  });

  if (allPending.length === 0) return pageNum;

  const ITEMS_PER_SLIDE = 14;
  let page = pageNum;

  for (let i = 0; i < allPending.length; i += ITEMS_PER_SLIDE) {
    const chunk = allPending.slice(i, i + ITEMS_PER_SLIDE);
    const slide = pptx.addSlide();
    const label = allPending.length > ITEMS_PER_SLIDE
      ? `미완료 항목 (${i + 1}~${Math.min(i + ITEMS_PER_SLIDE, allPending.length)} / ${allPending.length}건)`
      : `미완료 항목 (총 ${allPending.length}건)`;
    addPptHeader(slide, pptx, label);

    // Urgent notice
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.3, y: 1.0, w: 12.73, h: 0.4,
      fill: { color: 'FEF2F2' }, line: { color: CC.red, pt: 0.5 }, rectRadius: 0.04,
    });
    slide.addText(`총 ${allPending.length}건의 미완료 항목이 있습니다`, {
      x: 0.5, y: 1.0, w: 12.33, h: 0.4, fontSize: 10, bold: true, color: CC.red, fontFace: FONT, align: 'center', valign: 'middle',
    });

    const headerRow = [
      hdrCell('#', 'center'),
      hdrCell('섹션', 'left'),
      hdrCell('카테고리', 'center'),
      hdrCell('항목', 'left'),
      hdrCell('담당자', 'center'),
    ];

    const rows = chunk.map((p, idx) => [
      dataCell(`${i + idx + 1}`, idx, { align: 'center' as const }),
      dataCell(p.section, idx, { align: 'left' as const, fontSize: 9, color: CC.gray }),
      dataCell(p.item.category, idx, { align: 'center' as const }),
      dataCell(p.item.title, idx, { align: 'left' as const, bold: true }),
      dataCell(p.item.responsible || '-', idx, { align: 'center' as const }),
    ]);

    slide.addTable([headerRow, ...rows], {
      x: 0.3, y: 1.6, w: 12.73,
      rowH: 0.33,
      colW: [0.5, 2.8, 1.6, 6.0, 1.83],
      fontSize: 10,
      border: { type: 'solid', color: CC.border, pt: 0.5 },
      fontFace: FONT,
      margin: [3, 5, 3, 5],
    });

    addPptFooter(slide, pptx, page);
    page++;
  }

  return page;
}

// ════════════════════════════════════════════════
// PPT: Summary / next steps slide
// ════════════════════════════════════════════════

function buildSummarySlide(pptx: any, data: ChecklistData, pageNum: number) {
  const slide = pptx.addSlide();
  addPptHeader(slide, pptx, '요약 및 다음 단계');

  const overall = calcOverallProgress(data.sections);
  const pct = Math.round(overall.percent);
  const pendingCount = overall.total - overall.progress;

  const insights: string[] = [];

  if (pct === 100) {
    insights.push('모든 항목이 완료되었습니다. 최종 검토를 진행해주세요.');
  } else {
    insights.push(`전체 진행률: ${pct}% (${overall.progress}/${overall.total})`);
    insights.push(`미완료 항목: ${pendingCount}건`);
  }

  // Find sections with most pending
  const sectionsByPending = data.sections
    .map(sec => ({ title: `${sec.icon} ${sec.title}`, pending: sec.items.filter(i => !i.checked).length }))
    .filter(s => s.pending > 0)
    .sort((a, b) => b.pending - a.pending);

  if (sectionsByPending.length > 0) {
    insights.push(`가장 많은 미완료: ${sectionsByPending[0].title} (${sectionsByPending[0].pending}건)`);
  }

  // Sections fully complete
  const completeSections = data.sections.filter(sec => {
    const sp = calcSectionProgress(sec);
    return sp.percent === 100;
  });
  if (completeSections.length > 0) {
    insights.push(`완료된 섹션: ${completeSections.map(s => s.title).join(', ')}`);
  }

  insights.forEach((text, i) => {
    const y = 1.3 + i * 0.85;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y, w: 12.33, h: 0.7,
      fill: { color: CC.lightBg }, line: { color: CC.primary, pt: 0.5 }, rectRadius: 0.06,
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y, w: 0.7, h: 0.7, fill: { color: CC.primary }, rectRadius: 0.06,
    });
    slide.addText(`${i + 1}`, {
      x: 0.5, y, w: 0.7, h: 0.7, fontSize: 14, bold: true, color: CC.white, fontFace: FONT, align: 'center', valign: 'middle',
    });
    slide.addText(text, {
      x: 1.4, y, w: 11.2, h: 0.7, fontSize: 13, color: CC.darkSlate, fontFace: FONT, valign: 'middle',
    });
  });

  addPptFooter(slide, pptx, pageNum);
}

// ════════════════════════════════════════════════
// PPT: Franchisee quick reference card
// ════════════════════════════════════════════════

function buildQuickReferenceSlide(pptx: any, data: ChecklistData, pageNum: number) {
  const slide = pptx.addSlide();
  addPptHeader(slide, pptx, '빠른 참고 카드');

  // Group items by category across all sections
  const byCat = new Map<string, string[]>();
  data.sections.forEach(sec => {
    sec.items.forEach(item => {
      const list = byCat.get(item.category) || [];
      list.push(item.title);
      byCat.set(item.category, list);
    });
  });

  let y = 1.2;
  let col = 0;
  const catEntries = Array.from(byCat.entries());
  catEntries.forEach(([cat, items], catIdx) => {
    const x = 0.3 + col * 6.5;
    if (y + 0.3 + items.length * 0.24 > 6.5) {
      col++;
      y = 1.2;
      if (col > 1) return; // max 2 columns
    }

    slide.addText(cat, {
      x, y, w: 6.0, h: 0.35, fontSize: 12, bold: true, color: CC.primary, fontFace: FONT,
    });
    y += 0.4;

    items.slice(0, 10).forEach(title => {
      slide.addText(`  \u2022 ${title}`, {
        x, y, w: 6.0, h: 0.24, fontSize: 9, color: CC.darkSlate, fontFace: FONT,
      });
      y += 0.24;
    });
    y += 0.25;
  });

  addPptFooter(slide, pptx, pageNum);
}

// ════════════════════════════════════════════════
// Blank template helper
// ════════════════════════════════════════════════

function makeBlankData(data: ChecklistData): ChecklistData {
  return {
    ...data,
    sections: data.sections.map(sec => ({
      ...sec,
      items: sec.items.map(item => ({ ...item, checked: false })),
    })),
  };
}

// ════════════════════════════════════════════════
// Main PPT Generation
// ════════════════════════════════════════════════

async function generatePPT(data: ChecklistData, type: DocumentType) {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE';
  pres.author = 'DDUNDDUN';

  // For blank-template, use unchecked data
  const effectiveData = type === 'blank-template' ? makeBlankData(data) : data;

  const brandLabel = effectiveData.brandName || '브랜드명';

  const titleMap: Record<DocumentType, string> = {
    executive: `${brandLabel} 오픈 진행 보고서`,
    'hq-training': `${brandLabel} 본사직원용 교육문서`,
    'franchisee-training': `${brandLabel} 가맹점주용 운영 매뉴얼`,
    'blank-template': `${brandLabel} 체크리스트 기본 양식`,
  };

  // Title slide
  buildChecklistTitleSlide(pres, effectiveData, titleMap[type]);

  let page = 2;

  if (type === 'blank-template') {
    // Blank template: all sections with empty checkboxes, no progress/pending
    for (const sec of effectiveData.sections) {
      page = buildSectionDetailSlides(pres, sec, page, true);
    }
  } else if (type === 'executive') {
    // Executive: Progress overview + Pending items + Summary
    buildProgressSlide(pres, effectiveData, page++);

    // Per-section detail (only pending items shown via the pending slide)
    page = buildPendingSlide(pres, effectiveData, page);

    // Per-section summary slides (brief)
    for (const sec of effectiveData.sections) {
      page = buildSectionDetailSlides(pres, sec, page, false);
    }

    buildSummarySlide(pres, effectiveData, page);
  } else if (type === 'hq-training') {
    // HQ Training: TOC + Progress + All sections with guide + Summary
    // Table of contents slide
    const tocSlide = pres.addSlide();
    addPptHeader(tocSlide, pres, '목차');
    effectiveData.sections.forEach((sec, i) => {
      const y = 1.2 + i * 0.5;
      if (y > 6.5) return;
      const sp = calcSectionProgress(sec);
      tocSlide.addText(`${i + 1}. ${sec.icon} ${sec.title}`, {
        x: 0.5, y, w: 8, h: 0.45, fontSize: 14, color: CC.darkSlate, fontFace: FONT, valign: 'middle',
      });
      tocSlide.addText(`${sp.progress}/${sp.total}`, {
        x: 9, y, w: 3.5, h: 0.45, fontSize: 12, color: sp.percent === 100 ? CC.green : CC.amber, fontFace: FONT, align: 'right', valign: 'middle',
      });
    });
    addPptFooter(tocSlide, pres, page++);

    buildProgressSlide(pres, effectiveData, page++);

    for (const sec of effectiveData.sections) {
      page = buildSectionDetailSlides(pres, sec, page, true); // showGuide = true
    }

    buildSummarySlide(pres, effectiveData, page);
  } else {
    // Franchisee Training: Simplified
    // Key responsibilities overview
    const overviewSlide = pres.addSlide();
    addPptHeader(overviewSlide, pres, '핵심 업무 개요');

    effectiveData.sections.forEach((sec, i) => {
      const y = 1.2 + i * 0.8;
      if (y > 6.2) return;
      const sp = calcSectionProgress(sec);

      overviewSlide.addShape(pres.ShapeType.roundRect, {
        x: 0.3, y, w: 12.73, h: 0.7,
        fill: { color: i % 2 === 0 ? CC.white : CC.altRow },
        line: { color: CC.border, pt: 0.5 },
        rectRadius: 0.04,
      });

      overviewSlide.addText(`${sec.icon} ${sec.title}`, {
        x: 0.5, y, w: 7, h: 0.7, fontSize: 14, bold: true, color: CC.darkSlate, fontFace: FONT, valign: 'middle',
      });

      overviewSlide.addText(`${sec.items.length}개 항목`, {
        x: 8, y, w: 4.8, h: 0.7, fontSize: 12, color: CC.gray, fontFace: FONT, align: 'right', valign: 'middle',
      });
    });
    addPptFooter(overviewSlide, pres, page++);

    // Step-by-step section slides (simplified)
    for (const sec of effectiveData.sections) {
      page = buildSectionDetailSlides(pres, sec, page, false);
    }

    // Quick reference card
    buildQuickReferenceSlide(pres, effectiveData, page);
  }

  const filename = `${titleMap[type]}_${new Date().toISOString().slice(0, 10)}.pptx`;
  await pres.writeFile({ fileName: filename });
}

// ════════════════════════════════════════════════
// PDF helpers
// ════════════════════════════════════════════════

function addPdfHeader(doc: any, title: string) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(3, 199, 90);
  doc.rect(0, 0, pageW, 2, 'F');
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 2, pageW, 12, 'F');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 20, 10.5);
  doc.text(BRAND, pageW - 20, 10.5, { align: 'right' });
}

function addPdfFooter(doc: any, pageNum: number) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(3, 199, 90);
  doc.setLineWidth(0.5);
  doc.line(20, pageH - 12, pageW - 20, pageH - 12);
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(BRAND, 20, pageH - 7);
  doc.text(`${todayStr()}  |  ${pageNum}`, pageW - 20, pageH - 7, { align: 'right' });
}

// ════════════════════════════════════════════════
// Main PDF Generation
// ════════════════════════════════════════════════

async function generatePDF(data: ChecklistData, type: DocumentType) {
  const doc = await createKoreanPdf({ orientation: 'portrait' });

  // For blank-template, use unchecked data
  const effectiveData = type === 'blank-template' ? makeBlankData(data) : data;

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const brandLabel = effectiveData.brandName || '브랜드명';
  const storeLabel = effectiveData.storeName || '매장명';

  const titleMap: Record<DocumentType, string> = {
    executive: `${brandLabel} 오픈 진행 보고서`,
    'hq-training': `${brandLabel} 본사직원용 교육문서`,
    'franchisee-training': `${brandLabel} 가맹점주용 운영 매뉴얼`,
    'blank-template': `${brandLabel} 체크리스트 기본 양식`,
  };

  const overall = calcOverallProgress(effectiveData.sections);
  let pageNum = 1;

  // ── Cover page ──
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 0, pageW, pageH, 'F');
  doc.setFillColor(3, 199, 90);
  doc.rect(0, 0, pageW, 4, 'F');

  doc.setFontSize(12);
  doc.setTextColor(3, 199, 90);
  doc.text('DDUNDDUN 뛰뛰', pageW / 2, 50, { align: 'center' });

  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(titleMap[type], pageW / 2, 80, { align: 'center' });

  doc.setFillColor(3, 199, 90);
  doc.rect(pageW / 2 - 25, 88, 50, 1, 'F');

  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  doc.text(`${storeLabel}`, pageW / 2, 100, { align: 'center' });

  if (effectiveData.assignee) {
    doc.setFontSize(10);
    doc.text(`담당자: ${effectiveData.assignee}`, pageW / 2, 112, { align: 'center' });
  }

  doc.setFontSize(10);
  doc.text(
    `전체 진행률: ${overall.progress}/${overall.total} (${Math.round(overall.percent)}%)`,
    pageW / 2, 125, { align: 'center' },
  );

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`보고서 생성일: ${todayStr()}`, pageW / 2, 140, { align: 'center' });

  // ── Progress page ──
  doc.addPage();
  pageNum++;
  addPdfHeader(doc, '전체 진행 현황');

  let y = 28;

  // Overall bar
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(20, y, pageW - 40, 6, 2, 2, 'F');
  if (overall.percent > 0) {
    const barColor = overall.percent >= 80 ? [34, 197, 94] : overall.percent >= 50 ? [234, 179, 8] : [239, 68, 68];
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.roundedRect(20, y, Math.max(2, (pageW - 40) * (overall.percent / 100)), 6, 2, 2, 'F');
  }
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text(`${Math.round(overall.percent)}%`, pageW / 2, y + 4.2, { align: 'center' });
  y += 12;

  // Per-section bars
  effectiveData.sections.forEach((sec, i) => {
    if (y > 270) { addPdfFooter(doc, pageNum); doc.addPage(); pageNum++; addPdfHeader(doc, '전체 진행 현황 (계속)'); y = 28; }

    const sp = calcSectionProgress(sec);
    const secPct = Math.round(sp.percent);

    // Background
    if (i % 2 === 0) {
      doc.setFillColor(248, 249, 250);
      doc.roundedRect(20, y - 2, pageW - 40, 14, 1, 1, 'F');
    }

    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(`${sec.icon} ${sec.title}`, 24, y + 3);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`${sp.progress}/${sp.total} (${secPct}%)`, pageW - 24, y + 3, { align: 'right' });

    // Mini bar
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(24, y + 6, pageW - 48, 3, 1, 1, 'F');
    if (sp.percent > 0) {
      const barColor = sp.percent >= 80 ? [34, 197, 94] : sp.percent >= 50 ? [234, 179, 8] : [239, 68, 68];
      doc.setFillColor(barColor[0], barColor[1], barColor[2]);
      doc.roundedRect(24, y + 6, Math.max(1, (pageW - 48) * (sp.percent / 100)), 3, 1, 1, 'F');
    }

    y += 16;
  });

  addPdfFooter(doc, pageNum);

  // ── Section detail pages ──
  const sectionsToShow = effectiveData.sections;

  for (const sec of sectionsToShow) {
    const sp = calcSectionProgress(sec);
    doc.addPage();
    pageNum++;
    addPdfHeader(doc, `${sec.icon} ${sec.title}`);

    y = 25;

    // Section progress indicator
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(20, y, pageW - 40, 8, 1, 1, 'F');
    doc.setFontSize(8);
    doc.setTextColor(3, 199, 90);
    doc.text(`완료: ${sp.progress}/${sp.total} (${Math.round(sp.percent)}%)`, pageW / 2, y + 5.5, { align: 'center' });
    y += 12;

    // Table header
    doc.setFillColor(3, 199, 90);
    const tableX = 20;
    const tableW = pageW - 40;
    doc.rect(tableX, y, tableW, 7, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    const showGuide = type === 'hq-training' || type === 'blank-template';
    if (showGuide) {
      doc.text('상태', tableX + 5, y + 5, { align: 'center' });
      doc.text('카테고리', tableX + 20, y + 5, { align: 'center' });
      doc.text('항목', tableX + 45, y + 5);
      doc.text('담당', tableX + 95, y + 5, { align: 'center' });
      doc.text('비고/가이드', tableX + 115, y + 5);
    } else {
      doc.text('상태', tableX + 5, y + 5, { align: 'center' });
      doc.text('카테고리', tableX + 22, y + 5, { align: 'center' });
      doc.text('항목', tableX + 50, y + 5);
      doc.text('담당자', tableX + 130, y + 5, { align: 'center' });
    }
    y += 8;

    const itemsToShow = type === 'executive' ? sec.items.filter(i => !i.checked) : sec.items;

    itemsToShow.forEach((item, idx) => {
      if (y > 273) {
        addPdfFooter(doc, pageNum);
        doc.addPage();
        pageNum++;
        addPdfHeader(doc, `${sec.icon} ${sec.title} (계속)`);
        y = 28;
      }

      // Alternating background
      if (idx % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(tableX, y - 3.5, tableW, 6.5, 'F');
      }

      // Status
      doc.setFontSize(9);
      if (item.checked) {
        doc.setTextColor(34, 197, 94);
        doc.text('\✓', tableX + 5, y + 1, { align: 'center' });
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text('\✗', tableX + 5, y + 1, { align: 'center' });
      }

      doc.setFontSize(7.5);
      doc.setTextColor(item.checked ? 150 : 40, item.checked ? 150 : 40, item.checked ? 150 : 40);

      if (showGuide) {
        doc.text(item.category, tableX + 20, y + 1, { align: 'center' });
        doc.text(item.title.substring(0, 40), tableX + 45, y + 1);
        doc.text(item.responsible || '-', tableX + 95, y + 1, { align: 'center' });
        const guideText = [item.notes, item.guide].filter(Boolean).join(' | ').substring(0, 35);
        doc.setTextColor(100, 100, 100);
        doc.text(guideText || '-', tableX + 115, y + 1);
      } else {
        doc.text(item.category, tableX + 22, y + 1, { align: 'center' });
        doc.text(item.title.substring(0, 55), tableX + 50, y + 1);
        doc.text(item.responsible || '-', tableX + 130, y + 1, { align: 'center' });
      }

      y += 6.5;
    });

    addPdfFooter(doc, pageNum);
  }

  // ── Pending items page (for executive) ──
  if (type === 'executive') {
    const allPending: { section: string; item: ChecklistItem }[] = [];
    effectiveData.sections.forEach(sec => {
      sec.items.filter(i => !i.checked).forEach(item => {
        allPending.push({ section: sec.title, item });
      });
    });

    if (allPending.length > 0) {
      doc.addPage();
      pageNum++;
      addPdfHeader(doc, `미완료 항목 종합 (총 ${allPending.length}건)`);

      y = 25;
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(20, y, pageW - 40, 8, 1, 1, 'F');
      doc.setFontSize(8);
      doc.setTextColor(239, 68, 68);
      doc.text(`총 ${allPending.length}건의 미완료 항목이 있습니다`, pageW / 2, y + 5.5, { align: 'center' });
      y += 12;

      allPending.forEach((p, idx) => {
        if (y > 273) {
          addPdfFooter(doc, pageNum);
          doc.addPage();
          pageNum++;
          addPdfHeader(doc, '미완료 항목 (계속)');
          y = 28;
        }

        if (idx % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(20, y - 3, pageW - 40, 6, 'F');
        }

        doc.setFontSize(7.5);
        doc.setTextColor(100, 100, 100);
        doc.text(`${idx + 1}`, 24, y + 1);
        doc.text(p.section, 30, y + 1);
        doc.setTextColor(40, 40, 40);
        doc.text(`[${p.item.category}] ${p.item.title}`, 65, y + 1);
        doc.setTextColor(100, 100, 100);
        doc.text(p.item.responsible || '-', pageW - 24, y + 1, { align: 'right' });
        y += 6;
      });

      addPdfFooter(doc, pageNum);
    }
  }

  const filename = `${titleMap[type]}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

// ════════════════════════════════════════════════
// Section-level PPT/PDF
// ════════════════════════════════════════════════

async function generateSectionPPT(data: ChecklistData, section: ChecklistSection) {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE';
  pres.author = 'DDUNDDUN';

  buildChecklistTitleSlide(pres, data, `${section.icon} ${section.title}`);
  buildSectionDetailSlides(pres, section, 2, true);

  const filename = `체크리스트_${section.title}_${new Date().toISOString().slice(0, 10)}.pptx`;
  await pres.writeFile({ fileName: filename });
}

async function generateSectionPDF(data: ChecklistData, section: ChecklistSection) {
  const doc = await createKoreanPdf({ orientation: 'portrait' });
  const pageW = doc.internal.pageSize.getWidth();

  const sp = calcSectionProgress(section);
  let pageNum = 1;

  // Cover
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 0, pageW, 297, 'F');
  doc.setFillColor(3, 199, 90);
  doc.rect(0, 0, pageW, 4, 'F');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(`${section.icon} ${section.title}`, pageW / 2, 80, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`${data.brandName || ''} | ${data.storeName || ''} | 진행률 ${sp.progress}/${sp.total}`, pageW / 2, 95, { align: 'center' });

  // Detail page
  doc.addPage();
  pageNum++;
  addPdfHeader(doc, `${section.icon} ${section.title}`);

  let y = 25;
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(20, y, pageW - 40, 8, 1, 1, 'F');
  doc.setFontSize(8);
  doc.setTextColor(3, 199, 90);
  doc.text(`완료: ${sp.progress}/${sp.total} (${Math.round(sp.percent)}%)`, pageW / 2, y + 5.5, { align: 'center' });
  y += 12;

  // Table header
  const tableX = 20;
  const tableW = pageW - 40;
  doc.setFillColor(3, 199, 90);
  doc.rect(tableX, y, tableW, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('상태', tableX + 5, y + 5, { align: 'center' });
  doc.text('카테고리', tableX + 20, y + 5, { align: 'center' });
  doc.text('항목', tableX + 45, y + 5);
  doc.text('담당', tableX + 95, y + 5, { align: 'center' });
  doc.text('비고', tableX + 115, y + 5);
  y += 8;

  section.items.forEach((item, idx) => {
    if (y > 273) {
      addPdfFooter(doc, pageNum);
      doc.addPage();
      pageNum++;
      addPdfHeader(doc, `${section.title} (계속)`);
      y = 28;
    }

    if (idx % 2 === 0) {
      doc.setFillColor(248, 249, 250);
      doc.rect(tableX, y - 3.5, tableW, 6.5, 'F');
    }

    doc.setFontSize(9);
    if (item.checked) {
      doc.setTextColor(34, 197, 94);
      doc.text('\✓', tableX + 5, y + 1, { align: 'center' });
    } else {
      doc.setTextColor(239, 68, 68);
      doc.text('\✗', tableX + 5, y + 1, { align: 'center' });
    }

    doc.setFontSize(7.5);
    doc.setTextColor(item.checked ? 150 : 40, item.checked ? 150 : 40, item.checked ? 150 : 40);
    doc.text(item.category, tableX + 20, y + 1, { align: 'center' });
    doc.text(item.title.substring(0, 40), tableX + 45, y + 1);
    doc.text(item.responsible || '-', tableX + 95, y + 1, { align: 'center' });
    const noteText = [item.notes, item.guide].filter(Boolean).join(' | ').substring(0, 30);
    doc.setTextColor(100, 100, 100);
    doc.text(noteText || '-', tableX + 115, y + 1);

    y += 6.5;
  });

  addPdfFooter(doc, pageNum);

  const filename = `체크리스트_${section.title}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
