"use client";
import { FormController as Controller } from "@/components/common/FormController";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import Swal from "sweetalert2";
import { Calendar, Download, FileText, Pencil, Trash2 } from "lucide-react";
import { FaFilter } from "react-icons/fa";
import { BiPlus } from "react-icons/bi";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import helpers, { toaster } from "@/utils/helpers";
import { debounce } from "lodash";
import SwitchButton from "@/components/ui/SwitchButton";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import ButtonTw from "@/components/ui/ButtonTw";
import DataFilter from "@/components/common/DataFilter";
import CommonTable from "@/components/common/CommonTable";
import Pagination from "@/components/common/Pagination";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import SelectSearch from "@/components/ui/SelectSearch";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import FileUpload from "@/components/ui/FileUpload";
import RestApi from "@/utils/RestApi";

// ---------------- Schema & Initial Values (for main form) ----------------
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

// ---------------- Upload Form Schema ----------------
const uploadSchema = z
  .object({
    documentTypeId: z.coerce.number().optional(),
    issueDate: z.string().optional(),
    expiredDate: z.string().optional(),
    documentFiles: z.any().optional(),   // no longer required
  })
  .refine(
    (data) => {
      if (data.issueDate && data.expiredDate) {
        return new Date(data.issueDate) < new Date(data.expiredDate);
      }
      return true;
    },
    {
      message: "Expiry date must be after issue date",
      path: ["expiredDate"],
    }
  );


const CompanyDocuments = () => {
  const { hasPermission } = useCommonFunctions();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [importFromMaster, setImportFromMaster] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCompanyDocument, setSelectedCompanyDocument] = useState(null);

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

  const { handleSubmit, setError, control, reset, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Upload form hook
  const {
    handleSubmit: handleUploadSubmit,
    control: uploadControl,
    reset: resetUploadForm,
    setValue: setUploadValue,
    formState: { errors: uploadErrors },
    setError: setUploadError,
  } = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      companyDocumentId: "",
      issueDate: "",
      expiredDate: "",
      documentFiles: [],
    },
  });

  const handleClose = () => {
    reset(initialValues);
    setImportFromMaster(false);
    setShowModal(false);
  };

  const [selectedFiles, setSelectedFiles] = useState([]);

  // 👇 Add this useEffect right after the state
  useEffect(() => {
    setUploadValue('documentFiles', selectedFiles, { shouldValidate: true });
  }, [selectedFiles, setUploadValue]);

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedCompanyDocument(null);
    setSelectedFiles([]);
    setExistingFiles([]);
    resetUploadForm();
  };

  const handleEdit = (item) => {
    reset(item);
    setShowModal(true);
  };

  const {
    companyDocumentsQuery,
    addOrUpdateCompanyDocumentMutation,
    deleteCompanyDocumentMutation,
    toggleCompanyDocumentStatusMutation,
    masterDocumentsWithoutPaginationQuery,
  } = useHrQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching, refetch: refetchDocuments } =
    companyDocumentsQuery(queryParams);

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

  // React Master Data Query (Without pagination & search)
  const { data: responsemasterData, isLoading: isMasterDataFetching } =
    masterDocumentsWithoutPaginationQuery();

  const masterDocumentsList = useMemo(() => {
    return responsemasterData?.data || [];
  }, [responsemasterData]);

  const masterDocumentsOptions = useMemo(() => {
    return masterDocumentsList.map((item) => ({
      label: item.documentName,
      value: item.id,
    }));
  }, [masterDocumentsList]);

  const handleMasterSelect = (masterId) => {
    const selectedMaster = masterDocumentsList.find((m) => m.id === masterId);

    if (selectedMaster) {
      setValue("documentName", selectedMaster.documentName);
      setValue("documentTypeId", selectedMaster.documentTypeId);
      setValue("isActive", selectedMaster.isActive);
    }
  };

  // Switch OFF করলে form clear হবে
  useEffect(() => {
    if (!importFromMaster) {
      setValue("documentName", "");
      setValue("documentTypeId", "");
      setValue("isActive", true);
    }
  }, [importFromMaster, setValue]);

  // Toggle filter bar visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  const submitForm = async (values) => {
    await addOrUpdateCompanyDocumentMutation.mutateAsync(values);
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
        await deleteCompanyDocumentMutation.mutateAsync(id);
      }
    });
  };

  const changeDocumentActiveStatus = async (id) => {
    await toggleCompanyDocumentStatusMutation.mutateAsync(id);
  };

  // ---------- File Upload Mutation ----------
  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      // Adjust the endpoint as needed
      const response = await RestApi.post("/api/v1/hr-management/company-document-records/add-or-update-multiple-files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      // Swal.fire("Success!", "Document(s) uploaded successfully.", "success");
      toaster("Document(s) uploaded successfully", "success");
      refetchDocuments(); // refresh table
      setSelectedFiles([]);
      handleCloseUploadModal();
    },
    onError: (error) => {
      console.error("Upload error:", error);
      // Swal.fire("Error!", error?.response?.data?.message || "Upload failed. Please try again.", "error");
      toaster("Error uploading document(s)", "error");
    },
  });

  const onUploadSubmit = async (data) => {
    if (!selectedCompanyDocument) return;

    // 🛑 Check: at least one file must exist (either existing or newly selected)
    if (existingFiles.length === 0 && selectedFiles.length === 0) {
      // toaster("At least one file is required", "error");
      setUploadError("documentFiles", { message: "At least one file is required" });
      return;
    }

    // 🛑 Strict check: Only image and PDF files allowed (no folders or other files)
    const invalidFile = selectedFiles.find((file) => {
      if (!file.size || file.size === 0) return true;
      const ext = file.name?.split(".").pop()?.toLowerCase();
      const validExts = ["pdf", "jpg", "jpeg", "png", "webp"];
      const isImageOrPdf =
        file.type?.startsWith("image/") ||
        file.type === "application/pdf" ||
        file.name?.toLowerCase().endsWith(".pdf");
      return !validExts.includes(ext) || !isImageOrPdf;
    });
    if (invalidFile) {
      toaster("File type should be image/pdf", "error");
      setUploadError("documentFiles", {
        message: "File type should be image/pdf",
      });
      return;
    }

    // 🛑 Strict check: Maximum 2MB per file
    const oversizedFile = selectedFiles.find(
      (file) => file.size > 2 * 1024 * 1024
    );
    if (oversizedFile) {
      toaster("File size maximum 2MB", "error");
      setUploadError("documentFiles", {
        message: "File size maximum 2MB",
      });
      return;
    }

    const hasDateChanges =
      data.issueDate !== originalDates.issueDate ||
      data.expiredDate !== originalDates.expiredDate;

    // If there are new files, upload them
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      formData.append("companyDocumentId", selectedCompanyDocument.id);
      if (data.issueDate) formData.append("issueDate", data.issueDate);
      if (data.expiredDate) formData.append("expiredDate", data.expiredDate);

      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("documentFiles", selectedFiles[i]);
      }
      await uploadMutation.mutateAsync(formData);
    }
    // Otherwise, if only dates changed, update them separately
    else if (hasDateChanges) {
      await updateDatesMutation.mutateAsync({
        id: selectedCompanyDocument.id,
        issueDate: data.issueDate,
        expiredDate: data.expiredDate,
      });
      toaster("Document dates updated", "success");
      refetchDocuments();
      handleCloseUploadModal();
    } else {
      // No changes, just close
      handleCloseUploadModal();
    }
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
        accessorKey: "documentsInfo",
        header: "Documents",
        size: 260,
        cell: ({ row }) => {
          const { issueDate, expiredDate, documentRecords = [] } = row.original;
          return (
            <div className="space-y-2">
              {(issueDate || expiredDate) && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  {issueDate && (
                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Calendar size={12} className="text-blue-500" />
                      <span>Issue: {helpers.dDate(issueDate, "DD MMM YYYY")}</span>
                    </div>
                  )}
                  {expiredDate && (
                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Calendar size={12} className="text-red-500" />
                      <span>Expiry: {helpers.dDate(expiredDate, "DD MMM YYYY")}</span>
                    </div>
                  )}
                </div>
              )}

              {documentRecords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {documentRecords.map((item) => (
                    <a
                      key={item.id}
                      href={item?.media?.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-blue-600 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      <FileText size={10} />
                      <span className="truncate max-w-[120px]">{item?.media?.fileName || "File"}</span>
                      <Download size={10} className="ml-0.5" />
                    </a>
                  ))}
                </div>
              )}

              <ButtonTw
                variant="blue"
                size="xs"
                onClick={() => openUploadDocumentModal(row.original)}
                className="mt-1"
              >
                Upload Document
              </ButtonTw>
            </div>
          );
        },
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
                disabled={!hasPermission("settings.company_documents_edit")}
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
              {hasPermission("settings.company_documents_edit") && (
                <button
                  onClick={() => handleEdit(data)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              )}
              {hasPermission("settings.company_documents_delete") && (
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


  const [existingFiles, setExistingFiles] = useState([]); // store documentRecords
  const [originalDates, setOriginalDates] = useState({ issueDate: "", expiredDate: "" });

  const openUploadDocumentModal = (companyDocument) => {
    let newSelectedCompanyDocument = companyDocument;
    newSelectedCompanyDocument.companyDocumentId = companyDocument.id || null; // Pre-fill companyDocumentId for the upload form
    setSelectedCompanyDocument(newSelectedCompanyDocument);
    setSelectedFiles([]);
    resetUploadForm({
      issueDate: companyDocument.issueDate || "",
      expiredDate: companyDocument.expiredDate || "",
      documentFiles: [],
    });

    setOriginalDates({
      issueDate: companyDocument.issueDate || "",
      expiredDate: companyDocument.expiredDate || "",
    });

    setExistingFiles(companyDocument.documentRecords || []); // Store existing document records to show in the upload modal
    setShowUploadModal(true);
  };

  const deleteFileMutation = useMutation({
    mutationFn: async (recordId) => {
      await RestApi.delete(`/api/v1/hr-management/delete-company-document-records/${recordId}`);
    },
    onSuccess: (data, variables) => {
      const recordId = variables;
      toaster("File deleted successfully", "success");
      // Refresh both modal list and main table
      // remove file from existing files
      setExistingFiles((prev) => prev.filter((file) => file.id !== recordId));
      refetchDocuments();
    },
    onError: (error) => {
      console.error("Delete file error:", error);
      toaster("Failed to delete file", "error");
    },
  });

  const updateDatesMutation = useMutation({
    mutationFn: async ({ id, issueDate, expiredDate }) => {
      await RestApi.patch(`/api/v1/hr-management/company-documents/${id}`, { issueDate, expiredDate });
    },
    onSuccess: () => {
      toaster("Document dates updated", "success");
      refetchDocuments();
    },
    onError: () => toaster("Failed to update dates", "error"),
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
    isMasterDataFetching ||
    addOrUpdateCompanyDocumentMutation.isLoading ||
    toggleCompanyDocumentStatusMutation.isLoading ||
    deleteCompanyDocumentMutation.isLoading;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Company Documents</h1>

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
          {hasPermission("settings.company_documents_add") && (
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

      {/* Add / Edit Document Modal */}
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={watch("id") ? "Edit Company Document" : "Add Company Document"}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-12 gap-x-4">
            {/* Switch */}

            {/* {!watch("id") && (
              <div className="col-span-12 mb-5">
                <SwitchButton
                  enabled={importFromMaster}
                  onChange={setImportFromMaster}
                  label="Do You Want to Import From Master Documents?"
                  enabledText="Yes"
                  disabledText="No"
                />
              </div>
            )} */}

            {/* Master Document Select */}
            {!watch("id") && importFromMaster && (
              <div className="col-span-12">
                <SelectSearch
                  label="Master Document"
                  options={masterDocumentsOptions}
                  value={watch("masterDocumentId")}
                  onChange={(val) => {
                    setValue("masterDocumentId", val);
                    handleMasterSelect(val);
                  }}
                  placeholder="Select Master Document"
                  searchable
                />
              </div>
            )}

            {/* Document Name */}
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
                  disabled={importFromMaster}
                />
              )}
            />

            {/* Document Type */}
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
                  disabled={importFromMaster}
                />
              )}
            />

            {/* Active Status */}
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
                  disabled={importFromMaster}
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
                onClick={() => reset(initialValues)}
              >
                Reset
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>

      {/* ---------- Upload Document Modal ---------- */}
      <ModalTw
        show={showUploadModal}
        onClose={handleCloseUploadModal}
        title={`Upload Documents for "${selectedCompanyDocument?.documentName || ""}"`}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleUploadSubmit(onUploadSubmit)}>
          <div className="grid grid-cols-12 gap-x-4 gap-y-4">
            {/* Document Type (optional) */}
            {/* <div className="col-span-12">
              <Controller
                control={uploadControl}
                name="documentTypeId"
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Document Type (Optional)"
                    options={documentsTypeList}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    placeholder="Select Document Type"
                    searchable
                  />
                )}
              />
            </div> */}

            {/* Issue Date */}
            <div className="col-span-12 md:col-span-6">
              <Controller
                control={uploadControl}
                name="issueDate"
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="Issue Date"
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    placeholder="Select Issue Date"
                  />
                )}
              />
            </div>

            {/* Expired Date */}
            <div className="col-span-12 md:col-span-6">
              <Controller
                control={uploadControl}
                name="expiredDate"
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="Expiry Date"
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    placeholder="Select Expiry Date"
                  />
                )}
              />
            </div>

            {/* Existing Files Section */}
            {existingFiles.length > 0 && (
              <div className="col-span-12">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Uploaded Files
                </label>
                <ul className="space-y-2">
                  {existingFiles.map((record) => (
                    <li key={record.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-sm">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-blue-500" />
                        <a
                          href={record.media?.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px]"
                        >
                          {record.media?.originalName || record.media?.fileName || "File"}
                        </a>
                        <span className="text-gray-500 text-xs">
                          ({(record.media?.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
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
                              deleteFileMutation.mutate(record.id);
                            }
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* <Controller
              control={uploadControl}
              name="documentFiles"
              render={({ field, fieldState }) => (
                <FileUpload
                  {...field}
                  label={`Document Files`}
                  accept="image/*,application/pdf"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  error={fieldState.error?.message}
                  size="sm"
                  clearable
                  multiple={true}
                />
              )}
            /> */}

            {/* File Upload (multiple) */}
            <div className="col-span-12">
              <Controller
                control={uploadControl}
                name="documentFiles"
                render={({ field }) => (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <span>Document Files</span>
                        <span className="text-red-500 font-bold leading-none select-none">*</span>
                      </span>
                    </label>

                    {/* File input */}
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length) {
                          const MAX_SIZE = 2 * 1024 * 1024; // 2MB
                          const ALLOWED_EXTS = ["pdf", "jpg", "jpeg", "png", "webp"];
                          const validFiles = [];
                          let hasInvalidType = false;
                          let hasOversized = false;

                          files.forEach((file) => {
                            // Check if it's a folder or empty item
                            if (!file.size || file.size === 0) {
                              hasInvalidType = true;
                              return;
                            }

                            const ext = file.name?.split(".").pop()?.toLowerCase();
                            const isAllowedExt = ALLOWED_EXTS.includes(ext);
                            const isImageOrPdf =
                              file.type.startsWith("image/") ||
                              file.type === "application/pdf" ||
                              ext === "pdf";

                            if (!isAllowedExt || !isImageOrPdf) {
                              hasInvalidType = true;
                              return;
                            }

                            if (file.size > MAX_SIZE) {
                              hasOversized = true;
                              return;
                            }

                            validFiles.push(file);
                          });

                          if (hasInvalidType) {
                            toaster("File type should be image/pdf", "error");
                            setUploadError("documentFiles", {
                              message: "File type should be image/pdf",
                            });
                          }

                          if (hasOversized) {
                            toaster("File size maximum 2MB", "error");
                            setUploadError("documentFiles", {
                              message: "File size maximum 2MB",
                            });
                          }

                          if (validFiles.length) {
                            setSelectedFiles((prev) => [...prev, ...validFiles]);
                            if (!hasInvalidType && !hasOversized) {
                              setUploadError("documentFiles", null);
                            }
                          }
                        }
                        e.target.value = ''; // allow re-selecting the same file again
                      }}
                      className={`w-full text-gray-900 border bg-gray-50 focus:ring-blue-500 focus:border-blue-500 ${
                        uploadErrors.documentFiles ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white rounded-md p-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-800 dark:file:text-blue-400 cursor-pointer`}
                    />

                    {/* Hint text below input */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 space-y-0.5 font-normal">
                      <p>File type should be image/pdf</p>
                      <p>File size maximum 2MB</p>
                    </div>

                    {/* Preview list of selected files */}
                    {selectedFiles.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {selectedFiles.map((file, idx) => (
                          <li key={idx} className="flex items-center justify-between bg-blue-100 dark:bg-blue-600/10 p-2 rounded-md text-sm">
                            <span className="truncate flex-1">
                              {file.name} ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              <Trash2 size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Validation error */}
                    {uploadErrors.documentFiles && (
                      <p className="text-red-500 text-xs mt-1">
                        {uploadErrors.documentFiles.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="col-span-12 flex justify-center items-center gap-4 mt-2">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold"
                disabled={uploadMutation.isLoading}
                loading={uploadMutation.isLoading}
              >
                Save Changes
              </ButtonTw>

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold"
                onClick={handleCloseUploadModal}
              >
                Cancel
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default CompanyDocuments;