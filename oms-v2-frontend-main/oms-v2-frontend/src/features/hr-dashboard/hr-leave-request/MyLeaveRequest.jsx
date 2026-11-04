"use client";
// 1️⃣ ======================= IMPORTS =======================
import { FormController as Controller } from "@/components/common/FormController";
import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useMyLeavePolicyQuery } from "@/hooks/queryApi/useMyLeavePolicyQuery";
import { useCommonStore } from "@/store/useCommonStore";
import helpers from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { isBefore, parseISO } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import { FaBook, FaChartPie, FaFilter } from "react-icons/fa";
import LeaveOverviewModal from "./components/LeaveOverviewModal";
import LeavePolicyModal from "./components/LeavePolicyModal";
import LeavePolicyOverviewPanel from "./components/LeavePolicyOverviewPanel";
import Swal from "sweetalert2";
import { z } from "zod";

import CommonTable from "@/components/common/CommonTable";
import DatePicker from "@/components/ui/DatePicker";
import FileUpload from "@/components/ui/FileUpload";
import SelectSearch from "@/components/ui/SelectSearch";
import { useMyLeaveRequestFilters } from "./hooks/useMyLeaveRequestFilters";
import { useMyLeaveRequestTableColumns } from "./hooks/useMyLeaveRequestTableColumns";

const initialValues = {
  id: 0,
  leaveTypeId: "",
  startDate: "",
  endDate: "",
  attachmentMedia: null,
};

const LeaveRequest = () => {
  // const { t } = useTranslation();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;

  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  // const [currentPage, setCurrentPage] = useState(initialPage);
  const [showModal, setShowModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showOverviewModal, setShowOverviewModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);

  // ⚡ Form

  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const localDate = (value) => {
    const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const schema = z.object({
    id: z.coerce.number().optional(),
    leaveTypeId: z.coerce.number().min(1, "Leave type is required"),
    reason: z.string().min(1, "Reason is required"),

    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((val) => {
        const today = getTodayDate();
        const selectedDate = parseISO(val);
        return !isBefore(selectedDate, today);
      }, "Start date cannot be in the past"),
    endDate: z.string().min(1, "End date is required"),
    attachmentMedia: z
      .any()
      .optional()
      .refine(
        (file) => {
          if (!file) return true;

          if (!(file instanceof File)) return false;
          const allowed =
            file.type.startsWith("image/") || file.type === "application/pdf";
          return allowed && file.size <= 2 * 1024 * 1024;
        },
        {
          message: "Image or PDF only, maximum 2MB",
        },
      ),
  }).superRefine((values, ctx) => {
    if (!values.startDate || !values.endDate) return;
    const start = parseISO(String(values.startDate).slice(0, 10));
    const end = parseISO(String(values.endDate).slice(0, 10));
    if (isBefore(end, start)) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date cannot be before the start date",
      });
    }
  });
  const {
    // register,
    // formState: { errors },
    // setValue,
    reset,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const startDate = watch("startDate");

  // Modal handlers
  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);
  // 🧠 ---------- API HOOKS ----------
  const {
    useMyLeaveRequestQuery,
    leaveTypesQuery,
    addOrUpdateLeaveRequestMutation,
    deleteLeaveRequestMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  // Prefetch leave policy as soon as page mounts (same React Query cache as modals)
  useMyLeavePolicyQuery(true);

  // API hooks
  const {
    useOfficeListQuery,
    useDesignationListQuery,
    useDepartmentListQuery,
  } = useCommonQueryApi({ reset, setError, handleClose, setShowModal });

  const { data: officeList = [] } = useOfficeListQuery();
  const { data: designationList = [] } = useDesignationListQuery();
  const { data: departmentList = [] } = useDepartmentListQuery();
  const { data: leaveTypesResponse } = leaveTypesQuery();
  const leaveTypeOptions = useMemo(
    () =>
      (leaveTypesResponse?.data || []).map((item) => ({
        label: item.year ? `${item.name} (${item.year})` : item.name,
        value: item.id,
      })),
    [leaveTypesResponse?.data],
  );

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
  } = useMyLeaveRequestFilters(itemsPerPage);

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
    useMyLeaveRequestQuery(queryParams);

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
    return dataArray?.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  // 🧠 Build filter config
  const employeeInvitationStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_invitation_statuses")
      ?.statuses ?? [];
  const statusList =
    dropdowns.statusGroupList?.find(
      (s) => s.code === "leave_request_approval_statuses",
    )?.statuses ?? [];

  // 🧠 Department list depends on selected designation
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

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Name, Email, Phone...",
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
      name: "leaveTypeId",
      label: "Select Leave Type",
      options: leaveTypeOptions || [],
      placeholder: "Filter by Leave Type",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "approvalStatusId",
      label: "Select Status",
      options: statusList || [],
      placeholder: "Filter by Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },

    {
      component: "datePicker",
      name: "startDate",
      label: "Start Date",
      placeholder: "Filter by Start Date",
    },
    {
      component: "datePicker",
      name: "endDate",
      label: "End Date",
      placeholder: "Filter by End Date",
    },
    {
      component: "clear",
    },
  ];

  const toIsoDate = (dateStr, endOfDay = false) => {
    if (!dateStr) return dateStr;
    let base = String(dateStr).trim();
    if (base.includes("T")) base = base.split("T")[0];
    const dayFirst = base.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dayFirst) {
      base = `${dayFirst[3]}-${dayFirst[2].padStart(2, "0")}-${dayFirst[1].padStart(2, "0")}`;
    }
    return endOfDay ? `${base}T23:59:59` : `${base}T00:00:00`;
  };

  // 📝 Create handler
  const submitForm = async (values) => {
    const payload = {
      ...values,
      leaveTypeId: Number(values.leaveTypeId),
      startDate: toIsoDate(values.startDate),
      endDate: toIsoDate(values.endDate, true),
    };

    if (!payload.id || payload.id === 0) {
      delete payload.id;
    }

    await addOrUpdateLeaveRequestMutation.mutateAsync(payload);
  };

  // 📝 Edit handler
  const handleEdit = useCallback(
    (item) => {
      reset(item);
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
          await deleteLeaveRequestMutation.mutateAsync(id);
        }
      });
    },
    [deleteLeaveRequestMutation],
  );

  // 🧠 ---------- TABLE ----------
  // 🧠 Custom hook for TanStack Table columns
  const columns = useMyLeaveRequestTableColumns({
    handleEdit,
    handleDelete,
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
    addOrUpdateLeaveRequestMutation.isPending ||
    deleteLeaveRequestMutation.isPending;
  // toggleArchivePersonalNoteMutation.isLoading ||
  // togglePinPersonalNoteMutation.isLoading;
  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">My Leave Request List</h1>
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
          <ButtonTw
            onClick={() => setShowPolicyModal(true)}
            variant="alternative"
            className="gap-2"
          >
            <FaBook /> Leave Policy
          </ButtonTw>
          <ButtonTw
            onClick={() => setShowOverviewModal(true)}
            variant="alternative"
            className="gap-2"
          >
            <FaChartPie /> Leave Overview
          </ButtonTw>
          <ButtonTw
            onClick={() => setShowModal(true)}
            variant="blue"
            className="gap-2"
          >
            <BiPlus /> Request Leave
          </ButtonTw>
        </div>
      </div>

      <LeavePolicyModal
        show={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        onOpenOverview={() => setShowOverviewModal(true)}
      />
      <LeaveOverviewModal
        show={showOverviewModal}
        onClose={() => setShowOverviewModal(false)}
      />

      <div>
        {" "}
        <ModalTw
          show={showModal}
          onClose={handleClose}
          title={`Request Leave`}
          size="7xl"
          dismissible={true}
          showHeader={true}
          showFooter={false}
          type="default"
          position="center"
        >
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <form
            onSubmit={handleSubmit(submitForm)}
            className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40"
          >
            <div className="mb-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Leave details
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pick this year&apos;s leave type, then choose the dates.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 ">
              <Controller
                control={control}
                name="leaveTypeId"
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Leave Type"
                    placeholder="Select leave type"
                    options={leaveTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-2"
                  />
                )}
              />
              <Controller
                control={control}
                name="reason"
                render={({ field, fieldState }) => (
                  <Input
                    label="Reason"
                    placeholder="Enter reason here..."
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-2"
                    {...field}
                    type="textarea"
                  />
                )}
              />
              <Controller
                control={control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="Start Date"
                    minDate={getTodayDate()}
                    options={{
                      dateFormat: "d-m-Y",
                      defaultDate: field.value
                        ? parseISO(field.value)
                        : getTodayDate(),
                    }}
                    value={field.value}
                    onChange={(date) => {
                      const nextStart = date || "";
                      field.onChange(nextStart);
                      const currentEnd = watch("endDate");
                      if (
                        nextStart &&
                        currentEnd &&
                        String(currentEnd).slice(0, 10) <
                          String(nextStart).slice(0, 10)
                      ) {
                        setValue("endDate", "");
                      }
                    }}
                    className=""
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="endDate"
                render={({ field, fieldState }) => (
                  <DatePicker
                    key={startDate || "end-date"}
                    label="End Date"
                    minDate={startDate ? localDate(startDate) : getTodayDate()}
                    options={{
                      dateFormat: "d-m-Y",
                      defaultDate: field.value
                        ? parseISO(field.value)
                        : startDate
                          ? parseISO(startDate)
                          : getTodayDate(),
                    }}
                    value={field.value}
                    onChange={(date) => field.onChange(date || "")}
                    className=""
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="attachmentMedia"
                render={({ field, fieldState }) => (
                  <FileUpload
                    {...field}
                    label="Attachment Media"
                    accept="image/*,application/pdf"
                    description="Image or PDF, maximum 2MB"
                    className="col-span-2"
                    error={fieldState.error?.message}
                    size="sm"
                    clearable
                  />
                )}
              />
              <div className=" w-full flex justify-center items-center gap-4 col-span-2">
                <ButtonTw
                  type="submit"
                  size="sm"
                  variant="default"
                  className="w-full font-bold mt-4 "
                  disabled={isLoading}
                  loading={isLoading}
                >
                  Submit
                </ButtonTw>

                <ButtonTw
                  size="sm"
                  variant="outline.gray"
                  className="w-full font-bold mt-4 "
                  onClick={() => reset()}
                >
                  Reset
                </ButtonTw>
              </div>
            </div>
          </form>
          <div className="min-w-0 max-h-[70vh] overflow-y-auto pr-1">
            <LeavePolicyOverviewPanel />
          </div>
          </div>
        </ModalTw>
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

export default LeaveRequest;
