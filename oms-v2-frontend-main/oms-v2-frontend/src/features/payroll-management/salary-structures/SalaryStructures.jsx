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
import AddOrUpdateSalaryStructureModal from "./components/AddOrUpdateSalaryStructureModal";
import { useSalaryStructuresFilters } from "./hooks/useSalaryStructuresFilters";
import { useSalaryStructuresTableColumn } from "./hooks/useSalaryStructuresTableColumn";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import SalaryStructureDetailsModal from "./components/SalaryStructureDetailsModal";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import PayrollPageInstructionBanner from "../components/PayrollPageInstructionBanner";

const initialValues = {
  id: 0,
  empId: 0,
  gradeId: 0,
  basicSalary: 0,
  effectiveFrom: "",
  effectiveTo: "",
  grossSalary: 0,
  totalDeductions: 0,
  netSalary: 0,
  isActive: true,
  remarks: "",
  empSalaryStructureDetails: [
    {
      payItemId: 0,
      amount: 0,
      percentage: 0,
      calculatedAmount: 0,
      isVariable: true,
      isRecurring: true,
    },
  ],
};
const SalaryStructures = () => {
  const { hasPermission } = useCommonFunctions();
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const { useActiveSalaryGradeQuery } = usePayrollQueryApi({});
  const { data: activeSalaryGradeData } = useActiveSalaryGradeQuery();

  const activeSalaryGradeList = useMemo(
    () => activeSalaryGradeData?.data || [],
    [activeSalaryGradeData?.data],
  );
  // Schema for salary structure
  // Updated schema for salary structure with details array
  const salaryStructureSchema = z
    .object({
      id: z.coerce.number().optional(),
      empId: z.number().min(1, "Employee is required"),
      gradeId: z.number().min(1, "Salary grade is required"),
      basicSalary: z.coerce.number().min(1, "Basic salary is required"),
      effectiveFrom: z.string().min(1, "Effective from date is required"),
      effectiveTo: z.string().min(1, "Effective to date is required"),
      grossSalary: z.coerce.number().optional(),
      totalDeductions: z.coerce.number().optional(),
      netSalary: z.coerce.number().optional(),
      isActive: z.boolean().default(true),
      remarks: z.string().optional(),
      createdBy: z.number().optional(),
      empSalaryStructureDetails: z
        .array(
          z.object({
            payItemId: z.number().min(1, "Pay item is required"),
            amount: z.coerce.number().min(0, "Amount must be positive"),
            percentage: z.coerce
              .number()
              .min(0)
              .max(100, "Percentage must be between 0-100"),
            calculatedAmount: z.coerce
              .number()
              .min(0, "Calculated amount must be positive"),
          }),
        )
        .optional()
        .default([]),
    })
    .superRefine((data, ctx) => {
      const grade = activeSalaryGradeList.find((g) => g.value === data.gradeId);

      if (!grade) return;

      const min = Number(grade.minSalary || 0);
      const max = Number(grade.maxSalary || 0);

      if (data.basicSalary < min || data.basicSalary > max) {
        ctx.addIssue({
          path: ["basicSalary"],
          message: `Basic Salary must be between ${min} and ${max}`,
          code: z.ZodIssueCode.custom,
        });
      }
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
    setShowDetailsModal(true);
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
  } = useSalaryStructuresFilters(itemsPerPage);

  // ⚡ Form
  const {
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(salaryStructureSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  // 🧠 ---------- API HOOKS ----------
  const {
    useSalaryStructuresQuery,
    addOrUpdateSalaryStructureMutation,
    deleteSalaryGradeRuleMutation,
    toggleSalaryStructureStatusMutation,
    useActivePayItemQuery,
  } = usePayrollQueryApi({ reset, setError, handleClose, setShowModal });

  const { useAppEmployeeUsersQuery } = useHrQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  const {
    useOfficeListQuery,
    useDesignationListQuery,
    useDepartmentListQuery,
  } = useCommonQueryApi({ reset, setError, handleClose, setShowModal });

  const { data: officeList = [] } = useOfficeListQuery();

  const { data: designationList = [] } = useDesignationListQuery();

  const { data: departmentList = [] } = useDepartmentListQuery();
  const populatedDepartmentList = useMemo(() => {
    if (filters.designationId) {
      const findDesignation = designationList.find(
        (item) => item.value === filters.designationId,
      );

      if (findDesignation) {
        return departmentList.filter(
          (item) => item.value === findDesignation.departmentId,
        );
      }
    }
    return [];
  }, [filters.designationId, designationList, departmentList]);

  const { data: appEmployeeUsers } = useAppEmployeeUsersQuery();

  // React Query for data fetching with pagination and search
  const { data: activePayItemData } = useActivePayItemQuery();

  const activePayItemList = useMemo(
    () => activePayItemData?.data || [],
    [activePayItemData?.data],
  );
  const processedPayItemList = useMemo(() => {
    return (activePayItemList || []).map((item) => ({
      ...item,
      value: parseInt(item.value), // Convert string to number
    }));
  }, [activePayItemList]);

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
  } = useSalaryStructuresQuery(queryParams);
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
    // Validate basic salary against grade range
    const grade = activeSalaryGradeList.find(
      (g) => g.value === values.gradeId || g.id === values.gradeId,
    );
    if (grade) {
      const basic = parseFloat(values.basicSalary || 0);
      const min = Number(grade.minSalary || 0);
      const max = Number(grade.maxSalary || 0);
      if (basic < min || basic > max) {
        setError("basicSalary", {
          type: "manual",
          message: `Basic Salary must be between ${min.toLocaleString()} and ${max.toLocaleString()}`,
        });
        return;
      }
    }

    const payload = {
      ...values,
      empSalaryStructureDetails: values.empSalaryStructureDetails.map((d) => ({
        ...d,
        calculatedAmount:
          d.amount > 0 ? d.amount : (values.basicSalary * d.percentage) / 100,
      })),
    };
    if (errors.basicSalary) return;
    await addOrUpdateSalaryStructureMutation.mutateAsync(payload);
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

  // 🔄 Toggle Status handler
  const handleToggleStatus = useCallback(
    async (id) => {
      try {
        await toggleSalaryStructureStatusMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error toggling salary structure status:", error);
      }
    },
    [toggleSalaryStructureStatusMutation],
  );

  // ➕ Add new salary structure handler
  const handleNewSalaryStructure = useCallback(() => {
    reset(initialValues);
    setShowModal(true);
  }, [reset]);

  // 🧠 Build filter config
  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search by Employee Name, ID, Grade, Remarks...",
    },
    {
      component: "select",
      name: "gradeId",
      label: "Select Grade",
      options: activeSalaryGradeList || [],
      placeholder: "Filter by Grade",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "officeId",
      label: "Select Office",
      options: officeList || [],
      placeholder: "Filter by Office",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "designationId",
      label: "Select Designation",
      options: designationList || [],
      placeholder: "Filter by Designation",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "departmentId",
      label: "Select Department",
      options: populatedDepartmentList || [],
      placeholder: "Filter by Department",
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

  // 🧠 ---------- TABLE ----------
  const columns = useSalaryStructuresTableColumn({
    handleEdit,
    handleDelete,
    handleToggleStatus,
    handleViewDetails,
    hasPermission,
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
    addOrUpdateSalaryStructureMutation?.isLoading ||
    deleteSalaryGradeRuleMutation?.isLoading ||
    toggleSalaryStructureStatusMutation?.isLoading;

  const isEditing = watch("id") !== 0;

  return (
    <div>
      <PayrollPageInstructionBanner
        stepNumber={4}
        stepTitle="Employee Salary Structures"
        description="Salary Structures assign approved compensation plans to individual employees. Each structure pairs an employee with a Salary Grade, determines their basic salary within the grade range, and auto-calculates line-item allowances and deductions."
        prerequisites={[
          {
            label: "Employees",
            href: "/hr-management/employees?page=1&limit=10",
            count: appEmployeeUsers?.length ?? 0,
            isRequired: true,
            isMissing: (appEmployeeUsers?.length ?? 0) === 0,
            helperText:
              (appEmployeeUsers?.length ?? 0) === 0
                ? "No active employees found. Register employees before creating salary structures."
                : `${appEmployeeUsers?.length ?? 0} employee(s) available.`,
          },
          {
            label: "Salary Grades",
            href: "/payroll-management/salary-grades?page=1&limit=10",
            count: activeSalaryGradeList.length,
            isRequired: true,
            isMissing: activeSalaryGradeList.length === 0,
            helperText:
              activeSalaryGradeList.length === 0
                ? "No salary grades found. Create at least one salary grade."
                : `${activeSalaryGradeList.length} salary grade(s) available.`,
          },
          {
            label: "Pay Items",
            href: "/payroll-management/pay-items?page=1&limit=10",
            count: processedPayItemList.length,
            isRequired: true,
            isMissing: processedPayItemList.length === 0,
            helperText:
              processedPayItemList.length === 0
                ? "No pay items found. Create pay items to build structure breakdowns."
                : `${processedPayItemList.length} pay item(s) available.`,
          },
        ]}
        prevStep={{
          label: "Salary Grade Rules",
          href: "/payroll-management/salary-grade-rules?page=1&limit=10",
        }}
        nextStep={{
          label: "Payroll Runs",
          href: "/payroll-management/payroll-runs?page=1&limit=10",
        }}
        storageKey="salary_structures"
      />

      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-2xl">Salary Structures</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage Employee Salary Structures and Grade Assignments
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

          {hasPermission("payroll_management.salary_structures_add") && (
            <ButtonTw
              onClick={handleNewSalaryStructure}
              variant="blue"
              className="gap-2"
            >
              <BiPlus /> Add Salary Structure
            </ButtonTw>
          )}
        </div>
      </div>

      {/* Add/Edit Salary Structure Modal */}

      <AddOrUpdateSalaryStructureModal
        showModal={showModal}
        handleClose={handleClose}
        isEditing={isEditing}
        control={control}
        watch={watch}
        setError={setError}
        clearErrors={clearErrors}
        setValue={setValue}
        employeeList={appEmployeeUsers || []}
        gradeList={activeSalaryGradeList || []}
        payItemList={processedPayItemList || []} // Pass pay item list
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        isLoading={isLoading}
        errors={errors}
        reset={reset}
      />

      <SalaryStructureDetailsModal
        // showModal={showModal}
        // handleClose={handleClose}
        showModal={showDetailsModal}
        handleClose={handleCloseDetailsModal}
        salaryStructureData={selectedSalaryDetails}
        employeeList={appEmployeeUsers || []}
        gradeList={activeSalaryGradeList || []}
        payItemList={processedPayItemList || []} // Pass pay item list
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

      {/* <SalaryStructureComponentDetailsModal
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        selectedSalaryDetails={selectedSalaryDetails}
      /> */}

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

export default SalaryStructures;
