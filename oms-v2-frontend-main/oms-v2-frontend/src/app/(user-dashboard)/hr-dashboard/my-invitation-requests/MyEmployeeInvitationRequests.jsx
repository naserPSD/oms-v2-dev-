// src/features/hr-dashboard/hr-notice/MyEmployeeInvitationRequestsPage.jsx
"use client";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import { debounce } from "lodash";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { isBefore } from "date-fns/isBefore";
import { parseISO } from "date-fns/parseISO";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import "suneditor/dist/css/suneditor.min.css";
import Swal from "sweetalert2";

// Components
import DataFilter from "@/components/common/DataFilter";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import { ArrowUpDown, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import HrNoticeTable from "./components/HrNoticeTable";

// Hooks & Utilities
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import helpers from "@/utils/helpers";
import NoticeAddOrUpdateModal from "./components/NoticeAddOrUpdateModal";
import { useDashboardQueryApi } from "@/hooks/queryApi/useDashboardQueryApi";
import { Skeleton } from "@/components/ui/skeleton";

const MyEmployeeInvitationRequests = () => {
  // const { t } = useTranslation();
  // const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const {
    useMyEmployeeInvitationsQuery,
    acceptEmployeeInvitationMutation,
  } = useDashboardQueryApi({});

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useMyEmployeeInvitationsQuery();

  // console.log('responseData', responseData)

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data]
  );

  const pagination = responseData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total } = pagination;

  const listData = useMemo(() => {
    return dataArray.map((item, index) => ({
      ...item,
      sl: index + 1,
    }));
  }, [dataArray]);



  const acceptInvitation = useCallback(
    async (id) => {
      Swal.fire({
        title: "Are you sure to accept this invitation?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, accept it!",
        customClass: {
          popup: "swal-popup",
          confirmButton: "swal-confirm-btn",
          cancelButton: "swal-cancel-btn",
        },
        buttonsStyling: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          await acceptEmployeeInvitationMutation.mutateAsync(id);
        }
      });
    },
    [acceptEmployeeInvitationMutation]
  );



  // TanStack Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "designation",
        header: "Designation",
        cell: ({ row }) => {
          const designation = row.original?.designation;
          return (
            <div>
              <p className="font-semibold dark-title-color">
                {designation?.name || "-"}
              </p>
              <p className="text-xs text-gray-500">
                Level: {designation?.level}
              </p>
            </div>
          );
        },
        size: 160,
      },
      {
        accessorKey: "office",
        header: "Office Info",
        cell: ({ row }) => {
          const office = row.original?.office;
          return (
            <div>
              <p className="font-semibold dark-title-color">{row.original?.application?.name}</p>
              <p className="font-semibold">{office?.name}</p>
              {office?.address?.email && (
                <p className="text-xs text-gray-500">{office?.address?.email}</p>
              )}
              <p className="font-semibold">
                <span>{office?.address?.address}, </span>
                <span>{office?.address?.postalCode}, </span>
                <span>{office?.address?.city}, </span>
                <span>{office?.address?.country}</span>
              </p>

              {office?.officeType?.name && (
                <p className="text-xs text-gray-50">{office?.officeType?.name}</p>
              )}

              <SimpleTooltip
                text={`Start: ${office?.startTime} | End: ${office?.endTime}`}
              >
                <p className="text-xs text-gray-400">
                  {helpers.dTime(office?.startTime)} -{" "}
                  {helpers.dTime(office?.endTime)}
                </p>
              </SimpleTooltip>
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: "sentAt",
        header: "Sent Date",
        cell: ({ row }) => {
          const sentAt = row.original?.sentAt;
          return (
            <p className="text-center">{sentAt ? helpers.dDateTime(sentAt) : "-"}</p>
          );
        },
        size: 120,
      },
      {
        accessorKey: "invitationStatusId",
        header: "Invitation Status",
        cell: ({ row }) => {
          return (
            <div className="action flex gap-1">
              <div className="text-center">
                <span className={`badge badge-pill badge-outline-${row.original?.status?.colorName}`}>
                  {row.original?.status?.name}
                </span>
              </div>
            </div>
          );
        },
        size: 100,
      },
      {
        accessorKey: "confirmedAt",
        header: "Confirmeation",
        cell: ({ row }) => {
          const confirmedAt = row.original?.confirmedAt;
          return (
            <div className="action flex gap-1">
              <div className="text-center">
                {confirmedAt ? helpers.dDateTime(confirmedAt) : ""}
              </div>

              {!row.original?.confirmedAt && (
                <button
                  onClick={() => acceptInvitation(row.original.id)}
                  className="btn btn-success btn-sm cursor-pointer"
                >
                  <i className="fas fa-check"></i> Accept
                </button>
              )}
            </div>
          );
        },
        size: 50,
      },
    ],
    [acceptInvitation]
  );

  // Create TanStack Table instance
  const table = useReactTable({
    data: listData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeDirection: "rtl",
  });

  const isLoading =
    isFetching ||
    acceptEmployeeInvitationMutation.isLoading;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">My Employee Invitation Requests</h1>
      </div>

      <div className="table-container">
        <table className="table">
          <thead className="text-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="text-nowrap"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp size={14} />,
                          desc: <ChevronDown size={14} />,
                        }[header.column.getIsSorted()] ??
                          (header.column.getCanSort() ? (
                            <ArrowUpDown size={14} />
                          ) : null)}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isFetching ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-30" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-6 w-30 rounded-full" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Skeleton className="h-6 w-30 rounded-full mx-auto" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Skeleton className="h-6 w-30 rounded-full mx-auto" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Skeleton className="h-6 w-30 rounded-full mx-auto" />
                  </td>
                </tr>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-gray-400"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyEmployeeInvitationRequests;
