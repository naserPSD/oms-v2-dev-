"use client";
import { FormController as Controller } from "@/components/common/FormController";
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import Avatar from "@/components/ui/Avatar";
import ButtonTw from "@/components/ui/ButtonTw";
import DatePicker from "@/components/ui/DatePicker";
import SelectSearch from "@/components/ui/SelectSearch";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";

import helpers from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format, isBefore, parseISO } from "date-fns";
import { debounce } from "lodash";
import {
  AlertCircle,
  ArrowRight,
  Pencil,
  RefreshCw,
  Trash2,
  UserIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import z from "zod";

const initialValues = {
  id: "",
  empId: "",
  supervisorId: "",
  startDate: "",
  endDate: "",
};

const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const schema = z
  .object({
    id: z.coerce.number(),
    empId: z.coerce.number().min(1, "Employee is required"),
    supervisorId: z.coerce.number().min(1, "Supervisor is required"),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((val) => {
        const today = getTodayDate();
        const selectedDate = parseISO(val);
        return !isBefore(selectedDate, today);
      }, "Start date cannot be in the past"),

    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    },
  );

const EmployeeHierarchyComponents = () => {
  const { hasPermission } = useCommonFunctions();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const initialSearch = searchParams.get("search") || "";
  // Get initial values from URL search params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);
  const initialStartDate = searchParams.get("startDate") || "";
  const initialEndDate = searchParams.get("endDate") || "";
  // Define search filter state
  const [filters, setFilters] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
  });

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.empId) params.empId = filters.empId;
    if (filters.supervisorId) params.supervisorId = filters.supervisorId;
    return params;
  }, [currentPage, itemsPerPage, filters]);

  // Debounced updater for search filter only
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    [],
  );

  const handleFilterChange = useCallback(
    (filterName, value) => {
      if (filterName === "search") {
        setGlobalFilter(value);
        debouncedUpdateSearch(value);
      } else {
        // For other filters, update immediately
        setFilters((prev) => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
      }
    },
    [debouncedUpdateSearch],
  );

  const clearAllFilters = () => {
    debouncedUpdateSearch.cancel();
    setFilters({
      startDate: "",
      endDate: "",
      empId: "",
      supervisorId: "",
    });
    setCurrentPage(1);
    setGlobalFilter();

    // Clear URL params as well
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.empId) params.set("empId", filters.empId);
    if (filters.supervisorId) params.set("supervisorId", filters.supervisorId);

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateSearch.cancel();
    };
  }, [debouncedUpdateSearch]);

  const { handleSubmit, setError, control, reset, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = () => {
    reset(initialValues);
    setShowModal(false);
  };

  const handleEdit = (item) => {
    reset(item);
    setShowModal(true);
  };

  //api calls................

  const {
    employeeHierarchyQuery,
    addOrUpdateemployeeHierarchyMutation,
    deleteEmployeeHierarchyFiletMutation,
    useAppEmployeeUsersQuery,
  } = useHrQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  const {
    data: employeeList = [],
    isLoading: isLoadingEmployees,
    refetch: refetchEmployeeList,
  } = useAppEmployeeUsersQuery();

  const [dismissInstruction, setDismissInstruction] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedsupervisorId, setSelectedSupervisorId] = useState(null);

  // Handle employee selection
  useEffect(() => {
    if (watch("empId") && employeeList?.length > 0) {
      const emp = employeeList.find((e) => e.value === watch("empId"));
      setSelectedEmployee(emp);
    } else {
      setSelectedEmployee(null);
    }
  }, [watch("empId"), employeeList]);

  // Handle supervisor selection
  useEffect(() => {
    if (watch("supervisorId") && employeeList?.length > 0) {
      const supervisor = employeeList.find(
        (e) => e.value === watch("supervisorId"),
      );
      setSelectedSupervisorId(supervisor);
    } else {
      setSelectedSupervisorId(null);
    }
  }, [watch("supervisorId"), employeeList]);

  // React Query for data fetching
  const { data: responseArray = [], isLoading: isFetching } =
    employeeHierarchyQuery(queryParams);

  const dataArray = useMemo(() => {
    return responseArray?.data || [];
  }, [responseArray]);

  const listData = useMemo(() => {
    return (dataArray || [])?.map((item, index) => {
      // const findParent = parentList?.find((p) => p.value === item.parentId);
      // const parent = findParent ? { id: findParent.value, name: findParent.label } : null;
      return {
        ...item,
        parent,
        sl: (currentPage - 1) * itemsPerPage + index + 1,
      };
    });
  }, [dataArray, currentPage, itemsPerPage]);

  const pagination = responseArray?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total } = pagination;

  // Toggle filter bar visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== undefined && value !== null,
    );
  }, [filters]);

  const filterConfig = [
    {
      component: "select",
      name: "empId",
      label: "Employee Name",
      options: employeeList,
      placeholder: "Filter by Employee Name",
    },

    {
      component: "select",
      name: "supervisorId",
      label: "Supervisor Name",
      options: employeeList,
      placeholder: "Filter by Supervisor Name",
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

  const submitForm = async (values) => {
    const payload = { ...values };
    if (!payload.endDate) {
      delete payload.endDate;
    }
    await addOrUpdateemployeeHierarchyMutation.mutateAsync(payload);
  };

  const handleDelete = async (id) => {
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
        await deleteEmployeeHierarchyFiletMutation.mutateAsync(id);
      }
    });
  };

  const columns = useMemo(
    () => [
      // SL
      {
        accessorKey: "sl",
        header: "SL.",
        size: 60,
      },

      {
        id: "employeeDetails",
        header: "Employee Details",
        accessorFn: (row) => row.employee?.user?.fullName,
        enableGlobalFilter: true,
        filterFn: "includesString",
        size: 250,
        cell: ({ row }) => {
          const user = row.original?.employee?.user;
          const profile = user?.profile;
          const designation = row.original?.employee?.designation;

          return (
            <Link
              href={`/hr-dashboard/employee/${row.original?.employee?.id}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Avatar
                image={profile?.profilePicture?.fileUrl || ""}
                text={helpers.avatarText(user?.fullName)}
                value={user?.fullName || ""}
                alt={user?.fullName || "Employee"}
                color="info"
                size="md"
              />

              <div>
                <p className="font-semibold dark-title-color">
                  {user?.fullName || "-"}
                </p>

                {designation?.name && (
                  <span className="badge badge-rounded badge-outline-secondary">
                    {designation.name}
                  </span>
                )}

                <p className="text-xs text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-500">{profile?.phone || "-"}</p>
              </div>
            </Link>
          );
        },
      },

      {
        id: "supervisorDetails",
        header: "Supervisor Details",
        accessorFn: (row) => row.supervisor?.user?.fullName,
        enableGlobalFilter: true,
        filterFn: "includesString",
        size: 250,
        cell: ({ row }) => {
          const user = row.original?.supervisor?.user;
          const profile = user?.profile;
          const designation = row.original?.supervisor?.designation;

          return (
            <Link
              href={`/hr-dashboard/employee/${row.original?.supervisor?.id}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Avatar
                image={profile?.profilePicture?.fileUrl || ""}
                text={helpers.avatarText(user?.fullName)}
                value={user?.fullName || ""}
                alt={user?.fullName || "Employee"}
                color="info"
                size="md"
              />

              <div>
                <p className="font-semibold dark-title-color">
                  {user?.fullName || "-"}
                </p>
                {designation?.name && (
                  <span className="badge badge-rounded badge-outline-secondary">
                    {designation.name}
                  </span>
                )}
                <p className="text-xs text-gray-500">{user?.email}</p>

                <p className="text-xs text-gray-500">{profile?.phone || "-"}</p>
              </div>
            </Link>
          );
        },
      },

      // Start Date
      {
        accessorKey: "startDate",
        header: "Start Date",
        size: 150,
        cell: ({ row }) => <span>{row.original?.startDate || "-"}</span>,
      },

      // End Date
      {
        accessorKey: "endDate",
        header: "End Date",
        size: 150,
        cell: ({ row }) => <span>{row.original?.endDate || "-"}</span>,
      },

      // Actions
      {
        id: "actions",
        header: "Actions",
        size: 120,
        enableSorting: false,
        cell: ({ row }) => {
          const data = row.original;
          return (
            <div className="flex justify-center gap-2">
              {hasPermission("hr.employee_hierarchy_edit") && (
                <button
                  onClick={() => handleEdit(data)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              )}
              {hasPermission("hr.employee_hierarchy_delete") && (
                <button
                  onClick={() => handleDelete(data.id)}
                  className="btn-action text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [handleDelete, handleEdit],
  );

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
    addOrUpdateemployeeHierarchyMutation.isLoading ||
    deleteEmployeeHierarchyFiletMutation.isLoading;

  const startDate = watch("startDate");
  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Employee Hierarchy</h1>
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
          {hasPermission("hr.employee_hierarchy_add") && (
            <ButtonTw
              onClick={() => setShowModal(true)}
              variant="blue"
              className="gap-2"
            >
              <BiPlus /> Add New
            </ButtonTw>
          )}
        </div>
      </div>

      {/* Instruction to add employee first if not available */}
      {!isLoadingEmployees && employeeList.length === 0 && !dismissInstruction && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/90 p-4 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    No Employees Available — Please Add Employees First
                  </h3>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Employee hierarchy requires active employees to establish supervisor and reporting relationships. Please create employee profiles first before setting up the hierarchy.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDismissInstruction(true)}
                  className="rounded-md p-1 text-gray-400 hover:bg-white/70 hover:text-gray-600 dark:hover:bg-gray-800"
                  aria-label="Dismiss instruction"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 rounded-lg border border-amber-200/80 bg-white/70 p-3 text-xs dark:border-amber-900/40 dark:bg-gray-900/60">
                <p className="font-semibold text-gray-900 dark:text-gray-200">
                  Steps to set up Employee Hierarchy:
                </p>
                <ol className="mt-1.5 list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  <li>
                    Go to the{" "}
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      Employees
                    </span>{" "}
                    management page.
                  </li>
                  <li>
                    Create employees with their basic details, designation, and department.
                  </li>
                  <li>
                    Return to this page and click{" "}
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      + Add New
                    </span>{" "}
                    to connect employees with their reporting supervisors.
                  </li>
                </ol>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/hr-dashboard/employee?tab=employee-list"
                  onClick={() => refetchEmployeeList?.()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
                >
                  <BiPlus className="h-4 w-4" />
                  <span>Go to Employees</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => refetchEmployeeList?.()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        isFetching={isFetching}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
        currentPage={currentPage}
        total={total}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={
          watch("id") ? "Edit Employee Hierarchy" : "Add Employee Hierarchy"
        }
        size="xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-12 gap-x-4">
            {!isLoadingEmployees && employeeList.length === 0 && (
              <div className="col-span-12 mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs dark:border-amber-900/50 dark:bg-amber-950/30">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5 dark:text-amber-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      No employees available yet
                    </p>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      Please add employees first to set up reporting relationships and hierarchy.
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Link
                        href="/hr-dashboard/employee?tab=employee-list"
                        onClick={() => refetchEmployeeList?.()}
                        className="inline-flex items-center gap-1 rounded bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
                      >
                        <BiPlus className="text-sm" />
                        <span>+ Add Employee</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => refetchEmployeeList?.()}
                        className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Refresh List</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-sky-50 dark:bg-slate-800 border p-4 rounded-lg col-span-12 lg:col-span-12 sm:col-span-12 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Employee Information
                </h3>
                <Link
                  href="/hr-dashboard/employee?tab=employee-list"
                  onClick={() => refetchEmployeeList?.()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  title="Create or view employees"
                >
                  <BiPlus className="text-sm shrink-0" />
                  <span>+ Add Employee</span>
                </Link>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Select Employee{" "}
                    <span className="text-red-500 font-bold leading-none select-none">*</span>
                  </label>
                  <Link
                    href="/hr-dashboard/employee?tab=employee-list"
                    onClick={() => refetchEmployeeList?.()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primaryColor hover:text-white bg-primaryColor/10 hover:bg-primaryColor rounded border border-primaryColor/20 transition-all duration-200 cursor-pointer shadow-xs"
                    title="Add or view employees"
                  >
                    <BiPlus size={12} />
                    <span>Add/View</span>
                  </Link>
                </div>
                <Controller
                  control={control}
                  name="empId"
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label=""
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
                      className="!mb-0"
                      emptyAction={{
                        label: "+ Add Employee",
                        href: "/hr-dashboard/employee?tab=employee-list",
                        onClick: () => refetchEmployeeList?.(),
                      }}
                    />
                  )}
                />
              </div>

              {selectedEmployee && (
                <div className="mt-6 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-start gap-2">
                      {selectedEmployee.avatarUrl ? (
                        <img
                          src={selectedEmployee.avatarUrl}
                          alt={selectedEmployee.label}
                          className="w-14 h-14 rounded-full border-3 border-gray-300 "
                        />
                      ) : (
                        <Avatar
                          text={helpers.avatarText(selectedEmployee.label)}
                          color="info"
                          size="md"
                        />
                      )}

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

            <div className="bg-sky-50 dark:bg-slate-800 border p-4 rounded-lg col-span-12 lg:col-span-12 sm:col-span-12 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Supervisor Information
                </h3>
                <Link
                  href="/hr-dashboard/employee?tab=employee-list"
                  onClick={() => refetchEmployeeList?.()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  title="Create or view employees"
                >
                  <BiPlus className="text-sm shrink-0" />
                  <span>+ Add Employee</span>
                </Link>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Select Supervisor{" "}
                    <span className="text-red-500 font-bold leading-none select-none">*</span>
                  </label>
                  <Link
                    href="/hr-dashboard/employee?tab=employee-list"
                    onClick={() => refetchEmployeeList?.()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primaryColor hover:text-white bg-primaryColor/10 hover:bg-primaryColor rounded border border-primaryColor/20 transition-all duration-200 cursor-pointer shadow-xs"
                    title="Add or view employees"
                  >
                    <BiPlus size={12} />
                    <span>Add/View</span>
                  </Link>
                </div>
                <Controller
                  control={control}
                  name="supervisorId"
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label=""
                      placeholder="Select Supervisor"
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
                      className="!mb-0"
                      emptyAction={{
                        label: "+ Add Employee",
                        href: "/hr-dashboard/employee?tab=employee-list",
                        onClick: () => refetchEmployeeList?.(),
                      }}
                    />
                  )}
                />
              </div>

              {selectedsupervisorId && (
                <div className="mt-6 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-start gap-2">
                      {selectedsupervisorId.avatarUrl ? (
                        <img
                          src={selectedsupervisorId.avatarUrl}
                          alt={selectedsupervisorId.label}
                          className="w-14 h-14 rounded-full border-3 border-gray-300 "
                        />
                      ) : (
                        <Avatar
                          text={helpers.avatarText(selectedsupervisorId.label)}
                          color="info"
                          size="md"
                        />
                      )}

                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Employee Name
                        </p>
                        <p className="font-medium">
                          {selectedsupervisorId
                            ? selectedsupervisorId.label
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Employee Code
                      </p>
                      <p className="font-mono font-medium">
                        {selectedsupervisorId ? selectedsupervisorId.code : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Designation
                      </p>
                      <p className="font-medium">
                        {selectedsupervisorId
                          ? selectedsupervisorId.designation
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Controller
              control={control}
              name="startDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Start Date"
                  options={{
                    dateFormat: "d-m-Y",
                    minDate: getTodayDate(),
                    defaultDate: field.value
                      ? parseISO(field.value)
                      : getTodayDate(),
                  }}
                  value={field.value}
                  onChange={(date) => {
                    field.onChange(
                      date ? format(parseISO(date), "yyyy-MM-dd") : "",
                    );
                  }}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="endDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  label="End Date"
                  options={{
                    dateFormat: "d-m-Y",
                    minDate: startDate ? parseISO(startDate) : getTodayDate(),
                    defaultDate: field.value
                      ? parseISO(field.value)
                      : startDate
                        ? parseISO(startDate)
                        : getTodayDate(),
                  }}
                  value={field.value}
                  onChange={(date) => {
                    field.onChange(
                      date ? format(parseISO(date), "yyyy-MM-dd") : "",
                    );
                  }}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  error={fieldState.error?.message}
                />
              )}
            />

            <div className="col-span-12 flex justify-center items-center gap-4">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-4 col-span-12"
                disabled={isLoading}
                loading={isLoading}
              >
                Submit
              </ButtonTw>

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold mt-4 col-span-12"
                onClick={() => reset()}
              >
                Reset
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default EmployeeHierarchyComponents;
