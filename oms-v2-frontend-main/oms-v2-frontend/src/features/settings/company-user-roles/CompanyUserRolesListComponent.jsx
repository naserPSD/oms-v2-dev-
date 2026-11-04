"use client";
import Pagination from "@/components/common/Pagination";
import DataFilter from "@/components/common/DataFilter";
import ButtonTw from "@/components/ui/ButtonTw";
import SwitchButton from "@/components/ui/SwitchButton";
import { useCommonStore } from "@/store/useCommonStore";
import helpers from "@/utils/helpers";
import { Pencil, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BiPlus } from "react-icons/bi";
import Swal from "sweetalert2";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import { Skeleton } from "@/components/ui/skeleton";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useRouter, useSearchParams } from "next/navigation";
import debounce from "lodash/debounce";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FaFilter } from "react-icons/fa";
import Link from "next/link";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

const CompanyUserRolesListComponent = () => {
  const { t } = useTranslation();
  const { hasPermission } = useCommonFunctions();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  const initialStatusFilter = searchParams.get("status") || "";

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [filters, setFilters] = useState({
    search: initialSearch,
    status: initialStatusFilter,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);

  const toggleFilter = () => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  };

  const {
    useCompanyRolesQuery,
    deleteCompanyRoleMutation,
    toggleCompanyRoleStatusMutation,
  } = useCompanySettingsQueryApi({});

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.isActive = filters.status;
    return params;
  }, [currentPage, itemsPerPage, filters]);

  const { data: responseData, isLoading: isFetching } =
    useCompanyRolesQuery(queryParams);

  const dataArray = responseData?.data || [];
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
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: "swal-popup",
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteCompanyRoleMutation.mutateAsync(id);
      }
    });
  };

  const changeActiveStatus = async (id) => {
    await toggleCompanyRoleStatusMutation.mutateAsync(id);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL.",
        size: 50,
      },
      {
        accessorKey: "name",
        header: "Role Name",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "isActive",
        header: () => <div className="text-center w-full">Active</div>,
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="text-center">
              <SwitchButton
                onClick={() => changeActiveStatus(rowData.id)}
                enabled={rowData.isActive}
                enabledText="Yes"
                disabledText="No"
                className="!mb-0 mx-auto"
                disabled={!hasPermission("settings.company_user_roles_edit")}
              />
            </div>
          );
        },
      },
      {
        accessorKey: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="flex justify-center gap-2">
              {(hasPermission("settings.company_user_roles_edit") ||
                hasPermission("settings.company-user-roles")) && (
                <SimpleTooltip text="Edit">
                  <Link
                    className="btn-action text-blue-500 hover:text-blue-700"
                    href={`/settings/company-user-roles/${rowData.id}`}
                  >
                    <Pencil size={16} />
                  </Link>
                </SimpleTooltip>
              )}
              {hasPermission("settings.company_user_roles_delete") && (
                <SimpleTooltip text="Delete">
                  <button
                    onClick={() => handleDelete(rowData.id)}
                    className="btn-action text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </SimpleTooltip>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [hasPermission],
  );

  const table = useReactTable({
    data: listData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    [],
  );

  useEffect(() => {
    return () => debouncedUpdateSearch.cancel();
  }, [debouncedUpdateSearch]);

  const handleFilterChange = useCallback(
    (filterName, value) => {
      if (filterName === "search") {
        setGlobalFilter(value);
        debouncedUpdateSearch(value);
      } else {
        setFilters((prev) => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
      }
    },
    [debouncedUpdateSearch],
  );

  const clearAllFilters = () => {
    debouncedUpdateSearch.cancel();
    setFilters({ search: "", status: "" });
    setCurrentPage(1);
    setGlobalFilter("");
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== undefined && value !== null,
  );

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search by Name, Description...",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "status",
      label: "Select Status",
      options: dropdowns.activeInactiveList || [],
      placeholder: "Filter by Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
      className:
        "col-span-12 lg:col-span-2 sm:col-span-12 flex items-center justify-center mt-1.5",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">
          {t("Company User Roles") || "Company User Roles"}
        </h1>
        <div className="flex gap-2">
          <SimpleTooltip
            title={showFilter === "show" ? "Hide" : "Show"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw onClick={toggleFilter} variant="alternative" className="gap-2">
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>
          {hasPermission("settings.company_user_roles_add") && (
            <ButtonTw
              onClick={() => router.push("/settings/company-user-roles/new")}
              variant="blue"
              className="gap-2"
            >
              <BiPlus /> Add New
            </ButtonTw>
          )}
        </div>
      </div>

      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="table-container">
        <table className="table">
          <thead className="text-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
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
              [...Array(itemsPerPage)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Skeleton className="h-6 w-12 rounded-full mx-auto" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
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
                        cell.getContext(),
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
                  {hasActiveFilters
                    ? "No results match your search criteria"
                    : "No company roles yet. Create one to assign to staff."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        resultRows={pagination.resultRows}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
};

export default CompanyUserRolesListComponent;
