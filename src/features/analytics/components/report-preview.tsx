'use client';

import { forwardRef } from 'react';
import type { ExcelProductData, CategorySummary, ProductRecommendation } from '../types';

interface ReportPreviewProps {
  data: ExcelProductData[];
  categories: CategorySummary[];
  recommendations: ProductRecommendation[];
  fileName: string;
  uploadedAt: string | null;
}

// inline style helpers
const C = {
  primary: '#03C75A',
  dark: '#1e293b',
  gray: '#64748b',
  lightBg: '#f1f5f9',
  border: '#e2e8f0',
  white: '#ffffff',
  red: '#ef4444',
  blue: '#3b82f6',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  green: '#22c55e',
};

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  price_increase: { label: '가격 인상', color: C.green },
  price_decrease: { label: '가격 인하', color: C.amber },
  promotion: { label: '프로모션', color: C.blue },
  bundle: { label: '번들', color: C.purple },
  discontinue: { label: '판매 중단', color: C.red },
  premium: { label: '프리미엄', color: C.amber },
};

function fmtCur(v: number) {
  if (v >= 100000000) return `${(v / 100000000).toFixed(1)}억원`;
  if (v >= 10000) return `${Math.round(v / 10000)}만원`;
  return `${v.toLocaleString()}원`;
}
function fmtNum(v: number) { return v.toLocaleString(); }
function fmtPct(v: number) { return `${v.toFixed(1)}%`; }

export const ReportPreview = forwardRef<HTMLDivElement, ReportPreviewProps>(
  function ReportPreview({ data, categories, recommendations, fileName }, ref) {
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

    const topProducts = [...data]
      .sort((a, b) => (b.actualSalesAmount || 0) - (a.actualSalesAmount || 0))
      .slice(0, 20);
    const topCategories = [...categories]
      .sort((a, b) => b.totalSalesAmount - a.totalSalesAmount)
      .slice(0, 10);

    const reportDate = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const kpis = [
      { label: '총 매출', value: fmtCur(totalRevenue), color: C.green },
      { label: '총 주문수', value: `${fmtNum(totalOrders)}건`, color: C.blue },
      { label: '평균 주문금액', value: fmtCur(Math.round(avgOrderValue)), color: C.amber },
      { label: '취소율', value: fmtPct(cancelRate), color: C.red },
      { label: '카드 결제 비율', value: fmtPct(cardRatio), color: C.purple },
      { label: '회원 매출 비율', value: fmtPct(memberRatio), color: C.cyan },
    ];

    return (
      <div
        ref={ref}
        style={{
          width: '794px',
          backgroundColor: C.white,
          fontFamily: "'Pretendard Variable', 'Pretendard', -apple-system, sans-serif",
          color: C.dark,
          lineHeight: '1.5',
        }}
      >
        {/* ── 표지 ── */}
        <div style={{
          background: `linear-gradient(135deg, ${C.primary} 0%, #00a040 100%)`,
          padding: '44px 56px 36px',
          color: C.white,
        }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.12em', opacity: 0.8, marginBottom: '6px' }}>
            TAMSAA · 뚠뚠  POS 판매 통계 분석
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            판매 통계 리포트
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 28px' }}>{fileName}</p>
          <div style={{ display: 'flex', gap: '28px', fontSize: '11px', opacity: 0.85 }}>
            <span>분석 일시: {reportDate}</span>
            <span>총 상품수: {fmtNum(data.length)}개</span>
            <span>카테고리: {categories.length}개</span>
          </div>
        </div>

        {/* ── 핵심 지표 ── */}
        <section style={{ padding: '32px 48px 24px' }}>
          <SectionTitle title="핵심 지표" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
            {kpis.map((kpi, i) => (
              <div key={i} style={{
                backgroundColor: C.lightBg,
                borderRadius: '8px',
                padding: '16px',
                borderLeft: `4px solid ${kpi.color}`,
              }}>
                <div style={{ fontSize: '10px', color: C.gray, marginBottom: '6px' }}>{kpi.label}</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 카테고리 분석 ── */}
        <section style={{ padding: '0 48px 28px' }}>
          <SectionTitle title="카테고리별 매출 현황 (Top 10)" />
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', fontSize: '11px' }}>
            <thead>
              <tr style={{ backgroundColor: C.dark, color: C.white }}>
                <Th style={{ width: '36px', textAlign: 'center' }}>#</Th>
                <Th style={{ textAlign: 'left' }}>카테고리</Th>
                <Th style={{ textAlign: 'right' }}>매출금액</Th>
                <Th style={{ textAlign: 'right' }}>판매수량</Th>
                <Th style={{ textAlign: 'right' }}>주문수</Th>
                <Th style={{ textAlign: 'right' }}>취소율</Th>
                <Th style={{ textAlign: 'center', fontSize: '9px' }}>매장/포장/배달</Th>
              </tr>
            </thead>
            <tbody>
              {topCategories.map((cat, i) => (
                <tr key={cat.categoryCode} style={{ backgroundColor: i % 2 === 0 ? C.white : C.lightBg }}>
                  <Td style={{ textAlign: 'center', fontWeight: i < 3 ? 700 : 400, color: i < 3 ? C.primary : C.dark }}>{i + 1}</Td>
                  <Td style={{ fontWeight: i < 3 ? 600 : 400 }}>{cat.categoryName}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 500 }}>{fmtCur(cat.totalSalesAmount)}</Td>
                  <Td style={{ textAlign: 'right' }}>{fmtNum(cat.totalQuantity)}</Td>
                  <Td style={{ textAlign: 'right' }}>{fmtNum(cat.totalOrders)}</Td>
                  <Td style={{ textAlign: 'right', color: cat.cancelRate > 5 ? C.red : C.dark }}>{fmtPct(cat.cancelRate)}</Td>
                  <Td style={{ textAlign: 'center', fontSize: '9px', color: C.gray }}>
                    {fmtPct(cat.dineInRatio)} / {fmtPct(cat.takeoutRatio)} / {fmtPct(cat.deliveryRatio)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── 매출 Top 20 상품 ── */}
        <section style={{ padding: '0 48px 28px' }}>
          <SectionTitle title="매출 Top 20 상품" />
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', fontSize: '11px' }}>
            <thead>
              <tr style={{ backgroundColor: C.dark, color: C.white }}>
                <Th style={{ width: '36px', textAlign: 'center' }}>#</Th>
                <Th style={{ textAlign: 'left' }}>상품명</Th>
                <Th style={{ textAlign: 'left' }}>카테고리</Th>
                <Th style={{ textAlign: 'right' }}>매출금액</Th>
                <Th style={{ textAlign: 'right' }}>판매수량</Th>
                <Th style={{ textAlign: 'right' }}>단가</Th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={`${p.productCode}-${i}`} style={{ backgroundColor: i % 2 === 0 ? C.white : C.lightBg }}>
                  <Td style={{ textAlign: 'center', fontWeight: i < 3 ? 700 : 400, color: i < 3 ? C.primary : C.dark }}>{i + 1}</Td>
                  <Td style={{ fontWeight: i < 3 ? 600 : 400 }}>{p.productName}</Td>
                  <Td style={{ color: C.gray, fontSize: '10px' }}>{p.categoryName}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 500 }}>{fmtCur(p.actualSalesAmount || 0)}</Td>
                  <Td style={{ textAlign: 'right' }}>{fmtNum(p.salesQuantity || 0)}</Td>
                  <Td style={{ textAlign: 'right', color: C.gray }}>{fmtCur(p.actualUnitPrice || 0)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── 채널 + 결제 분석 ── */}
        <section style={{ padding: '0 48px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <SectionTitle title="채널별 분석" />
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {[
                  { label: '매장 내', pct: dineInPct, count: totalDineInOrders, color: C.blue },
                  { label: '포장', pct: takeoutPct, count: totalTakeoutOrders, color: C.amber },
                  { label: '배달', pct: deliveryPct, count: totalDeliveryOrders, color: C.red },
                ].map((ch, i) => (
                  <div key={i} style={{
                    flex: 1, backgroundColor: C.lightBg, borderRadius: '8px',
                    padding: '14px 8px', textAlign: 'center', borderTop: `3px solid ${ch.color}`,
                  }}>
                    <div style={{ fontSize: '10px', color: C.gray, marginBottom: '4px' }}>{ch.label}</div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: ch.color }}>{fmtPct(ch.pct)}</div>
                    <div style={{ fontSize: '10px', color: C.gray, marginTop: '3px' }}>{fmtNum(ch.count)}건</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionTitle title="결제 수단 분석" />
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {[
                  { label: '카드', pct: cardRatio, color: C.purple },
                  { label: '현금', pct: cashRatio, color: C.green },
                  { label: '기타', pct: Math.max(0, 100 - cardRatio - cashRatio), color: C.gray },
                ].map((pm, i) => (
                  <div key={i} style={{
                    flex: 1, backgroundColor: C.lightBg, borderRadius: '8px',
                    padding: '14px 8px', textAlign: 'center', borderTop: `3px solid ${pm.color}`,
                  }}>
                    <div style={{ fontSize: '10px', color: C.gray, marginBottom: '4px' }}>{pm.label}</div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: pm.color }}>{fmtPct(pm.pct)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 추천 인사이트 ── */}
        {recommendations.length > 0 && (
          <section style={{ padding: '0 48px 40px' }}>
            <SectionTitle title="추천 인사이트 (Top 5)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              {recommendations.slice(0, 5).map((rec, i) => {
                const { label, color } = TYPE_MAP[rec.type] ?? { label: rec.type, color: C.gray };
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    backgroundColor: C.lightBg, borderRadius: '8px',
                    padding: '12px 14px', borderLeft: `4px solid ${color}`,
                  }}>
                    <span style={{
                      backgroundColor: color, color: C.white, fontSize: '9px',
                      fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                      whiteSpace: 'nowrap', marginTop: '2px',
                    }}>
                      {label}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '2px' }}>{rec.productName}</div>
                      <div style={{ color: C.gray, fontSize: '11px' }}>{rec.suggestedAction}</div>
                    </div>
                    <div style={{ fontSize: '10px', color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      신뢰도 {fmtPct(rec.confidence * 100)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 푸터 ── */}
        <div style={{
          backgroundColor: C.dark, padding: '14px 48px', color: C.white,
          fontSize: '10px', display: 'flex', justifyContent: 'space-between',
        }}>
          <span>뚠뚠 (TAMSAA) · POS 판매 통계 리포트</span>
          <span>{reportDate} 생성</span>
        </div>
      </div>
    );
  }
);

// ── 서브 컴포넌트 ──────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ fontSize: '13px', fontWeight: 700, color: C.dark, paddingBottom: '8px', borderBottom: `2px solid ${C.primary}`, display: 'inline-block' }}>
      {title}
    </div>
  );
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th style={{ padding: '8px 10px', fontSize: '10px', fontWeight: 600, ...style }}>
      {children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: '6px 10px', borderBottom: `1px solid ${C.border}`, ...style }}>
      {children}
    </td>
  );
}
