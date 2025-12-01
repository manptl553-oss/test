// shared/components/Pagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface PaginationButtonProps {
  content: ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function PaginationButton({
  content,
  onClick,
  active = false,
  disabled = false,
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center w-9 h-9 rounded-lg text-sm border transition-colors
        ${
          active
            ? "bg-(--wf-brand-primary) text-(--wf-text-inverted) border-(--wf-brand-primary)"
            : "text-(--wf-text-muted) border-(--wf-border-default)"
        }
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-(--wf-background-subtle) hover:text-(--wf-text-default)"
        }
      `}
    >
      {content}
    </button>
  );
}

export interface PaginationProps {
  /** 0-based page index */
  pageIndex: number;
  /** Items per page */
  pageSize: number;
  /** Total items in all pages */
  totalCount: number;
  /** Total number of pages (optional, will be derived from totalCount if not provided) */
  pageCount?: number;
  /** Page size options for the select dropdown */
  pageSizeOptions: number[];

  /** Called when user changes page (0-based index) */
  onPageChange: (pageIndex: number) => void;
  /** Called when user changes page size */
  onPageSizeChange: (pageSize: number) => void;
}

export const Pagination = ({
  pageIndex,
  pageSize,
  totalCount,
  pageCount: externalPageCount,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) => {
  // Derive page count if not provided
  const pageCount =
    externalPageCount ?? (totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0);

  // No pages → no pagination UI
  if (pageCount === 0) return null;

  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  const visiblePageButtonCount = 3;

  const getVisiblePages = (): number[] => {
    if (pageCount <= visiblePageButtonCount) {
      return Array.from({ length: pageCount }, (_, i) => i);
    }

    const pages: number[] = [pageIndex];

    // Fill remaining slots around current page
    while (pages.length < visiblePageButtonCount) {
      const first = pages[0];
      const last = pages[pages.length - 1];

      if (first > 0) pages.unshift(first - 1);
      if (pages.length < visiblePageButtonCount && last < pageCount - 1) {
        pages.push(last + 1);
      }

      // Safety to avoid infinite loop (shouldn't happen)
      if (first === 0 && last === pageCount - 1) break;
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const startItem =
    totalCount === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem =
    totalCount === 0
      ? 0
      : Math.min(totalCount, (pageIndex + 1) * pageSize);

  return (
    <div className="flex justify-between items-center flex-wrap gap-y-4 mt-4 text-(--wf-text-default)">
      {/* Rows per page + range info */}
      <div className="text-sm flex items-center gap-3">
        <span className="text-xs md:text-sm xl:text-base hidden sm:block mr-1">
          Rows per page:
        </span>

        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="!border max-w-12 min-w-12 min-h-10 max-h-10 p-1.5 !border-borderlight bg-(--wf-background-subtle) text-(--wf-text-default) rounded-lg px-2 py-1"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <span>
          Showing <strong>{startItem}</strong> to{" "}
          <strong>{endItem}</strong> of{" "}
          <strong>{totalCount}</strong>
        </span>
      </div>

      {/* Paging controls */}
      <ul className="flex gap-2">
        <PaginationButton
          content={<ChevronLeft />}
          disabled={!canPreviousPage}
          onClick={() => canPreviousPage && onPageChange(pageIndex - 1)}
        />

        {visiblePages.map((idx) => (
          <li key={idx}>
            <PaginationButton
              content={idx + 1}
              active={idx === pageIndex}
              onClick={() => onPageChange(idx)}
            />
          </li>
        ))}

        <PaginationButton
          content={<ChevronRight />}
          disabled={!canNextPage}
          onClick={() => canNextPage && onPageChange(pageIndex + 1)}
        />
      </ul>
    </div>
  );
};
