import { useState } from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  Table,
} from "@tanstack/react-table";

import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import classNames from "classnames";
import { Typography } from ".";

export interface TableProps {
  columns: ColumnDef<unknown>[];
  data: unknown[];
  sortBy?: string;
  pageSize?: number;
}

const Table = ({ columns, data, sortBy, pageSize = 9 }: TableProps) => {
  const [sorting, setSorting] = useState<SortingState>(
    sortBy ? [{ id: sortBy, desc: false }] : [],
  );

  const table = useReactTable({
    columns,
    data,
    initialState: {
      pagination: {
        pageSize,
      },
    },
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="relative overflow-scroll shadow-md no-scrollbar sm:rounded-lg">
      <table className="w-full text-gray-500 table-fixed dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-900 dark:text-gray-400">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className="px-6 py-3"
                  key={header.id}
                  colSpan={header.colSpan}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        className: `flex items-center gap-1 select-none ${
                          header.column.getCanSort() ? "cursor-pointer" : ""
                        }`,
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getCanSort() && (
                        <>
                          {{
                            asc: <FaSortUp size={10} />,
                            desc: <FaSortDown size={10} />,
                          }[header.column.getIsSorted() as string] ?? (
                            <FaSort size={10} />
                          )}
                        </>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              className="border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              key={row.id}
            >
              {row.getVisibleCells().map((cell) => (
                <td className="px-6 py-4" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination table={table} />
    </div>
  );
};

const Pagination = ({ table }: { table: Table<unknown> }) => {
  return (
    <div className="w-full py-3 text-gray-700 bg-gray-200 dark:bg-gray-900 dark:text-gray-400">
      <div className="flex justify-center gap-5 pl-5 text-sm select-none">
        <button
          className={classNames(
            "flex items-center text-gray-500 dark:text-white hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none",
            {
              "opacity-25": !table.getCanPreviousPage(),
            },
          )}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <FiArrowLeft size={20} />
        </button>

        <span className="flex items-center">
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || "1"}
          </strong>
        </span>

        <button
          className={classNames(
            "flex items-center text-gray-500 dark:text-white hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none",
            {
              "opacity-25": !table.getCanNextPage(),
            },
          )}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <FiArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Table;
