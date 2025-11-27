import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { ReactNode, useCallback } from "react";

function Button({
  content,
  onClick,
  active = false,
  disabled = false,
}: {
  content: ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm border transition-colors
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
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}

export const Pagination = ({
  gotoPage,
  canPreviousPage,
  canNextPage,
  pageCount,
  pageIndex,
  totalCount,
  perPage,
  perPageOptions,
  itemsInPage,
  onPerPageChange,
}: {
  gotoPage: (idx: number) => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  pageCount: number;
  totalCount: number;
  pageIndex: number;
  perPage: number;
  perPageOptions: number[];
  itemsInPage: number;
  onPerPageChange: (idx: number) => void;
}) => {
  const renderPageLinks = useCallback(() => {
    if (pageCount === 0) return null;

    const visiblePageButtonCount = 3;
    let numberOfButtons = Math.min(pageCount, visiblePageButtonCount);

    const pageNumbers = [pageIndex];
    numberOfButtons--;

    [...Array(numberOfButtons)].forEach((_v, i) => {
      const before = pageNumbers[0] - 1;
      const after = pageNumbers[pageNumbers.length - 1] + 1;

      if (before >= 0 && (i < numberOfButtons / 2 || after >= pageCount)) {
        pageNumbers.unshift(before);
      } else {
        if (after < pageCount) pageNumbers.push(after);
      }
    });

    return pageNumbers.map((idx) => (
      <li key={idx}>
        <Button
          content={idx + 1}
          onClick={() => gotoPage(idx)}
          active={idx === pageIndex}
        />
      </li>
    ));
  }, [pageCount, pageIndex, gotoPage]);

  return pageCount ? (
    <div className="flex justify-between items-center flex-wrap gap-y-4 mt-4 text-(--wf-text-default)">
      {/* Rows per page */}
      <div className="text-sm flex items-center gap-3 text-(--wf-text-default)">
        <span>Rows per page:</span>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="border border-(--wf-border-default) bg-(--wf-background-subtle) text-(--wf-text-default) rounded-lg px-2 py-1"
        >
          {perPageOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <span>
          Showing <strong>{pageIndex * perPage + 1}</strong> to{" "}
          <strong>{pageIndex * perPage + itemsInPage}</strong> of{" "}
          <strong>{totalCount}</strong>
        </span>
      </div>

      {/* Page numbers */}
      <ul className="flex gap-2">
        <Button
          content={<ChevronLeft />}
          disabled={!canPreviousPage}
          onClick={() => gotoPage(pageIndex - 1)}
        />

        {renderPageLinks()}

        <Button
          content={<ChevronRight />}
          disabled={!canNextPage}
          onClick={() => gotoPage(pageIndex + 1)}
        />
      </ul>
    </div>
  ) : null;
};
