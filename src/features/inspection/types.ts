export type InspectionCategory = '위생' | '서비스' | '시설' | '안전';

export type InspectionStatus = 'draft' | 'completed' | 'reviewed';

export type InspectionGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export type IssueSeverity = 'critical' | 'major' | 'minor';

export interface TemplateItem {
  id: string;
  name: string;
  category: InspectionCategory;
  maxScore: number;
  description: string;
}

export interface InspectionTemplate {
  id: string;
  brandId: string;
  name: string;
  description: string;
  category: InspectionCategory;
  items: TemplateItem[];
  maxScore: number;
  isActive: boolean;
  createdAt: string;
}

export interface InspectionIssue {
  id: string;
  itemName: string;
  category: InspectionCategory;
  severity: IssueSeverity;
  description: string;
  imageUrls: string[];
  resolvedAt: string | null;
}

export interface Inspection {
  id: string;
  templateId: string;
  templateName: string;
  storeId: string;
  storeName: string;
  inspectorId: string;
  inspectorName: string;
  inspectionDate: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: InspectionStatus;
  grade: InspectionGrade;
  issues: InspectionIssue[];
  notes: string | null;
  createdAt: string;
}

export interface InspectionItem {
  id: string;
  inspectionId: string;
  itemName: string;
  category: InspectionCategory;
  score: number;
  maxScore: number;
  notes: string | null;
  imageUrls: string[];
}

export interface InspectionFormData {
  templateId: string;
  storeId: string;
  inspectionDate: string;
  items: {
    itemId: string;
    score: number;
    notes: string;
  }[];
  notes: string;
}

export interface InspectionFilters {
  search: string;
  storeId: string | 'all';
  templateId: string | 'all';
  status: InspectionStatus | 'all';
  dateFrom: string;
  dateTo: string;
}
