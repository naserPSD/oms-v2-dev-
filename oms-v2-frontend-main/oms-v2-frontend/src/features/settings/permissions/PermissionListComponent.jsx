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
import { useSearchParams } from "next/navigation";
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
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

const PermissionListComponent = () => {
  const { t } = useTranslation();
  const { hasPermission } = useCommonFunctions();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const menuPositionList =
    dropdowns.statusGroupList?.find((s) => s.code === "menu_positions")
      ?.statuses ?? [];

  // Get initial values from URL search params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  const initialTypeFilter = searchParams.get("type") || "";
  const initialParentIdFilter = searchParams.get("parentId") || "";
  const initialMenuPositionIdFilter = searchParams.get("menuPositionId") || "";
  const initialAccessPanelFilter = searchParams.get("accessPanel") || "";
  const initialIsRequiredFilter = searchParams.get("isRequired") || "";
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
    type: initialTypeFilter,
    parentId: initialParentIdFilter,
    menuPositionId: initialMenuPositionIdFilter,
    accessPanel: initialAccessPanelFilter,
    isRequired: initialIsRequiredFilter,
    isSystem: initialIsSystemFilter,
    status: initialStatusFilter,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);
  const [copiedRows, setCopiedRows] = useState({});

  // Zod schema for service information
  const schema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, "Permission name is required"),
    code: z.string().min(1, "Permission code is required"),
    type: z.string().min(1, "Permission type is required"),
    accessPanel: z.enum(["Admin", "Company"]).default("Company"),
    description: z.string().optional(),
    path: z.string().optional(),
    icon: z.string().optional(),
    sortOrder: z.coerce.number().optional(),
    parentId: z.coerce.number().optional().default(undefined),
    menuPositionId: z.coerce.number().optional().default(undefined),
    isActive: z.boolean().default(true),
    isSystem: z.boolean().default(false),
    isRequired: z.boolean().default(true),
  });

  const initialValues = {
    id: 0,
    parentId: undefined,
    menuPositionId: undefined,
    accessPanel: "Company",
    type: undefined,
    name: "",
    code: "",
    description: "",
    path: "",
    icon: "",
    sortOrder: 0,
    isActive: true,
    isRequired: true,
    isSystem: false,
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
    item.parentId = item.parent?.id || null;
    item.accessPanel = item.accessPanel || "Company";
    reset(item);
    setShowModal(true);
  };

  const {
    usePermissionsQuery,
    useAllModulePermissionsQuery,
    addOrUpdatePermissionMutation,
    deletePermissionMutation,
    togglePermissionStatusMutation,
    togglePermissionSystemStatusMutation,
    togglePermissionRequireStatusMutation,
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
      // Keep modules in sidebar/menu order so Settings (id=1) is not pushed to last page
      sort: "sortOrder:ASC,id:ASC",
    };

    if (filters.search) params.search = filters.search;
    if (filters.type) params.type = filters.type;
    if (filters.parentId) params.parentId = filters.parentId;
    if (filters.menuPositionId) params.menuPositionId = filters.menuPositionId;
    if (filters.accessPanel) params.accessPanel = filters.accessPanel;
    if (filters.isRequired) params.isRequired = filters.isRequired;
    if (filters.isSystem) params.isSystem = filters.isSystem;
    if (filters.status) params.isActive = filters.status;

    return params;
  }, [currentPage, itemsPerPage, filters]);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    usePermissionsQuery(queryParams);

  const dataArray = responseData?.data || [];
  const pagination = responseData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total, lastPage } = pagination;

  const addPaymentDashboardPermission = async () => {
    const existingPermission = dataArray.find(
      (permission) => permission.path === "/admin/payment-dashboard" ||
        permission.code === "payment.dashboard" ||
        permission.code === "admin.payment_dashboard",
    );

    if (existingPermission) {
      toaster("Payment Dashboard permission already exists", "info");
      return;
    }

    const menuType = (dropdowns.permissionTypeList || []).find((option) =>
      [option.value, option.label, option.name, option.code]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes("menu")),
    );

    if (!menuType) {
      toaster("Menu permission type is not configured", "error");
      return;
    }

    const paymentsParent = allModulePermissionsList.find((permission) =>
      [permission.name, permission.label, permission.code]
        .filter(Boolean)
        .some((value) => ["payments", "payment"].includes(String(value).toLowerCase())),
    );

    await addOrUpdatePermissionMutation.mutateAsync({
      id: 0,
      parentId: paymentsParent?.value || paymentsParent?.id || null,
      menuPositionId: null,
      name: "Payment Dashboard",
      code: "payment.dashboard",
      type: menuType.value || menuType.id || menuType.code,
      description: "Admin payment dashboard",
      path: "/admin/payment-dashboard",
      icon: "",
      sortOrder: 1,
      isActive: true,
      isSystem: false,
      isRequired: false,
    });
  };

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

  // const parentPermissionList = dataArray?.filter((item) => item.parentId === null).map((item) => {
  //   item.value = item.id
  //   item.label = item.name
  //   return Object.assign({}, item)
  // });

  const { data: allModulePermissionsList = [] } =
    useAllModulePermissionsQuery();

  // Define columns for TanStack Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL.",
        size: 50,
      },
      {
        accessorKey: "typeName",
        header: "Type",
        cell: ({ getValue }) => getValue() || "-",
        size: 50,
      },
      {
        accessorKey: "accessPanel",
        header: "Access Panel",
        cell: ({ row }) => {
          const rowData = row.original;
          const isAdmin = rowData.accessPanel === "Admin";
          return (
            <span
              className={`badge badge-rounded font-semibold text-xs px-2 py-0.5 ${
                isAdmin
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-400"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-400"
              }`}
            >
              {rowData.accessPanel || "Company"}
            </span>
          );
        },
        size: 90,
      },
      {
        accessorKey: "name",
        header: "Name & Code",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="flex flex-col items-start gap-y-2">
              <SimpleTooltip text={"Name"}>
                <span>{rowData.name}</span>
              </SimpleTooltip>
              <div className="flex items-center gap-1">
                <SimpleTooltip text={"Permission Code"}>
                  <span className="badge badge-rounded badge-outline-success">
                    {rowData.code}
                  </span>
                </SimpleTooltip>
                <SimpleTooltip className="relative" text={"Click to copy"}>
                  <i
                    onClick={() => {
                      navigator.clipboard.writeText(rowData.code);
                      setCopiedRows((prevCopiedRows) => ({
                        ...prevCopiedRows,
                        [row.id]: true,
                      }));
                      setTimeout(() => {
                        setCopiedRows((prevCopiedRows) => ({
                          ...prevCopiedRows,
                          [row.id]: false,
                        }));
                      }, 1000);
                    }}
                    className="fa-regular fa-copy cursor-pointer text-md text-gray-700 dark:text-gray-300 hover:text-gray-500 hover:scale-[1.2]"
                  ></i>
                  {copiedRows[row.id] && (
                    <span className={`copied-text`}>Copied!</span>
                  )}
                </SimpleTooltip>
              </div>
              <SimpleTooltip text={"Description"}>
                <span>{rowData.description}</span>
              </SimpleTooltip>
            </div>
          );
        },
        size: 220,
      },
      {
        accessorKey: "parent",
        header: "Parent",
        cell: ({ getValue }) => getValue() || "-",
        cell: ({ row }) => {
          const rowData = row.original;
          return <span>{rowData.parent?.name}</span>;
        },
        size: 100,
      },
      {
        accessorKey: "sortOrder",
        header: "Menu Info",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="flex flex-col items-start">
              <span>
                Menu Icon:{" "}
                <span dangerouslySetInnerHTML={{ __html: rowData.icon }}></span>
              </span>
              <span className="text-blue-500">Path: {rowData.path || "-"}</span>
              <SimpleTooltip text={"Menu Order"}>
                <span className="badge badge-circle badge-secondary">
                  {rowData.sortOrder}
                </span>
              </SimpleTooltip>
            </div>
          );
        },
        size: 250,
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
                 disabled={!hasPermission("settings.permission_list_edit")}
              />
            </div>
          );
        },
        size: 50,
      },
      {
        accessorKey: "isRequired",
        header: () => <div className="text-center w-full">Required</div>,
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="text-center">
              <SwitchButton
                onClick={() => changeRequireStatus(rowData.id)}
                enabled={rowData.isRequired}
                enabledText="Yes"
                disabledText="No"
                className="!mb-0 mx-auto"
                 disabled={!hasPermission("settings.permission_list_edit")}
              />
            </div>
          );
        },
        size: 50,
      },
      {
        accessorKey: "isSystem",
        header: () => <div className="text-center w-full">System</div>,
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="text-center">
              <SwitchButton
                onClick={() => changeSystemStatus(rowData.id)}
                enabled={rowData.isSystem}
                enabledText="Yes"
                disabledText="No"
                className="!mb-0 mx-auto"
                 disabled={!hasPermission("settings.permission_list_edit")}
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
              {hasPermission("settings.permission_list_edit") && (
                <SimpleTooltip text="Edit">
                  <button
                    onClick={() => handleEdit(rowData)}
                    className="btn-action text-blue-500 hover:text-blue-700"
                  >
                    <Pencil size={16} />
                  </button>
                </SimpleTooltip>
              )}
              {hasPermission("settings.permission_list_delete") && (
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
      type: "",
      parentId: "",
      menuPositionId: "",
      accessPanel: "",
      isRequired: "",
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
    values.parentId = values.parentId ? values.parentId : null;
    values.menuPositionId = values.menuPositionId
      ? values.menuPositionId
      : null;
    await addOrUpdatePermissionMutation.mutateAsync(values);
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
        await deletePermissionMutation.mutateAsync(id);
      }
    });
  };

  const changeSystemStatus = async (id) => {
    await togglePermissionSystemStatusMutation.mutateAsync(id);
  };

  const changeRequireStatus = async (id) => {
    await togglePermissionRequireStatusMutation.mutateAsync(id);
  };

  const changeActiveStatus = async (id) => {
    await togglePermissionStatusMutation.mutateAsync(id);
  };

  const isLoading =
    isFetching ||
    addOrUpdatePermissionMutation.isLoading ||
    deletePermissionMutation.isLoading ||
    togglePermissionSystemStatusMutation.isLoading ||
    togglePermissionRequireStatusMutation.isLoading ||
    togglePermissionStatusMutation.isLoading;

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
      placeholder: "Search by Name or Code...",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "accessPanel",
      label: "Select Access Panel",
      options: [
        { label: "Admin", value: "Admin" },
        { label: "Company", value: "Company" },
      ],
      placeholder: "Filter by Access Panel",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "type",
      label: "Select Type",
      options: dropdowns.permissionTypeList || [],
      placeholder: "Filter by Type",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "parentId",
      label: "Select Parent Permission",
      options: allModulePermissionsList || [],
      placeholder: "Filter by Parent Permission",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "menuPositionId",
      label: "Select Menu Position",
      options: menuPositionList || [],
      placeholder: "Filter by Menu Position",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "isRequired",
      label: "Select Required Yes/No",
      options: dropdowns.yesNoList || [],
      placeholder: "Filter by Required",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "isSystem",
      label: "Select System/Non-System",
      options: dropdowns.systemNonSystemRoleList || [],
      placeholder: "Filter by System",
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

  const parentId = watch("parentId");
  const name = watch("name");
  const id = watch("id");

  useEffect(() => {
    if (id == 0) {
      const parent = allModulePermissionsList.find(
        (permission) => permission.value === parentId,
      );
      const nameField = (name || "").trim();
      const sanitizedValue = nameField.replace(/[-\/\s]/g, "_");
      setValue(
        "code",
        `${parent?.code ? `${parent.code}.` : ""}${sanitizedValue.toLowerCase()}`,
      );
    }
  }, [parentId, name, id, allModulePermissionsList, setValue]);

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Permission List</h1>
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
          {hasPermission("settings.permission_list_add") && (
            <>
              <ButtonTw
                onClick={addPaymentDashboardPermission}
                variant="alternative"
                className="gap-2"
                disabled={addOrUpdatePermissionMutation.isPending}
              >
                Add Payment Dashboard
              </ButtonTw>
              <ButtonTw
                onClick={() => setShowModal(true)}
                variant="blue"
                className="gap-2"
              >
                <BiPlus /> Add New
              </ButtonTw>
            </>
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
                  <td className="flex flex-col items-start gap-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-32 rounded-full" />
                    <Skeleton className="h-4 w-50" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Skeleton className="h-6 w-12 rounded-full mx-auto" />
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
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Permission`}
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
              name="accessPanel"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Access Panel"
                  options={[
                    { label: "Company", value: "Company" },
                    { label: "Admin", value: "Admin" },
                  ]}
                  value={field.value || "Company"}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12 mb-2"
                  placeholder="Select Access Panel"
                />
              )}
            />
            <div className="hidden lg:block lg:col-span-6"></div>

            <Controller
              control={control}
              name="parentId"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Parent Permission"
                  options={allModulePermissionsList}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  placeholder="Select Parent Permission"
                  searchable
                />
              )}
            />

            <Controller
              control={control}
              name="menuPositionId"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Menu Position"
                  options={menuPositionList}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  placeholder="Select Menu Position"
                  searchable
                />
              )}
            />

            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  label="Permission Name"
                  placeholder="Enter Permission Name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="code"
              render={({ field, fieldState }) => (
                <Input
                  label="Permission Code"
                  placeholder="Enter Permission Code"
                  value={field.value}
                  disabled={id > 0}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="type"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Permission Type"
                  options={dropdowns.permissionTypeList}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  placeholder="Select Permission Type"
                  searchable
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <Input
                  type="textarea"
                  rows={1}
                  label="Permission Description"
                  placeholder="Enter Permission Description"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-12 sm:col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="path"
              render={({ field, fieldState }) => (
                <Input
                  label="Menu Path"
                  placeholder="Enter Menu Path (ex: /settings/permissions)"
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
              name="icon"
              render={({ field, fieldState }) => (
                <Input
                  label="Menu Icon"
                  placeholder="Enter Menu Icon (ex: <i class='bx bx-user'></i>)"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="sortOrder"
              render={({ field, fieldState }) => (
                <Input
                  label="Menu Sort Order"
                  placeholder="Enter Menu Sort Order (ex: 1)"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-3 sm:col-span-12"
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
                  label="System"
                  className="col-span-12 lg:col-span-3 sm:col-span-12"
                  error={fieldState.error?.message}
                  enabledText="Yes"
                  disabledText="No"
                />
              )}
            />

            <Controller
              control={control}
              name="isRequired"
              render={({ field, fieldState }) => (
                <SwitchButton
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Required"
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

export default PermissionListComponent;
