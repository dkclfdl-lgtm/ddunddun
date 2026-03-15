새로운 페이지를 생성합니다.

$ARGUMENTS 경로에 해당하는 Next.js 페이지를 생성해주세요.

규칙:
1. src/app/$ARGUMENTS/page.tsx 파일 생성
2. 'use client' 디렉티브 필수
3. params props는 Promise로 처리
4. 해당 feature의 컴포넌트를 import해서 사용
5. .claude/docs/PRD.md의 페이지 라우팅 구조와 기능 명세를 참고
6. 네이버 스타일 디자인 (그린 컬러, 카드 레이아웃) 적용
7. 반응형 레이아웃 적용
8. 공통 레이아웃 (사이드바, 탑바) 내부에 렌더링되도록 구성
