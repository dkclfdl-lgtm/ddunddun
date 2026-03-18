'use client';

import { useState, useCallback } from 'react';
import { Download, FileText, Presentation, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createKoreanPdf, ensureKoreanFont } from '@/lib/pdf-utils';
import type { MenuItem, CategorySummary, CostSimulation } from '../types';

// ────────────────────────────────────────────────────────
// Design tokens
// ────────────────────────────────────────────────────────
const C = {
  primary: '03C75A',
  primaryDark: '029A47',
  secondary: '1A73E8',
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
};

const FONT = '맑은 고딕';
const BRAND = 'DDUNDDUN 뛰뛰 F&B Dashboard';

function today() {
  return new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtCurrency(v: number): string {
  if (v >= 100000000) return `${(v / 100000000).toFixed(1)}억원`;
  if (v >= 10000) return `${Math.round(v / 10000)}만원`;
  return `${v.toLocaleString()}원`;
}

function fmtPercent(v: number): string {
  return `${v.toFixed(1)}%`;
}

// ────────────────────────────────────────────────────────
// Section definitions
// ────────────────────────────────────────────────────────
type SectionId = 'summary' | 'menu-cost' | 'category' | 'category-detail' | 'simulation';

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'summary', label: '원가 요약' },
  { id: 'menu-cost', label: '메뉴 원가 분석 (Top 20)' },
  { id: 'category', label: '카테고리별 분석' },
  { id: 'category-detail', label: '카테고리별 메뉴 상세' },
  { id: 'simulation', label: '원가 시믬레이션' },
];

// ────────────────────────────────────────────────────────
// PPT helpers
// ────────────────────────────────────────────────────────
function addPptFooter(slide: any, pptx: any, pageNum: number, dateStr: string) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.0, w: '100%', h: 0.5, fill: { color: C.darkSlate } });
  slide.addText(BRAND, { x: 0.3, y: 7.0, w: 6, h: 0.5, fontSize: 7, color: C.lightGray, fontFace: FONT });
  slide.addText(`${dateStr}  |  ${pageNum}`, { x: 7, y: 7.0, w: 6, h: 0.5, fontSize: 7, color: C.lightGray, align: 'right', fontFace: FONT });
}

function addPptHeader(slide: any, pptx: any, title: string) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.85, fill: { color: C.dark } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.85, fill: { color: C.primary } });
  slide.addText(title, { x: 0.3, y: 0, w: 12, h: 0.85, fontSize: 22, bold: true, color: C.white, fontFace: FONT });
}

function hdrCell(text: string, align: 'left' | 'center' | 'right' = 'center') {
  return {
    text,
    options: { bold: true, color: C.white, fill: { color: C.primary }, align, valign: 'middle' as const, fontSize: 9, fontFace: FONT },
  };
}

function dataCell(text: string, rowIdx: number, opts?: Record<string, unknown>) {
  return {
    text,
    options: {
      fill: { color: rowIdx % 2 === 0 ? C.white : C.altRow },
      fontSize: 9,
      color: C.darkSlate,
      fontFace: FONT,
      ...opts,
    },
  };
}

// ────────────────────────────────────────────────────────
// PPT slide builders
// ────────────────────────────────────────────────────────
function buildTitleSlide(pptx: any, menuItems: MenuItem[], categories: CategorySummary[]) {
  const slide = pptx.addSlide();
  slide.background = { color: C.dark };

  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: C.primary } });

  slide.addText('DDUNDDUN 뛰뛰', {
    x: 0.5, y: 1.0, w: 12.33, h: 0.5, fontSize: 14, color: C.primary, fontFace: FONT, charSpacing: 4, align: 'center',
  });

  slide.addText('원가 분석 보고서', {
    x: 0.5, y: 2.0, w: 12.33, h: 1.2, fontSize: 42, bold: true, color: C.white, fontFace: FONT, align: 'center',
  });

  slide.addShape(pptx.ShapeType.rect, { x: 4.67, y: 3.4, w: 4, h: 0.04, fill: { color: C.primary } });

  slide.addText(
    `총 ${menuItems.length}개 메뉴  |  ${categories.length}개 카테고리`,
    { x: 0.5, y: 3.7, w: 12.33, h: 0.6, fontSize: 16, color: C.lightGray, fontFace: FONT, align: 'center' },
  );

  const avgCostRatio = menuItems.length > 0
    ? menuItems.reduce((s, m) => s + m.costRatio, 0) / menuItems.length
    : 0;
  slide.addText(`평균 원가율: ${fmtPercent(avgCostRatio)}`, {
    x: 0.5, y: 4.5, w: 12.33, h: 0.5, fontSize: 14, color: C.lightGray, fontFace: FONT, align: 'center',
  });

  slide.addText(`보고서 생성일: ${today()}`, {
    x: 0.5, y: 6.0, w: 12.33, h: 0.4, fontSize: 10, color: C.gray, fontFace: FONT, align: 'center',
  });

  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.0, w: '100%', h: 0.5, fill: { color: C.primary } });
  slide.addText('Confidential · Internal Use Only', {
    x: 0.5, y: 7.0, w: 12.33, h: 0.5, fontSize: 9, color: C.white, fontFace: FONT, align: 'center',
  });
}

function buildSummarySlide(pptx: any, menuItems: MenuItem[], categories: CategorySummary[], dateStr: string) {
  const slide = pptx.addSlide();
  addPptHeader(slide, pptx, '원가 분석 요약');

  const totalCost = menuItems.reduce((s, m) => s + m.cost, 0);
  const totalSelling = menuItems.reduce((s, m) => s + m.sellingPrice, 0);
  const avgCostRatio = menuItems.length > 0 ? menuItems.reduce((s, m) => s + m.costRatio, 0) / menuItems.length : 0;
  const highCostItems = menuItems.filter(m => m.costRatio > 35).length;
  const lowCostItems = menuItems.filter(m => m.costRatio < 20).length;

  const kpis = [
    { label: '총 메뉴 수', value: `${menuItems.length}개`, color: C.primary },
    { label: '평균 원가율', value: fmtPercent(avgCostRatio), color: avgCostRatio > 35 ? C.red : C.blue },
    { label: '총 원가 합계', value: fmtCurrency(totalCost), color: C.amber },
    { label: '총 판매가 합계', value: fmtCurrency(totalSelling), color: C.green },
    { label: '고원가 메뉴 (>35%)', value: `${highCostItems}개`, color: C.red },
    { label: '저원가 메뉴 (<20%)', value: `${lowCostItems}개`, color: C.purple },
  ];

  kpis.forEach((kpi, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.3 + col * 4.24;
    const y = 1.2 + row * 2.6;

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 4.0, h: 2.2,
      fill: { color: C.lightBg }, line: { color: C.border, pt: 0.5 }, rectRadius: 0.08,
    });
    slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.06, h: 2.2, fill: { color: kpi.color } });

    slide.addText(kpi.label, { x: x + 0.25, y: y + 0.3, w: 3.5, h: 0.4, fontSize: 12, color: C.gray, fontFace: FONT });
    slide.addText(kpi.value, { x: x + 0.25, y: y + 0.9, w: 3.5, h: 0.8, fontSize: 26, bold: true, color: kpi.color, fontFace: FONT });
  });

  addPptFooter(slide, pptx, 2, dateStr);
}

function buildMenuCostSlide(pptx: any, menuItems: MenuItem[], dateStr: string) {
  const slide = pptx.addSlide();
  addPptHeader(slide, pptx, '메뉴 원가 분석 (Top 20 by 원가율)');

  const topMenus = [...menuItems].sort((a, b) => b.costRatio - a.costRatio).slice(0, 20);

  const headerRow = [
    hdrCell('#', 'center'),
    hdrCell('메뉴명', 'left'),
    hdrCell('카테고리', 'left'),
    hdrCell('판매가', 'right'),
    hdrCell('원가', 'right'),
    hdrCell('원가율', 'right'),
  ];

  const rows = topMenus.map((m, i) => [
    dataCell(`${i + 1}`, i, { align: 'center' as const, bold: i < 3, color: i < 3 ? C.red : C.darkSlate }),
    dataCell(m.menuName, i, { align: 'left' as const, bold: i < 3 }),
    dataCell(m.category, i, { align: 'left' as const, color: C.gray }),
    dataCell(fmtCurrency(m.sellingPrice), i, { align: 'right' as const }),
    dataCell(fmtCurrency(m.cost), i, { align: 'right' as const }),
    dataCell(fmtPercent(m.costRatio), i, {
      align: 'right' as const,
      bold: true,
      color: m.costRatio > 35 ? C.red : m.costRatio > 30 ? C.amber : C.green,
    }),
  ]);

  slide.addTable([headerRow, ...rows], {
    x: 0.3, y: 1.1, w: 12.73,
    rowH: 0.28,
    colW: [0.5, 3.8, 2.4, 2.1, 2.1, 1.83],
    fontSize: 9.5,
    border: { type: 'solid', color: C.border, pt: 0.5 },
    fontFace: FONT,
    margin: [3, 5, 3, 5],
  });

  addPptFooter(slide, pptx, 3, dateStr);
}

function buildCategorySlide(pptx: any, categories: CategorySummary[], dateStr: string) {
  const slide = pptx.addSlide();
  addPptHeader(slide, pptx, '카테고리별 원가 분석');

  const headerRow = [
    hdrCell('카테고리', 'left'),
    hdrCell('메뉴수', 'center'),
    hdrCell('평균원가율', 'right'),
    hdrCell('총원가', 'right'),
    hdrCell('총판매가', 'right'),
    hdrCell('최소원가율', 'right'),
    hdrCell('최대원가율', 'right'),
  ];

  const rows = categories.map((cat, i) => [
    dataCell(cat.category, i, { align: 'left' as const, bold: true }),
    dataCell(`${cat.menuCount}개`, i, { align: 'center' as const }),
    dataCell(fmtPercent(cat.avgCostRatio), i, {
      align: 'right' as const,
      bold: true,
      color: cat.avgCostRatio > 35 ? C.red : cat.avgCostRatio > 30 ? C.amber : C.green,
    }),
    dataCell(fmtCurrency(cat.totalCost), i, { align: 'right' as const }),
    dataCell(fmtCurrency(cat.totalSellingPrice), i, { align: 'right' as const }),
    dataCell(fmtPercent(cat.minCostRatio), i, { align: 'right' as const, color: C.green }),
    dataCell(fmtPercent(cat.maxCostRatio), i, { align: 'right' as const, color: C.red }),
  ]);

  slide.addTable([headerRow, ...rows], {
    x: 0.3, y: 1.1, w: 12.73,
    rowH: 0.42,
    colW: [2.6, 1.1, 1.9, 2.2, 2.2, 1.4, 1.33],
    fontSize: 10,
    border: { type: 'solid', color: C.border, pt: 0.5 },
    fontFace: FONT,
    margin: [3, 5, 3, 5],
  });

  addPptFooter(slide, pptx, 4, dateStr);
}

function buildCategoryDetailSlides(pptx: any, menuItems: MenuItem[], categories: CategorySummary[], dateStr: string, startPage: number) {
  const grouped = new Map<string, MenuItem[]>();
  menuItems.forEach(m => {
    const list = grouped.get(m.category) || [];
    list.push(m);
    grouped.set(m.category, list);
  });

  let page = startPage;
  categories.forEach(cat => {
    const items = grouped.get(cat.category) || [];
    if (items.length === 0) return;

    const slide = pptx.addSlide();
    addPptHeader(slide, pptx, `${cat.category} 메뉴 상세`);

    // Category summary badges
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.3, y: 0.95, w: 12.73, h: 0.5,
      fill: { color: C.lightBg }, line: { color: C.primary, pt: 0.5 }, rectRadius: 0.04,
    });
    slide.addText(
      `${cat.menuCount}개 메뉴  |  평균원가율 ${fmtPercent(cat.avgCostRatio)}  |  총원가 ${fmtCurrency(cat.totalCost)}  |  범위 ${fmtPercent(cat.minCostRatio)} ~ ${fmtPercent(cat.maxCostRatio)}`,
      { x: 0.5, y: 0.95, w: 12.33, h: 0.5, fontSize: 11, color: C.darkSlate, fontFace: FONT, align: 'center', valign: 'middle' },
    );

    const sorted = [...items].sort((a, b) => b.costRatio - a.costRatio).slice(0, 16);
    const headerRow = [
      hdrCell('메뉴명', 'left'),
      hdrCell('판매가', 'right'),
      hdrCell('원가', 'right'),
      hdrCell('원가율', 'right'),
    ];
    const rows = sorted.map((m, i) => [
      dataCell(m.menuName, i, { align: 'left' as const }),
      dataCell(fmtCurrency(m.sellingPrice), i, { align: 'right' as const }),
      dataCell(fmtCurrency(m.cost), i, { align: 'right' as const }),
      dataCell(fmtPercent(m.costRatio), i, {
        align: 'right' as const, bold: true,
        color: m.costRatio > 35 ? C.red : m.costRatio > 30 ? C.amber : C.green,
      }),
    ]);

    slide.addTable([headerRow, ...rows], {
      x: 0.5, y: 1.65, w: 12.33,
      rowH: 0.32,
      colW: [4.8, 2.8, 2.8, 1.93],
      fontSize: 10,
      border: { type: 'solid', color: C.border, pt: 0.5 },
      fontFace: FONT,
      margin: [3, 5, 3, 5],
    });

    addPptFooter(slide, pptx, page, dateStr);
    page++;
  });

  return page;
}

function buildSimulationSlide(pptx: any, simulations: CostSimulation[], menuItems: MenuItem[], dateStr: string, pageNum: number) {
  const slide = pptx.addSlide();
  addPptHeader(slide, pptx, '원가 시믬레이션 결과');

  if (simulations.length === 0) {
    slide.addText('시믬레이션 데이터가 없습니다.\n원가 시믬레이터에서 시믬레이션을 실행한 후 보고서를 생성해주세요.', {
      x: 0.5, y: 2.5, w: 12.33, h: 2.0, fontSize: 16, color: C.gray, fontFace: FONT, align: 'center', valign: 'middle',
    });
    addPptFooter(slide, pptx, pageNum, dateStr);
    return;
  }

  const headerRow = [
    hdrCell('메뉴명', 'left'),
    hdrCell('기존원가', 'right'),
    hdrCell('시믬원가', 'right'),
    hdrCell('기존원가율', 'right'),
    hdrCell('시믬원가율', 'right'),
    hdrCell('변화', 'right'),
  ];

  const rows = simulations.slice(0, 15).map((sim, i) => {
    const menu = menuItems.find(m => m.id === sim.menuItemId);
    const diff = sim.simulatedCostRatio - sim.originalCostRatio;
    return [
      dataCell(menu?.menuName || sim.menuItemId, i, { align: 'left' as const }),
      dataCell(fmtCurrency(sim.originalCost), i, { align: 'right' as const }),
      dataCell(fmtCurrency(sim.simulatedCost), i, { align: 'right' as const }),
      dataCell(fmtPercent(sim.originalCostRatio), i, { align: 'right' as const }),
      dataCell(fmtPercent(sim.simulatedCostRatio), i, {
        align: 'right' as const,
        bold: true,
        color: sim.simulatedCostRatio > 35 ? C.red : sim.simulatedCostRatio > 30 ? C.amber : C.green,
      }),
      dataCell(`${diff > 0 ? '+' : ''}${fmtPercent(diff)}`, i, {
        align: 'right' as const,
        bold: true,
        color: diff > 0 ? C.red : C.green,
      }),
    ];
  });

  slide.addTable([headerRow, ...rows], {
    x: 0.3, y: 1.1, w: 12.73,
    rowH: 0.35,
    colW: [3.4, 1.9, 1.9, 1.7, 1.7, 1.43],
    fontSize: 10,
    border: { type: 'solid', color: C.border, pt: 0.5 },
    fontFace: FONT,
    margin: [3, 5, 3, 5],
  });

  addPptFooter(slide, pptx, pageNum, dateStr);
}

// ────────────────────────────────────────────────────────
// PDF helpers
// ────────────────────────────────────────────────────────
function addPdfHeader(doc: any, title: string) {
  const pageW = doc.internal.pageSize.getWidth();
  ensureKoreanFont(doc);
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
  doc.text(`${today()}  |  ${pageNum}`, pageW - 20, pageH - 7, { align: 'right' });
}

function pdfTableRow(
  doc: any,
  cols: { text: string; x: number; w: number; align?: 'left' | 'right' | 'center' }[],
  y: number,
  isHeader: boolean,
  rowIdx: number,
  pageW: number,
) {
  if (isHeader) {
    doc.setFillColor(3, 199, 90);
    doc.rect(20, y - 4.5, pageW - 40, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
  } else {
    if (rowIdx % 2 === 0) {
      doc.setFillColor(248, 249, 250);
      doc.rect(20, y - 4.5, pageW - 40, 6.5, 'F');
    }
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(8);
  }
  cols.forEach(col => {
    const align = col.align || 'left';
    if (align === 'right') {
      doc.text(col.text, col.x + col.w - 2, y, { align: 'right' });
    } else if (align === 'center') {
      doc.text(col.text, col.x + col.w / 2, y, { align: 'center' });
    } else {
      doc.text(col.text, col.x + 2, y);
    }
  });
}

// ────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────
interface CostReportGeneratorProps {
  menuItems: MenuItem[];
  categories: CategorySummary[];
  simulations?: CostSimulation[];
}

export function CostReportGenerator({ menuItems, categories, simulations = [] }: CostReportGeneratorProps) {
  const [generating, setGenerating] = useState<string | null>(null);
  const dateStr = today();

  const avgCostRatio = menuItems.length > 0
    ? menuItems.reduce((s, m) => s + m.costRatio, 0) / menuItems.length
    : 0;

  // ── PPT section download ──
  const generateSectionPPT = useCallback(async (sectionId: SectionId) => {
    setGenerating(`ppt-${sectionId}`);
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'DDUNDDUN';

      buildTitleSlide(pptx, menuItems, categories);

      switch (sectionId) {
        case 'summary': buildSummarySlide(pptx, menuItems, categories, dateStr); break;
        case 'menu-cost': buildMenuCostSlide(pptx, menuItems, dateStr); break;
        case 'category': buildCategorySlide(pptx, categories, dateStr); break;
        case 'category-detail': buildCategoryDetailSlides(pptx, menuItems, categories, dateStr, 2); break;
        case 'simulation': buildSimulationSlide(pptx, simulations, menuItems, dateStr, 2); break;
      }

      const label = SECTIONS.find(s => s.id === sectionId)?.label || sectionId;
      await pptx.writeFile({ fileName: `원가분석_${label}.pptx` });
      toast.success(`${label} PPT 다운로드 완료`);
    } catch (err) {
      console.error(err);
      toast.error('PPT 생성 중 오류가 발생했습니다');
    } finally {
      setGenerating(null);
    }
  }, [menuItems, categories, simulations, dateStr]);

  // ── Full PPT ──
  const generateFullPPT = useCallback(async () => {
    setGenerating('ppt-full');
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'DDUNDDUN';

      buildTitleSlide(pptx, menuItems, categories);
      buildSummarySlide(pptx, menuItems, categories, dateStr);
      buildMenuCostSlide(pptx, menuItems, dateStr);
      buildCategorySlide(pptx, categories, dateStr);
      const nextPage = buildCategoryDetailSlides(pptx, menuItems, categories, dateStr, 5);
      buildSimulationSlide(pptx, simulations, menuItems, dateStr, nextPage);

      await pptx.writeFile({ fileName: `종합_원가분석_보고서.pptx` });
      toast.success('종합 PPT 보고서 다운로드 완료');
    } catch (err) {
      console.error(err);
      toast.error('PPT 생성 중 오류가 발생했습니다');
    } finally {
      setGenerating(null);
    }
  }, [menuItems, categories, simulations, dateStr]);

  // ── PDF section download ──
  const generateSectionPDF = useCallback(async (sectionId: SectionId) => {
    setGenerating(`pdf-${sectionId}`);
    try {
      const doc = await createKoreanPdf({ orientation: 'portrait' });
      const pageW = doc.internal.pageSize.getWidth();

      // Cover page
      ensureKoreanFont(doc);
      doc.setFillColor(30, 30, 30);
      doc.rect(0, 0, pageW, 297, 'F');
      doc.setFillColor(3, 199, 90);
      doc.rect(0, 0, pageW, 4, 'F');
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text('원가 분석 보고서', pageW / 2, 80, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`${menuItems.length}개 메뉴  |  ${categories.length}개 카테고리  |  평균원가율 ${fmtPercent(avgCostRatio)}`, pageW / 2, 95, { align: 'center' });

      doc.addPage();
      addPdfHeader(doc, SECTIONS.find(s => s.id === sectionId)?.label || '');

      let y = 28;
      switch (sectionId) {
        case 'summary': {
          const totalCost = menuItems.reduce((s, m) => s + m.cost, 0);
          const totalSelling = menuItems.reduce((s, m) => s + m.sellingPrice, 0);
          const kpis = [
            ['총 메뉴 수', `${menuItems.length}개`],
            ['평균 원가율', fmtPercent(avgCostRatio)],
            ['총 원가', fmtCurrency(totalCost)],
            ['총 판매가', fmtCurrency(totalSelling)],
            ['고원가 메뉴 (>35%)', `${menuItems.filter(m => m.costRatio > 35).length}개`],
          ];
          kpis.forEach(([label, value]) => {
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(label, 24, y);
            doc.setTextColor(30, 30, 30);
            doc.setFontSize(11);
            doc.text(value, 90, y);
            y += 10;
          });
          break;
        }
        case 'menu-cost': {
          const sorted = [...menuItems].sort((a, b) => b.costRatio - a.costRatio).slice(0, 20);
          const cols = [
            { label: '#', x: 20, w: 10, align: 'center' as const },
            { label: '메뉴명', x: 30, w: 50, align: 'left' as const },
            { label: '판매가', x: 80, w: 30, align: 'right' as const },
            { label: '원가', x: 110, w: 30, align: 'right' as const },
            { label: '원가율', x: 140, w: 25, align: 'right' as const },
          ];
          pdfTableRow(doc, cols.map(c => ({ text: c.label, x: c.x, w: c.w, align: c.align })), y, true, 0, pageW);
          y += 8;
          sorted.forEach((m, i) => {
            if (y > 275) { addPdfFooter(doc, 2); doc.addPage(); addPdfHeader(doc, '메뉴 원가 (계속)'); y = 28; }
            pdfTableRow(doc, [
              { text: `${i + 1}`, x: 20, w: 10, align: 'center' },
              { text: m.menuName, x: 30, w: 50 },
              { text: fmtCurrency(m.sellingPrice), x: 80, w: 30, align: 'right' },
              { text: fmtCurrency(m.cost), x: 110, w: 30, align: 'right' },
              { text: fmtPercent(m.costRatio), x: 140, w: 25, align: 'right' },
            ], y, false, i, pageW);
            y += 7;
          });
          break;
        }
        case 'category': {
          const cols = [
            { label: '카테고리', x: 20, w: 35, align: 'left' as const },
            { label: '메뉴수', x: 55, w: 15, align: 'center' as const },
            { label: '평균원가율', x: 70, w: 25, align: 'right' as const },
            { label: '총원가', x: 95, w: 30, align: 'right' as const },
            { label: '총판매가', x: 125, w: 30, align: 'right' as const },
            { label: '범위', x: 155, w: 30, align: 'center' as const },
          ];
          pdfTableRow(doc, cols.map(c => ({ text: c.label, x: c.x, w: c.w, align: c.align })), y, true, 0, pageW);
          y += 8;
          categories.forEach((cat, i) => {
            pdfTableRow(doc, [
              { text: cat.category, x: 20, w: 35 },
              { text: `${cat.menuCount}`, x: 55, w: 15, align: 'center' },
              { text: fmtPercent(cat.avgCostRatio), x: 70, w: 25, align: 'right' },
              { text: fmtCurrency(cat.totalCost), x: 95, w: 30, align: 'right' },
              { text: fmtCurrency(cat.totalSellingPrice), x: 125, w: 30, align: 'right' },
              { text: `${fmtPercent(cat.minCostRatio)}~${fmtPercent(cat.maxCostRatio)}`, x: 155, w: 30, align: 'center' },
            ], y, false, i, pageW);
            y += 7;
          });
          break;
        }
        case 'category-detail': {
          const grouped = new Map<string, MenuItem[]>();
          menuItems.forEach(m => { const l = grouped.get(m.category) || []; l.push(m); grouped.set(m.category, l); });
          let page = 2;
          categories.forEach((cat, catIdx) => {
            const items = (grouped.get(cat.category) || []).sort((a, b) => b.costRatio - a.costRatio);
            if (items.length === 0) return;
            if (catIdx > 0) { addPdfFooter(doc, page); doc.addPage(); addPdfHeader(doc, `${cat.category} 상세`); page++; y = 28; }
            doc.setFontSize(10);
            doc.setTextColor(30, 30, 30);
            doc.text(`${cat.category} (평균 ${fmtPercent(cat.avgCostRatio)})`, 22, y);
            y += 8;
            items.slice(0, 15).forEach((m, i) => {
              if (y > 270) { addPdfFooter(doc, page); doc.addPage(); addPdfHeader(doc, `${cat.category} (계속)`); page++; y = 28; }
              doc.setFontSize(8);
              doc.setTextColor(40, 40, 40);
              doc.text(`${m.menuName}`, 24, y);
              doc.text(fmtCurrency(m.sellingPrice), 100, y, { align: 'right' });
              doc.text(fmtCurrency(m.cost), 130, y, { align: 'right' });
              doc.text(fmtPercent(m.costRatio), 160, y, { align: 'right' });
              y += 6;
            });
            y += 4;
          });
          break;
        }
        case 'simulation': {
          if (simulations.length === 0) {
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text('시믬레이션 데이터가 없습니다.', pageW / 2, 100, { align: 'center' });
          } else {
            simulations.slice(0, 20).forEach((sim, i) => {
              if (y > 270) { addPdfFooter(doc, 2); doc.addPage(); addPdfHeader(doc, '시믬레이션 (계속)'); y = 28; }
              const menu = menuItems.find(m => m.id === sim.menuItemId);
              doc.setFontSize(8);
              doc.setTextColor(40, 40, 40);
              doc.text(menu?.menuName || sim.menuItemId, 24, y);
              doc.text(`${fmtCurrency(sim.originalCost)} -> ${fmtCurrency(sim.simulatedCost)}`, 100, y, { align: 'right' });
              doc.text(`${fmtPercent(sim.originalCostRatio)} -> ${fmtPercent(sim.simulatedCostRatio)}`, 160, y, { align: 'right' });
              y += 7;
            });
          }
          break;
        }
      }

      addPdfFooter(doc, 2);
      const label = SECTIONS.find(s => s.id === sectionId)?.label || sectionId;
      doc.save(`원가분석_${label}.pdf`);
      toast.success(`${label} PDF 다운로드 완료`);
    } catch (err) {
      console.error(err);
      toast.error('PDF 생성 중 오류가 발생했습니다');
    } finally {
      setGenerating(null);
    }
  }, [menuItems, categories, simulations, avgCostRatio]);

  // ── Full PDF ──
  const generateFullPDF = useCallback(async () => {
    setGenerating('pdf-full');
    try {
      const doc = await createKoreanPdf({ orientation: 'portrait' });
      const pageW = doc.internal.pageSize.getWidth();

      // Cover
      ensureKoreanFont(doc);
      doc.setFillColor(30, 30, 30);
      doc.rect(0, 0, pageW, 297, 'F');
      doc.setFillColor(3, 199, 90);
      doc.rect(0, 0, pageW, 4, 'F');
      doc.setFontSize(12);
      doc.setTextColor(3, 199, 90);
      doc.text('DDUNDDUN 뛰뛰', pageW / 2, 50, { align: 'center' });
      doc.setFontSize(26);
      doc.setTextColor(255, 255, 255);
      doc.text('종합 원가 분석 보고서', pageW / 2, 80, { align: 'center' });
      doc.setFillColor(3, 199, 90);
      doc.rect(pageW / 2 - 25, 88, 50, 1, 'F');
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`${menuItems.length}개 메뉴  |  ${categories.length}개 카테고리  |  평균원가율 ${fmtPercent(avgCostRatio)}`, pageW / 2, 100, { align: 'center' });
      doc.setFontSize(8);
      doc.text(`보고서 생성일: ${today()}`, pageW / 2, 120, { align: 'center' });

      // Summary page
      doc.addPage();
      addPdfHeader(doc, '원가 분석 요약');
      let y = 28;
      const totalCost = menuItems.reduce((s, m) => s + m.cost, 0);
      const totalSelling = menuItems.reduce((s, m) => s + m.sellingPrice, 0);
      [['총 메뉴 수', `${menuItems.length}개`], ['평균 원가율', fmtPercent(avgCostRatio)], ['총 원가', fmtCurrency(totalCost)], ['총 판매가', fmtCurrency(totalSelling)]].forEach(([label, value]) => {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(label, 24, y);
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 30);
        doc.text(value, 90, y);
        y += 10;
      });
      addPdfFooter(doc, 2);

      // Menu cost page
      doc.addPage();
      addPdfHeader(doc, '메뉴 원가 분석 (Top 20)');
      y = 28;
      const sorted = [...menuItems].sort((a, b) => b.costRatio - a.costRatio).slice(0, 20);
      const mCols = [
        { label: '#', x: 20, w: 10, align: 'center' as const },
        { label: '메뉴명', x: 30, w: 50, align: 'left' as const },
        { label: '판매가', x: 80, w: 30, align: 'right' as const },
        { label: '원가', x: 110, w: 30, align: 'right' as const },
        { label: '원가율', x: 140, w: 25, align: 'right' as const },
      ];
      pdfTableRow(doc, mCols.map(c => ({ text: c.label, x: c.x, w: c.w, align: c.align })), y, true, 0, pageW);
      y += 8;
      sorted.forEach((m, i) => {
        if (y > 275) { addPdfFooter(doc, 3); doc.addPage(); addPdfHeader(doc, '메뉴 원가 (계속)'); y = 28; }
        pdfTableRow(doc, [
          { text: `${i + 1}`, x: 20, w: 10, align: 'center' },
          { text: m.menuName, x: 30, w: 50 },
          { text: fmtCurrency(m.sellingPrice), x: 80, w: 30, align: 'right' },
          { text: fmtCurrency(m.cost), x: 110, w: 30, align: 'right' },
          { text: fmtPercent(m.costRatio), x: 140, w: 25, align: 'right' },
        ], y, false, i, pageW);
        y += 7;
      });
      addPdfFooter(doc, 3);

      // Category page
      doc.addPage();
      addPdfHeader(doc, '카테고리별 분석');
      y = 28;
      const cCols = [
        { label: '카테고리', x: 20, w: 35, align: 'left' as const },
        { label: '메뉴수', x: 55, w: 15, align: 'center' as const },
        { label: '평균원가율', x: 70, w: 25, align: 'right' as const },
        { label: '총원가', x: 95, w: 30, align: 'right' as const },
        { label: '총판매가', x: 125, w: 30, align: 'right' as const },
      ];
      pdfTableRow(doc, cCols.map(c => ({ text: c.label, x: c.x, w: c.w, align: c.align })), y, true, 0, pageW);
      y += 8;
      categories.forEach((cat, i) => {
        pdfTableRow(doc, [
          { text: cat.category, x: 20, w: 35 },
          { text: `${cat.menuCount}`, x: 55, w: 15, align: 'center' },
          { text: fmtPercent(cat.avgCostRatio), x: 70, w: 25, align: 'right' },
          { text: fmtCurrency(cat.totalCost), x: 95, w: 30, align: 'right' },
          { text: fmtCurrency(cat.totalSellingPrice), x: 125, w: 30, align: 'right' },
        ], y, false, i, pageW);
        y += 7;
      });
      addPdfFooter(doc, 4);

      doc.save('종합_원가분석_보고서.pdf');
      toast.success('종합 PDF 보고서 다운로드 완료');
    } catch (err) {
      console.error(err);
      toast.error('PDF 생성 중 오류가 발생했습니다');
    } finally {
      setGenerating(null);
    }
  }, [menuItems, categories, simulations, avgCostRatio]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Download size={16} />
          원가 분석 보고서
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {/* Preview summary */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg text-center text-sm mb-2">
            <div>
              <p className="text-xs text-muted-foreground">총 메뉴</p>
              <p className="font-bold">{menuItems.length}개</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">평균 원가율</p>
              <p className="font-bold">{fmtPercent(avgCostRatio)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">카테고리</p>
              <p className="font-bold">{categories.length}개</p>
            </div>
          </div>

          {/* Section-level downloads */}
          {SECTIONS.map(section => (
            <div key={section.id} className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg border">
              <span className="text-sm font-medium flex-1">{section.label}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={generating !== null}
                  onClick={() => generateSectionPPT(section.id)}
                >
                  {generating === `ppt-${section.id}` ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Presentation className="h-3 w-3 mr-1" />}
                  PPT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={generating !== null}
                  onClick={() => generateSectionPDF(section.id)}
                >
                  {generating === `pdf-${section.id}` ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
                  PDF
                </Button>
              </div>
            </div>
          ))}

          {/* Combined full report */}
          <div className="border-t pt-4 mt-2 space-y-3">
            <Button
              className="w-full gap-2 h-12"
              disabled={generating !== null}
              onClick={generateFullPPT}
            >
              {generating === 'ppt-full' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Presentation className="h-4 w-4" />}
              <div className="text-left">
                <span className="font-semibold">종합 보고서 PPT</span>
                <span className="text-xs opacity-75 ml-2">전체 섹션 포함</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 h-12 border-2"
              disabled={generating !== null}
              onClick={generateFullPDF}
            >
              {generating === 'pdf-full' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              <div className="text-left">
                <span className="font-semibold">종합 보고서 PDF</span>
                <span className="text-xs opacity-75 ml-2">인쇄 가능한 문서</span>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
