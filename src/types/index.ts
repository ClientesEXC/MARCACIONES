export type PaginationResult<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
};
