import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { zodResolver } from "@/utils/zodResolver";
import React, { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import z from "zod";
import { useAttendanceRulesFilters } from "./useAttendanceRulesFilters";
import DataFilter from "@/components/common/DataFilter";
import helpers from "@/utils/helpers";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/common/Pagination";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAttendanceRulesTableColumn } from "./useAttendanceRulesTableColumn";

import CommonTable from "@/components/common/CommonTable";
import Swal from "sweetalert2";

const initialValues = {
  id: 0,
  officeId: 0, // default officeId
  minLateMinutes: 1, // minimum late minutes
  maxLateMinutes: null, // 🔑 optional
  fineAmount: 0, // fine amount
  fineIntervalDays: 1, // fine applied every 1 day
  isAbsent: false, // boolean
  description: "", // default description
  isActive: true, // boolean
};

const schema = z.object({
  id: z.coerce.number().optional(),
  officeId: z.coerce.number().min(1, "Office is required"),
  minLateMinutes: z.coerce
    .number()
    .int("Minimum late minutes must be an integer")
    .min(1, "Minimum late minutes cannot be negative"),
  maxLateMinutes: z.coerce
    .number()
    .int("Maximum late minutes must be an integer")
    .optional()
    .nullable(),
  fineAmount: z.coerce
    .number()
    .min(0, "Fine amount must be greater than or equal to 1"),
  fineIntervalDays: z.coerce
    .number()
    .int("Fine interval days must be an integer")
    .min(1, "Fine interval days must be at least 1"),
  isAbsent: z.boolean().default(false),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

const AttendanceRules = () => {
  //...useForm Value....

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
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);

  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [showModal, setShowModal] = useState(false);
  const [sorting, setSorting] = useState([]);

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
  } = useAttendanceRulesFilters(itemsPerPage);

  //Query hooks.............
  // API hooks
  const { useOfficeListQuery } = useCommonQueryApi({
    setShowModal,
  });

  // Modal handlers
  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  //add or update mutaition.................

  const {
    addOrUpdateAttendanceRulesMutation,
    useAttendanceRuleQuery,
    deleteAttendanceRulesMutation,
    toggleAttendanceRulseActiveMutation,
    toggleAttendanceRulseAbsentMutation,
  } = useHrQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  // React Query for Get Attendance Rules data fetching with pagination and search
  const { data: responseData, isLoading: isAttendanceLoading } =
    useAttendanceRuleQuery(queryParams);

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data],
  );

  //Others data collect for add edit and search

  const { data: officeList = [] } = useOfficeListQuery();

  // Toggle filter visibility

  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // get Attendance Data .........

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

  const handleEdit = useCallback(
    (item) => {
      reset(item);
      setShowModal(true);
    },
    [reset],
  );

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
          await deleteAttendanceRulesMutation.mutateAsync(id);
        }
      });
    },
    [deleteAttendanceRulesMutation],
  );

  const changeAttendanceActiveStatus = async (id) => {
    await toggleAttendanceRulseActiveMutation.mutateAsync(id);
  };

  const changeAttendanceAbsentStatus = async (id) => {
    await toggleAttendanceRulseAbsentMutation.mutateAsync(id);
  };

  // TanStack Table columns

  const columns = useAttendanceRulesTableColumn({
    handleEdit,
    handleDelete,
    changeAttendanceAbsentStatus,
    changeAttendanceActiveStatus,
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

  const filterConfig = [
    // {
    //   component: "input",
    //   name: "search",
    //   label: "Search",
    //   placeholder: "Search Name, Email, Phone...",
    // },
    {
      component: "select",
      name: "officeId",
      label: "Select Office",
      options: officeList || [],
      placeholder: "Filter by Office",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    // {
    //   component: "select",
    //   name: "isAbsent",
    //   label: "Absent Status",
    //   options: [
    //     { value: "true", label: "Absent" },
    //     { value: "false", label: "Not Absent" },
    //   ],
    //   placeholder: "Filter by Status",
    // },
    // {
    //   component: "select",
    //   name: "isActive",
    //   label: "Active Status",
    //   options: [
    //     { value: "true", label: "Active" },
    //     { value: "false", label: "InActive" },
    //   ],
    //   placeholder: "Filter by Status",
    // },
    {
      component: "clear",
    },
  ];

  // attendance Rules Submit////

  const submitForm = async (values) => {
    await addOrUpdateAttendanceRulesMutation.mutateAsync(values);
  };

  const isLoading = isAttendanceLoading;

  return (
    <div>
      <div className="flex items-center justify-between my-5 flex-wrap gap-2">
        <h1 className="title-color font-bold text-lg">Attendance Rules</h1>
        <div className="flex gap-2 flex-wrap">
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
            onClick={() => setShowModal(true)}
            variant="blue"
            className="gap-2"
            size="sm"
          >
            <BiPlus /> Add Rules
          </ButtonTw>
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

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update Rules" : "Add  Rules"}`}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <Controller
            control={control}
            name="officeId"
            render={({ field, fieldState }) => (
              <div>
                <SelectSearch
                  label="Select Office"
                  placeholder="Select Office"
                  options={officeList}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              </div>
            )}
          />
          <div className="grid grid-cols-2 gap-x-4">
            {/* Office ID */}

            {/* Min Late Minutes */}
            <Controller
              control={control}
              name="minLateMinutes"
              render={({ field, fieldState }) => (
                <Input
                  label="Minimum Late Minutes"
                  placeholder="Enter min late minutes"
                  type="number"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  {...field}
                />
              )}
            />

            {/* Max Late Minutes */}
            <Controller
              control={control}
              name="maxLateMinutes"
              render={({ field, fieldState }) => (
                <Input
                  label="Maximum Late Minutes"
                  placeholder="Enter max late minutes"
                  type="number"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  {...field}
                />
              )}
            />

            {/* Fine Amount */}
            <Controller
              control={control}
              name="fineAmount"
              render={({ field, fieldState }) => (
                <Input
                  label="Fine Amount"
                  placeholder="Enter fine amount"
                  type="number"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  {...field}
                />
              )}
            />

            {/* Fine Interval Days */}
            <Controller
              control={control}
              name="fineIntervalDays"
              render={({ field, fieldState }) => (
                <Input
                  label="Fine Interval (Days)"
                  placeholder="Enter interval in days"
                  type="number"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  {...field}
                />
              )}
            />

            {/* Is Absent */}
            <Controller
              control={control}
              name="isAbsent"
              render={({ field, fieldState }) => (
                <SwitchButton
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Absent"
                  error={fieldState.error?.message}
                  enabledText="Yes"
                  disabledText="No"
                />
              )}
            />

            {/* Is Active */}
            <Controller
              control={control}
              name="isActive"
              render={({ field, fieldState }) => (
                <SwitchButton
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Active"
                  error={fieldState.error?.message}
                  enabledText="Yes"
                  disabledText="No"
                />
              )}
            />

            {/* Description */}
            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <Input
                  label="Description"
                  type="textarea"
                  placeholder="Enter description..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="md:col-span-2 mt-1.5"
                  {...field}
                />
              )}
            />

            {/* Submit / Reset Buttons */}
            <div className="w-full flex justify-center items-center gap-4 col-span-2">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-4"
                disabled={isLoading}
                loading={isLoading}
              >
                Submit
              </ButtonTw>

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold mt-4"
                onClick={() => reset(initialValues)}
              >
                Reset
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>

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

export default AttendanceRules;
