export interface ChecklistItem {
  id: string;
  checked: boolean;
  category: string;
  title: string;
  responsible: string;
  notes: string;
  guide: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  icon: string;
  items: ChecklistItem[];
  progress: number;
  total: number;
}

export interface ChecklistData {
  brandName: string;
  storeName: string;
  assignee: string;
  sections: ChecklistSection[];
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'executive' | 'hq-training' | 'franchisee-training' | 'blank-template';
export type DocumentFormat = 'ppt' | 'pdf';
