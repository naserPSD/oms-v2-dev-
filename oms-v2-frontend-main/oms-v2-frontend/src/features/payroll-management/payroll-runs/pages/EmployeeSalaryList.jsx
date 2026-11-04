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
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  lazy,
  Suspense,
} from "react";
import { useForm } from "react-hook-form";
import { BiMailSend, BiPlus, BiTrash } from "react-icons/bi";
import {
  FaArrowAltCircleDown,
  FaArrowAltCircleUp,
  FaDesktop,
  FaFilter,
  FaMinusCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";
import { usePayrollRunFilters } from "./hooks/usePayrollRunFilters";
import { useSalaryListTableColumn } from "./hooks/useSalaryListTableColumn";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import AddOrUpdateModal from "./components/AddOrUpdateModal";
import { Clock, FileCheck2, FileDown, TrendingUp } from "lucide-react";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import SalaryBreakdownDetailsModal from "./components/SalaryBreakdownDetailsModal";

// Lazy load PenaltyDetailsModal to improve initial page load
const PenaltyDetailsModal = lazy(
  () => import("./components/PenaltyDetailsModal"),
);

const initialValues = {
  id: 0,
  remarks: "",
  extraAmount: 0,
  penaltiesAmount: 0,
  payable: 0,
  paid: 0,
  due: 0,
  payingAmount: 0,
  newDueAmount: 0,
  penaltyApply: true,
};
const EmployeeSalaryList = ({ payrollRunId }) => {
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const paymentStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "payment_statuses")
      ?.statuses || [];

  const { useActiveSalaryGradeQuery } = usePayrollQueryApi({});
  const { data: activeSalaryGradeData } = useActiveSalaryGradeQuery();

  const activeSalaryGradeList = useMemo(
    () => activeSalaryGradeData?.data || [],
    [activeSalaryGradeData?.data],
  );
  // Schema for salary structure
  // Updated schema for salary structure with details array
  const salaryStructureSchema = z.object({
    id: z.coerce.number().optional(),
    remarks: z.string().nullable().optional(),
    extraAmount: z.coerce.number().optional(),
    penaltiesAmount: z.coerce.number().optional(),
    payable: z.coerce.number().optional(),
    paid: z.coerce.number().optional(),
    due: z.coerce.number().optional(),
    payingAmount: z.coerce.number().optional(),
    newDueAmount: z.coerce.number().optional(),
    penaltyApply: z.boolean().optional(),
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
  const [rowSelection, setRowSelection] = useState({});
  // const [selectedLeads, setSelectedLeads] = useState([]);

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
    resolver: zodResolver(salaryStructureSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);
  // Prevent state updates on unmounted components
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Safe wrappers that only call setters when mounted
  const safeReset = (...args) => {
    if (isMountedRef.current) reset(...args);
  };
  const safeSetError = (...args) => {
    if (isMountedRef.current) setError(...args);
  };
  const safeHandleClose = () => {
    if (isMountedRef.current) handleClose();
  };
  const safeSetShowModal = (v) => {
    if (isMountedRef.current) setShowModal(v);
  };

  // 🧠 ---------- API HOOKS ----------
  const {
    useEmpMonthlySalaryListQuery,
    addOrUpdateEmpMonthlySalaryListMutation,
    payNowEmpMonthlySalaryMutation,
    deleteEmpMonthlyRecordMutation,
    deleteBulkEmpMonthlyRecordMutation,
    payNowBulkEmpMonthlyRecordMutation,
    toggleSalaryStructureStatusMutation,
    useActivePayItemQuery,
  } = usePayrollQueryApi({
    reset: safeReset,
    setError: safeSetError,
    handleClose: safeHandleClose,
    setShowModal: safeSetShowModal,
  });

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

  const mergeQueryParams = {
    ...queryParams,
    payrollRunId: Number(payrollRunId) || 0,
  };

  // React Query for data fetching
  const {
    data: responseData,
    isLoading: isFetching,
    refetch,
  } = useEmpMonthlySalaryListQuery(mergeQueryParams);
  // React Query for data fetching

  // console.log('responseData', responseData)

  const dataArray = useMemo(
    () => responseData?.data?.list?.data || [],
    [responseData?.data?.list?.data],
  );

  const summaryItem = useMemo(
    () => responseData?.data?.summary || [],
    [responseData?.data?.summary],
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
    if (errors.basicSalary) return;
    await addOrUpdateEmpMonthlySalaryListMutation.mutateAsync(values);
  };

  const payNowEmployeeSalaryForm = async (formData) => {
    if (!selectedSalaryDetails) return;

    const payload = {
      ...selectedSalaryDetails,
      ...formData,
      id: selectedSalaryDetails.id,
    };

    await payNowEmpMonthlySalaryMutation.mutateAsync(payload);
    handleCloseDetailsModal();
    refetch();
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

  const handleViewDetails = (salaryDetails) => {
    setSelectedSalaryDetails(salaryDetails);
    reset({
      id: salaryDetails.id,
      remarks: salaryDetails?.remarks,
      extraAmount: salaryDetails?.extraAmount,
      penaltiesAmount: salaryDetails?.penaltiesAmount,
      penaltyApply: salaryDetails?.penaltyApply,
      payable: salaryDetails?.payable,
      paid: salaryDetails?.paid,
      due: salaryDetails?.due,
    });
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = useCallback(() => {
    setSelectedSalaryDetails(null);
    setShowDetailsModal(false);
  }, []);

  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  const showPenaltyDetails = (salaryDetails) => {
    setSelectedSalaryDetails(salaryDetails);
    reset({
      id: salaryDetails.id,
      remarks: salaryDetails?.remarks,
      extraAmount: salaryDetails?.extraAmount,
      penaltiesAmount: salaryDetails?.penaltiesAmount,
      penaltyApply: salaryDetails?.penaltyApply,
      payable: salaryDetails?.payable,
      paid: salaryDetails?.paid,
      due: salaryDetails?.due,
    });
    setShowPenaltyModal(true);
  };

  const handleClosePenaltyModal = useCallback(() => {
    setSelectedSalaryDetails(null);
    setShowPenaltyModal(false);
  }, []);

  // In your EmployeeSalaryList component, add this calculation function:
  const calculateUpdatedAmounts = useCallback(
    (baseNetSalary, extraAmount, penaltiesAmount, currentPaid) => {
      // Base net salary is the starting point
      let payable = baseNetSalary;

      // Add extra amount if provided
      if (extraAmount && extraAmount > 0) {
        payable = Number(payable) + Number(extraAmount);
      }

      // Subtract penalties if applied
      if (penaltiesAmount && penaltiesAmount > 0) {
        payable = Number(payable) - Number(penaltiesAmount);
      }

      // Ensure payable doesn't go negative
      payable = Math.max(0, payable);

      // Calculate due amount (payable - already paid)
      const due = Math.max(0, Number(payable) - Number(currentPaid || 0));

      return {
        payable: payable.toFixed(2),
        due: due.toFixed(2),
        // Paid remains the same (already paid amount)
        paid: currentPaid || 0,
      };
    },
    [],
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
          await deleteEmpMonthlyRecordMutation.mutateAsync(id);
          refetch();
        }
      });
    },
    [deleteEmpMonthlyRecordMutation, refetch],
  );

  // ➕ Add new salary structure handler
  const handleNewSalaryStructure = useCallback(() => {
    reset(initialValues);
    setShowModal(true);
  }, [reset]);

  // API hooks
  const {
    useOfficeListQuery,
    useDesignationListQuery,
    useDepartmentListQuery,
  } = useCommonQueryApi({ reset, setError, handleClose, setShowModal });

  const { data: officeList = [] } = useOfficeListQuery();
  const { data: departmentList = [] } = useDepartmentListQuery();
  const { data: designationList = [] } = useDesignationListQuery();

  const populatedDesignationList = useMemo(() => {
    if (filters.departmentId) {
      const findDepartment = departmentList.find(
        (item) => item.value === filters.departmentId,
      );

      if (findDepartment) {
        return designationList.filter(
          (item) => item.departmentId === findDepartment.value,
        );
      }
    }
    return [];
  }, [filters.departmentId, designationList, departmentList]);

  // 🧠 Build filter config
  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search by employee name, email, code",
    },
    {
      component: "input",
      name: "payPeriodYear",
      label: "Search",
      placeholder: "Search by year",
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
      name: "officeId",
      label: "Select Office",
      options: officeList || [],
      placeholder: "Filter by Office",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "departmentId",
      label: "Select Department",
      options: departmentList || [],
      placeholder: "Filter by Department",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "designationId",
      label: "Select Designation",
      options: populatedDesignationList || [],
      placeholder: "Filter by Designation",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "paymentStatusId",
      label: "Select Payment Status",
      options: paymentStatusList,
      placeholder: "Filter by payment status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
    },
  ];

  // 🧠 ---------- TABLE ----------
  const columns = useSalaryListTableColumn({
    handleEdit,
    handleDelete,
    handleViewDetails,
    showPenaltyDetails,
  });

  // Create TanStack Table instance
  const table = useReactTable({
    data: listData,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    // enableRowSelection: true,
    // enableRowSelection: row =>
    //   row.original.paymentStatus?.name !== "Paid",
    enableRowSelection: (row) =>
      row.original?.paymentStatus?.code !== "payment_status_paid",
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeDirection: "rtl",
  });

  useEffect(() => {
    setRowSelection({});
  }, [currentPage, responseData]);

  const selectedRows = table.getSelectedRowModel().rows;

  const selectedRowCount = selectedRows.length;

  // const selectedIds = useMemo(
  //   () => selectedRows.map(row => row.original.id),
  //   [selectedRows]
  // );

  const deletableIds = useMemo(
    () =>
      selectedRows
        .filter(
          (row) =>
            row.original?.paymentStatus?.code !== "payment_status_paid" &&
            row.original?.paymentStatus?.code !==
              "payment_status_partially_paid",
        )
        .map((row) => row.original.id),
    [selectedRows],
  );

  const handleBulkDelete = useCallback(async () => {
    if (!deletableIds.length) return;
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
        await deleteBulkEmpMonthlyRecordMutation.mutateAsync(deletableIds);
        // refetch();
        setRowSelection({}); // ✅ reset selection
      }
    });
  }, [deleteBulkEmpMonthlyRecordMutation]);

  const payableIds = useMemo(
    () =>
      selectedRows
        .filter(
          (row) => row.original?.paymentStatus?.code !== "payment_status_paid",
        )
        .map((row) => row.original.id),
    [selectedRows],
  );

  const handleBulkPayNow = useCallback(async () => {
    if (!payableIds.length) return;
    Swal.fire({
      title: "Are you sure to pay?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, pay it!",
      customClass: {
        popup: "swal-popup",
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await payNowBulkEmpMonthlyRecordMutation.mutateAsync(payableIds);
        // refetch();
        setRowSelection({}); // ✅ reset selection
      }
    });
  }, [payNowBulkEmpMonthlyRecordMutation]);

  const isLoading =
    isFetching ||
    addOrUpdateEmpMonthlySalaryListMutation?.isLoading ||
    payNowEmpMonthlySalaryMutation?.isLoading ||
    deleteEmpMonthlyRecordMutation?.isLoading ||
    deleteBulkEmpMonthlyRecordMutation?.isLoading ||
    payNowBulkEmpMonthlyRecordMutation?.isLoading ||
    toggleSalaryStructureStatusMutation?.isLoading;

  const isEditing = watch("id") !== 0;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-2xl">
            Employee Monthly Salary List
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage employee monthly salary structures for payroll runs.
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
          {/* <ButtonTw
            onClick={handleNewSalaryStructure}
            variant="blue"
            className="gap-2"
          >
            <BiPlus /> Create New Month for Payroll Run
          </ButtonTw> */}
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

      <div className="space-y-4 mb-4">
        {/* Top Summary Section */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Salary Summary Card */}
          <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4 ">
              <HiOutlineCalendarDays className="text-2xl text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 ">
                Salary Summary
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 ">
                    Total Payable
                  </p>
                  <p className="text-2xl font-bold text-blue-500 flex items-center gap-1">
                    {helpers.formatCurrency(summaryItem?.payable)}
                  </p>
                </div>
              </div>

              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Total Paid
                  </p>
                  <p className="text-2xl font-bold text-green-500 flex items-center gap-1">
                    {helpers.formatCurrency(summaryItem?.paid)}
                  </p>
                </div>
              </div>

              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Due Amount
                  </p>
                  <p className="text-2xl font-bold text-red-500 flex items-center gap-1">
                    {helpers.formatCurrency(summaryItem?.due)}
                  </p>
                </div>
              </div>

              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Total Employees
                  </p>
                  <p className="text-2xl font-bold text-orange-500 flex items-center gap-1">
                    {summaryItem?.totalEmployees || 0}
                  </p>
                </div>
              </div>

              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Payroll Month
                  </p>
                  <p className="text-2xl font-bold text-orange-500 flex items-center gap-1">
                    {helpers.monthNumberToName(summaryItem?.payPeriodMonth)}/
                    {summaryItem?.payPeriodYear}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRowCount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedRowCount + ` Record${selectedRowCount > 1 ? "s" : ""}`}{" "}
                Selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* <SimpleTooltip text="Send Email">
                      <ButtonTw variant="outline" size="sm" className="gap-2">
                        <BiMailSend /> Send Attendance Report Email ({selectedRowCount})
                      </ButtonTw>
                    </SimpleTooltip> */}
              <SimpleTooltip text="Delete Selected">
                <ButtonTw
                  onClick={handleBulkPayNow}
                  variant="green"
                  size="sm"
                  className="gap-2"
                >
                  <BiTrash /> Pay Now ({selectedRowCount})
                </ButtonTw>
              </SimpleTooltip>
              <SimpleTooltip text="Delete Selected">
                <ButtonTw
                  onClick={handleBulkDelete}
                  variant="red"
                  size="sm"
                  className="gap-2"
                >
                  <BiTrash /> Delete ({selectedRowCount})
                </ButtonTw>
              </SimpleTooltip>
            </div>
          </div>
        </div>
      )}

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

      <SalaryBreakdownDetailsModal
        itemData={selectedSalaryDetails}
        showModal={showDetailsModal}
        handleClose={handleCloseDetailsModal}
        onPayNow={payNowEmployeeSalaryForm}
        isLoading={isLoading}
        reset={reset}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        control={control}
        watch={watch}
        setValue={setValue}
        calculateUpdatedAmounts={calculateUpdatedAmounts}
      />

      {showPenaltyModal && (
        <Suspense fallback={null}>
          <PenaltyDetailsModal
            itemData={selectedSalaryDetails}
            showModal={showPenaltyModal}
            handleClose={handleClosePenaltyModal}
          />
        </Suspense>
      )}
    </div>
  );
};

export default EmployeeSalaryList;
