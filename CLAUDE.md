# CLAUDE.md - 뚠뚠 (DDUNDDUN) 프로젝트 규칙

## 프로젝트 개요
외식 프랜차이즈 운영 지원 대시보드. F&B 브랜드의 매출/매장/직원/재고/고객 데이터를 통합 관리하는 웹 애플리케이션.

## 문서 참조
- **PRD**: `.claude/docs/PRD.md` - 제품 요구사항 정의서
- **스프린트 계획**: `.claude/docs/SPRINT_PLAN.md` - 6개 스프린트 개발 계획 및 진행 상태
- **슬래시 커맨드**: `.claude/commands/` - feature, component, page, api, chart, migration, review, setup

## 기술 스택
- Next.js 15 (App Router, Turbopack), React 19, TypeScript 5
- Tailwind CSS 3.4 + shadcn/ui
- Supabase (DB, Auth, Realtime, Storage)
- Vercel 배포
- recharts (차트), @tanstack/react-table (테이블)

## 핵심 규칙

### 컴포넌트
- 모든 컴포넌트에 `'use client'` 디렉티브 사용
- page.tsx의 params props는 반드시 Promise로 처리
- 플레이스홀더 이미지는 picsum.photos 사용

### 디렉토리 구조
```
src/app/                          → Next.js App Router 페이지
src/components/ui/                → shadcn/ui 공통 컴포넌트
src/components/common/            → 커스텀 공통 컴포넌트 (DataTable, PageHeader 등)
src/components/layout/            → 레이아웃 컴포넌트 (Sidebar, TopBar 등)
src/components/charts/            → 재사용 차트 컴포넌트
src/constants/                    → 공통 상수
src/hooks/                        → 공통 훅
src/lib/                          → 유틸리티 함수
src/lib/format.ts                 → 통화/날짜/퍼센트 포맷터
src/lib/mock-data/                → 목 데이터
src/lib/supabase/                 → Supabase 클라이언트 설정
src/remote/                       → HTTP 클라이언트
src/types/                        → 공통 타입 정의
src/features/[featureName]/       → 기능별 모듈
  ├── components/
  ├── constants/
  ├── hooks/
  ├── lib/
  ├── types.ts
  ├── schema.ts
  ├── mock.ts
  └── api.ts
supabase/migrations/              → SQL 마이그레이션 파일
.claude/docs/                     → 프로젝트 문서 (PRD, 스프린트 계획)
.claude/commands/                 → 슬래시 커맨드
```

### 라이브러리 사용 규칙
| 용도 | 라이브러리 |
|------|-----------|
| 날짜 처리 | date-fns |
| 패턴 매칭 | ts-pattern |
| 서버 상태 | @tanstack/react-query |
| 글로벌 상태 | zustand |
| React 훅 | react-use |
| 유틸리티 | es-toolkit |
| 아이콘 | lucide-react |
| 스키마 검증 | zod |
| UI 컴포넌트 | shadcn/ui |
| 폼 관리 | react-hook-form + @hookform/resolvers |
| 차트 | recharts |
| 테이블 | @tanstack/react-table |
| 숫자 포맷 | numbro |
| HTTP | axios |
| 애니메이션 | framer-motion |

### 디자인 규칙
- 네이버 스타일 UI: #03C75A 그린 메인 컬러, #F5F6F8 회색 배경
- 좌측 사이드바 + 상단 탑바 레이아웃
- 카드 기반 데이터 섹션 구분
- 통계 대시보드처럼 높은 정보 밀도 + 깔끔한 배치
- 반응형: Mobile(<768px), Tablet(768-1024), Desktop(1024-1440), Wide(>1440)
- Pretendard 폰트 사용

### React 19 호환성 규칙 (필수)
- **`@hello-pangea/dnd` 사용 금지** → React 19 `setRef` 무한 루프 유발. 정렬이 필요하면 ↑↓ 버튼 또는 `@dnd-kit/core` 사용
- **`@radix-ui/react-compose-refs` 패치 적용됨** → `patches/` 폴더의 패치 유지. `npm install` 시 자동 적용 (postinstall)
- **`forwardRef` 콜백 ref에서 cleanup 반환 시 주의** → React 19에서 ref 콜백이 cleanup 함수를 반환할 수 있어 무한 루프 가능
- **이벤트 핸들러를 `useCallback`으로 감싸기** → 자식 컴포넌트에 전달하는 콜백은 반드시 `useCallback` 사용
- **`useEffect` 의존성에 인라인 객체/배열 금지** → `useMemo`로 안정화하거나 원시값만 사용
- **`useState` setter를 렌더 중 직접 호출 금지** → 반드시 `useEffect` 또는 이벤트 핸들러 내에서만 호출
- **새 라이브러리 추가 시 React 19 호환성 확인 필수** → `flushSync`, `findDOMNode` 사용하는 라이브러리는 호환성 문제 가능

### 코드 스타일
- TypeScript 필수, any 금지
- 함수형/불변성 패러다임 우선
- Early return 패턴
- 설명적 변수명 (한글 주석 허용)
- 컴포넌트 내 비즈니스 로직은 커스텀 훅으로 분리
- AI 생성 주석 최소화, 변수/함수명으로 의도 표현

### Supabase 규칙
- 새 테이블 필요 시 `/supabase/migrations/`에 `.sql` 파일 생성
- 로컬에서 supabase 실행 금지
- RLS 정책 필수 적용
- 클라이언트는 `src/lib/supabase/`에서 관리

### shadcn/ui 규칙
- 새 컴포넌트 필요 시 설치 명령어를 보여줄 것 (사용자가 직접 실행)
- 예: `npx shadcn@latest add [component-name]`

### 패키지 매니저
- npm 사용 (yarn/pnpm 금지)

### 한글 처리
- 코드 생성 후 UTF-8 기준 한글 깨짐 확인 필수
- **`.xls` 파일 파싱 시 컬럼 인덱스 기반 매핑 필수** → 브라우저 XLSX에서 `codepage: 949`가 `type: 'array'`와 `type: 'binary'` 모두에서 무시되어 EUC-KR 한국어 헤더가 깨짐
- 헤더 이름 매칭 대신 `COLUMN_INDEX_MAP` (컬럼 번호 → 필드명)을 사용하여 고정 위치 기반으로 파싱

## Feature 목록 (우선순위)
1. auth - 인증/권한 ✅ (Sprint 1)
2. dashboard - 대시보드 홈 ✅ (Sprint 1)
3. stores - 매장 관리 ✅ (Sprint 1)
4. sales - 매출 분석 (Sprint 2)
5. menu - 메뉴 관리 (Sprint 2)
6. inventory - 재고 관리 (Sprint 3)
7. staff - 직원 관리 (Sprint 3)
8. inspection - 매장 점검 (Sprint 4)
9. customers - 고객/리뷰 (Sprint 4)
10. notifications - 알림/공지 (Sprint 5)
11. settings - 설정 (Sprint 5)
