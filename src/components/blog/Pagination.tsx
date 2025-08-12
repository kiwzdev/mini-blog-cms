import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  getPageNumbers: (visiblePages?: number) => number[];
  isLoading?: boolean;
  showInfo?: boolean;
  paginationInfo?: string;
  visiblePages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onNextPage,
  onPreviousPage,
  onFirstPage,
  onLastPage,
  getPageNumbers,
  isLoading = false,
  showInfo = true,
  paginationInfo = "",
  visiblePages = 5,
}) => {
  const pageNumbers = getPageNumbers(visiblePages);

  if (totalPages <= 1) {
    return showInfo && paginationInfo ? (
      <div className="flex justify-center py-4">
        <span className="text-sm text-gray-500">{paginationInfo}</span>
      </div>
    ) : null;
  }

  return (
    <div className="flex flex-col items-center space-y-4 py-6">
      {/* Pagination Info */}
      {showInfo && paginationInfo && (
        <div className="text-sm text-gray-600">{paginationInfo}</div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {/* First Page Button */}
        <button
          onClick={onFirstPage}
          disabled={!hasPreviousPage || isLoading}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ««
        </button>

        {/* Previous Page Button */}
        <button
          onClick={onPreviousPage}
          disabled={!hasPreviousPage || isLoading}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          «
        </button>

        {/* Page Numbers */}
        <div className="flex space-x-1">
          {/* Show ellipsis at start if needed */}
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                disabled={isLoading}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="px-3 py-2 text-sm text-gray-500">...</span>
              )}
            </>
          )}

          {/* Page number buttons */}
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              className={`px-3 py-2 text-sm font-medium rounded-md disabled:opacity-50 ${
                page === currentPage
                  ? "text-white bg-blue-600 border border-blue-600"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Show ellipsis at end if needed */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-3 py-2 text-sm text-gray-500">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={isLoading}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Page Button */}
        <button
          onClick={onNextPage}
          disabled={!hasNextPage || isLoading}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          »
        </button>

        {/* Last Page Button */}
        <button
          onClick={onLastPage}
          disabled={!hasNextPage || isLoading}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          »»
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && <div className="text-sm text-gray-500">Loading...</div>}
    </div>
  );
};

// Simple pagination component (minimal version)
export const SimplePagination: React.FC<{
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  isLoading?: boolean;
}> = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  isLoading = false,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center py-4">
      <button
        onClick={onPreviousPage}
        disabled={!hasPreviousPage || isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={onNextPage}
        disabled={!hasNextPage || isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};
    