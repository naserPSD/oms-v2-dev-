"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import DataFilter from "@/components/common/DataFilter";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useCommonStore } from "@/store/useCommonStore";
import helpers, { toaster } from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Eye,
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BiPlus } from "react-icons/bi";
import Swal from "sweetalert2";
import { z } from "zod";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import { Skeleton } from "@/components/ui/skeleton";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import debounce from "lodash/debounce";

// Import TanStack Table
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FaFilter } from "react-icons/fa";
import ButtonTw2 from "@/components/ui/ButtonTw2";
import Link from "next/link";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

const RoleListComponent = () => {
  const { t } = useTranslation();
  const { hasPermission } = useCommonFunctions();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Determine base path — admin vs subscriber context
  const basePath = pathname?.startsWith('/admin')
    ? '/admin/settings/roles-and-permissions'
    : '/settings/roles-and-permissions';
  const user = useAuthStore((state) => state.user);
  const dropdowns = useCommonStore((state) => state.dropdowns);

  // Get initial values from URL search params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  const initialIsSystemFilter = searchParams.get("isSystem") || "";
  const initialStatusFilter = searchParams.get("status") || "";

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );

  const toggleFilter = () => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  };

  // Define search filter state
  const [filters, setFilters] = useState({
    search: initialSearch,
    isSystem: initialIsSystemFilter,
    status: initialStatusFilter,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);
  const [copiedRows, setCopiedRows] = useState({});

  // Zod schema for service information
  const schema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, "Role name is required"),
    description: z.string().optional(),
    isSystem: z.boolean().default(false),
    isActive: z.boolean().default(true),
  });

  const initialValues = {
    id: 0,
    name: "",
    description: "",
    isSystem: false,
    isActive: true,
  };

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = () => {
    reset(initialValues);
    setShowModal(false);
  };

  const handleEdit = (item) => {
    reset(item);
    setShowModal(true);
  };

  const {
    useRolesQuery,
    addOrUpdateRoleMutation,
    deleteRoleMutation,
    toggleRoleStatusMutation,
    toggleRoleIsSystemStatusMutation,
  } = useCompanySettingsQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (filters.search) params.search = filters.search;
    if (filters.isSystem) params.isSystem = filters.isSystem;
    if (filters.status) params.isActive = filters.status;

    return params;
  }, [currentPage, itemsPerPage, filters]);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useRolesQuery(queryParams);

  const dataArray = responseData?.data || [];
  const pagination = responseData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total, lastPage } = pagination;

  const listData = useMemo(() => {
    return dataArray.map((item) => {
      const parent = dataArray.find((p) => p.id === item.parentId);
      const permissionType = dropdowns.permissionTypeList?.find(
        (p) => p.value === item.type,
      );
      return {
        ...item,
        parentName: parent?.name,
        typeName: permissionType?.label,
        sl: (currentPage - 1) * itemsPerPage + dataArray.indexOf(item) + 1,
      };
    });
  }, [dataArray, dropdowns.permissionTypeList, currentPage, itemsPerPage]);

  const parentPermissionList = dataArray
    ?.filter((item) => item.parentId === null)
    .map((item) => {
      item.value = item.id;
      item.label = item.name;
      return Object.assign({}, item);
    });

  // Define columns for TanStack Table
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
        size: 50,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }) => getValue() || "-",
        size: 50,
      },
      {
        accessorKey: "isSystem",
        header: () => <div className="text-center w-full">System Role</div>,
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="text-center">
              <SwitchButton
                onClick={() => changeIsSystemStatus(rowData.id)}
                enabled={rowData.isSystem}
                enabledText="Yes"
                disabledText="No"
                className="!mb-0 mx-auto"
                disabled={!hasPermission("settings.role_list_edit")}
              />
            </div>
          );
        },
        size: 50,
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
                disabled={!hasPermission("settings.role_list_edit")}
              />
            </div>
          );
        },
        size: 50,
      },
      {
        accessorKey: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="flex justify-center gap-2">
              {hasPermission("settings.view_role") && (
                <SimpleTooltip text="View Role">
                  <Link
                    className="btn-action text-blue-500 hover:text-blue-700"
                    href={`${basePath}/${rowData.id}`}
                  >
                    <Eye size={16} />
                  </Link>
                </SimpleTooltip>
              )}
              {hasPermission("settings.role_list_edit") && (
                <SimpleTooltip text="Edit">
                  <Link
                    className="btn-action text-blue-500 hover:text-blue-700"
                    href={`${basePath}/${rowData.id}`}
                  >
                    <Pencil size={16} />
                  </Link>
                </SimpleTooltip>
              )}
              {hasPermission("settings.role_list_delete") && (
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
        size: 50,
      },
    ],
    [copiedRows],
  );

  // Create TanStack Table instance
  const table = useReactTable({
    data: listData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeDirection: "rtl",
  });
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.isSystem) params.set("isSystem", filters.isSystem);
    if (filters.status) params.set("status", filters.status);

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // Debounced updater for search filter only
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    [],
  );

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateSearch.cancel();
    };
  }, [debouncedUpdateSearch]);

  const handleFilterChange = useCallback(
    (filterName, value) => {
      if (filterName === "search") {
        setGlobalFilter(value);
        debouncedUpdateSearch(value);
      } else {
        // For other filters, update immediately
        setFilters((prev) => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
      }
    },
    [debouncedUpdateSearch],
  );

  const clearAllFilters = () => {
    debouncedUpdateSearch.cancel();
    setFilters({
      search: "",
      isSystem: "",
      status: "",
    });
    setCurrentPage(1);
    setGlobalFilter();

    // Clear URL params as well
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const submitForm = async (values) => {
    await addOrUpdateRoleMutation.mutateAsync(values);
  };

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
        await deleteRoleMutation.mutateAsync(id);
      }
    });
  };

  const changeActiveStatus = async (id) => {
    await toggleRoleStatusMutation.mutateAsync(id);
  };

  const changeIsSystemStatus = async (id) => {
    await toggleRoleIsSystemStatusMutation.mutateAsync(id);
  };

  const isLoading =
    isFetching ||
    addOrUpdateRoleMutation.isLoading ||
    deleteRoleMutation.isLoading ||
    toggleRoleStatusMutation.isLoading ||
    toggleRoleIsSystemStatusMutation.isLoading;

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== undefined && value !== null,
  );

  // Filter configuration
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
      name: "isSystem",
      label: "Select System Role",
      options: dropdowns.systemNonSystemRoleList || [],
      placeholder: "Filter by System Role",
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
        <h1 className="title-color font-bold text-lg">Role List</h1>
        <div className="flex gap-2">
          <SimpleTooltip
            title={showFilter === "show" ? "Hide" : "Show"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw
              onClick={() => toggleFilter()}
              variant="alternative"
              className="gap-2"
            >
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>
          {/* <ButtonTw
            onClick={() => setShowModal(true)}
            variant="blue"
            className="gap-2"
          >
            <BiPlus /> Add New
          </ButtonTw> */}

          {hasPermission("settings.role_list_add") && (
            <ButtonTw
              onClick={() => {
                router.push(`${basePath}/new`);
              }}
              variant="blue"
              className="gap-2"
            >
              <BiPlus /> Add New
            </ButtonTw>
          )}

          {/* <Link
            className="btn-action text-blue-500 hover:text-blue-700"
            href={`/settings/roles-and-permissions/${rowData.id}`}
          >
            <BiPlus /> Add New
          </Link> */}
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
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
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
                    : "No data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        resultRows={pagination.resultRows}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Role`}
        size="3xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-12 gap-x-4">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  label="Role Name"
                  placeholder="Enter role name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <Input
                  label="Role Description"
                  placeholder="Enter role description"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="isSystem"
              render={({ field, fieldState }) => (
                <SwitchButton
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Is System Role?"
                  className="col-span-12 lg:col-span-3 sm:col-span-12"
                  error={fieldState.error?.message}
                  enabledText="Yes"
                  disabledText="No"
                />
              )}
            />

            <Controller
              control={control}
              name="isActive"
              render={({ field, fieldState }) => (
                <SwitchButton
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Active"
                  className="col-span-12 lg:col-span-3 sm:col-span-12"
                  error={fieldState.error?.message}
                  enabledText="Yes"
                  disabledText="No"
                />
              )}
            />

            <div className="col-span-12 flex justify-center items-center gap-4">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-4 col-span-12"
                disabled={isLoading}
                loading={isLoading}
              >
                Submit
              </ButtonTw>

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold mt-4 col-span-12"
                onClick={() => reset()}
              >
                Reset
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default RoleListComponent;
