'use client';

import { useState, useCallback } from 'react';
import { Download, FileText, Presentation, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatCurrency, formatNumber, formatCompactCurrency } from '@/lib/format';
import { createKoreanPdf, ensureKoreanFont } from '@/lib/pdf-utils';
import type { SalesReportData, ChannelSummary, TagSummary, StoreSummary } from '../types';

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
};

const FONT = '맑은 고딕';
const FONT_FALLBACK = '맑은 고딕';
const BRAND = 'DDUNDDUN 뛰뛰 F&B Dashboard';

function today() {
  return new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ────────────────────────────────────────────────────────
// Section identifiers for per-section download
// ────────────────────────────────────────────────────────
type SectionId = 'overview' | 'channel' | 'store-rank' | 'manager' | 'store-detail';

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'overview', label: '개요 / 핵심지표' },
  { id: 'channel', label: '채널별 분석' },
  { id: 'store-rank', label: '매장 매출 순위' },
  { id: 'manager', label: '담당자/태그별 분석' },
  { id: 'store-detail', label: '매장별 상세' },
];

interface ReportGeneratorProps {
  data: SalesReportData;
  channelData: ChannelSummary[];
  tagData: TagSummary[];
  storeData: StoreSummary[];
}

// ────────────────────────────────────────────────────────
// PPT helpers
// ────────────────────────────────────────────────────────
function addPptFooter(slide: any, pptx: any, pageNum: number, dateStr: string) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.0, w: '100%', h: 0.5, fill: { color: C.darkSlate },
  });
  slide.addText(BRAND, {
    x: 0.3, y: 7.0, w: 6, h: 0.5, fontSize: 7, color: C.lightGray, fontFace: FONT,
  });
  slide.addText(`${dateStr}  |  ${pageNum}`, {
    x: 7, y: 7.0, w: 6, h: 0.5, fontSize: 7, color: C.lightGray, align: 'right', fontFace: FONT,
  });
}

function addPptHeader(slide: any, pptx: any, title: string) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.85, fill: { color: C.dark } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.85, fill: { color: C.primary } });
  slide.addText(title, {
    x: 0.3, y: 0, w: 12, h: 0.85, fontSize: 22, bold: true, color: C.white, fontFace: FONT,
  });
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
function buildTitleSlide(pptx: any, data: SalesReportData, totalSales: number, totalOrders: number) {
  const slide = pptx.addSlide();
  slide.background = { color: C.dark };

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: C.primary } });

  // Brand
  slide.addText('DDUNDDUN 뛰뛰', {
    x: 0.5, y: 1.0, w: 12.33, h: 0.5, fontSize: 14, color: C.primary, fontFace: FONT, charSpacing: 4, align: 'center',
  });

  // Title
  slide.addText('종합보고서 매출 분석', {
    x: 0.5, y: 2.0, w: 12.33, h: 1.2, fontSize: 42, bold: true, color: C.white, fontFace: FONT, align: 'center',
  });

  // Green accent line
  slide.addShape(pptx.ShapeType.rect, { x: 4.67, y: 3.4, w: 4, h: 0.04, fill: { color: C.primary } });

  // Period
  slide.addText(data.period || '', {
    x: 0.5, y: 3.7, w: 12.33, h: 0.6, fontSize: 18, color: C.lightGray, fontFace: FONT, align: 'center',
  });

  // Stats
  slide.addText(
    `${data.stores.length}개 매장  |  ${data.channels.length}개 채널  |  총매출 ${formatCompactCurrency(totalSales)}  |  총주문 ${formatNumber(totalOrders)}건`,
    { x: 0.5, y: 4.6, w: 12.33, h: 0.5, fontSize: 13, color: C.lightGray, fontFace: FONT, align: 'center' },
  );

  // Date + brand footer
  slide.addText(`보고서 생성일: ${today()}`, {
    x: 0.5, y: 6.0, w: 12.33, h: 0.4, fontSize: 10, color: C.gray, fontFace: FONT, align: 'center',
  });

  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.0, w: '100%', h: 0.5, fill: { color: C.primary } });
  slide.addText('Confidential · Internal Use Only', {
    x: 0.5, y: 7.0, w: 12.33, h: 0.5, fontSize: 9, color: C.white, fontFace: FONT, align: 'center',
  });
}

function buildOverviewSlide(pptx: any, data: SalesReportData, totalSales: number, totalOrders: number, dateStr: string) {
  const slide = pptx.addSlide();
  addPptHeader(slide, pptx, '핵심 지표 요약');

  const avgSales = data.stores.length > 0 ? Math.round(totalSales / data.stores.length) : 0;
  const avgOrder = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  const kpis = [
    { label: '총 매출', value: formatCurrency(totalSales), color: C.primary },
    { label: '총 주문건수', value: `${formatNumber(totalOrders)}건`, color: C.blue },
    { label: '매장 수', value: `${data.stores.length}개`, color: C.purple },
    { label: '매장 평균 매출', value: formatCompactCurrency(avgSales), color: C.amber },
    { label: '객단가', value: formatCurrency(avgOrder), color: C.red },
    { label: '채널 수', value: `${data.channels.length}개`, color: C.blue },
  ];

  kpis.forEach((kpi, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.3 + col * 4.24;
    const y = 1.2 + row * 2.6;

    // Card background
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 4.0, h: 2.2,
      fill: { color: C.lightBg }, line: { color: C.border, pt: 0.5 }, rectRadius: 0.08,
    });
    // Left accent
    slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.06, h: 2.2, fill: { color: kpi.color } });

    slide.addText(kpi.label, {
      x: x + 0.25, y: y + 0.3, w: 3.5, h: 0.4, fontSize: 12, color: C.gray, fontFace: FONT,
    });
    slide.addText(kpi.value, {
      x: x + 0.25, y: y + 0.9, w: 3.5, h: 0.8, fontSize: 26, bold: true, color: kpi.color, fontFace: FONT,
    });
  });

  addPptFooter(slide, pptx, 2, dateStr);
}

function buildChannelSlide(pptx: any, channelData: ChannelSummary[], totalSales: number, dateStr: string) {
  const slide = pptx.addSlide();
  addPptHeader(slide, pptx, '채널별 매출 분석');

  const channels = channelData.filter(ch => ch.totalSales > 0).slice(0, 15);
  const maxSales = channels.length > 0 ? channels[0].totalSales : 1;

  const headerRow = [
    hdrCell('채널', 'left'),
    hdrCell('매출금액', 'right'),
    hdrCell('주문건수', 'right'),
    hdrCell('매출비율', 'right'),
    hdrCell('매장수', 'center'),
    hdrCell('매장평균', 'right'),
  ];

  const rows = channels.map((ch, i) => [
    dataCell(ch.channelName, i, { align: 'left' as const, bold: i < 3 }),
    dataCell(formatCompactCurrency(ch.totalSales), i, { align: 'right' as const, bold: i < 3 }),
    dataCell(`${formatNumber(ch.totalOrders)}건`, i, { align: 'right' as const }),
    dataCell(`${ch.salesRatio.toFixed(1)}%`, i, { align: 'right' as const, color: C.primary }),
    dataCell(`${ch.storeCount}개`, i, { align: 'center' as const }),
    dataCell(formatCompactCurrency(ch.avgSalesPerStore), i, { align: 'right' as const, color: C.gray }),
  ]);

  slide.addTable([headerRow, ...rows], {
    x: 0.3, y: 1.1, w: 12.73,
    rowH: 0.38,
    colW: [2.8, 2.6, 1.8, 1.6, 1.2, 2.73],
    fontSize: 10,
    border: { type: 'solid', color: C.border, pt: 0.5 },
    fontFace: FONT,
    margin: [3, 5, 3, 5],
  });

  addPptFooter(slide, pptx, 3, dateStr);
}

function buildStoreRankSlide(pptx: any, storeData: StoreSummary[], dateStr: string) {
  const topStores = storeData.slice(0, 15);
  const maxSales = topStores.length > 0 ? topStores[0].totalSales : 1;
  const slide = pptx.addSlide();
  addPptHeader(slide, pptx, '매장 매출 순위 (Top 15)');

  const headerRow = [
    hdrCell('#', 'center'),
    hdrCell('매장명', 'left'),
    hdrCell('담당자', 'center'),
    hdrCell('매출금액', 'right'),
    hdrCell('주문건', 'right'),
    hdrCell('객단가', 'right'),
    hdrCell('주력채널', 'left'),
  ];

  const rows = topStores.map((st, i) => [
    dataCell(`${i + 1}`, i, { align: 'center' as const, bold: i < 3, color: i < 3 ? C.primary : C.darkSlate }),
    dataCell(st.storeName, i, { align: 'left' as const, bold: i < 3 }),
    dataCell(st.storeTag, i, { align: 'center' as const }),
    dataCell(formatCompactCurrency(st.totalSales), i, { align: 'right' as const, bold: i < 3 }),
    dataCell(`${formatNumber(st.totalOrders)}건`, i, { align: 'right' as const }),
    dataCell(formatCurrency(st.avgOrderValue), i, { align: 'right' as const, color: C.gray }),
    dataCell(st.topChannel, i, { align: 'left' as const, color: C.gray }),
  ]);

  slide.addTable([headerRow, ...rows], {
    x: 0.3, y: 1.1, w: 12.73,
    rowH: 0.35,
    colW: [0.5, 3.2, 1.6, 2.4, 1.3, 1.8, 1.93],
    fontSize: 10,
    border: { type: 'solid', color: C.border, pt: 0.5 },
    fontFace: FONT,
    margin: [3, 5, 3, 5],
  });

  addPptFooter(slide, pptx, 4, dateStr);
}

function buildManagerSlide(pptx: any, tagData: TagSummary[], dateStr: string) {
  const slide = pptx.addSlide();
  addPptHeader(slide, pptx, '담당자/태그별 분석');

  const headerRow = [
    hdrCell('담당자', 'left'),
    hdrCell('매장수', 'center'),
    hdrCell('총매출', 'right'),
    hdrCell('총주문', 'right'),
    hdrCell('매장평균', 'right'),
    hdrCell('비율', 'right'),
  ];

  const rows = tagData.map((tag, i) => [
    dataCell(tag.tag, i, { align: 'left' as const, bold: true }),
    dataCell(`${tag.stores.length}개`, i, { align: 'center' as const }),
    dataCell(formatCompactCurrency(tag.totalSales), i, { align: 'right' as const, bold: true }),
    dataCell(`${formatNumber(tag.totalOrders)}건`, i, { align: 'right' as const }),
    dataCell(formatCompactCurrency(tag.avgSalesPerStore), i, { align: 'right' as const }),
    dataCell(`${tag.salesRatio.toFixed(1)}%`, i, { align: 'right' as const, color: C.primary }),
  ]);

  slide.addTable([headerRow, ...rows], {
    x: 0.3, y: 1.1, w: 12.73,
    rowH: 0.45,
    colW: [2.6, 1.3, 2.9, 2.0, 2.4, 1.53],
    fontSize: 10,
    border: { type: 'solid', color: C.border, pt: 0.5 },
    fontFace: FONT,
    margin: [3, 5, 3, 5],
  });

  // Summary box
  if (tagData.length > 0) {
    const bestTag = tagData.reduce((a, b) => a.avgSalesPerStore > b.avgSalesPerStore ? a : b);
    const y = 1.1 + 0.45 * (tagData.length + 1) + 0.4;
    if (y < 6.5) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.3, y, w: 12.73, h: 0.6,
        fill: { color: C.lightBg }, line: { color: C.primary, pt: 1 }, rectRadius: 0.06,
      });
      slide.addText(
        `매장 평균 매출 최고: ${bestTag.tag} (${formatCompactCurrency(bestTag.avgSalesPerStore)})  |  총 ${tagData.reduce((s, t) => s + t.stores.length, 0)}개 매장 관리`,
        { x: 0.5, y, w: 12.33, h: 0.6, fontSize: 12, color: C.darkSlate, fontFace: FONT, align: 'center' },
      );
    }
  }

  addPptFooter(slide, pptx, 5, dateStr);
}

function buildStoreDetailSlides(pptx: any, storeData: StoreSummary[], dateStr: string, startPage: number) {
  const STORES_PER_SLIDE = 6;
  const slides: any[] = [];
  for (let i = 0; i < storeData.length; i += STORES_PER_SLIDE) {
    const chunk = storeData.slice(i, i + STORES_PER_SLIDE);
    const slide = pptx.addSlide();
    const pageLabel = storeData.length > STORES_PER_SLIDE
      ? `매장별 상세 (${i + 1}~${Math.min(i + STORES_PER_SLIDE, storeData.length)} / ${storeData.length})`
      : '매장별 상세';
    addPptHeader(slide, pptx, pageLabel);

    chunk.forEach((store, idx) => {
      const y = 1.15 + idx * 0.92;
      const rank = i + idx + 1;

      // Card
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.3, y, w: 12.73, h: 0.82,
        fill: { color: idx % 2 === 0 ? C.white : C.altRow },
        line: { color: C.border, pt: 0.5 },
        rectRadius: 0.04,
      });

      // Rank badge
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.45, y: y + 0.16, w: 0.5, h: 0.5,
        fill: { color: rank <= 3 ? C.primary : C.gray },
        rectRadius: 0.04,
      });
      slide.addText(`${rank}`, {
        x: 0.45, y: y + 0.16, w: 0.5, h: 0.5, fontSize: 13, bold: true, color: C.white, fontFace: FONT, align: 'center', valign: 'middle',
      });

      // Store info
      slide.addText(store.storeName, {
        x: 1.2, y: y + 0.08, w: 4, h: 0.4, fontSize: 13, bold: true, color: C.darkSlate, fontFace: FONT,
      });
      slide.addText(`담당: ${store.storeTag}  |  주력: ${store.topChannel}`, {
        x: 1.2, y: y + 0.46, w: 4, h: 0.28, fontSize: 9, color: C.gray, fontFace: FONT,
      });

      // Metrics
      slide.addText(formatCompactCurrency(store.totalSales), {
        x: 5.5, y: y + 0.1, w: 2.5, h: 0.35, fontSize: 16, bold: true, color: C.primary, fontFace: FONT, align: 'right',
      });
      slide.addText('매출', {
        x: 5.5, y: y + 0.48, w: 2.5, h: 0.22, fontSize: 8, color: C.gray, fontFace: FONT, align: 'right',
      });

      slide.addText(`${formatNumber(store.totalOrders)}건`, {
        x: 8.3, y: y + 0.1, w: 2, h: 0.35, fontSize: 14, bold: true, color: C.blue, fontFace: FONT, align: 'right',
      });
      slide.addText('주문', {
        x: 8.3, y: y + 0.48, w: 2, h: 0.22, fontSize: 8, color: C.gray, fontFace: FONT, align: 'right',
      });

      slide.addText(formatCurrency(store.avgOrderValue), {
        x: 10.6, y: y + 0.1, w: 2.2, h: 0.35, fontSize: 12, color: C.amber, fontFace: FONT, align: 'right',
      });
      slide.addText('객단가', {
        x: 10.6, y: y + 0.48, w: 2.2, h: 0.22, fontSize: 8, color: C.gray, fontFace: FONT, align: 'right',
      });
    });

    addPptFooter(slide, pptx, startPage + Math.floor(i / STORES_PER_SLIDE), dateStr);
    slides.push(slide);
  }
  return slides;
}

function buildConclusionSlide(pptx: any, data: SalesReportData, channelData: ChannelSummary[], storeData: StoreSummary[], tagData: TagSummary[], totalSales: number, totalOrders: number, dateStr: string, pageNum: number) {
  const slide = pptx.addSlide();
  addPptHeader(slide, pptx, '요약 및 인사이트');

  const insights: string[] = [];
  if (storeData.length > 0) {
    insights.push(`최고 매출 매장: ${storeData[0].storeName} (${formatCompactCurrency(storeData[0].totalSales)})`);
  }
  if (channelData.length > 0) {
    const topCh = channelData.filter(ch => ch.totalSales > 0)[0];
    if (topCh) insights.push(`주력 채널: ${topCh.channelName} (비중 ${topCh.salesRatio.toFixed(1)}%)`);
  }
  if (tagData.length > 0) {
    const bestTag = tagData.reduce((a, b) => a.totalSales > b.totalSales ? a : b);
    insights.push(`최고 성과 담당자: ${bestTag.tag} (총 ${formatCompactCurrency(bestTag.totalSales)}, ${bestTag.stores.length}개 매장)`);
  }
  const avgSales = data.stores.length > 0 ? Math.round(totalSales / data.stores.length) : 0;
  insights.push(`매장 평균 매출: ${formatCompactCurrency(avgSales)}`);
  insights.push(`객단가: ${formatCurrency(totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0)}`);

  insights.forEach((text, i) => {
    const y = 1.3 + i * 0.85;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y, w: 12.33, h: 0.7,
      fill: { color: C.lightBg }, line: { color: C.primary, pt: 0.5 }, rectRadius: 0.06,
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y, w: 0.7, h: 0.7, fill: { color: C.primary }, rectRadius: 0.06,
    });
    slide.addText(`${i + 1}`, {
      x: 0.5, y, w: 0.7, h: 0.7, fontSize: 14, bold: true, color: C.white, fontFace: FONT, align: 'center', valign: 'middle',
    });
    slide.addText(text, {
      x: 1.4, y, w: 11.2, h: 0.7, fontSize: 13, color: C.darkSlate, fontFace: FONT, valign: 'middle',
    });
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
// PDF section builders
// ────────────────────────────────────────────────────────
function buildPdfCover(doc: any, data: SalesReportData, totalSales: number, totalOrders: number) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  ensureKoreanFont(doc);

  // Background
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Top accent
  doc.setFillColor(3, 199, 90);
  doc.rect(0, 0, pageW, 4, 'F');

  // Brand
  doc.setFontSize(12);
  doc.setTextColor(3, 199, 90);
  doc.text('DDUNDDUN 뛰뛰', pageW / 2, 50, { align: 'center' });

  // Title
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('종합보고서 매출 분석', pageW / 2, 80, { align: 'center' });

  // Green line
  doc.setFillColor(3, 199, 90);
  doc.rect(pageW / 2 - 30, 90, 60, 1, 'F');

  // Period
  doc.setFontSize(14);
  doc.setTextColor(150, 150, 150);
  doc.text(data.period || '', pageW / 2, 105, { align: 'center' });

  // Stats
  doc.setFontSize(10);
  doc.text(
    `${data.stores.length}개 매장  |  ${data.channels.length}개 채널  |  총매출 ${formatCompactCurrency(totalSales)}`,
    pageW / 2, 120, { align: 'center' },
  );

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`보고서 생성일: ${today()}`, pageW / 2, 140, { align: 'center' });
}

function buildPdfOverview(doc: any, data: SalesReportData, totalSales: number, totalOrders: number, startPage: number): number {
  doc.addPage();
  const pageW = doc.internal.pageSize.getWidth();
  addPdfHeader(doc, '핵심 지표 요약');

  const avgSales = data.stores.length > 0 ? Math.round(totalSales / data.stores.length) : 0;
  const avgOrder = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  const kpis = [
    { label: '총 매출', value: formatCurrency(totalSales) },
    { label: '총 주문건수', value: `${formatNumber(totalOrders)}건` },
    { label: '매장 수', value: `${data.stores.length}개` },
    { label: '매장 평균 매출', value: formatCompactCurrency(avgSales) },
    { label: '객단가', value: formatCurrency(avgOrder) },
  ];

  let y = 28;
  kpis.forEach((kpi, i) => {
    const boxX = 20 + (i % 3) * 58;
    const boxY = y + Math.floor(i / 3) * 28;
    const boxW = 52;
    const boxH = 22;

    doc.setFillColor(248, 249, 250);
    doc.roundedRect(boxX, boxY, boxW, boxH, 2, 2, 'F');
    doc.setDrawColor(3, 199, 90);
    doc.setLineWidth(0.5);
    doc.line(boxX, boxY + 2, boxX, boxY + boxH - 2);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(kpi.label, boxX + 6, boxY + 8);

    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(kpi.value, boxX + 6, boxY + 17);
  });

  addPdfFooter(doc, startPage);
  return y + 70;
}

function buildPdfChannelTable(doc: any, channelData: ChannelSummary[], startPage: number): number {
  doc.addPage();
  const pageW = doc.internal.pageSize.getWidth();
  addPdfHeader(doc, '채널별 매출 분석');

  const channels = channelData.filter(ch => ch.totalSales > 0);
  const cols = [
    { label: '채널', x: 20, w: 40, align: 'left' as const },
    { label: '매출금액', x: 60, w: 35, align: 'right' as const },
    { label: '주문건수', x: 95, w: 25, align: 'right' as const },
    { label: '비율', x: 120, w: 20, align: 'right' as const },
    { label: '매장수', x: 140, w: 18, align: 'center' as const },
    { label: '매장평균', x: 158, w: 32, align: 'right' as const },
  ];

  let y = 28;
  pdfTableRow(doc, cols.map(c => ({ text: c.label, x: c.x, w: c.w, align: c.align })), y, true, 0, pageW);
  y += 8;

  channels.forEach((ch, i) => {
    if (y > 275) {
      addPdfFooter(doc, startPage);
      doc.addPage();
      addPdfHeader(doc, '채널별 매출 분석 (계속)');
      y = 28;
      startPage++;
    }
    pdfTableRow(doc, [
      { text: ch.channelName, x: 20, w: 40 },
      { text: formatCompactCurrency(ch.totalSales), x: 60, w: 35, align: 'right' },
      { text: `${formatNumber(ch.totalOrders)}건`, x: 95, w: 25, align: 'right' },
      { text: `${ch.salesRatio.toFixed(1)}%`, x: 120, w: 20, align: 'right' },
      { text: `${ch.storeCount}`, x: 140, w: 18, align: 'center' },
      { text: formatCompactCurrency(ch.avgSalesPerStore), x: 158, w: 32, align: 'right' },
    ], y, false, i, pageW);
    y += 7;
  });

  addPdfFooter(doc, startPage);
  return startPage;
}

function buildPdfStoreRank(doc: any, storeData: StoreSummary[], startPage: number): number {
  doc.addPage();
  const pageW = doc.internal.pageSize.getWidth();
  addPdfHeader(doc, '매장 매출 순위');

  let y = 28;
  const cols = [
    { label: '#', x: 20, w: 10, align: 'center' as const },
    { label: '매장명', x: 30, w: 40, align: 'left' as const },
    { label: '담당', x: 70, w: 22, align: 'center' as const },
    { label: '매출', x: 92, w: 30, align: 'right' as const },
    { label: '주문', x: 122, w: 20, align: 'right' as const },
    { label: '객단가', x: 142, w: 25, align: 'right' as const },
    { label: '주력채널', x: 167, w: 23, align: 'left' as const },
  ];

  pdfTableRow(doc, cols.map(c => ({ text: c.label, x: c.x, w: c.w, align: c.align })), y, true, 0, pageW);
  y += 8;

  storeData.forEach((st, i) => {
    if (y > 275) {
      addPdfFooter(doc, startPage);
      doc.addPage();
      addPdfHeader(doc, '매장 매출 순위 (계속)');
      y = 28;
      startPage++;
    }
    pdfTableRow(doc, [
      { text: `${i + 1}`, x: 20, w: 10, align: 'center' },
      { text: st.storeName, x: 30, w: 40 },
      { text: st.storeTag, x: 70, w: 22, align: 'center' },
      { text: formatCompactCurrency(st.totalSales), x: 92, w: 30, align: 'right' },
      { text: `${formatNumber(st.totalOrders)}건`, x: 122, w: 20, align: 'right' },
      { text: formatCurrency(st.avgOrderValue), x: 142, w: 25, align: 'right' },
      { text: st.topChannel, x: 167, w: 23 },
    ], y, false, i, pageW);
    y += 7;
  });

  addPdfFooter(doc, startPage);
  return startPage;
}

function buildPdfManagerTable(doc: any, tagData: TagSummary[], startPage: number): number {
  doc.addPage();
  const pageW = doc.internal.pageSize.getWidth();
  addPdfHeader(doc, '담당자/태그별 분석');

  let y = 28;
  const cols = [
    { label: '담당자', x: 20, w: 30, align: 'left' as const },
    { label: '매장수', x: 50, w: 18, align: 'center' as const },
    { label: '총매출', x: 68, w: 35, align: 'right' as const },
    { label: '총주문', x: 103, w: 25, align: 'right' as const },
    { label: '매장평균', x: 128, w: 32, align: 'right' as const },
    { label: '비율', x: 160, w: 20, align: 'right' as const },
  ];

  pdfTableRow(doc, cols.map(c => ({ text: c.label, x: c.x, w: c.w, align: c.align })), y, true, 0, pageW);
  y += 8;

  tagData.forEach((tag, i) => {
    pdfTableRow(doc, [
      { text: tag.tag, x: 20, w: 30 },
      { text: `${tag.stores.length}개`, x: 50, w: 18, align: 'center' },
      { text: formatCompactCurrency(tag.totalSales), x: 68, w: 35, align: 'right' },
      { text: `${formatNumber(tag.totalOrders)}건`, x: 103, w: 25, align: 'right' },
      { text: formatCompactCurrency(tag.avgSalesPerStore), x: 128, w: 32, align: 'right' },
      { text: `${tag.salesRatio.toFixed(1)}%`, x: 160, w: 20, align: 'right' },
    ], y, false, i, pageW);
    y += 7;
  });

  addPdfFooter(doc, startPage);
  return startPage;
}

function buildPdfStoreDetail(doc: any, storeData: StoreSummary[], startPage: number): number {
  doc.addPage();
  const pageW = doc.internal.pageSize.getWidth();
  addPdfHeader(doc, '매장별 상세 정보');

  let y = 28;

  storeData.forEach((st, i) => {
    if (y > 260) {
      addPdfFooter(doc, startPage);
      doc.addPage();
      addPdfHeader(doc, '매장별 상세 정보 (계속)');
      y = 28;
      startPage++;
    }

    // Store card
    doc.setFillColor(i % 2 === 0 ? 248 : 241, i % 2 === 0 ? 249 : 245, i % 2 === 0 ? 250 : 249);
    doc.roundedRect(20, y - 2, pageW - 40, 14, 1, 1, 'F');

    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(`${i + 1}. ${st.storeName}`, 24, y + 4);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.text(`담당: ${st.storeTag}`, 24, y + 9);

    doc.setFontSize(9);
    doc.setTextColor(3, 199, 90);
    doc.text(formatCompactCurrency(st.totalSales), 100, y + 4, { align: 'right' });

    doc.setTextColor(60, 60, 60);
    doc.text(`${formatNumber(st.totalOrders)}건`, 130, y + 4, { align: 'right' });

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.text(`객단가 ${formatCurrency(st.avgOrderValue)} | 주력 ${st.topChannel}`, 170, y + 4, { align: 'right' });

    y += 16;
  });

  addPdfFooter(doc, startPage);
  return startPage;
}

// ────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────
export function ReportGenerator({ data, channelData, tagData, storeData }: ReportGeneratorProps) {
  const [generating, setGenerating] = useState<string | null>(null);

  const totalSales = data.stores.reduce((s, st) => s + st.totalSales, 0);
  const totalOrders = data.stores.reduce((s, st) => s + st.totalOrders, 0);
  const dateStr = today();

  // ── PPT generation ──
  const generateSectionPPT = useCallback(async (sectionId: SectionId) => {
    setGenerating(`ppt-${sectionId}`);
    try {
      const pptxgenjs = await import('pptxgenjs');
      const PptxGenJS = pptxgenjs.default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'DDUNDDUN';
      pptx.title = `매출 분석 - ${SECTIONS.find(s => s.id === sectionId)?.label}`;

      buildTitleSlide(pptx, data, totalSales, totalOrders);

      switch (sectionId) {
        case 'overview':
          buildOverviewSlide(pptx, data, totalSales, totalOrders, dateStr);
          break;
        case 'channel':
          buildChannelSlide(pptx, channelData, totalSales, dateStr);
          break;
        case 'store-rank':
          buildStoreRankSlide(pptx, storeData, dateStr);
          break;
        case 'manager':
          buildManagerSlide(pptx, tagData, dateStr);
          break;
        case 'store-detail':
          buildStoreDetailSlides(pptx, storeData, dateStr, 2);
          break;
      }

      const label = SECTIONS.find(s => s.id === sectionId)?.label || sectionId;
      await pptx.writeFile({ fileName: `매출분석_${label}_${data.period?.replace(/[^0-9\-~]/g, '') || 'report'}.pptx` });
      toast.success(`${label} PPT 다운로드 완료`);
    } catch (err) {
      console.error(err);
      toast.error('PPT 생성 중 오류가 발생했습니다');
    } finally {
      setGenerating(null);
    }
  }, [data, channelData, tagData, storeData, totalSales, totalOrders, dateStr]);

  const generateFullPPT = useCallback(async () => {
    setGenerating('ppt-full');
    try {
      const pptxgenjs = await import('pptxgenjs');
      const PptxGenJS = pptxgenjs.default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'DDUNDDUN';
      pptx.title = `종합보고서 매출 분석 - ${data.period || ''}`;

      buildTitleSlide(pptx, data, totalSales, totalOrders);
      buildOverviewSlide(pptx, data, totalSales, totalOrders, dateStr);
      buildChannelSlide(pptx, channelData, totalSales, dateStr);
      buildStoreRankSlide(pptx, storeData, dateStr);
      buildManagerSlide(pptx, tagData, dateStr);
      const detailPageStart = 6;
      buildStoreDetailSlides(pptx, storeData, dateStr, detailPageStart);
      const conclusionPage = detailPageStart + Math.ceil(storeData.length / 5);
      buildConclusionSlide(pptx, data, channelData, storeData, tagData, totalSales, totalOrders, dateStr, conclusionPage);

      await pptx.writeFile({ fileName: `종합보고서_매출분석_${data.period?.replace(/[^0-9\-~]/g, '') || 'report'}.pptx` });
      toast.success('종합 PPT 보고서 다운로드 완료');
    } catch (err) {
      console.error(err);
      toast.error('PPT 생성 중 오류가 발생했습니다');
    } finally {
      setGenerating(null);
    }
  }, [data, channelData, tagData, storeData, totalSales, totalOrders, dateStr]);

  // ── PDF generation ──
  const generateSectionPDF = useCallback(async (sectionId: SectionId) => {
    setGenerating(`pdf-${sectionId}`);
    try {
      const doc = await createKoreanPdf({ orientation: 'landscape' });

      buildPdfCover(doc, data, totalSales, totalOrders);

      switch (sectionId) {
        case 'overview':
          buildPdfOverview(doc, data, totalSales, totalOrders, 2);
          break;
        case 'channel':
          buildPdfChannelTable(doc, channelData, 2);
          break;
        case 'store-rank':
          buildPdfStoreRank(doc, storeData, 2);
          break;
        case 'manager':
          buildPdfManagerTable(doc, tagData, 2);
          break;
        case 'store-detail':
          buildPdfStoreDetail(doc, storeData, 2);
          break;
      }

      const label = SECTIONS.find(s => s.id === sectionId)?.label || sectionId;
      doc.save(`매출분석_${label}_${data.period?.replace(/[^0-9\-~]/g, '') || 'report'}.pdf`);
      toast.success(`${label} PDF 다운로드 완료`);
    } catch (err) {
      console.error(err);
      toast.error('PDF 생성 중 오류가 발생했습니다');
    } finally {
      setGenerating(null);
    }
  }, [data, channelData, tagData, storeData, totalSales, totalOrders]);

  const generateFullPDF = useCallback(async () => {
    setGenerating('pdf-full');
    try {
      const doc = await createKoreanPdf({ orientation: 'landscape' });

      buildPdfCover(doc, data, totalSales, totalOrders);
      buildPdfOverview(doc, data, totalSales, totalOrders, 2);
      let page = buildPdfChannelTable(doc, channelData, 3);
      page = buildPdfStoreRank(doc, storeData, page + 1);
      page = buildPdfManagerTable(doc, tagData, page + 1);
      buildPdfStoreDetail(doc, storeData, page + 1);

      doc.save(`종합보고서_매출분석_${data.period?.replace(/[^0-9\-~]/g, '') || 'report'}.pdf`);
      toast.success('종합 PDF 보고서 다운로드 완료');
    } catch (err) {
      console.error(err);
      toast.error('PDF 생성 중 오류가 발생했습니다');
    } finally {
      setGenerating(null);
    }
  }, [data, channelData, tagData, storeData, totalSales, totalOrders]);

  return (
    <div className="space-y-4">
      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">보고서 미리보기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary KPIs */}
          <div>
            <h3 className="text-sm font-semibold mb-3">핵심 지표</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: '총 매출', value: formatCompactCurrency(totalSales) },
                { label: '총 주문', value: `${formatNumber(totalOrders)}건` },
                { label: '매장 수', value: `${data.stores.length}개` },
                { label: '매장 평균', value: formatCompactCurrency(data.stores.length > 0 ? Math.round(totalSales / data.stores.length) : 0) },
                { label: '객단가', value: formatCurrency(totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0) },
              ].map(kpi => (
                <div key={kpi.label} className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="font-bold">{kpi.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top channels */}
          <div>
            <h3 className="text-sm font-semibold mb-3">주요 채널 (상위 5개)</h3>
            <div className="space-y-2">
              {channelData.filter(ch => ch.totalSales > 0).slice(0, 5).map(ch => (
                <div key={ch.channelName} className="flex items-center justify-between text-sm">
                  <span>{ch.channelName}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{formatCompactCurrency(ch.totalSales)}</span>
                    <span className="text-muted-foreground text-xs w-12 text-right">{ch.salesRatio.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top stores */}
          <div>
            <h3 className="text-sm font-semibold mb-3">매장 순위 (상위 5개)</h3>
            <div className="space-y-2">
              {storeData.slice(0, 5).map((store, i) => (
                <div key={store.storeName} className="flex items-center justify-between text-sm">
                  <span>{i + 1}. {store.storeName} <span className="text-xs text-muted-foreground">{store.storeTag}</span></span>
                  <span className="font-medium">{formatCompactCurrency(store.totalSales)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section-level Downloads */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">섹션별 다운로드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
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
                  <span className="text-xs opacity-75 ml-2">인쇄 가능한 문서 형태</span>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
