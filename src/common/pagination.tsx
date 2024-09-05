import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

//components
import { Select } from "@/common/select";
import { Button } from "@/common/button";

// helpers
import { cn } from "@/lib/utils";


export interface IPagination extends React.ComponentProps<"nav"> {
  total: number;
  current: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  allowSizeChange?: boolean;
  onPageSizeChange?: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100].map((size) => ({ value: size, label: size }));

function getPages(currentPage: number, totalPages: number) {
  const pages = [];

  if (totalPages <= 7) {
    for (let index = 1; index <= totalPages; index++) {
      pages.push({ value: index, label: index });
    }
  } else {
    pages.push({ value: 1, label: 1 });

    if (currentPage > 3) {
      pages.push({ label: "...", value: currentPage - 3 });
    }

    const start = currentPage + 2 >= totalPages
      ? totalPages - 2
      : Math.max(2, currentPage - 1);
    const end = currentPage + 3 >= totalPages
      ? totalPages - 1
      : Math.min(Math.max(currentPage + 1, 3), totalPages - 1);

    for (let index = start; index <= end; index++) {
      pages.push({ value: index, label: index });
    }

    if (currentPage < totalPages - 3) {
      pages.push({ label: "...", value: currentPage + 3 });
    }

    pages.push({ value: totalPages, label: totalPages });
  }

  return pages as { value: number, label: number | string }[];
}


const Pagination = (props: IPagination) => {
  const { className, total, current, pageSize, onPageChange, allowSizeChange, onPageSizeChange, ...rest } = props;

  const [currentPage, setCurrentPage] = useState(current);

  const lastPage = Math.ceil(total / pageSize);

  // methods
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange(page);
  };

  // effects
  useEffect(() => {
    setCurrentPage(current);
  }, [current]);

  // renders
  const renderPaginationItem = (page: { value: number, label: number | string }, index: number) => {
    return (
      <li key={`${index}-${page}`}>
        <Button
          variant={page.value === currentPage ? "outline" : "ghost"}
          onClick={() => handlePageChange(page.value as number)}
          className="w-10 h-10 p-0"
        >
          {
            page.label !== "..." ? page.label : <MoreHorizontal className="h-4 w-4" />
          }
        </Button>
      </li>
    );
  };

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...rest}
    >
      {
        allowSizeChange && (
          <Select
            label="Rows per page"
            labelPlacement="left"
            options={PAGE_SIZE_OPTIONS}
            value={pageSize}
            onChange={(size) => onPageSizeChange && onPageSizeChange(size as unknown as number)}
          />
        )
      }
      <ul className="flex flex-row items-center gap-1 ml-auto">
        <li>
          <Button variant="link" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
        </li>
        {
          getPages(currentPage, lastPage).map((item, index) => renderPaginationItem(item, index))
        }
        <li>
          <Button variant="link" disabled={currentPage === lastPage} onClick={() => handlePageChange(currentPage + 1)}>
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
}
Pagination.displayName = "Pagination"

export { Pagination }
