import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useAuthStore } from "@/store/useAuthStore";
import { useCommonStore } from "@/store/useCommonStore";
import helpers from "@/utils/helpers";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { usePendingLeaveRequestTable } from "./hooks/usePendingLeaveRequestTable";
import CommonTable from "@/components/common/CommonTable";
import { usePendingLeaveRequestFilters } from "./hooks/usePendingLeaveRequestFilters";
import EmployeeLeaveBalanceModal, {
  leaveRequestDays,
  useLeaveBalancesForRows,
} from "./modals/EmployeeLeaveBalanceModal";
import LeaveApprovalModal from "./modals/LeaveApprovalModal";
import LeaveDecisionModal from "./modals/LeaveDecisionModal";
import LeaveTableExportMenu from "../components/LeaveTableExportMenu";
import { leaveYearOptions } from "../utils/leaveYearOptions";

const LeaveApplicationsTab = () => {
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

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [balanceRow, setBalanceRow] = useState(null);
  const [decisionRow, setDecisionRow] = useState(null);
  const [requisitionId, setRequisitionId] = useState(null);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );

  const requisitionStatusList =
    dropdowns.statusGroupList?.find(
      (s) => s.code === "leave_request_approval_statuses",
    )?.statuses ?? [];

  const [sorting, setSorting] = useState([]);

  const { useAllPendingLeaveRequestQuery, updateLeaveRequestStatusMutation } =
    useHrQueryApi({});

  // API hooks
  const { useDesignationListQuery } = useCommonQueryApi({});

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
  } = usePendingLeaveRequestFilters(itemsPerPage);

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useAllPendingLeaveRequestQuery(queryParams);

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
  const leaveBalances = useLeaveBalancesForRows(listData);

  const handleStatusFrom = async (values) => {
    const payload = { ...values, id: requisitionId };
    await updateLeaveRequestStatusMutation.mutateAsync(payload);
  };

  const handleStatusChange = (item) => {
    setRequisitionId(item.id);
    setShowStatusModal(true);
  };

  // TanStack Table columns

  const columns = usePendingLeaveRequestTable({
    handleStatusChange,
    onViewBalance: setBalanceRow,
    onViewDecision: setDecisionRow,
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

  const isLoading = isFetching || updateLeaveRequestStatusMutation.isLoading;
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
    // {
    //   component: "datePicker",
    //   name: "approvalDate",
    //   label: "Approved Date",
    //   placeholder: "Filter by Approved Date",
    // },

    // {
    //   component: "select",
    //   name: "statusId",
    //   label: "Select Requisition Status",
    //   options: requisitionStatusList || [],
    //   placeholder: "Filter by Status",
    //   className: "col-span-12 lg:col-span-3 sm:col-span-12",
    // },
    {
      component: "clear",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between my-5 flex-wrap gap-2">
        <h1 className="title-color font-bold text-lg">
          Leave Application List
        </h1>
        <div className="flex gap-2 flex-wrap">
          <LeaveTableExportMenu
            title="Leave Applications"
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

      <LeaveDecisionModal
        show={Boolean(decisionRow)}
        onClose={() => setDecisionRow(null)}
        row={decisionRow}
      />
      <LeaveApprovalModal
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSubmit={handleStatusFrom}
        statusOptions={requisitionStatusList}
        isLoading={updateLeaveRequestStatusMutation.isLoading}
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
export default LeaveApplicationsTab;
