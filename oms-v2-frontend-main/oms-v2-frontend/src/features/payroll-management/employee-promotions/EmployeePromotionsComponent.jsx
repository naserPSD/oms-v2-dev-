// src/features/hr-dashboard/hr-notice/HrNotice.jsx
"use client";
// import { z } from "zod";
// import { zodResolver } from "@/utils/zodResolver";
import { debounce } from "lodash";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import "suneditor/dist/css/suneditor.min.css";
import Swal from "sweetalert2";

// Components
import DataFilter from "@/components/common/DataFilter";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";

import { Pencil, Trash2 } from "lucide-react";
import ComponentTanstackTable from "./components/ComponentTanstackTable";

// Hooks & Utilities

import helpers from "@/utils/helpers";
import AddOrUpdateModal from "./components/AddOrUpdateModal";
import PayrollPageInstructionBanner from "../components/PayrollPageInstructionBanner";
import { usePayrollQueryApi } from "@/hooks/queryApi/usePayrollQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

const initialValues = {
  id: 0,
  employeeId: "",
  newDesignationId: "",
  newGradeId: "",
  actionStatusId: "",
  oldBasicSalary: "",
  newBasicSalary: "",
  promotionDate: "",
  effectiveDate: "",
  endDate: "",
  reason: "",
};

// const schema = z
//   .object({
//     id: z.coerce.number().optional(),

//     employeeId: z.preprocess(
//       (val) => (val === "" || val === 0 ? undefined : val),
//       z.number({ required_error: "Employee is required" }),
//     ),

//     newDesignationId: z.preprocess(
//       (val) => (val === "" || val === 0 ? undefined : val),
//       z.number({ required_error: "Designation is required" }),
//     ),

//     actionStatusId: z.preprocess(
//       (val) => (val === "" || val === 0 ? undefined : val),
//       z.number({ required_error: "Promotion Event is required" }),
//     ),

//     newGradeId: z.preprocess(
//       (val) => (val === "" || val === 0 ? undefined : val),
//       z.number({ required_error: "Salary grade is required" }),
//     ),

//     oldBasicSalary: z.preprocess(
//       (val) => (val === "" ? undefined : Number(val)),
//       z
//         .number({ required_error: "Old basic salary is required" })
//         .refine((v) => !isNaN(v), { message: "Invalid salary" })
//         .refine((v) => v >= 0, { message: "Salary cannot be negative" }),
//     ),

//     newBasicSalary: z.preprocess(
//       (val) => (val === "" ? undefined : Number(val)),
//       z
//         .number({ required_error: "New basic salary is required" })
//         .refine((v) => !isNaN(v), { message: "Invalid salary" })
//         .refine((v) => v >= 0, { message: "Salary cannot be negative" })
//   ),

//     promotionDate: z.string().min(1, "Promotion date is required"),

//     effectiveDate: z.string().min(1, "Effective date is required"),

//     reason: z.string().min(1, "Reason is required"),
//   })
//   .refine(
//     (data) => {
//       if (!data.promotionDate || !data.effectiveDate) return true;

//       return (
//         new Date(data.effectiveDate).getTime() >=
//         new Date(data.promotionDate).getTime()
//       );
//     },
//     {
//       message: "Effective date must be the same or after the Promotion date",
//       path: ["effectiveDate"],
//     },
//   );

const EmployeePromotionsComponent = () => {
  // const { t } = useTranslation();
  const { hasPermission } = useCommonFunctions();
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const promotionEvents =
    dropdowns.statusGroupList?.find((s) => s.code === "employee_events")
      ?.statuses ?? [];

  // const payItemTCategoryList =
  //   dropdowns.statusGroupList?.find((s) => s.code === "pay_item_categories")
  //     ?.statuses ?? [];

  const searchParams = useSearchParams();

  // Get initial values from URL search params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );

  // Define search filter state
  const [filters, setFilters] = useState({
    search: initialSearch,
    newGradeId: searchParams.get("newGradeId") || "",
    employeeId: searchParams.get("employeeId") || "",
    actionStatusId: searchParams.get("actionStatusId") || "",
    newDesignationId: searchParams.get("newDesignationId") || "",
    effectiveDate: searchParams.get("effectiveDate") || "",
    promotionDate: searchParams.get("promotionDate") || "",
  });
  //const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);

  const {
    // register,
    // formState: { errors },
    setValue,
    handleSubmit,
    setError,
    control,
    reset,
    watch,
  } = useForm({
    //resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const { useDesignationListQuery } = useCommonQueryApi({ reset });
  const { useAppEmployeeUsersQuery } = useHrQueryApi();
  const { data: employeeList } = useAppEmployeeUsersQuery();
  const { data: designationList = [] } = useDesignationListQuery();
  // Edit handler for modal
  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  const handleEdit = useCallback(
    (item) => {
      reset(item);
      setShowModal(true);
    },
    [reset],
  );

  // Fetch notes with pagination and filters
  const {
    useActiveSalaryGradeQuery,
    // useActivePayItemQuery,
    useEmployeeSalarytListQuery,
    useEmployeePromotionsQuery,
    addOrUpdateEmployeePromotionsMutation,
    deletePromotionMutation,
  } = usePayrollQueryApi({ reset, setError, handleClose, setShowModal });

  const employeeId = watch("employeeId");

  const { data: employeeSalaryData, isLoading: isEmployeeAssetListLoading } =
    useEmployeeSalarytListQuery(employeeId, {
      enabled: !!employeeId,
    });

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== undefined && value !== null,
    );
  }, [filters]);

  // Toggle filter bar visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (filters.search) params.search = filters.search;
    if (filters.newGradeId) params.newGradeId = filters.newGradeId;
    if (filters.actionStatusId) params.actionStatusId = filters.actionStatusId;
    if (filters.newDesignationId)
      params.newDesignationId = filters.newDesignationId;
    if (filters.effectiveDate) params.effectiveDate = filters.effectiveDate;
    if (filters.promotionDate) params.promotionDate = filters.promotionDate;
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
        //setGlobalFilter(value);
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
      search: "",
      newGradeId: "",
      actionStatusId: "",
      newDesignationId: "",
      effectiveDate: "",
      promotionDate: "",
    });
    setCurrentPage(1);
    // setGlobalFilter();

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
    if (filters.search) params.set("search", filters.search);
    if (filters.newGradeId) params.set("newGradeId", filters.newGradeId);
    if (filters.actionStatusId)
      params.set("actionStatusId", filters.actionStatusId);
    if (filters.newDesignationId)
      params.set("newDesignationId", filters.newDesignationId);
    if (filters.effectiveDate)
      params.set("effectiveDate", filters.effectiveDate);
    if (filters.promotionDate)
      params.set("promotionDate", filters.promotionDate);

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateSearch.cancel();
    };
  }, [debouncedUpdateSearch]);

  // // React Query for data fetching with pagination and search
  const { data: activeSalaryGradeData } = useActiveSalaryGradeQuery();

  const activeSalaryGradeList = useMemo(
    () => activeSalaryGradeData?.data || [],
    [activeSalaryGradeData?.data],
  );

  dropdowns.activeSalaryGradeList = activeSalaryGradeList;

  // // React Query for data fetching with pagination and search
  // const { data: activePayItemData } = useActivePayItemQuery();

  // const activePayItemList = useMemo(
  //   () => activePayItemData?.data || [],
  //   [activePayItemData?.data],
  // );

  // dropdowns.activePayItemList = activePayItemList;

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useEmployeePromotionsQuery(queryParams);

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

  //console.log("promotion employeeSalaryData Data :", employeeSalaryData);
  //console.log("promotion dataArray :", dataArray);

  const listData = useMemo(() => {
    return dataArray.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  // const submitForm = async (values) => {
  //   console.log("values", values);
  //   //await addOrUpdateEmployeePromotionsMutation.mutateAsync(values);
  // };

  const submitForm = async (values) => {
    const payload = {
      employeeId: Number(values.employeeId),
      actionStatusId: Number(values.actionStatusId),
      promotionDate: values.promotionDate,
      effectiveDate: values.effectiveDate,
      endDate: values.endDate || null,
      reason: values.reason || null,
    };

    if (values.newDesignationId) {
      payload.newDesignationId = Number(values.newDesignationId);
    }
    if (values.oldDesignationId) {
      payload.oldDesignationId = Number(values.oldDesignationId);
    }
    if (values.newGradeId) {
      payload.newGradeId = Number(values.newGradeId);
    }
    if (values.oldGradeId) {
      payload.oldGradeId = Number(values.oldGradeId);
    }
    if (values.newBasicSalary !== undefined && values.newBasicSalary !== null && values.newBasicSalary !== "") {
      payload.newBasicSalary = Number(values.newBasicSalary);
    }
    if (values.oldBasicSalary !== undefined && values.oldBasicSalary !== null && values.oldBasicSalary !== "") {
      payload.oldBasicSalary = Number(values.oldBasicSalary);
    }

    await addOrUpdateEmployeePromotionsMutation.mutateAsync(payload);
  };

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
          await deletePromotionMutation.mutateAsync(id);
        }
      });
    },
    [deletePromotionMutation],
  );

  // TanStack Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL.",
        size: 50,
      },
      {
        accessorKey: "employee",
        header: "Employee Details",
        enableGlobalFilter: true,
        filterFn: "includesString",
        cell: ({ row }) => {
          const employee = row?.original?.employee;
          const userProfile = row?.original?.employee?.user?.profile;
          // const designation = row?.original?.designation;
          return (
            <Link
              href={`/hr-dashboard/employee/${row.original.employeeId}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Avatar
                image={userProfile?.profilePicture?.fileUrl || ""}
                text={helpers.avatarText(employee?.user?.fullName)}
                value={employee?.user?.fullName || ""}
                alt={employee?.user?.fullName || "Employee"}
                color="info"
                size="md"
              />

              <div className="ml-1">
                <p className="font-semibold dark-title-color">
                  {employee?.user?.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  {employee?.employeeCode}
                </p>
                {/* <SimpleTooltip text={"Designation"}>
                  {designation?.name && (
                    <span className="badge badge-rounded badge-outline-secondary">
                      {designation?.name}
                    </span>
                  )}
                </SimpleTooltip> */}
                <p className="text-xs text-gray-500">{employee?.user?.email}</p>
                <p className="text-xs text-gray-500">
                  {userProfile?.phoneWithCallingCode}
                </p>
              </div>
            </Link>
          );
        },
        size: 280,
      },
      {
        accessorKey: "designation",
        header: "Designation",
        cell: ({ row }) => {
          const oldDesignation = row.original?.oldDesignation;
          const newDesignation = row.original?.newDesignation;

          return (
            <div className="flex flex-col items-start gap-1">
              {/* New Designation */}
              {newDesignation?.name && (
                <SimpleTooltip text="New Designation">
                  <span className="text-[16px] font-bold dark-title-color">
                    {newDesignation.name} (New)
                  </span>
                </SimpleTooltip>
              )}

              {/* Centered Big Down Arrow */}
              {/* {oldDesignation?.name && newDesignation?.name && (
                <div className="flex justify-center my-1">
                  <span className="text-gray-400 text-2xl">↓</span>
                </div>
              )} */}

              {/* Old Designation */}
              {oldDesignation?.name && (
                <SimpleTooltip text="Old Designation">
                  <span className="">{oldDesignation.name} (Old)</span>
                </SimpleTooltip>
              )}
            </div>
          );
        },
        size: 200,
      },

      {
        accessorKey: "basicSalary",
        header: "Basic Salary",
        cell: ({ row }) => {
          const oldBasicSalary = row.original?.oldBasicSalary;
          const newBasicSalary = row.original?.newBasicSalary;

          return (
            <div className="flex flex-col items-start gap-1">
              {/* Old Basic Salary */}

              {/* New Basic Salary */}
              {newBasicSalary && (
                <SimpleTooltip text="New Basic Salary">
                  <span className="text-[16px] font-bold dark-title-color">
                    {newBasicSalary} (New)
                  </span>
                </SimpleTooltip>
              )}

              {/* Centered Down Arrow */}
              {/* {oldBasicSalary && newBasicSalary && (
                <div className="flex justify-center  my-1">
                  <span className="text-gray-400 text-2xl">↓</span>
                </div>
              )} */}
              {oldBasicSalary && (
                <SimpleTooltip text="Old Basic Salary">
                  <span className="">{oldBasicSalary} (Old)</span>
                </SimpleTooltip>
              )}
            </div>
          );
        },
      },

      {
        accessorKey: "grade",
        header: "Grade",
        cell: ({ row }) => {
          const oldGrade = row.original?.oldGrade;
          const newGrade = row.original?.newGrade;

          return (
            <div className="flex flex-col items-start gap-1">
              {/* New Grade */}
              {newGrade?.gradeName && (
                <SimpleTooltip text="New Grade">
                  <span className="text-[16px] font-bold dark-title-color">
                    {newGrade.gradeName} (New)
                  </span>
                </SimpleTooltip>
              )}

              {/* Centered Down Arrow */}
              {/* {oldGrade?.gradeName && newGrade?.gradeName && (
                <div className="flex justify-center my-1">
                  <span className="text-gray-400 text-2xl">↓</span>
                </div>
              )} */}

              {/* Old Grade */}
              {oldGrade?.gradeName && (
                <SimpleTooltip text="Old Grade">
                  <span className="">{oldGrade.gradeName} (Old)</span>
                </SimpleTooltip>
              )}
            </div>
          );
        },
        size: 150,
      },

      {
        accessorKey: "eventAndDate",
        header: "Promotion",
        cell: ({ row }) => {
          const actionStatus = row.original?.actionStatus;
          const promotionDate = row.original?.promotionDate;

          return (
            <div className="flex flex-col items-start gap-1">
              {/* Event Name */}
              {actionStatus?.name && (
                <span
                  className={`badge badge-pill badge-outline-${actionStatus?.colorName || "secondary"}`}
                >
                  {actionStatus.name}
                </span>
              )}

              {/* Promotion Date */}
              {promotionDate && (
                <span className="text-gray-600 text-sm mt-2">
                  {helpers.dDate(promotionDate)}
                </span>
              )}
            </div>
          );
        },
        size: 180,
      },

      {
        accessorKey: "effectiveDate",
        header: "Effective Date",
        cell: ({ row }) => {
          const effectiveDate = row.original?.effectiveDate;
          return (
            <div className="flex items-center gap-2">
              <div>
                {effectiveDate && (
                  <span className=""> {helpers.dDate(effectiveDate)}</span>
                )}
              </div>
            </div>
          );
        },
      },

      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => {
          const reason = row.original?.reason;
          return (
            <div className="flex items-center gap-2">
              <div>{reason}</div>
            </div>
          );
        },
      },

      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="action">
              {/* <button
                onClick={() => handleEdit(rowData)}
                className="btn-action text-blue-500 hover:text-blue-700"
              >
                <Pencil size={16} />
              </button> */}

              {hasPermission(
                "payroll_management.employee_promotions_delete",
              ) && (
                <button
                  onClick={() => handleDelete(rowData.id)}
                  className="btn-action text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 80,
      },
    ],
    [handleDelete],
  );

  // Create TanStack Table instance
  const table = useReactTable({
    data: listData,
    columns,
    state: {
      sorting,
      //globalFilter,
    },
    onSortingChange: setSorting,
    //onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeDirection: "rtl",
  });

  const isLoading =
    isFetching ||
    addOrUpdateEmployeePromotionsMutation.isLoading ||
    deletePromotionMutation.isLoading ||
    isEmployeeAssetListLoading;

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search By Employee Name",
    },

    {
      component: "select",
      name: "actionStatusId",
      label: "Select Event Name",
      options: promotionEvents,
      placeholder: "Filter by Event Name",
    },

    {
      component: "select",
      name: "newDesignationId",
      label: "Select New Designation Name",
      options: designationList,
      placeholder: "Filter by New Designation Name",
    },
    {
      component: "select",
      name: "newGradeId",
      label: "Select New Salary Grade",
      options: dropdowns.activeSalaryGradeList,
      placeholder: "Filter by New Salary Grade",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "datePicker",
      name: "promotionDate",
      label: "Promotion Date",
      placeholder: "Filter by Promotion Date",
    },
    {
      component: "datePicker",
      name: "effectiveDate",
      label: "Effective Date",
      placeholder: "Filter by Effective Date",
    },
    {
      component: "clear",
    },
  ];

  return (
    <div>
      {/* Step & Dependency Instruction Banner */}
      <PayrollPageInstructionBanner
        stepNumber={6}
        stepTitle="Employee Movement, Promotion & Compensation Lifecycle"
        description="Record and track promotions, demotions, salary increments, decrements, and role changes. Every approved record updates employee designations and creates an active salary structure while archiving previous compensation structures."
        prerequisites={[
          {
            label: "Employees",
            href: "/hr-dashboard/employees",
            count: employeeList?.length ?? 0,
            isRequired: true,
            isMissing: (employeeList?.length ?? 0) === 0,
            helperText: "Active employees who can undergo career movements.",
          },
          {
            label: "Designations",
            href: "/hr-dashboard/designations",
            count: designationList?.length ?? 0,
            isRequired: true,
            isMissing: (designationList?.length ?? 0) === 0,
            helperText: "Designations available for promotions and demotions.",
          },
          {
            label: "Salary Grades",
            href: "/payroll-management/salary-grades?page=1&limit=10",
            count: activeSalaryGradeList?.length ?? 0,
            isRequired: true,
            isMissing: (activeSalaryGradeList?.length ?? 0) === 0,
            helperText: "Configured salary ranges to validate new basic salaries.",
          },
          {
            label: "Salary Structures",
            href: "/payroll-management/salary-structures?page=1&limit=10",
            count: 1,
            isRequired: true,
            isMissing: false,
            helperText: "Base salary structures that will be cloned and recalculated.",
          },
        ]}
        prevStep={{
          label: "Payroll Runs",
          href: "/payroll-management/payroll-runs?page=1&limit=10",
        }}
        storageKey="employee_promotions"
      />

      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-lg">
            Employee Movements & Promotions
          </h1>
          <p className="text-xs text-gray-500">
            Promotions, Demotions, Increments, Decrements, and Role Transitions
          </p>
        </div>
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

          {hasPermission("payroll_management.employee_promotions_add") && (
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

      {/* Filter Bar */}
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      <ComponentTanstackTable
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

      <AddOrUpdateModal
        showModal={showModal}
        handleClose={handleClose}
        isLoading={isLoading}
        reset={reset}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        control={control}
        watch={watch}
        setValue={setValue}
        dropdowns={dropdowns}
        promotionEvents={promotionEvents}
        employeeList={employeeList}
        initialValues={initialValues}
        basicSalary={employeeSalaryData?.data}
        designationList={designationList}
      />
    </div>
  );
};

export default EmployeePromotionsComponent;
