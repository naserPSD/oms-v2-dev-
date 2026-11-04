"use client";
import { FormController as Controller } from "@/components/common/FormController";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import Swal from "sweetalert2";
import { Pencil, Trash2 } from "lucide-react";
import { FaFilter } from "react-icons/fa";
import { BiPlus } from "react-icons/bi";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import helpers from "@/utils/helpers";
import { debounce } from "lodash";
import SwitchButton from "@/components/ui/SwitchButton";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import ButtonTw from "@/components/ui/ButtonTw";
import DataFilter from "@/components/common/DataFilter";
import CommonTable from "@/components/common/CommonTable";
import Pagination from "@/components/common/Pagination";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

// ---------------- Schema & Initial Values ----------------
const initialValues = {
  id: "",
  documentName: "",
  documentTypeId: null,
  isActive: true,
};

const schema = z.object({
  id: z.coerce.number().optional(),
  documentName: z.string().min(1, "Document name is required"),
  documentTypeId: z.coerce.number().min(1, "Document type is required"),
  isActive: z.boolean().default(true),
});

const MasterDocuments = () => {
  const { hasPermission } = useCommonFunctions();
  const searchParams = useSearchParams();

  const [showModal, setShowModal] = useState(false);

  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );

  const initialIsActiveStatus = searchParams.get("isActive") || "";
  const initialSearch = searchParams.get("search") || "";

  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);

  const dropdowns = useCommonStore((state) => state.dropdowns);
  const documentsTypeList =
    dropdowns.statusGroupList?.find((s) => s.code === "document_types")
      ?.statuses ?? [];

  const [filters, setFilters] = useState({
    search: initialSearch,
    isActive: initialIsActiveStatus,
    documentTypeId: searchParams.get("documentTypeId") || "",
  });

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (filters.search) params.search = filters.search;
    if (filters.documentTypeId) params.documentTypeId = filters.documentTypeId;
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
      documentTypeId: "",
      isActive: "",
    });

    setCurrentPage(1);
    setGlobalFilter("");

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
    if (filters.documentTypeId)
      params.set("documentTypeId", filters.documentTypeId);
    if (filters.isActive) params.set("isActive", filters.isActive);

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateSearch.cancel();
    };
  }, [debouncedUpdateSearch]);

  const {
    handleSubmit,
    setError,
    control,
    //formState: { errors },
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
    masterDocumentsQuery,
    addOrUpdateMasterDocumentMutation,
    deleteMasterDocumentMutation,
    toggleMasterDocumentStatusMutation,
  } = useHrQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  //   const {
  //     data: listData = [],
  //     isLoading: isFetching,
  //     //status,
  //     //error,
  //   } = masterDocumentsQuery(queryParams);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    masterDocumentsQuery(queryParams);

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

  // Toggle filter bar visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  const submitForm = async (values) => {
    await addOrUpdateMasterDocumentMutation.mutateAsync(values);
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
        await deleteMasterDocumentMutation.mutateAsync(id);
      }
    });
  };

  const changeDocumentActiveStatus = async (id) => {
    await toggleMasterDocumentStatusMutation.mutateAsync(id);
  };

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
      placeholder: "Search By Document Name",
    },

    {
      component: "select",
      name: "documentTypeId",
      label: "Document Type",
      options: documentsTypeList,
      placeholder: "Filter by Document Type",
    },

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
      {
        accessorKey: "sl",
        header: "SL.",
        size: 60,
      },

      {
        accessorKey: "documentName",
        header: "Document Name",
        size: 200,
        cell: ({ row }) => (
          <span className="font-medium">{row.original?.documentName}</span>
        ),
      },

      {
        accessorKey: "documentType",
        header: "Document Type",
        size: 180,
        cell: ({ row }) => (
          <span>{row.original?.documentType?.name || "-"}</span>
        ),
      },

      {
        accessorKey: "isActive",
        header: "Active",
        size: 120,
        cell: ({ row }) => {
          const { id, isActive } = row.original;
          return (
            <div className="flex justify-center">
              <SwitchButton
                onClick={() => changeDocumentActiveStatus(id)}
                enabled={isActive}
                enabledText="Yes"
                disabledText="No"
                className="!mb-0"
                disabled={!hasPermission("settings.master_documents_edit")}
              />
            </div>
          );
        },
      },

      {
        id: "actions",
        header: "Actions",
        size: 120,
        enableSorting: false,
        cell: ({ row }) => {
          const data = row.original;
          return (
            <div className="flex justify-center gap-2">
              {hasPermission("settings.master_documents_edit") && (
                <button
                  onClick={() => handleEdit(data)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              )}

              {hasPermission("settings.master_documents_delete") && (
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
    [handleDelete, handleEdit, changeDocumentActiveStatus],
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
    addOrUpdateMasterDocumentMutation.isLoading ||
    toggleMasterDocumentStatusMutation.isLoading ||
    deleteMasterDocumentMutation.isLoading;
  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Master Documents</h1>

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

          {hasPermission("settings.master_documents_add") && (
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

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={watch("id") ? "Edit Master Document" : "Add Master Document"}
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
              name="documentName"
              render={({ field, fieldState }) => (
                <Input
                  label="Document Name"
                  placeholder="Enter Document Name"
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
              name="documentTypeId"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Document Type"
                  options={documentsTypeList}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-9 sm:col-span-12"
                  placeholder="Select Document Type"
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
                  label="Active Status"
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

export default MasterDocuments;
