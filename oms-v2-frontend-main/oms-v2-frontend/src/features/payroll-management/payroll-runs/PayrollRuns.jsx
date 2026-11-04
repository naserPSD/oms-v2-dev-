// src/features/payroll/salary-structures/SalaryStructures.jsx
"use client";
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { usePayrollQueryApi } from "@/hooks/queryApi/usePayrollQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import helpers from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";
import { usePayrollRunFilters } from "./hooks/usePayrollRunFilters";
import { useSalaryStructuresTableColumn } from "./hooks/useSalaryStructuresTableColumn";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import AddOrUpdateModal from "./components/AddOrUpdateModal";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import PayrollPageInstructionBanner from "../components/PayrollPageInstructionBanner";

const initialValues = {
  id: 0,
  payPeriodMonth: 0,
  payPeriodYear: new Date().getFullYear(),
  payPeriodStart: "",
  payPeriodEnd: "",
  forceReRun: false,
  remarks: "",
};
const PayrollRuns = () => {
  const { hasPermission } = useCommonFunctions();
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const paymentStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "payment_statuses")
      ?.statuses || [];

  // Schema for payroll run
  const payrollRunSchema = z.object({
    id: z.coerce.number().optional(),
    payPeriodMonth: z.coerce.number().min(1, "Pay period month is required"),
    payPeriodYear: z.coerce
      .number()
      .min(4, "Pay period year is required (YYYY)"),
    payPeriodStart: z.string().optional(),
    payPeriodEnd: z.string().optional(),
    forceReRun: z.boolean().optional().default(false),
    remarks: z.string().optional(),
  });

  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;

  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);
  const [selectedSalaryDetails, setSelectedSalaryDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const handleViewDetails = (salaryDetails) => {
    setSelectedSalaryDetails(salaryDetails);
    // setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = useCallback(() => {
    setSelectedSalaryDetails(null);
    setShowDetailsModal(false);
  }, []);

  // 🧠 ---------- FILTERS ----------
  const {
    filters,
    globalFilter,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearAllFilters,
    queryParams,
    setGlobalFilter,
  } = usePayrollRunFilters(itemsPerPage);

  // ⚡ Form
  const {
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(payrollRunSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  // 🧠 ---------- API HOOKS ----------
  const {
    usePayrollRunsQuery,
    useSalaryStructuresQuery,
    addOrUpdatePayrollRunsMutation,
    deleteSalaryGradeRuleMutation,
    toggleSalaryStructureStatusMutation,
  } = usePayrollQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
    setValue,
  });

  const { data: salaryStructuresData } = useSalaryStructuresQuery();
  const salaryStructuresCount =
    salaryStructuresData?.pagination?.total ??
    salaryStructuresData?.data?.length ??
    0;

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // React Query for data fetching
  const {
    data: responseData,
    isLoading: isFetching,
    refetch,
  } = usePayrollRunsQuery(queryParams);
  // React Query for data fetching

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

  // 📝 Submit handler
  const submitForm = async (values) => {
    await addOrUpdatePayrollRunsMutation.mutateAsync(values);
  };

  // 📝 Edit handler
  const handleEdit = useCallback(
    (item) => {
      // Format salaryStructureDetails data properly for empSalaryStructureDetails
      const salaryDetails =
        item.salaryStructureDetails?.map((detail) => {
          const payItem = processedPayItemList.find(
            (p) => Number(p.value) === Number(detail.payItemId),
          );

          return {
            payItemId: Number(detail.payItemId) || 0,
            amount: Number(detail.amount) || 0,
            percentage: Number(detail.percentage) || 0,

            // 🔑 keep backend value
            calculatedAmount: Number(detail.calculatedAmount) || 0,

            // 🔑 restore UI metadata
            payItemType: payItem?.payItemType || "", // "Earning" / "Deduction"
            componentName: payItem?.label || "",
          };
        }) || [];

      console.log("Editing item:", item);
      console.log("Formatted salary details:", salaryDetails);

      reset({
        id: item.id,
        empId: item.empId,
        gradeId: item.gradeId,
        basicSalary: parseFloat(item.basicSalary),
        effectiveFrom: item.effectiveFrom,
        effectiveTo: item.effectiveTo,
        isActive: item.isActive,
        remarks: item.remarks || "",
        grossSalary: parseFloat(item.grossSalary) || 0,
        totalDeductions: parseFloat(item.totalDeductions) || 0,
        netSalary: parseFloat(item.netSalary) || 0,
        empSalaryStructureDetails: salaryDetails,
      });
      setShowModal(true);
    },
    [reset],
  );

  // 🧹 Delete handler
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
          refetch();
        }
      });
    },
    [deleteSalaryGradeRuleMutation, refetch],
  );

  // ➕ Add new salary structure handler
  const handleNewSalaryStructure = useCallback(() => {
    reset(initialValues);
    setShowModal(true);
  }, [reset]);

  // 🧠 Build filter config
  const filterConfig = [
    // {
    //   component: "input",
    //   name: "search",
    //   label: "Search",
    //   placeholder: "Search by payroll code",
    // },
    {
      component: "input",
      name: "payPeriodYear",
      label: "Search",
      placeholder: "Search by Year",
    },
    {
      component: "select",
      name: "payPeriodMonth",
      label: "Select Month",
      options: helpers.monthOptions() || [],
      placeholder: "Filter by Month",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "paymentStatusId",
      label: "Select Payment Status",
      options: paymentStatusList,
      placeholder: "Filter by Payment Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
    },
  ];

  // 🧠 ---------- TABLE ----------
  const columns = useSalaryStructuresTableColumn({
    handleEdit,
    handleDelete,
    handleViewDetails,
    hasPermission
  });

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
    addOrUpdatePayrollRunsMutation?.isLoading ||
    deleteSalaryGradeRuleMutation?.isLoading ||
    toggleSalaryStructureStatusMutation?.isLoading;

  const isEditing = watch("id") !== 0;

  return (
    <div>
      <PayrollPageInstructionBanner
        stepNumber={5}
        stepTitle="Monthly Payroll Runs & Processing"
        description="Payroll Runs calculate monthly compensation across all eligible active employees. The system evaluates attendance presence and absent day deductions, applies accumulated disciplinary penalties, and itemizes earning/deduction pay breakdowns."
        prerequisites={[
          {
            label: "Salary Structures",
            href: "/payroll-management/salary-structures?page=1&limit=10",
            count: salaryStructuresCount,
            isRequired: true,
            isMissing: salaryStructuresCount === 0,
            helperText:
              salaryStructuresCount === 0
                ? "No salary structures configured. Assign salary structures to employees before running payroll."
                : `${salaryStructuresCount} salary structure(s) configured.`,
          },
          {
            label: "Employee Attendance",
            href: "/hr-management/employee-attendance",
            isRequired: false,
            isMissing: false,
            helperText:
              "Verify monthly attendance records so absences and daily proration compute accurately.",
          },
        ]}
        prevStep={{
          label: "Salary Structures",
          href: "/payroll-management/salary-structures?page=1&limit=10",
        }}
        storageKey="payroll_runs"
      />

      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-2xl">
            Employee Payroll Runs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and oversee employee payroll runs efficiently.
          </p>
        </div>
        <div className="flex gap-2">
          <SimpleTooltip
            title={showFilter === "show" ? "Hide" : "Show"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw
              onClick={toggleFilter}
              variant="alternative"
              className="gap-2"
            >
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>

          {hasPermission("payroll_management.employee_payroll_runs_add") && (
            <ButtonTw
              onClick={handleNewSalaryStructure}
              variant="blue"
              className="gap-2"
            >
              <BiPlus /> Create New Month for Payroll Run
            </ButtonTw>
          )}
        </div>
      </div>

      {/* Add/Edit Salary Structure Modal */}

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

      {/* Filter Bar */}
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Salary Structures Table */}
      <CommonTable
        table={table}
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
};

export default PayrollRuns;
