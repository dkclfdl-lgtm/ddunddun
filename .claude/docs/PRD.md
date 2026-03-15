# PRD: 뚠뚠 (DDUNDDUN) - 외식 프랜차이즈 운영 지원 대시보드

> **Product Requirements Document v1.0**
> 최종 수정일: 2026-03-15

---

## 1. 제품 개요

### 1.1 제품명
**뚠뚠 (DDUNDDUN)** - F&B 브랜드 운영 대시보드

### 1.2 한 줄 요약
외식 프랜차이즈 본사 및 가맹점주를 위한 **통합 운영 지원 도구**로, 매출/매장/직원/재고/고객 데이터를 한눈에 관리하고 데이터 기반 의사결정을 지원하는 웹 대시보드.

### 1.3 목표 사용자
| 사용자 유형 | 설명 |
|------------|------|
| **본사 관리자** | 전체 브랜드 매출, 가맹점 현황, KPI 모니터링 |
| **지역 관리자 (SV)** | 담당 지역 매장 관리, 점검 보고서 작성 |
| **가맹점주** | 자기 매장 매출/재고/직원 관리 |
| **매장 매니저** | 일일 운영, 재고 입출고, 스케줄 관리 |

### 1.4 핵심 가치
- **데이터 시각화**: 복잡한 운영 데이터를 직관적 차트/그래프로 제공
- **실시간 모니터링**: 매출, 재고, 주문 현황 실시간 업데이트
- **의사결정 지원**: 트렌드 분석, 이상 감지, 예측 인사이트
- **운영 효율화**: 반복 업무 자동화, 체크리스트, 알림 시스템

---

## 2. 기술 스택

### 2.1 프론트엔드 (Core)
| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 15.x | App Router, SSR/SSG, API Routes |
| **React** | 19.x | UI 라이브러리 |
| **TypeScript** | 5.x | 타입 안전성 |
| **Tailwind CSS** | 3.4.x | 유틸리티 퍼스트 스타일링 |
| **shadcn/ui** | latest | 접근성 준수 UI 컴포넌트 |

### 2.2 상태 관리 & 데이터
| 기술 | 용도 |
|------|------|
| **@tanstack/react-query** | 서버 상태 관리, 캐싱, 동기화 |
| **zustand** | 클라이언트 전역 상태 (사이드바, 필터 등) |
| **react-hook-form + zod** | 폼 관리 및 유효성 검증 |
| **axios** | HTTP 클라이언트 |

### 2.3 차트 & 데이터 시각화 (추가 필요)
| 기술 | 용도 |
|------|------|
| **recharts** | React 기반 차트 라이브러리 (Bar, Line, Pie, Area 등) |
| **@tanstack/react-table** | 고성능 데이터 테이블, 정렬/필터/페이지네이션 |

### 2.4 추가 UI/UX 라이브러리 (추가 필요)
| 기술 | 용도 |
|------|------|
| **framer-motion** | 페이지 전환, 카드 애니메이션 (이미 설치됨) |
| **react-day-picker** | 날짜 범위 선택기 (매출 기간 조회) |
| **cmdk** | 커맨드 팔레트 (빠른 검색/탐색) |
| **sonner** | 토스트 알림 (세련된 알림 UI) |
| **@hello-pangea/dnd** | 드래그 앤 드롭 (체크리스트, 작업 순서 변경) |
| **react-hotkeys-hook** | 키보드 단축키 지원 |

### 2.5 유틸리티 (기존 + 추가)
| 기술 | 용도 |
|------|------|
| **date-fns** | 날짜 포맷팅/계산 (이미 설치됨) |
| **es-toolkit** | 유틸리티 함수 (이미 설치됨) |
| **ts-pattern** | 패턴 매칭 (이미 설치됨) |
| **lucide-react** | 아이콘 (이미 설치됨) |
| **next-themes** | 다크모드 지원 (이미 설치됨) |
| **numbro** | 숫자 포맷팅 (통화, 퍼센트 표시) |

### 2.6 백엔드 & 인프라
| 기술 | 용도 |
|------|------|
| **Supabase** | PostgreSQL DB, Auth, Realtime, Storage, Edge Functions |
| **Vercel** | 배포, Edge Network, Analytics |
| **Supabase Auth** | 사용자 인증 (이메일, OAuth) |
| **Supabase Realtime** | 실시간 데이터 구독 (주문, 알림) |
| **Supabase Storage** | 파일 업로드 (메뉴 이미지, 보고서) |

### 2.7 개발 도구 (추가 필요)
| 기술 | 용도 |
|------|------|
| **prettier** | 코드 포매팅 |
| **husky + lint-staged** | 커밋 전 린트/포맷 자동화 |
| **@supabase/supabase-js** | Supabase 클라이언트 |
| **@supabase/ssr** | Supabase SSR 헬퍼 |

---

## 3. 디자인 시스템

### 3.1 디자인 컨셉
**네이버(Naver.com) 스타일 + 통계 대시보드 융합**

- **색상**: 네이버의 그린(#03C75A) 계열을 메인 컬러로, 화이트 배경 기반 클린 디자인
- **레이아웃**: 네이버처럼 좌측 사이드바 + 상단 탑바 + 카드 기반 콘텐츠 영역
- **폰트**: Pretendard (한글 최적화 산세리프)
- **카드**: 둥근 모서리, 그림자가 가벼운 카드 UI로 데이터 섹션 구분
- **데이터 밀도**: 통계 대시보드처럼 한 화면에 많은 정보를 깔끔하게 배치

### 3.2 컬러 팔레트
```
Primary (Naver Green):  #03C75A / HSL(148, 97%, 39%)
Primary Hover:          #02B351
Primary Light:          #E8F9EF
Secondary:              #1EC800 (보조 그린)
Background:             #F5F6F8 (네이버 회색 배경)
Surface (Card):         #FFFFFF
Text Primary:           #1E1E1E
Text Secondary:         #666666
Text Tertiary:          #999999
Border:                 #E5E8EB
Danger:                 #FF4444
Warning:                #FFAA00
Success:                #03C75A
Info:                   #1A73E8
```

### 3.3 레이아웃 구조
```
┌──────────────────────────────────────────────────┐
│  Top Navigation Bar (로고, 검색, 알림, 프로필)     │
├────────┬─────────────────────────────────────────┤
│        │  Breadcrumb / Page Title                │
│  Side  │─────────────────────────────────────────│
│  bar   │                                         │
│        │  [Summary Cards Row]                    │
│  Nav   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│        │  │ 매출  │ │ 주문  │ │ 고객  │ │ 재고  │  │
│  Menu  │  └──────┘ └──────┘ └──────┘ └──────┘  │
│        │                                         │
│        │  [Charts Section]                       │
│        │  ┌────────────────┐ ┌────────────────┐  │
│        │  │  매출 트렌드    │ │  카테고리별 매출 │  │
│        │  └────────────────┘ └────────────────┘  │
│        │                                         │
│        │  [Data Table Section]                   │
│        │  ┌──────────────────────────────────┐   │
│        │  │  매장별 매출 현황 테이블           │   │
│        │  └──────────────────────────────────┘   │
└────────┴─────────────────────────────────────────┘
```

### 3.4 반응형 브레이크포인트
| 브레이크포인트 | 값 | 설명 |
|--------------|------|------|
| Mobile | < 768px | 사이드바 숨김, 하단 탭 네비게이션 |
| Tablet | 768px - 1024px | 접힌 사이드바 (아이콘만) |
| Desktop | 1024px - 1440px | 펼친 사이드바 |
| Wide | > 1440px | 넓은 카드 그리드 |

---

## 4. 핵심 기능 (Features)

### 4.1 인증 & 권한 (Auth)
**Feature: `auth`**
- 이메일/비밀번호 로그인
- OAuth 로그인 (Google, Kakao)
- 역할 기반 접근 제어 (RBAC): 본사 관리자, SV, 가맹점주, 매장 매니저
- 비밀번호 재설정
- 세션 관리

### 4.2 대시보드 홈 (Dashboard)
**Feature: `dashboard`**
- **KPI 요약 카드**: 오늘 매출, 주문 수, 객단가, 전일 대비 증감률
- **매출 트렌드 차트**: 일별/주별/월별 매출 라인 차트
- **매장별 매출 순위**: 상위/하위 매장 랭킹 (Bar Chart)
- **카테고리별 매출 비중**: 메뉴 카테고리 파이 차트
- **실시간 알림 피드**: 재고 부족, 매출 이상, 점검 일정 등
- **날짜 범위 필터**: 오늘/이번 주/이번 달/커스텀 범위

### 4.3 매장 관리 (Store Management)
**Feature: `stores`**
- **매장 목록**: 테이블 + 카드 뷰 토글, 검색/필터/정렬
- **매장 상세**: 기본 정보, 위치(지도), 운영 상태, 계약 정보
- **매장 등록/수정**: 폼 기반 매장 정보 입력
- **매장 상태 관리**: 운영중/휴업/폐업/준비중
- **매장 비교**: 2~4개 매장 KPI 비교 차트

### 4.4 매출 분석 (Sales Analytics)
**Feature: `sales`**
- **매출 개요**: 기간별 매출 합계, 평균, 트렌드
- **시간대별 분석**: 히트맵으로 시간대별 매출 패턴 시각화
- **요일별 분석**: 요일별 매출 비교
- **메뉴별 분석**: 메뉴 아이템별 매출/수량 순위
- **매출 비교**: 전월 대비, 전년 동기 대비
- **목표 달성률**: 매장별/지역별 목표 대비 실적
- **CSV/Excel 내보내기**: 보고서 다운로드

### 4.5 메뉴 관리 (Menu Management)
**Feature: `menu`**
- **메뉴 카테고리**: 카테고리 CRUD (음료, 식사, 디저트, 사이드 등)
- **메뉴 아이템**: 이름, 가격, 이미지, 설명, 옵션, 영양 정보
- **메뉴 가격 관리**: 가격 변경 이력, 일괄 가격 조정
- **시즌/이벤트 메뉴**: 기간 한정 메뉴 관리
- **메뉴 활성화/비활성화**: 매장별 메뉴 on/off

### 4.6 재고 관리 (Inventory)
**Feature: `inventory`**
- **재고 현황**: 매장별 원자재/식재료 재고 수량
- **입출고 기록**: 입고/출고/폐기 이력 관리
- **재고 알림**: 최소 재고량 이하 시 자동 알림
- **발주 관리**: 발주서 생성/승인/이력
- **원가 분석**: 원자재 원가 추이, 메뉴별 원가율

### 4.7 직원 관리 (Staff)
**Feature: `staff`**
- **직원 목록**: 매장별 직원 현황
- **근무 스케줄**: 주간/월간 스케줄 캘린더
- **근태 관리**: 출퇴근 기록, 초과근무, 휴가
- **인건비 분석**: 매장별/월별 인건비 현황

### 4.8 매장 점검 (Inspection)
**Feature: `inspection`**
- **점검 체크리스트**: 위생/안전/서비스 체크리스트 템플릿
- **점검 보고서**: SV가 작성하는 매장 점검 보고서
- **개선 사항 추적**: 지적 사항 → 개선 완료 추적
- **점검 일정**: 캘린더 기반 점검 스케줄

### 4.9 고객 & 리뷰 (Customer)
**Feature: `customers`**
- **고객 분석**: 신규/재방문 고객 비율, 고객 세그먼트
- **리뷰 모니터링**: 배달앱/네이버/구글 리뷰 통합 조회
- **리뷰 감성 분석**: 긍정/부정/중립 분류
- **고객 피드백 관리**: VOC 접수/처리/완료 트래킹

### 4.10 알림 & 공지 (Notifications)
**Feature: `notifications`**
- **실시간 알림**: 재고 부족, 매출 이상, 점검 결과 등
- **공지사항**: 본사 → 가맹점 공지 게시판
- **알림 설정**: 사용자별 알림 수신 채널 (웹, 이메일)

### 4.11 설정 (Settings)
**Feature: `settings`**
- **프로필 관리**: 개인 정보 수정, 비밀번호 변경
- **브랜드 설정**: 브랜드 로고, 이름, 기본 설정
- **권한 관리**: 역할별 기능 접근 권한 설정
- **시스템 설정**: 통화, 시간대, 언어 설정

---

## 5. 데이터베이스 스키마 (Supabase)

### 5.1 핵심 테이블
```sql
-- 브랜드
brands (id, name, logo_url, created_at)

-- 사용자 & 역할
profiles (id, user_id, brand_id, name, email, phone, role, avatar_url, created_at)
roles: 'admin' | 'supervisor' | 'owner' | 'manager'

-- 매장
stores (id, brand_id, name, address, phone, lat, lng, status, opening_date, owner_id, created_at)
store_status: 'active' | 'inactive' | 'closed' | 'preparing'

-- 메뉴
menu_categories (id, brand_id, name, sort_order, created_at)
menu_items (id, category_id, name, price, cost_price, image_url, description, is_active, created_at)

-- 매출
sales_daily (id, store_id, date, total_revenue, total_orders, avg_order_value, created_at)
sales_hourly (id, store_id, date, hour, revenue, orders, created_at)
sales_by_menu (id, store_id, menu_item_id, date, quantity, revenue, created_at)

-- 재고
inventory (id, store_id, item_name, category, quantity, unit, min_quantity, cost_per_unit, updated_at)
inventory_logs (id, inventory_id, type, quantity, note, created_by, created_at)
inventory_type: 'in' | 'out' | 'waste' | 'adjust'

-- 직원
staff (id, store_id, name, position, phone, hourly_wage, status, created_at)
schedules (id, staff_id, store_id, date, start_time, end_time, created_at)
attendance (id, staff_id, store_id, date, check_in, check_out, created_at)

-- 점검
inspection_templates (id, brand_id, name, items, created_at)
inspections (id, store_id, template_id, inspector_id, date, score, status, notes, created_at)
inspection_items (id, inspection_id, item_name, is_passed, note, image_url)

-- 고객/리뷰
reviews (id, store_id, source, rating, content, sentiment, reply, created_at)
review_source: 'naver' | 'google' | 'baemin' | 'yogiyo' | 'coupangeats' | 'direct'

-- 알림/공지
notifications (id, user_id, type, title, message, is_read, created_at)
announcements (id, brand_id, title, content, author_id, is_pinned, created_at)
```

### 5.2 Row Level Security (RLS)
- 본사 관리자: 브랜드 내 모든 데이터 접근
- SV: 담당 지역 매장 데이터 접근
- 가맹점주: 자신의 매장 데이터만 접근
- 매장 매니저: 자신의 매장 운영 데이터만 접근

---

## 6. 페이지 라우팅 구조

```
/                           → 랜딩 페이지 (비로그인)
/login                      → 로그인
/signup                     → 회원가입
/forgot-password            → 비밀번호 찾기

/dashboard                  → 대시보드 홈 (KPI 요약)
/dashboard/sales            → 매출 분석 상세

/stores                     → 매장 목록
/stores/[storeId]           → 매장 상세
/stores/[storeId]/edit      → 매장 정보 수정
/stores/new                 → 매장 신규 등록

/menu                       → 메뉴 관리
/menu/categories            → 카테고리 관리
/menu/items                 → 메뉴 아이템 관리
/menu/items/[itemId]        → 메뉴 상세/수정

/inventory                  → 재고 현황
/inventory/[storeId]        → 매장별 재고 상세
/inventory/orders           → 발주 관리

/staff                      → 직원 관리
/staff/schedule             → 근무 스케줄
/staff/attendance           → 근태 관리

/inspection                 → 점검 관리
/inspection/new             → 점검 보고서 작성
/inspection/[inspectionId]  → 점검 보고서 상세
/inspection/templates       → 점검 템플릿 관리

/customers                  → 고객 분석
/customers/reviews          → 리뷰 모니터링

/notifications              → 알림 센터
/announcements              → 공지사항

/settings                   → 설정
/settings/profile           → 프로필 관리
/settings/brand             → 브랜드 설정
/settings/permissions       → 권한 관리
```

---

## 7. API 엔드포인트 설계

### 7.1 Next.js API Routes (app/api/)
```
GET/POST   /api/auth/*              → Supabase Auth 처리
GET        /api/dashboard/summary   → KPI 요약 데이터
GET        /api/dashboard/trends    → 매출 트렌드 데이터

CRUD       /api/stores              → 매장 관리
CRUD       /api/menu/categories     → 메뉴 카테고리
CRUD       /api/menu/items          → 메뉴 아이템

CRUD       /api/inventory           → 재고 관리
POST       /api/inventory/logs      → 입출고 기록

CRUD       /api/staff               → 직원 관리
CRUD       /api/staff/schedules     → 스케줄 관리

CRUD       /api/inspections         → 점검 관리
GET        /api/reviews             → 리뷰 조회

GET/PATCH  /api/notifications       → 알림 관리
CRUD       /api/announcements       → 공지사항

GET        /api/reports/sales       → 매출 리포트
GET        /api/reports/export      → CSV/Excel 내보내기
```

---

## 8. 비기능 요구사항

### 8.1 성능
- 대시보드 초기 로딩: 3초 이내 (LCP)
- 차트 렌더링: 1초 이내
- API 응답 시간: 500ms 이내
- Lighthouse 성능 점수: 85+ 목표

### 8.2 보안
- Supabase RLS로 행 단위 데이터 접근 제어
- HTTPS 전용
- CSRF 보호
- XSS 방지 (React 기본 이스케이핑 + 추가 sanitize)
- 환경변수로 민감정보 관리 (.env.local)

### 8.3 접근성
- WCAG 2.1 AA 수준 준수
- 키보드 네비게이션 지원
- 스크린 리더 호환 (aria 속성)
- 색상 대비 4.5:1 이상

### 8.4 국제화
- 초기: 한국어만 지원
- 추후: 영어, 일본어 확장 고려 (next-intl 사용 가능)

---

## 9. 마일스톤 & 우선순위

### Phase 1: 핵심 (MVP) - 4주
1. 인증 & 권한 시스템
2. 대시보드 홈 (KPI 카드 + 매출 차트)
3. 매장 관리 (CRUD + 목록/상세)
4. 매출 분석 기본 (일별/월별 차트)
5. 공통 레이아웃 (사이드바, 탑바)

### Phase 2: 운영 도구 - 4주
6. 메뉴 관리
7. 재고 관리
8. 직원/스케줄 관리
9. 알림 시스템

### Phase 3: 분석 & 점검 - 3주
10. 매출 심화 분석 (시간대/메뉴별)
11. 매장 점검 시스템
12. 리뷰 모니터링
13. 보고서 내보내기

### Phase 4: 고도화 - 3주
14. 고객 세그먼트 분석
15. 실시간 알림 (Supabase Realtime)
16. 매장 비교 대시보드
17. 모바일 최적화 강화

---

## 10. 설치 필요 패키지 목록

### 추가 설치 필요
```bash
# 차트 라이브러리
npm install recharts

# 데이터 테이블
npm install @tanstack/react-table

# 날짜 선택기
npm install react-day-picker

# 커맨드 팔레트
npm install cmdk

# 토스트 알림
npm install sonner

# 드래그 앤 드롭
npm install @hello-pangea/dnd

# 키보드 단축키
npm install react-hotkeys-hook

# 숫자 포맷
npm install numbro

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# 개발 도구
npm install -D prettier husky lint-staged
```

### shadcn/ui 추가 컴포넌트
```bash
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add progress
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add command
npx shadcn@latest add navigation-menu
npx shadcn@latest add scroll-area
npx shadcn@latest add skeleton
npx shadcn@latest add switch
npx shadcn@latest add tooltip
npx shadcn@latest add alert
npx shadcn@latest add collapsible
```

---

## 11. 환경변수 (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=뚠뚠 (DDUNDDUN)

# Vercel Analytics (자동 설정)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=auto
```
