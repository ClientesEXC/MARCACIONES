import { Children, type ReactNode } from "react";
import Link from "next/link";

type DataTableProps = {
  columns: string[];
  children?: ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    getPageHref?: (page: number) => string;
  };
};

export function DataTable({
  columns,
  children,
  emptyMessage = "No hay registros disponibles",
  isLoading = false,
  pagination
}: DataTableProps) {
  const page = pagination?.page ?? 1;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);
  const previousPage = Math.max(page - 1, 1);
  const nextPage = Math.min(page + 1, totalPages);
  const hasRows = Children.count(children) > 0;

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {columns.map((column) => (
                <th className="px-4 py-3 font-semibold" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td className="px-4 py-3" key={`${rowIndex}-${column}`}>
                      <div className="h-4 w-full max-w-32 rounded bg-slate-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : hasRows ? (
              children
            ) : (
              <tr>
                <td
                  className="px-4 py-8 text-center text-slate-500"
                  colSpan={columns.length}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pagination ? (
        <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {pagination.total} registros - pagina {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            {pagination.getPageHref && page > 1 ? (
              <Link
                className="inline-flex h-9 items-center rounded-md border border-slate-200 px-3 font-medium text-slate-700 transition-colors hover:bg-slate-100"
                href={pagination.getPageHref(previousPage)}
              >
                Anterior
              </Link>
            ) : (
              <span className="inline-flex h-9 cursor-not-allowed items-center rounded-md border border-slate-200 px-3 font-medium text-slate-400">
                Anterior
              </span>
            )}
            {pagination.getPageHref && page < totalPages ? (
              <Link
                className="inline-flex h-9 items-center rounded-md border border-slate-200 px-3 font-medium text-slate-700 transition-colors hover:bg-slate-100"
                href={pagination.getPageHref(nextPage)}
              >
                Siguiente
              </Link>
            ) : (
              <span className="inline-flex h-9 cursor-not-allowed items-center rounded-md border border-slate-200 px-3 font-medium text-slate-400">
                Siguiente
              </span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
