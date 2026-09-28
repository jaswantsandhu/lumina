import { useMemo, useState, type ReactNode } from "react";
import { cx } from "../utils";
import { Button } from "./Button";
import { EmptyState, Skeleton } from "./EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "./Table";

export interface Column<T> {
  /** Unique key; also the field read when there's no `value` or `render`. */
  key: string;
  header: ReactNode;
  /** Cell content. */
  render?: (row: T) => ReactNode;
  /** Value used for sorting (defaults to row[key]). */
  value?: (row: T) => string | number | Date | null | undefined;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /** Accessible table name. */
  caption?: string;
  /** Rows per page; 0 shows everything (default 10). */
  pageSize?: number;
  loading?: boolean;
  /** Row selection with checkboxes (controlled). */
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  defaultSort?: { key: string; direction: "asc" | "desc" };
  /**
   * On phones (under 720px): "cards" (default) shows each row as a card of
   * "Header: value" lines; "scroll" keeps the table and scrolls it sideways.
   */
  mobile?: "cards" | "scroll";
  className?: string;
}

// The text a card shows before a value: the column header if it's plain text.
const labelOf = (header: ReactNode) => (typeof header === "string" || typeof header === "number" ? String(header) : undefined);

type Sort = { key: string; direction: "asc" | "desc" } | undefined;

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

/** A data table with sortable columns, pagination, row selection, loading and empty states. */
export function DataTable<T>({ columns, rows, getRowId, caption, pageSize = 10, loading, selectedIds, onSelectionChange, onRowClick, empty, defaultSort, mobile = "cards", className }: DataTableProps<T>) {
  const [sort, setSort] = useState<Sort>(defaultSort);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const get = col.value ?? ((r: T) => (r as Record<string, unknown>)[col.key] as string | number);
    const out = [...rows].sort((a, b) => compare(get(a), get(b)));
    return sort.direction === "desc" ? out.reverse() : out;
  }, [rows, sort, columns]);

  const pages = pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const current = Math.min(page, pages - 1);
  const visible = pageSize > 0 ? sorted.slice(current * pageSize, current * pageSize + pageSize) : sorted;
  const selectable = Boolean(onSelectionChange);
  const selected = new Set(selectedIds ?? []);
  const pageIds = visible.map(getRowId);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const toggleSort = (key: string) => {
    setSort((s) => (s?.key !== key ? { key, direction: "asc" } : s.direction === "asc" ? { key, direction: "desc" } : undefined));
    setPage(0);
  };
  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange?.([...next]);
  };
  const togglePage = () => {
    const next = new Set(selected);
    pageIds.forEach((id) => (allOnPage ? next.delete(id) : next.add(id)));
    onSelectionChange?.([...next]);
  };

  const span = columns.length + (selectable ? 1 : 0);
  return (
    <div className={cx("lm-datatable", mobile === "cards" && "lm-datatable--cards", className)}>
      <Table aria-label={caption} aria-busy={loading || undefined}>
        <THead>
          <TR>
            {selectable && (
              <TH style={{ width: "2.5rem" }}>
                <input type="checkbox" className="lm-check__box" aria-label="Select all rows on this page" checked={allOnPage} onChange={togglePage} />
              </TH>
            )}
            {columns.map((c) => {
              const dir = sort?.key === c.key ? sort.direction : undefined;
              return (
                <TH key={c.key} style={{ width: c.width, textAlign: c.align }} aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : c.sortable ? "none" : undefined}>
                  {c.sortable ? (
                    <button type="button" className="lm-datatable__sort" onClick={() => toggleSort(c.key)}>
                      {c.header}
                      <span className={cx("lm-datatable__arrow", dir && "lm-datatable__arrow--active")} aria-hidden="true">
                        {dir === "desc" ? "↓" : "↑"}
                      </span>
                    </button>
                  ) : (
                    c.header
                  )}
                </TH>
              );
            })}
          </TR>
        </THead>
        <TBody>
          {loading
            ? Array.from({ length: Math.min(pageSize || 5, 5) }, (_, i) => (
                <TR key={`s${i}`}>
                  {Array.from({ length: span }, (_, j) => (
                    <TD key={j}>
                      <Skeleton width={j === 0 && selectable ? 16 : "70%"} />
                    </TD>
                  ))}
                </TR>
              ))
            : visible.map((row) => {
                const id = getRowId(row);
                return (
                  <TR
                    key={id}
                    selected={selected.has(id)}
                    className={cx(onRowClick && "lm-datatable__row--clickable")}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    // Clickable rows are reachable and usable from the keyboard too.
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
                              e.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                  >
                    {selectable && (
                      <TD onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="lm-check__box" aria-label={`Select row ${id}`} checked={selected.has(id)} onChange={() => toggleRow(id)} />
                      </TD>
                    )}
                    {columns.map((c) => (
                      <TD key={c.key} style={{ textAlign: c.align }} data-label={labelOf(c.header)}>
                        {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                      </TD>
                    ))}
                  </TR>
                );
              })}
          {!loading && visible.length === 0 && (
            <TR>
              <TD colSpan={span}>{empty ?? <EmptyState title="No rows" />}</TD>
            </TR>
          )}
        </TBody>
      </Table>
      {pageSize > 0 && sorted.length > pageSize && (
        <nav className="lm-datatable__pager" aria-label="Pagination">
          <span className="lm-datatable__count">
            {current * pageSize + 1}–{Math.min(sorted.length, (current + 1) * pageSize)} of {sorted.length}
            {selectable && selected.size > 0 && ` · ${selected.size} selected`}
          </span>
          <Button size="sm" variant="ghost" onClick={() => setPage(current - 1)} disabled={current === 0}>
            Previous
          </Button>
          <span className="lm-datatable__page" aria-current="page">
            Page {current + 1} of {pages}
          </span>
          <Button size="sm" variant="ghost" onClick={() => setPage(current + 1)} disabled={current >= pages - 1}>
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}
