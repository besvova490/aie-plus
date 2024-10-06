import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, LoaderCircle } from "lucide-react";
import get from "lodash.get";

// components
import { Pagination, IPagination } from "./pagination";

// helpers
import { cn } from "@/lib/utils";

export enum ETableSortDirection {
  ASC = "ASC",
  DESC = "DESC"
}

export interface ITableColumn<T> {
  className?: string | ((record: T | null, column?: ITableColumn<T>) => string);
  dataIndex?: string;
  title: React.ReactNode;
  key?: string;
  headerClassName?: string;
  textAlignment?: "left" | "center" | "right";
  sorter?: ((prev: T, current: T) => number) | boolean;
  fixed?: "left" | "right";
  render?: (text: React.ReactNode, record: T, index: number) => React.ReactNode;
  colSpan?: number | ((record: T, index: number) => number);
  [key: string]: unknown;
}

export type TSortConfig = {
  direction: ETableSortDirection | null;
  dataIndex: string | null;
};

interface ITable<T> extends React.HTMLAttributes<HTMLTableElement> {
  rowKey?: string;
  dataSource?: T[];
  columns: ITableColumn<T>[];
  pagination?: IPagination;
  defaultSort?: TSortConfig;
  onSort?: (event: TSortConfig, column: ITableColumn<T>) => void;
  isLoading?: boolean;
  noDataMessage?: React.ReactNode;
  renderNoData?: (() => React.ReactNode) | null;
  onRow?: (record: T, index: number) => { className?: string };
  className?: string;
}

function Table<T = Record<string, unknown>>(props: ITable<T>) {
  const {
    dataSource,
    className,
    columns,
    pagination,
    defaultSort = null,
    onSort,
    isLoading,
    noDataMessage = "Дані не знайдені",
    renderNoData,
    onRow,
    rowKey,
    ...rest
  } = props;

  const [tableDataSource, setTableDataSource] = useState<T[]>(dataSource || []);
  const [sortDirection, setSortDirection] = useState<TSortConfig | null>(defaultSort);

  const totalPages = pagination && Math.ceil(pagination.total / pagination.pageSize);

  // methods
  const handleSort = (column: ITableColumn<T>) => {
    if (!column.sorter) {
      return;
    }
    const sortedData = typeof column.sorter === "function"
      ? tableDataSource.sort(column.sorter)
      : tableDataSource;
    
    const newSortConfig: TSortConfig = { direction: ETableSortDirection.ASC, dataIndex: column.dataIndex as string };


    if (!sortDirection || !sortDirection.direction) {
      typeof column.sorter === "function" && setTableDataSource(sortedData.reverse());

    } else if (sortDirection.direction === ETableSortDirection.ASC) {
      newSortConfig.direction = ETableSortDirection.DESC;

      typeof column.sorter === "function" && setTableDataSource(sortedData);
    } else {
      typeof column.sorter === "function" && setTableDataSource(dataSource || []);

      newSortConfig.direction = null;
      newSortConfig.dataIndex = null;
    }

    setSortDirection(newSortConfig);
    onSort && onSort(newSortConfig, column);
  }

  const checkIsSorted = (column: ITableColumn<T>, direction: ETableSortDirection) => {
    return sortDirection && sortDirection.dataIndex === column.dataIndex && sortDirection.direction === direction;
  }

  // effects
  useEffect(() => {
    if (typeof dataSource !== "undefined") {
      setTableDataSource(dataSource);
    }
  }, [JSON.stringify(dataSource)]);


  // render
  const getColumnsToRender = (record: T, index: number): ITableColumn<T>[] => {
    let colSpanIndex = 0;

    return columns.map((column, cellIndex) => {
      const colSpan = typeof column.colSpan === "function"
        ? column.colSpan(record, index)
        : column.colSpan;

      if (colSpan) {
        colSpanIndex = (colSpan - 1) + cellIndex;

        return { ...column, colSpan: colSpanIndex };
      }

      return colSpanIndex > cellIndex ? null : column;
    }).filter(Boolean) as ITableColumn<T>[];
  }

  const renderTableRow = (record: T, index: number) => {
    const rowUtils = onRow && onRow(record, index);

    const key = rowKey ? get(record, rowKey, `row-${index}`) : `row-${index}`;

    return (<tr
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        rowUtils?.className
      )}
      key={key}
    >
      {
        getColumnsToRender(record, index).map((column, cellIndex) => (
          <td
            key={`cell-${index}-${cellIndex}`}
            className={cn(
              "px-3 py-2 align-middle [&:has([role=checkbox])]:pr-0 bg-white",
              typeof column.className === "function" ? column.className(record, column) : column.className,
              column.fixed === "left" && "sticky left-0",
              column.fixed === "right" && "sticky right-0",
            )}
            colSpan={column.colSpan as number}
          >
            <div className={cn(
              "flex items-center gap-4 min-h-[40px]",
              column.textAlignment === "center" && "justify-center",
              column.textAlignment === "right" && "justify-end",
            )}>
              {
                column.render
                  ? column.render(column.dataIndex ? get(record, column.dataIndex) : null, record, index)
                  : column.dataIndex ? get(record, column.dataIndex) : null
              }
            </div>
          </td>
        ))
      }
    </tr>);
  }

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="relative w-full border-slate-200 border rounded-lg overflow-x-auto">
        <table
          className={cn("caption-bottom text-sm table-auto w-full", className)}
          {...rest}
        >
          <thead className="">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {
                columns.map((column, index) => (
                  <th
                    key={index}
                    className={cn(
                      "h-12 px-3 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0 border-b border-slate-200 whitespace-nowrap bg-white",
                      typeof column.className === "function" ? column.className(null, column) : column.className,
                      column.headerClassName,
                      column.fixed === "left" && "sticky left-0",
                      column.fixed === "right" && "sticky right-0",
                    )}
                  >
                    <div className="flex items-center justify-start gap-2 cursor-pointer" onClick={() => column.sorter && handleSort(column)}>
                      <div className="text-xs leading-5">
                        {column.title}
                      </div>
                      {
                        column.sorter && (
                          <div className="flex flex-col" data-testid="hdep-table-sort-icon">
                            <ChevronUp
                              data-testid="hdep-table-sort-icon-up"
                              className={cn("w-3 h-3 cursor-pointer transition-all duration-200", checkIsSorted(column, ETableSortDirection.DESC) && "text-primary")}
                            />
                            <ChevronDown
                              data-testid="hdep-table-sort-icon-down"
                              className={cn("w-3 h-3 -mt-1.5 cursor-pointer transition-all duration-200", checkIsSorted(column, ETableSortDirection.ASC) && "text-primary")}
                            />
                          </div>
                        )
                      }
                    </div>
                  </th>
                ))
              }
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            { tableDataSource.map((record, index) => renderTableRow(record, index)) }
            {
              tableDataSource.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={columns.length} className="p-4 text-center text-slate-400">
                    {
                      renderNoData
                        ? renderNoData()
                        : noDataMessage
                    }
                  </td>
                </tr>
              )
            }
            {
              isLoading && !tableDataSource?.length && (
                <tr>
                  <td colSpan={columns.length} className="p-4 text-center text-slate-400">
                    <div className="flex items-center justify-center w-full min-h-20"/>
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
      {
        !!pagination && !!totalPages && <Pagination {...pagination}/>
      }
      <div className={cn(
        "absolute w-full h-full flex items-center justify-center bg-slate-100 bg-opacity-40 transition-all duration-300",
        !isLoading && "opacity-0 pointer-events-none"
      )} data-testid="hdep-table-loader">
        <LoaderCircle className="h-10 w-10 animate-spin-slow text-slate-900"/>
      </div>
    </div>
  );
}

export { Table }
