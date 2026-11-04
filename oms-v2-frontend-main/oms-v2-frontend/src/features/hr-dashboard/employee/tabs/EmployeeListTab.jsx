// 1️⃣ ======================= IMPORTS =======================
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
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
import EmployeeListTable from "./components/EmployeeListTable";
import { employeeListFilterConfig } from "./hooks/employeeListFilterConfig";
import { useEmployeeListFilters } from "./hooks/useEmployeeListFilters";
import { useEmployeeListTableColumn } from "./hooks/useEmployeeListTableColumn";
import EmployeeAddOrUpdateModal from "./components/EmployeeAddOrUpdateModal";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

// 2️⃣ ======================= CONSTANTS / SCHEMA =======================

const initialValues = {
  // -- Employee --
  departmentId: null,
  designationId: null,
  officeId: null,
  officeShiftId: null,
  joiningDate: "",
  resetFirstPassword: false,
  roleId: null,
  remarks: "",

  // -- User --
  firstName: "",
  lastName: "",
  employeeCode: "",
  email: "",
  // password: "",

  // -- User Profile --
  countryId: null,
  phoneCountryId: null,
  phone: "",
  gender: "",
  maritalStatusId: null,
  religionId: null,
};

const schema = z
  .object({
    // -- Employee --
    departmentId: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z.number().optional(),
    ),
    designationId: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z
        .number({
          required_error: "Designation is required",
          invalid_type_error: "Designation is required",
        })
        .min(1, "Designation is required"),
    ),
    officeId: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z
        .number({
          required_error: "Office is required",
          invalid_type_error: "Office is required",
        })
        .min(1, "Office is required"),
    ),
    officeShiftId: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z.number().optional(),
    ),
    joiningDate: z
      .string({ required_error: "Joining Date is required" })
      .trim()
      .min(1, "Joining Date is required"),
    resetFirstPassword: z.boolean().optional(),
    roleId: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z.number().optional(),
    ),
    remarks: z.string().optional(),

    // -- User --
    firstName: z
      .string({ required_error: "First Name is required" })
      .trim()
      .min(1, "First Name is required")
      .max(255, "First Name cannot exceed 255 characters"),
    lastName: z
      .string({ required_error: "Last Name is required" })
      .trim()
      .min(1, "Last Name is required")
      .max(255, "Last Name cannot exceed 255 characters"),
    employeeCode: z
      .string({ required_error: "Employee Code is required" })
      .trim()
      .min(1, "Employee Code is required")
      .max(64, "Employee Code cannot exceed 64 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),

    // -- User Profile --
    countryId: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z.number().optional(),
    ),
    phoneCountryId: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z.number().optional(),
    ),
    phone: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : String(val),
      z.string().optional(),
    ),
    gender: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : String(val),
      z.string().optional(),
    ),
    maritalStatusId: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z.number().optional(),
    ),
    religionId: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z.number().optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.resetFirstPassword && !data.roleId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company role is required when inviting as a user",
        path: ["roleId"],
      });
    }
  });

// 3️⃣ ======================= COMPONENT =======================

const EmployeeListTab = () => {
  // 🧠 ---------- STORES / HOOKS / STATES ----------
  // const { t } = useTranslation();
  const { hasPermission } = useCommonFunctions();
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

  // ⚡ Form
  const {
    // register,
    // formState: { errors },
    setValue,
    getValues,
    reset,
    handleSubmit,
    control,
    watch,
    setError,
    clearErrors,
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

  // 🧠 ---------- API HOOKS ----------
  const {
    useHrEmployeeQuery,
    deleteEmployeeMutation,
    addOrUpdateEmployeeMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  // API hooks
  const {
    useOfficeListQuery,
    useDesignationListQuery,
    useDepartmentListQuery,
  } = useCommonQueryApi({ reset, setError, handleClose, setShowModal });

  const { data: officeList = [] } = useOfficeListQuery();
  const { data: designationList = [] } = useDesignationListQuery();
  const { data: departmentList = [] } = useDepartmentListQuery();

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
  } = useEmployeeListFilters(itemsPerPage);

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
    useHrEmployeeQuery(queryParams);

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
    try {
      await addOrUpdateEmployeeMutation.mutateAsync(values);
      handleClose();
    } catch (err) {
      helpers.handleApiValidationError(
        err,
        setError,
        "Failed to save employee",
        true,
      );
    }
  };

  // 🧠 Build filter config
  const employeeInvitationStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_invitation_statuses")
      ?.statuses ?? [];
  const employeeStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_statuses")
      ?.statuses ?? [];

  const attendanceStatus =
    dropdowns.statusGroupList?.find((s) => s.code === "asset_statuses")
      ?.statuses ?? [];

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

  const filterConfig = useMemo(
    () =>
      employeeListFilterConfig({
        officeList,
        departmentList,
        populatedDesignationList,
        employeeInvitationStatusList,
        employeeStatusList,
        activeInactiveList: dropdowns.activeInactiveList,
      }),
    [
      officeList,
      departmentList,
      populatedDesignationList,
      employeeInvitationStatusList,
      employeeStatusList,
      dropdowns.activeInactiveList,
    ],
  );

  // 📝 Edit handler
  const handleEdit = useCallback(
    (item) => {
      const departmentId =
        item.departmentId ??
        item.designation?.departmentId ??
        null;
      const user = item.user || {};
      const profile = user.profile || item.userProfile || {};
      const userRoles = user.userRoles || [];
      const assignedRoleId =
        item.roleId ??
        (userRoles.length > 0
          ? userRoles[0].roleId || userRoles[0].role?.id
          : null);

      reset({
        ...item,
        departmentId,
        firstName: item.firstName || user.firstName || "",
        lastName: item.lastName || user.lastName || "",
        email: item.email || user.email || "",
        resetFirstPassword: Boolean(
          item.resetFirstPassword ?? user.resetFirstPassword,
        ),
        roleId: assignedRoleId ?? null,
        phoneCountryId: item.phoneCountryId || profile.phoneCountryId || null,
        phone: item.phone || profile.phone || "",
        gender: item.gender || profile.gender || "",
        maritalStatusId:
          item.maritalStatusId || profile.maritalStatusId || null,
        religionId: item.religionId || profile.religionId || null,
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
          await deleteEmployeeMutation.mutateAsync(id);
        }
      });
    },
    [deleteEmployeeMutation],
  );

  // 🧠 ---------- TABLE ----------
  // 🧠 Custom hook for TanStack Table columns
  const columns = useEmployeeListTableColumn({
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

  const isLoading =
    isFetching ||
    // addOrUpdatePersonalNoteMutation.isLoading ||
    deleteEmployeeMutation.isLoading;
  // toggleArchivePersonalNoteMutation.isLoading ||
  // togglePinPersonalNoteMutation.isLoading;
  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Employee List</h1>
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
          {hasPermission("hr.employee_list_add") && (
            <ButtonTw
              onClick={() => {
                const defaultCountry = dropdowns.countryList?.find((c) =>
                  c?.name?.toLowerCase().includes("bangladesh"),
                );
                reset({
                  ...initialValues,
                  countryId: defaultCountry?.id ?? initialValues.countryId,
                  phoneCountryId:
                    defaultCountry?.id ?? initialValues.phoneCountryId,
                });
                setShowModal(true);
              }}
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

      <EmployeeListTable
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

      <EmployeeAddOrUpdateModal
        showModal={showModal}
        handleClose={handleClose}
        isLoading={addOrUpdateEmployeeMutation?.isPending || addOrUpdateEmployeeMutation?.isLoading}
        reset={reset}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        control={control}
        watch={watch}
        getValues={getValues}
        setValue={setValue}
        setError={setError}
        clearErrors={clearErrors}
      />
    </div>
  );
};

export default EmployeeListTab;
