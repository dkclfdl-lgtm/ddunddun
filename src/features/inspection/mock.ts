import type {
  InspectionTemplate,
  Inspection,
  InspectionItem,
  InspectionCategory,
  InspectionGrade,
  InspectionIssue,
} from './types';

function calcGrade(percentage: number): InspectionGrade {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

export const mockTemplates: InspectionTemplate[] = [
  {
    id: 'tmpl-1',
    brandId: 'brand-1',
    name: '위생 점검',
    description: '매장 위생 상태 전반을 점검합니다',
    category: '위생',
    maxScore: 100,
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
    items: [
      { id: 'ti-1-1', name: '주방 바닥 청결', category: '위생', maxScore: 10, description: '주방 바닥의 청결 상태를 확인합니다' },
      { id: 'ti-1-2', name: '조리대 위생', category: '위생', maxScore: 10, description: '조리대 표면 소독 및 청결 상태' },
      { id: 'ti-1-3', name: '냉장고 온도 관리', category: '위생', maxScore: 10, description: '냉장고 온도가 적정 범위인지 확인' },
      { id: 'ti-1-4', name: '식재료 보관 상태', category: '위생', maxScore: 10, description: '식재료 라벨링 및 보관 상태' },
      { id: 'ti-1-5', name: '직원 위생복 착용', category: '위생', maxScore: 10, description: '직원의 위생복, 위생모, 장갑 착용 여부' },
      { id: 'ti-1-6', name: '손씻기 시설', category: '위생', maxScore: 10, description: '손씻기 시설 및 소독제 비치 여부' },
      { id: 'ti-1-7', name: '해충 방제', category: '위생', maxScore: 10, description: '해충 방제 상태 및 기록 확인' },
      { id: 'ti-1-8', name: '쓰레기 처리', category: '위생', maxScore: 10, description: '쓰레기통 관리 및 분리수거 상태' },
      { id: 'ti-1-9', name: '화장실 청결', category: '위생', maxScore: 10, description: '화장실 청소 상태 및 비품 비치' },
      { id: 'ti-1-10', name: '환기 시설', category: '위생', maxScore: 10, description: '환기 시설 가동 및 공기질 상태' },
    ],
  },
  {
    id: 'tmpl-2',
    brandId: 'brand-1',
    name: '서비스 점검',
    description: '고객 서비스 품질을 점검합니다',
    category: '서비스',
    maxScore: 100,
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    items: [
      { id: 'ti-2-1', name: '고객 인사', category: '서비스', maxScore: 10, description: '입장/퇴장 시 인사 여부' },
      { id: 'ti-2-2', name: '주문 응대 시간', category: '서비스', maxScore: 10, description: '고객 주문 대기 시간 확인' },
      { id: 'ti-2-3', name: '메뉴 설명 능력', category: '서비스', maxScore: 10, description: '직원의 메뉴 숙지도 및 설명 능력' },
      { id: 'ti-2-4', name: '음식 제공 시간', category: '서비스', maxScore: 10, description: '주문 후 음식 제공까지의 시간' },
      { id: 'ti-2-5', name: '테이블 정리', category: '서비스', maxScore: 10, description: '고객 퇴장 후 테이블 정리 속도' },
      { id: 'ti-2-6', name: '불만 처리', category: '서비스', maxScore: 10, description: '고객 불만 사항 대응 능력' },
      { id: 'ti-2-7', name: '유니폼 착용', category: '서비스', maxScore: 10, description: '직원 유니폼 상태 및 착용 여부' },
      { id: 'ti-2-8', name: '매장 음악/분위기', category: '서비스', maxScore: 10, description: '매장 음악 및 조명 상태' },
      { id: 'ti-2-9', name: '포장 서비스', category: '서비스', maxScore: 10, description: '포장 품질 및 서비스 태도' },
      { id: 'ti-2-10', name: '결제 처리', category: '서비스', maxScore: 10, description: '결제 과정의 정확성 및 신속성' },
    ],
  },
  {
    id: 'tmpl-3',
    brandId: 'brand-1',
    name: '시설 점검',
    description: '매장 시설 및 장비 상태를 점검합니다',
    category: '시설',
    maxScore: 110,
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z',
    items: [
      { id: 'ti-3-1', name: '간판 상태', category: '시설', maxScore: 10, description: '외부 간판 조명 및 파손 여부' },
      { id: 'ti-3-2', name: '출입문 상태', category: '시설', maxScore: 10, description: '출입문 개폐 및 자동문 작동' },
      { id: 'ti-3-3', name: '냉난방 시설', category: '시설', maxScore: 10, description: '냉난방 장비 작동 및 온도 적정성' },
      { id: 'ti-3-4', name: '조리 장비', category: '시설', maxScore: 10, description: '주요 조리 장비 작동 상태' },
      { id: 'ti-3-5', name: '냉장/냉동 설비', category: '시설', maxScore: 10, description: '냉장고, 냉동고 작동 및 온도' },
      { id: 'ti-3-6', name: '조명 시설', category: '시설', maxScore: 10, description: '매장 내부 조명 작동 상태' },
      { id: 'ti-3-7', name: '소방 설비', category: '안전', maxScore: 10, description: '소화기, 스프링클러 점검' },
      { id: 'ti-3-8', name: 'CCTV', category: '안전', maxScore: 10, description: 'CCTV 작동 및 녹화 상태' },
      { id: 'ti-3-9', name: '전기 시설', category: '시설', maxScore: 10, description: '전기 배선 및 콘센트 상태' },
      { id: 'ti-3-10', name: '배수 시설', category: '시설', maxScore: 10, description: '배수구 및 하수 시설 상태' },
      { id: 'ti-3-11', name: '비상구 표시', category: '안전', maxScore: 10, description: '비상구 표시등 및 통로 확보' },
    ],
  },
];

const storeNames: Record<string, string> = {
  'store-1': '강남점',
  'store-2': '홍대점',
  'store-3': '명동점',
  'store-4': '잠실점',
  'store-5': '신촌점',
  'store-6': '이태원점',
  'store-7': '건대점',
  'store-8': '여의도점',
};

function generateIssues(inspectionId: string, score: number): InspectionIssue[] {
  if (score > 85) return [];
  const issues: InspectionIssue[] = [];
  if (score < 60) {
    issues.push({
      id: `issue-${inspectionId}-1`,
      itemName: '냉장고 온도 관리',
      category: '위생',
      severity: 'critical',
      description: '냉장고 온도가 10도 이상으로 기준치 초과',
      imageUrls: [],
      resolvedAt: null,
    });
  }
  if (score < 75) {
    issues.push({
      id: `issue-${inspectionId}-2`,
      itemName: '주방 바닥 청결',
      category: '위생',
      severity: 'major',
      description: '주방 바닥에 기름때가 다수 발견',
      imageUrls: [],
      resolvedAt: Math.random() > 0.5 ? '2026-03-10T10:00:00Z' : null,
    });
  }
  if (score < 80) {
    issues.push({
      id: `issue-${inspectionId}-3`,
      itemName: '간판 상태',
      category: '시설',
      severity: 'minor',
      description: '간판 일부 조명 꺼짐',
      imageUrls: [],
      resolvedAt: '2026-03-05T10:00:00Z',
    });
  }
  return issues;
}

function createInspection(
  id: string,
  templateId: string,
  templateName: string,
  storeId: string,
  inspectorName: string,
  date: string,
  totalScore: number,
  maxScore: number,
  status: 'draft' | 'completed' | 'reviewed',
): Inspection {
  const percentage = Math.round((totalScore / maxScore) * 100);
  return {
    id,
    templateId,
    templateName,
    storeId,
    storeName: storeNames[storeId] ?? storeId,
    inspectorId: 'inspector-1',
    inspectorName,
    inspectionDate: date,
    totalScore,
    maxScore,
    percentage,
    status,
    grade: calcGrade(percentage),
    issues: generateIssues(id, percentage),
    notes: null,
    createdAt: date,
  };
}

export const mockInspections: Inspection[] = [
  createInspection('insp-1', 'tmpl-1', '위생 점검', 'store-1', '박지영', '2026-03-14', 92, 100, 'completed'),
  createInspection('insp-2', 'tmpl-2', '서비스 점검', 'store-1', '박지영', '2026-03-12', 88, 100, 'reviewed'),
  createInspection('insp-3', 'tmpl-3', '시설 점검', 'store-1', '최현우', '2026-03-10', 95, 110, 'completed'),
  createInspection('insp-4', 'tmpl-1', '위생 점검', 'store-2', '박지영', '2026-03-13', 78, 100, 'completed'),
  createInspection('insp-5', 'tmpl-2', '서비스 점검', 'store-2', '최현우', '2026-03-11', 65, 100, 'reviewed'),
  createInspection('insp-6', 'tmpl-1', '위생 점검', 'store-3', '박지영', '2026-03-14', 85, 100, 'completed'),
  createInspection('insp-7', 'tmpl-3', '시설 점검', 'store-3', '최현우', '2026-03-09', 72, 110, 'completed'),
  createInspection('insp-8', 'tmpl-1', '위생 점검', 'store-4', '박지영', '2026-03-12', 55, 100, 'reviewed'),
  createInspection('insp-9', 'tmpl-2', '서비스 점검', 'store-4', '최현우', '2026-03-08', 91, 100, 'completed'),
  createInspection('insp-10', 'tmpl-1', '위생 점검', 'store-5', '박지영', '2026-03-14', 97, 100, 'completed'),
  createInspection('insp-11', 'tmpl-3', '시설 점검', 'store-5', '최현우', '2026-03-07', 88, 110, 'reviewed'),
  createInspection('insp-12', 'tmpl-1', '위생 점검', 'store-7', '박지영', '2026-03-13', 82, 100, 'completed'),
  createInspection('insp-13', 'tmpl-2', '서비스 점검', 'store-7', '최현우', '2026-03-06', 73, 100, 'draft'),
  createInspection('insp-14', 'tmpl-1', '위생 점검', 'store-8', '박지영', '2026-03-11', 90, 100, 'completed'),
  createInspection('insp-15', 'tmpl-3', '시설 점검', 'store-8', '최현우', '2026-03-05', 68, 110, 'reviewed'),
  createInspection('insp-16', 'tmpl-2', '서비스 점검', 'store-3', '박지영', '2026-02-28', 94, 100, 'reviewed'),
];

export function generateInspectionItems(inspection: Inspection): InspectionItem[] {
  const template = mockTemplates.find((t) => t.id === inspection.templateId);
  if (!template) return [];

  return template.items.map((item, idx) => {
    const ratio = inspection.percentage / 100;
    const variance = (Math.random() - 0.5) * 0.3;
    const score = Math.min(item.maxScore, Math.max(0, Math.round(item.maxScore * (ratio + variance))));
    return {
      id: `ii-${inspection.id}-${idx}`,
      inspectionId: inspection.id,
      itemName: item.name,
      category: item.category as InspectionCategory,
      score,
      maxScore: item.maxScore,
      notes: score < item.maxScore * 0.6 ? '개선 필요' : null,
      imageUrls: [],
    };
  });
}

export function getMockInspections(): Inspection[] {
  return mockInspections;
}

export function getMockInspectionById(id: string): Inspection | undefined {
  return mockInspections.find((i) => i.id === id);
}

export function getMockTemplates(): InspectionTemplate[] {
  return mockTemplates;
}

export function getMockTemplateById(id: string): InspectionTemplate | undefined {
  return mockTemplates.find((t) => t.id === id);
}

export function createMockInspection(data: {
  templateId: string;
  storeId: string;
  inspectionDate: string;
  totalScore: number;
  maxScore: number;
  notes: string;
}): Inspection {
  const template = getMockTemplateById(data.templateId);
  const percentage = Math.round((data.totalScore / data.maxScore) * 100);
  return {
    id: `insp-${Date.now()}`,
    templateId: data.templateId,
    templateName: template?.name ?? '',
    storeId: data.storeId,
    storeName: storeNames[data.storeId] ?? data.storeId,
    inspectorId: 'inspector-1',
    inspectorName: '박지영',
    inspectionDate: data.inspectionDate,
    totalScore: data.totalScore,
    maxScore: data.maxScore,
    percentage,
    status: 'completed',
    grade: calcGrade(percentage),
    issues: [],
    notes: data.notes || null,
    createdAt: new Date().toISOString(),
  };
}
