"use client";
// 1️⃣ ======================= IMPORTS =======================
import { FormController as Controller } from "@/components/common/FormController";
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import DatePicker from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
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
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";
import { useVisitApplicationFilters } from "./hooks/useVisitApplicationFilters";
import { useVisitApplicationTableColumn } from "./hooks/useVisitApplicationTableColumn";
import { UserIcon } from "lucide-react";
import CardWithAvatars from "@/components/ui/CardWithAvatars";

// 2️⃣ ======================= CONSTANTS / SCHEMA =======================

const initialValues = {
  visitorEmpId: null,
  // hostEmpId: null,
  purpose: "",
  visitDate: "",
  visitTime: "",
  // checkInTime: "",
  // checkOutTime: "",
  // remarks: "",
};

// 3️⃣ ======================= COMPONENT =======================

const ApplyVisitors = ({ hasPermission }) => {
  // const { t } = useTranslation();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;

  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  // const [currentPage, setCurrentPage] = useState(initialPage);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);

  // API hooks
  const { useOfficeListQuery, useDesignationListQuery } = useCommonQueryApi({
    setShowModal,
  });

  const { data: officeList = [] } = useOfficeListQuery();
  const { data: designationList = [] } = useDesignationListQuery();

  const schema = z.object({
    visitorEmpId: z.coerce.number().min(1, "Visitor is required"),
    purpose: z
      .string()
      .min(1, "Purpose is required")
      .max(500, "Purpose is too long"),
    visitDate: z.string().min(1, "Visit date is required"),
    visitTime: z.string().min(1, "Visit time is required"),
  });

  // ⚡ Form

  const {
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);
  // 🧠 ---------- API HOOKS ----------
  const {
    useVisitEmployeeQuery,
    useApplyVisitQuery,
    addOrUpdateVisitApplicationMutation,
    deleteEmployeeMutation,
    useAppEmployeeUsersQuery,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });
  // Modal handlers

  const { data: employeeList } = useAppEmployeeUsersQuery();

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Handle employee selection
  useEffect(() => {
    if (watch("visitorEmpId") && employeeList?.length > 0) {
      const emp = employeeList.find((e) => e.value === watch("visitorEmpId"));
      setSelectedEmployee(emp);
    } else {
      setSelectedEmployee(null);
    }
  }, [watch("visitorEmpId"), employeeList]);

  const selectedOfficeId = watch("officeId");
  const selectedOffice = useMemo(() => {
    return officeList?.find((o) => o.value === selectedOfficeId);
  }, [selectedOfficeId, officeList]);

  const officeShiftOptions = useMemo(() => {
    if (selectedOffice?.officeShifts?.length > 0) {
      return selectedOffice.officeShifts.map((shift) => ({
        value: shift.id,
        label: `${shift.name} (${helpers.stringTimeToLocalTime(shift.startTime)} - ${helpers.stringTimeToLocalTime(shift.endTime)})`,
      }));
    }
    return [];
  }, [selectedOffice]);
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
  } = useVisitApplicationFilters(itemsPerPage);

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);
  // React Query for data fetching with pagination and search
  const {
    data: visitEmployeeData,
    isLoading: visitEmployeeLoading,
    refetch: refetchStats,
  } = useVisitEmployeeQuery(queryParams, {
    refetchInterval: 10000,
  });

  // Stats API returns `{ data: { list, headers } }` after offlineHandler unwrap
  const visitStatsHeaders =
    visitEmployeeData?.data?.headers || visitEmployeeData?.headers || null;

  // React Query for data fetching with pagination and search
  const {
    data: responseData,
    isLoading: isFetching,
    refetch: refetchList,
  } = useApplyVisitQuery(queryParams);

  const dataArray = useMemo(() => {
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData)) return responseData;
    return [];
  }, [responseData]);

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

  // 🧠 Build filter config
  const visitApplicationStatusList =
    dropdowns.statusGroupList?.find(
      (s) => s.code === "visit_application_statuses",
    )?.statuses ?? [];

  const employeeStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_statuses")
      ?.statuses ?? [];

  // Get employee options for dropdowns

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
      name: "designationId",
      label: "Select Designation",
      options: designationList || [],
      placeholder: "Filter by Designation",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "applicationStatusId",
      label: "Select Apply Status",
      options: visitApplicationStatusList || [],
      placeholder: "Filter by Visit Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "datePicker",
      name: "visitDate",
      label: "Visit Date",
      placeholder: "Filter by Visit Date",
    },
    {
      component: "clear",
    },
  ];

  // 📝 Create handler
  const submitForm = async (values) => {
    try {
      await addOrUpdateVisitApplicationMutation.mutateAsync(values);
      await Promise.allSettled([refetchStats(), refetchList()]);
      handleClose();
    } catch (error) {
      console.error("Submit visit application error:", error);
    }
  };

  const onInvalid = (formErrors) => {
    console.error("Form validation errors:", formErrors);
    const firstErrorMessage = Object.values(formErrors)?.[0]?.message;
    if (firstErrorMessage) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: firstErrorMessage,
      });
    }
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
          await deleteEmployeeMutation.mutateAsync(id);
        }
      });
    },
    [deleteEmployeeMutation],
  );

  // 🧠 ---------- TABLE ----------
  // 🧠 Custom hook for TanStack Table columns
  const columns = useVisitApplicationTableColumn({
    handleEdit,
    handleDelete,
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

  const isSubmitting =
    addOrUpdateVisitApplicationMutation.isPending ||
    addOrUpdateVisitApplicationMutation.isLoading;

  const isLoading =
    isFetching ||
    isSubmitting ||
    deleteEmployeeMutation.isLoading ||
    visitEmployeeLoading;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="dark-title-color font-bold text-lg">
          Apply For Visitors
        </h1>
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
          {hasPermission("hr.apply_for_visitors_add") && (
            <ButtonTw
              onClick={() => setShowModal(true)}
              variant="blue"
              className="gap-2"
            >
              <BiPlus /> Add Visit Application
            </ButtonTw>
          )}
        </div>
      </div>

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={"Add Visit Application"}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm, onInvalid)}>
          <div className="bg-sky-50 dark:bg-slate-800 border p-4 rounded-lg col-span-12 lg:col-span-12 sm:col-span-12 mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
              Employee Information
            </h3>

            <div>
              <Controller
                control={control}
                name="visitorEmpId"
                render={({ field, fieldState }) => (
                  <div>
                    <SelectSearch
                      label="Select Employee"
                      placeholder="Select Employee"
                      options={employeeList}
                      value={field.value}
                      onChange={field.onChange}
                      showAvatar={true}
                      showId={true}
                      labelKey="label"
                      valueKey="value"
                      avatarKey="avatarUrl"
                      designationKey="designation"
                      showDesignation={true}
                      idKeyName="code"
                      idKeyLabel="Employee Code"
                      error={fieldState.error?.message}
                    />
                  </div>
                )}
              />
            </div>

            {selectedEmployee && (
              <div className="mt-6 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-start gap-2">
                    <img
                      src={selectedEmployee.avatarUrl}
                      alt={selectedEmployee.label}
                      className="w-14 h-14 rounded-full border-3 border-gray-300 "
                    />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Employee Name
                      </p>
                      <p className="font-medium">
                        {selectedEmployee ? selectedEmployee.label : ""}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Employee Code
                    </p>
                    <p className="font-mono font-medium">
                      {selectedEmployee ? selectedEmployee.code : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Designation
                    </p>
                    <p className="font-medium">
                      {selectedEmployee ? selectedEmployee.designation : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            {/* Visitor Employee Dropdown */}
            {/* <Controller
              name="visitorEmpId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Visitor Employee"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={visitorEmployeeOptions}
                  placeholder="Select visitor employee..."
                  isSearchable={true}
                />
              )}
            /> */}

            {/* Purpose Input */}
            <Controller
              control={control}
              name="purpose"
              render={({ field, fieldState }) => (
                <Input
                  label="Purpose"
                  type="textarea"
                  placeholder="Enter Purpose of Visit..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="md:col-span-2"
                  {...field}
                />
              )}
            />

            {/* Visit Date */}
            <Controller
              control={control}
              name="visitDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Visit Date"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Select visit date"
                  clearable={true}
                  required
                />
              )}
            />

            {/* Visit Time */}
            <Controller
              control={control}
              name="visitTime"
              render={({ field, fieldState }) => (
                <TimePicker
                  label="Visit Time"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Select visit time"
                  required
                />
              )}
            />

            {/* Check-in Time */}
            {/* <Controller
              control={control}
              name="checkInTime"
              render={({ field, fieldState }) => (
                <Input
                  label="Check-in Time (Optional)"
                  type="time"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  {...field}
                />
              )}
            /> */}

            {/* Check-out Time */}
            {/* <Controller
              control={control}
              name="checkOutTime"
              render={({ field, fieldState }) => (
                <Input
                  label="Check-out Time (Optional)"
                  type="time"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  {...field}
                />
              )}
            /> */}

            {/* Remarks */}
            {/* <Controller
              control={control}
              name="remarks"
              render={({ field, fieldState }) => (
                <div className="md:col-span-2">
                  <Input
                    type="textarea"
                    label="Remarks (Optional)"
                    placeholder="Enter any remarks..."
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    {...field}
                  />
                </div>
              )}
            /> */}

            {/* Form Action Buttons */}
            <div className="w-full flex justify-center items-center gap-4 md:col-span-2">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-2"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                Submit
              </ButtonTw>

              <ButtonTw
                type="button"
                size="sm"
                variant="outline.gray"
                className="w-full font-bold mt-2"
                onClick={() => reset()}
              >
                Reset
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>

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
          title="Today's Requests"
          users={visitStatsHeaders?.today?.users}
          count={visitStatsHeaders?.today?.count}
          borderColor="border-l-green-500"
          // onClick={() => setTodayRequisitions(true)}
        />
        <CardWithAvatars
          title="Pending Requests"
          users={visitStatsHeaders?.pending?.users}
          count={visitStatsHeaders?.pending?.count}
          borderColor="border-l-cyan-500"
          // onClick={() => setPendingRequisitions(true)}
        />
        <CardWithAvatars
          title="Approved Requests"
          users={visitStatsHeaders?.approved?.users}
          count={visitStatsHeaders?.approved?.count}
          borderColor="border-l-cyan-500"
          // onClick={() => setPendingRequisitions(true)}
        />
        <CardWithAvatars
          title="Total Requests"
          users={visitStatsHeaders?.total?.users}
          count={visitStatsHeaders?.total?.count}
          borderColor="border-l-orange-500"
          // onClick={() => setTotalRequisitions(true)}
        />
      </div>

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

export default ApplyVisitors;
