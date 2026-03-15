Supabase 마이그레이션 SQL 파일을 생성합니다.

$ARGUMENTS 에 대한 마이그레이션 SQL을 생성해주세요.

규칙:
1. supabase/migrations/ 디렉토리에 타임스탬프_설명.sql 형식으로 생성
2. .claude/docs/PRD.md의 데이터베이스 스키마를 참고
3. RLS (Row Level Security) 정책 포함
4. 인덱스 필요한 컬럼에 인덱스 생성
5. created_at, updated_at 컬럼에 기본값 설정
6. 외래키 관계 명시
7. COMMENT ON 으로 테이블/컬럼 설명 추가 (한글)
