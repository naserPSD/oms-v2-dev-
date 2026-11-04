"use client";
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SelectSearch from "@/components/ui/SelectSearch";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonStore } from "@/store/useCommonStore";
import {
  deleteCompanyEmailTemplate,
  deleteMasterEmailTemplate,
  fetchCompanyEmailTemplates,
  fetchMasterEmailTemplates,
  importEmailTemplate,
  saveCompanyEmailTemplate,
  saveMasterEmailTemplate,
} from "@/services/emailTemplateApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toaster } from "@/utils/helpers";
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
import { BiPlus, BiCopy } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";
import AddOrUpdateEmailTemplateModal from "./modals/AddOrUpdateEmailTemplateModal";
import { useEmailTemplatesFilters } from "./hooks/useEmailTemplatesFilters";
import { useEmailTemplatesTableColumn } from "./hooks/useEmailTemplatesTableColumn";
import EmailTemplateViewDetailsModal from "./modals/EmailTemplateViewDetailsModal";
import EmailTemplateVariablesModal from "./modals/EmailTemplateVariablesModal";
import ImportEmailTemplateModal from "./modals/ImportEmailTemplateModal";

// Schema for email template
const emailTemplateSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Email subject is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["active", "inactive", "draft"]),
  isDefault: z.boolean().default(false),
  availableForSubscriber: z.boolean().optional(),
  content: z.string().min(1, "Template content is required"),
});

const initialValues = {
  id: 0,
  name: "",
  subject: "",
  description: "",
  category: "",
  status: "active",
  isDefault: false,
  availableForSubscriber: false,
  content: "",
};

const EmailTemplates = ({ mode = "company" }) => {
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;

  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [showVariablesModal, setShowVariablesModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [editorKey, setEditorKey] = useState("new");
  const [showImportModal, setShowImportModal] = useState(false);
  const queryClient = useQueryClient();
  const isMaster = mode === "master";

  // Modal Handlers
  const handleViewDetails = useCallback((template) => {
    setCurrentTemplate(template);
    setShowViewDetailsModal(true);
  }, []);

  const handleViewVariables = useCallback((template) => {
    setCurrentTemplate(template);
    setShowVariablesModal(true);
  }, []);

  const handleCloseModals = useCallback(() => {
    setShowViewDetailsModal(false);
    setShowVariablesModal(false);
    setCurrentTemplate(null);
  }, []);

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
  } = useEmailTemplatesFilters(itemsPerPage);

  // ⚡ Form
  const {
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  const { data: responseData, isFetching } = useQuery({
    queryKey: ["email-templates", mode, queryParams],
    queryFn: () =>
      isMaster
        ? fetchMasterEmailTemplates(queryParams)
        : fetchCompanyEmailTemplates(queryParams),
  });

  const saveMutation = useMutation({
    mutationFn: (values) =>
      isMaster
        ? saveMasterEmailTemplate(values)
        : saveCompanyEmailTemplate(values),
    onSuccess: (_data, values) => {
      toaster(
        `Email template ${values?.id ? "updated" : "saved"} successfully`,
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["email-templates", mode] });
      handleClose();
    },
    onError: (error) => helpers.handleApiValidationError(error, setError),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      isMaster ? deleteMasterEmailTemplate(id) : deleteCompanyEmailTemplate(id),
    onSuccess: () => {
      toaster("Email template deleted", "success");
      queryClient.invalidateQueries({ queryKey: ["email-templates", mode] });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (ids) => {
      const selected = Array.isArray(ids) ? ids : [ids];
      const imported = [];
      for (const id of selected) {
        imported.push(await importEmailTemplate(id));
      }
      return imported;
    },
    onSuccess: (imported) => {
      const count = imported.length;
      toaster(
        count === 1
          ? "Template imported. You can edit it for this company."
          : `${count} templates imported. You can edit them for this company.`,
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["email-templates", mode] });
      setShowImportModal(false);
    },
    onError: (error) => {
      toaster(error?.response?.data?.message || "Could not import templates", "error");
    },
  });


  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  const dataArray = useMemo(() => {
    const payload = responseData?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(responseData)) return responseData;
    return [];
  }, [responseData]);

  const pagination = responseData?.pagination ||
    responseData?.data?.pagination || {
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

  // 🧠 Row Selection Handlers
  const toggleRowSelection = useCallback((idOrSet) => {
    if (idOrSet instanceof Set) {
      setSelectedRows(idOrSet);
    } else {
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(idOrSet)) {
          newSet.delete(idOrSet);
        } else {
          newSet.add(idOrSet);
        }
        return newSet;
      });
    }
  }, []);

  const toggleAllRows = useCallback(() => {
    const allIds = listData.map((item) => item.id);
    if (selectedRows.size === listData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(allIds));
    }
  }, [listData, selectedRows.size]);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  // 🧠 Bulk Actions Handler
  const handleBulkAction = useCallback(async () => {
    if (!bulkAction || selectedRows.size === 0) {
      Swal.fire({
        title: "Action Required",
        text: "Please select both an action and templates",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const selectedIds = Array.from(selectedRows);

    try {
      switch (bulkAction) {
        case "duplicate":
          Swal.fire({
            title: "Duplicate Templates",
            text: `Are you sure you want to duplicate ${selectedIds.length} templates?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, duplicate!",
            cancelButtonText: "Cancel",
          }).then(async (result) => {
            if (result.isConfirmed) {
              // Handle duplication logic here
              console.log("Duplicating templates:", selectedIds);
              clearSelection();
            }
          });
          return;
        case "delete":
          Swal.fire({
            title: "Confirm Delete",
            text: `Are you sure you want to delete ${selectedIds.length} templates?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete!",
            cancelButtonText: "Cancel",
          }).then(async (result) => {
            if (result.isConfirmed) {
              await Promise.all(
                selectedIds.map((id) =>
                  deleteMutation.mutateAsync(id),
                ),
              );
              clearSelection();
            }
          });
          return;
        case "deactivate":
          // Handle deactivation logic
          console.log("Deactivating templates:", selectedIds);
          clearSelection();
          break;
        default:
          break;
      }

      setBulkAction("");
    } catch (error) {
      console.error("Bulk action error:", error);
    }
  }, [bulkAction, selectedRows, deleteMutation, clearSelection]);

  // 🧠 Build filter config
  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search by Name, Subject, Description...",
    },
    {
      component: "select",
      name: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "draft", label: "Draft" },
      ],
      placeholder: "Filter by Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "category",
      label: "Category",
      options: [
        { value: "onboarding", label: "Onboarding" },
        { value: "authentication", label: "Authentication" },
        { value: "newsletter", label: "Newsletter" },
        { value: "ecommerce", label: "E-commerce" },
        { value: "billing", label: "Billing" },
        { value: "support", label: "Support" },
        { value: "marketing", label: "Marketing" },
        { value: "product", label: "Product" },
        { value: "calendar", label: "Calendar" },
      ],
      placeholder: "Filter by Category",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "isDefault",
      label: "Default Template",
      options: [
        { value: "true", label: "Default" },
        { value: "false", label: "Custom" },
      ],
      placeholder: "Filter by Type",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
    },
  ];

  // 📝 Submit Template handler
  const submitForm = async (values) => {
    const payload = {
      ...values,
      id: values.id || undefined,
      isDefault: Boolean(values.isDefault),
      availableForSubscriber: Boolean(values.availableForSubscriber),
    };
    await saveMutation.mutateAsync(payload);
  };

  // 📝 Edit handler
  const handleEdit = useCallback(
    (item) => {
      reset({
        id: item.id,
        name: item.name,
        subject: item.subject,
        description: item.description || "",
        category: item.category,
        status: item.status,
        isDefault: Boolean(item.isDefault),
        availableForSubscriber: Boolean(item.availableForSubscriber),
        content: item.content,
      });
      setCurrentTemplate(item);
      setEditorKey(`edit-${item.id}-${Date.now()}`);
      setShowModal(true);
    },
    [reset],
  );

  // 📝 Duplicate handler
  const handleDuplicate = useCallback(
    (item) => {
      reset({
        id: 0,
        name: `${item.name} (Copy)`,
        subject: item.subject,
        description: item.description || "",
        category: item.category,
        status: "draft",
        isDefault: false,
        availableForSubscriber: Boolean(item.availableForSubscriber),
        content: item.content,
      });
      setCurrentTemplate(item);
      setEditorKey(`copy-${item.id}-${Date.now()}`);
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
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteMutation.mutateAsync(id);
          } catch (error) {
            console.error("Error deleting template:", error);
          }
        }
      });
    },
    [deleteMutation],
  );

  // ➕ Add new template handler
  const handleNewTemplate = useCallback(() => {
    reset(initialValues);
    setCurrentTemplate(null);
    setEditorKey(`new-${Date.now()}`);
    setShowModal(true);
  }, [reset]);

  // 🧠 ---------- TABLE ----------
  const columns = useEmailTemplatesTableColumn({
    handleEdit,
    handleViewDetails,
    handleDuplicate,
    handleDelete,
    handleViewVariables,
    selectedRows,
    toggleRowSelection,
    toggleAllRows,
    showSubscriberAvailability: isMaster,
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
    saveMutation.isPending ||
    deleteMutation.isPending ||
    importMutation.isPending;

  const isEditing = watch("id") !== 0;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-2xl">
            {isMaster ? "Master Email Templates" : "Email Templates"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isMaster
              ? "Platform templates. Mark a template available so companies can import it."
              : "Your company templates. Import a master template, then edit it, or create your own."}
          </p>
        </div>
        <div className="flex gap-2">
          <SimpleTooltip
            title={showFilter === "show" ? "Hide" : "Show"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw
              onClick={toggleFilter}
              variant="alternative"
              className="gap-2"
            >
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>
          {!isMaster && (
            <ButtonTw
              onClick={() => setShowImportModal(true)}
              variant="alternative"
              className="gap-2"
            >
              Import Template
            </ButtonTw>
          )}
          <ButtonTw
            onClick={handleNewTemplate}
            variant="blue"
            className="gap-2"
          >
            <BiPlus /> Create Template
          </ButtonTw>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRows.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                {selectedRows.size} template(s) selected
              </span>

              <SelectSearch
                value={bulkAction}
                onChange={setBulkAction}
                options={[
                  { value: "duplicate", label: "Duplicate Selected" },
                  { value: "delete", label: "Delete Selected" },
                  { value: "deactivate", label: "Deactivate Selected" },
                ]}
                placeholder="Choose action..."
                className="w-48"
              />

              <ButtonTw
                onClick={handleBulkAction}
                variant="blue"
                size="sm"
                className="gap-2"
              >
                <BiCopy /> Apply Action
              </ButtonTw>
            </div>

            <ButtonTw onClick={clearSelection} variant="outline" size="sm">
              Clear Selection
            </ButtonTw>
          </div>
        </div>
      )}

      {/* Create/Edit Template Modal */}
      <AddOrUpdateEmailTemplateModal
        showModal={showModal}
        handleClose={handleClose}
        isEditing={isEditing}
        control={control}
        watch={watch}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        isLoading={isLoading}
        errors={errors}
        editorKey={editorKey}
        variables={currentTemplate?.variables || []}
        mode={mode}
      />

      {!isMaster && (
        <ImportEmailTemplateModal
          show={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={(id) => importMutation.mutate(id)}
          isImporting={importMutation.isPending}
        />
      )}

      {/* View Details Modal */}
      <EmailTemplateViewDetailsModal
        showModal={showViewDetailsModal}
        onClose={handleCloseModals}
        template={currentTemplate}
      />

      {/* Variables Modal */}
      <EmailTemplateVariablesModal
        showModal={showVariablesModal}
        onClose={handleCloseModals}
        template={currentTemplate}
      />

      {/* Filter Bar */}
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Email Templates Table */}
      <CommonTable
        table={table}
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Pagination */}
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

export default EmailTemplates;
