새로운 feature 모듈을 생성합니다.

$ARGUMENTS 이름으로 feature 모듈을 생성해주세요.

다음 구조로 생성:
- src/features/$ARGUMENTS/components/ (빈 디렉토리)
- src/features/$ARGUMENTS/constants/ (빈 디렉토리)
- src/features/$ARGUMENTS/hooks/ (빈 디렉토리)
- src/features/$ARGUMENTS/lib/ (빈 디렉토리)
- src/features/$ARGUMENTS/types.ts (기본 타입 정의)
- src/features/$ARGUMENTS/api.ts (API 호출 함수 뼈대)

.claude/docs/PRD.md를 참고하여 해당 feature에 맞는 타입과 API 함수를 미리 정의해주세요.
모든 컴포넌트에는 'use client' 디렉티브를 포함하세요.
