// src/features/hr-dashboard/hr-notice/HrNotice.jsx
"use client";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import { debounce } from "lodash";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import "suneditor/dist/css/suneditor.min.css";
import Swal from "sweetalert2";

// Components
import DataFilter from "@/components/common/DataFilter";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { Pencil, Trash2 } from "lucide-react";
import ComponentTanstackTable from "./components/ComponentTanstackTable";
import PayrollPageInstructionBanner from "../components/PayrollPageInstructionBanner";

// Hooks & Utilities

import helpers from "@/utils/helpers";
import AddOrUpdateModal from "./components/AddOrUpdateModal";
import { usePayrollQueryApi } from "@/hooks/queryApi/usePayrollQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

// initial form values
const initialValues = {
  id: 0,
  itemCode: "",
  itemName: "",
  payItemTypeId: null,
  payItemCategoryId: null,
  recurrenceTypeId: null,
  recurrenceCount: 1,
  calculationMethodId: null,
  calcValue: 0.0,
  affectsGrossSalary: true,
  affectsNetSalary: true,
  isStatutory: false,
  taxSection: "",
  maxLimit: 0.0,
  minLimit: 0.0,
  isTaxable: true,
  sortOrder: 1,
  isActive: true,
};
const PayItemsComponent = () => {
  // const { t } = useTranslation();
  const { hasPermission } = useCommonFunctions();

  const dropdowns = useCommonStore((state) => state.dropdowns);

  const payItemTypeList =
    dropdowns.statusGroupList?.find((s) => s.code === "pay_item_types")
      ?.statuses ?? [];

  const payItemTCategoryList =
    dropdowns.statusGroupList?.find((s) => s.code === "pay_item_categories")
      ?.statuses ?? [];

  const payItemRecurrenceTypeList =
    dropdowns.statusGroupList?.find(
      (s) => s.code === "pay_item_recurrence_types",
    )?.statuses ?? [];

  const payItemCalculationMethodList =
    dropdowns.statusGroupList?.find(
      (s) => s.code === "pay_item_calculation_methods",
    )?.statuses ?? [];

  const searchParams = useSearchParams();

  // Get initial values from URL search params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  const initialStatusFilter = searchParams.get("status") || "";
  const initialPayItemTypeFilter = searchParams.get("payItemTypeId") || "";
  const initialPayItemCategoryFilter =
    searchParams.get("payItemCategoryId") || "";
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );

  // Define search filter state
  const [filters, setFilters] = useState({
    search: initialSearch,
    status: initialStatusFilter,
    payItemTypeId: initialPayItemTypeFilter,
    payItemCategoryId: initialPayItemCategoryFilter,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);

  const schema = z.object({
    id: z.coerce.number().optional(),
    itemCode: z.string().min(1, "Item code is required"),
    itemName: z.string().min(1, "Item name is required"),
    payItemTypeId: z.coerce.number().min(1, "Pay item Type is required"),
    payItemCategoryId: z.coerce
      .number()
      .min(1, "Pay item Category is required"),
    recurrenceTypeId: z.coerce.number().min(1, "Recurrence Type is required"),
    recurrenceCount: z.coerce
      .number()
      .min(1, "Recurrence Count is required")
      .default(1),
    calculationMethodId: z.coerce
      .number()
      .min(1, "Calculation Method is required"),
    calcValue: z.coerce.number().nullable().optional().default(0.0),
    affectsGrossSalary: z.boolean().optional().default(true),
    affectsNetSalary: z.boolean().optional().default(true),
    isStatutory: z.boolean().optional().default(false),
    taxSection: z.string().optional().nullable(),
    maxLimit: z.coerce.number().nullable().optional().default(0.0),
    minLimit: z.coerce.number().nullable().optional().default(0.0),
    isTaxable: z.boolean().optional(),
    sortOrder: z.coerce.number().nullable().optional().default(1),
    isActive: z.boolean().optional(),
  });

  const {
    // register,
    // formState: { errors },
    // setValue,
    handleSubmit,
    setError,
    control,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Edit handler for modal
  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  const handleEdit = useCallback(
    (item) => {
      reset(item);
      setShowModal(true);
    },
    [reset],
  );

  // Fetch notes with pagination and filters
  const {
    usePayItemsQuery,
    addOrUpdatePayItemsMutation,
    deletePayItemsMutation,
    togglePayItemTaxableMutation,
    togglePayItemStatusMutation,
  } = usePayrollQueryApi({ reset, setError, handleClose, setShowModal });

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== undefined && value !== null,
    );
  }, [filters]);

  // Toggle filter bar visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (filters.search) params.search = filters.search;
    if (filters.status) params.isActive = filters.status;
    if (filters.payItemTypeId) params.payItemTypeId = filters.payItemTypeId;
    if (filters.payItemCategoryId)
      params.payItemCategoryId = filters.payItemCategoryId;

    return params;
  }, [currentPage, itemsPerPage, filters]);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    usePayItemsQuery(queryParams);

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data],
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
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  const submitForm = async (values) => {
    // console.log("values", values);
    await addOrUpdatePayItemsMutation.mutateAsync(values);
  };

  const handleDelete = useCallback(
    async (id) => {
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
          await deletePayItemsMutation.mutateAsync(id);
        }
      });
    },
    [deletePayItemsMutation],
  );

  const handleToggleStatus = useCallback(
    async (id) => {
      await togglePayItemStatusMutation.mutateAsync(id);
    },
    [togglePayItemStatusMutation],
  );

  const handleToggleTaxableStatus = useCallback(
    async (id) => {
      await togglePayItemTaxableMutation.mutateAsync(id);
    },
    [togglePayItemTaxableMutation],
  );

  // Debounced updater for search filter only
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    [],
  );

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
      status: "",
      payItemTypeId: "",
      payItemCategoryId: "",
    });
    setCurrentPage(1);
    setGlobalFilter();

    // Clear URL params as well
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.payItemTypeId)
      params.set("payItemTypeId", filters.payItemTypeId);
    if (filters.payItemCategoryId)
      params.set("payItemCategoryId", filters.payItemCategoryId);

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateSearch.cancel();
    };
  }, [debouncedUpdateSearch]);

  // TanStack Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL.",
        size: 50,
      },
      {
        accessorKey: "itemName",
        header: "Pay Item Info",
        accessorFn: (row) =>
          [row.itemName, row.itemCode]
            .filter(Boolean) // Remove null/undefined values
            .join(" "),
        enableGlobalFilter: true,
        filterFn: "includesString",
        cell: ({ row }) => {
          const rowData = row.original;
          const payItemType = row.original.payItemType;
          return (
            <div className="flex flex-col items-start gap-1">
              <SimpleTooltip text={"Pay Item Name"}>
                <p className="font-semibold dark-title-color mb-0 leading-3.5">
                  {rowData?.itemName}
                </p>
              </SimpleTooltip>
              <SimpleTooltip text={"Economic Code"}>
                {rowData?.itemCode && (
                  <span className="badge badge-rounded badge-outline-secondary">
                    {rowData?.itemCode}
                  </span>
                )}
              </SimpleTooltip>

              <SimpleTooltip text={"Item Type"}>
                <span
                  class={`badge badge-rounded badge-outline-${payItemType?.colorName}`}
                >
                  {payItemType?.name}
                </span>
              </SimpleTooltip>
            </div>
          );
        },
      },
      {
        accessorKey: "payItemCategoryId",
        header: "Category",
        accessorFn: (row) => row.payItemCategory?.name,
        cell: ({ row }) => {
          const payItemCategory = row.original.payItemCategory;
          return (
            <span
              class={`badge badge-rounded badge-outline-${payItemCategory?.colorName}`}
            >
              {payItemCategory?.name}
            </span>
          );
        },
      },
      {
        accessorKey: "recurrenceTypeId",
        header: "Recurrence Info",
        accessorFn: (row) =>
          [row.recurrenceType?.name, row.recurrenceCount]
            .filter(Boolean) // Remove null/undefined values
            .join(" "),
        enableGlobalFilter: true,
        filterFn: "includesString",
        cell: ({ row }) => {
          const rowData = row.original;
          const recurrenceType = row.original.recurrenceType;
          return (
            <div className="flex items-center justify-center gap-1">
              <SimpleTooltip text={"Recurrence Type"}>
                <span
                  class={`badge badge-rounded badge-outline-${recurrenceType?.colorName}`}
                >
                  {recurrenceType?.name}
                </span>
              </SimpleTooltip>
              <SimpleTooltip text={"Recurrence Count"}>
                <span className="badge badge-circle badge-secondary">
                  {rowData?.recurrenceCount}
                </span>
              </SimpleTooltip>
            </div>
          );
        },
      },
      {
        accessorKey: "calculationMethodId",
        header: "Calculation Info",
        accessorFn: (row) =>
          [row.calculationType?.name, row.recurrenceCount]
            .filter(Boolean) // Remove null/undefined values
            .join(" "),
        enableGlobalFilter: true,
        filterFn: "includesString",
        cell: ({ row }) => {
          const rowData = row.original;
          const calculationMethod = row.original.calculationMethod;
          return (
            <div className="flex items-center justify-end gap-1">
              <SimpleTooltip text={"Calculation Method"}>
                <span
                  class={`badge badge-rounded badge-outline-${calculationMethod?.colorName}`}
                >
                  {calculationMethod?.name}
                </span>
              </SimpleTooltip>
              <SimpleTooltip text={"Calculation. Value"}>
                <span className="">{rowData?.calcValue}</span>
              </SimpleTooltip>
            </div>
          );
        },
      },
      // {
      //   accessorKey: "calculationMethodId",
      //   header: "Calculation Type",
      //   accessorFn: (row) => row.calculationType?.name,
      //   cell: ({ row }) => {
      //     const calculationType = row.original.calculationType;
      //     return (
      //       <span class={`badge badge-rounded badge-outline-${calculationType?.colorName}`}>{calculationType?.name}</span>
      //     );
      //   },
      // },
      // {
      //   accessorKey: "calcValue",
      //   header: "Calc. Value",
      //   cell: ({ getValue }) => getValue() || "-",
      // },
      {
        accessorKey: "sortOrder",
        header: "Order",
        cell: ({ getValue }) => (
          // <span
          //   className="max-w-xs truncate block"
          //   dangerouslySetInnerHTML={{ __html: getValue() || "-" }}
          // ></span>
          <span className="badge badge-circle badge-secondary">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "isTaxable",
        header: "Taxable",
        cell: ({ row }) => (
          <SwitchButton
            enabled={row.original.isTaxable}
            onClick={() => handleToggleTaxableStatus(row.original.id)}
            enabledText="Yes"
            disabledText="No"
            disabled={!hasPermission("payroll_management.pay_items_edit")}
          />
        ),
      },
      {
        accessorKey: "isActive",
        header: "Active",
        cell: ({ row }) => (
          <SwitchButton
            enabled={row.original.isActive}
            onClick={() => handleToggleStatus(row.original.id)}
            enabledText="Yes"
            disabledText="No"
            disabled={!hasPermission("payroll_management.pay_items_edit")}
          />
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const rowData = row.original;
          //
          return (
            <div className="action">
              {hasPermission("payroll_management.pay_items_edit") && (
                <>
                  {" "}
                  <button
                    onClick={() => handleEdit(rowData)}
                    className="btn-action text-blue-500 hover:text-blue-700"
                  >
                    <Pencil size={16} />
                  </button>
                  {/* <button
                onClick={() => handleDelete(rowData.id)}
                className="btn-action text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button> */}
                </>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 50,
      },
    ],
    [handleToggleTaxableStatus, handleToggleStatus, handleEdit, handleDelete],
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

  const isLoading =
    isFetching ||
    addOrUpdatePayItemsMutation.isLoading ||
    deletePayItemsMutation.isLoading ||
    togglePayItemTaxableMutation.isLoading ||
    togglePayItemStatusMutation.isLoading;

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Pay Item Name, Code...",
    },
    {
      component: "select",
      name: "payItemTypeId",
      label: "Select Pay Item Type",
      options: payItemTypeList,
      placeholder: "Filter by Pay Item Type",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "payItemCategoryId",
      label: "Select Pay Item Category",
      options: payItemTCategoryList,
      placeholder: "Filter by Pay Item Category",
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
    },
  ];

  return (
    <div>
      <PayrollPageInstructionBanner
        stepNumber={1}
        stepTitle="Pay Items (Salary Components)"
        description="Pay Items are the foundational earnings and deductions of your payroll system. Define elements like Basic Salary, House Rent, Medical, and Provident Fund. These components are later linked to Salary Grade Rules and assigned to Employee Salary Structures."
        nextStep={{
          label: "Salary Grades",
          href: "/payroll-management/salary-grades?page=1&limit=10",
        }}
        storageKey="pay_items"
      />

      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-lg">
            Pay Items Management
          </h1>
          <p className="text-gray-600">
            Manage Salary Components and Calculations
          </p>
        </div>
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
          {hasPermission("payroll_management.pay_items_add") && (
            <ButtonTw
              onClick={() => setShowModal(true)}
              variant="blue"
              className="gap-2"
            >
              <BiPlus /> Add New
            </ButtonTw>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      <ComponentTanstackTable
        table={table}
        isFetching={isFetching}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
        currentPage={currentPage}
        total={total}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />

      <AddOrUpdateModal
        showModal={showModal}
        handleClose={handleClose}
        isLoading={isLoading}
        reset={reset}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        control={control}
        watch={watch}
      />
    </div>
  );
};

export default PayItemsComponent;
