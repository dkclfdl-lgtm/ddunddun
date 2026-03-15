'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Inspection, InspectionFilters, InspectionTemplate, InspectionItem } from './types';
import {
  getMockInspections,
  getMockInspectionById,
  getMockTemplates,
  getMockTemplateById,
  generateInspectionItems,
  createMockInspection,
} from './mock';

export function useInspectionList(initialFilters?: Partial<InspectionFilters>) {
  const [inspections] = useState<Inspection[]>(getMockInspections);
  const [filters, setFilters] = useState<InspectionFilters>({
    search: '',
    storeId: 'all',
    templateId: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    ...initialFilters,
  });

  const filteredInspections = useMemo(() => {
    return inspections.filter((insp) => {
      const matchesSearch =
        !filters.search ||
        insp.storeName.toLowerCase().includes(filters.search.toLowerCase()) ||
        insp.inspectorName.toLowerCase().includes(filters.search.toLowerCase()) ||
        insp.templateName.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStore = filters.storeId === 'all' || insp.storeId === filters.storeId;
      const matchesTemplate = filters.templateId === 'all' || insp.templateId === filters.templateId;
      const matchesStatus = filters.status === 'all' || insp.status === filters.status;
      const matchesDateFrom = !filters.dateFrom || insp.inspectionDate >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || insp.inspectionDate <= filters.dateTo;
      return matchesSearch && matchesStore && matchesTemplate && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [inspections, filters]);

  const updateFilters = useCallback((partial: Partial<InspectionFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  return { inspections: filteredInspections, filters, updateFilters };
}

export function useInspectionDetail(id: string) {
  const [inspection] = useState<Inspection | undefined>(() => getMockInspectionById(id));
  const [items] = useState<InspectionItem[]>(() => {
    const insp = getMockInspectionById(id);
    return insp ? generateInspectionItems(insp) : [];
  });
  const [isLoading] = useState(false);

  return { inspection, items, isLoading };
}

export function useInspectionTemplates() {
  const [templates] = useState<InspectionTemplate[]>(getMockTemplates);

  const getTemplateById = useCallback((id: string) => {
    return getMockTemplateById(id);
  }, []);

  return { templates, getTemplateById };
}

export function useInspectionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const templates = useMemo(() => getMockTemplates(), []);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId);
  }, [templates, selectedTemplateId]);

  const submitInspection = useCallback(
    async (data: {
      templateId: string;
      storeId: string;
      inspectionDate: string;
      itemScores: Record<string, number>;
      notes: string;
    }) => {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const template = getMockTemplateById(data.templateId);
      const totalScore = Object.values(data.itemScores).reduce((sum, s) => sum + s, 0);
      const maxScore = template?.maxScore ?? 100;
      const inspection = createMockInspection({
        templateId: data.templateId,
        storeId: data.storeId,
        inspectionDate: data.inspectionDate,
        totalScore,
        maxScore,
        notes: data.notes,
      });
      setIsSubmitting(false);
      return inspection;
    },
    [],
  );

  return {
    templates,
    selectedTemplate,
    selectedTemplateId,
    setSelectedTemplateId,
    isSubmitting,
    submitInspection,
  };
}

export function useInspectionStats() {
  const inspections = useMemo(() => getMockInspections(), []);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthInspections = inspections.filter((i) => i.inspectionDate.startsWith(currentMonth));
    const totalThisMonth = thisMonthInspections.length;
    const avgScore =
      thisMonthInspections.length > 0
        ? Math.round(thisMonthInspections.reduce((sum, i) => sum + i.percentage, 0) / thisMonthInspections.length)
        : 0;
    const gradeACount = thisMonthInspections.filter((i) => i.grade === 'A').length;
    const gradeARatio = totalThisMonth > 0 ? Math.round((gradeACount / totalThisMonth) * 100) : 0;
    const unresolvedIssues = inspections
      .flatMap((i) => i.issues)
      .filter((issue) => !issue.resolvedAt).length;

    return {
      totalThisMonth,
      avgScore,
      gradeARatio,
      unresolvedIssues,
    };
  }, [inspections]);

  const storeScores = useMemo(() => {
    const scoreMap = new Map<string, { storeName: string; scores: number[] }>();
    inspections.forEach((insp) => {
      const existing = scoreMap.get(insp.storeId);
      if (existing) {
        existing.scores.push(insp.percentage);
      } else {
        scoreMap.set(insp.storeId, { storeName: insp.storeName, scores: [insp.percentage] });
      }
    });
    return Array.from(scoreMap.entries()).map(([storeId, data]) => ({
      storeId,
      storeName: data.storeName,
      avgScore: Math.round(data.scores.reduce((s, v) => s + v, 0) / data.scores.length),
      inspectionCount: data.scores.length,
    }));
  }, [inspections]);

  return { stats, storeScores };
}
