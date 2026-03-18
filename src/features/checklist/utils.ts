import * as XLSX from 'xlsx';
import type { ChecklistItem, ChecklistSection, ChecklistData } from './types';

let itemIdCounter = 0;
function generateId(): string {
  itemIdCounter += 1;
  return `cl-${Date.now()}-${itemIdCounter}`;
}

// ────────────────────────────────────────
// Helper
// ────────────────────────────────────────

function makeItem(
  category: string,
  title: string,
  responsible = '',
  notes = '',
  guide = '',
): ChecklistItem {
  return {
    id: generateId(),
    checked: false,
    category,
    title,
    responsible,
    notes,
    guide,
  };
}

// ────────────────────────────────────────
// 오픈전 체크리스트 (엑셀 Row 5~22 기준)
// ────────────────────────────────────────

export function getDefaultOpenChecklistSection(): ChecklistSection {
  const items: ChecklistItem[] = [
    makeItem(
      '서류',
      '오픈바이저 오픈 일정확인 (현장교육 총 2일 / 2일차 오픈)',
      '오픈바이저',
    ),
    makeItem(
      '서류',
      '사업자등록증·영업신고증·통장사본 확인',
      '정직화벌집삼겹 가맹점 / 오픈 소통 카톡방',
    ),
    makeItem(
      '서류',
      '사업자 유형 확인 (신규 사업자 vs 기등록 사업자(샵인샵) 구분) / 입점 시 배너(포맥스) 사진 필요여부 확인 (사업자명 ≠ 상호명일 때만)',
      '오픈바이저',
      '',
      '<법인서류>\n1. 사업자등록증(앞면,뒷면)\n2. 영업신고증\n3. 통장사본\n4. 법인등기부등본(3개월이내)\n5. 주주명부(법인도장필수)\n6. 주주명부, 재직증명서와 동일한 법인 인감 증명서\n -(열람용/복사본/전자민원창구용 불가)\n7. 운영자 재직증명서(법인도장필수)\n8. 대표자 통신사/연락처\n   운영자 통신사/연락처\n대표자 등록시, 운영자 재직증명서는 제외 가능',
    ),
    makeItem(
      '매장 컨디션',
      '매장 컨디션(영상) 확인 > 재사용 테이블 냉장고 바트 사이즈 사전확인 → 슈퍼바이저(임시) 카톡방에 홍대기 대리가 공지',
      '홍대기 대리 / 오픈바이저',
    ),
    makeItem(
      '인프라',
      '배달대행사 모집 여부 확인',
      '오픈바이저',
    ),
    makeItem(
      '인프라',
      '포스기·카드기 설치 여부 확인',
      '오픈바이저',
    ),
    makeItem(
      '인프라',
      '화재보험 가입 여부 확인 및 확산소화기 사전안내 필수',
      '오픈바이저',
      '',
      '[소방시설 관련 사전 안내]\n1. 주방용 확산 소화기 설치 안내\n법규상 주방 천정 설치 대상이며, 필수 고지 사항입니다.\n지금 당장 영업에는 문제 없을 수 있으나, 불시 소방 점검 시 과태료 및 영업정지 등 불이익이 발생할 수 있습니다.\n설치 여부 및 설치 시점은 점주님 선택사항입니다.\n-\n2. 설치 여부 판단의 주체\n최종적인 설치 대상 여부는\n▶ 관할 소방서\n▶ 건물 관리 주체\n▶ 배정된 소방관리업체\n▶ 시·도청\n점검 결과에 따라 확정되며, 실제 운영 전에 관할 소방 관련 기관에 직접 확인하시는 것을 권장드립니다.\n-\n3. 미설치 선택 시 유의사항\n현재 시점에서는 시정조치가 없더라도 추후 불시 점검, 담당자 변경, 점검 기준 변경 시에는 설치 지적이 발생할 수 있습니다.\n이 경우 발생하는 시정명령, 과태료, 영업 제한 등의 행정 조치는 가맹점 운영 주체인 점주님 책임으로 처리됩니다.',
    ),
    makeItem(
      '플랫폼 입점',
      '플랫폼 입점 정보 사전 소통 (입점가게명, 점주 성함·연락처, 이메일, 가게전화번호, 영업시간, 휴무일, 시작희망일, 네이버 스마트플레이스 ID/PW 등)',
      '오픈바이저',
      '',
      '□ 배달 플랫폼 입점 필요정보 □\n\n•매장명 : 정직화 벌집삼겹 00점\n•통신사/휴대폰번호 : 010-0000-0000\n•이메일주소 :\n•가게전화번호:\n•영업시간 :\n•휴무일 :\n•시작 희망일 :\n•요청사항 :\n\n□ 스마트 플레이스 등록 정보 □\n네이버 ID :\n비밀번호:',
    ),
    makeItem(
      '플랫폼 입점',
      '협력업체 입점 카톡방에 서류·입점자료 텍스트 공유 → 신규 사업자일 경우만 안당희 매니저 전달 (샵앤샵매장은 매장별 기존 매니저에게 입점요청) (사업자등록증, 영업신고증, 매장통장사본)',
      '오픈바이저 / 안당희 매니저',
    ),
    makeItem(
      '플랫폼 입점',
      '땡겨요 입점하기(이메일로 접수) b2b_group@fingerprime.co.kr (사업자등록증, 영업신고증, 통장사본, 땡겨요 엑셀양식 첨부)',
      '오픈바이저',
    ),
    makeItem(
      '기물',
      '초도기물 확인 (가맹사업부 배수빈 대리에게 리스트 확인 후 2차 수정) 테이블·냉장고 크기 → 바트 사이즈 조정 (드레인 필수)',
      '오픈바이저 / 배수빈 대리',
      '점주 기물 전체 직접 구매시 > 기물 전체 리스트 공유 후 품목 및 수량 재확인',
    ),
    makeItem(
      '발주',
      '초도 식자재 발주 (초도 리스트 수정하여 \'임시방\' 카톡방에 공유)',
      '오픈바이저',
      '동원 푸드가이드 아이디 / 비밀번호 요청 및 매장별 식자재 배송 입고일 확인',
    ),
    makeItem(
      '발주',
      '초도 주류 발주 (주류 판매 희망 여부 사전 확인 후 주류사에 발주) 카스·테라·참이슬·새로·진로·처음처럼',
      '오픈바이저',
    ),
    makeItem(
      '발주',
      '초도 포장용기 발주 (프랜킷 사이트 신규 회원가입 후 점주님 로그인 정보 공유) 기본 ID: jjh001 / PW: 정직화1! 초도 용기 장바구니 담은 후 점주님께 결제 요청',
      '오픈바이저 / 점주',
    ),
    makeItem(
      '비품',
      '초도 비품 확인 (가맹사업부 배수빈 대리에게 견적서 수령) 유니폼 제외: 원산지 표시판·간편레시피·포장용 홀 메뉴판 준비',
      '오픈바이저 / 배수빈 대리',
      '원산지 표시판 점주 직접 구매시 현장교육 방문 전 구매 여부 확인',
    ),
    makeItem(
      '시스템',
      '이카운트 계정 생성 (사업자등록증, 통장사본, 이메일, 점주 연락처)',
      '김용수 과장',
    ),
    makeItem(
      '시스템',
      '토더(ToOrder) 설치 및 입점 처리 ① 점주님께 토더 앱 설치 안내 ② 가맹점 정보 시트 업데이트 ③ 토더 측에 입점 공지',
      '오픈바이저',
    ),
    makeItem(
      '점주 준비 사항',
      '점주 직접 구매 품목 리스트 전달 (배홍동칼빔면, 미트페이퍼, 테이프 디스팬서 등)',
      '점주 / 오픈바이저',
    ),
  ];
  return {
    id: 'open-checklist',
    title: '오픈전 체크리스트',
    icon: '✅',
    items,
    progress: 0,
    total: items.length,
  };
}

// ────────────────────────────────────────
// 🍚 배달의민족 (엑셀 Row 28~65 좌측)
// ────────────────────────────────────────

export function getBaeminSection(): ChecklistSection {
  const items: ChecklistItem[] = [
    makeItem('기본정보', '로고 등록', '', '', '가게관리> 가게 대표이미지, 상표 체크'),
    makeItem('기본정보', '콘텐츠보드', '', '', '📌 사진 + 워딩 모두 등록'),
    makeItem('기본정보', '가게소개', '', '', '매장명 확인'),
    makeItem('기본정보', '찾아가는길 안내'),
    makeItem('운영정보', '영업시간', '', '', '✅ 오후 9시 이상 등록 → 야식 오픈리스트 조건'),
    makeItem('운영정보', '임시휴무', '', '', '임시휴무 시간 확인'),
    makeItem('주문정보', '예약주문'),
    makeItem('주문정보', '최소주문금액', '', '', '✅ 9,900원 설정'),
    makeItem('주문정보', '배달팁', '', '', '📌 기본배달팁 →9,900원↑: 2,900원\n📌 거리별 → 1.5km 기본 / 100m당 100원\n📌 배민페스타 진행시 → 기본 5,000원'),
    makeItem('주문정보', '추가배달팁'),
    makeItem('배달정보', '배달반경', '', '', '✅ 3km 운영 권장\n· 초과 시 사장님 추가할증 부담\n가게배달시 배달 지역 조정가능한점 안내'),
    makeItem('배달정보', '라이더 가게방문 안내'),
    makeItem('배달정보', '배달지역 안내'),
    makeItem('메뉴', '메뉴모음컷', '', '', '메뉴모음컷 안산본점 기준 체크(메인 불사진 삭제해야함)'),
    makeItem('메뉴', '한그릇메뉴', '', '', '오픈바이저 투입 첫날 한그릇할인 고객센터 연결 후 오픈할 것\n안산본점 기준으로 복사'),
    makeItem('메뉴', '주문안내', '', '', '메뉴판 편집>주문안내(매장명 확인)'),
    makeItem('메뉴', '원산지', '', '', '✅ 원산지 표기 의무 (필수 기재항목 확인)\n안산본점 기준 확인'),
    makeItem('메뉴', '리뷰옵션 상단 등록', '', '', '✅ 최상단 노출 필수'),
    makeItem('메뉴', '주류 등록', '', '', '이미지 확인/ 어플 확인 필수(어플에 노출 안될시 재등록 해야함)'),
    makeItem('메뉴옵션관리', '미운영메뉴 숨김처리'),
    makeItem('메뉴옵션관리', '미운영옵션 숨김처리'),
    makeItem('즉시 할인', '신규 주문 할인금액', '', '', '✅ 1,000원 권장(최소 2개월 유지)\n→ 첫주문 고객 확보 못 하면 재주문 없음\n📌경쟁업체 다수일때 신규 주문 할인 2,000원 적용'),
    makeItem('즉시 할인', '모든주문금액 할인 (알뜰·한집만)', '', '', '✅ 리뷰 1,000개↑: 미등록\n✅ 1,000개 미만: 1,000원'),
    makeItem('즉시 할인', '모든주문금액 할인 (포장)', '', '', '✅ 2,000원 최소등록\n→ 포장방문 유도 → 충성고객 확보\n📌 배민페스타 진행시 → 가게배달, 포장 3,000원 할인 설정'),
    makeItem('즉시 할인', '배민클럽(가게배달) 배달팁 할인', '', '', '가게배달 배달팁 할인 설정 없음'),
    makeItem('즉시 할인', '알뜰한집 배달팁 할인', '', '', '✅ 1,000원 필수 세팅\n→ 배민클럽 멤버십 대상, 한집배달 무료화'),
    makeItem('즉시 할인', '배민클럽(알뜰·한집) 배달팁 할인', '', '', '배민클럽 자동 설정 항목'),
    makeItem('사장님공지', '배너 등록', '', '', '이미지 내용 확인(껍데기 50g이 정상)'),
    makeItem('사장님공지', '워딩 등록', '', '', '안산본점 기준 복사'),
    makeItem('광고서비스관리', '포장주문 등록'),
    makeItem('광고서비스관리', '카테고리 확인', '', '', '✅ 최대 4개\n배민배달→고기·구이, 찜·탕·찌개, 백반·죽·국수, 야식\n픽업→고기·구이\n가게배달→고기·구이, 찜·탕·찌개, 백반·죽·국수, 야식'),
    makeItem('광고서비스관리', '우리가게클릭 신청확인'),
    makeItem('우리가게클릭', '예산 300만원', '', '', '✅ 300만원 고정\n→ 소진 시 해지 후 재등록'),
    makeItem('우리가게클릭', '클릭비 000원', '', '', '✅ 매출 대비 유동 관리\n→ 카테고리 내 13위 안 노출 유지 목표'),
    makeItem('우리가게클릭', '노출범위 4km', '', '', '✅ 4km 고정\n❌ 비용절감 명목 2km 설정 금지'),
  ];
  return {
    id: 'baemin',
    title: '배달의민족',
    icon: '🍚',
    items,
    progress: 0,
    total: items.length,
  };
}

// ────────────────────────────────────────
// 🛒 쿠팡이츠 (엑셀 Row 28~43 우측)
// ────────────────────────────────────────

export function getCoupangEatsSection(): ChecklistSection {
  const items: ChecklistItem[] = [
    makeItem('홈', '와우매장', '', '', '즉시할인 1,000원'),
    makeItem('광고관리', '광고값 설정', '', '', '📌 고객별 맞춤 세팅\n· 리뷰 300개 미만 → 신규 15% / 재주문 5%\n· 300개 이후 → 신규 10% / 재주문 0%\n📌 고급옵션 > 검색어 수정 : 말왕, 정직, 정직화, 정직화벌집삼겹'),
    makeItem('쿠폰관리', '쿠폰 등록', '', '', '✅ 모든고객: 29,900원↑ 시 2,000원'),
    makeItem('품절숨김', '미운영메뉴 숨김처리'),
    makeItem('품절숨김', '미운영옵션 숨김처리'),
    makeItem('메뉴편집추가', '리뷰이벤트 등록 + 상단 순위노출', '', '', '리뷰이벤트 옵션에 연결된 메뉴 17개 정상'),
    makeItem('메뉴편집추가', '하나만배달', '', '', '① \'하나만 담아도 무료배달\' 지면에서만 적용하기 필수📌\n② 가게당 최대 6개 노출(냉쫄세트, 찌개세트, 전지목살구이는 할인율 없이 등록)\n③ 한그릇 메뉴 3가지 할인율 29%설정'),
    makeItem('메뉴편집추가', '원산지', '', '', '매장정보 → 매장선택 → 식재료 클릭 후 안산본점 기준으로 적용확인'),
    makeItem('메뉴편집추가', '주류 등록', '', '', '안산본점 기준 누락되어있는 주류 확인 후 협력사 요청'),
    makeItem('메뉴편집추가', '대표사진 등록 (메뉴 편집·추가→대표사진)', '', '', '메뉴모음컷 안산본점 기준 체크(메인 불사진 삭제해야함) 최대5개'),
    makeItem('매장 정보', '매장소개', '', '', '안산본점기준 적용'),
    makeItem('매장 정보', '공지사항', '', '', '안산본점기준 적용'),
    makeItem('영업시간/휴무관리', '영업시간'),
    makeItem('영업시간/휴무관리', '임시휴무'),
    makeItem('계약관리', '즉시할인 1,000원', '', '', '📌 즉시할인 [V] 체크 필터 노출 필수 조건\n✅ 1,000원 이상 세팅 불필요'),
    makeItem('계약관리', '최소주문금액', '', '', '9,900원'),
  ];
  return {
    id: 'coupangeats',
    title: '쿠팡이츠',
    icon: '🛒',
    items,
    progress: 0,
    total: items.length,
  };
}

// ────────────────────────────────────────
// 🟠 요기요 (엑셀 Row 69~83 좌측)
// ────────────────────────────────────────

export function getYogiyoSection(): ChecklistSection {
  const items: ChecklistItem[] = [
    makeItem('기본정보', '가게사진/로고 등록'),
    makeItem('기본정보', '가게소개'),
    makeItem('기본정보', '찾아가는길 안내'),
    makeItem('운영정보', '영업시간'),
    makeItem('운영정보', '임시휴무'),
    makeItem('주문정보', '최소주문금액'),
    makeItem('주문정보', '배달팁'),
    makeItem('주문정보', '추가배달팁'),
    makeItem('메뉴', '미운영메뉴 숨김처리'),
    makeItem('메뉴', '미운영옵션 숨김처리'),
    makeItem('메뉴', '주류 등록'),
    makeItem('메뉴', '원산지 등록'),
    makeItem('할인', '신규주문 할인'),
    makeItem('할인', '배달팁 할인'),
    makeItem('광고', '광고 등록'),
  ];
  return {
    id: 'yogiyo',
    title: '요기요',
    icon: '🟠',
    items,
    progress: 0,
    total: items.length,
  };
}

// ────────────────────────────────────────
// 🟣 땡겨요 (엑셀 Row 69~81 우측)
// ────────────────────────────────────────

export function getDdangyoyoSection(): ChecklistSection {
  const items: ChecklistItem[] = [
    makeItem('기본정보', '가게사진/로고 등록'),
    makeItem('기본정보', '가게소개'),
    makeItem('운영정보', '영업시간'),
    makeItem('운영정보', '임시휴무'),
    makeItem('주문정보', '최소주문금액'),
    makeItem('주문정보', '배달팁'),
    makeItem('메뉴', '메뉴 등록/검토'),
    makeItem('메뉴', '미운영메뉴 숨김처리'),
    makeItem('메뉴', '주류 등록'),
    makeItem('메뉴', '원산지 등록'),
    makeItem('혜택', '즉시할인 설정'),
    makeItem('혜택', '쿠폰 등록'),
    makeItem('광고', '광고 등록'),
  ];
  return {
    id: 'ddangyoyo',
    title: '땡겨요',
    icon: '🟣',
    items,
    progress: 0,
    total: items.length,
  };
}

// ────────────────────────────────────────
// Default data
// ────────────────────────────────────────

export function getDefaultChecklistData(): ChecklistData {
  return {
    brandName: '정직화벌집삼겹',
    storeName: '',
    assignee: 'OOSV',
    sections: [
      getDefaultOpenChecklistSection(),
      getBaeminSection(),
      getCoupangEatsSection(),
      getYogiyoSection(),
      getDdangyoyoSection(),
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ────────────────────────────────────────
// 담당자 목록 (엑셀 기준)
// ────────────────────────────────────────

export const RESPONSIBLE_PERSONS = [
  '오픈바이저',
  '정직화벌집삼겹 가맹점',
  '오픈 소통 카톡방',
  '홍대기 대리',
  '안당희 매니저',
  '배수빈 대리',
  '김용수 과장',
  '점주',
] as const;

// ────────────────────────────────────────
// Excel parsing
// ────────────────────────────────────────

export function parseChecklistExcel(file: File): Promise<ChecklistData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName =
          workbook.SheetNames.find((n) => n.includes('기본 템플릿')) ??
          workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: '',
        });

        const sections: ChecklistSection[] = [];

        // Parse open checklist (rows 5-22)
        const openItems: ChecklistItem[] = [];
        let lastCategory = '';
        for (let i = 5; i <= 22 && i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[2]) continue;
          const cat = String(row[1] || '').trim();
          if (cat) lastCategory = cat;
          openItems.push({
            id: generateId(),
            checked: Boolean(row[0]),
            category: cat || lastCategory,
            title: String(row[2] || '').replace(/\r\n/g, ' ').trim(),
            responsible: String(row[7] || '').replace(/\r\n/g, ' / ').trim(),
            notes: String(row[8] || '').replace(/\r\n/g, '\n').trim(),
            guide: '',
          });
        }
        if (openItems.length > 0) {
          sections.push({
            id: 'open-checklist',
            title: '오픈전 체크리스트',
            icon: '✅',
            items: openItems,
            progress: openItems.filter((i) => i.checked).length,
            total: openItems.length,
          });
        }

        // Parse delivery platform sections
        const platformSections = parsePlatformSections(rows);
        sections.push(...platformSections);

        if (sections.length === 0) {
          resolve(getDefaultChecklistData());
          return;
        }

        resolve({
          brandName: '정직화벌집삼겹',
          storeName: '',
          assignee: String(rows[1]?.[2] || 'OOSV'),
          sections,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsArrayBuffer(file);
  });
}

function parsePlatformSections(rows: unknown[][]): ChecklistSection[] {
  const sections: ChecklistSection[] = [];

  // 배달의민족 (left side rows 28~65, cols 0-3)
  const baeminItems: ChecklistItem[] = [];
  let lastCatBaemin = '';
  for (let i = 28; i <= 65 && i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const title = String(row[2] || '').trim();
    if (!title) continue;
    const cat = String(row[1] || '').trim();
    if (cat) lastCatBaemin = cat;
    baeminItems.push({
      id: generateId(),
      checked: Boolean(row[0]),
      category: cat || lastCatBaemin,
      title: title.replace(/\r\n/g, ' ').trim(),
      responsible: '',
      notes: String(row[3] || '').replace(/\r\n/g, '\n').trim(),
      guide: '',
    });
  }
  if (baeminItems.length > 0) {
    sections.push({
      id: 'baemin',
      title: '배달의민족',
      icon: '🍚',
      items: baeminItems,
      progress: baeminItems.filter((i) => i.checked).length,
      total: baeminItems.length,
    });
  }

  // 쿠팡이츠 (right side rows 28~43, cols 5-8)
  const coupangItems: ChecklistItem[] = [];
  let lastCatCoupang = '';
  for (let i = 28; i <= 43 && i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const title = String(row[7] || '').trim();
    if (!title) continue;
    const cat = String(row[6] || '').trim();
    if (cat) lastCatCoupang = cat;
    coupangItems.push({
      id: generateId(),
      checked: Boolean(row[5]),
      category: cat || lastCatCoupang,
      title: title.replace(/\r\n/g, ' ').trim(),
      responsible: '',
      notes: String(row[8] || '').replace(/\r\n/g, '\n').trim(),
      guide: '',
    });
  }
  if (coupangItems.length > 0) {
    sections.push({
      id: 'coupangeats',
      title: '쿠팡이츠',
      icon: '🛒',
      items: coupangItems,
      progress: coupangItems.filter((i) => i.checked).length,
      total: coupangItems.length,
    });
  }

  // 요기요 (left side rows 69~83, cols 0-3)
  const yogiyoItems: ChecklistItem[] = [];
  let lastCatYogiyo = '';
  for (let i = 69; i <= 83 && i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const title = String(row[2] || '').trim();
    if (!title) continue;
    const cat = String(row[1] || '').trim();
    if (cat) lastCatYogiyo = cat;
    yogiyoItems.push({
      id: generateId(),
      checked: Boolean(row[0]),
      category: cat || lastCatYogiyo,
      title: title.replace(/\r\n/g, ' ').trim(),
      responsible: '',
      notes: String(row[3] || '').replace(/\r\n/g, '\n').trim(),
      guide: '',
    });
  }
  if (yogiyoItems.length > 0) {
    sections.push({
      id: 'yogiyo',
      title: '요기요',
      icon: '🟠',
      items: yogiyoItems,
      progress: yogiyoItems.filter((i) => i.checked).length,
      total: yogiyoItems.length,
    });
  }

  // 땡겨요 (right side rows 69~81, cols 5-8)
  const ddangyoyoItems: ChecklistItem[] = [];
  let lastCatDdang = '';
  for (let i = 69; i <= 81 && i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const title = String(row[7] || '').trim();
    if (!title) continue;
    const cat = String(row[6] || '').trim();
    if (cat) lastCatDdang = cat;
    ddangyoyoItems.push({
      id: generateId(),
      checked: Boolean(row[5]),
      category: cat || lastCatDdang,
      title: title.replace(/\r\n/g, ' ').trim(),
      responsible: '',
      notes: String(row[8] || '').replace(/\r\n/g, '\n').trim(),
      guide: '',
    });
  }
  if (ddangyoyoItems.length > 0) {
    sections.push({
      id: 'ddangyoyo',
      title: '땡겨요',
      icon: '🟣',
      items: ddangyoyoItems,
      progress: ddangyoyoItems.filter((i) => i.checked).length,
      total: ddangyoyoItems.length,
    });
  }

  return sections;
}

// ────────────────────────────────────────
// Progress helpers
// ────────────────────────────────────────

export function calcSectionProgress(section: ChecklistSection): {
  progress: number;
  total: number;
  percent: number;
} {
  const total = section.items.length;
  const progress = section.items.filter((i) => i.checked).length;
  return { progress, total, percent: total > 0 ? (progress / total) * 100 : 0 };
}

export function calcOverallProgress(sections: ChecklistSection[]): {
  progress: number;
  total: number;
  percent: number;
} {
  const total = sections.reduce((s, sec) => s + sec.items.length, 0);
  const progress = sections.reduce(
    (s, sec) => s + sec.items.filter((i) => i.checked).length,
    0,
  );
  return { progress, total, percent: total > 0 ? (progress / total) * 100 : 0 };
}
