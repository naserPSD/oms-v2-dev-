"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ButtonTw from "@/components/ui/ButtonTw";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Calendar, Edit2, Globe, Mail, Phone, Tag, User, Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import helpers from "@/utils/helpers";
import { useRouter, useParams } from "next/navigation";
import AddOrUpdateLeadsModal from "../modals/AddOrUpdateLeadsModal";
import AssignLeadModal from "../modals/AssignLeadModal";
import LeadContacts from "../components/LeadContacts";
import LeadRemarks from "../components/LeadRemarks";
import LeadActivityLog from "../components/LeadActivityLog";
import LeadCommunications from "../components/LeadCommunications";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/utils/zodResolver";
import { z } from "zod";
import {
  LEAD_TYPES,
  COMPANY_TYPES,
  PRIORITY_STATUSES,
  CLIENT_STATUSES,
  LEAD_STATUSES,
  LEAD_SOURCES,
} from "../constants/leadConstants";

const schema = z
  .object({
    id: z.string().optional(),
    editSection: z.string().optional(),
    leadType: z.string().optional(),
    name: z.string().optional(),
    companyType: z.string().optional(),
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
    dealValue: z.coerce.number().min(0, "Deal value must be positive").optional(),
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
  })
  .superRefine((data, ctx) => {
    // Validate company fields when not exclusively editing contact section
    if (data.editSection !== "contact") {
      if (!data.leadType || !data.leadType.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["leadType"],
          message: "Lead type is required",
        });
      }
      if (!data.name || !data.name.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["name"],
          message: "Company name is required",
        });
      }
      if (!data.companyType || !data.companyType.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["companyType"],
          message: "Company type is required",
        });
      }
    }
  });

const initialValues = {
  id: "",
  leadType: "",
  name: "",
  companyType: "",
  website: "",
  priorityStatus: "",
  clientStatus: "",
  leadSource: "",
  dealValue: 0,
  contactName: "",
  contactEmail: "",
  contactDepartment: "",
  contactDesignation: "",
  contactPhone: "",
  contactAlternativePhone: "",
  leadStatus: "Active",
  notes: "",
};

export default function CrmLeadDetails() {
  const router = useRouter();
  // In Next.js 15, useParams() returns a promise that needs React.use()
  // But we're in a client component, so it should be synchronous
  // Use React.use() to properly unwrap params if it's a promise
  let params;
  try {
    params = React.use ? React.use(useParams()) : useParams();
  } catch (e) {
    // If React.use is not available or params is not a promise, use directly
    params = useParams();
  }

  const leadId = React.useMemo(() => {
    if (!params) return null;
    // Extract id safely - avoid enumerating params object
    // Use hasOwnProperty or 'in' operator instead of Object.keys
    if (typeof params === 'object' && params !== null) {
      return params.id || null;
    }
    return null;
  }, [params]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only running client-side effects after mount
  React.useEffect(() => {
    setIsMounted(true);
  }, []);


  const { reset, handleSubmit, control, watch, setError, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const {
    useLeadByIdQuery,
    useLeadActivitiesQuery,
    useCommunicationsQuery,
    addOrUpdateLeadMutation,
    createCommunicationMutation,
    updateCommunicationMutation,
    deleteCommunicationMutation,
    updateCommunicationStatusMutation,
    useHrEmployeeQuery,
    useUserListQuery,
  } = useHrQueryApi({
    reset,
    setError,
    handleClose: () => {
      // Only close modal if not editing a specific section (to allow manual control)
      if (!editSection) {
        setShowEditModal(false);
        setEditSection(null);
      }
    },
    setShowModal: setShowEditModal
  });

  // Fetch employees to get assigned user information
  const { data: employeesResponse } = useHrEmployeeQuery({
    page: 1,
    limit: 1000,
    isActive: true,
  });
  const employees = employeesResponse?.data || employeesResponse?.list || [];

  // Fetch all users from MySQL users table - use paginated endpoint to get full user objects
  const { useUsersQuery } = useCompanySettingsQueryApi({ reset, setError, handleClose: () => { }, setShowModal: () => { } });
  const { data: usersResponse } = useUsersQuery({ page: 1, limit: 1000 });
  // Handle response structure: { data: User[], pagination: {...} }
  const allUsers = usersResponse?.data || [];

  // Also fetch from get-all-users endpoint (returns { value, label } format) as fallback
  const { data: usersListResponse } = useUserListQuery();
  const usersList = usersListResponse?.data || usersListResponse || [];

  // Create a map of user IDs to user info for quick lookup
  // Include both employees and all users from MySQL
  const userMap = React.useMemo(() => {
    const map = new Map();

    // First, add all users from MySQL users table (full user objects from paginated endpoint)
    if (allUsers && Array.isArray(allUsers) && allUsers.length > 0) {
      allUsers.forEach((user) => {
        if (user && user.id) {
          const userIds = [
            user.id?.toString(),
            user.id,
            Number(user.id),
          ].filter((id) => id !== null && id !== undefined);

          const userInfo = {
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || "Unknown User",
            email: user.email || "",
            designation: "",
            profilePicture: user.profile?.profilePicture?.fileUrl || null,
          };

          // Store with all possible ID variations for lookup
          userIds.forEach((id) => {
            if (id !== null && id !== undefined) {
              const idStr = String(id);
              map.set(idStr, userInfo);
              const idNum = Number(id);
              if (!isNaN(idNum) && isFinite(idNum)) {
                map.set(idNum, userInfo);
              }
              const idStrTrimmed = idStr.trim();
              if (idStrTrimmed !== idStr) {
                map.set(idStrTrimmed, userInfo);
              }
            }
          });
        }
      });
    }

    // Also add users from get-all-users endpoint (CommonResponseDto format: { value: id, label: name })
    if (usersList && Array.isArray(usersList) && usersList.length > 0) {
      usersList.forEach((user) => {
        // Handle CommonResponseDto format: { value: id, label: name }
        if (user && user.value) {
          const userId = user.value;
          const userName = user.label || "Unknown User";

          // Only add if not already in map (to avoid overwriting full user objects)
          const userIdStr = String(userId);
          if (!map.has(userIdStr) && !map.has(Number(userId))) {
            const userIds = [
              userId?.toString(),
              userId,
              Number(userId),
            ].filter((id) => id !== null && id !== undefined);

            const userInfo = {
              name: userName,
              email: "",
              designation: "",
              profilePicture: null,
            };

            // Store with all possible ID variations for lookup
            userIds.forEach((id) => {
              if (id !== null && id !== undefined) {
                const idStr = String(id);
                map.set(idStr, userInfo);
                const idNum = Number(id);
                if (!isNaN(idNum) && isFinite(idNum)) {
                  map.set(idNum, userInfo);
                }
                const idStrTrimmed = idStr.trim();
                if (idStrTrimmed !== idStr) {
                  map.set(idStrTrimmed, userInfo);
                }
              }
            });
          }
        }
      });
    }

    // Then, add employees (this will override if there are duplicates, which is fine)
    if (employees && employees.length > 0) {
      employees.forEach((employee) => {
        if (employee.user) {
          // Try multiple ID fields and store all variations
          const userIds = [
            employee.user.id?.toString(),
            employee.user.userId?.toString(),
            employee.user.id,
            employee.user.userId,
            employee.id?.toString(),
            employee.id,
            employee.user.id ? Number(employee.user.id) : null,
            employee.user.userId ? Number(employee.user.userId) : null,
            employee.id ? Number(employee.id) : null,
          ].filter((id) => id !== null && id !== undefined);

          const userInfo = {
            name: employee.user.fullName || "Unknown User",
            email: employee.user.email || "",
            designation: employee.designation?.name || "",
            profilePicture: employee.user.profile?.profilePicture?.fileUrl || null,
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
              // Also store trimmed string version
              const idStrTrimmed = idStr.trim();
              if (idStrTrimmed !== idStr) {
                map.set(idStrTrimmed, userInfo);
              }
            }
          });
        }
      });
    }


    return map;
  }, [employees, allUsers, usersList]);

  // Fetch lead data
  const {
    data: leadResponse,
    isLoading: isLoadingLead,
    error: leadError,
    refetch: refetchLead,
  } = useLeadByIdQuery(leadId);

  // Fetch lead activities
  const {
    data: activitiesResponse,
    isLoading: isLoadingActivities,
    refetch: refetchActivities,
  } = useLeadActivitiesQuery(leadId);

  // Fetch communications (new separate table)
  const {
    data: communicationsResponse,
    isLoading: isLoadingCommunications,
    refetch: refetchCommunications,
  } = useCommunicationsQuery(leadId);

  // Handle response structure: API returns { message, data: {...} }
  // offlineHandler.get already extracts response.data, so leadResponse is { message, data: {...} }
  const lead = leadResponse?.data || leadResponse || {};

  // Extract activities from response
  // activitiesResponse structure: { message: '...', data: [...] } or just [...]
  let rawActivities = [];
  if (activitiesResponse) {
    if (Array.isArray(activitiesResponse)) {
      rawActivities = activitiesResponse;
    } else if (activitiesResponse.data && Array.isArray(activitiesResponse.data)) {
      rawActivities = activitiesResponse.data;
    } else if (activitiesResponse.data && typeof activitiesResponse.data === 'object' && !Array.isArray(activitiesResponse.data)) {
      // If data is an object, it might be wrapped
      rawActivities = [];
    }
  }


  // Filter out invalid/empty activities
  const allActivities = Array.isArray(rawActivities)
    ? rawActivities.filter(a => {
      // Must be a valid object with at least _id and some content
      if (!a || typeof a !== 'object' || Array.isArray(a)) return false;
      if (Object.keys(a).length === 0) return false; // Empty object
      const hasId = a._id || a.id;
      return hasId; // All activities need an ID
    })
    : [];

  const communications = React.useMemo(() => {
    if (!communicationsResponse) {
      return [];
    }

    if (Array.isArray(communicationsResponse)) {
      return communicationsResponse;
    }
    if (communicationsResponse?.data) {
      if (Array.isArray(communicationsResponse.data)) {
        return communicationsResponse.data;
      }
      if (communicationsResponse.data.communications && Array.isArray(communicationsResponse.data.communications)) {
        return communicationsResponse.data.communications;
      }
    }
    return [];
  }, [communicationsResponse]);

  // Helper function to get label from constants
  const getLabelFromConstant = (constantArray, value) => {
    if (!value) return 'N/A';
    if (!constantArray || !Array.isArray(constantArray)) return 'N/A';
    const item = constantArray.find(item => item.value === value);
    return item ? item.label : 'N/A';
  };

  // Helper function to safely extract ID as string
  const safeExtractId = (idValue) => {
    if (!idValue) return '';
    if (typeof idValue === 'string') return idValue;
    if (typeof idValue === 'number') return String(idValue);
    if (typeof idValue === 'object') {
      // Handle MongoDB ObjectId or other objects
      if (idValue.toString && typeof idValue.toString === 'function') {
        const str = idValue.toString();
        if (str && str !== '[object Object]' && str !== 'undefined' && str !== 'null') {
          return str;
        }
      }
      return idValue.id || idValue._id || '';
    }
    const str = String(idValue);
    return (str && str !== '[object Object]' && str !== 'undefined' && str !== 'null') ? str : '';
  };

  // Handle edit button click
  const handleEdit = (section) => {
    const leadId = safeExtractId(lead._id || lead.id);

    if (section === 'company') {
      reset({
        id: leadId,
        editSection: 'company',
        // Company form fields only
        leadType: lead.leadType || "",
        name: lead.name || "",
        companyType: lead.companyType || "",
        website: lead.website || "",
        priorityStatus: lead.priorityStatus || "",
        clientStatus: lead.clientStatus || "",
        leadSource: lead.leadSource || "",
        dealValue: lead.dealValue || 0,
        leadStatus: typeof lead.leadStatus === 'string' ? lead.leadStatus : lead.leadStatus?.name || "Active",
      });
      setEditSection(section);
      setShowEditModal(true);
    } else if (section === 'contact') {
      reset({
        id: leadId,
        editSection: 'contact',
        // Key Contact Info fields only
        contactName: lead.contactName || "",
        contactEmail: lead.contactEmail || "",
        contactDepartment: lead.contactDepartment || "",
        contactDesignation: lead.contactDesignation || "",
        contactPhone: lead.contactPhone || "",
        contactAlternativePhone: lead.contactAlternativePhone || "",
      });
      setEditSection(section);
      setShowEditModal(true);
    }
  };

  // Handle contacts
  const handleAddContact = async (contactData) => {
    try {
      // Ensure lead is loaded
      if (isLoadingLead || !lead) {
        helpers.toaster("Lead data is still loading. Please wait...", "info");
        return;
      }

      // Extract lead ID with priority: leadId (from params) > lead._id > lead.id
      let extractedId = '';
      if (leadId) {
        extractedId = safeExtractId(leadId);
      }
      if (!extractedId && lead?._id) {
        extractedId = safeExtractId(lead._id);
      }
      if (!extractedId && lead?.id) {
        extractedId = safeExtractId(lead.id);
      }

      if (!extractedId) {
        helpers.toaster("Invalid lead ID", "error");
        return;
      }

      const currentContacts = Array.isArray(lead.contacts) ? lead.contacts : [];
      const newContact = {
        name: contactData.name || "",
        email: contactData.email || "",
        department: contactData.department || "",
        designation: contactData.designation || "",
        phone: contactData.phone || "",
        alternativePhone: contactData.alternativePhone || "",
        createdAt: new Date(),
      };
      const updatedContacts = [...currentContacts, newContact];

      await addOrUpdateLeadMutation.mutateAsync({
        id: extractedId,
        contacts: updatedContacts,
      });

      // Refetch after successful mutation
      await refetchLead();

      // Show specific toast for contact operations (mutation's onSuccess is suppressed for contact-only updates)
      helpers.toaster("Contact added successfully", "success");
    } catch (error) {
      console.error("Error adding contact:", error);
      helpers.toaster("Failed to add contact", "error");
    }
  };

  const handleUpdateContact = async (index, contactData) => {
    try {
      // Ensure lead is loaded
      if (isLoadingLead || !lead) {
        helpers.toaster("Lead data is still loading. Please wait...", "info");
        return;
      }

      // Extract lead ID with priority: leadId (from params) > lead._id > lead.id
      let extractedId = '';
      if (leadId) {
        extractedId = safeExtractId(leadId);
      }
      if (!extractedId && lead?._id) {
        extractedId = safeExtractId(lead._id);
      }
      if (!extractedId && lead?.id) {
        extractedId = safeExtractId(lead.id);
      }

      if (!extractedId) {
        helpers.toaster("Invalid lead ID", "error");
        return;
      }

      const currentContacts = Array.isArray(lead.contacts) ? lead.contacts : [];
      const updatedContacts = [...currentContacts];
      // Preserve createdAt and createdBy from existing contact
      updatedContacts[index] = {
        ...contactData,
        createdAt: updatedContacts[index]?.createdAt || new Date(),
        createdBy: updatedContacts[index]?.createdBy,
      };

      await addOrUpdateLeadMutation.mutateAsync({
        id: extractedId,
        contacts: updatedContacts,
      });

      await refetchLead();

      // Show specific toast for contact operations (mutation's onSuccess is suppressed for contact-only updates)
      helpers.toaster("Contact updated successfully", "success");
    } catch (error) {
      console.error("Error updating contact:", error);
      helpers.toaster("Failed to update contact", "error");
    }
  };

  const handleDeleteContact = async (index) => {
    try {
      // Ensure lead is loaded
      if (isLoadingLead || !lead) {
        helpers.toaster("Lead data is still loading. Please wait...", "info");
        return;
      }

      // Extract lead ID with priority: leadId (from params) > lead._id > lead.id
      let extractedId = '';
      if (leadId) {
        extractedId = safeExtractId(leadId);
      }
      if (!extractedId && lead?._id) {
        extractedId = safeExtractId(lead._id);
      }
      if (!extractedId && lead?.id) {
        extractedId = safeExtractId(lead.id);
      }

      if (!extractedId) {
        helpers.toaster("Invalid lead ID", "error");
        return;
      }

      const currentContacts = Array.isArray(lead.contacts) ? lead.contacts : [];
      const updatedContacts = currentContacts.filter((_, i) => i !== index);

      await addOrUpdateLeadMutation.mutateAsync({
        id: extractedId,
        contacts: updatedContacts,
      });

      await refetchLead();

      // Show specific toast for contact operations (mutation's onSuccess is suppressed for contact-only updates)
      helpers.toaster("Contact deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting contact:", error);
      helpers.toaster("Failed to delete contact", "error");
    }
  };

  // Handle assign lead
  const handleAssign = React.useCallback(
    async (leadIdFromModal, userId) => {
      try {
        // Ensure lead is loaded before proceeding - check if lead has actual data
        const hasLeadData = lead && (lead._id || lead.id || Object.keys(lead).length > 0);
        if (isLoadingLead || !hasLeadData) {
          helpers.toaster("Lead data is still loading. Please wait...", "info");
          return;
        }

        // Use the current lead's ID from the page, not from the modal
        // This ensures we're updating the correct lead
        // Priority: leadId (from params - most reliable) > lead._id > lead.id > leadIdFromModal
        let currentLeadId = '';

        // First try leadId from params (most reliable, always available)
        if (leadId) {
          currentLeadId = safeExtractId(leadId);
        }

        // Then try lead data
        if (!currentLeadId && lead?._id) {
          currentLeadId = safeExtractId(lead._id);
        }
        if (!currentLeadId && lead?.id) {
          currentLeadId = safeExtractId(lead.id);
        }

        // Finally try modal's leadId as fallback
        if (!currentLeadId && leadIdFromModal) {
          currentLeadId = safeExtractId(leadIdFromModal);
        }

        // Validate that we have a valid ID (not empty and not '[object Object]')
        if (!currentLeadId || currentLeadId === '[object Object]' || currentLeadId === 'undefined' || currentLeadId === 'null' || currentLeadId.trim() === '') {
          console.error("Invalid lead ID - all values:", {
            leadId: leadId,
            leadIdFromModal: leadIdFromModal,
            lead_id: lead?._id,
            lead_id_type: typeof lead?._id,
            lead_id_value: lead?._id,
            leadId_value: lead?.id,
            leadId_type: typeof lead?.id,
            extracted: currentLeadId,
            isLoadingLead: isLoadingLead,
            leadExists: !!lead,
            leadKeys: lead ? Object.keys(lead) : []
          });
          helpers.toaster("Invalid lead ID. Please refresh the page and try again.", "error");
          return;
        }

        console.log("Assigning lead - currentLeadId:", currentLeadId, "userId:", userId);
        console.log("Lead from page:", { _id: lead?._id, id: lead?.id });
        console.log("LeadId from params:", leadId);
        console.log("LeadId from modal:", leadIdFromModal);

        // Ensure userId is a string, not an object - same as lead list page
        // Handle null/empty string for unassigning
        const userIdString = userId ? userId.toString() : '';

        // Only include assignedTo if userId is provided, otherwise set to null explicitly
        const payload = {
          id: currentLeadId,
        };

        // Only add assignedTo if userId is provided
        if (userIdString) {
          payload.assignedTo = userIdString;
        } else {
          payload.assignedTo = null;
        }


        await addOrUpdateLeadMutation.mutateAsync(payload);
        setShowAssignModal(false);
        // Wait a bit for the mutation's onSuccess to invalidate queries, then refetch
        setTimeout(async () => {
          await refetchLead();
        }, 100);
      } catch (error) {
        console.error("Error assigning lead:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to assign lead";
        helpers.toaster(typeof errorMessage === 'string' ? errorMessage : "Failed to assign lead", "error");
      }
    },
    [addOrUpdateLeadMutation, refetchLead, lead, leadId, safeExtractId, isLoadingLead]
  );

  // Handle communications - Simple CRUD using new separate table
  const handleAddCommunication = async (communicationData) => {
    try {
      if (isLoadingLead || !lead) {
        helpers.toaster("Lead data is still loading. Please wait...", "info");
        return;
      }

      const extractedId = safeExtractId(leadId || lead?._id || lead?.id);
      if (!extractedId) {
        helpers.toaster("Invalid lead ID", "error");
        return;
      }

      // Convert datetime-local to ISO string
      let activityDateISO;
      if (communicationData.activityDate) {
        const dateObj = new Date(communicationData.activityDate);
        activityDateISO = isNaN(dateObj.getTime())
          ? new Date().toISOString()
          : dateObj.toISOString();
      } else {
        activityDateISO = new Date().toISOString();
      }

      await createCommunicationMutation.mutateAsync({
        leadId: extractedId,
        communicationData: {
          type: communicationData.type,
          description: communicationData.description,
          activityDate: activityDateISO,
          status: communicationData.status || 'pending',
        },
      });

      // Refetch communications
      setTimeout(() => refetchCommunications(), 300);
    } catch (error) {
      console.error("Error adding communication:", error);
    }
  };

  const handleUpdateCommunication = async (communicationId, communicationData) => {
    try {
      console.log('handleUpdateCommunication: Received communicationId:', communicationId);
      console.log('handleUpdateCommunication: communicationId type:', typeof communicationId);

      const extractedId = String(communicationId || '').trim();
      console.log('handleUpdateCommunication: Extracted ID:', extractedId);

      if (!extractedId || extractedId === '[object Object]' || extractedId.length === 0) {
        console.error('handleUpdateCommunication: Invalid ID format:', extractedId);
        helpers.toaster("Invalid communication ID: ID is missing or empty", "error");
        return;
      }


      // Convert datetime-local to ISO string
      let activityDateISO;
      if (communicationData.activityDate) {
        const dateObj = new Date(communicationData.activityDate);
        activityDateISO = isNaN(dateObj.getTime())
          ? new Date().toISOString()
          : dateObj.toISOString();
      } else {
        activityDateISO = new Date().toISOString();
      }

      await updateCommunicationMutation.mutateAsync({
        communicationId: extractedId,
        communicationData: {
          type: communicationData.type,
          description: communicationData.description,
          activityDate: activityDateISO,
          status: communicationData.status || 'pending',
        },
      });

      setTimeout(() => refetchCommunications(), 300);
    } catch (error) {
      console.error("Error updating communication:", error);
    }
  };

  const handleDeleteCommunication = async (communicationId) => {
    try {
      const extractedId = String(communicationId || '').trim();
      if (!extractedId || !/^[a-fA-F0-9]{24}$/.test(extractedId)) {
        helpers.toaster("Invalid communication ID", "error");
        return;
      }

      await deleteCommunicationMutation.mutateAsync(extractedId);
      setTimeout(() => refetchCommunications(), 300);
    } catch (error) {
      console.error("Error deleting communication:", error);
    }
  };

  const handleStatusChange = async (activityId, newStatus) => {
    try {
      // Validate activityId before proceeding
      if (!activityId) {
        helpers.toaster("Invalid activity ID", "error");
        return;
      }

      // Ensure activityId is a valid string
      let extractedId = '';
      if (typeof activityId === 'string') {
        extractedId = activityId.trim();
      } else if (activityId && typeof activityId === 'object') {
        // Handle MongoDB _id object
        extractedId = activityId._id || activityId.id || String(activityId);
      } else {
        extractedId = String(activityId || '').trim();
      }

      // Validate that we have a non-empty ID and valid MongoDB ObjectId format
      if (!extractedId || extractedId === '') {
        console.error("Invalid activity ID - empty:", activityId);
        helpers.toaster("Invalid activity ID", "error");
        return;
      }

      // Validate MongoDB ObjectId format (24 hex characters)
      if (!/^[a-fA-F0-9]{24}$/.test(extractedId)) {
        console.error("Invalid MongoDB ObjectId format:", extractedId);
        helpers.toaster("Invalid activity ID format. Please refresh the page.", "error");
        return;
      }

      console.log("Changing status - activityId:", extractedId, "newStatus:", newStatus);

      await updateCommunicationStatusMutation.mutateAsync({
        activityId: extractedId,
        status: newStatus,
      });

      // Show success toast
      helpers.toaster("Communication status updated successfully", "success");

      setTimeout(async () => {
        await refetchActivities();
      }, 300);
    } catch (error) {
      console.error("Error changing status:", error);
      // Error toast is handled by mutation's onError
      // Don't rethrow to prevent sync service errors
    }
  };

  // Handle remarks
  const handleAddRemark = async (remarkData) => {
    try {
      // Ensure lead is loaded
      if (isLoadingLead || !lead) {
        helpers.toaster("Lead data is still loading. Please wait...", "info");
        return;
      }

      // Extract lead ID with priority: leadId (from params) > lead._id > lead.id
      let extractedId = '';
      if (leadId) {
        extractedId = safeExtractId(leadId);
      }
      if (!extractedId && lead?._id) {
        extractedId = safeExtractId(lead._id);
      }
      if (!extractedId && lead?.id) {
        extractedId = safeExtractId(lead.id);
      }

      if (!extractedId || extractedId.trim() === '') {
        helpers.toaster("Invalid lead ID. Please refresh the page and try again.", "error");
        return;
      }

      const currentRemarks = Array.isArray(lead.remarks) ? lead.remarks : [];
      // Ensure remarkData has the correct structure
      const newRemark = {
        remark: remarkData?.remark || remarkData?.text || '',
        createdAt: new Date(),
      };

      // Only add if remark text is not empty
      if (!newRemark.remark || !newRemark.remark.trim()) {
        helpers.toaster("Please enter a remark", "error");
        return;
      }

      console.log("Adding remark:", newRemark);
      console.log("Current remarks:", currentRemarks);
      console.log("New remarks array:", [...currentRemarks, newRemark]);

      const updatedRemarks = [...currentRemarks, newRemark];

      await addOrUpdateLeadMutation.mutateAsync({
        id: extractedId,
        remarks: updatedRemarks,
      });

      // Wait a bit for the mutation to complete, then refetch
      setTimeout(async () => {
        await refetchLead();
      }, 200);
      // Success notification is handled by mutation's onSuccess handler
    } catch (error) {
      console.error("Error adding remark:", error);
      helpers.toaster("Failed to add remark", "error");
    }
  };

  const handleUpdateRemark = async (index, remarkData) => {
    try {
      // Ensure lead is loaded
      if (isLoadingLead || !lead) {
        helpers.toaster("Lead data is still loading. Please wait...", "info");
        return;
      }

      // Extract lead ID with priority: leadId (from params) > lead._id > lead.id
      let extractedId = '';
      if (leadId) {
        extractedId = safeExtractId(leadId);
      }
      if (!extractedId && lead?._id) {
        extractedId = safeExtractId(lead._id);
      }
      if (!extractedId && lead?.id) {
        extractedId = safeExtractId(lead.id);
      }

      if (!extractedId || extractedId.trim() === '') {
        helpers.toaster("Invalid lead ID. Please refresh the page and try again.", "error");
        return;
      }

      const currentRemarks = Array.isArray(lead.remarks) ? lead.remarks : [];
      const updatedRemarks = [...currentRemarks];

      // Ensure remarkData has the correct structure
      const updatedRemark = {
        remark: remarkData?.remark || remarkData?.text || '',
        createdAt: updatedRemarks[index]?.createdAt || new Date(),
      };

      // Only update if remark text is not empty
      if (!updatedRemark.remark || !updatedRemark.remark.trim()) {
        helpers.toaster("Please enter a remark", "error");
        return;
      }

      updatedRemarks[index] = updatedRemark;
      console.log("Updating remark at index:", index, "New remark:", updatedRemark);

      await addOrUpdateLeadMutation.mutateAsync({
        id: extractedId,
        remarks: updatedRemarks,
      });

      // Wait a bit for the mutation to complete, then refetch
      setTimeout(async () => {
        await refetchLead();
      }, 200);
      // Success notification is handled by mutation's onSuccess handler
    } catch (error) {
      console.error("Error updating remark:", error);
      helpers.toaster("Failed to update remark", "error");
      throw error; // Re-throw so LeadRemarks can handle it
    }
  };

  const handleDeleteRemark = async (index) => {
    try {
      // Ensure lead is loaded
      if (isLoadingLead || !lead) {
        helpers.toaster("Lead data is still loading. Please wait...", "info");
        return;
      }

      // Extract lead ID with priority: leadId (from params) > lead._id > lead.id
      let extractedId = '';
      if (leadId) {
        extractedId = safeExtractId(leadId);
      }
      if (!extractedId && lead?._id) {
        extractedId = safeExtractId(lead._id);
      }
      if (!extractedId && lead?.id) {
        extractedId = safeExtractId(lead.id);
      }

      if (!extractedId || extractedId.trim() === '') {
        helpers.toaster("Invalid lead ID. Please refresh the page and try again.", "error");
        return;
      }

      const currentRemarks = Array.isArray(lead.remarks) ? lead.remarks : [];
      const updatedRemarks = currentRemarks.filter((_, i) => i !== index);
      console.log("Deleting remark at index:", index);
      console.log("Remaining remarks array:", updatedRemarks);

      await addOrUpdateLeadMutation.mutateAsync({
        id: extractedId,
        remarks: updatedRemarks,
      });

      // Wait a bit for the mutation to complete, then refetch
      setTimeout(async () => {
        await refetchLead();
      }, 200);
      // Success notification is handled by mutation's onSuccess handler
    } catch (error) {
      console.error("Error deleting remark:", error);
      helpers.toaster("Failed to delete remark", "error");
    }
  };

  // Form submission
  const submitForm = async (values) => {
    try {
      console.log("Form submission - editSection:", editSection);
      console.log("Form values:", values);

      // Helper function to clean undefined and empty string values
      const cleanPayload = (obj) => {
        const cleaned = {};
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          // Keep the value if it's not undefined and not an empty string (unless it's a required field)
          if (value !== undefined && value !== null && value !== '') {
            cleaned[key] = value;
          } else if (value === '' && (key === 'website' || key === 'contactEmail')) {
            // Allow empty strings for optional fields like website and email
            cleaned[key] = '';
          }
        });
        return cleaned;
      };

      // Use the same safeExtractId function defined above
      const extractId = safeExtractId;

      // If editing company info only, only send company-related fields
      if (editSection === 'company') {
        // Priority: leadId (from params - most reliable) > values.id > lead._id > lead.id
        let extractedId = '';

        // First try leadId from params (most reliable, always available)
        if (leadId) {
          extractedId = extractId(leadId);
        }

        // Then try form values
        if (!extractedId && values.id) {
          extractedId = extractId(values.id);
        }

        // Then try lead data
        if (!extractedId && lead?._id) {
          extractedId = extractId(lead._id);
        }
        if (!extractedId && lead?.id) {
          extractedId = extractId(lead.id);
        }

        // Validate that we have a valid ID
        if (!extractedId || extractedId === '[object Object]' || extractedId === 'undefined' || extractedId === 'null' || extractedId.trim() === '') {
          console.error("Invalid lead ID for company update - all values:", {
            leadId: leadId,
            values_id: values.id,
            lead_id: lead?._id,
            lead_id_type: typeof lead?._id,
            lead_id_value: lead?._id,
            leadId_value: lead?.id,
            leadId_type: typeof lead?.id,
            extracted: extractedId,
            isLoadingLead: isLoadingLead,
            leadExists: !!lead,
            leadKeys: lead ? Object.keys(lead) : []
          });
          helpers.toaster("Invalid lead ID. Please refresh the page and try again.", "error");
          return;
        }

        const rawPayload = {
          id: extractedId,
          // Company fields only
          leadType: values.leadType,
          name: values.name,
          companyType: values.companyType,
          website: values.website,
          priorityStatus: values.priorityStatus,
          clientStatus: values.clientStatus,
          leadSource: values.leadSource,
          dealValue: values.dealValue,
          leadStatus: values.leadStatus,
        };

        const payload = cleanPayload(rawPayload);
        console.log("Company payload:", payload);

        await addOrUpdateLeadMutation.mutateAsync(payload);
        // Success notification is handled by mutation's onSuccess handler
        setShowEditModal(false);
        setEditSection(null);
        await refetchLead();
      } else if (editSection === 'contact') {
        // Key contact person fields only
        // Priority: leadId (from params - most reliable) > values.id > lead._id > lead.id
        let extractedId = '';

        // First try leadId from params (most reliable, always available)
        if (leadId) {
          extractedId = extractId(leadId);
        }

        // Then try form values
        if (!extractedId && values.id) {
          extractedId = extractId(values.id);
        }

        // Then try lead data
        if (!extractedId && lead?._id) {
          extractedId = extractId(lead._id);
        }
        if (!extractedId && lead?.id) {
          extractedId = extractId(lead.id);
        }

        // Validate that we have a valid ID
        if (!extractedId || extractedId === '[object Object]' || extractedId === 'undefined' || extractedId === 'null' || extractedId.trim() === '') {
          console.error("Invalid lead ID for contact update - all values:", {
            leadId: leadId,
            values_id: values.id,
            lead_id: lead?._id,
            lead_id_type: typeof lead?._id,
            lead_id_value: lead?._id,
            leadId_value: lead?.id,
            leadId_type: typeof lead?.id,
            extracted: extractedId,
            isLoadingLead: isLoadingLead,
            leadExists: !!lead,
            leadKeys: lead ? Object.keys(lead) : []
          });
          helpers.toaster("Invalid lead ID. Please refresh the page and try again.", "error");
          return;
        }

        const rawPayload = {
          id: extractedId,
          contactName: values.contactName,
          contactEmail: values.contactEmail,
          contactDepartment: values.contactDepartment,
          contactDesignation: values.contactDesignation,
          contactPhone: values.contactPhone,
          contactAlternativePhone: values.contactAlternativePhone,
        };

        const payload = cleanPayload(rawPayload);
        console.log("Contact payload:", payload);

        await addOrUpdateLeadMutation.mutateAsync(payload);
        // Success notification is handled by mutation's onSuccess handler
        setShowEditModal(false);
        setEditSection(null);
        await refetchLead();
      } else {
        // Full form submission
        const payload = cleanPayload(values);
        await addOrUpdateLeadMutation.mutateAsync(payload);
        refetchLead();
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      console.error("Error response:", error?.response?.data || error?.response || error);

      // Extract error message
      let errorMessage = "Failed to update lead";
      if (error?.response?.data?.message) {
        if (typeof error.response.data.message === 'object') {
          // Validation errors - show first error
          const firstError = Object.values(error.response.data.message)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      helpers.toaster(errorMessage, "error");
    }
  };

  // Format date helper
  const formatDate = (date) => {
    if (!date) return "Never";
    return helpers.dDate(date);
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusName = typeof status === 'string' ? status : status?.name || 'Active';
    const colors = {
      'Active': 'bg-green-600',
      'In Progress': 'bg-blue-600',
      'Converted': 'bg-yellow-600',
      'Follow Up': 'bg-purple-600',
      'Lost': 'bg-red-600',
    };
    return colors[statusName] || 'bg-gray-600';
  };

  // Calculate score (placeholder - can be based on activities, deal value, etc.)
  const calculateScore = () => {
    if (!lead) return 0;
    let score = 50; // Base score
    if (lead.dealValue && lead.dealValue > 0) score += 20;
    if (lead.contactEmail) score += 10;
    if (lead.contactPhone) score += 10;
    if (allActivities && allActivities.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const score = calculateScore();
  const donutData = [
    { name: "score", value: score },
    { name: "rest", value: 100 - score },
  ];
  const COLORS = ["#2563eb", "#e5e7eb"];

  // Loading state
  if (isLoadingLead) {
    return (
      <div className="min-h-screen p-4 bg-white dark:bg-gray-900 dark:text-gray-200 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primaryColor" />
      </div>
    );
  }

  // Error state - check if we have a valid lead
  // Don't show error while loading
  if (!isLoadingLead) {
    const hasValidLead = lead && (lead._id || lead.id || lead.name || lead.contactName);

    if (leadError) {
      return (
        <div className="min-h-screen p-4 bg-white dark:bg-gray-900 dark:text-gray-200 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">Error loading lead</p>
            <p className="text-sm text-gray-500 mt-2">
              {leadError?.response?.data?.message || leadError?.message || 'Please check the lead ID and try again'}
            </p>
            {!leadId && (
              <p className="text-sm text-orange-500 mt-2">No lead ID provided in URL</p>
            )}
            <ButtonTw onClick={() => router.push('/crm/leads')} className="mt-4">
              Back to Leads
            </ButtonTw>
          </div>
        </div>
      );
    }

    if (!hasValidLead && leadId) {
      return (
        <div className="min-h-screen p-4 bg-white dark:bg-gray-900 dark:text-gray-200 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">Lead not found</p>
            <p className="text-sm text-gray-500 mt-2">
              The lead with ID "{leadId}" could not be found.
            </p>
            <ButtonTw onClick={() => router.push('/crm/leads')} className="mt-4">
              Back to Leads
            </ButtonTw>
          </div>
        </div>
      );
    }
  }

  const companyName = lead.name || 'No Company';
  const leadStatus = typeof lead.leadStatus === 'string' ? lead.leadStatus : lead.leadStatus?.name || 'Active';

  return (
    <div className="min-h-screen p-4 bg-white dark:bg-gray-900 dark:text-gray-200">
      <div className="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT: main column */}
          <div className="space-y-4">
            {/* Top company card */}
            <Card className="rounded-2xl shadow">
              <CardContent className="px-4">
                <div className="flex justify-between items-start border-b pb-3 mb-4">
                  <p className="text-lg dark-title-color font-semibold">
                    Company Info
                  </p>
                  <ButtonTw
                    variant="gray"
                    size="sm"
                    onClick={() => handleEdit('company')}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </ButtonTw>
                </div>

                {/* Company Information Grid */}
                <div className="space-y-4">
                  {/* Row 1: Company Name and Lead Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Company Name</p>
                      <p className="font-semibold text-base dark-title-color">
                        {lead?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Lead Type</p>
                      <p className="text-sm dark-title-color">
                        {getLabelFromConstant(LEAD_TYPES, lead?.leadType) || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Row 2: Company Type and Website */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Company Type</p>
                      <p className="text-sm dark-title-color">
                        {getLabelFromConstant(COMPANY_TYPES, lead?.companyType) || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Website</p>
                      <p className="text-sm dark-title-color">
                        {lead?.website || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Row 3: Priority Status and Client Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Priority Status</p>
                      <p className="text-sm dark-title-color">
                        {getLabelFromConstant(PRIORITY_STATUSES, lead?.priorityStatus) || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Client Status</p>
                      <p className="text-sm dark-title-color">
                        {getLabelFromConstant(CLIENT_STATUSES, lead?.clientStatus) || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Row 4: Source and Deal Value */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Source</p>
                      <p className="text-sm dark-title-color">
                        {getLabelFromConstant(LEAD_SOURCES, lead?.leadSource)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Deal Value</p>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {lead?.dealValue ? Number(lead.dealValue).toLocaleString('en-US') : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Row 5: Status */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Status</p>
                    <div className={`inline-block ${getStatusColor(leadStatus)} text-white px-3 py-1 rounded-md text-sm`}>
                      {leadStatus}
                    </div>
                  </div>
                </div>

                {lead.assignedTo && (() => {
                  // Helper function to safely extract ID from object or primitive
                  const extractId = (value) => {
                    if (!value) return null;
                    // If it's already a primitive, return it
                    if (typeof value === 'string' || typeof value === 'number') {
                      return value;
                    }
                    // If it's an object, try to extract ID
                    if (typeof value === 'object') {
                      // Try common ID fields
                      if (value.id !== undefined) return value.id;
                      if (value._id !== undefined) return value._id;
                      if (value.userId !== undefined) return value.userId;
                      // Try toString if it's a MongoDB ObjectId
                      if (value.toString && typeof value.toString === 'function') {
                        const str = value.toString();
                        if (str && str !== '[object Object]' && str !== 'undefined' && str !== 'null') {
                          return str;
                        }
                      }
                    }
                    // Fallback to String conversion
                    const str = String(value);
                    return (str && str !== '[object Object]' && str !== 'undefined' && str !== 'null') ? str : null;
                  };

                  // Extract the actual ID value
                  const assignedToId = extractId(lead.assignedTo);
                  if (!assignedToId) {
                    return null; // Don't render if we can't extract a valid ID
                  }

                  // Try multiple ID formats for lookup
                  const assignedUserIdStr = String(assignedToId).trim();
                  const assignedUserIdNum = Number(assignedToId);

                  // Try to find user with different ID formats
                  let assignedUser = userMap.get(assignedUserIdStr);
                  if (!assignedUser && !isNaN(assignedUserIdNum) && isFinite(assignedUserIdNum)) {
                    assignedUser = userMap.get(assignedUserIdNum);
                  }
                  // Try without trimming
                  if (!assignedUser) {
                    assignedUser = userMap.get(String(assignedToId));
                  }

                  // Fallback: Search employees array directly if map lookup fails
                  if (!assignedUser && employees.length > 0) {
                    const foundEmployee = employees.find(emp => {
                      if (!emp.user) return false;
                      const empUserIds = [
                        emp.user.id?.toString(),
                        emp.user.userId?.toString(),
                        String(emp.user.id),
                        String(emp.user.userId),
                        String(emp.id),
                        emp.user.id,
                        emp.user.userId,
                        emp.id,
                      ];
                      return empUserIds.some(id => {
                        const idStr = String(id);
                        const assignedStr = String(assignedToId);
                        return idStr === assignedStr || idStr === String(assignedUserIdNum);
                      });
                    });

                    if (foundEmployee && foundEmployee.user) {
                      assignedUser = {
                        name: foundEmployee.user.fullName || "Unknown User",
                        email: foundEmployee.user.email || "",
                        designation: foundEmployee.designation?.name || "",
                        profilePicture: foundEmployee.user.profile?.profilePicture?.fileUrl || null,
                      };
                    }
                  }

                  const userName = assignedUser?.name || "Unknown User";
                  const userEmail = assignedUser?.email || "";

                  return (
                    <div className="mt-4 border-t pt-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold dark-title-color">Assigned User</h4>
                        <ButtonTw
                          variant="gray"
                          className="px-3 py-1 rounded-md text-sm flex items-center gap-2"
                          onClick={() => setShowAssignModal(true)}
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </ButtonTw>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                            {getInitials(userName)}
                          </div>
                          <div>
                            <div className="font-medium">{userName}</div>
                            {userEmail ? (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {userEmail}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                User ID: {assignedToId}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            Account Manager
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Key Contact Person */}
            {(lead?.contactName || lead?.contactEmail || lead?.contactPhone || lead?.contactDepartment || lead?.contactDesignation) && (
              <Card className="rounded-2xl shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-lg font-semibold dark-title-color">Key Contact Person</h3>
                    <ButtonTw
                      variant="gray"
                      className="px-3 py-1 rounded-md text-sm flex items-center gap-2"
                      onClick={() => handleEdit('contact')}
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </ButtonTw>
                  </div>
                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="space-y-2">
                      {lead.contactName && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Name</p>
                          <p className="font-medium text-sm dark-title-color">{lead.contactName}</p>
                        </div>
                      )}
                      {lead.contactDesignation && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Designation</p>
                          <p className="text-sm dark-title-color">{lead.contactDesignation}</p>
                        </div>
                      )}
                      {lead.contactDepartment && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Department</p>
                          <p className="text-sm dark-title-color">{lead.contactDepartment}</p>
                        </div>
                      )}
                      {lead.contactEmail && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Email</p>
                          <p className="text-sm dark-title-color">{lead.contactEmail}</p>
                        </div>
                      )}
                      {lead.contactPhone && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Phone</p>
                          <p className="text-sm dark-title-color">{lead.contactPhone}</p>
                        </div>
                      )}
                      {lead.contactAlternativePhone && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Alternative Phone</p>
                          <p className="text-sm dark-title-color">{lead.contactAlternativePhone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Multiple Contacts */}
            <LeadContacts
              contacts={lead.contacts || []}
              onAdd={handleAddContact}
              onUpdate={handleUpdateContact}
              onDelete={handleDeleteContact}
              isLoading={addOrUpdateLeadMutation?.isLoading}
            />
          </div>

          {/* RIGHT column */}
          <div className="space-y-4">
            {/* Score / Value Card */}
            <Card className="rounded-2xl shadow">
              <CardContent className="">
                <div className="flex justify-between items-start border-b pb-3 mb-4">
                  <p className="text-lg dark-title-color font-semibold">
                    Lead Info
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 items-center">
                  <div className="w-full h-28 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={100}>
                      <PieChart>
                        <Pie
                          data={donutData}
                          innerRadius={30}
                          outerRadius={40}
                          dataKey="value"
                        >
                          {donutData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Score
                    </div>
                    <div className="font-semibold text-xl">{score}%</div>
                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                      Value <span className="font-medium">{lead.dealValue ? Number(lead.dealValue).toLocaleString('en-US') : 'N/A'}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Source <span className="font-medium">{getLabelFromConstant(LEAD_SOURCES, lead?.leadSource)}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Last Followup{" "}
                      <span className="font-medium">{formatDate(lead.lastContact)}</span>
                    </div>
                  </div>
                </div>

                {lead.customFields && Object.keys(lead.customFields).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(lead.customFields).map(([key, value]) => (
                      <Badge key={key}>{value}</Badge>
                    ))}
                  </div>
                )}

                {lead.notes && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    Note: {lead.notes}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Communicate */}
            <LeadCommunications
              communications={communications || []}
              onAdd={handleAddCommunication}
              onUpdate={handleUpdateCommunication}
              onDelete={handleDeleteCommunication}
              isLoading={isLoadingCommunications || createCommunicationMutation?.isLoading || updateCommunicationMutation?.isLoading || deleteCommunicationMutation?.isLoading}
            />

            {/* Multiple Remarks */}
            <LeadRemarks
              remarks={lead.remarks || []}
              onAdd={handleAddRemark}
              onUpdate={handleUpdateRemark}
              onDelete={handleDeleteRemark}
              isLoading={addOrUpdateLeadMutation?.isLoading}
              userMap={userMap}
            />

            {/* Activity Log */}
            <LeadActivityLog
              activities={allActivities || []}
              userMap={userMap}
              isLoading={isLoadingActivities}
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <AddOrUpdateLeadsModal
          showModal={showEditModal}
          handleClose={() => {
            setShowEditModal(false);
            setEditSection(null);
          }}
          control={control}
          watch={watch}
          handleSubmit={handleSubmit}
          submitForm={submitForm}
          isLoading={addOrUpdateLeadMutation?.isLoading}
          reset={reset}
          editSection={editSection}
        />
      )}

      {/* Assign Lead Modal */}
      {showAssignModal && leadId && (
        <AssignLeadModal
          showModal={showAssignModal}
          handleClose={() => setShowAssignModal(false)}
          lead={lead}
          users={employees}
          onAssign={handleAssign}
          isLoading={addOrUpdateLeadMutation?.isLoading || isLoadingLead}
        />
      )}
    </div>
  );
}
