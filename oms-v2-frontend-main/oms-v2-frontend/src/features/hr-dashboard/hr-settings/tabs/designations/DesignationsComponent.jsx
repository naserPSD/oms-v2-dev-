"use client";
import { FormController as Controller } from "@/components/common/FormController";
import CommonTable, { RowDragHandle, SortableCell } from "@/components/common/CommonTable";
import { arrayMove } from "@dnd-kit/sortable";
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
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";

const fakeData = [
  {
    id: 1,
    name: "Graphic Design",
    type: "UI/UX",
    level: "UI/UX",
    active: true,
  },
  {
    id: 2,
    name: "UI/UX Design",
    type: "Core Team",
    level: "",
    active: false,
  },
];

const initialValues = {
  id: "",
  name: "",
  departmentId: null,
  level: "",
  isActive: true,
};
const schema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Designation name is required"),
  departmentId: z.coerce.number().min(1, "Department is required"),
  level: z.coerce.number().max(99).optional(),
  isActive: z.boolean().default(true),
});

const DesignationsComponent = () => {
  const searchParams = useSearchParams();
  const { hasPermission } = useCommonFunctions();
  const [data, setData] = useState(fakeData);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
    officeType: searchParams.get("officeType") || "",
  });

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (filters.search) params.search = filters.search;
    if (filters.officeType) params.officeType = filters.officeType;
    if (filters.isActive) params.isActive = filters.isActive;
    params.sort = "level:asc,id:asc";
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
      officeType: "",
      isActive: "",
    });
    setCurrentPage(1);
    setGlobalFilter();

    // Clear URL params as well
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.delete("officeType");
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
    if (filters.officeType) params.set("officeType", filters.officeType);
    else params.delete("officeType");
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
    reset({
      ...initialValues,
      ...item,
      id: item?.id ?? "",
      name: item?.name ?? "",
      departmentId: item?.departmentId ?? null,
      level: item?.level ?? "",
      isActive: item?.isActive ?? item?.active ?? true,
    });
    setShowModal(true);
  };

  const {
    designationsQuery,
    allDesignationsQuery,
    addOrUpdateDesignationMutation,
    deleteDesignationMutation,
    toggleDesignationStatusMutation,
    reorderDesignationsMutation,
    useDepartmentDropdownQuery,
  } = useCompanySettingsQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  const { data: allDesignations = [] } = allDesignationsQuery || {};

  // React Query for data fetching
  const { data: departmentList = [] } = useDepartmentDropdownQuery;

  const departmentOptions = departmentList.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  // React Query for data fetching
  const {
    data: listData,
    isLoading: isFetching,
    status,
    error,
  } = designationsQuery(queryParams);

  const [orderedData, setOrderedData] = useState([]);

  const rowsData = Array.isArray(listData?.data)
    ? listData.data
    : Array.isArray(listData)
    ? listData
    : null;

  useEffect(() => {
    if (rowsData) {
      setOrderedData(rowsData);
    }
  }, [rowsData]);

  const handleRowReorder = async (oldIndex, newIndex) => {
    if (oldIndex === newIndex) return;

    const newRows = arrayMove(orderedData, oldIndex, newIndex);

    // Calculate sequential level based on current page
    const updatedRows = newRows.map((item, index) => ({
      ...item,
      level: (currentPage - 1) * itemsPerPage + index + 1,
    }));

    // Optimistically update table data
    setOrderedData(updatedRows);

    const payload = {
      items: updatedRows.map((item) => ({
        id: Number(item.id),
        level: Number(item.level),
      })),
    };

    try {
      await reorderDesignationsMutation.mutateAsync(payload);
    } catch (err) {
      if (Array.isArray(listData?.data)) {
        setOrderedData(listData.data);
      }
    }
  };

  const pagination = listData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total } = pagination;

  // Calculate next serial level from existing designations
  const getNextSerialLevel = useCallback(() => {
    const list = [
      ...(Array.isArray(listData?.data) ? listData.data : Array.isArray(listData) ? listData : []),
      ...(Array.isArray(allDesignations) ? allDesignations : []),
    ];
    const numericLevels = list
      .filter((item) => !item?.deletedAt)
      .map((item) => Number(item?.level))
      .filter((lvl) => !isNaN(lvl) && lvl > 0);
    return numericLevels.length > 0 ? Math.max(...numericLevels) + 1 : 1;
  }, [allDesignations, listData]);

  const handleOpenAddModal = () => {
    const nextLevel = getNextSerialLevel();
    reset({
      ...initialValues,
      level: nextLevel,
    });
    setShowModal(true);
  };

  useEffect(() => {
    if (showModal && !watch("id")) {
      const nextLevel = getNextSerialLevel();
      const currentLevel = watch("level");
      if (!currentLevel || currentLevel === "" || currentLevel === null) {
        setValue("level", nextLevel, { shouldValidate: true });
      }
    }
  }, [showModal, getNextSerialLevel, watch, setValue]);

  // Toggle filter bar visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  const submitForm = async (values) => {
    try {
      const formattedName = values.name
        ? values.name.trim().replace(/\b\w/g, (char) => char.toUpperCase())
        : values.name;
      await addOrUpdateDesignationMutation.mutateAsync({
        ...values,
        name: formattedName,
      });
    } catch (error) {
      // Error handling is handled in mutation onError
    }
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
        await deleteDesignationMutation.mutateAsync(id);
      }
    });
  };

  const changeServiceActiveStatus = async (id) => {
    await toggleDesignationStatusMutation.mutateAsync(id);
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
      placeholder: "Search by Designation Name",
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

  // TanStack Table columns
  const columns = useMemo(
    () => [
      // Drag Handle
      {
        id: "dragHandle",
        header: "",
        size: 40,
        enableSorting: false,
        cell: () => (
          <div className="flex justify-center">
            <RowDragHandle />
          </div>
        ),
      },

      // SL
      {
        accessorKey: "sl",
        header: "SL.",
        size: 60,
        enableSorting: false,
        cell: ({ row }) => (
          <SortableCell className="font-semibold text-gray-700 dark:text-gray-300">
            {(currentPage - 1) * itemsPerPage + row.index + 1}
          </SortableCell>
        ),
      },

      // Designation
      {
        accessorKey: "name",
        header: "Designation",
        size: 200,
        cell: ({ row }) => (
          <span
            className="font-medium capitalize"
            style={{ textTransform: "capitalize" }}
          >
            {helpers.capitalizeWords(row.original?.name)}
          </span>
        ),
      },

      // Department
      {
        accessorKey: "department",
        header: "Department",
        size: 180,
        cell: ({ row }) => <span>{row.original?.department?.name || "-"}</span>,
      },

      // Level
      {
        accessorKey: "level",
        header: "Level",
        size: 120,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="badge badge-circle badge-secondary">
              {row.original?.level}
            </span>
          </div>
        ),
      },

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
                disabled={!hasPermission("hr.designation_edit")}
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
              {hasPermission("hr.designation_edit") && (
                <button
                  onClick={() => handleEdit(data)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              )}
              {hasPermission("hr.designation_delete") && (
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
    [handleDelete, handleEdit, changeServiceActiveStatus, currentPage, itemsPerPage, hasPermission],
  );

  // Create TanStack Table instance
  const table = useReactTable({
    data: orderedData,
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
    addOrUpdateDesignationMutation.isLoading ||
    deleteDesignationMutation.isLoading ||
    toggleDesignationStatusMutation.isLoading ||
    reorderDesignationsMutation.isLoading;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Designations</h1>
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
          {hasPermission("hr.designation_add") && (
            <ButtonTw
              onClick={handleOpenAddModal}
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
        enableRowReorder={!hasActiveFilters}
        onRowReorder={handleRowReorder}
        rowIdKey="id"
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
          <thead>
            <tr>
              <th>SL.</th>
              <th>Designation</th>
              <th>Department</th>
              <th className="text-center">Level</th>
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
                  <td>{row?.department?.name}</td>
                  <td className="text-center">
                    <span className="badge badge-circle badge-secondary">
                      {row.level}
                    </span>
                  </td>
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
        title={watch("id") ? "Edit Designation" : "Add New Designation"}
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
                  label="Designation Name"
                  placeholder="Enter Designation Name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 capitalize"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="level"
              render={({ field, fieldState }) => (
                <Input
                  type="number"
                  numberAlignment="left"
                  min={1}
                  label="Designation Level"
                  placeholder="Enter Designation Level"
                  hints="1,2,3... numeric order, 1 being the highest level."
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
              name="departmentId"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Department"
                  options={departmentOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-9 sm:col-span-12"
                  placeholder="Select Department"
                  searchable
                />
              )}
            />

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
                type="button"
                size="sm"
                variant="outline.gray"
                className="w-full font-bold mt-4 col-span-12"
                onClick={() => {
                  if (watch("id")) {
                    reset(initialValues);
                  } else {
                    reset({
                      ...initialValues,
                      level: getNextSerialLevel(),
                    });
                  }
                }}
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

export default DesignationsComponent;
