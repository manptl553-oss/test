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
  const className = [
    "wf-pagination-button",
    active && "wf-pagination-button--active",
    disabled && "wf-pagination-button--disabled",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={className}
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
    <div className="wf-pagination">
      {/* Rows per page */}
      <div className="wf-pagination-info">
        <span>Rows per page:</span>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="wf-pagination-select"
        >
          {perPageOptions.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>

        <span>
          Showing{" "}
          <strong>{pageIndex * perPage + 1}</strong> to{" "}
          <strong>{pageIndex * perPage + itemsInPage}</strong> of{" "}
          <strong>{totalCount}</strong>
        </span>
      </div>

      {/* Page numbers */}
      <ul className="wf-pagination-pages">
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
