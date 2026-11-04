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
import { Pencil, Trash2 } from "lucide-react";
import ComponentTanstackTable from "./components/ComponentTanstackTable";
import PayrollPageInstructionBanner from "../components/PayrollPageInstructionBanner";

// Hooks & Utilities
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import helpers from "@/utils/helpers";
import AddOrUpdateModal from "./components/AddOrUpdateModal";
import { usePayrollQueryApi } from "@/hooks/queryApi/usePayrollQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

// initial form values
const initialValues = {
  id: 0,
  gradeId: null,
  payItemId: null,
  minBasic: "",
  maxBasic: "",
  calculationMethodId: null,
  percentage: 0.0,
  fixedAmount: 0.0,
  formula: "",
  remarks: "",
  effectiveFrom: "",
  effectiveTo: "",
  isActive: true,
};
const SalaryGradeRulesComponent = () => {
  // const { t } = useTranslation();
  const { hasPermission } = useCommonFunctions();
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const payItemCalculationMethodList =
    dropdowns.statusGroupList?.find(
      (s) => s.code === "pay_item_calculation_methods",
    )?.statuses ?? [];

  const payItemTypeList =
    dropdowns.statusGroupList?.find((s) => s.code === "pay_item_types")
      ?.statuses ?? [];

  const payItemTCategoryList =
    dropdowns.statusGroupList?.find((s) => s.code === "pay_item_categories")
      ?.statuses ?? [];

  const searchParams = useSearchParams();

  // Get initial values from URL search params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  const initialStatusFilter = searchParams.get("status") || "";
  const initialPayItemTypeFilter = searchParams.get("gradeId") || "";
  const initialPayItemCategoryFilter = searchParams.get("payItemId") || "";
  const initialCalculationMethodFilter =
    searchParams.get("calculationMethodId") || "";

  // Define pagination state
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
    gradeId: initialPayItemTypeFilter,
    payItemId: initialPayItemCategoryFilter,
    calculationMethodId: initialCalculationMethodFilter,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);

  const schema = z
    .object({
      id: z.coerce.number().optional(),
      gradeId: z.coerce.number().min(1, "Salary grade is required"),
      payItemId: z.coerce.number().min(1, "Pay item is required"),
      minBasic: z.coerce.number().min(1, "Minimum basic is required"),
      maxBasic: z.coerce.number().min(1, "Maximum basic is required"),
      calculationMethodId: z.coerce
        .number()
        .min(1, "Calculation method is required"),
      percentage: z.coerce.number().nullable().optional().default(0.0),
      fixedAmount: z.coerce.number().nullable().optional().default(0.0),
      // percentage: z.coerce.number().min(0, "Percentage must be positive").optional(),
      // fixedAmount: z.coerce.number().min(0, "Fixed amount must be positive"),
      formula: z.string().optional(),
      remarks: z.string().optional(),
      effectiveFrom: z.string().min(1, "Effective from is required"),
      effectiveTo: z.string().optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Number(data.maxBasic) >= Number(data.minBasic), {
      message: "Maximum basic cannot be less than minimum basic",
      path: ["maxBasic"],
    });

  const {
    // register,
    // formState: { errors },
    setValue,
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
    useActiveSalaryGradeQuery,
    useActivePayItemQuery,
    useSalaryGradeRulesQuery,
    addOrUpdateSalaryGradeRulesMutation,
    deleteSalaryGradeRuleMutation,
    toggleSalaryGradeRuleStatusMutation,
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
    if (filters.gradeId) params.gradeId = filters.gradeId;
    if (filters.payItemId) params.payItemId = filters.payItemId;
    if (filters.calculationMethodId)
      params.calculationMethodId = filters.calculationMethodId;

    return params;
  }, [currentPage, itemsPerPage, filters]);

  // React Query for data fetching with pagination and search
  const { data: activeSalaryGradeData } = useActiveSalaryGradeQuery();

  const activeSalaryGradeList = useMemo(
    () => activeSalaryGradeData?.data || [],
    [activeSalaryGradeData?.data],
  );

  dropdowns.activeSalaryGradeList = activeSalaryGradeList;

  // React Query for data fetching with pagination and search
  const { data: activePayItemData } = useActivePayItemQuery();

  const payItemList = useMemo(
    () => activePayItemData?.data || [],
    [activePayItemData?.data],
  );

  const processedPayItemList = (payItemList ?? [])
    .filter((item) => item.payItemCategoryId !== 196)
    .map((item) => ({
      ...item,
      value: Number(item.value),
    }));

  dropdowns.activePayItemList = processedPayItemList;

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useSalaryGradeRulesQuery(queryParams);

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
    const calculationMethodId = watch("calculationMethodId");
    const shouldShowPercentage = calculationMethodId == 205;
    const shouldShowFixed = calculationMethodId == 204;
    const shouldShowFormula = calculationMethodId == 206;
    // const shouldShowRange = calculationMethodId == 207;

    if (shouldShowPercentage) {
      values.fixedAmount = 0;
      values.formula = "";
    } else if (shouldShowFixed) {
      values.percentage = 0;
      values.formula = "";
    } else if (shouldShowFormula) {
      values.fixedAmount = 0;
      values.percentage = 0;
    }

    await addOrUpdateSalaryGradeRulesMutation.mutateAsync(values);
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
          await deleteSalaryGradeRuleMutation.mutateAsync(id);
        }
      });
    },
    [deleteSalaryGradeRuleMutation],
  );

  const handleToggleStatus = useCallback(
    async (id) => {
      await toggleSalaryGradeRuleStatusMutation.mutateAsync(id);
    },
    [toggleSalaryGradeRuleStatusMutation],
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
      gradeId: "",
      payItemId: "",
      calculationMethodId: "",
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
    if (filters.gradeId) params.set("gradeId", filters.gradeId);
    if (filters.payItemId) params.set("payItemId", filters.payItemId);
    if (filters.calculationMethodId)
      params.set("calculationMethodId", filters.calculationMethodId);

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
        accessorKey: "gradeName",
        header: "Grade",
        accessorFn: (row) => row.payItem?.name,
        cell: ({ row }) => {
          const grade = row.original.grade;
          return <span>{grade?.gradeName}</span>;
        },
      },
      {
        accessorKey: "payItemId",
        header: "Pay Item",
        accessorFn: (row) => row.payItem?.name,
        cell: ({ row }) => {
          const payItem = row.original.payItem;
          return <span>{payItem?.itemName}</span>;
        },
      },
      {
        accessorKey: "minBasic",
        header: "Basic Range",
        accessorFn: (row) =>
          [row.minBasic, row.maxBasic]
            .filter(Boolean) // Remove null/undefined values
            .join(" "),
        enableGlobalFilter: true,
        filterFn: "includesString",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <span>
              {rowData?.minBasic} - {rowData?.maxBasic}
            </span>
          );
        },
      },
      {
        accessorKey: "calculationMethodId",
        header: "Calculation Info",
        accessorFn: (row) => row.payItem?.name,
        cell: ({ row }) => {
          const calculationMethod = row.original.calculationMethod;
          return (
            <div className="flex flex-col">
              <span>{calculationMethod?.name}</span>
              <span className="text-[10px]">
                {/* {row.original?.calcValue} */}
                {calculationMethod?.name === "PERCENTAGE"
                  ? ` (${row.original?.percentage ?? 0} %)`
                  : calculationMethod?.name === "FIXED"
                    ? ` (${row.original?.fixedAmount ?? 0})`
                    : calculationMethod?.name === "FORMULA"
                      ? ` (${row.original?.formula ?? ""})`
                      : ""}
              </span>
            </div>
          );
        },
        size: 50,
      },
      // {
      //   accessorKey: "percentage",
      //   header: "Percentage (%)",
      //   cell: ({ getValue }) => getValue() || "-",
      //   size: 50,
      // },
      {
        accessorKey: "effectiveFrom",
        header: "Effective Date",
        accessorFn: (row) => row.effectiveFrom,
        cell: ({ row }) => {
          return row.original?.effectiveFrom && row.original?.effectiveTo ? (
            <span className="text-[12px]">
              {helpers.dDate(row.original.effectiveFrom)} To{" "}
              {helpers.dDate(row.original.effectiveTo) || "-"}
            </span>
          ) : (
            <span className="text-[12px]">
              {helpers.dDate(row.original.effectiveFrom)} To Continue
            </span>
          );
          // <span>{row.original?.effectiveFrom ? helpers.dDate(row.original.effectiveFrom) : "-"}</span>
        },
        size: 40,
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
            disabled={
              !hasPermission("payroll_management.salary_grade_rules_edit")
            }
          />
        ),
        size: 50,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="action">
              {hasPermission("payroll_management.salary_grade_rules_edit") && (
                <>
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
    [handleToggleStatus, handleEdit, handleDelete],
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
    addOrUpdateSalaryGradeRulesMutation.isLoading ||
    deleteSalaryGradeRuleMutation.isLoading ||
    toggleSalaryGradeRuleStatusMutation.isLoading ||
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
      name: "gradeId",
      label: "Select Salary Grade",
      options: dropdowns.activeSalaryGradeList,
      placeholder: "Filter By Salary Grade",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "payItemId",
      label: "Select Pay Item",
      options: dropdowns.activePayItemList,
      placeholder: "Filter by Pay Item",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "calculationMethodId",
      label: "Select Calculation Method",
      options: payItemCalculationMethodList,
      placeholder: "Filter by Calculation Method",
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
        stepNumber={3}
        stepTitle="Salary Grade Rules"
        description="Salary Grade Rules connect your Salary Grades with Pay Items to define percentage, fixed amount, or formula calculations for each allowance or deduction. When creating an employee's salary structure, selecting a grade uses these rules to calculate component values."
        prerequisites={[
          {
            label: "Salary Grades",
            href: "/payroll-management/salary-grades?page=1&limit=10",
            count: activeSalaryGradeList.length,
            isRequired: true,
            isMissing: activeSalaryGradeList.length === 0,
            helperText:
              activeSalaryGradeList.length === 0
                ? "No salary grades found. Create at least one salary grade first."
                : `${activeSalaryGradeList.length} salary grade(s) available.`,
          },
          {
            label: "Pay Items",
            href: "/payroll-management/pay-items?page=1&limit=10",
            count: payItemList.length,
            isRequired: true,
            isMissing: payItemList.length === 0,
            helperText:
              payItemList.length === 0
                ? "No pay items found. Create earning or deduction pay items first."
                : `${payItemList.length} pay item(s) available.`,
          },
        ]}
        prevStep={{
          label: "Salary Grades",
          href: "/payroll-management/salary-grades?page=1&limit=10",
        }}
        nextStep={{
          label: "Salary Structures",
          href: "/payroll-management/salary-structures?page=1&limit=10",
        }}
        storageKey="salary_grade_rules"
      />

      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Salary Grade Rules</h1>
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

          {hasPermission("payroll_management.salary_grade_rules_add") && (
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
        setValue={setValue}
        dropdowns={dropdowns}
      />
    </div>
  );
};

export default SalaryGradeRulesComponent;
