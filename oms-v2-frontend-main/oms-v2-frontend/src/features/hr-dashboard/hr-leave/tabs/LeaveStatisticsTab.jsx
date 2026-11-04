import DataFilter from "@/components/common/DataFilter";

import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import CardWithAvatars from "@/components/ui/CardWithAvatars";

import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useAuthStore } from "@/store/useAuthStore";
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaFilter, FaCog } from "react-icons/fa";
import { BiPlus } from "react-icons/bi";
import Link from "next/link";
import { AlertCircle, ArrowRight, X } from "lucide-react";

import { z } from "zod";
import { useHrLeaveRequestFilters } from "./hooks/useHrLeaveRequestFilters";
import { useHrLeaveRequestTableColumns } from "./hooks/useHrLeaveRequestTableColumns";
import CommonTable from "@/components/common/CommonTable";
import AddLeaveModalStatistics from "./modals/AddLeaveModalStatistics";
import CardLeaveModal from "./modals/CardLeaveModal";
import EmployeeLeaveBalanceModal, {
  leaveRequestDays,
  useLeaveBalancesForRows,
} from "./modals/EmployeeLeaveBalanceModal";
import LeaveApprovalModal from "./modals/LeaveApprovalModal";
import LeaveDecisionModal from "./modals/LeaveDecisionModal";
import LeaveTableExportMenu from "../components/LeaveTableExportMenu";
import { leaveYearOptions } from "../utils/leaveYearOptions";

const initialValues = {
  id: 0,
  itemDescription: "",
  quantity: 1,
  estimatedCost: 0,
};
const schema = z.object({
  id: z.coerce.number().optional(),
  itemDescription: z.string().min(1, "Item Description is required"),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be greater than or equal to 1"),
  estimatedCost: z.coerce
    .number()
    .min(1, "Estimated Cost must be greater than or equal to 1"),
});

const LeaveStatisticsTab = ({ hasPermission }) => {
  // const { t } = useTranslation();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const authUser = useAuthStore((state) => state.user);
  const { useGetCompanyInfoQuery } = useCompanySettingsQueryApi({});
  const { data: companyInfoRes } = useGetCompanyInfoQuery();
  const companyInfo = companyInfoRes?.data?.data || companyInfoRes?.data;
  const yearOptions = useMemo(
    () =>
      leaveYearOptions(
        companyInfo?.createdAt || authUser?.activeApp?.createdAt,
      ),
    [companyInfo?.createdAt, authUser?.activeApp?.createdAt],
  );

  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [balanceRow, setBalanceRow] = useState(null);
  const [requisitionId, setRequisitionId] = useState(null);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );

  const [summaryTab, setSummaryTab] = useState(null);
  const [decisionRow, setDecisionRow] = useState(null);
  const requisitionStatusList =
    dropdowns.statusGroupList?.find(
      (s) => s.code === "leave_request_approval_statuses",
    )?.statuses ?? [];

  const [sorting, setSorting] = useState([]);

  const {
    // register,
    // formState: { errors },
    // setValue,
    reset,
    handleSubmit,
    control,
    watch,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Modal handlers
  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  // API hooks
  const {
    useAllLeaveRequestSummaryQuery,
    useAllLeaveRequestQuery,
    updateLeaveRequestStatusMutation,
    deleteRequisitionMutation,
    addOrUpdateRequisitionMutation,
    useLeaveTypeQuery,
    // useOfficeListQuery
    // toggleArchivePersonalNoteMutation,
    // togglePinPersonalNoteMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  // API hooks
  const { useDesignationListQuery } = useCommonQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  // const { data: departmentList = [] } = useDepartmentListQuery();
  //   const { data: officeList = [] } = useOfficeListQuery();

  const { data: designationList = [] } = useDesignationListQuery();

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
  } = useHrLeaveRequestFilters(itemsPerPage);

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  const { data: responseData, isLoading: isFetching } =
    useAllLeaveRequestQuery(queryParams);
  const { data: summaryData, isLoading: isSummaryFetching } =
    useAllLeaveRequestSummaryQuery();

  const selectedYear = filters.year || String(new Date().getFullYear());
  const { data: leaveTypeResponse, isLoading: isLeaveTypeLoading } =
    useLeaveTypeQuery({ year: selectedYear, limit: 1 });
  const { data: allLeaveTypeResponse, isLoading: isAllLeaveTypeLoading } =
    useLeaveTypeQuery({ limit: 1 });

  const isYearSetupIncomplete =
    !isLeaveTypeLoading &&
    (leaveTypeResponse?.data?.length || 0) === 0 &&
    (leaveTypeResponse?.pagination?.total || 0) === 0;

  const isAllLeaveSetupEmpty =
    !isAllLeaveTypeLoading &&
    (allLeaveTypeResponse?.data?.length || 0) === 0 &&
    (allLeaveTypeResponse?.pagination?.total || 0) === 0;

  const [dismissedInstruction, setDismissedInstruction] = useState(false);
  const dismissInstructionKey = `leave-setup-instruction-${selectedYear}`;

  useEffect(() => {
    try {
      setDismissedInstruction(
        sessionStorage.getItem(dismissInstructionKey) === "1",
      );
    } catch {
      // ignore
    }
  }, [dismissInstructionKey]);

  const handleDismissInstruction = () => {
    setDismissedInstruction(true);
    try {
      sessionStorage.setItem(dismissInstructionKey, "1");
    } catch {
      // ignore
    }
  };

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data],
  );

  // Prefer live summary counts; keep list-header avatars (valid next/image URLs)
  const cardHeaders = useMemo(() => {
    const listHeaders = dataArray.headers || {};

    if (!summaryData?.pending && !summaryData?.approved) {
      return listHeaders;
    }

    const mapSection = (key) => ({
      count: summaryData?.[key]?.count ?? listHeaders?.[key]?.count ?? 0,
      users:
        listHeaders?.[key]?.users?.length > 0
          ? listHeaders[key].users
          : (summaryData?.[key]?.users || []).map((u) => ({
              name: u.employeeName || "N/A",
              fileUrl: "",
            })),
    });

    return {
      pending: mapSection("pending"),
      approved: mapSection("approved"),
      rejected: mapSection("rejected"),
      total: mapSection("total"),
    };
  }, [summaryData, dataArray.headers]);

  const pagination = responseData?.list?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total } = pagination;

  const listData = useMemo(() => {
    return dataArray.list?.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);
  const leaveBalances = useLeaveBalancesForRows(listData || []);

  const submitForm = async (values) => {
    await addOrUpdateRequisitionMutation.mutateAsync(values);
  };

  const handleStatusFrom = async (values) => {
    const payload = { ...values, id: requisitionId };
    await updateLeaveRequestStatusMutation.mutateAsync(payload);
  };

  // const handleDelete = useCallback(
  //   async (id) => {
  //     Swal.fire({
  //       title: "Are you sure?",
  //       text: "You won't be able to revert this!",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonText: "Yes, delete it!",
  //       customClass: {
  //         popup: "swal-popup",
  //         confirmButton: "swal-confirm-btn",
  //         cancelButton: "swal-cancel-btn",
  //       },
  //       buttonsStyling: false,
  //     }).then(async (result) => {
  //       if (result.isConfirmed) {
  //         await deleteRequisitionMutation.mutateAsync(id);
  //       }
  //     });
  //   },
  //   [deleteRequisitionMutation],
  // );

  const handleEdit = useCallback(
    (item) => {
      reset(item);
      setShowModal(true);
    },
    [reset],
  );

  const handleStatusChange = (item) => {
    setRequisitionId(item.id);
    setShowStatusModal(true);
  };

  // TanStack Table columns

  const columns = useHrLeaveRequestTableColumns({
    handleStatusChange,
    handleEdit,
    onViewBalance: setBalanceRow,
    onViewDecision: setDecisionRow,
    //  handleDelete,
    hasPermission,
  });

  // Create TanStack Table instance
  const table = useReactTable({
    data: listData || [],
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
    isSummaryFetching ||
    addOrUpdateRequisitionMutation.isLoading ||
    updateLeaveRequestStatusMutation?.isLoading ||
    deleteRequisitionMutation.isLoading;

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Name, Email, Phone...",
    },
    {
      component: "select",
      name: "year",
      label: "Year",
      options: yearOptions,
      placeholder: "Search year",
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
    // {
    //   component: "select",
    //   name: "departmentId",
    //   label: "Select Department",
    //   options: departmentList || [],
    //   placeholder: "Filter by Department",
    //   className: "col-span-12 lg:col-span-3 sm:col-span-12",
    // },

    {
      component: "datePicker",
      name: "createdAt",
      label: "Applied On Date",
      placeholder: "Filter by Applied On",
    },
    {
      component: "datePicker",
      name: "approvalDate",
      label: "Approved Date",
      placeholder: "Filter by Approved Date",
    },

    {
      component: "select",
      name: "statusId",
      label: "Select Application Status",
      options: requisitionStatusList || [],
      placeholder: "Filter by Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
    },
  ];

  return (
    <div>
      {/* Instruction for Leave Setup if not yet configured */}
      {!dismissedInstruction && isYearSetupIncomplete && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3.5 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {isAllLeaveSetupEmpty
                      ? "Leave Setup is not configured yet"
                      : `Leave Setup is incomplete for ${selectedYear}`}
                  </h3>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {isAllLeaveSetupEmpty
                      ? "No leave types or policies have been created for your company yet. Leave applications and statistics require leave types (such as Casual, Sick, or Annual Leave) to be configured first."
                      : `No leave types are configured for the year ${selectedYear}. To track leave balances, calculate statistics, and approve employee applications for this year, please complete leave setup for ${selectedYear}.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDismissInstruction}
                  className="rounded-md p-1 text-gray-400 hover:bg-white/70 hover:text-gray-600 dark:hover:bg-gray-800"
                  aria-label="Dismiss instruction"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 rounded-lg border border-amber-200/80 bg-white/70 p-3 text-xs dark:border-amber-900/40 dark:bg-gray-900/60">
                <p className="font-semibold text-gray-900 dark:text-gray-200">
                  Steps to complete Leave Setup:
                </p>
                <ol className="mt-1.5 list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  <li>
                    Switch to the{" "}
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      Leave Setup
                    </span>{" "}
                    tab.
                  </li>
                  <li>
                    Click{" "}
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      + Add New
                    </span>{" "}
                    to create a leave type (e.g., Casual Leave, Sick Leave, Annual Leave).
                  </li>
                  <li>
                    Set <span className="font-semibold">Year</span> to{" "}
                    <span className="font-semibold">{selectedYear}</span>, enter the{" "}
                    <span className="font-semibold">Max Days Per Year</span>, and choose whether it requires approval.
                  </li>
                  <li>
                    Save your leave types. Once saved, leave statistics and balances for{" "}
                    {selectedYear} will be active.
                  </li>
                </ol>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/hr-dashboard/leave?tab=leaveSetup&year=${selectedYear}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
                >
                  <FaCog className="h-3.5 w-3.5" />
                  <span>Go to Leave Setup</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between my-5 flex-wrap gap-2">
        <h1 className="title-color font-bold text-lg">Leave Statistics List</h1>
        <div className="flex gap-2 flex-wrap">
          <LeaveTableExportMenu
            title="Leave Statistics"
            data={listData}
            disabled={isLoading}
          />
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
            size="sm"
          >
            <BiPlus /> Add Leave
          </ButtonTw>

          <button className="p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            📄
          </button>
          <button className="p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            🖨️
          </button> */}
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

      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 my-6">
        <CardWithAvatars
          title="Approved Leave"
          users={cardHeaders?.approved?.users}
          count={cardHeaders?.approved?.count}
          borderColor="border-l-green-500"
          onClick={() => setSummaryTab("approved")}
        />
        <CardWithAvatars
          title="Pending Leave"
          users={cardHeaders?.pending?.users}
          count={cardHeaders?.pending?.count}
          borderColor="border-l-orange-500"
          onClick={() => setSummaryTab("pending")}
        />
        <CardWithAvatars
          title="Rejected Leave"
          users={cardHeaders?.rejected?.users}
          count={cardHeaders?.rejected?.count}
          borderColor="border-l-red-500"
          onClick={() => setSummaryTab("rejected")}
        />
        <CardWithAvatars
          title="Total Leave"
          users={cardHeaders?.total?.users}
          count={cardHeaders?.total?.count}
          borderColor="border-l-purple-500"
          onClick={() => setSummaryTab("total")}
        />
      </div>

      <AddLeaveModalStatistics
        showModal={showModal}
        handleClose={handleClose}
        control={control}
        watch={watch}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        reset={reset}
        isLoading={addOrUpdateRequisitionMutation.isLoading}
      />
      <EmployeeLeaveBalanceModal
        show={Boolean(balanceRow)}
        onClose={() => setBalanceRow(null)}
        empId={balanceRow?.empId || balanceRow?.employee?.id}
        employeeName={balanceRow?.employee?.user?.fullName}
        highlightLeaveTypeId={balanceRow?.empLeaveType?.id || balanceRow?.leaveTypeId}
        highlightLeaveTypeName={balanceRow?.empLeaveType?.name}
        requestDays={leaveRequestDays(balanceRow)}
        balance={
          leaveBalances[String(balanceRow?.empId || balanceRow?.employee?.id || "")] ||
          balanceRow?.leaveBalance
        }
      />
      <LeaveApprovalModal
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSubmit={handleStatusFrom}
        statusOptions={requisitionStatusList}
        isLoading={updateLeaveRequestStatusMutation?.isLoading}
      />
      <CardLeaveModal
        showModal={Boolean(summaryTab)}
        handleClose={() => setSummaryTab(null)}
        summaries={summaryData}
        activeTab={summaryTab || "approved"}
        onTabChange={setSummaryTab}
        isLoading={isSummaryFetching}
      />
      <LeaveDecisionModal
        show={Boolean(decisionRow)}
        onClose={() => setDecisionRow(null)}
        row={decisionRow}
      />

      <CommonTable
        table={table}
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
      />

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
export default LeaveStatisticsTab;
