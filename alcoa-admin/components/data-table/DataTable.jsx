"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { InlineSkeleton } from "@/components/loading/skeleton-kit";
import { EmptyState } from "@/components/shared/EmptyState";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

function SortableHeader({ column, children }) {
  if (!column.getCanSort()) {
    return <span className="truncate">{children}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="truncate">{children}</span>
      <span className="inline-flex shrink-0" aria-hidden>
        {sorted === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5 text-foreground" />
        ) : sorted === "desc" ? (
          <ArrowDown className="h-3.5 w-3.5 text-foreground" />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/70" />
        )}
      </span>
    </div>
  );
}

export function DataTable({
  columns,
  data = [],
  isLoading = false,
  /** Background refetch (e.g. React Query isFetching) — subtle dim without hiding rows */
  isFetching = false,
  searchable = true,
  searchPlaceholder = "Search…",
  toolbar,
  pagination: showPagination = true,
  pageSize: defaultPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  onRowClick,
  emptyMessage = "No records found.",
  emptyIcon = "default",
  emptyDescription,
  emptyAction,
  getRowClassName,
  /** Server-side pagination */
  manualPagination = false,
  pageCount,
  totalRecords,
  paginationState,
  onPaginationChange,
  /** Server-side search — disables client global filter */
  serverSearch = false,
  searchValue,
  onSearchChange,
  card = true,
  /** Initial column sort, e.g. [{ id: "name", desc: false }] */
  defaultSorting = [],
}) {
  const [sorting, setSorting] = useState(defaultSorting);
  const [columnFilters, setColumnFilters] = useState([]);
  const [localSearch, setLocalSearch] = useState("");
  const [localPagination, setLocalPagination] = useState({ pageIndex: 0, pageSize: defaultPageSize });

  const globalFilter = serverSearch ? "" : localSearch;
  const displaySearch = serverSearch ? (searchValue ?? "") : localSearch;

  const pagination = paginationState ?? localPagination;
  const setPagination = onPaginationChange ?? setLocalPagination;

  useEffect(() => {
    if (!serverSearch) return;
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }, [searchValue, serverSearch, setPagination]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: serverSearch ? undefined : setLocalSearch,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(manualPagination
      ? {}
      : {
          getFilteredRowModel: getFilteredRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
        }),
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
  });

  const inner = (
    <>
      {/* Toolbar */}
      {(searchable || toolbar) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <div className="relative w-full sm:max-w-sm sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={displaySearch}
                onChange={(e) => {
                  const next = e.target.value;
                  if (serverSearch) {
                    onSearchChange?.(next);
                  } else {
                    setLocalSearch(next);
                    table.setPageIndex(0);
                  }
                }}
                className="pl-9 border-border bg-card shadow-sm focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>
          )}
          {toolbar && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end">
              {toolbar}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div
        className={cn(
          "rounded-lg border border-border/70 bg-card overflow-hidden relative transition-opacity",
          isFetching && !isLoading && "opacity-70"
        )}
      >
        {isFetching && !isLoading && (
          <div
            className="absolute right-2 top-2 z-10 flex items-center gap-2 rounded-md border border-border/80 bg-background/95 px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <InlineSkeleton />
            <span>Refreshing…</span>
          </div>
        )}
        <div className="overflow-x-auto">
        <Table className="table-fixed min-w-max w-full">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-b border-border/60 bg-card hover:bg-card">
                {hg.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      header.column.getCanSort()
                        ? sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                    className={cn(
                      "bg-muted/20 text-xs font-semibold uppercase tracking-wide",
                      header.column.getCanSort() && "cursor-pointer select-none hover:bg-muted/40"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      width: header.getSize(),
                      minWidth: header.getSize(),
                      maxWidth: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <SortableHeader column={header.column}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </SortableHeader>
                    )}
                  </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="bg-card hover:bg-card">
                  {table.getHeaderGroups()[0]?.headers.map((header) => (
                    <TableCell
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        minWidth: header.getSize(),
                        maxWidth: header.getSize(),
                      }}
                    >
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "bg-card hover:bg-muted/25 even:bg-muted/[0.03]",
                    onRowClick && "cursor-pointer",
                    getRowClassName?.(row.original)
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                        maxWidth: cell.column.getSize(),
                      }}
                    >
                      <div
                        className={cn(
                          "min-w-0",
                          cell.column.id === "customerName" &&
                            "break-words [overflow-wrap:anywhere] leading-snug",
                          cell.column.id === "actions" && "flex justify-end",
                          cell.column.id === "status" && "whitespace-nowrap",
                          cell.column.id !== "customerName" &&
                            cell.column.id !== "actions" &&
                            cell.column.id !== "status" &&
                            "truncate"
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="bg-card hover:bg-card">
                <TableCell colSpan={columns.length} className="h-auto p-0">
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyMessage}
                    description={emptyDescription ?? "Try adjusting your search or filters."}
                    action={emptyAction}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {manualPagination
              ? `${totalRecords ?? 0} record(s)`
              : `${table.getFilteredRowModel().rows.length} record(s)`}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Rows per page
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                value={pagination.pageSize}
                onChange={(e) => {
                  const size = Number(e.target.value);
                  setPagination({ pageIndex: 0, pageSize: size });
                }}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {pagination.pageIndex + 1} / {manualPagination ? (pageCount || 1) : (table.getPageCount() || 1)}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );

  if (card) {
    return (
      <Card>
        <CardContent className="space-y-4 p-3 sm:p-4">{inner}</CardContent>
      </Card>
    );
  }

  return <div className="space-y-4">{inner}</div>;
}
