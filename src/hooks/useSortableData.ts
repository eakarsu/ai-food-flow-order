import { useState, useMemo } from 'react';
import type { SortConfig } from '@/components/shared/SortableTableHead';

export function useSortableData<T>(
  items: T[],
  defaultSort: SortConfig = { key: '', direction: 'asc' }
) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(defaultSort);

  const sortedItems = useMemo(() => {
    if (!sortConfig.key) return items;

    return [...items].sort((a, b) => {
      const aVal = (a as Record<string, any>)[sortConfig.key];
      const bVal = (b as Record<string, any>)[sortConfig.key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        // Try parsing as dates for string date fields
        const aDate = Date.parse(aStr);
        const bDate = Date.parse(bStr);
        if (!isNaN(aDate) && !isNaN(bDate) && aStr.includes('-')) {
          comparison = aDate - bDate;
        } else {
          comparison = aStr.localeCompare(bStr);
        }
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [items, sortConfig]);

  const requestSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return { sortedItems, sortConfig, requestSort };
}
