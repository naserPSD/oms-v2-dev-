"use client";
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SelectSearch from "@/components/ui/SelectSearch";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import {
  deleteCompanyEmailBroadcast,
  fetchCompanyEmailBroadcasts,
  saveCompanyEmailBroadcast,
  sendCompanyEmailBroadcast,
} from "@/services/emailBroadcastApi";
import helpers, { toaster } from "@/utils/helpers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { BiPlus, BiSend } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";
import AddOrUpdateEmailBroadCastModal from "./modals/AddOrUpdateEmailBroadCastModal";
import { useEmailBroadcastFilters } from "./hooks/useEmailBroadcastFilters";
import { useEmailBroadcastTableColumn } from "./hooks/useEmailBroadcastTableColumn";
import EmailBroadCastShowAttachmentModal from "./modals/EmailBroadCastShowAttachmentModal";
import EmailBroadCastShowRecipientsModal from "./modals/EmailBroadCastShowRecipientsModal";
import EmailBroadCastViewDetailsModal from "./modals/EmailBroadCastViewDetailsModal";

// Schema for email broadcast
const emailBroadcastSchema = z
  .object({
    id: z.coerce.number().optional(),
    templateId: z.union([z.string(), z.number()]).optional(),
    subject: z.string().min(1, "Email subject is required"),
    message: z.string().min(1, "Email message is required"),
    recipientType: z.enum(["all", "selected", "custom"]),
    customEmails: z.string().optional(),
    recipientUserIds: z.array(z.union([z.string(), z.number()])).optional(),
    scheduleTime: z.string().optional(),
    isScheduled: z.boolean().default(false),
    attachments: z.array(z.any()).optional(),
    existingAttachments: z.array(z.any()).optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.isScheduled) return;
    const when = values.scheduleTime ? new Date(values.scheduleTime) : null;
    if (!when || Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduleTime"],
        message: "Choose a future date and time",
      });
    }
  });

const initialValues = {
  id: 0,
  templateId: "",
  subject: "",
  message: "",
  recipientType: "all",
  customEmails: "",
  recipientUserIds: [],
  scheduleTime: "",
  isScheduled: false,
  attachments: [],
  existingAttachments: [],
};

const formatFileSize = (bytes = 0) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const EmailBroadcast = () => {
  const queryClient = useQueryClient();
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
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [showRecipientsModal, setShowRecipientsModal] = useState(false);
  const [currentEmail, setCurrentEmail] = useState(null);
  const [modalType, setModalType] = useState("");
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [viewEmailDetails, setViewEmailDetails] = useState(null);
  const [editorKey, setEditorKey] = useState("new");

  // 🔥 View Details Handler
  const handleViewDetails = useCallback((item) => {
    setViewEmailDetails(item);
    setShowViewDetailsModal(true);
  }, []);

  // 🔥 Close View Details Handler
  const handleCloseViewDetails = useCallback(() => {
    setShowViewDetailsModal(false);
    setViewEmailDetails(null);
  }, []);
  // Modal Handlers
  const handleViewAttachments = (email) => {
    setCurrentEmail(email);
    setModalType("attachments");
    setShowAttachmentsModal(true);
  };

  const handleViewRecipients = (email) => {
    setCurrentEmail(email);
    setModalType("all-recipients");
    setShowRecipientsModal(true);
  };

  const handleViewBounced = (email) => {
    setCurrentEmail(email);
    setModalType("bounced");
    setShowRecipientsModal(true);
  };

  const handleViewReceived = (email) => {
    setCurrentEmail(email);
    setModalType("received");
    setShowRecipientsModal(true);
  };

  // Filter recipients based on modal type
  const getFilteredRecipients = () => {
    if (!currentEmail || !currentEmail.recipientDetails) return [];

    switch (modalType) {
      case "bounced":
        return currentEmail.recipientDetails.filter(
          (recipient) => recipient.status === "bounced",
        );
      case "received":
        return currentEmail.recipientDetails.filter(
          (recipient) => recipient.status === "delivered",
        );
      case "all-recipients":
      default:
        return currentEmail.recipientDetails;
    }
  };

  // Get modal title
  const getModalTitle = () => {
    const baseTitle = `Email #${currentEmail?.id}`;
    switch (modalType) {
      case "attachments":
        return `Attachments - ${baseTitle}`;
      case "bounced":
        return `Bounced Emails - ${baseTitle}`;
      case "received":
        return `Received Emails - ${baseTitle}`;
      case "all-recipients":
      default:
        return `All Recipients - ${baseTitle}`;
    }
  };

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
  } = useEmailBroadcastFilters(itemsPerPage);

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
    resolver: zodResolver(emailBroadcastSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  const listQueryKey = ["email-broadcasts", "company", queryParams];

  const { data: responseData, isFetching } = useQuery({
    queryKey: listQueryKey,
    queryFn: () => fetchCompanyEmailBroadcasts(queryParams),
  });

  const saveMutation = useMutation({
    mutationFn: (values) => {
      const added = (values.attachments || []).map((file) => ({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.name?.split(".").pop()?.toLowerCase() || "file",
      }));
      return saveCompanyEmailBroadcast({
        id: values.id || undefined,
        subject: values.subject,
        message: values.message,
        recipientType: values.recipientType,
        customEmails: values.customEmails,
        recipientUserIds: values.recipientUserIds || [],
        isScheduled: Boolean(values.isScheduled),
        scheduleTime: values.scheduleTime,
        attachmentDetails: [...(values.existingAttachments || []), ...added],
      });
    },
    onSuccess: (_data, values) => {
      toaster(
        values?.isScheduled
          ? "Broadcast scheduled"
          : values?.id
            ? "Broadcast updated"
            : "Broadcast sent",
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["email-broadcasts", "company"] });
      handleClose();
    },
    onError: (error) => helpers.handleApiValidationError(error, setError),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompanyEmailBroadcast,
    onSuccess: () => {
      toaster("Broadcast deleted", "success");
      queryClient.invalidateQueries({ queryKey: ["email-broadcasts", "company"] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: sendCompanyEmailBroadcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-broadcasts", "company"] });
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
      // If it's a Set, replace the entire selection
      setSelectedRows(idOrSet);
    } else {
      // If it's an ID, toggle that specific row
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
      // Deselect all
      setSelectedRows(new Set());
    } else {
      // Select all
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
        text: "Please select both an action and recipients",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const selectedIds = Array.from(selectedRows);

    try {
      switch (bulkAction) {
        case "send":
          await Promise.all(selectedIds.map((id) => sendMutation.mutateAsync(id)));
          toaster("Selected broadcasts sent", "success");
          clearSelection();
          break;
        case "delete":
          Swal.fire({
            title: "Confirm Delete",
            text: `Are you sure you want to delete ${selectedIds.length} emails?`,
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
              // refetch();
              clearSelection();
            }
          });
          return;
        default:
          break;
      }

      clearSelection();
      setBulkAction("");
    } catch (error) {
      console.error("Bulk action error:", error);
    }
  }, [
    bulkAction,
    selectedRows,
    sendMutation,
    deleteMutation,
    // refetch,
    clearSelection,
  ]);

  // 🧠 Build filter config
  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search by Subject, Recipient...",
    },
    {
      component: "select",
      name: "status",
      label: "Status",
      options: [
        { value: "sent", label: "Sent" },
        { value: "draft", label: "Draft" },
        { value: "scheduled", label: "Scheduled" },
        { value: "failed", label: "Failed" },
      ],
      placeholder: "Filter by Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "recipientType",
      label: "Recipient Type",
      options: [
        { value: "all", label: "All Users" },
        { value: "selected", label: "Selected Users" },
        { value: "custom", label: "Custom Emails" },
      ],
      placeholder: "Filter by Type",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
    },
  ];

  // 📝 Send Email handler
  const submitForm = async (values) => {
    await saveMutation.mutateAsync(values);
  };

  // 📝 Edit handler
  const handleEdit = useCallback(
    (item) => {
      reset({
        id: item.id,
        templateId: item.templateId || "",
        subject: item.subject,
        message: item.message,
        recipientType: item.recipientType,
        customEmails: item.customEmails || "",
        recipientUserIds: (item.recipientDetails || [])
          .map((person) => person.userId)
          .filter(Boolean),
        scheduleTime: item.scheduleTime
          ? new Date(item.scheduleTime).toISOString()
          : "",
        isScheduled: item.isScheduled || false,
        attachments: [],
        existingAttachments: item.attachmentDetails || [],
      });
      setEditorKey(`edit-${item.id}-${Date.now()}`);
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
            // refetch();
          } catch (error) {
            console.error("Error deleting email:", error);
          }
        }
      });
    },
    [
      deleteMutation,
      // refetch
    ],
  );

  // ➕ Add new email handler
  const handleNewEmail = useCallback(() => {
    reset(initialValues);
    setEditorKey(`new-${Date.now()}`);
    setShowModal(true);
  }, [reset]);

  // 🧠 ---------- TABLE ----------
  const columns = useEmailBroadcastTableColumn({
    handleEdit,
    handleViewDetails,
    handleDelete,
    selectedRows,
    toggleRowSelection,
    toggleAllRows,
    onViewAttachments: handleViewAttachments,
    onViewRecipients: handleViewRecipients,
    onViewBounced: handleViewBounced,
    onViewReceived: handleViewReceived,
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
    sendMutation.isPending;

  const isEditing = watch("id") !== 0;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-2xl">Email Broadcast</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Compose a broadcast from a company email template, then send or schedule it.
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
          <ButtonTw onClick={handleNewEmail} variant="blue" className="gap-2">
            <BiPlus /> Compose Email
          </ButtonTw>
        </div>
      </div>

      {/* View Details Modal */}

      <EmailBroadCastViewDetailsModal
        showModal={showViewDetailsModal}
        onClose={handleCloseViewDetails}
        emailDetails={viewEmailDetails}
      />
      {/* Compose Email Modal */}
      <AddOrUpdateEmailBroadCastModal
        showModal={showModal}
        handleClose={handleClose}
        isEditing={isEditing}
        control={control}
        watch={watch}
        setValue={setValue}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        isLoading={isLoading}
        editorKey={editorKey}
        onEditorKeyChange={setEditorKey}
      />
      {/* Attachments Modal */}
      <EmailBroadCastShowAttachmentModal
        showAttachmentsModal={showAttachmentsModal}
        setShowAttachmentsModal={setShowAttachmentsModal}
        currentEmail={currentEmail}
        getModalTitle={getModalTitle}
      />

      {/* Recipients Modal */}
      <EmailBroadCastShowRecipientsModal
        showRecipientsModal={showRecipientsModal}
        setShowRecipientsModal={setShowRecipientsModal}
        getFilteredRecipients={getFilteredRecipients}
        getModalTitle={getModalTitle}
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

      {/* Bulk Actions Bar */}
      {selectedRows.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                {selectedRows.size} email(s) selected
              </span>

              <SelectSearch
                value={bulkAction}
                onChange={setBulkAction}
                options={[
                  { value: "send", label: "Send Selected" },
                  { value: "delete", label: "Delete Selected" },
                  { value: "archive", label: "Archive Selected" },
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
                <BiSend /> Apply Action
              </ButtonTw>
            </div>

            <ButtonTw onClick={clearSelection} variant="outline" size="sm">
              Clear Selection
            </ButtonTw>
          </div>
        </div>
      )}
      {/* Email Broadcast Table */}
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

export default EmailBroadcast;
