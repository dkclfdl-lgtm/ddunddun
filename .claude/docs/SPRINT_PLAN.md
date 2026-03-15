# 뚠뚠 (DDUNDDUN) Sprint Development Plan

> 최종 수정일: 2026-03-15
> 상태: Sprint 1 완료

## Context

PRD에 정의된 11개 feature 중 현재 구현된 것은 로그인 UI(인증 미연동)와 대시보드 홈(mock 데이터)뿐.
나머지 30+ 페이지, feature 모듈, API 라우트, DB 마이그레이션 전부 미구현.
6개 스프린트로 분리하여 순차 개발.

---

## Sprint 1: 공통 인프라 + 인증 + 매장 관리 ✅

> 공통 컴포넌트, mock auth, 첫 CRUD feature (Stores)
> **완료일: 2026-03-15**

### 1.1 공통 컴포넌트 (`src/components/common/`) ✅

| 파일 | 설명 |
|------|------|
| `data-table.tsx` | @tanstack/react-table 래퍼 (정렬/필터/페이지네이션) |
| `page-header.tsx` | 페이지 헤더 (제목, 설명, 액션 버튼) |
| `status-badge.tsx` | 상태 배지 |
| `date-range-picker.tsx` | 날짜 범위 선택기 |
| `confirm-dialog.tsx` | 확인 다이얼로그 |
| `empty-state.tsx` | 빈 상태 |
| `loading-skeleton.tsx` | 로딩 스켈레톤 |
| `search-input.tsx` | 디바운스 검색 |
| `index.ts` | 배럴 export |

### 1.2 유틸리티 ✅

| 파일 | 설명 |
|------|------|
| `src/lib/format.ts` | 통화/날짜/퍼센트 포맷터 |
| `src/lib/mock-data/stores.ts` | 매장 목 데이터 (10개) |
| `src/lib/mock-data/users.ts` | 사용자 목 데이터 (5개) |
| `src/lib/mock-data/index.ts` | 배럴 export |
| `src/hooks/use-debounce.ts` | 디바운스 훅 |
| `src/hooks/use-pagination.ts` | 페이지네이션 훅 |

### 1.3 인증 (mock) ✅

| 파일 | 설명 |
|------|------|
| `src/features/auth/types.ts` | AuthUser, LoginCredentials, SignupData 타입 |
| `src/features/auth/schema.ts` | zod 스키마 (login, signup, forgot-password) |
| `src/features/auth/mock-auth.ts` | 목 인증 서비스 |
| `src/features/auth/use-auth.ts` | zustand 인증 스토어 |
| `src/features/auth/components/login-form.tsx` | 로그인 폼 |
| `src/features/auth/components/signup-form.tsx` | 회원가입 폼 |
| `src/features/auth/components/forgot-password-form.tsx` | 비밀번호 찾기 폼 |
| `src/features/auth/index.ts` | 배럴 export |
| `src/app/(auth)/login/page.tsx` | 로그인 페이지 (리팩토링) |
| `src/app/(auth)/signup/page.tsx` | 회원가입 페이지 |
| `src/app/(auth)/forgot-password/page.tsx` | 비밀번호 찾기 페이지 |

### 1.4 매장 관리 (full CRUD) ✅

| 파일 | 설명 |
|------|------|
| `src/features/stores/types.ts` | StoreWithOwner, StoreFormData, StoreFilters 타입 |
| `src/features/stores/schema.ts` | zod 스키마 (매장 폼) |
| `src/features/stores/mock.ts` | 매장 목 데이터 + CRUD 헬퍼 |
| `src/features/stores/hooks.ts` | useStoreList, useStoreDetail, useStoreForm |
| `src/features/stores/components/store-table.tsx` | 매장 테이블 |
| `src/features/stores/components/store-grid.tsx` | 매장 그리드 카드 |
| `src/features/stores/components/store-filters.tsx` | 상태 필터 + 검색 + 뷰 토글 |
| `src/features/stores/components/store-form.tsx` | 매장 등록/수정 폼 |
| `src/features/stores/components/store-detail-info.tsx` | 매장 상세 정보 |
| `src/features/stores/components/store-stats.tsx` | 매장 통계 카드 |
| `src/app/(dashboard)/stores/page.tsx` | 매장 목록 (테이블+그리드 토글) |
| `src/app/(dashboard)/stores/new/page.tsx` | 매장 등록 |
| `src/app/(dashboard)/stores/[storeId]/page.tsx` | 매장 상세 |
| `src/app/(dashboard)/stores/[storeId]/edit/page.tsx` | 매장 수정 |

### 1.5 대시보드 개선 ✅

| 파일 | 설명 |
|------|------|
| `src/features/dashboard/components/kpi-card.tsx` | KPI 카드 컴포넌트 |
| `src/features/dashboard/components/revenue-chart.tsx` | 매출 트렌드 차트 |
| `src/features/dashboard/components/category-chart.tsx` | 카테고리별 매출 차트 |
| `src/features/dashboard/components/store-ranking-chart.tsx` | 매장 순위 차트 |
| `src/features/dashboard/components/recent-alerts.tsx` | 최근 알림 피드 |
| `src/app/(dashboard)/dashboard/page.tsx` | 대시보드 (날짜 필터 추가) |

---

## Sprint 2: 매출 분석 + 메뉴 관리 ⬜

### 2.1 매출 분석

| 파일 | 설명 |
|------|------|
| `src/features/sales/types.ts` | 매출 분석 타입 |
| `src/features/sales/mock.ts` | 매출 목 데이터 |
| `src/features/sales/hooks/` | overview, hourly, by-menu, comparison 훅 |
| `src/features/sales/components/` | 9개 컴포넌트 |
| `src/app/(dashboard)/dashboard/sales/page.tsx` | 매출 분석 페이지 (탭: 개요/시간대/메뉴별/비교/목표) |
| `src/components/charts/heatmap-chart.tsx` | 히트맵 차트 |

- CSV export 기능

### 2.2 메뉴 관리

| 파일 | 설명 |
|------|------|
| `src/features/menu/types.ts` | 메뉴 타입 |
| `src/features/menu/schema.ts` | zod 스키마 |
| `src/features/menu/mock.ts` | 메뉴 목 데이터 |
| `src/features/menu/hooks/` | categories, items, detail, form 훅 |
| `src/features/menu/components/` | 8개 컴포넌트 |
| `src/app/(dashboard)/menu/page.tsx` | 메뉴 관리 메인 |
| `src/app/(dashboard)/menu/categories/page.tsx` | 카테고리 관리 |
| `src/app/(dashboard)/menu/items/page.tsx` | 메뉴 아이템 목록 |
| `src/app/(dashboard)/menu/items/[itemId]/page.tsx` | 메뉴 상세/수정 |

- 드래그앤드롭 카테고리 정렬 (@hello-pangea/dnd)

---

## Sprint 3: 재고 관리 + 직원 관리 ⬜

### 3.1 재고 관리

| 파일 | 설명 |
|------|------|
| `src/features/inventory/types.ts` | 재고 타입 |
| `src/features/inventory/schema.ts` | zod 스키마 |
| `src/features/inventory/mock.ts` | 재고 목 데이터 |
| `src/features/inventory/hooks/` | 재고 훅 |
| `src/features/inventory/components/` | 9개 컴포넌트 |
| `src/app/(dashboard)/inventory/page.tsx` | 재고 현황 |
| `src/app/(dashboard)/inventory/[storeId]/page.tsx` | 매장별 재고 |
| `src/app/(dashboard)/inventory/orders/page.tsx` | 발주 관리 |

### 3.2 직원 관리

| 파일 | 설명 |
|------|------|
| `src/features/staff/types.ts` | 직원 타입 |
| `src/features/staff/schema.ts` | zod 스키마 |
| `src/features/staff/mock.ts` | 직원 목 데이터 |
| `src/features/staff/hooks/` | 직원 훅 |
| `src/features/staff/components/` | 9개 컴포넌트 |
| `src/app/(dashboard)/staff/page.tsx` | 직원 관리 |
| `src/app/(dashboard)/staff/schedule/page.tsx` | 주간 스케줄 캘린더 |
| `src/app/(dashboard)/staff/attendance/page.tsx` | 근태 관리 |

- 주간 스케줄 캘린더, 인건비 차트

---

## Sprint 4: 매장 점검 + 고객/리뷰 ⬜

### 4.1 매장 점검

| 파일 | 설명 |
|------|------|
| `src/features/inspection/types.ts` | 점검 타입 |
| `src/features/inspection/schema.ts` | zod 스키마 |
| `src/features/inspection/mock.ts` | 점검 목 데이터 |
| `src/features/inspection/hooks/` | 점검 훅 |
| `src/features/inspection/components/` | 9개 컴포넌트 |
| `src/app/(dashboard)/inspection/page.tsx` | 점검 관리 |
| `src/app/(dashboard)/inspection/new/page.tsx` | 점검 보고서 작성 |
| `src/app/(dashboard)/inspection/[inspectionId]/page.tsx` | 점검 상세 |
| `src/app/(dashboard)/inspection/templates/page.tsx` | 점검 템플릿 |

- 체크리스트 폼, 점수 게이지, 이슈 트래커

### 4.2 고객/리뷰

| 파일 | 설명 |
|------|------|
| `src/features/customers/types.ts` | 고객/리뷰 타입 |
| `src/features/customers/mock.ts` | 리뷰 목 데이터 |
| `src/features/customers/hooks/` | 고객/리뷰 훅 |
| `src/features/customers/components/` | 8개 컴포넌트 |
| `src/app/(dashboard)/customers/page.tsx` | 고객 분석 |
| `src/app/(dashboard)/customers/reviews/page.tsx` | 리뷰 모니터링 |

- 감성 분석 차트, 별점 분포, 리뷰 답글

---

## Sprint 5: 알림/공지 + 설정 + API Routes ⬜

### 5.1 알림/공지

| 파일 | 설명 |
|------|------|
| `src/features/notifications/types.ts` | 알림 타입 |
| `src/features/notifications/schema.ts` | zod 스키마 |
| `src/features/notifications/mock.ts` | 알림 목 데이터 |
| `src/features/notifications/hooks/` | 알림 훅 |
| `src/features/notifications/components/` | 6개 컴포넌트 |
| `src/app/(dashboard)/notifications/page.tsx` | 알림 센터 |
| `src/app/(dashboard)/announcements/page.tsx` | 공지사항 |

- TopBar 알림 카운트 연동

### 5.2 설정

| 파일 | 설명 |
|------|------|
| `src/features/settings/types.ts` | 설정 타입 |
| `src/features/settings/schema.ts` | zod 스키마 |
| `src/features/settings/mock.ts` | 설정 목 데이터 |
| `src/features/settings/hooks/` | 설정 훅 |
| `src/features/settings/components/` | 5개 컴포넌트 |
| `src/app/(dashboard)/settings/layout.tsx` | 설정 사이드 네비 |
| `src/app/(dashboard)/settings/page.tsx` | 설정 메인 |
| `src/app/(dashboard)/settings/profile/page.tsx` | 프로필 |
| `src/app/(dashboard)/settings/brand/page.tsx` | 브랜드 설정 |
| `src/app/(dashboard)/settings/permissions/page.tsx` | 권한 관리 |

### 5.3 API Routes (전체)

- `src/app/api/` 하위 30개 route.ts (모든 feature CRUD + reports/export)

---

## Sprint 6: Supabase 연동 + RBAC + 폴리시 ⬜

### 6.1 DB 마이그레이션

- `supabase/migrations/` 13개 SQL 파일 (테이블, RLS, 함수, 시드)

### 6.2 Supabase Auth 연동

- middleware 활성화, OAuth (Google/Kakao), 세션 관리
- mock-auth → Supabase auth 교체

### 6.3 데이터 서비스 레이어

- 각 feature의 `api.ts`에 Supabase 쿼리 구현 (mock 교체)

### 6.4 RBAC

| 파일 | 설명 |
|------|------|
| `src/lib/rbac.ts` | 역할 기반 접근 제어 로직 |
| `src/components/common/role-guard.tsx` | 역할 가드 컴포넌트 |

- 사이드바 메뉴 필터링

### 6.5 폴리시

- 커맨드 팔레트 (cmdk), 키보드 단축키
- 에러 바운더리, 404/에러 페이지
- 로딩 상태, sonner 토스트

---

## 개발 순서

```
Sprint 1 ✅ → Sprint 2 ⬜ → Sprint 3 ⬜ → Sprint 4 ⬜ → Sprint 5 ⬜ → Sprint 6 ⬜
```

각 스프린트는 독립 배포 가능. Sprint 1에서 확립한 패턴을 이후 스프린트에서 반복.

## 검증 방법

- 매 스프린트 후 `npm run build` 성공 확인
- 각 페이지 브라우저에서 수동 확인 (mock 데이터로 동작)
- Sprint 6 완료 후 Supabase 연동 E2E 테스트
