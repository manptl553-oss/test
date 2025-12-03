import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { ReactNode, useCallback } from "react";

<<<<<<< HEAD
function Button({
=======
interface PaginationButtonProps {
  content: ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function PaginationButton({
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
  content,
  onClick,
  active = false,
  disabled = false,
<<<<<<< HEAD
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
=======
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`wf-pagination-button 
        ${active ? "wf-pagination-button--active" : ""} 
        ${disabled ? "wf-pagination-button--disabled" : ""}`}
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
    >
      {content}
    </button>
  );
}

<<<<<<< HEAD
=======
export interface PaginationProps {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  pageCount?: number;
  pageSizeOptions: number[];
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

>>>>>>> b916dd2f9979662654d2b06d437009e211054025
export const Pagination = ({
  gotoPage,
  canPreviousPage,
  canNextPage,
  pageCount,
  pageIndex,
  totalCount,
<<<<<<< HEAD
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
=======
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
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
          className="wf-pagination-select"
        >
          {perPageOptions.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>

        <span>
<<<<<<< HEAD
          Showing{" "}
          <strong>{pageIndex * perPage + 1}</strong> to{" "}
          <strong>{pageIndex * perPage + itemsInPage}</strong> of{" "}
=======
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{" "}
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
          <strong>{totalCount}</strong>
        </span>
      </div>

<<<<<<< HEAD
      {/* Page numbers */}
      <ul className="wf-pagination-pages">
        <Button
          content={<ChevronLeft />}
=======
      <ul className="wf-pagination-pages">
        <PaginationButton
          content={<ChevronLeft size={18} />}
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
          disabled={!canPreviousPage}
          onClick={() => gotoPage(pageIndex - 1)}
        />

        {renderPageLinks()}

<<<<<<< HEAD
        <Button
          content={<ChevronRight />}
=======
        <PaginationButton
          content={<ChevronRight size={18} />}
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
          disabled={!canNextPage}
          onClick={() => gotoPage(pageIndex + 1)}
        />
      </ul>
    </div>
  ) : null;
};
