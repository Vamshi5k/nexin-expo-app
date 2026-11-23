import type { AxiosResponse } from 'axios';

/** Most responses: { success, message, data, pagination? }. */
export type Envelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
};

/** Backend is inconsistent: some endpoints send currentPage, others page. */
export type Pagination = {
  currentPage?: number;
  page?: number;
  totalPages?: number;
  total?: number;
  limit?: number;
};

export type Page<T> = { items: T[]; page: number; totalPages: number };

export function unwrap<T>(res: AxiosResponse<Envelope<T>>): T {
  return res.data.data;
}

/** Normalises pagination in one place. */
export function toPage<T>(res: AxiosResponse<Envelope<T[] | null | undefined>>): Page<T> {
  const p = res.data.pagination;
  return {
    items: res.data.data ?? [],
    page: p?.currentPage ?? p?.page ?? 1,
    totalPages: p?.totalPages ?? 1,
  };
}

/** For useInfiniteQuery getNextPageParam. */
export function nextPage<T>(page: Page<T>): number | undefined {
  return page.page < page.totalPages ? page.page + 1 : undefined;
}
