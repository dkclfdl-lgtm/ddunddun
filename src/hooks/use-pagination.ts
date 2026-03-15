'use client';

import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/constants';

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  startIndex: number;
  endIndex: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
}

export function usePagination(
  totalItems: number,
  initialPageSize: number = DEFAULT_PAGE_SIZE,
): UsePaginationReturn {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize],
  );

  const canPreviousPage = page > 1;
  const canNextPage = page < totalPages;

  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

  const nextPage = useCallback(() => {
    if (canNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [canNextPage]);

  const previousPage = useCallback(() => {
    if (canPreviousPage) {
      setPage((prev) => prev - 1);
    }
  }, [canPreviousPage]);

  const handleSetPage = useCallback(
    (newPage: number) => {
      const clamped = Math.max(1, Math.min(newPage, totalPages));
      setPage(clamped);
    },
    [totalPages],
  );

  const handleSetPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  return {
    page,
    pageSize,
    totalPages,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    startIndex,
    endIndex,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
  };
}
