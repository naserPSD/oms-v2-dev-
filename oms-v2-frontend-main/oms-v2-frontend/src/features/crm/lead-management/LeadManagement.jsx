"use client";
import Pagination from "@/components/common/Pagination";
import DataFilter from "@/components/common/DataFilter";
import ButtonTw from "@/components/ui/ButtonTw";
import CardWithAvatars from "@/components/ui/CardWithAvatars";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import { zodResolver } from "@/utils/zodResolver";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  FileSpreadsheet,
  Filter,
  Users,
  Printer,
} from "lucide-react";
import Swal from "sweetalert2";
import { z } from "zod";
import * as XLSX from "xlsx";

import CommonTable from "@/components/common/CommonTable";
import { BiMailSend, BiPlus, BiTrash, BiUserCheck } from "react-icons/bi";
import { useLeadFilters } from "./hooks/useLeadFilters";
import { useLeadTableColumns } from "./hooks/useLeadTableColumns";
import AddOrUpdateLeadsModal from "./modals/AddOrUpdateLeadsModal";
import AssignLeadModal from "./modals/AssignLeadModal";
import ExcelHubModal from "./modals/ExcelHubModal";
import LeadPrintModal from "./modals/LeadPrintModal";
import helpers from "@/utils/helpers";

// Use a function to create initial values to ensure it's stable
const getInitialValues = () => ({
  id: "",
  leadType: "",
  name: "",
  companyType: "",
  website: "",
  priorityStatus: "",
  clientStatus: "",
  leadSource: "",
  dealValue: 0,
  assignedTo: "",
  // Key Contact Info
  contactName: "",
  contactEmail: "",
  contactDepartment: "",
  contactDesignation: "",
  contactPhone: "",
  contactAlternativePhone: "",
  leadStatus: "Active",
  notes: "",
});

const initialValues = getInitialValues();

const schema = z.object({
  id: z.string().optional(),
  leadType: z
    .string({ required_error: "Lead type is required" })
    .trim()
    .min(1, "Lead type is required"),
  name: z
    .string({ required_error: "Company name is required" })
    .trim()
    .min(1, "Company name is required"),
  companyType: z
    .string({ required_error: "Company type is required" })
    .trim()
    .min(1, "Company type is required"),
  website: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        const urlPattern =
          /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i;
        return urlPattern.test(val);
      },
      {
        message: "Please enter a valid URL (e.g., https://example.com or example.com)",
      }
    )
    .optional()
    .or(z.literal("")),
  priorityStatus: z.string().optional(),
  clientStatus: z.string().optional(),
  leadSource: z.string().optional(),
  dealValue: z
    .union([
      z.coerce.number().min(0, "Deal value must be positive"),
      z.literal(""),
      z.undefined(),
    ])
    .optional(),
  assignedTo: z.string().optional(),
  // Key Contact Info
  contactName: z.string().optional(),
  contactEmail: z
    .union([
      z.string().email("Invalid email address"),
      z.literal(""),
      z.undefined(),
    ])
    .optional(),
  contactDepartment: z.string().optional(),
  contactDesignation: z.string().optional(),
  contactPhone: z.string().optional(),
  contactAlternativePhone: z.string().optional(),
  leadStatus: z.string().optional(),
  notes: z.string().optional(),
});

const LeadManagement = () => {
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLeadForAssignment, setSelectedLeadForAssignment] =
    useState(null);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedLeads, setSelectedLeads] = useState([]);

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
  } = useLeadFilters(itemsPerPage);

  const { reset, handleSubmit, control, watch, setError, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const isClientView =
    filters?.leadStatus === "Converted" ||
    searchParams?.get("leadStatus") === "Converted";

  const handleOpenAddModal = useCallback(() => {
    const isClient =
      filters?.leadStatus === "Converted" ||
      searchParams?.get("leadStatus") === "Converted";
    const isFollowup =
      filters?.leadStatus === "In Process" ||
      searchParams?.get("leadStatus") === "In Process";

    reset({
      ...getInitialValues(),
      leadStatus: isClient ? "Converted" : isFollowup ? "In Process" : "Active",
      clientStatus: isClient ? "customer" : "lead",
    });
    setShowModal(true);
  }, [filters?.leadStatus, searchParams, reset]);

  const handleClose = useCallback(() => {
    setShowModal(false);
    const isClient =
      filters?.leadStatus === "Converted" ||
      searchParams?.get("leadStatus") === "Converted";
    const isFollowup =
      filters?.leadStatus === "In Process" ||
      searchParams?.get("leadStatus") === "In Process";

    reset({
      ...getInitialValues(),
      leadStatus: isClient ? "Converted" : isFollowup ? "In Process" : "Active",
      clientStatus: isClient ? "customer" : "lead",
    });
  }, [filters?.leadStatus, searchParams, reset]);

  // API hooks
  const {
    useLeadsQuery,
    useHrEmployeeQuery,
    addOrUpdateLeadMutation,
    deleteLeadMutation,
    bulkDeleteLeadsMutation,
    updateLeadStatusMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  // Fetch employees for assignment - get all active employees
  const { data: employeesResponse } = useHrEmployeeQuery({
    page: 1,
    limit: 1000, // Get a large number to fetch all employees
    isActive: true,
  });
  const employees = employeesResponse?.data || employeesResponse?.list || [];

  // Convert employees to SelectSearch options for Account Manager dropdown
  const employeeOptions = useMemo(() => {
    if (!employees || employees.length === 0) return [];

    return employees
      .map((employee) => {
        // Get user ID - prioritize user.id, fallback to user.userId or employee.id
        const userId =
          employee.user?.id?.toString() ||
          employee.user?.userId?.toString() ||
          employee.id?.toString() ||
          "";

        // Get user name
        const userName =
          employee.user?.fullName ||
          `${employee.user?.firstName || ""} ${employee.user?.lastName || ""}`.trim() ||
          "Unknown User";

        return {
          value: userId,
          label: userName,
        };
      })
      .filter((option) => option.value); // Filter out entries without valid IDs
  }, [employees]);

  // Dynamic lead source options from database status groups
  const leadSourceOptions = useMemo(() => {
    const group = dropdowns?.statusGroupList?.find(
      (s) => s.code === "lead_sources" || s.name?.toLowerCase().includes("lead source")
    );
    if (group?.statuses?.length > 0) {
      return group.statuses.map((s) => ({ value: s.name, label: s.name }));
    }
    return [
      { value: "LinkedIn", label: "LinkedIn" },
      { value: "Facebook", label: "Facebook" },
      { value: "Instagram", label: "Instagram" },
      { value: "Website", label: "Website" },
      { value: "Referral", label: "Referral" },
      { value: "Email", label: "Email" },
      { value: "Other", label: "Other" },
    ];
  }, [dropdowns?.statusGroupList]);

  // Create a map of user IDs to user names for quick lookup
  const userMap = useMemo(() => {
    const map = new Map();
    if (!employees || employees.length === 0) return map;

    employees.forEach((employee) => {
      if (employee.user) {
        // Try multiple ID fields and store all variations
        // assignedTo might store either user.id, user.userId, or employee.id
        const userIds = [
          employee.user.id?.toString(),
          employee.user.userId?.toString(),
          employee.user.id,
          employee.user.userId,
          employee.id?.toString(),
          employee.id,
          // Also try as numbers
          employee.user.id ? Number(employee.user.id) : null,
          employee.user.userId ? Number(employee.user.userId) : null,
          employee.id ? Number(employee.id) : null,
        ].filter((id) => id !== null && id !== undefined);

        const userInfo = {
          name: employee.user.fullName || "Unknown User",
          email: employee.user.email || "",
          designation: employee.designation?.name || "",
          profilePicture:
            employee.user.profile?.profilePicture?.fileUrl || null,
        };

        // Store with all possible ID variations for lookup
        userIds.forEach((id) => {
          if (id !== null && id !== undefined) {
            const idStr = String(id);
            map.set(idStr, userInfo);
            // Also store as number if it's a valid number
            const idNum = Number(id);
            if (!isNaN(idNum) && isFinite(idNum)) {
              map.set(idNum, userInfo);
            }
          }
        });
      }
    });

    return map;
  }, [employees]);



  const leadStatusOptions = useMemo(
    () => [
      { value: "Active", label: "Active" },
      { value: "In Process", label: "In Process" },
      { value: "Converted", label: "Converted" },
    ],
    [],
  );

  const filterConfig = useMemo(
    () => [
      {
        component: "input",
        name: "search",
        label: "Search",
        placeholder: "Search company, contact, email...",
      },
      {
        component: "input",
        name: "company",
        label: "Company",
        placeholder: "Filter by company name",
        hideIcon: true,
      },
      {
        component: "input",
        name: "contact",
        label: "Contact Person",
        placeholder: "Filter by contact name",
        hideIcon: true,
      },
      {
        component: "select",
        name: "leadSource",
        label: "Source",
        options: leadSourceOptions,
        placeholder: "Select lead source",
      },
      {
        component: "number",
        name: "dealValue",
        label: "Deal Value",
        placeholder: "Filter by minimum deal value",
      },
      {
        component: "select",
        name: "accountManager",
        label: "Account Manager",
        options: employeeOptions,
        placeholder: "Search and Select Account Manager",
      },
      {
        component: "select",
        name: "leadStatus",
        label: "Select Status",
        options: leadStatusOptions,
        placeholder: "Filter by Status",
      },
      { component: "clear", label: "Clear Filters" },
    ],
    [employeeOptions, leadSourceOptions, leadStatusOptions],
  );

  // React Query for data fetching
  const {
    data: responseData,
    isLoading: isFetching,
    refetch,
  } = useLeadsQuery(queryParams);

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  const leadsData = useMemo(() => {
    if (!responseData) return {};
    if (
      responseData.data &&
      typeof responseData.data === "object" &&
      !Array.isArray(responseData.data)
    ) {
      return responseData.data;
    }
    return responseData;
  }, [responseData]);

  const listData = useMemo(() => {
    if (Array.isArray(leadsData?.list)) return leadsData.list;
    if (Array.isArray(leadsData)) return leadsData;
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData)) return responseData;
    return [];
  }, [leadsData, responseData]);

  const headersData = useMemo(
    () => leadsData?.headers || responseData?.headers || responseData?.data?.headers || {},
    [leadsData?.headers, responseData?.headers, responseData?.data?.headers],
  );

  const pagination = useMemo(() => {
    return (
      responseData?.data?.pagination ||
      responseData?.pagination ||
      leadsData?.pagination || {
        page: 1,
        total: 0,
        limit: itemsPerPage,
        lastPage: 1,
        resultRows: 0,
      }
    );
  }, [responseData, leadsData, itemsPerPage]);

  const total = pagination?.total ?? listData.length;

  // Enhance headers data users with userMap for accurate names & avatars
  const enhancedHeadersData = useMemo(() => {
    const cleanUrl = (url) => {
      if (!url || typeof url !== "string") return null;
      const trimmed = url.trim();
      if (
        trimmed.startsWith("undefined") ||
        trimmed.includes("/static/undefined/") ||
        trimmed === "null" ||
        trimmed === "undefined"
      ) {
        return null;
      }
      return trimmed;
    };

    const enhanceUsers = (users = []) => {
      return (users || []).map((u) => {
        const info = userMap.get(String(u.id)) || userMap.get(Number(u.id));
        const rawUrl = info?.profilePicture || u.fileUrl || null;
        return {
          id: u.id,
          name: info?.name || u.name || `User ${u.id}`,
          fileUrl: cleanUrl(rawUrl),
        };
      });
    };

    return {
      lead: {
        count: headersData?.lead?.count ?? 0,
        users: enhanceUsers(headersData?.lead?.users),
      },
      client: {
        count: headersData?.client?.count ?? 0,
        users: enhanceUsers(headersData?.client?.users),
      },
      followup: {
        count: headersData?.followup?.count ?? 0,
        users: enhanceUsers(headersData?.followup?.users),
      },
    };
  }, [headersData, userMap]);

  // Transform API response to match expected format
  const transformedListData = useMemo(() => {
    return listData.map((lead) => {
      // Ensure id and _id are always strings - handle MongoDB ObjectId objects
      let leadId = "";
      let leadIdUnderscore = "";

      // Helper function to safely convert to string
      const safeToString = (value) => {
        if (!value) return "";
        if (typeof value === "string") return value;
        if (value && typeof value.toString === "function") {
          const str = value.toString();
          // Reject if toString() returns "[object Object]" or other invalid strings
          if (
            str &&
            str !== "[object Object]" &&
            str !== "undefined" &&
            str !== "null"
          ) {
            return str;
          }
        }
        const str = String(value);
        return str &&
          str !== "[object Object]" &&
          str !== "undefined" &&
          str !== "null"
          ? str
          : "";
      };

      if (lead._id) {
        leadIdUnderscore = safeToString(lead._id);
      }

      if (lead.id) {
        leadId = safeToString(lead.id);
      }

      // Use _id if available, otherwise use id
      const finalId = leadIdUnderscore || leadId;

      return {
        ...lead,
        id: finalId,
        _id: leadIdUnderscore,
        // Company name (for Company column and search)
        name: lead.name || "",
        company: lead.name || "",
        // Key contact info (for Info column)
        contactName: lead.contactName || "",
        contactPhone: lead.contactPhone || "",
        leadInfo: {
          name: lead.contactName || "",
          phone: lead.contactPhone || "",
          avatar: "",
        },
        leadStatus:
          typeof lead.leadStatus === "string"
            ? { name: lead.leadStatus, color: "success" }
            : lead.leadStatus,
        assignedTo: lead.assignedTo || "", // User ID as string (from MySQL)
      };
    });
  }, [listData]);

  // Enhanced list data with selection
  const enhancedListData = useMemo(() => {
    return transformedListData.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [transformedListData, currentPage, itemsPerPage]);

  // Update selected leads when row selection changes
  useEffect(() => {
    const selectedItems = enhancedListData.filter(
      (_, index) => rowSelection[index],
    );
    setSelectedLeads(selectedItems);
  }, [rowSelection, enhancedListData]);

  // Form submission
  const submitForm = async (values) => {
    // Normalize empty strings to undefined for optional fields
    const normalizedValues = {
      ...values,
      website: values.website?.trim() || undefined,
      contactEmail: values.contactEmail?.trim() || undefined,
    };

    // Prepare the payload with new structure
    const payload = {
      ...normalizedValues,
    };

    // Remove undefined values to avoid sending them to the API
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    // If contact info is provided and this is a new lead, add it to contacts array
    if (normalizedValues.contactName) {
      payload.contacts = [
        {
          name: normalizedValues.contactName,
          email: normalizedValues.contactEmail,
          department: normalizedValues.contactDepartment,
          designation: normalizedValues.contactDesignation,
          phone: normalizedValues.contactPhone,
          alternativePhone: normalizedValues.contactAlternativePhone,
        },
      ];
    }

    // Ensure proper status if adding from a filtered view or based on clientStatus
    const isClient =
      filters?.leadStatus === "Converted" ||
      searchParams?.get("leadStatus") === "Converted" ||
      ["customer", "partner", "vendor"].includes(values.clientStatus) ||
      values.leadStatus === "Converted";

    const isFollowup =
      filters?.leadStatus === "In Process" ||
      searchParams?.get("leadStatus") === "In Process" ||
      values.leadStatus === "In Process" ||
      values.leadStatus === "Follow Up";

    if (!values.id) {
      if (isClient) {
        payload.leadStatus = "Converted";
        if (
          !payload.clientStatus ||
          payload.clientStatus === "lead" ||
          payload.clientStatus === "prospect"
        ) {
          payload.clientStatus = "customer";
        }
      } else if (isFollowup) {
        payload.leadStatus = "In Process";
        if (!payload.clientStatus) {
          payload.clientStatus = "prospect";
        }
      } else {
        payload.leadStatus = values.leadStatus || "Active";
        if (!payload.clientStatus) {
          payload.clientStatus = "lead";
        }
      }
    } else {
      if (isClient) {
        payload.leadStatus = "Converted";
      }
    }

    console.log("Submitting lead with payload:", payload);
    // Let the mutation handle success/error - don't catch here to avoid double handling
    await addOrUpdateLeadMutation.mutateAsync(payload);
  };

  // Delete handler
  const handleDelete = useCallback(
    async (id) => {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        customClass: {
          popup: "swal-popup",
          confirmButton: "swal-confirm-btn",
          cancelButton: "swal-cancel-btn",
        },
        buttonsStyling: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteLeadMutation.mutateAsync(id);
            refetch();
          } catch (error) {
            console.error("Error deleting lead:", error);
          }
        }
      });
    },
    [deleteLeadMutation],
  );

  // Bulk delete handler
  const handleBulkDelete = useCallback(async () => {
    if (selectedLeads.length === 0) return;

    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedLeads.length} lead(s). This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal-popup",
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const leadIds = selectedLeads.map((lead) => lead._id || lead.id);
          await bulkDeleteLeadsMutation.mutateAsync(leadIds);
          setRowSelection({});
          refetch();
        } catch (error) {
          console.error("Error bulk deleting leads:", error);
        }
      }
    });
  }, [selectedLeads, bulkDeleteLeadsMutation, refetch]);

  // Bulk status update handler
  const handleBulkStatusUpdate = useCallback(
    async (status) => {
      if (selectedLeads.length === 0) return;

      try {
        const leadIds = selectedLeads.map((lead) => lead._id || lead.id);
        await updateLeadStatusMutation.mutateAsync({ leadIds, status });
        setRowSelection({});
        refetch();
      } catch (error) {
        console.error("Error updating lead status:", error);
      }
    },
    [selectedLeads, updateLeadStatusMutation, refetch],
  );

  // Edit handler
  const handleEdit = useCallback(
    (item) => {
      const itemId =
        item._id?.toString() || item.id?.toString() || item._id || item.id;
      reset({
        id: typeof itemId === "string" ? itemId : String(itemId),
        // New form fields
        leadType: item.leadType || "",
        name: item.name || "",
        companyType: item.companyType || "",
        website: item.website || "",
        priorityStatus: item.priorityStatus || "",
        clientStatus: item.clientStatus || "",
        leadSource: item.leadSource || "",
        dealValue: item.dealValue || 0,
        assignedTo: item.assignedTo?.toString() || "",
        // Key Contact Info
        contactName: item.contactName || "",
        contactEmail: item.contactEmail || "",
        contactDepartment: item.contactDepartment || "",
        contactDesignation: item.contactDesignation || "",
        contactPhone: item.contactPhone || "",
        contactAlternativePhone: item.contactAlternativePhone || "",
        leadStatus:
          typeof item.leadStatus === "string"
            ? item.leadStatus
            : item.leadStatus?.name || "Active",
        notes: item.notes || "",
      });
      setShowModal(true);
    },
    [reset],
  );

  // Status change handler for single lead
  const handleStatusChange = useCallback(
    async (leadId, newStatus) => {
      try {
        await updateLeadStatusMutation.mutateAsync({
          leadIds: [leadId],
          status: newStatus,
        });
        // Success message is shown in mutation onSuccess, but we show it here for immediate feedback
        // The mutation's onSuccess was removed to prevent duplicate messages
        helpers.toaster("Lead status updated successfully", "success");
        refetch();
      } catch (error) {
        console.error("Error updating lead status:", error);
        helpers.toaster("Failed to update lead status", "error");
      }
    },
    [updateLeadStatusMutation, refetch],
  );

  // Assign lead handler - opens the modal
  const handleAssignLead = useCallback((lead) => {
    setSelectedLeadForAssignment(lead);
    setShowAssignModal(true);
  }, []);

  // Actually assign the lead to a user
  const handleAssign = useCallback(
    async (leadId, userId) => {
      try {
        const leadIdString =
          typeof leadId === "string" ? leadId : String(leadId);
        await addOrUpdateLeadMutation.mutateAsync({
          id: leadIdString,
          assignedTo: userId.toString(),
        });
        setShowAssignModal(false);
        setSelectedLeadForAssignment(null);
        refetch();
      } catch (error) {
        console.error("Error assigning lead:", error);
      }
    },
    [addOrUpdateLeadMutation, refetch],
  );

  // Handle batch import from Excel sheet
  const handleImportLeads = useCallback(
    async (importedLeads) => {
      if (!importedLeads || importedLeads.length === 0) return;
      for (const lead of importedLeads) {
        try {
          await addOrUpdateLeadMutation.mutateAsync({
            name: lead.name,
            contactName: lead.contactName,
            contactEmail: lead.contactEmail,
            contactPhone: lead.contactPhone,
            website: lead.website,
            leadSource: lead.leadSource,
            priorityStatus: lead.priorityStatus,
            clientStatus: lead.leadStatus || "New Lead",
            dealValue: Number(lead.dealValue || 0),
            notes: lead.notes,
          });
        } catch (err) {
          console.error("Error creating imported lead:", lead.name, err);
        }
      }
      refetch?.();
    },
    [addOrUpdateLeadMutation, refetch]
  );

  // Export leads to Excel
  const handleExportToExcel = useCallback(() => {
    try {
      // Use the filtered data that's currently visible in the table
      const exportData = transformedListData.map((lead, index) => {
        const statusName =
          typeof lead.leadStatus === "string"
            ? lead.leadStatus
            : lead.leadStatus?.name || "Active";

        // Get assigned user name from userMap
        const assignedToId = lead.assignedTo;
        const assignedUser = assignedToId
          ? userMap.get(String(assignedToId)) ||
          userMap.get(Number(assignedToId)) ||
          employees.find((emp) => {
            const userId =
              emp.user?.id?.toString() || emp.user?.userId?.toString();
            const empId = emp.id?.toString();
            return (
              userId === String(assignedToId) ||
              empId === String(assignedToId)
            );
          })?.user
          : null;

        return {
          SL: index + 1,
          // New form fields
          "Lead Type": lead.leadType || "",
          Name: lead.name || "",
          "Company Type": lead.companyType || "",
          Website: lead.website || "",
          "Priority Status": lead.priorityStatus || "",
          "Client Status": lead.clientStatus || "",
          Source: lead.leadSource || "",
          "Deal Value": lead.dealValue || 0,
          // Key Contact Info
          "Contact Name": lead.contactName || "",
          "Contact Email": lead.contactEmail || "",
          "Contact Department": lead.contactDepartment || "",
          "Contact Designation": lead.contactDesignation || "",
          "Contact Phone": lead.contactPhone || "",
          "Contact Alt Phone": lead.contactAlternativePhone || "",
          Status: statusName,
          "Assigned To":
            assignedUser?.name ||
            assignedUser?.fullName ||
            (assignedToId ? `User ${assignedToId}` : "Unassigned"),
          "Last Contact": lead.lastContact
            ? helpers.dDate(lead.lastContact)
            : "Never",
          Notes: lead.notes || "",
          "Created At": lead.createdAt ? helpers.dDate(lead.createdAt) : "",
          "Updated At": lead.updatedAt ? helpers.dDate(lead.updatedAt) : "",
        };
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 5 }, // SL
        { wch: 12 }, // Lead Type
        { wch: 20 }, // Name
        { wch: 15 }, // Company Type
        { wch: 20 }, // Website
        { wch: 15 }, // Priority Status
        { wch: 15 }, // Client Status
        { wch: 15 }, // Source
        { wch: 12 }, // Deal Value
        { wch: 18 }, // Contact Name
        { wch: 25 }, // Contact Email
        { wch: 15 }, // Contact Department
        { wch: 15 }, // Contact Designation
        { wch: 15 }, // Contact Phone
        { wch: 15 }, // Contact Alt Phone
        { wch: 15 }, // Status
        { wch: 20 }, // Assigned To
        { wch: 15 }, // Last Contact
        { wch: 30 }, // Notes
        { wch: 18 }, // Created At
        { wch: 18 }, // Updated At
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Leads");

      // Generate filename with current date
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `Leads_Export_${dateStr}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);

      helpers.toaster(
        `Exported ${exportData.length} lead(s) to Excel successfully`,
        "success",
      );
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      helpers.toaster("Failed to export leads to Excel", "error");
    }
  }, [transformedListData, userMap, employees]);

  // TanStack Table columns
  const columns = useLeadTableColumns({
    handleStatusChange,
    handleEdit,
    handleDelete,
    handleAssignLead,
    userMap,
    employees,
  });

  // Combine search and dealValue filters for global filtering
  const combinedGlobalFilter = useMemo(() => {
    const searchTerm = globalFilter || "";
    const dealValueTerm = filters.dealValue || "";

    // Combine both terms
    const terms = [searchTerm, dealValueTerm].filter(Boolean);
    return terms.join(" ");
  }, [globalFilter, filters.dealValue]);

  // Create TanStack Table instance with row selection
  // Server-side filtering and pagination via queryParams and useLeadsQuery
  const table = useReactTable({
    data: enhancedListData,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualFiltering: true,
    pageCount: pagination?.lastPage || Math.ceil((total || 1) / itemsPerPage) || 1,
    enableRowSelection: true,
    columnResizeDirection: "rtl",
  });

  const isLoading =
    isFetching ||
    addOrUpdateLeadMutation?.isLoading ||
    deleteLeadMutation?.isLoading ||
    bulkDeleteLeadsMutation?.isLoading ||
    updateLeadStatusMutation?.isLoading;

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/20 dark:from-blue-500/20 dark:to-indigo-500/30 rounded-2xl border border-blue-200/60 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="title-color font-bold text-2xl tracking-tight">Lead Management</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                {total || 0} Total
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Track customer pipeline, manage interactions, and assign sales representatives.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <SimpleTooltip text="Excel Hub: Upload Sheet, Demo & Export">
            <ButtonTw
              onClick={() => setShowExcelModal(true)}
              variant="outline"
              size="sm"
              className="gap-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500 transition-all font-medium"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Excel</span>
            </ButtonTw>
          </SimpleTooltip>

          <SimpleTooltip text="Print Leads Document">
            <ButtonTw
              onClick={() => setShowPrintModal(true)}
              variant="outline"
              size="sm"
              className="gap-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-500 transition-all font-medium"
            >
              <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Print</span>
            </ButtonTw>
          </SimpleTooltip>

          <ButtonTw
            onClick={() => toggleFilter()}
            variant={showFilter === "show" ? "primary" : "alternative"}
            className="gap-2 transition-all"
            size="sm"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </ButtonTw>

          <ButtonTw
            onClick={handleOpenAddModal}
            variant="blue"
            className="gap-2 shadow-xs hover:shadow-sm transition-all"
            size="sm"
          >
            <BiPlus className="w-4 h-4" />
            <span>{isClientView ? "Add Client" : "Add Lead"}</span>
          </ButtonTw>
        </div>
      </div>

      <DataFilter
        compact
        showFilter={showFilter === "show"}
        filters={{ ...filters, search: globalFilter || "" }}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      {/* ── KPI cards sit under the filter ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => handleFilterChange("leadStatus", "")}
          className={`cursor-pointer transition-all duration-200 rounded-xl ${!filters.leadStatus
            ? "ring-2 ring-blue-500/70 shadow-sm"
            : "hover:translate-y-[-2px] opacity-90 hover:opacity-100"
            }`}
          title="Click to view all leads"
        >
          <CardWithAvatars
            title="Total Leads"
            users={enhancedHeadersData?.lead?.users || []}
            count={enhancedHeadersData?.lead?.count || 0}
            borderColor="border-l-blue-500"
            bgColor="bg-blue-50 dark:bg-blue-900/20"
          />
        </div>
        <div
          onClick={() => handleFilterChange("leadStatus", "Converted")}
          className={`cursor-pointer transition-all duration-200 rounded-xl ${filters.leadStatus === "Converted"
            ? "ring-2 ring-emerald-500/70 shadow-sm"
            : "hover:translate-y-[-2px] opacity-90 hover:opacity-100"
            }`}
          title="Click to filter Converted Clients"
        >
          <CardWithAvatars
            title="Clients"
            users={enhancedHeadersData?.client?.users || []}
            count={enhancedHeadersData?.client?.count || 0}
            borderColor="border-l-emerald-500"
            bgColor="bg-emerald-50 dark:bg-emerald-900/20"
          />
        </div>
        <div
          onClick={() => handleFilterChange("leadStatus", "In Process")}
          className={`cursor-pointer transition-all duration-200 rounded-xl ${filters.leadStatus === "In Process"
            ? "ring-2 ring-amber-500/70 shadow-sm"
            : "hover:translate-y-[-2px] opacity-90 hover:opacity-100"
            }`}
          title="Click to filter In Process Follow-ups"
        >
          <CardWithAvatars
            title="Follow Up"
            users={enhancedHeadersData?.followup?.users || []}
            count={enhancedHeadersData?.followup?.count || 0}
            borderColor="border-l-amber-500"
            bgColor="bg-amber-50 dark:bg-amber-900/20"
          />
        </div>
      </div>

      {/* ── Bulk Actions Floating Bar ─────────────────────────── */}
      {selectedLeads.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                {selectedLeads.length} lead(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ButtonTw
                onClick={() => handleBulkStatusUpdate("Converted")}
                variant="success"
                size="sm"
                className="gap-1.5 shadow-2xs"
              >
                <BiUserCheck className="w-4 h-4" /> Convert ({selectedLeads.length})
              </ButtonTw>
              <ButtonTw variant="outline" size="sm" className="gap-1.5 bg-white dark:bg-gray-800 shadow-2xs">
                <BiMailSend className="w-4 h-4" /> Email ({selectedLeads.length})
              </ButtonTw>
              <ButtonTw
                onClick={handleBulkDelete}
                variant="red"
                size="sm"
                className="gap-1.5 shadow-2xs"
              >
                <BiTrash className="w-4 h-4" /> Delete ({selectedLeads.length})
              </ButtonTw>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Lead Modal */}
      <AddOrUpdateLeadsModal
        showModal={showModal}
        handleClose={handleClose}
        control={control}
        watch={watch}
        setValue={setValue}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        isLoading={isLoading}
        reset={reset}
        employees={employees}
        isClientView={isClientView}
      />

      {/* Leads Table Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
        <CommonTable
          table={table}
          isFetching={isLoading}
          itemsPerPage={itemsPerPage}
          columns={columns}
          hasActiveFilters={hasActiveFilters}
          enableRowSelection={true}
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Assign Lead Modal */}
      <AssignLeadModal
        showModal={showAssignModal}
        handleClose={() => {
          setShowAssignModal(false);
          setSelectedLeadForAssignment(null);
        }}
        lead={selectedLeadForAssignment}
        users={employees}
        onAssign={handleAssign}
        isLoading={addOrUpdateLeadMutation?.isLoading}
      />

      {/* Excel Hub Modal: Upload Excel Sheet, Demo & Template, Export */}
      {showExcelModal && (
        <ExcelHubModal
          showModal={showExcelModal}
          handleClose={() => setShowExcelModal(false)}
          onImportSuccess={handleImportLeads}
          allFilteredData={enhancedListData}
          currentPageData={enhancedListData}
          selectedRowsData={selectedLeads}
          userMap={userMap}
          employees={employees}
          isLoading={addOrUpdateLeadMutation?.isLoading}
        />
      )}

      {/* Print Document Modal with Real A4 Paper Preview Box */}
      {showPrintModal && (
        <LeadPrintModal
          showModal={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          allFilteredData={enhancedListData}
          currentPageData={enhancedListData}
          selectedRowsData={selectedLeads}
          userMap={userMap}
          employees={employees}
        />
      )}
    </div>
  );
};

export default LeadManagement;
