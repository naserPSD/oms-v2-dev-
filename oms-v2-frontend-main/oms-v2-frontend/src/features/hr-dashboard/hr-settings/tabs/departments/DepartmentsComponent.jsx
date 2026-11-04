"use client";
import { FormController as Controller } from "@/components/common/FormController";
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { Skeleton } from "@/components/ui/skeleton";
import SwitchButton from "@/components/ui/SwitchButton";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import { useAuthStore } from "@/store/useAuthStore";
import { useCommonStore } from "@/store/useCommonStore";
import helpers, { toaster } from "@/utils/helpers";
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
import { useTranslation } from "react-i18next";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";

const initialValues = {
  id: "",
  name: "",
  description: "",
  // parentId: "null",
  isActive: true,
};

const schema = z.object({
  id: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int().positive().optional(),
  ),
  name: z.string().trim().min(1, "Department name is required"),
  description: z
    .string()
    .max(255, "Description must be shorter than or equal to 255 characters")
    .optional()
    .or(z.literal("")),
  // parentId: z.coerce.number().optional().default(null),
  isActive: z.boolean().default(true),
});

const DepartmentsComponent = () => {
  const searchParams = useSearchParams();
  const { hasPermission } = useCommonFunctions();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const initialIsActiveStatus = searchParams.get("isActive") || "";
  const initialSearch = searchParams.get("search") || "";
  // Get initial values from URL search params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);
  // Define search filter state
  const [filters, setFilters] = useState({
    search: initialSearch,
    isActive: initialIsActiveStatus,
  });

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (filters.search) params.search = filters.search;

    if (filters.isActive) params.isActive = filters.isActive;
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
      search: "",
      isActive: "",
    });
    setCurrentPage(1);
    setGlobalFilter();

    // Clear URL params as well
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.delete("isActive");
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());
    if (filters.search) params.set("search", filters.search);
    else params.delete("search");

    if (filters.isActive) params.set("isActive", filters.isActive);
    else params.delete("isActive");
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateSearch.cancel();
    };
  }, [debouncedUpdateSearch]);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
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

  const {
    departmentsQuery,
    useParentDepartmentQuery,
    addOrUpdateDepartmentMutation,
    deleteDepartmentMutation,
    toggleDepartmentStatusMutation,
  } = useCompanySettingsQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  // React Query for data fetching
  const {
    data: responseParentList = [],
    isLoading: isFetchingParentDepartment,
  } = useParentDepartmentQuery(queryParams);

  const parentList = useMemo(() => {
    return (
      responseParentList?.data?.map((item) => ({
        value: item.id,
        label: item.name,
      })) || []
    );
  }, [responseParentList]);

  // React Query for data fetching
  const {
    data: responseArray = [],
    isLoading: isFetching,
    status,
    error,
  } = departmentsQuery(queryParams);

  const dataArray = useMemo(() => {
    return responseArray?.data || [];
  }, [responseArray]);

  const listData = useMemo(() => {
    return (dataArray || []).map((item, index) => {
      // const findParent = parentList?.find((p) => p.value === item.parentId);
      // const parent = findParent ? { id: findParent.value, name: findParent.label } : null;
      return {
        ...item,
        parent,
        sl: (currentPage - 1) * itemsPerPage + index + 1,
      };
    });
  }, [dataArray, parentList, currentPage, itemsPerPage]);

  const pagination = listData?.pagination || {
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

  const submitForm = (values) => {
    addOrUpdateDepartmentMutation.mutate({
      ...values,
      ...(values.id === undefined ? {} : { id: values.id }),
    });
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
        await deleteDepartmentMutation.mutateAsync(id);
      }
    });
  };

  const changeServiceActiveStatus = async (id) => {
    await toggleDepartmentStatusMutation.mutateAsync(id);
  };

  //for Filters................................
  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== undefined && value !== null,
    );
  }, [filters]);

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search by Department Name...",
    },
    // {
    //   component: "select",
    //   name: "officeType",
    //   label: "Office Type",
    //   options:
    //     dropdowns.statusGroupList?.find((s) => s.code === "office_types")
    //       ?.statuses ?? [],
    //   placeholder: "Filter by office type",
    // },

    {
      component: "select",
      name: "isActive",
      label: "Active Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "InActive" },
      ],
      placeholder: "Filter by Status",
    },

    {
      component: "clear",
    },
  ];

  const columns = useMemo(
    () => [
      // SL
      {
        accessorKey: "sl",
        header: "SL.",
        size: 60,
      },

      // Name
      {
        accessorKey: "name",
        header: "Name",
        size: 200,
        cell: ({ row }) => (
          <span className="font-medium">{row.original?.name}</span>
        ),
      },

      // Description
      {
        accessorKey: "description",
        header: "Description",
        size: 250,
        cell: ({ row }) => <span>{row.original?.description || "-"}</span>,
      },

      // Parent
      // {
      //   accessorKey: "parent",
      //   header: "Parent",
      //   size: 180,
      //   cell: ({ row }) => <span>{row.original?.parent?.name || "-"}</span>,
      // },

      // Active
      {
        accessorKey: "isActive",
        header: "Active",
        size: 120,
        cell: ({ row }) => {
          const { id, isActive } = row.original;
          return (
            <div className="flex justify-center">
              <SwitchButton
                onClick={() => changeServiceActiveStatus(id)}
                enabled={isActive}
                enabledText="Yes"
                disabledText="No"
                className="!mb-0"
                disabled={!hasPermission("hr.department_edit")}
              />
            </div>
          );
        },
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
              {hasPermission("hr.department_edit") && (
                <button
                  onClick={() => handleEdit(data)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              )}
              {hasPermission("hr.department_delete") && (
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
    [handleDelete, handleEdit, changeServiceActiveStatus],
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
    addOrUpdateDepartmentMutation.isLoading ||
    deleteDepartmentMutation.isLoading ||
    toggleDepartmentStatusMutation.isLoading;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Departments</h1>
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

          {hasPermission("hr.department_add") && (
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

      {/* <div className="table-container">
        <table className="table">
          <thead className="text-xs">
            <tr>
              <th className="">SL.</th>
              <th className="">Name</th>
              <th className="">Description</th>
              <th className="">Parent</th>
              <th className="text-center">Active</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Skeleton className="h-6 w-12 rounded-full mx-auto" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </td>
                </tr>
              ))
            ) : listData.length > 0 ? (
              listData.map((row, i) => (
                <tr key={row.id}>
                  <td>{i + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.description}</td>
                  <td>{row?.parent && row?.parent?.name}</td>
                  <td className="text-center">
                    <SwitchButton
                      onClick={() => changeServiceActiveStatus(row.id)}
                      enabled={row.isActive}
                      enabledText="Yes"
                      disabledText="No"
                      className="!mb-0"
                    />
                  </td>
                  <td className="text-center">
                    <div className="action">
                      <button
                        onClick={() => handleEdit(row)}
                        className="btn-action text-blue-500 hover:text-blue-700"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="btn-action text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div> */}

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={watch("id") ? "Edit Department" : "Add New Department"}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-12 gap-x-4">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  label="Department Name"
                  placeholder="Enter Department Name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <Input
                  type="textarea"
                  label="Description"
                  placeholder="Enter Description"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12"
                  maxLength={255}
                  {...field}
                />
              )}
            />

            {/* <Controller
              control={control}
              name="parentId"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Parent Department"
                  options={parentList}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-9 sm:col-span-12"
                  placeholder="Select parent department"
                  searchable
                />
              )}
            /> */}

            <Controller
              control={control}
              name="isActive"
              render={({ field, fieldState }) => (
                <SwitchButton
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Active"
                  className="col-span-12 lg:col-span-3 sm:col-span-12"
                  error={fieldState.error?.message}
                  enabledText="Yes"
                  disabledText="No"
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

export default DepartmentsComponent;
