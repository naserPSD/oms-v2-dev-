"use client";
// 1️⃣ ======================= IMPORTS =======================
import { FormController as Controller } from "@/components/common/FormController";
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
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
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";
import { useEmployeeInvitationFilters } from "./hooks/useEmployeeInvitationFilters";
import { useEmployeeInvitationTableColumn } from "./hooks/useEmployeeInvitationTableColumn";

// 2️⃣ ======================= CONSTANTS / SCHEMA =======================

const initialValues = {
  officeId: null,
  email: "",
  designationId: null,
  shiftId: null,
};

// 3️⃣ ======================= COMPONENT =======================

const HrEmployeeInvitation = () => {
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

  const schema = z
    .object({
      officeId: z.coerce.number().min(1, "Office is required"),
      email: z.string().min(1, "Email is required"),
      designationId: z.coerce.number().min(1, "Designation is required"),
      shiftId: z.coerce.number().optional(), // 👈 যদি থাকে, validation হবে নিচে refine এ
    })
    .refine(
      (data) => {
        const selectedOffice = officeList?.find(
          (o) => o.value === data.officeId,
        );
        if (selectedOffice && selectedOffice.officeShifts?.length > 0) {
          return !!data.shiftId;
        }
        return true;
      },
      {
        message: "Shift is required",
        path: ["shiftId"],
      },
    );
  // ⚡ Form

  const {
    // register,
    // formState: { errors },
    // setValue,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
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
    useHrEmployeeInvitationQuery,
    sendEmployeeInvitationMutation,
    deleteEmployeeMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });
  // Modal handlers

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
  } = useEmployeeInvitationFilters(itemsPerPage);

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
    useHrEmployeeInvitationQuery(queryParams);

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

  console.log(listData);
  // 🧠 Build filter config
  const employeeInvitationStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_invitation_statuses")
      ?.statuses ?? [];
  const employeeStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_statuses")
      ?.statuses ?? [];

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
      name: "employmentStatusId",
      label: "Select Employment Status",
      options: employeeInvitationStatusList || [],
      placeholder: "Filter by Employment Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "employeeStatusId",
      label: "Select Employee Status",
      options: employeeStatusList || [],
      placeholder: "Filter by Employee Status",
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

  // 📝 Create handler
  const submitForm = async (values) => {
    await sendEmployeeInvitationMutation.mutateAsync(values);
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
  const columns = useEmployeeInvitationTableColumn({
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
    sendEmployeeInvitationMutation.isLoading ||
    deleteEmployeeMutation.isLoading;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">
          Employee Invitations List
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
          <ButtonTw
            onClick={() => setShowModal(true)}
            variant="blue"
            className="gap-2"
          >
            <BiPlus /> Send Invitation
          </ButtonTw>
        </div>
      </div>

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={"Send New Employee Invitation"}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-2 gap-x-4 ">
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Input
                  label="Email"
                  placeholder="Enter email here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className=" col-span-2"
                  type="email"
                  {...field}
                />
              )}
            />
            <Controller
              name="officeId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Select Office"
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    reset({ ...watch(), shiftId: null, officeId: val });
                  }}
                  error={fieldState.error?.message}
                  options={officeList || []}
                  placeholder="Select Office Here..."
                />
              )}
            />

            {/* Shift (Conditional) */}
            {officeShiftOptions.length > 0 && (
              <Controller
                name="shiftId"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Select Shift"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    options={officeShiftOptions}
                    placeholder="Select Shift Here..."
                  />
                )}
              />
            )}

            <Controller
              name="designationId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Select Designation"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={designationList || []}
                  placeholder="Select Designation Here..."
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

export default HrEmployeeInvitation;
