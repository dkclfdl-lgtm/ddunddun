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
  const { jsPDF } = await import('jspdf');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

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
      x: 0.6, y: 0.4, w: 8.8, h: 0.4,
      fontSize: 11, color: 'ccffdd', align: 'center', charSpacing: 3,
    });

    // 메인 타이틀
    slide.addText('POS 판매 통계 리포트', {
      x: 0.6, y: 1.4, w: 8.8, h: 1.2,
      fontSize: 38, bold: true, color: C.white, align: 'center',
    });

    // 구분선
    slide.addShape(prs.ShapeType.rect, {
      x: 3.5, y: 2.75, w: 3, h: 0.04, fill: { color: 'ccffdd' },
    });

    // 파일명
    slide.addText(fileName, {
      x: 0.6, y: 3.1, w: 8.8, h: 0.5,
      fontSize: 14, color: 'ccffdd', align: 'center',
    });

    // 통계 요약
    slide.addText(`총 ${fmtNumber(data.length)}개 상품  |  ${categories.length}개 카테고리  |  분석일: ${reportDate}`, {
      x: 0.6, y: 3.8, w: 8.8, h: 0.35,
      fontSize: 11, color: 'aaffd0', align: 'center',
    });

    // 하단 장식
    slide.addShape(prs.ShapeType.rect, {
      x: 0, y: 7.0, w: '100%', h: 0.5, fill: { color: C.primaryDark },
    });
    slide.addText('Confidential · Internal Use Only', {
      x: 0.5, y: 7.05, w: 9, h: 0.4,
      fontSize: 9, color: 'aaffd0', align: 'center',
    });
  }

  // ── 슬라이드 2: 핵심 지표 ──────────────────────
  {
    const slide = prs.addSlide();

    // 헤더 바
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.75, fill: { color: C.dark } });
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.75, fill: { color: C.primary } });
    slide.addText('핵심 지표 요약', {
      x: 0.3, y: 0, w: 9, h: 0.75, fontSize: 18, bold: true, color: C.white,
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
      const x = 0.2 + col * 3.22;
      const y = 1.0 + row * 1.6;

      slide.addShape(prs.ShapeType.roundRect, {
        x, y, w: 3.1, h: 1.4,
        fill: { color: C.lightBg },
        line: { color: C.border, pt: 0.5 },
        rectRadius: 0.08,
      });
      slide.addShape(prs.ShapeType.rect, {
        x, y, w: 0.05, h: 1.4, fill: { color: kpi.color },
      });

      slide.addText(kpi.label, {
        x: x + 0.2, y: y + 0.18, w: 2.8, h: 0.25, fontSize: 9, color: C.gray,
      });
      slide.addText(kpi.value, {
        x: x + 0.2, y: y + 0.5, w: 2.8, h: 0.55, fontSize: 20, bold: true, color: kpi.color,
      });
      slide.addText(kpi.sub, {
        x: x + 0.2, y: y + 1.1, w: 2.8, h: 0.22, fontSize: 8, color: C.gray,
      });
    });
  }

  // ── 슬라이드 3: 카테고리 분석 ──────────────────
  {
    const slide = prs.addSlide();

    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.75, fill: { color: C.dark } });
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.75, fill: { color: C.primary } });
    slide.addText('카테고리별 매출 현황  (Top 10)', {
      x: 0.3, y: 0, w: 9, h: 0.75, fontSize: 18, bold: true, color: C.white,
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
        { text: `${fmtPercent(cat.dineInRatio)}/${fmtPercent(cat.takeoutRatio)}/${fmtPercent(cat.deliveryRatio)}`, options: { ...fill, fontSize: 8, color: C.gray, align: 'center' as const } },
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
        x: 0.2, y: 0.9, w: 9.6,
        rowH: 0.38,
        colW: [0.4, 2.2, 1.9, 1.3, 1.2, 1.0, 1.6],
        fontSize: 10,
        border: { type: 'solid', color: C.border, pt: 0.5 },
      }
    );
  }

  // ── 슬라이드 4: 매출 Top 20 ───────────────────
  {
    const slide = prs.addSlide();

    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.75, fill: { color: C.dark } });
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.75, fill: { color: C.primary } });
    slide.addText('매출 Top 20 상품', {
      x: 0.3, y: 0, w: 9, h: 0.75, fontSize: 18, bold: true, color: C.white,
    });

    const hdrOpts = (align: 'left' | 'center' | 'right' = 'center') => ({
      bold: true, color: C.white, fill: { color: C.dark }, align, valign: 'middle' as const,
    });

    const rows = topProducts.map((p, i) => {
      const fill = { color: i % 2 === 0 ? C.white : C.lightBg };
      return [
        { text: `${i + 1}`, options: { ...fill, bold: i < 3, color: i < 3 ? C.primary : C.dark, align: 'center' as const } },
        { text: p.productName, options: { ...fill, bold: i < 3 } },
        { text: p.categoryName, options: { ...fill, color: C.gray, fontSize: 9 } },
        { text: fmtCurrency(p.actualSalesAmount || 0), options: { ...fill, align: 'right' as const } },
        { text: fmtNumber(p.salesQuantity || 0), options: { ...fill, align: 'right' as const } },
        { text: fmtCurrency(p.actualUnitPrice || 0), options: { ...fill, align: 'right' as const, color: C.gray, fontSize: 9 } },
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
        x: 0.2, y: 0.9, w: 9.6,
        rowH: 0.28,
        colW: [0.4, 3.0, 1.8, 1.9, 1.3, 1.2],
        fontSize: 9.5,
        border: { type: 'solid', color: C.border, pt: 0.5 },
      }
    );
  }

  // ── 슬라이드 5: 채널 + 결제 분석 ──────────────
  {
    const slide = prs.addSlide();

    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.75, fill: { color: C.dark } });
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.75, fill: { color: C.primary } });
    slide.addText('채널별 · 결제 수단 분석', {
      x: 0.3, y: 0, w: 9, h: 0.75, fontSize: 18, bold: true, color: C.white,
    });

    // ─ 채널 ─
    slide.addText('주문 채널 분석', {
      x: 0.3, y: 0.9, w: 4, h: 0.3, fontSize: 11, bold: true, color: C.dark,
    });

    const channels = [
      { label: '매장 내', pct: dineInPct, count: totalDineInOrders, color: C.blue },
      { label: '포장', pct: takeoutPct, count: totalTakeoutOrders, color: C.amber },
      { label: '배달', pct: deliveryPct, count: totalDeliveryOrders, color: C.red },
    ];

    channels.forEach((ch, i) => {
      const x = 0.2 + i * 1.65;
      const y = 1.3;

      slide.addShape(prs.ShapeType.roundRect, {
        x, y, w: 1.5, h: 2.2,
        fill: { color: C.lightBg },
        line: { color: ch.color, pt: 1.5 },
        rectRadius: 0.08,
      });
      slide.addShape(prs.ShapeType.rect, {
        x, y, w: 1.5, h: 0.06, fill: { color: ch.color },
      });

      slide.addText(ch.label, {
        x, y: y + 0.2, w: 1.5, h: 0.3,
        fontSize: 11, bold: true, color: ch.color, align: 'center',
      });
      slide.addText(fmtPercent(ch.pct), {
        x, y: y + 0.65, w: 1.5, h: 0.65,
        fontSize: 24, bold: true, color: C.dark, align: 'center',
      });
      slide.addText(`${fmtNumber(ch.count)}건`, {
        x, y: y + 1.5, w: 1.5, h: 0.35,
        fontSize: 9, color: C.gray, align: 'center',
      });
    });

    // 채널 합계
    slide.addText(`전체 채널 주문: ${fmtNumber(totalChannelOrders)}건`, {
      x: 0.2, y: 3.65, w: 4.7, h: 0.3,
      fontSize: 9, color: C.gray, align: 'center',
    });

    // ─ 구분선 ─
    slide.addShape(prs.ShapeType.rect, {
      x: 5.1, y: 0.85, w: 0.05, h: 3.2, fill: { color: C.border },
    });

    // ─ 결제 수단 ─
    slide.addText('결제 수단 분석', {
      x: 5.4, y: 0.9, w: 4, h: 0.3, fontSize: 11, bold: true, color: C.dark,
    });

    const payments = [
      { label: '카드', pct: cardRatio, amount: totalCardPayment, color: C.purple },
      { label: '현금', pct: cashRatio, amount: totalCashPayment, color: C.green },
      { label: '기타', pct: otherRatio, amount: totalRevenue - totalCardPayment - totalCashPayment, color: C.gray },
    ];

    payments.forEach((pm, i) => {
      const x = 5.4 + i * 1.5;
      const y = 1.3;

      slide.addShape(prs.ShapeType.roundRect, {
        x, y, w: 1.4, h: 2.2,
        fill: { color: C.lightBg },
        line: { color: pm.color, pt: 1.5 },
        rectRadius: 0.08,
      });
      slide.addShape(prs.ShapeType.rect, {
        x, y, w: 1.4, h: 0.06, fill: { color: pm.color },
      });

      slide.addText(pm.label, {
        x, y: y + 0.2, w: 1.4, h: 0.3,
        fontSize: 11, bold: true, color: pm.color, align: 'center',
      });
      slide.addText(fmtPercent(pm.pct), {
        x, y: y + 0.65, w: 1.4, h: 0.65,
        fontSize: 24, bold: true, color: C.dark, align: 'center',
      });
      slide.addText(fmtCurrency(pm.amount), {
        x, y: y + 1.5, w: 1.4, h: 0.35,
        fontSize: 8, color: C.gray, align: 'center',
      });
    });

    slide.addText(`총 결제금액: ${fmtCurrency(totalRevenue)}`, {
      x: 5.4, y: 3.65, w: 4.2, h: 0.3,
      fontSize: 9, color: C.gray, align: 'center',
    });

    // ─ 하단 인사이트 ─
    slide.addShape(prs.ShapeType.roundRect, {
      x: 0.2, y: 4.1, w: 9.6, h: 0.6,
      fill: { color: C.lightBg }, line: { color: C.primary, pt: 1 }, rectRadius: 0.06,
    });
    slide.addText(
      `카드 결제 비중 ${fmtPercent(cardRatio)}  |  매장 내 주문 비중 ${fmtPercent(dineInPct)}  |  회원 매출 비중 ${fmtPercent(memberRatio)}`,
      {
        x: 0.4, y: 4.1, w: 9.2, h: 0.6,
        fontSize: 10, color: C.dark, align: 'center', bold: false,
      }
    );
  }

  // ── 슬라이드 6: 추천 인사이트 ─────────────────
  if (recommendations.length > 0) {
    const slide = prs.addSlide();

    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.75, fill: { color: C.dark } });
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 0.75, fill: { color: C.primary } });
    slide.addText('추천 인사이트', {
      x: 0.3, y: 0, w: 9, h: 0.75, fontSize: 18, bold: true, color: C.white,
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
      const y = 0.95 + i * 1.12;

      slide.addShape(prs.ShapeType.roundRect, {
        x: 0.2, y, w: 9.6, h: 0.96,
        fill: { color: C.lightBg },
        line: { color: color, pt: 1 },
        rectRadius: 0.06,
      });
      slide.addShape(prs.ShapeType.roundRect, {
        x: 0.2, y, w: 1.1, h: 0.96,
        fill: { color: color },
        rectRadius: 0.06,
      });

      slide.addText(label, {
        x: 0.2, y: y + 0.25, w: 1.1, h: 0.45,
        fontSize: 9, bold: true, color: C.white, align: 'center',
      });
      slide.addText(rec.productName, {
        x: 1.5, y: y + 0.1, w: 5.5, h: 0.35,
        fontSize: 11, bold: true, color: C.dark,
      });
      slide.addText(rec.suggestedAction, {
        x: 1.5, y: y + 0.5, w: 6.0, h: 0.3,
        fontSize: 9, color: C.gray,
      });
      slide.addText(`신뢰도 ${fmtPercent(rec.confidence * 100)}`, {
        x: 7.7, y: y + 0.28, w: 1.9, h: 0.4,
        fontSize: 10, bold: true, color: color, align: 'right',
      });
    });
  }

  const base = fileName.replace(/\.[^/.]+$/, '');
  await prs.writeFile({ fileName: `${base}_통계리포트.pptx` });
}
