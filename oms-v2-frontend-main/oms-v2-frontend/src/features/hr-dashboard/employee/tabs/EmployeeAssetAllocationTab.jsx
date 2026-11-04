import DataFilter from "@/components/common/DataFilter";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import CustomPagination from "@/shared/pagination/CustomPagination";
import { employeeListData } from "@/utils/employeeListData";
import helpers from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { debounce } from "lodash";
import { Pencil, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import Swal from "sweetalert2";
import { z } from "zod";
import EmployeeListTable from "./components/EmployeeListTable";
import Pagination from "@/components/common/Pagination";
import Avatar from "@/components/ui/Avatar";
import { useCommonStore } from "@/store/useCommonStore";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import AddOrUpdateAssetAllocationModal from "./modals/AddOrUpdateAssetAllocationModal";
import AddOrUpdateAssetTypeModal from "./modals/AddOrUpdateAssetTypeModal";
import Link from "next/link";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

const initialValues = {
  id: 0,
  employeeId: null,
  assetTypeId: null,
  assetStatusId: 143,
  description: "",
  model: "",
  serial: "",
  amount: null,
  allocationDate: new Date().toISOString(),
  // withdrawalDate: null,
  remarks: "",
  refundable: false,
};

const schema = z.object({
  id: z.coerce.number().optional(),
  employeeId: z.coerce.number().min(1, "Employee is required"),
  assetTypeId: z.coerce.number().min(1, "Asset Type is required"),
  assetStatusId: z.coerce.number().min(1, "Asset Status is required"),
  description: z.string().min(1, "Description is required"),
  model: z.string().optional(),
  serial: z.string().optional(),
  amount: z.coerce.number().optional(),
  allocationDate: z.string().optional().default(new Date().toISOString()),
  // withdrawalDate: z.string().optional(),
  remarks: z.string().optional(),
  refundable: z.boolean().optional(),
});

const EmployeeAssetAllocationTab = () => {
  // const { t } = useTranslation();
  const { hasPermission } = useCommonFunctions();
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const searchParams = useSearchParams();
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showAssetTypeModal, setShowAssetTypeModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );

  // Define search filter state
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    officeId: searchParams.get("officeId") || "",
    designationId: searchParams.get("designationId") || "",
    departmentId: searchParams.get("departmentId") || "",
    assetTypeId: searchParams.get("assetTypeId") || "",
    assetStatusId: searchParams.get("assetStatusId") || "",
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);

  const {
    // register,
    // formState: { errors },
    setValue,
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

  // Modal handlers
  const handleCloseTypeModal = useCallback(() => {
    setShowAssetTypeModal(false);
  }, []);

  // API hooks
  const {
    useAssetAllocationQuery,
    useAssetTypeQuery,
    useGlobalAssetTypeQuery,
    useAppEmployeeUsersQuery,
    deleteAssetAllocationMutation,
    addOrUpdateAssetAllocationMutation,
    toggleAssetAllocationStatusMutation,
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

  // Filter designations by department if department is selected
  const populatedDesignationList = useMemo(() => {
    if (filters.departmentId) {
      return designationList.filter(
        (item) =>
          String(item.departmentId) === String(filters.departmentId) ||
          String(item.department_id) === String(filters.departmentId),
      );
    }
    return designationList;
  }, [filters.departmentId, designationList]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== undefined && value !== null,
    );
  }, [filters]);

  // Toggle filter visibility
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
      sort: "id:DESC",
    };

    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.officeId) params.officeId = filters.officeId;
    if (filters.designationId) params.designationId = filters.designationId;
    if (filters.departmentId) params.departmentId = filters.departmentId;
    if (filters.assetTypeId) params.assetTypeId = filters.assetTypeId;
    if (filters.assetStatusId) params.assetStatusId = filters.assetStatusId;

    return params;
  }, [currentPage, itemsPerPage, filters]);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useAssetAllocationQuery(queryParams);

  const { data: assetTypeList } = useAssetTypeQuery();
  const { data: globalAssetTypes } = useGlobalAssetTypeQuery();
  const { data: appEmployeeUsers } = useAppEmployeeUsersQuery();
  dropdowns.assetTypeList = assetTypeList;
  dropdowns.globalAssetTypes = globalAssetTypes;
  dropdowns.appEmployeeUsers = appEmployeeUsers;

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
    return dataArray && dataArray.length > 0
      ? dataArray.map((item, index) => ({
          ...item,
          sl: (currentPage - 1) * itemsPerPage + index + 1,
        }))
      : [];
  }, [dataArray, currentPage, itemsPerPage]);

  const submitForm = async (values) => {
    const employee = appEmployeeUsers?.find(
      (user) => user.value === values.employeeId,
    );
    values.employeeId = employee?.employeeId ? employee.employeeId : values.employeeId;
    
    // Create a copy of values to avoid mutating the form state directly
    const payload = { ...values };
    if (!payload.id) {
      delete payload.id;
    }

    payload.isRefundable = Boolean(values.refundable);
    delete payload.refundable;
    
    try {
      await addOrUpdateAssetAllocationMutation.mutateAsync(payload);
      if (!values.id) {
        clearAllFilters();
      }
    } catch (err) {
      // Handled by RestApi toast
    }
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
          try {
            await deleteAssetAllocationMutation.mutateAsync(id);
          } catch (err) {
            // Handled by RestApi toast
          }
        }
      });
    },
    [deleteAssetAllocationMutation],
  );

  // const handleArchive = useCallback(
  //   async (id) => {
  //     await toggleArchivePersonalNoteMutation.mutateAsync(id);
  //   },
  //   [toggleArchivePersonalNoteMutation]
  // );

  const handleEdit = useCallback(
    (item) => {
      reset({
        ...item,
        refundable: Boolean(item?.isRefundable ?? item?.refundable),
      });
      setShowModal(true);
    },
    [reset],
  );

  // Debounced updater for search filter only
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    [],
  );

  // Handle filter changes
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

  const params = new URLSearchParams(window.location.search);

  const clearAllFilters = useCallback(() => {
    debouncedUpdateSearch.cancel();
    setFilters({
      search: "",
      status: "",
      officeId: "",
      designationId: "",
      departmentId: "",
      assetTypeId: "",
      assetStatusId: "",
    });
    setCurrentPage(1);
    setGlobalFilter("");

    // Clear URL params as well
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "employee-asset-allocation");
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.delete("officeId");
    params.delete("designationId");
    params.delete("departmentId");
    params.delete("assetTypeId");
    params.delete("assetStatusId");
    params.delete("status");
    params.delete("employeeStatusId");
    params.delete("employmentStatusId");
    // Preserve tab param for this tab
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [debouncedUpdateSearch, itemsPerPage]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "employee-asset-allocation");
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    if (filters.search) params.set("search", filters.search);
    else params.delete("search");

    if (filters.officeId) params.set("officeId", filters.officeId);
    else params.delete("officeId");

    if (filters.designationId) params.set("designationId", filters.designationId);
    else params.delete("designationId");

    if (filters.departmentId) params.set("departmentId", filters.departmentId);
    else params.delete("departmentId");

    if (filters.assetTypeId) params.set("assetTypeId", filters.assetTypeId);
    else params.delete("assetTypeId");

    if (filters.assetStatusId) params.set("assetStatusId", filters.assetStatusId);
    else params.delete("assetStatusId");

    if (filters.status) params.set("status", filters.status);
    else params.delete("status");

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateSearch.cancel();
    };
  }, [debouncedUpdateSearch]);

  // TanStack Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
      },
      {
        accessorKey: "userProfile",
        header: "Employee Details",
        accessorFn: (row) => {
          const user = row?.employee?.user;
          return (
            user?.fullName ||
            `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
            ""
          );
        },
        enableGlobalFilter: true,
        filterFn: "includesString",
        cell: ({ row }) => {
          const employee = row?.original?.employee;
          const user = employee?.user;
          const userProfile = employee?.user?.profile;
          const designation = employee?.designation;
          const fullName =
            user?.fullName ||
            `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
            "Unknown Employee";
          return (
            <Link
              href={`/hr-dashboard/employee/${row.original?.employee?.id || row.original?.employeeId || ""}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Avatar
                image={userProfile?.profilePicture?.fileUrl || ""}
                text={helpers.avatarText(fullName)}
                value={fullName}
                alt={fullName}
                color="info"
                size="md"
              />

              <div>
                <p className="font-semibold dark-title-color">
                  {fullName}
                </p>
                <SimpleTooltip text={"Designation"}>
                  {designation?.name && (
                    <span className="badge badge-rounded badge-outline-secondary">
                      {designation?.name}
                    </span>
                  )}
                </SimpleTooltip>
                <p className="text-xs text-gray-500">{user?.email || "-"}</p>
                <p className="text-xs text-gray-500">
                  {userProfile?.phoneWithCallingCode || userProfile?.phone || "-"}
                </p>
              </div>
            </Link>
          );
        },
        size: 250,
      },
      {
        accessorKey: "allocationDate",
        header: "Allocate Date",
        cell: ({ row }) => (
          <>
            <p className="text-xs ">
              {" "}
              {row.original.allocationDate
                ? helpers.dDate(row.original.allocationDate)
                : "-"}
            </p>
          </>
        ),
        size: 100,
      },
      {
        accessorKey: "assetTypeId",
        header: "Asset Type",
        cell: ({ row }) => {
          const assetType = row.original?.assetType;
          return (
            <div className="flex items-center gap-2">
              <span className="text-xs">{assetType?.name}</span>
            </div>
          );
        },
        size: 100,
      },
      {
        accessorKey: "assetStatusId",
        header: "Asset Status",
        cell: ({ row }) => {
          const assetStatus = row.original?.assetStatus;
          return (
            <div className="text-center">
              <span
                className={`badge badge-pill badge-outline-${assetStatus?.colorName || "secondary"}`}
              >
                {assetStatus?.name}
              </span>
            </div>
          );
        },
        size: 100,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const office = row.original?.office;
          const officeShift = row.original?.officeShift;
          const department = row.original?.designation?.department;
          return (
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-gray-500">
                  {row.original?.description}
                </p>
                <p>
                  <strong className="dark-title-color">Model:</strong>{" "}
                  {row.original?.model}
                </p>
                <p>
                  <strong className="dark-title-color">SL:</strong>{" "}
                  {row.original?.serial}
                </p>
              </div>
            </div>
          );
        },
        size: 180,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-end gap-[4px]">
              <span>
                {row.original?.amountWithCurrency ||
                  (row.original?.amount ? `${row.original.amount} BDT` : "-")}
              </span>
            </div>
          );
        },
        size: 70,
      },
      {
        accessorKey: "refundable",
        header: "Refundable",
        cell: ({ row }) => {
          const isRefundable = Boolean(
            row.original?.isRefundable ?? row.original?.refundable,
          );
          return (
            <div className="text-center">
              <span
                className={`badge badge-pill ${
                  isRefundable
                    ? "badge-outline-success"
                    : "badge-outline-secondary"
                }`}
              >
                {isRefundable ? "Yes" : "No"}
              </span>
            </div>
          );
        },
        size: 90,
      },
      {
        accessorKey: "actions",
        header: "Action",
        enableSorting: false,
        size: 80,
        cell: ({ row }) => {
          const employee = row.original;
          return (
            <div className="action flex gap-2">
              {hasPermission("hr.employee_asset_allocations_edit") && (
                <button
                  onClick={() => handleEdit(employee)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                >
                  <i className="fa-regular fa-pen-to-square"></i>
                </button>
              )}
              {hasPermission("hr.employee_asset_allocations_delete") && (
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="btn-action text-red-500 hover:text-red-700"
                >
                  <i className="fa-regular fa-trash-can"></i>
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete],
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
    addOrUpdateAssetAllocationMutation.isLoading ||
    deleteAssetAllocationMutation.isLoading ||
    toggleAssetAllocationStatusMutation.isLoading;

  const employeeInvitationStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_invitation_statuses")
      ?.statuses ?? [];
  const employeeStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_statuses")
      ?.statuses ?? [];
  const assetStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "asset_statuses")
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
      name: "assetTypeId",
      label: "Select Asset Type",
      options: dropdowns.assetTypeList || [],
      placeholder: "Filter by Asset Type",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "assetStatusId",
      label: "Select Asset Status",
      options: assetStatusList || [],
      placeholder: "Filter by Asset Status",
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

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">
          Employee Asset Allocations
        </h1>
        <div className="flex flex-wrap gap-2">
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
          {hasPermission("master.category.manage") && (
            <ButtonTw
              onClick={() => setShowAssetTypeModal(true)}
              variant="gray"
              className="gap-2"
            >
              <BiPlus /> Asset Type
            </ButtonTw>
          )}

          {hasPermission("hr.employee_asset_allocations_add") && (
            <ButtonTw
              onClick={() => setShowModal(true)}
              variant="blue"
              className="gap-2"
            >
              <BiPlus /> Allocate New
            </ButtonTw>
          )}

          <ButtonTw variant="alternative">🖨️ {/* Print Icon here */}</ButtonTw>
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

      <AddOrUpdateAssetAllocationModal
        showModal={showModal}
        handleClose={handleClose}
        isLoading={isLoading}
        reset={reset}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        control={control}
        watch={watch}
        dropdowns={dropdowns}
      />

      <AddOrUpdateAssetTypeModal
        modalShow={showAssetTypeModal}
        handleCloseTypeModal={handleCloseTypeModal}
      />
    </div>
  );
};

export default EmployeeAssetAllocationTab;
