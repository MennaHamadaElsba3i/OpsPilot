import { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  OperationListParams,
  OperationSortBy,
  OperationStatus,
  SortOrder,
} from '../model/operation.types';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SORT_BY: OperationSortBy = 'createdAt';
export const DEFAULT_SORT_ORDER: SortOrder = 'desc';
export const DEFAULT_STATUS: OperationStatus | 'All' = 'All';
export const DEFAULT_SEARCH = '';

const VALID_STATUSES: (OperationStatus | 'All')[] = ['All', 'Pending', 'Running', 'Completed', 'Failed'];
const VALID_SORT_FIELDS: OperationSortBy[] = ['createdAt', 'updatedAt'];
const VALID_SORT_ORDERS: SortOrder[] = ['asc', 'desc'];
const VALID_PAGE_SIZES = [5, 10, 20, 50, 100];

export function useOperationsUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Normalize parameters from URL searchParams
  const params: Required<OperationListParams> = useMemo(() => {
    const rawSearch = searchParams.get('search') || DEFAULT_SEARCH;
    const rawStatus = (searchParams.get('status') || DEFAULT_STATUS) as OperationStatus | 'All';
    const rawSortBy = (searchParams.get('sortBy') || DEFAULT_SORT_BY) as OperationSortBy;
    const rawSortOrder = (searchParams.get('sortOrder') || DEFAULT_SORT_ORDER) as SortOrder;
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const rawPageSize = parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10);

    const status = VALID_STATUSES.includes(rawStatus) ? rawStatus : DEFAULT_STATUS;
    const sortBy = VALID_SORT_FIELDS.includes(rawSortBy) ? rawSortBy : DEFAULT_SORT_BY;
    const sortOrder = VALID_SORT_ORDERS.includes(rawSortOrder) ? rawSortOrder : DEFAULT_SORT_ORDER;
    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE;
    const pageSize = VALID_PAGE_SIZES.includes(rawPageSize) ? rawPageSize : DEFAULT_PAGE_SIZE;

    return {
      search: rawSearch,
      status,
      sortBy,
      sortOrder,
      page,
      pageSize,
    };
  }, [searchParams]);

  // Local state for debounced search input so typing is responsive
  const [searchInput, setSearchInput] = useState<string>(params.search);
  const isFirstRender = useRef(true);

  // Sync search input if URL changes externally (e.g. Back/Forward)
  useEffect(() => {
    if (searchInput !== params.search) {
      setSearchInput(params.search);
    }
  }, [params.search]);

  // Atomic update function for URL parameters
  const updateParams = useCallback(
    (
      newPartial: Partial<OperationListParams>,
      options: { replace?: boolean; resetPage?: boolean } = {}
    ) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const shouldResetPage = options.resetPage ?? true;

          // Search
          if (newPartial.search !== undefined) {
            const trimmed = newPartial.search.trim();
            if (trimmed) {
              next.set('search', trimmed);
            } else {
              next.delete('search');
            }
          }

          // Status
          if (newPartial.status !== undefined) {
            if (newPartial.status && newPartial.status !== 'All') {
              next.set('status', newPartial.status);
            } else {
              next.delete('status');
            }
          }

          // Sort By
          if (newPartial.sortBy !== undefined) {
            if (newPartial.sortBy !== DEFAULT_SORT_BY) {
              next.set('sortBy', newPartial.sortBy);
            } else {
              next.delete('sortBy');
            }
          }

          // Sort Order
          if (newPartial.sortOrder !== undefined) {
            if (newPartial.sortOrder !== DEFAULT_SORT_ORDER) {
              next.set('sortOrder', newPartial.sortOrder);
            } else {
              next.delete('sortOrder');
            }
          }

          // Page Size
          if (newPartial.pageSize !== undefined) {
            if (newPartial.pageSize !== DEFAULT_PAGE_SIZE) {
              next.set('pageSize', String(newPartial.pageSize));
            } else {
              next.delete('pageSize');
            }
          }

          // Page
          if (newPartial.page !== undefined && !shouldResetPage) {
            if (newPartial.page > 1) {
              next.set('page', String(newPartial.page));
            } else {
              next.delete('page');
            }
          } else if (shouldResetPage) {
            // Reset to page 1 on search, filter, or sorting changes
            next.delete('page');
          }

          return next;
        },
        { replace: options.replace ?? false }
      );
    },
    [setSearchParams]
  );

  // Debounced search effect: updates URL when user finishes typing
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (searchInput.trim() === params.search) {
      return;
    }

    const timer = setTimeout(() => {
      // Debounced search updates URL with push so user can navigate back
      updateParams({ search: searchInput }, { replace: false, resetPage: true });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, params.search, updateParams]);

  const setStatus = useCallback(
    (status: OperationStatus | 'All') => {
      updateParams({ status }, { replace: false, resetPage: true });
    },
    [updateParams]
  );

  const setSorting = useCallback(
    (sortBy: OperationSortBy, sortOrder: SortOrder) => {
      updateParams({ sortBy, sortOrder }, { replace: false, resetPage: true });
    },
    [updateParams]
  );

  const setPage = useCallback(
    (page: number) => {
      updateParams({ page }, { replace: false, resetPage: false });
    },
    [updateParams]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      updateParams({ pageSize }, { replace: false, resetPage: true });
    },
    [updateParams]
  );

  const resetAllFilters = useCallback(() => {
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: false });
  }, [setSearchParams]);

  return {
    params,
    searchInput,
    setSearchInput,
    setStatus,
    setSorting,
    setPage,
    setPageSize,
    resetAllFilters,
    rawQueryString: searchParams.toString(),
  };
}
