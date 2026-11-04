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
  gradeCode: "",
  gradeName: "",
  level: 0,
  minSalary: 0.0,
  maxSalary: 0.0,
  description: "",
  isActive: true,
};
const SalaryGradesComponent = () => {
  // const { t } = useTranslation();
  const { hasPermission } = useCommonFunctions();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();

  // Get initial values from URL search params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  const initialStatusFilter = searchParams.get("status") || "";
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
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const schema = z
    .object({
      id: z.coerce.number().optional(),
      gradeCode: z.string().min(1, "Grade code is required"),
      gradeName: z.string().min(1, "Grade name is required"),
      level: z.coerce.number().min(1, "Level is required"),
      minSalary: z.coerce.number().min(1, "Minimum salary is required"),
      maxSalary: z.coerce.number().min(1, "Maximum salary is required"),
      description: z.string().nullable().optional(),
      isActive: z.boolean().optional().default(true),
    })
    .refine((data) => Number(data.maxSalary) >= Number(data.minSalary), {
      message: "Maximum salary cannot be less than minimum salary",
      path: ["maxSalary"],
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
    setValue,
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
    useSalaryGradeQuery,
    useActivePayItemQuery,
    addOrUpdateSalaryGradeMutation,
    deleteSalaryGradeMutation,
    toggleSalaryGradeStatusMutation,
  } = usePayrollQueryApi({ reset, setError, handleClose, setShowModal });

  const { data: activePayItemData } = useActivePayItemQuery();
  const activePayItemCount = activePayItemData?.data?.length ?? 0;

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

    return params;
  }, [currentPage, itemsPerPage, filters]);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useSalaryGradeQuery(queryParams);

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
    await addOrUpdateSalaryGradeMutation.mutateAsync(values);
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
          await deleteSalaryGradeMutation.mutateAsync(id);
        }
      });
    },
    [deleteSalaryGradeMutation],
  );

  const handleToggleStatus = useCallback(
    async (id) => {
      await toggleSalaryGradeStatusMutation.mutateAsync(id);
    },
    [toggleSalaryGradeStatusMutation],
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
        header: "Grade Name & Code",
        accessorFn: (row) => `${row.gradeName} (${row.gradeCode})`,
        // accessorFn: (row) =>
        //   [row.gradeName, row.gradeCode]
        //     .filter(Boolean) // Remove null/undefined values
        //     .join(' '),
        enableGlobalFilter: true,
        filterFn: "includesString",
        // cell: ({ getValue }) => getValue() || "-",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div>
              <p className="font-semibold dark-title-color">
                {rowData?.gradeName}
              </p>
              <SimpleTooltip text={"Grade Code"}>
                {rowData?.gradeCode && (
                  <span className="badge badge-rounded badge-outline-secondary">
                    {rowData?.gradeCode}
                  </span>
                )}
              </SimpleTooltip>
            </div>
          );
        },
      },
      {
        accessorKey: "level",
        header: "Level",
        cell: ({ getValue }) => (
          <span className="badge badge-circle badge-secondary">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "minSalary",
        header: "Min. Salary",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "maxSalary",
        header: "Max. Salary",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }) => (
          <span
            className="max-w-xs truncate block"
            dangerouslySetInnerHTML={{ __html: getValue() || "-" }}
          ></span>
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
            disabled={!hasPermission("payroll_management.salary_grades_edit")}
          />
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="action">
              {hasPermission("payroll_management.salary_grades_edit") && (
                <button
                  onClick={() => handleEdit(rowData)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              )}
              {hasPermission("payroll_management.salary_grades_delete") && (
                <button
                  onClick={() => handleDelete(rowData.id)}
                  className="btn-action text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
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
    addOrUpdateSalaryGradeMutation.isLoading ||
    deleteSalaryGradeMutation.isLoading ||
    // toggleArchivePersonalNoteMutation.isLoading ||
    toggleSalaryGradeStatusMutation.isLoading;

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Salary Grade, Code, Description...",
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
        stepNumber={2}
        stepTitle="Salary Grades & Bands"
        description="Salary Grades establish formal job pay scales with defined minimum and maximum basic salary limits. Setting up grades guarantees that new employee salary structures stay within approved budget bands."
        prerequisites={[
          {
            label: "Pay Items",
            href: "/payroll-management/pay-items?page=1&limit=10",
            count: activePayItemCount,
            isRequired: false,
            isMissing: activePayItemCount === 0,
            helperText:
              activePayItemCount === 0
                ? "No pay items configured yet. You should create basic earning/deduction items."
                : `${activePayItemCount} active pay item(s) available.`,
          },
        ]}
        prevStep={{
          label: "Pay Items",
          href: "/payroll-management/pay-items?page=1&limit=10",
        }}
        nextStep={{
          label: "Salary Grade Rules",
          href: "/payroll-management/salary-grade-rules?page=1&limit=10",
        }}
        storageKey="salary_grades"
      />

      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Salary Grades</h1>
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

          {hasPermission("payroll_management.salary_grades_add") && (
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
        getTodayDate={getTodayDate}
      />
    </div>
  );
};

export default SalaryGradesComponent;
