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
      className={`wf-pagination-button 
        ${active ? "wf-pagination-button--active" : ""} 
        ${disabled ? "wf-pagination-button--disabled" : ""}`}
    >
      {content}
    </button>
  );
}

export interface PaginationProps {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  pageCount?: number;
  pageSizeOptions: number[];
  onPageChange: (pageIndex: number) => void;
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
  const pageCount =
    externalPageCount ??
    (totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0);

  if (pageCount === 0) return null;

  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  const visiblePageButtonCount = 3;

  const getVisiblePages = () => {
    if (pageCount <= visiblePageButtonCount) {
      return Array.from({ length: pageCount }, (_, i) => i);
    }

    const pages = [pageIndex];
    while (pages.length < visiblePageButtonCount) {
      const first = pages[0];
      const last = pages[pages.length - 1];

      if (first > 0) pages.unshift(first - 1);
      if (pages.length < visiblePageButtonCount && last < pageCount - 1) {
        pages.push(last + 1);
      }

      if (first === 0 && last === pageCount - 1) break;
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  const startItem = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem =
    totalCount === 0 ? 0 : Math.min(totalCount, (pageIndex + 1) * pageSize);

  return (
    <div className="wf-pagination">
      <div className="wf-pagination-info">
        <span className="wf-pagination-text">Rows per page:</span>

        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="wf-pagination-select"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <span>
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{" "}
          <strong>{totalCount}</strong>
        </span>
      </div>

      <ul className="wf-pagination-pages">
        <PaginationButton
          content={<ChevronLeft size={18} />}
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
          content={<ChevronRight size={18} />}
          disabled={!canNextPage}
          onClick={() => canNextPage && onPageChange(pageIndex + 1)}
        />
      </ul>
    </div>
  );
};
