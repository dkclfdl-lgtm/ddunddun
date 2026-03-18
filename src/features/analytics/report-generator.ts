import { createKoreanPdf, setKoreanFont, ensureKoreanFont } from '@/lib/pdf-utils';
import type { ExcelProductData, CategorySummary, ProductRecommendation } from './types';

export interface ReportData {
  fileName: string;
  uploadedAt: string | null;
  data: ExcelProductData[];
  categories: CategorySummary[];
  recommendations: ProductRecommendation[];
}

function fmtCurrency(v: number): string {
  if (v >= 100000000) return `${(v / 100000000).toFixed(1)}억원`;
  if (v >= 10000) return `${Math.round(v / 10000)}만원`;
  return `${v.toLocaleString()}원`;
}
function fmtNumber(v: number): string {
  return v.toLocaleString();
}
function fmtPercent(v: number): string {
  return `${v.toFixed(1)}%`;
}

// ─────────────────────────────────────────────
// PDF : html2canvas + jsPDF
// ─────────────────────────────────────────────
export async function downloadPDFReport(
  element: HTMLElement,
  fileName: string
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = await createKoreanPdf({ orientation: 'portrait' });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgH = (canvas.height * pageW) / canvas.width;

  let remaining = imgH;
  let offsetY = 0;

  pdf.addImage(imgData, 'PNG', 0, offsetY, pageW, imgH);
  remaining -= pageH;

  while (remaining > 0) {
    offsetY -= pageH;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, offsetY, pageW, imgH);
    remaining -= pageH;
  }

  const base = fileName.replace(/\.[^/.]+$/, '');
  pdf.save(`${base}_통계리포트.pdf`);
}

// ─────────────────────────────────────────────
// PPT : pptxgenjs
// ─────────────────────────────────────────────
export async function downloadPPTReport(reportData: ReportData): Promise<void> {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const prs = new PptxGenJS();
  prs.layout = 'LAYOUT_WIDE';

  const { fileName, data, categories, recommendations } = reportData;

  // ── 통계 계산 ────────────────────────────────
  const totalRevenue = data.reduce((s, p) => s + (p.actualSalesAmount || 0), 0);
  const totalOrders = data.reduce((s, p) => s + (p.orderCount || 0), 0);
  const totalCancels = data.reduce((s, p) => s + (p.cancelCount || 0), 0);
  const totalCardPayment = data.reduce((s, p) => s + (p.cardPayment || 0), 0);
  const totalCashPayment = data.reduce((s, p) => s + (p.cashPayment || 0), 0);
  const totalDineInOrders = data.reduce((s, p) => s + (p.dineInOrders || 0), 0);
  const totalTakeoutOrders = data.reduce((s, p) => s + (p.takeoutOrders || 0), 0);
  const totalDeliveryOrders = data.reduce((s, p) => s + (p.deliveryOrders || 0), 0);
  const totalChannelOrders = totalDineInOrders + totalTakeoutOrders + totalDeliveryOrders;
  const totalMemberSales = data.reduce((s, p) => s + (p.memberSalesAmount || 0), 0);

  const cancelRate = totalOrders > 0 ? (totalCancels / totalOrders) * 100 : 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const cardRatio = totalRevenue > 0 ? (totalCardPayment / totalRevenue) * 100 : 0;
  const cashRatio = totalRevenue > 0 ? (totalCashPayment / totalRevenue) * 100 : 0;
  const otherRatio = Math.max(0, 100 - cardRatio - cashRatio);
  const memberRatio = totalRevenue > 0 ? (totalMemberSales / totalRevenue) * 100 : 0;
  const dineInPct = totalChannelOrders > 0 ? (totalDineInOrders / totalChannelOrders) * 100 : 0;
  const takeoutPct = totalChannelOrders > 0 ? (totalTakeoutOrders / totalChannelOrders) * 100 : 0;
  const deliveryPct = totalChannelOrders > 0 ? (totalDeliveryOrders / totalChannelOrders) * 100 : 0;

  const topProducts = [...data]
    .sort((a, b) => (b.actualSalesAmount || 0) - (a.actualSalesAmount || 0))
    .slice(0, 20);
  const topCategories = [...categories]
    .sort((a, b) => b.totalSalesAmount - a.totalSalesAmount)
    .slice(0, 10);

  const reportDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // ── 색상 팔레트 ────────────────────────────────
  const C = {
    primary: '03C75A',
    primaryDark: '00a040',
    dark: '1e293b',
    gray: '64748b',
    lightBg: 'f1f5f9',
    border: 'e2e8f0',
    white: 'ffffff',
    red: 'ef4444',
    blue: '3b82f6',
    amber: 'f59e0b',
    purple: '8b5cf6',
    cyan: '06b6d4',
    green: '22c55e',
  };

  // ── 슬라이드 1: 표지 ──────────────────────────
  {
    const slide = prs.addSlide();
    slide.background = { color: C.primary };

    // 상단 장식 바
    slide.addShape(prs.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.08, fill: { color: C.primaryDark },
    });

    // 브랜드명
    slide.addText('TAMSAA · 뚠뚠', {
      x: 0.5, y: 1.0, w: 12.33, h: 0.5,
      fontSize: 14, color: 'ccffdd', align: 'center', charSpacing: 3,
    });

    // 메인 타이틀
    slide.addText('POS 판매 통계 리포트', {
      x: 0.5, y: 2.0, w: 12.33, h: 1.2,
      fontSize: 42, bold: true, color: C.white, align: 'center',
    });

    // 구분선
    slide.addShape(prs.ShapeType.rect, {
      x: 4.67, y: 3.4, w: 4, h: 0.04, fill: { color: 'ccffdd' },
    });

    // 파일명
    slide.addText(fileName, {
      x: 0.5, y: 3.7, w: 12.33, h: 0.6,
      fontSize: 16, color: 'ccffdd', align: 'center',
    });

    // 통계 요약
    slide.addText(`총 ${fmtNumber(data.length)}개 상품  |  ${categories.length}개 카테고리  |  분석일: ${reportDate}`, {
      x: 0.5, y: 4.6, w: 12.33, h: 0.5,
      fontSize: 13, color: 'aaffd0', align: 'center',
    });

    // 하단 장식
    slide.addShape(prs.ShapeType.rect, {
      x: 0, y: 7.0, w: '100%', h: 0.5, fill: { color: C.primaryDark },
    });
    slide.addText('Confidential · Internal Use Only', {
      x: 0.5, y: 7.0, w: 12.33, h: 0.5,
      fontSize: 9, color: 'aaffd0', align: 'center',
    });
  }

  // ── 슬라이드 2: 핵심 지표 ──────────────────────
  {
    const slide = prs.addSlide();

    // 헤더 바
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.85, fill: { color: C.dark } });
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.85, fill: { color: C.primary } });
    slide.addText('핵심 지표 요약', {
      x: 0.3, y: 0, w: 12, h: 0.85, fontSize: 22, bold: true, color: C.white,
    });

    const kpis = [
      { label: '총 매출', value: fmtCurrency(totalRevenue), color: C.green, sub: `일 평균 ${fmtCurrency(Math.round(totalRevenue / 73))}` },
      { label: '총 주문수', value: `${fmtNumber(totalOrders)}건`, color: C.blue, sub: `일 평균 ${fmtNumber(Math.round(totalOrders / 73))}건` },
      { label: '평균 주문금액', value: fmtCurrency(Math.round(avgOrderValue)), color: C.amber, sub: '주문당 평균' },
      { label: '취소율', value: fmtPercent(cancelRate), color: C.red, sub: `${fmtNumber(totalCancels)}건 취소` },
      { label: '카드 결제 비율', value: fmtPercent(cardRatio), color: C.purple, sub: fmtCurrency(totalCardPayment) },
      { label: '회원 매출 비율', value: fmtPercent(memberRatio), color: C.cyan, sub: fmtCurrency(totalMemberSales) },
    ];

    kpis.forEach((kpi, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.3 + col * 4.24;
      const y = 1.2 + row * 2.6;

      slide.addShape(prs.ShapeType.roundRect, {
        x, y, w: 4.0, h: 2.2,
        fill: { color: C.lightBg },
        line: { color: C.border, pt: 0.5 },
        rectRadius: 0.08,
      });
      slide.addShape(prs.ShapeType.rect, {
        x, y, w: 0.06, h: 2.2, fill: { color: kpi.color },
      });

      slide.addText(kpi.label, {
        x: x + 0.25, y: y + 0.25, w: 3.5, h: 0.35, fontSize: 12, color: C.gray,
      });
      slide.addText(kpi.value, {
        x: x + 0.25, y: y + 0.7, w: 3.5, h: 0.8, fontSize: 26, bold: true, color: kpi.color,
      });
      slide.addText(kpi.sub, {
        x: x + 0.25, y: y + 1.6, w: 3.5, h: 0.3, fontSize: 10, color: C.gray,
      });
    });
  }

  // ── 슬라이드 3: 카테고리 분석 ──────────────────
  {
    const slide = prs.addSlide();

    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.85, fill: { color: C.dark } });
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.85, fill: { color: C.primary } });
    slide.addText('카테고리별 매출 현황  (Top 10)', {
      x: 0.3, y: 0, w: 12, h: 0.85, fontSize: 22, bold: true, color: C.white,
    });

    const hdrOpts = (align: 'left' | 'center' | 'right' = 'center') => ({
      bold: true, color: C.white, fill: { color: C.dark }, align, valign: 'middle' as const,
    });

    const rows = topCategories.map((cat, i) => {
      const fill = { color: i % 2 === 0 ? C.white : C.lightBg };
      return [
        { text: `${i + 1}`, options: { ...fill, bold: i < 3, color: i < 3 ? C.primary : C.dark, align: 'center' as const } },
        { text: cat.categoryName, options: { ...fill, bold: i < 3 } },
        { text: fmtCurrency(cat.totalSalesAmount), options: { ...fill, align: 'right' as const } },
        { text: fmtNumber(cat.totalQuantity), options: { ...fill, align: 'right' as const } },
        { text: fmtNumber(cat.totalOrders), options: { ...fill, align: 'right' as const } },
        { text: fmtPercent(cat.cancelRate), options: { ...fill, color: cat.cancelRate > 5 ? C.red : C.dark, align: 'right' as const } },
        { text: `${fmtPercent(cat.dineInRatio)}/${fmtPercent(cat.takeoutRatio)}/${fmtPercent(cat.deliveryRatio)}`, options: { ...fill, fontSize: 9, color: C.gray, align: 'center' as const } },
      ];
    });

    slide.addTable(
      [
        [
          { text: '#', options: hdrOpts('center') },
          { text: '카테고리', options: hdrOpts('left') },
          { text: '매출금액', options: hdrOpts('right') },
          { text: '판매수량', options: hdrOpts('right') },
          { text: '주문수', options: hdrOpts('right') },
          { text: '취소율', options: hdrOpts('right') },
          { text: '매장/포장/배달', options: hdrOpts('center') },
        ],
        ...rows,
      ],
      {
        x: 0.3, y: 1.1, w: 12.73,
        rowH: 0.45,
        colW: [0.5, 3.0, 2.5, 1.7, 1.6, 1.2, 2.23],
        fontSize: 11,
        border: { type: 'solid', color: C.border, pt: 0.5 },
        fontFace: '맑은 고딕',
        margin: [3, 5, 3, 5],
      }
    );
  }

  // ── 슬라이드 4: 매출 Top 20 ───────────────────
  {
    const slide = prs.addSlide();

    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.85, fill: { color: C.dark } });
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.85, fill: { color: C.primary } });
    slide.addText('매출 Top 20 상품', {
      x: 0.3, y: 0, w: 12, h: 0.85, fontSize: 22, bold: true, color: C.white,
    });

    const hdrOpts = (align: 'left' | 'center' | 'right' = 'center') => ({
      bold: true, color: C.white, fill: { color: C.dark }, align, valign: 'middle' as const,
    });

    const rows = topProducts.map((p, i) => {
      const fill = { color: i % 2 === 0 ? C.white : C.lightBg };
      return [
        { text: `${i + 1}`, options: { ...fill, bold: i < 3, color: i < 3 ? C.primary : C.dark, align: 'center' as const } },
        { text: p.productName, options: { ...fill, bold: i < 3 } },
        { text: p.categoryName, options: { ...fill, color: C.gray, fontSize: 10 } },
        { text: fmtCurrency(p.actualSalesAmount || 0), options: { ...fill, align: 'right' as const } },
        { text: fmtNumber(p.salesQuantity || 0), options: { ...fill, align: 'right' as const } },
        { text: fmtCurrency(p.actualUnitPrice || 0), options: { ...fill, align: 'right' as const, color: C.gray, fontSize: 10 } },
      ];
    });

    slide.addTable(
      [
        [
          { text: '#', options: hdrOpts('center') },
          { text: '상품명', options: hdrOpts('left') },
          { text: '카테고리', options: hdrOpts('left') },
          { text: '매출금액', options: hdrOpts('right') },
          { text: '판매수량', options: hdrOpts('right') },
          { text: '단가', options: hdrOpts('right') },
        ],
        ...rows,
      ],
      {
        x: 0.3, y: 1.1, w: 12.73,
        rowH: 0.3,
        colW: [0.5, 4.0, 2.4, 2.5, 1.7, 1.63],
        fontSize: 10,
        border: { type: 'solid', color: C.border, pt: 0.5 },
        fontFace: '맑은 고딕',
        margin: [3, 5, 3, 5],
      }
    );
  }

  // ── 슬라이드 5: 채널 + 결제 분석 ──────────────
  {
    const slide = prs.addSlide();

    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.85, fill: { color: C.dark } });
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.85, fill: { color: C.primary } });
    slide.addText('채널별 · 결제 수단 분석', {
      x: 0.3, y: 0, w: 12, h: 0.85, fontSize: 22, bold: true, color: C.white,
    });

    // ─ 채널 ─
    slide.addText('주문 채널 분석', {
      x: 0.3, y: 1.1, w: 5, h: 0.4, fontSize: 14, bold: true, color: C.dark,
    });

    const channels = [
      { label: '매장 내', pct: dineInPct, count: totalDineInOrders, color: C.blue },
      { label: '포장', pct: takeoutPct, count: totalTakeoutOrders, color: C.amber },
      { label: '배달', pct: deliveryPct, count: totalDeliveryOrders, color: C.red },
    ];

    channels.forEach((ch, i) => {
      const x = 0.3 + i * 2.1;
      const y = 1.7;

      slide.addShape(prs.ShapeType.roundRect, {
        x, y, w: 1.9, h: 3.2,
        fill: { color: C.lightBg },
        line: { color: ch.color, pt: 1.5 },
        rectRadius: 0.08,
      });
      slide.addShape(prs.ShapeType.rect, {
        x, y, w: 1.9, h: 0.06, fill: { color: ch.color },
      });

      slide.addText(ch.label, {
        x, y: y + 0.3, w: 1.9, h: 0.4,
        fontSize: 13, bold: true, color: ch.color, align: 'center',
      });
      slide.addText(fmtPercent(ch.pct), {
        x, y: y + 0.9, w: 1.9, h: 0.9,
        fontSize: 30, bold: true, color: C.dark, align: 'center',
      });
      slide.addText(`${fmtNumber(ch.count)}건`, {
        x, y: y + 2.2, w: 1.9, h: 0.5,
        fontSize: 11, color: C.gray, align: 'center',
      });
    });

    // 채널 합계
    slide.addText(`전체 채널 주문: ${fmtNumber(totalChannelOrders)}건`, {
      x: 0.3, y: 5.1, w: 6.0, h: 0.35,
      fontSize: 10, color: C.gray, align: 'center',
    });

    // ─ 구분선 ─
    slide.addShape(prs.ShapeType.rect, {
      x: 6.67, y: 1.0, w: 0.06, h: 4.5, fill: { color: C.border },
    });

    // ─ 결제 수단 ─
    slide.addText('결제 수단 분석', {
      x: 7.0, y: 1.1, w: 5, h: 0.4, fontSize: 14, bold: true, color: C.dark,
    });

    const payments = [
      { label: '카드', pct: cardRatio, amount: totalCardPayment, color: C.purple },
      { label: '현금', pct: cashRatio, amount: totalCashPayment, color: C.green },
      { label: '기타', pct: otherRatio, amount: totalRevenue - totalCardPayment - totalCashPayment, color: C.gray },
    ];

    payments.forEach((pm, i) => {
      const x = 7.0 + i * 2.1;
      const y = 1.7;

      slide.addShape(prs.ShapeType.roundRect, {
        x, y, w: 1.9, h: 3.2,
        fill: { color: C.lightBg },
        line: { color: pm.color, pt: 1.5 },
        rectRadius: 0.08,
      });
      slide.addShape(prs.ShapeType.rect, {
        x, y, w: 1.9, h: 0.06, fill: { color: pm.color },
      });

      slide.addText(pm.label, {
        x, y: y + 0.3, w: 1.9, h: 0.4,
        fontSize: 13, bold: true, color: pm.color, align: 'center',
      });
      slide.addText(fmtPercent(pm.pct), {
        x, y: y + 0.9, w: 1.9, h: 0.9,
        fontSize: 30, bold: true, color: C.dark, align: 'center',
      });
      slide.addText(fmtCurrency(pm.amount), {
        x, y: y + 2.2, w: 1.9, h: 0.5,
        fontSize: 10, color: C.gray, align: 'center',
      });
    });

    slide.addText(`총 결제금액: ${fmtCurrency(totalRevenue)}`, {
      x: 7.0, y: 5.1, w: 6.0, h: 0.35,
      fontSize: 10, color: C.gray, align: 'center',
    });

    // ─ 하단 인사이트 ─
    slide.addShape(prs.ShapeType.roundRect, {
      x: 0.3, y: 5.7, w: 12.73, h: 0.7,
      fill: { color: C.lightBg }, line: { color: C.primary, pt: 1 }, rectRadius: 0.06,
    });
    slide.addText(
      `카드 결제 비중 ${fmtPercent(cardRatio)}  |  매장 내 주문 비중 ${fmtPercent(dineInPct)}  |  회원 매출 비중 ${fmtPercent(memberRatio)}`,
      {
        x: 0.5, y: 5.7, w: 12.33, h: 0.7,
        fontSize: 12, color: C.dark, align: 'center', bold: false,
      }
    );
  }

  // ── 슬라이드 6: 추천 인사이트 ─────────────────
  if (recommendations.length > 0) {
    const slide = prs.addSlide();

    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.85, fill: { color: C.dark } });
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.85, fill: { color: C.primary } });
    slide.addText('추천 인사이트', {
      x: 0.3, y: 0, w: 12, h: 0.85, fontSize: 22, bold: true, color: C.white,
    });

    const typeMap: Record<string, { label: string; color: string }> = {
      price_increase: { label: '가격 인상', color: C.green },
      price_decrease: { label: '가격 인하', color: C.amber },
      promotion: { label: '프로모션', color: C.blue },
      bundle: { label: '번들', color: C.purple },
      discontinue: { label: '판매 중단', color: C.red },
      premium: { label: '프리미엄', color: C.amber },
    };

    recommendations.slice(0, 5).forEach((rec, i) => {
      const { label, color } = typeMap[rec.type] ?? { label: rec.type, color: C.gray };
      const y = 1.15 + i * 1.2;

      slide.addShape(prs.ShapeType.roundRect, {
        x: 0.3, y, w: 12.73, h: 1.05,
        fill: { color: C.lightBg },
        line: { color: color, pt: 1 },
        rectRadius: 0.06,
      });
      slide.addShape(prs.ShapeType.roundRect, {
        x: 0.3, y, w: 1.4, h: 1.05,
        fill: { color: color },
        rectRadius: 0.06,
      });

      slide.addText(label, {
        x: 0.3, y: y + 0.28, w: 1.4, h: 0.5,
        fontSize: 10, bold: true, color: C.white, align: 'center',
      });
      slide.addText(rec.productName, {
        x: 2.0, y: y + 0.12, w: 7, h: 0.45,
        fontSize: 13, bold: true, color: C.dark,
      });
      slide.addText(rec.suggestedAction, {
        x: 2.0, y: y + 0.55, w: 8.0, h: 0.35,
        fontSize: 10, color: C.gray,
      });
      slide.addText(`신뢰도 ${fmtPercent(rec.confidence * 100)}`, {
        x: 10.5, y: y + 0.3, w: 2.3, h: 0.45,
        fontSize: 12, bold: true, color: color, align: 'right',
      });
    });
  }

  // ── 슬라이드 7: 결론/인사이트 요약 ────────────
  {
    const slide = prs.addSlide();
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.85, fill: { color: C.dark } });
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.85, fill: { color: C.primary } });
    slide.addText('요약 및 인사이트', {
      x: 0.3, y: 0, w: 12, h: 0.85, fontSize: 22, bold: true, color: C.white,
    });

    const insights: string[] = [];
    if (topProducts.length > 0) {
      insights.push(`최고 매출 상품: ${topProducts[0].productName} (${fmtCurrency(topProducts[0].actualSalesAmount || 0)})`);
    }
    if (topCategories.length > 0) {
      insights.push(`주력 카테고리: ${topCategories[0].categoryName} (${fmtCurrency(topCategories[0].totalSalesAmount)})`);
    }
    insights.push(`총 매출 ${fmtCurrency(totalRevenue)}, 평균 주문금액 ${fmtCurrency(Math.round(avgOrderValue))}`);
    insights.push(`카드 결제 비중 ${fmtPercent(cardRatio)}, 매장 내 주문 비중 ${fmtPercent(dineInPct)}`);
    if (cancelRate > 3) {
      insights.push(`취소율 ${fmtPercent(cancelRate)} - 개선 필요`);
    }

    insights.forEach((text, i) => {
      const y = 1.3 + i * 0.9;
      slide.addShape(prs.ShapeType.roundRect, {
        x: 0.5, y, w: 12.33, h: 0.72,
        fill: { color: C.lightBg }, line: { color: C.primary, pt: 0.5 }, rectRadius: 0.06,
      });
      slide.addShape(prs.ShapeType.roundRect, {
        x: 0.5, y, w: 0.72, h: 0.72, fill: { color: C.primary }, rectRadius: 0.06,
      });
      slide.addText(`${i + 1}`, {
        x: 0.5, y, w: 0.72, h: 0.72, fontSize: 14, bold: true, color: C.white, align: 'center', valign: 'middle',
      });
      slide.addText(text, {
        x: 1.45, y, w: 11.2, h: 0.72, fontSize: 13, color: C.dark, valign: 'middle',
      });
    });

    // Footer
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 7.0, w: '100%', h: 0.5, fill: { color: C.dark } });
    slide.addText(`DDUNDDUN 뛰뛰 F&B Dashboard  |  ${reportDate}`, {
      x: 0.3, y: 7.0, w: 12.73, h: 0.5, fontSize: 9, color: C.gray, align: 'center', valign: 'middle',
    });
  }

  const base = fileName.replace(/\.[^/.]+$/, '');
  await prs.writeFile({ fileName: `${base}_통계리포트.pptx` });
}

// ─────────────────────────────────────────────
// Section PPT : individual section download
// ─────────────────────────────────────────────
export async function downloadSectionPPT(reportData: ReportData, sectionId: string): Promise<void> {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const prs = new PptxGenJS();
  prs.layout = 'LAYOUT_WIDE';

  const { fileName, data, categories, recommendations } = reportData;

  const totalRevenue = data.reduce((s, p) => s + (p.actualSalesAmount || 0), 0);
  const totalOrders = data.reduce((s, p) => s + (p.orderCount || 0), 0);
  const totalCancels = data.reduce((s, p) => s + (p.cancelCount || 0), 0);
  const totalCardPayment = data.reduce((s, p) => s + (p.cardPayment || 0), 0);
  const totalCashPayment = data.reduce((s, p) => s + (p.cashPayment || 0), 0);
  const totalDineInOrders = data.reduce((s, p) => s + (p.dineInOrders || 0), 0);
  const totalTakeoutOrders = data.reduce((s, p) => s + (p.takeoutOrders || 0), 0);
  const totalDeliveryOrders = data.reduce((s, p) => s + (p.deliveryOrders || 0), 0);
  const totalChannelOrders = totalDineInOrders + totalTakeoutOrders + totalDeliveryOrders;
  const totalMemberSales = data.reduce((s, p) => s + (p.memberSalesAmount || 0), 0);

  const cancelRate = totalOrders > 0 ? (totalCancels / totalOrders) * 100 : 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const cardRatio = totalRevenue > 0 ? (totalCardPayment / totalRevenue) * 100 : 0;
  const cashRatio = totalRevenue > 0 ? (totalCashPayment / totalRevenue) * 100 : 0;
  const otherRatio = Math.max(0, 100 - cardRatio - cashRatio);
  const memberRatio = totalRevenue > 0 ? (totalMemberSales / totalRevenue) * 100 : 0;
  const dineInPct = totalChannelOrders > 0 ? (totalDineInOrders / totalChannelOrders) * 100 : 0;
  const takeoutPct = totalChannelOrders > 0 ? (totalTakeoutOrders / totalChannelOrders) * 100 : 0;
  const deliveryPct = totalChannelOrders > 0 ? (totalDeliveryOrders / totalChannelOrders) * 100 : 0;

  const topProducts = [...data].sort((a, b) => (b.actualSalesAmount || 0) - (a.actualSalesAmount || 0)).slice(0, 20);
  const topCategories = [...categories].sort((a, b) => b.totalSalesAmount - a.totalSalesAmount).slice(0, 10);

  const reportDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const CC = {
    primary: '03C75A', primaryDark: '00a040', dark: '1e293b', gray: '64748b',
    lightBg: 'f1f5f9', border: 'e2e8f0', white: 'ffffff', red: 'ef4444',
    blue: '3b82f6', amber: 'f59e0b', purple: '8b5cf6', cyan: '06b6d4', green: '22c55e',
  };

  const sectionTitles: Record<string, string> = {
    kpi: '핵심 지표 요약',
    category: '카테고리별 매출 현황',
    'top-products': '매출 Top 20 상품',
    'channel-payment': '채널별 · 결제 수단 분석',
    recommendations: '추천 인사이트',
  };

  // Title slide
  const titleSlide = prs.addSlide();
  titleSlide.background = { color: CC.primary };
  titleSlide.addText('DDUNDDUN 뛰뛰', {
    x: 0.5, y: 1.0, w: 12.33, h: 0.5, fontSize: 14, color: 'ccffdd', align: 'center', charSpacing: 3,
  });
  titleSlide.addText(sectionTitles[sectionId] || 'POS 통계', {
    x: 0.5, y: 2.2, w: 12.33, h: 1.2, fontSize: 38, bold: true, color: CC.white, align: 'center',
  });
  titleSlide.addShape(prs.ShapeType.rect, { x: 4.67, y: 3.6, w: 4, h: 0.04, fill: { color: 'ccffdd' } });
  titleSlide.addText(`${fileName}  |  ${reportDate}`, {
    x: 0.5, y: 4.0, w: 12.33, h: 0.5, fontSize: 13, color: 'aaffd0', align: 'center',
  });

  const addHeader = (slide: any, title: string) => {
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.85, fill: { color: CC.dark } });
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.85, fill: { color: CC.primary } });
    slide.addText(title, { x: 0.3, y: 0, w: 12, h: 0.85, fontSize: 22, bold: true, color: CC.white });
  };

  const hdrOpts = (align: 'left' | 'center' | 'right' = 'center') => ({
    bold: true, color: CC.white, fill: { color: CC.dark }, align, valign: 'middle' as const,
  });

  switch (sectionId) {
    case 'kpi': {
      const slide = prs.addSlide();
      addHeader(slide, '핵심 지표 요약');
      const kpis = [
        { label: '총 매출', value: fmtCurrency(totalRevenue), color: CC.green },
        { label: '총 주문수', value: `${fmtNumber(totalOrders)}건`, color: CC.blue },
        { label: '평균 주문금액', value: fmtCurrency(Math.round(avgOrderValue)), color: CC.amber },
        { label: '취소율', value: fmtPercent(cancelRate), color: CC.red },
        { label: '카드 결제', value: fmtPercent(cardRatio), color: CC.purple },
        { label: '회원 매출', value: fmtPercent(memberRatio), color: CC.cyan },
      ];
      kpis.forEach((kpi, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 0.3 + col * 4.24;
        const y = 1.2 + row * 2.6;
        slide.addShape(prs.ShapeType.roundRect, { x, y, w: 4.0, h: 2.2, fill: { color: CC.lightBg }, line: { color: CC.border, pt: 0.5 }, rectRadius: 0.08 });
        slide.addShape(prs.ShapeType.rect, { x, y, w: 0.06, h: 2.2, fill: { color: kpi.color } });
        slide.addText(kpi.label, { x: x + 0.25, y: y + 0.3, w: 3.5, h: 0.35, fontSize: 12, color: CC.gray });
        slide.addText(kpi.value, { x: x + 0.25, y: y + 0.8, w: 3.5, h: 0.7, fontSize: 26, bold: true, color: kpi.color });
      });
      break;
    }
    case 'category': {
      const slide = prs.addSlide();
      addHeader(slide, '카테고리별 매출 현황 (Top 10)');
      const rows = topCategories.map((cat, i) => {
        const fill = { color: i % 2 === 0 ? CC.white : CC.lightBg };
        return [
          { text: `${i + 1}`, options: { ...fill, bold: i < 3, color: i < 3 ? CC.primary : CC.dark, align: 'center' as const } },
          { text: cat.categoryName, options: { ...fill, bold: i < 3 } },
          { text: fmtCurrency(cat.totalSalesAmount), options: { ...fill, align: 'right' as const } },
          { text: fmtNumber(cat.totalQuantity), options: { ...fill, align: 'right' as const } },
          { text: fmtNumber(cat.totalOrders), options: { ...fill, align: 'right' as const } },
          { text: fmtPercent(cat.cancelRate), options: { ...fill, color: cat.cancelRate > 5 ? CC.red : CC.dark, align: 'right' as const } },
        ];
      });
      slide.addTable([[
        { text: '#', options: hdrOpts('center') },
        { text: '카테고리', options: hdrOpts('left') },
        { text: '매출금액', options: hdrOpts('right') },
        { text: '판매수량', options: hdrOpts('right') },
        { text: '주문수', options: hdrOpts('right') },
        { text: '취소율', options: hdrOpts('right') },
      ], ...rows], { x: 0.3, y: 1.1, w: 12.73, rowH: 0.45, colW: [0.5, 3.4, 2.9, 2.1, 2.0, 1.83], fontSize: 11, border: { type: 'solid', color: CC.border, pt: 0.5 }, fontFace: '맑은 고딕', margin: [3, 5, 3, 5] });
      break;
    }
    case 'top-products': {
      const slide = prs.addSlide();
      addHeader(slide, '매출 Top 20 상품');
      const rows = topProducts.map((p, i) => {
        const fill = { color: i % 2 === 0 ? CC.white : CC.lightBg };
        return [
          { text: `${i + 1}`, options: { ...fill, bold: i < 3, color: i < 3 ? CC.primary : CC.dark, align: 'center' as const } },
          { text: p.productName, options: { ...fill, bold: i < 3 } },
          { text: p.categoryName, options: { ...fill, color: CC.gray, fontSize: 9 } },
          { text: fmtCurrency(p.actualSalesAmount || 0), options: { ...fill, align: 'right' as const } },
          { text: fmtNumber(p.salesQuantity || 0), options: { ...fill, align: 'right' as const } },
          { text: fmtCurrency(p.actualUnitPrice || 0), options: { ...fill, align: 'right' as const, color: CC.gray, fontSize: 9 } },
        ];
      });
      slide.addTable([[
        { text: '#', options: hdrOpts('center') },
        { text: '상품명', options: hdrOpts('left') },
        { text: '카테고리', options: hdrOpts('left') },
        { text: '매출금액', options: hdrOpts('right') },
        { text: '판매수량', options: hdrOpts('right') },
        { text: '단가', options: hdrOpts('right') },
      ], ...rows], { x: 0.3, y: 1.1, w: 12.73, rowH: 0.3, colW: [0.5, 4.0, 2.4, 2.5, 1.7, 1.63], fontSize: 10, border: { type: 'solid', color: CC.border, pt: 0.5 }, fontFace: '맑은 고딕', margin: [3, 5, 3, 5] });
      break;
    }
    case 'channel-payment': {
      const slide = prs.addSlide();
      addHeader(slide, '채널별 · 결제 수단 분석');
      const channels = [
        { label: '매장 내', pct: dineInPct, count: totalDineInOrders, color: CC.blue },
        { label: '포장', pct: takeoutPct, count: totalTakeoutOrders, color: CC.amber },
        { label: '배달', pct: deliveryPct, count: totalDeliveryOrders, color: CC.red },
      ];
      channels.forEach((ch, i) => {
        const x = 0.3 + i * 2.1;
        const y = 1.5;
        slide.addShape(prs.ShapeType.roundRect, { x, y, w: 1.9, h: 3.5, fill: { color: CC.lightBg }, line: { color: ch.color, pt: 1.5 }, rectRadius: 0.08 });
        slide.addShape(prs.ShapeType.rect, { x, y, w: 1.9, h: 0.06, fill: { color: ch.color } });
        slide.addText(ch.label, { x, y: y + 0.35, w: 1.9, h: 0.4, fontSize: 13, bold: true, color: ch.color, align: 'center' });
        slide.addText(fmtPercent(ch.pct), { x, y: y + 1.0, w: 1.9, h: 0.9, fontSize: 30, bold: true, color: CC.dark, align: 'center' });
        slide.addText(`${fmtNumber(ch.count)}건`, { x, y: y + 2.3, w: 1.9, h: 0.5, fontSize: 11, color: CC.gray, align: 'center' });
      });
      slide.addShape(prs.ShapeType.rect, { x: 6.67, y: 1.0, w: 0.06, h: 5.0, fill: { color: CC.border } });
      const payments = [
        { label: '카드', pct: cardRatio, amount: totalCardPayment, color: CC.purple },
        { label: '현금', pct: cashRatio, amount: totalCashPayment, color: CC.green },
        { label: '기타', pct: otherRatio, amount: totalRevenue - totalCardPayment - totalCashPayment, color: CC.gray },
      ];
      payments.forEach((pm, i) => {
        const x = 7.0 + i * 2.1;
        const y = 1.5;
        slide.addShape(prs.ShapeType.roundRect, { x, y, w: 1.9, h: 3.5, fill: { color: CC.lightBg }, line: { color: pm.color, pt: 1.5 }, rectRadius: 0.08 });
        slide.addShape(prs.ShapeType.rect, { x, y, w: 1.9, h: 0.06, fill: { color: pm.color } });
        slide.addText(pm.label, { x, y: y + 0.35, w: 1.9, h: 0.4, fontSize: 13, bold: true, color: pm.color, align: 'center' });
        slide.addText(fmtPercent(pm.pct), { x, y: y + 1.0, w: 1.9, h: 0.9, fontSize: 30, bold: true, color: CC.dark, align: 'center' });
        slide.addText(fmtCurrency(pm.amount), { x, y: y + 2.3, w: 1.9, h: 0.5, fontSize: 10, color: CC.gray, align: 'center' });
      });
      break;
    }
    case 'recommendations': {
      if (recommendations.length > 0) {
        const slide = prs.addSlide();
        addHeader(slide, '추천 인사이트');
        const typeMap: Record<string, { label: string; color: string }> = {
          price_increase: { label: '가격 인상', color: CC.green },
          price_decrease: { label: '가격 인하', color: CC.amber },
          promotion: { label: '프로모션', color: CC.blue },
          bundle: { label: '번들', color: CC.purple },
          discontinue: { label: '판매 중단', color: CC.red },
          premium: { label: '프리미엄', color: CC.amber },
        };
        recommendations.slice(0, 5).forEach((rec, i) => {
          const { label, color } = typeMap[rec.type] ?? { label: rec.type, color: CC.gray };
          const y = 1.15 + i * 1.2;
          slide.addShape(prs.ShapeType.roundRect, { x: 0.3, y, w: 12.73, h: 1.05, fill: { color: CC.lightBg }, line: { color, pt: 1 }, rectRadius: 0.06 });
          slide.addShape(prs.ShapeType.roundRect, { x: 0.3, y, w: 1.4, h: 1.05, fill: { color }, rectRadius: 0.06 });
          slide.addText(label, { x: 0.3, y: y + 0.28, w: 1.4, h: 0.5, fontSize: 10, bold: true, color: CC.white, align: 'center' });
          slide.addText(rec.productName, { x: 2.0, y: y + 0.12, w: 7, h: 0.45, fontSize: 13, bold: true, color: CC.dark });
          slide.addText(rec.suggestedAction, { x: 2.0, y: y + 0.55, w: 8.0, h: 0.35, fontSize: 10, color: CC.gray });
          slide.addText(`신뢰도 ${fmtPercent(rec.confidence * 100)}`, { x: 10.5, y: y + 0.3, w: 2.3, h: 0.45, fontSize: 12, bold: true, color, align: 'right' });
        });
      }
      break;
    }
  }

  const base = fileName.replace(/\.[^/.]+$/, '');
  await prs.writeFile({ fileName: `${base}_${sectionTitles[sectionId] || sectionId}.pptx` });
}

// ─────────────────────────────────────────────
// Section PDF : individual section download
// ─────────────────────────────────────────────
export async function downloadSectionPDF(reportData: ReportData, sectionId: string): Promise<void> {
  const doc = await createKoreanPdf({ orientation: 'portrait' });

  const { fileName, data, categories, recommendations } = reportData;
  const pageW = doc.internal.pageSize.getWidth();
  const BRAND = 'DDUNDDUN 뛰뛰 F&B Dashboard';

  const totalRevenue = data.reduce((s, p) => s + (p.actualSalesAmount || 0), 0);
  const totalOrders = data.reduce((s, p) => s + (p.orderCount || 0), 0);
  const totalCancels = data.reduce((s, p) => s + (p.cancelCount || 0), 0);
  const totalCardPayment = data.reduce((s, p) => s + (p.cardPayment || 0), 0);
  const totalCashPayment = data.reduce((s, p) => s + (p.cashPayment || 0), 0);
  const totalDineInOrders = data.reduce((s, p) => s + (p.dineInOrders || 0), 0);
  const totalTakeoutOrders = data.reduce((s, p) => s + (p.takeoutOrders || 0), 0);
  const totalDeliveryOrders = data.reduce((s, p) => s + (p.deliveryOrders || 0), 0);
  const totalChannelOrders = totalDineInOrders + totalTakeoutOrders + totalDeliveryOrders;
  const totalMemberSales = data.reduce((s, p) => s + (p.memberSalesAmount || 0), 0);

  const cancelRate = totalOrders > 0 ? (totalCancels / totalOrders) * 100 : 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const cardRatio = totalRevenue > 0 ? (totalCardPayment / totalRevenue) * 100 : 0;
  const cashRatio = totalRevenue > 0 ? (totalCashPayment / totalRevenue) * 100 : 0;
  const memberRatio = totalRevenue > 0 ? (totalMemberSales / totalRevenue) * 100 : 0;
  const dineInPct = totalChannelOrders > 0 ? (totalDineInOrders / totalChannelOrders) * 100 : 0;
  const takeoutPct = totalChannelOrders > 0 ? (totalTakeoutOrders / totalChannelOrders) * 100 : 0;
  const deliveryPct = totalChannelOrders > 0 ? (totalDeliveryOrders / totalChannelOrders) * 100 : 0;

  const topProducts = [...data].sort((a, b) => (b.actualSalesAmount || 0) - (a.actualSalesAmount || 0)).slice(0, 20);
  const topCategories = [...categories].sort((a, b) => b.totalSalesAmount - a.totalSalesAmount).slice(0, 10);

  const reportDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const sectionTitles: Record<string, string> = {
    kpi: '핵심 지표 요약',
    category: '카테고리별 매출 현황',
    'top-products': '매출 Top 20 상품',
    'channel-payment': '채널별 · 결제 수단 분석',
    recommendations: '추천 인사이트',
  };

  // Header helper
  const addHdr = (title: string) => {
    doc.setFillColor(3, 199, 90);
    doc.rect(0, 0, pageW, 2, 'F');
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 2, pageW, 12, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 20, 10.5);
    doc.text(BRAND, pageW - 20, 10.5, { align: 'right' });
  };

  const addFtr = (page: number) => {
    const pageH = doc.internal.pageSize.getHeight();
    doc.setDrawColor(3, 199, 90);
    doc.setLineWidth(0.5);
    doc.line(20, pageH - 12, pageW - 20, pageH - 12);
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(BRAND, 20, pageH - 7);
    doc.text(`${reportDate}  |  ${page}`, pageW - 20, pageH - 7, { align: 'right' });
  };

  // Cover
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 297, 'F');
  doc.setFillColor(3, 199, 90);
  doc.rect(0, 0, pageW, 4, 'F');
  doc.setFontSize(10);
  doc.setTextColor(3, 199, 90);
  doc.text('DDUNDDUN 뛰뛰', pageW / 2, 50, { align: 'center' });
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(sectionTitles[sectionId] || 'POS 통계', pageW / 2, 80, { align: 'center' });
  doc.setFillColor(3, 199, 90);
  doc.rect(pageW / 2 - 20, 88, 40, 1, 'F');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`${fileName}  |  ${reportDate}`, pageW / 2, 100, { align: 'center' });

  // Content page
  doc.addPage();
  addHdr(sectionTitles[sectionId] || '');
  let y = 24;

  switch (sectionId) {
    case 'kpi': {
      const kpis = [
        ['총 매출', fmtCurrency(totalRevenue)],
        ['총 주문수', `${fmtNumber(totalOrders)}건`],
        ['평균 주문금액', fmtCurrency(Math.round(avgOrderValue))],
        ['취소율', fmtPercent(cancelRate)],
        ['카드 결제 비율', fmtPercent(cardRatio)],
        ['현금 결제 비율', fmtPercent(cashRatio)],
        ['회원 매출 비율', fmtPercent(memberRatio)],
        ['매장 주문 비율', fmtPercent(dineInPct)],
        ['포장 주문 비율', fmtPercent(takeoutPct)],
        ['배달 주문 비율', fmtPercent(deliveryPct)],
      ];
      kpis.forEach(([label, value]) => {
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(20, y - 2, pageW - 40, 10, 1, 1, 'F');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(label, 26, y + 4);
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text(value, pageW - 26, y + 4, { align: 'right' });
        y += 12;
      });
      break;
    }
    case 'category': {
      doc.setFillColor(3, 199, 90);
      doc.rect(20, y, pageW - 40, 7, 'F');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('#', 24, y + 5);
      doc.text('카테고리', 32, y + 5);
      doc.text('매출금액', 90, y + 5, { align: 'right' });
      doc.text('판매수량', 115, y + 5, { align: 'right' });
      doc.text('주문수', 135, y + 5, { align: 'right' });
      doc.text('취소율', 155, y + 5, { align: 'right' });
      y += 9;
      topCategories.forEach((cat, i) => {
        if (i % 2 === 0) { doc.setFillColor(248, 249, 250); doc.rect(20, y - 4, pageW - 40, 7, 'F'); }
        doc.setFontSize(8);
        doc.setTextColor(40, 40, 40);
        doc.text(`${i + 1}`, 24, y);
        doc.text(cat.categoryName, 32, y);
        doc.text(fmtCurrency(cat.totalSalesAmount), 90, y, { align: 'right' });
        doc.text(fmtNumber(cat.totalQuantity), 115, y, { align: 'right' });
        doc.text(fmtNumber(cat.totalOrders), 135, y, { align: 'right' });
        doc.text(fmtPercent(cat.cancelRate), 155, y, { align: 'right' });
        y += 7;
      });
      break;
    }
    case 'top-products': {
      doc.setFillColor(3, 199, 90);
      doc.rect(20, y, pageW - 40, 7, 'F');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('#', 24, y + 5);
      doc.text('상품명', 32, y + 5);
      doc.text('카테고리', 85, y + 5);
      doc.text('매출', 130, y + 5, { align: 'right' });
      doc.text('수량', 150, y + 5, { align: 'right' });
      doc.text('단가', 175, y + 5, { align: 'right' });
      y += 9;
      topProducts.forEach((p, i) => {
        if (y > 275) { addFtr(2); doc.addPage(); addHdr('매출 Top 20 (계속)'); y = 24; }
        if (i % 2 === 0) { doc.setFillColor(248, 249, 250); doc.rect(20, y - 4, pageW - 40, 7, 'F'); }
        doc.setFontSize(8);
        doc.setTextColor(40, 40, 40);
        doc.text(`${i + 1}`, 24, y);
        doc.text(p.productName.substring(0, 30), 32, y);
        doc.setTextColor(100, 100, 100);
        doc.text(p.categoryName, 85, y);
        doc.setTextColor(40, 40, 40);
        doc.text(fmtCurrency(p.actualSalesAmount || 0), 130, y, { align: 'right' });
        doc.text(fmtNumber(p.salesQuantity || 0), 150, y, { align: 'right' });
        doc.text(fmtCurrency(p.actualUnitPrice || 0), 175, y, { align: 'right' });
        y += 7;
      });
      break;
    }
    case 'channel-payment': {
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('주문 채널', 22, y + 4);
      y += 10;
      [
        ['매장 내', fmtPercent(dineInPct), `${fmtNumber(totalDineInOrders)}건`],
        ['포장', fmtPercent(takeoutPct), `${fmtNumber(totalTakeoutOrders)}건`],
        ['배달', fmtPercent(deliveryPct), `${fmtNumber(totalDeliveryOrders)}건`],
      ].forEach(([label, pct, count]) => {
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(22, y - 2, pageW - 44, 10, 1, 1, 'F');
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.text(label, 28, y + 4);
        doc.setFontSize(12);
        doc.text(pct, 100, y + 4, { align: 'right' });
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(count, 140, y + 4, { align: 'right' });
        y += 12;
      });

      y += 5;
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('결제 수단', 22, y + 4);
      y += 10;
      [
        ['카드', fmtPercent(cardRatio), fmtCurrency(totalCardPayment)],
        ['현금', fmtPercent(cashRatio), fmtCurrency(totalCashPayment)],
        ['기타', fmtPercent(Math.max(0, 100 - cardRatio - cashRatio)), fmtCurrency(totalRevenue - totalCardPayment - totalCashPayment)],
      ].forEach(([label, pct, amount]) => {
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(22, y - 2, pageW - 44, 10, 1, 1, 'F');
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.text(label, 28, y + 4);
        doc.setFontSize(12);
        doc.text(pct, 100, y + 4, { align: 'right' });
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(amount, 160, y + 4, { align: 'right' });
        y += 12;
      });
      break;
    }
    case 'recommendations': {
      if (recommendations.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('추천 항목이 없습니다.', pageW / 2, 100, { align: 'center' });
      } else {
        recommendations.slice(0, 10).forEach((rec, i) => {
          if (y > 260) { addFtr(2); doc.addPage(); addHdr('추천 인사이트 (계속)'); y = 24; }
          doc.setFillColor(248, 249, 250);
          doc.roundedRect(20, y - 2, pageW - 40, 18, 1, 1, 'F');
          doc.setFontSize(9);
          doc.setTextColor(3, 199, 90);
          doc.text(rec.type, 24, y + 3);
          doc.setFontSize(10);
          doc.setTextColor(30, 41, 59);
          doc.text(rec.productName, 24, y + 9);
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(rec.suggestedAction.substring(0, 60), 24, y + 14);
          doc.setTextColor(3, 199, 90);
          doc.text(`신뢰도 ${fmtPercent(rec.confidence * 100)}`, pageW - 24, y + 3, { align: 'right' });
          y += 20;
        });
      }
      break;
    }
  }

  addFtr(2);
  const base = fileName.replace(/\.[^/.]+$/, '');
  doc.save(`${base}_${sectionTitles[sectionId] || sectionId}.pdf`);
}
