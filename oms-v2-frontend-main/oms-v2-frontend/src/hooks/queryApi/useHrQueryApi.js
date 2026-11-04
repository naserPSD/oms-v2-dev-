"use client";

// path: src/hooks/queryApi/useHrQueryApi.js
import {
  addOrUpdateAssetAllocation,
  addOrUpdateAssetType,
  createCompanyAssetType,
  addOrUpdateCertificationFileWithEmployeeId,
  addOrUpdateDocumentFile,
  addOrUpdateDocumentFileWithEmployeeId,
  addOrUpdateEmployee,
  addOrUpdateemployeeHierarchyFile,
  addOrUpdateEmployeeProfilePicture,
  addOrUpdateEvent,
  addOrUpdateHoliday,
  addOrUpdateLeaveRequest,
  addOrUpdateLeaveType,
  addOrUpdateNotes,
  addOrUpdateNotice,
  addOrUpdateOffice,
  addOrUpdateOfficeHoliday,
  addOrUpdateOfficeShift,
  addOrUpdateProjectWithEmployeeId,
  addOrUpdateRequisition,
  addOrUpdateSkillsWithEmployeeId,
  addOrUpdateTaskBoard,
  addOrUpdateTaskWorkspace,
  addOrUpdateTrainingRequest,
  addOrUpdateVisitApplication,
  addOrUpdateWeekend,
  addUpdateAttendance,
  addUpdateCompanyDocument,
  addUpdateMasterDocument,
  archiveNotes,
  changeTaskBoardActiveStatus,
  changeTaskWorkspaceActiveStatus,
  deleteAssetAllocation,
  deleteAssetType,
  deleteAttendanceRules,
  deleteCompanyDocument,
  deleteDocumentFile,
  deleteEmployee,
  deleteEmployeeHierarchyFile,
  deleteEvent,
  deleteHoliday,
  deleteLeaveRequest,
  deleteLeaveType,
  deleteMasterDocument,
  deleteNotes,
  deleteNotice,
  deleteOffice,
  deleteOfficeHoliday,
  deleteOfficeShift,
  deleteRequisition,
  deleteTrainingRequest,
  deleteTaskBoard,
  deleteTaskWorkspace,
  deleteWeekend,
  documentFiles,
  employeeCertifications,
  employeeDocumentFiles,
  employeeHierarchyFiles,
  employeeProjects,
  employeeSkills,
  fetchAllEmployeeAttendance,
  fetchPendingAttendance,
  fetchAllLeaveRequest,
  fetchPendingRequisition,
  fetchAllPendingLeaveRequest,
  fetchAllUsers,
  fetchAppEmployeeUsers,
  fetchApplyVisit,
  fetchArchiveNotes,
  fetchAssetTypes,
  fetchGlobalAssetTypes,
  importGlobalAssetTypes,
  fetchAttendanceRules,
  fetchCompanyDocuments,
  fetchCompanyDocumentsWithoutPagination,
  fetchDashboardCalendar,
  fetchEmployee,
  fetchEmployeeAssetAllocation,
  fetchEmployeeAttendanceReconciliations,
  fetchEmployeeDashboardData,
  fetchEmployeeDashboardDataById,
  fetchEmployeeEventCalendar,
  fetchEmployeeEventCalendarWithoutId,
  fetchEmployeeHierarchyByEmployee,
  fetchEmployeeHierarchyByEmployeeId,
  fetchEmployeeInvitation,
  fetchEmployeePaymentHistory,
  fetchEmployeeProfileDashboardData,
  fetchEmployeeProfileDashboardDataWithoutId,
  fetchGetAllEvents,
  fetchGetEmployeeUpComingEvents,
  fetchGetEmployeeUpComingEventsWithoutId,
  fetchGetMyUpComingEvents,
  fetchHoliday,
  fetchJobRecruitment,
  fetchLeavereport,
  fetchLeaveSummaryList,
  fetchLeaveType,
  fetchMasterDocuments,
  fetchMasterDocumentsWithoutPagination,
  fetchMonthlyEmployeeAttendance,
  fetchMyAssets,
  createAssetRefundRequest,
  fetchMyAssetRefundRequests,
  fetchAllAssetRefundRequests,
  actionAssetRefundRequest,
  fetchMyLeaveRequest,
  fetchMyRequisition,
  fetchMySalaryHistory,
  fetchNotes,
  fetchNotice,
  fetchOffice,
  fetchOfficeHoliday,
  fetchOfficeList,
  fetchOfficeShiftsByOfficeId,
  fetchRequisition,
  fetchRequisitionByStatus,
  fetchSalaryHistoryByEmployeeId,
  fetchSingleEvent,
  fetchSingleRequisition,
  fetchTaskBoards,
  fetchTaskWorkspaces,
  fetchTrainingRequests,
  fetchPendingTrainingRequests,
  fetchApprovedTrainingRequests,
  fetchRejectedTrainingRequests,
  fetchTrainingRequestsByEmployeeId,
  fetchMyTrainingRequests,
  fetchTrainingRequestById,
  fetchVisitApplications,
  fetchVisitEmployee,
  fetchWeekend,
  getActiveEmployeesBirthdayInfo,
  getLeaveTypeById,
  getAllHolidayListWithoutPagination,
  getLeaveTypes,
  pinNotes,
  requisitionStatusChange,
  trainingRequestStatusChange,
  sendEmployeeInvitation,
  toggleAssetAllocationStatus,
  toggleCompanyDocumentStatus,
  toggleEmployeeActiveStatus,
  toggleMasterDocumentStatus,
  toggleServiceAbsentActive,
  toggleServiceAttendaceActive,
  toggleStatusHoliday,
  toggleStatusNotice,
  toggleStatusOffice,
  updateApplyStatusApi,
  updateCheckInReconciliationStatus,
  updateCheckOutReconciliationStatus,
  updateEmployeeOfficeAndShift,
  updateLeaveRequestApprovalStatus,
  updateTimeStatusApi,
  updateVisitStatusApi,
  fetchAllPendingRequisition,
  fetchJobRecruitmentSteps,
  fetchAllActiveJobRecruitmentStepNames,
  fetchJobRecruitmentStepById,
  addOrUpdateJobRecruitmentStep,
  addOrUpdateJobRecruitmentSteps,
  deleteJobRecruitmentStep,
  fetchJobVacancy,
  deleteJobVacancy,
  addOrUpdateJobVacancy,
  addOrUpdateJobInterviewers,
  fetchJobRecruitmentStepIdsByJobVacancyId,
  fetchJobWeights,
  updateJobWeight,
  addBulkJobWeights,
  deleteJobWeight,
  getJobRecruitmentStepsByVacancyId,
  addOrUpdateJobApplicant,
  fetchAllJobApplicants,
  deleteJobApplicant,
  updateJobApplicantRecruitmentStatus,
  fetchApplicantsByStep,
  getTopApplicantsByVacancy,
  getWeightDistributionBySchedule,
  getInterviewScheduleById,
  addOrUpdateInterviewSchedule,
  getJobTitleByJobVacancyId,
  confirmRecruitment,
  submitInterviewMarks,
  applicantRemark,
} from "@/services/hrServiceApi";
import {
  fetchLeads,
  fetchLeadById,
  fetchLeadActivities,
  addOrUpdateLead,
  deleteLead,
  bulkDeleteLeads,
  bulkUpdateLeadStatus,
  createCommunication,
  updateCommunication,
  deleteCommunication,
  fetchCommunications,
} from "@/services/leadManagementApi";
import helpers, { toaster } from "@/utils/helpers";
import { useNetworkStore } from "@/utils/offline/networkStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEmployeeLeaveBalanceQuery } from "./useEmployeeLeaveBalanceQuery";
import { useMyLeavePolicyQuery } from "./useMyLeavePolicyQuery";

const response = {};

export const useHrQueryApi = ({
  reset = () => { },
  setError = () => { },
  handleClose = () => { },
  setShowModal = () => { },
} = {}) => {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStore();

  // Keep on shared response for existing destructuring callers
  response.useMyLeavePolicyQuery = useMyLeavePolicyQuery;
  response.useEmployeeLeaveBalanceQuery = useEmployeeLeaveBalanceQuery;

  // =================  Start Personal Notes ==================
  // --- Fetch Data ---
  response.usePersonalNotesQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["personalNotes", params],
      queryFn: () => fetchNotes(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
    });
  };

  //attendance data...get...............

  // --- Fetch Data ---
  response.useAttendanceRuleQuery = (params = {}) => {
    return useQuery({
      queryKey: ["attendance-rules", params],
      queryFn: () => fetchAttendanceRules(params),
      keepPreviousData: true,
    });
  };

  // --- Fetch Data for JobRecruitment---

  response.useJobRecruitmentQuery = (params = {}) => {
    return useQuery({
      queryKey: ["job-recruitment", params],
      queryFn: () => fetchJobRecruitment(params),
      keepPreviousData: true,
    });
  };

  // --- Toggle Status ---
  response.toggleAttendanceRulseActiveMutation = useMutation({
    mutationFn: toggleServiceAttendaceActive,
    onMutate: async (id) => {
      const allRoleQueries = queryClient.getQueriesData({
        queryKey: ["attendance-rules"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["attendance-rules"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allRoleQueries);

      // Update ALL user queries in the cache
      allRoleQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isActive: !item.isActive } : item,
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Active status changed successfully", "success");
    },
  });

  response.toggleAttendanceRulseAbsentMutation = useMutation({
    mutationFn: toggleServiceAbsentActive,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allRoleQueries = queryClient.getQueriesData({
        queryKey: ["attendance-rules"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["attendance-rules"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allRoleQueries);

      // Update ALL user queries in the cache
      allRoleQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isAbsent: !item.isAbsent } : item,
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Absent status changed successfully", "success");
    },
  });

  //add  or update attendance mutation................

  response.addOrUpdateAttendanceRulesMutation = useMutation({
    mutationFn: addUpdateAttendance,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["attendance-rules"] });

      // Get all current user queries for rollback
      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["attendance-rules"],
      });
      const previousQueriesData = new Map(allUserQueries);

      // Optimistically update ALL user queries in the cache
      allUserQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Attendance Rules ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["attendance-rules"] });
    },
  });

  response.deleteAttendanceRulesMutation = useMutation({
    mutationFn: deleteAttendanceRules,
    onMutate: async (id) => {
      // Get ALL Attendance Rules queries from the cache
      const allQueries = queryClient.getQueriesData({
        queryKey: ["attendance-rules"],
      });
      // console.log("All queries:", allQueries);

      // Cancel all Attendance Rules queries
      await queryClient.cancelQueries({ queryKey: ["attendance-rules"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allQueries);

      // Update ALL Attendance Rules queries in the cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData?.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log(
            "Deleting Attendance Rules query:",
            queryKey,
            "with data:",
            old,
          );

          if (!old || !old?.data) return old;

          const newData = old?.data?.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Attendance Rules deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["attendance-rules"] });
    },
  });

  //..................................//........................

  // --- Add or Update ---
  response.addOrUpdatePersonalNoteMutation = useMutation({
    mutationFn: addOrUpdateNotes,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["personalNotes"] });

      // Get all current user queries for rollback
      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["personalNotes"],
      });
      const previousQueriesData = new Map(allUserQueries);

      // Optimistically update ALL user queries in the cache
      allUserQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Personal Note ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["personalNotes"] });
    },
  });

  // --- Delete ---
  response.deletePersonalNoteMutation = useMutation({
    mutationFn: deleteNotes,
    onMutate: async (id) => {
      // Get ALL note queries from the cache
      const allNoteQueries = queryClient.getQueriesData({
        queryKey: ["personalNotes"],
      });
      console.log("All queries:", allNoteQueries);

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: ["personalNotes"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allNoteQueries);

      // Update ALL note queries in the cache
      allNoteQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Personal Note deleted successfully", "success");
    },
  });

  // --- Toggle Status ---
  response.toggleArchivePersonalNoteMutation = useMutation({
    mutationFn: archiveNotes,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allRoleQueries = queryClient.getQueriesData({
        queryKey: ["personalNotes"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["personalNotes"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allRoleQueries);

      // Update ALL user queries in the cache
      allRoleQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          old.data.map((item) =>
            item.id === id ? { ...item, isArchived: !item.isArchived } : item,
          );

          const newData = old.data.filter((item) => item.id !== id);

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Personal Note archived successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["personalNotes"] });
    },
  });

  // --- Toggle Pin Status ---
  response.togglePinPersonalNoteMutation = useMutation({
    mutationFn: pinNotes,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allNoteQueries = queryClient.getQueriesData({
        queryKey: ["personalNotes"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["personalNotes"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allNoteQueries);

      // Update ALL user queries in the cache
      allNoteQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isPinned: !item.isPinned } : item,
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Personal Note pinned successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["personalNotes"] });
    },
  });

  // Archive Notes

  response.usePersonalArchiveNotesQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["archivedNotes", params],
      queryFn: () => fetchArchiveNotes(params),
      keepPreviousData: true,
    });
  };

  response.updateArchivePersonalNoteMutation = useMutation({
    mutationFn: addOrUpdateNotes,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["archivedNotes"] });

      // Get all current user queries for rollback
      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["archivedNotes"],
      });
      const previousQueriesData = new Map(allUserQueries);

      // Optimistically update ALL user queries in the cache
      allUserQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Archive Note ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["archivedNotes"] });
    },
  });
  const VisitApplicationKey = ["visit-applications"];
  //visit status update

  response.updateVisitStatusMutation = useMutation({
    mutationFn: updateVisitStatusApi,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["visit-applications"] });

      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["visit-applications"],
      });
      const previousQueriesData = new Map(allUserQueries);

      allUserQueries.forEach(([queryKey, old]) => {
        if (!old || !old.data) return;

        const oldPagination = old.pagination || {
          page: 1,
          total: 0,
          limit: 10,
          lastPage: 1,
          resultRows: 0,
        };

        const exists = old.data.some((item) => item.id === variables.id);
        const newData = exists
          ? old.data.map((item) =>
            item.id === variables.id
              ? {
                ...item,
                visitStatusId: variables.visitStatusId,
                remarks: variables.remarks,
              }
              : item,
          )
          : [...old.data, variables];

        queryClient.setQueryData(queryKey, {
          ...old,
          data: newData,
          pagination: {
            ...oldPagination,
            total: exists ? oldPagination.total : oldPagination.total + 1,
            resultRows: newData.length,
          },
        });
      });

      handleClose();
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Visit Status and Remarks ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["visit-applications"] });
      queryClient.invalidateQueries({ queryKey: ["apply-visit"] });
      queryClient.invalidateQueries({ queryKey: ["visit-employee"] });
      queryClient.refetchQueries({ queryKey: ["visit-applications"] });
      queryClient.refetchQueries({ queryKey: ["apply-visit"] });
      queryClient.refetchQueries({ queryKey: ["visit-employee"] });
    },
  });

  // apply Status for visit

  response.updateApplyForVisit = useMutation({
    mutationFn: updateApplyStatusApi,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["visit-applications"] });

      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["visit-applications"],
      });
      const previousQueriesData = new Map(allUserQueries);

      allUserQueries.forEach(([queryKey, old]) => {
        if (!old || !old.data) return;

        const oldPagination = old.pagination || {
          page: 1,
          total: 0,
          limit: 10,
          lastPage: 1,
          resultRows: 0,
        };

        const exists = old.data.some((item) => item.id === variables.id);
        const newData = exists
          ? old.data.map((item) =>
            item.id === variables.id
              ? {
                ...item,
                applicationStatusId: variables.applicationStatusId,
                remarks: variables.remarks,
              }
              : item,
          )
          : [...old.data, variables];

        queryClient.setQueryData(queryKey, {
          ...old,
          data: newData,
          pagination: {
            ...oldPagination,
            total: exists ? oldPagination.total : oldPagination.total + 1,
            resultRows: newData.length,
          },
        });
      });

      handleClose();
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Apply Status and Remarks ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["visit-applications"] });
      queryClient.invalidateQueries({ queryKey: ["apply-visit"] });
      queryClient.invalidateQueries({ queryKey: ["visit-employee"] });
      queryClient.refetchQueries({ queryKey: ["visit-applications"] });
      queryClient.refetchQueries({ queryKey: ["apply-visit"] });
      queryClient.refetchQueries({ queryKey: ["visit-employee"] });
    },
  });

  //update Checkin and Checkout Time.........

  response.updateCheckInAndCheckOutTime = useMutation({
    mutationFn: updateTimeStatusApi,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["visit-applications"] });

      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["visit-applications"],
      });
      const previousQueriesData = new Map(allUserQueries);

      allUserQueries.forEach(([queryKey, old]) => {
        if (!old || !old.data) return;

        const oldPagination = old.pagination || {
          page: 1,
          total: 0,
          limit: 10,
          lastPage: 1,
          resultRows: 0,
        };

        const exists = old.data.some((item) => item.id === variables.id);
        const newData = exists
          ? old.data.map((item) =>
            item.id === variables.id
              ? {
                ...item,
                visitStatusId: variables.visitStatusId,
                remarks: variables.remarks,
              }
              : item,
          )
          : [...old.data, variables];

        queryClient.setQueryData(queryKey, {
          ...old,
          data: newData,
          pagination: {
            ...oldPagination,
            total: exists ? oldPagination.total : oldPagination.total + 1,
            resultRows: newData.length,
          },
        });
      });

      handleClose();
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Check In / Out ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["visit-applications"] });
      queryClient.invalidateQueries({ queryKey: ["apply-visit"] });
      queryClient.invalidateQueries({ queryKey: ["visit-employee"] });
      queryClient.refetchQueries({ queryKey: ["visit-applications"] });
      queryClient.refetchQueries({ queryKey: ["apply-visit"] });
      queryClient.refetchQueries({ queryKey: ["visit-employee"] });
    },
  });

  // --- Toggle Pin Status ---
  response.togglePinArchivePersonalNoteMutation = useMutation({
    mutationFn: pinNotes,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allNoteQueries = queryClient.getQueriesData({
        queryKey: ["archivedNotes"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["archivedNotes"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allNoteQueries);

      // Update ALL user queries in the cache
      allNoteQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isPinned: !item.isPinned } : item,
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Archive Note pinned successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["archivedNotes"] });
    },
  });

  // --- Toggle Archive Status ---
  response.toggleBackArchivePersonalNoteMutation = useMutation({
    mutationFn: archiveNotes,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allArchiveQueries = queryClient.getQueriesData({
        queryKey: ["archivedNotes"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["archivedNotes"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allArchiveQueries);

      // Update ALL user queries in the cache
      allArchiveQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          old.data.map((item) =>
            item.id === id ? { ...item, isArchived: !item.isArchived } : item,
          );

          const newData = old.data.filter((item) => item.id !== id);

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Personal Note restored successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["archivedNotes"] });
    },
  });
  // --- Delete ---
  response.deletePersonalArchiveNoteMutation = useMutation({
    mutationFn: deleteNotes,
    onMutate: async (id) => {
      // Get ALL note queries from the cache
      const allNoteQueries = queryClient.getQueriesData({
        queryKey: ["archivedNotes"],
      });
      console.log("All queries:", allNoteQueries);

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: ["archivedNotes"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allNoteQueries);

      // Update ALL note queries in the cache
      allNoteQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Personal Note deleted successfully", "success");
    },
  });
  // ===================================== End Personal Notes =====================================

  // ===================================== Start Notice Notes =====================================
  // --- Fetch Data ---
  response.useNoticeQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["notice", params],
      queryFn: () => fetchNotice(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  const NOTICE_QUERY_KEY = ["notice"];

  // --- Add or Update ---
  response.addOrUpdateNoticeMutation = useMutation({
    mutationFn: (variables) => addOrUpdateNotice(variables, NOTICE_QUERY_KEY),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["notice"] });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["notice"],
      });
      const previousQueriesData = new Map(allItemsQueries);

      // Optimistically update ALL items queries in the cache
      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Notice Note ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["notice"] });
    },
  });

  // --- Delete ---
  response.deleteNoticeMutation = useMutation({
    mutationFn: (id) => deleteNotice(id, NOTICE_QUERY_KEY),
    onMutate: async (id) => {
      // Get ALL note queries from the cache
      const allNoteQueries = queryClient.getQueriesData({
        queryKey: ["notice"],
      });
      console.log("All queries:", allNoteQueries);

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: ["notice"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allNoteQueries);

      // Update ALL note queries in the cache
      allNoteQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Notice deleted successfully", "success");
    },
  });

  // --- Toggle Status ---
  response.toggleNoticeStatusMutation = useMutation({
    mutationFn: (id) => toggleStatusNotice(id, NOTICE_QUERY_KEY),
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allNoteQueries = queryClient.getQueriesData({
        queryKey: ["notice"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["notice"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allNoteQueries);

      // Update ALL user queries in the cache
      allNoteQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isActive: !item.isActive } : item,
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Notice status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["notice"] });
    },
  });

  // ===================== End Notice =====================

  // =================  Start Office ==================
  // --- Fetch Data ---
  response.useOfficeQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["office", params],
      queryFn: () => fetchOffice(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
    });
  };

  response.useOfficeListQuery = () => {
    return useQuery({
      queryKey: ["officeList"],
      queryFn: () => fetchOfficeList(),
      // staleTime: 1000 * 4,         // fresh for 4s
      // gcTime: 1000 * 7,            // cache kept for 7s after last unmount
    });
  };

  // --- Add or Update ---
  response.addOrUpdateOfficeMutation = useMutation({
    mutationFn: addOrUpdateOffice,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL office queries
      await queryClient.cancelQueries({ queryKey: ["office"] });

      // Get all current office queries for rollback
      const allOfficeQueries = queryClient.getQueriesData({
        queryKey: ["office"],
      });
      const previousQueriesData = new Map(allOfficeQueries);

      // Optimistically update ALL office queries in the cache
      allOfficeQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !Array.isArray(old.data)) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          const currentTotal = old.pagination?.total ?? old.data.length;

          return {
            ...old,
            data: newData,
            pagination: old.pagination
              ? {
                ...old.pagination,
                total: exists ? currentTotal : currentTotal + 1,
                resultRows: newData.length,
              }
              : {
                page: 1,
                total: newData.length,
                limit: 10,
                lastPage: 1,
                resultRows: newData.length,
              },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Office ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["office"] });
      queryClient.invalidateQueries({ queryKey: ["officeList"] });
    },
  });

  // --- Delete ---
  response.deleteOfficeMutation = useMutation({
    mutationFn: deleteOffice,
    onMutate: async (id) => {
      // Get ALL office queries from the cache
      const allOfficeQueries = queryClient.getQueriesData({
        queryKey: ["office"],
      });
      // console.log("All queries:", allOfficeQueries);

      // Cancel all office queries
      await queryClient.cancelQueries({ queryKey: ["office"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allOfficeQueries);

      // Update ALL office queries in the cache
      allOfficeQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !Array.isArray(old.data)) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: old.pagination
              ? {
                ...old.pagination,
                total: Math.max((old.pagination.total ?? 1) - 1, 0),
                resultRows: newData.length,
              }
              : old.pagination,
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Office deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["office"] });
      queryClient.invalidateQueries({ queryKey: ["officeList"] });
    },
  });

  // --- Toggle Status ---
  response.toggleStatusOfficeMutation = useMutation({
    mutationFn: toggleStatusOffice,
    onMutate: async (id) => {
      // Get ALL office queries from the cache
      const allOfficeQueries = queryClient.getQueriesData({
        queryKey: ["office"],
      });

      // Cancel all office queries
      await queryClient.cancelQueries({ queryKey: ["office"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allOfficeQueries);

      // Update ALL office queries in the cache
      allOfficeQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          old.data.map((item) =>
            item.id === id ? { ...item, isArchived: !item.isArchived } : item,
          );

          const newData = old.data.filter((item) => item.id !== id);

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Office status updated  successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["office"] });
      queryClient.invalidateQueries({ queryKey: ["officeList"] });
    },
  });

  // ================ End Office ================//

  // ================ Start OfficeShift ================//
  // --- Fetch Data ---
  // const useOfficeShiftQuery = (params = {}) => {
  //   // console.log('params => ', params);
  //   return useQuery({
  //     queryKey: ["office-shift", params],
  //     queryFn: () => fetchOfficeShift(params),
  //     keepPreviousData: true,
  //   });
  // };
  // --- Fetch Data by Office ID ---
  response.useOfficeShiftsByOfficeIdQuery = (officeId) => {
    return useQuery({
      queryKey: ["office-shift", officeId],
      queryFn: () => fetchOfficeShiftsByOfficeId(officeId),
      enabled: Boolean(officeId),
      keepPreviousData: true,
    });
  };

  // --- Add or Update ---
  response.addOrUpdateOfficeShiftMutation = useMutation({
    mutationFn: addOrUpdateOfficeShift,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL office shift queries
      await queryClient.cancelQueries({ queryKey: ["office-shift"] });
      await queryClient.cancelQueries({ queryKey: ["office"] });

      // Get all current office-shift queries for rollback
      const allOfficeShiftQueries = queryClient.getQueriesData({
        queryKey: ["office-shift"],
      });
      const previousQueriesData = new Map(allOfficeShiftQueries);

      const allOfficeQueries = queryClient.getQueriesData({
        queryKey: ["office"],
      });
      const previousOfficeQueriesData = new Map(allOfficeQueries);

      // Optimistically update ALL office shift queries in the cache
      allOfficeShiftQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          if (!Array.isArray(old.data)) return old;

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          const currentTotal =
            old.pagination?.total ?? old.data.length;

          return {
            ...old,
            data: newData,
            pagination: old.pagination
              ? {
                ...old.pagination,
                total: exists ? currentTotal : currentTotal + 1,
                resultRows: newData.length,
              }
              : old.pagination,
          };
        });
      });

      // Patch office list rows so Start/End + View reflect the new shift
      allOfficeQueries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old) => {
          if (!old?.data || !Array.isArray(old.data) || !variables.officeId) {
            return old;
          }
          return {
            ...old,
            data: old.data.map((office) => {
              if (office.id !== variables.officeId) return office;
              const existingShifts = Array.isArray(office.officeShifts)
                ? office.officeShifts
                : [];
              const exists = existingShifts.some((s) => s.id === variables.id);
              const officeShifts = exists
                ? existingShifts.map((s) =>
                  s.id === variables.id ? { ...s, ...variables } : s,
                )
                : [...existingShifts, variables];
              return {
                ...office,
                hasShift: true,
                officeShifts,
              };
            }),
          };
        });
      });

      // Return context for rollback
      return { previousQueriesData, previousOfficeQueriesData };
    },

    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousOfficeQueriesData) {
        context.previousOfficeQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Office Shift ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["office-shift"] });
      queryClient.invalidateQueries({ queryKey: ["office"] });
      queryClient.invalidateQueries({ queryKey: ["weekends"] });
      queryClient.invalidateQueries({ queryKey: ["officeList"] });
    },
  });

  // --- Delete ---
  response.deleteOfficeShiftMutation = useMutation({
    mutationFn: deleteOfficeShift,
    onMutate: async (id) => {
      // Get ALL office shift queries from the cache
      const allOfficeShiftQueries = queryClient.getQueriesData({
        queryKey: ["office-shift"],
      });
      // console.log("All queries:", allOfficeQueries);

      // Cancel all office queries
      await queryClient.cancelQueries({ queryKey: ["office-shift"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allOfficeShiftQueries);

      // Update ALL office queries in the cache
      allOfficeShiftQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !Array.isArray(old.data)) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: old.pagination
              ? {
                ...old.pagination,
                total: Math.max((old.pagination.total ?? 1) - 1, 0),
                resultRows: newData.length,
              }
              : old.pagination,
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Office shift deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["office"] });
      queryClient.invalidateQueries({ queryKey: ["officeList"] });
    },
  });

  // ===================== End Office Shift ================== //

  // ===================== User list ================== //

  response.useUserListQuery = () => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["user-list"],
      queryFn: async () => {
        try {
          return await fetchAllUsers();
        } catch (error) {
          // Suppress 404 errors - return empty array instead
          if (error?.response?.status === 404 || error?._isLeadEndpoint404) {
            return { data: [] };
          }
          throw error;
        }
      },
      // Suppress error logging for 404s (handled gracefully)
      onError: (error) => {
        // Only log non-404 errors or errors that aren't from user endpoints
        if (error?.response?.status !== 404 && !error?._isLeadEndpoint404) {
          console.error("User list fetch error:", error);
        }
      },
    });
  };

  // ===================== End User List ================== //

  // ===================== Start Employee ================== //

  response.useHrEmployeeQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["hrEmployee", params],
      queryFn: () => fetchEmployee(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
    });
  };

  // --- Delete ---
  response.deleteEmployeeMutation = useMutation({
    mutationFn: deleteEmployee,
    onMutate: async (id) => {
      // Get ALL employee queries from the cache
      const allEmployeeQuries = queryClient.getQueriesData({
        queryKey: ["hrEmployee"],
      });
      console.log("All queries:", allEmployeeQuries);

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: ["hrEmployee"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allEmployeeQuries);

      // Update ALL note queries in the cache
      allEmployeeQuries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Employee deleted successfully", "success");
    },
  });

  // ===================== End Employee ================== //

  // ===================== Start Employee Asset Allocation ================== //

  response.useAssetAllocationQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["assetAllocations", params],
      queryFn: () => fetchEmployeeAssetAllocation(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
    });
  };

  // --- Add or Update ---
  response.addOrUpdateAssetAllocationMutation = useMutation({
    mutationFn: addOrUpdateAssetAllocation,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["assetAllocations"] });

      // Get all current items queries for rollback
      const allItemQueries = queryClient.getQueriesData({
        queryKey: ["assetAllocations"],
      });
      const previousQueriesData = new Map(allItemQueries);

      // Optimistically update ALL user items in the cache
      allItemQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving data:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Asset Allocation ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate and refetch to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["assetAllocations"] });
      queryClient.refetchQueries({ queryKey: ["assetAllocations"] });
      queryClient.invalidateQueries({ queryKey: ["employeeAssetList"] });
    },
  });

  // --- Delete ---
  response.deleteAssetAllocationMutation = useMutation({
    mutationFn: deleteAssetAllocation,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["assetAllocations"],
      });
      console.log("All user queries:", allUserQueries);

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["assetAllocations"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allUserQueries);

      // Update ALL user queries in the cache
      allUserQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousData)
        queryClient.setQueryData(["assetAllocations"], context.previousData);
      toaster("Failed to delete data", "error");
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Data deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["employeeAssetList"] });
    },
  });

  // --- Toggle Status ---
  response.toggleAssetAllocationStatusMutation = useMutation({
    mutationFn: toggleAssetAllocationStatus,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["assetAllocations"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["assetAllocations"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allUserQueries);

      // Update ALL user queries in the cache
      allUserQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id
                ? { ...item, assetStatusId: !item.assetStatusId }
                : item,
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousData)
        queryClient.setQueryData(["assetAllocations"], context.previousData);
      toaster("Failed to update status", "error");
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("User status changed successfully", "success");
    },
  });

  response.useAssetTypeQuery = () => {
    return useQuery({
      queryKey: ["assetTypes"],
      queryFn: () => fetchAssetTypes(),
    });
  };

  response.useAppEmployeeUsersQuery = () => {
    return useQuery({
      queryKey: ["appEmployeeUsers"],
      queryFn: () => fetchAppEmployeeUsers(),
    });
  };

  response.useGlobalAssetTypeQuery = () => {
    return useQuery({
      queryKey: ["globalAssetTypes"],
      queryFn: () => fetchGlobalAssetTypes(),
    });
  };

  response.importGlobalAssetTypesMutation = useMutation({
    mutationFn: importGlobalAssetTypes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetTypes"] });
      toaster("Asset types imported successfully", "success");
    },
    onError: () => {
      toaster("Failed to import asset types", "error");
    },
  });

  // --- Add or Update ---
  response.addOrUpdateAssetTypeMutation = useMutation({
    mutationFn: createCompanyAssetType,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["assetTypes"] });

      // Get all current items queries for rollback
      const allItemQueries = queryClient.getQueriesData({
        queryKey: ["assetTypes"],
      });
      const previousQueriesData = new Map(allItemQueries);

      // Optimistically update ALL user items in the cache
      allItemQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      // handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving data:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Asset type ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["assetTypes"] });
    },
  });

  // --- Delete ---
  response.deleteAssetTypeMutation = useMutation({
    mutationFn: deleteAssetType,
    onMutate: async (id) => {
      await queryClient.cancelQueries(["assetTypes"]);
      const previousData = queryClient.getQueryData(["assetTypes"]);
      queryClient.setQueryData(
        ["assetTypes"],
        (old) => old?.filter((item) => item.value !== id) || [],
      );
      return { previousData };
    },
    onError: (err, id, context) => {
      if (context?.previousData)
        queryClient.setQueryData(["assetTypes"], context.previousData);
      toaster("Failed to delete data", err);
    },
    onSettled: () => { },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetTypes"] });
      toaster("Data deleted successfully", "success");
    },
  });

  // ===================== End Employee Asset Allocation ================== //

  // ===================== Start Employee Invitation ================== //

  response.useHrEmployeeInvitationQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["employeeInvitation", params],
      queryFn: () => fetchEmployeeInvitation(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
    });
  };

  response.sendEmployeeInvitationMutation = useMutation({
    mutationFn: sendEmployeeInvitation,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["employeeInvitation"] });

      // Get all current user queries for rollback
      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["employeeInvitation"],
      });
      const previousQueriesData = new Map(allUserQueries);

      // Optimistically update ALL user queries in the cache
      allUserQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              // total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(`Employee invitation send successfully`, "success");
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["employeeInvitation"] });
    },
  });
  // ===================== End Employee Invitation ================== //

  // ===================== Start Requisition ================== //

  response.useRequisitionQuery = (params = {}, options = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["requisition", params],
      queryFn: () => fetchRequisition(params),
      enabled: options.enabled ?? true,
      keepPreviousData: true,
    });
  };

  // Hook for fetching "My Requisition"
  response.useMyRequisitionQuery = (params = {}, options = {}) => {
    return useQuery({
      queryKey: ["my-requisition", params],
      queryFn: () => fetchMyRequisition(params),
      enabled: options.enabled ?? true,
      keepPreviousData: true,
    });
  };

  response.useAllPendingRequisitionQuery = (params = {}, options = {}) => {
    return useQuery({
      queryKey: ["all-pending-requisition", params],
      queryFn: () => fetchAllPendingRequisition(params),
      enabled: options.enabled ?? true,
      keepPreviousData: true,
    });
  };

  // Hook for fetching "Pending Requisition"
  response.usePendingRequisitionQuery = (params = {}) => {
    return useQuery({
      queryKey: ["pendingRequisition", params],
      queryFn: () => fetchPendingRequisition(params),
      keepPreviousData: true,
    });
  };

  response.useRequisitionByStatus = (options = {}) => {
    return useQuery({
      queryKey: ["requisition-status"],
      queryFn: fetchRequisitionByStatus,
      keepPreviousData: true,
      enabled: options?.enabled ?? true,
    });
  };

  // ===================== Start Single Requisition ================== //

  response.useSingleRequisitionQuery = (id) => {
    return useQuery({
      queryKey: ["single-requisition", id],
      queryFn: () => fetchSingleRequisition(id),
      enabled: !!id,
    });
  };

  // ===================== End Single Requisition ================== //
  // --- Add or Update ---
  response.addOrUpdateRequisitionMutation = useMutation({
    mutationFn: addOrUpdateRequisition,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL requisition queries
      await queryClient.cancelQueries({ queryKey: ["requisition"] });

      // Get all current requisition queries for rollback
      const allQueries = queryClient.getQueriesData({
        queryKey: ["requisition"],
      });
      const previousQueriesData = new Map(allQueries);

      // Optimistically update ALL requisition queries in the cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData?.data?.list) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data?.list) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old?.data?.list?.some(
            (item) => item.id === variables.id,
          );
          const newData = exists
            ? old.data?.list.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data.list, variables];

          return {
            ...old,
            data: {
              ...old.data,
              list: newData,
            },
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError, undefined, true);
    },
    onSuccess: (data, variables) => {
      handleClose();
      toaster(
        `Requisition ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["requisition"] });
      queryClient.invalidateQueries({ queryKey: ["requisition-status"] });
      queryClient.invalidateQueries({ queryKey: ["my-requisition"] });
      queryClient.invalidateQueries({ queryKey: ["all-pending-requisition"] });
    },
  });

  // --- status change ---
  response.requisitionStatusChangeMutation = useMutation({
    mutationFn: requisitionStatusChange,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL requisition queries
      await queryClient.cancelQueries({ queryKey: ["requisition"] });

      // Get all current requisition queries for rollback
      const allQueries = queryClient.getQueriesData({
        queryKey: ["requisition"],
      });
      const previousQueriesData = new Map(allQueries);

      // Optimistically update ALL requisition queries in the cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData?.data?.list) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data?.list) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old?.data?.list?.some(
            (item) => item.id === variables.id,
          );
          const newData = exists
            ? old.data?.list.map((item) =>
              item.id === variables.id ? { ...item, ...variables } : item,
            )
            : [...old.data.list, variables];

          return {
            ...old,
            data: {
              ...old.data,
              list: newData,
            },
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error updating requisition status:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(`Requisition Status changed successfully`, "success");
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["requisition"] });
      queryClient.invalidateQueries({ queryKey: ["requisition-status"] });
      queryClient.invalidateQueries({ queryKey: ["my-requisition"] });
      queryClient.invalidateQueries({ queryKey: ["all-pending-requisition"] });
      queryClient.invalidateQueries({ queryKey: ["pendingRequisition"] });
    },
  });

  // --- Delete ---
  response.deleteRequisitionMutation = useMutation({
    mutationFn: deleteRequisition,
    onMutate: async (id) => {
      // Get ALL requisition queries from the cache
      const allQueries = queryClient.getQueriesData({
        queryKey: ["requisition"],
      });
      // console.log("All queries:", allQueries);

      // Cancel all requisition queries
      await queryClient.cancelQueries({ queryKey: ["requisition"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allQueries);

      // Update ALL requisition queries in the cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData?.data?.list) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log(
            "Deleting requisition query:",
            queryKey,
            "with data:",
            old,
          );

          if (!old || !old?.data?.list) return old;

          const newData = old?.data?.list.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Requisition deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["requisition"] });
      queryClient.invalidateQueries({ queryKey: ["requisition-status"] });
      queryClient.invalidateQueries({ queryKey: ["my-requisition"] });
      queryClient.invalidateQueries({ queryKey: ["all-pending-requisition"] });
    },
  });

  // ===================== End Requisition ================== //

  // ===================== Start Training Request ================== //
  response.useTrainingRequestQuery = (params = {}, options = {}) =>
    useQuery({
      queryKey: ["trainingRequest", params],
      queryFn: () => fetchTrainingRequests(params),
      enabled: options.enabled ?? true,
      keepPreviousData: true,
    });

  response.usePendingTrainingRequestQuery = (params = {}, options = {}) =>
    useQuery({
      queryKey: ["pendingTrainingRequest", params],
      queryFn: () => fetchPendingTrainingRequests(params),
      enabled: options.enabled ?? true,
      keepPreviousData: true,
    });

  response.useApprovedTrainingRequestQuery = (params = {}, options = {}) =>
    useQuery({
      queryKey: ["approvedTrainingRequest", params],
      queryFn: () => fetchApprovedTrainingRequests(params),
      enabled: options.enabled ?? true,
      keepPreviousData: true,
    });

  response.useRejectedTrainingRequestQuery = (params = {}, options = {}) =>
    useQuery({
      queryKey: ["rejectedTrainingRequest", params],
      queryFn: () => fetchRejectedTrainingRequests(params),
      enabled: options.enabled ?? true,
      keepPreviousData: true,
    });

  response.useTrainingRequestsByEmployeeIdQuery = (employeeId, params = {}, options = {}) =>
    useQuery({
      queryKey: ["trainingRequestsByEmployeeId", employeeId, params],
      queryFn: () => fetchTrainingRequestsByEmployeeId(employeeId, params),
      enabled: (options.enabled ?? true) && !!employeeId,
      keepPreviousData: true,
    });

  response.useMyTrainingRequestsQuery = (params = {}) =>
    useQuery({
      queryKey: ["myTrainingRequests", params],
      queryFn: () => fetchMyTrainingRequests(params),
      keepPreviousData: true,
    });

  response.useTrainingRequestByIdQuery = (id, options = {}) =>
    useQuery({
      queryKey: ["trainingRequestById", id],
      queryFn: () => fetchTrainingRequestById(id),
      enabled: (options.enabled ?? true) && !!id,
    });

  response.addOrUpdateTrainingRequestMutation = useMutation({
    mutationFn: addOrUpdateTrainingRequest,
    onError: (error, variables) => {
      console.error("Error saving training request:", error);
      reset?.(variables);
      setShowModal?.(true);
      if (setError) {
        helpers.handleApiValidationError(error, setError, undefined, true);
      }
    },
    onSuccess: (_, variables) => {
      handleClose?.();
      toaster(
        `Training request ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["trainingRequest"] });
      queryClient.invalidateQueries({ queryKey: ["myTrainingRequests"] });
    },
  });

  response.trainingRequestStatusChangeMutation = useMutation({
    mutationFn: trainingRequestStatusChange,
    onError: (error) => {
      console.error("Error updating training request status:", error);
    },
    onSuccess: () => {
      toaster("Training request status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["trainingRequest"] });
    },
  });

  response.deleteTrainingRequestMutation = useMutation({
    mutationFn: deleteTrainingRequest,
    onError: (error) => {
      console.error("Error deleting training request:", error);
    },
    onSuccess: () => {
      toaster("Training request deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["trainingRequest"] });
    },
  });
  // ====================== End Training Request =================== //

  // ===================== Start Leave Request ================== //
  response.useAllLeaveRequestSummaryQuery = () => {
    return useQuery({
      queryKey: ["leave-request-summary"],
      queryFn: () => fetchLeaveSummaryList(),
      keepPreviousData: true,
      staleTime: 30 * 1000,
    });
  };

  // useMyLeavePolicyQuery is assigned at the top of useHrQueryApi (named export)
  response.useLeaveTypeQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["leave-type", params],
      queryFn: () => fetchLeaveType(params),
      keepPreviousData: true,
    });
  };

  response.getLeaveTypeById = async (id) => {
    return await getLeaveTypeById(id);
  };

  response.addOrUpdateLeaveTypeMutation = useMutation({
    mutationFn: addOrUpdateLeaveType,
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: () => {
      toaster("Leave type saved successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["leave-type"] });
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      queryClient.invalidateQueries({ queryKey: ["my-leave-policy"] });
    },
  });

  response.deleteLeaveTypeMutation = useMutation({
    mutationFn: deleteLeaveType,
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: () => {
      toaster("Leave type deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["leave-type"] });
    },
  });

  response.useMyLeaveRequestQuery = (params = {}, options = {}) => {
    return useQuery({
      queryKey: ["leave-request", params],
      queryFn: () => fetchMyLeaveRequest(params),
      keepPreviousData: true,
      ...options,
    });
  };
  response.useAllLeaveRequestQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["all-leave-request", params],
      queryFn: () => fetchAllLeaveRequest(params),
      keepPreviousData: true,
    });
  };

  //Get Pending Leave Request...........
  response.useAllPendingLeaveRequestQuery = (params = {}) => {
    return useQuery({
      queryKey: ["all-pending-leave-request", params],
      queryFn: () => fetchAllPendingLeaveRequest(params),
      keepPreviousData: true,
    });
  };

  response.updateLeaveRequestStatusMutation = useMutation({
    mutationFn: updateLeaveRequestApprovalStatus,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for leave requests
      await queryClient.cancelQueries({ queryKey: ["all-leave-request"] });

      // Save current cache for rollback
      const allQueries = queryClient.getQueriesData({
        queryKey: ["all-leave-request"],
      });
      const previousQueriesData = new Map(allQueries);

      // Optimistically update cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData?.data?.list) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data?.list) return { ...old, data: [variables] };

          const exists = old.data.list.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.list.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data.list, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      return { previousQueriesData };
    },

    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      toaster("Leave request status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["all-leave-request"] });
      queryClient.invalidateQueries({
        queryKey: ["all-pending-leave-request"],
      });
      queryClient.invalidateQueries({ queryKey: ["leave-request-summary"] });
      queryClient.invalidateQueries({ queryKey: ["leaveReport"] });
      queryClient.invalidateQueries({ queryKey: ["employee-leave-balance"] });
    },
  });

  // --- Add or Update ---
  response.addOrUpdateLeaveRequestMutation = useMutation({
    mutationFn: addOrUpdateLeaveRequest,
    onError: (error, variables) => {
      console.error("Error saving leave request:", error);
      reset(variables);
      helpers.handleApiValidationError(error, setError, "Failed to save leave request", true);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Leave request${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      handleClose();
      queryClient.invalidateQueries({ queryKey: ["leave-request"] });
      queryClient.invalidateQueries({ queryKey: ["all-leave-request"] });
      queryClient.invalidateQueries({ queryKey: ["leave-request-summary"] });
      queryClient.invalidateQueries({ queryKey: ["my-leave-policy"] });
    },
  });

  // --- Delete ---
  response.deleteLeaveRequestMutation = useMutation({
    mutationFn: deleteLeaveRequest,
    onMutate: async (id) => {
      // Get ALL employee queries from the cache
      const data = queryClient.getQueriesData({
        queryKey: ["leave-request"],
      });
      // console.log("All queries:", data);

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: ["leave-request"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(data);

      // Update ALL note queries in the cache
      data.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Employee deleted successfully", "success");
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["leave-request"] });
    },
  });

  // ===================== Start Weekends ================== //

  response.useWeekendsQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["weekends", params],
      queryFn: () => fetchWeekend(params),
      keepPreviousData: true,
    });
  };

  response.addOrUpdateWeekendMutation = useMutation({
    mutationFn: addOrUpdateWeekend,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["weekends"] });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["weekends"],
      });
      const previousQueriesData = new Map(allItemsQueries);

      // Optimistically update ALL items queries in the cache
      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Weekend ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["weekends"] });
    },
  });

  response.deleteWeekendMutation = useMutation({
    mutationFn: deleteWeekend,
    onMutate: async (id) => {
      // Get ALL office queries from the cache
      const allQueries = queryClient.getQueriesData({
        queryKey: ["weekends"],
      });

      await queryClient.cancelQueries({ queryKey: ["weekends"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allQueries);

      // Update ALL weekends queries in the cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Weekend deleted successfully", "success");
    },
  });

  // ===================================== Start Holiday =====================================
  const Holiday_QUERY_KEY = ["holiday"];
  // --- Fetch Data ---
  response.useHolidayQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["holiday", params],
      queryFn: () => fetchHoliday(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  // --- Add or Update ---
  response.addOrUpdateHolidayMutation = useMutation({
    mutationFn: (variables) => addOrUpdateHoliday(variables, Holiday_QUERY_KEY),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["holiday"] });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["holiday"],
      });
      const previousQueriesData = new Map(allItemsQueries);

      // Optimistically update ALL items queries in the cache
      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Holiday ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["holiday"] });
    },
  });

  // --- Delete ---
  response.deleteHolidayMutation = useMutation({
    mutationFn: (id) => deleteHoliday(id, Holiday_QUERY_KEY),
    onMutate: async (id) => {
      // Get ALL office queries from the cache
      const allQueries = queryClient.getQueriesData({
        queryKey: ["holiday"],
      });

      await queryClient.cancelQueries({ queryKey: ["holiday"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allQueries);

      // Update ALL weekends queries in the cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Weekend deleted successfully", "success");
    },
  });

  // --- Toggle Status ---
  response.toggleHolidayStatusMutation = useMutation({
    mutationFn: (id) => toggleStatusHoliday(id, Holiday_QUERY_KEY),
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allNoteQueries = queryClient.getQueriesData({
        queryKey: ["holiday"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["holiday"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allNoteQueries);

      // Update ALL user queries in the cache
      allNoteQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isActive: !item.isActive } : item,
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Holiday status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["holiday"] });
    },
  });

  // ===================== End Holiday =====================

  // ================ Start office Holiday ================

  const Office_Holiday_QUERY_KEY = ["office_holiday"];
  // --- Fetch Data ---
  response.useOfficeHolidayQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["office_holiday", params],
      queryFn: () => fetchOfficeHoliday(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  // --- Add or Update ---
  response.addOrUpdateOfficeHolidayMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdateOfficeHoliday(variables, Office_Holiday_QUERY_KEY),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["office_holiday"] });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["office_holiday"],
      });
      const previousQueriesData = new Map(allItemsQueries);

      // Optimistically update ALL items queries in the cache
      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Office Holiday ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["office_holiday"] });
    },
  });

  // --- Delete ---
  response.deleteOfficeHolidayMutation = useMutation({
    mutationFn: (id) => deleteOfficeHoliday(id, Office_Holiday_QUERY_KEY),
    onMutate: async (id) => {
      // Get ALL office queries from the cache
      const allQueries = queryClient.getQueriesData({
        queryKey: ["office_holiday"],
      });

      await queryClient.cancelQueries({ queryKey: ["office_holiday"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allQueries);

      // Update ALL weekends queries in the cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Office Holiday deleted successfully", "success");
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["office_holiday"] });
    },
  });

  // ===================== End Office Holiday =====================

  // ================= Start All Employee Attendance ==================

  const All_Employee_Attendance_QUERY_KEY = ["all_employee_attendance"];
  // --- Fetch Data ---
  response.useAllEmployeeAttendanceQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: [All_Employee_Attendance_QUERY_KEY, params],
      queryFn: () => fetchAllEmployeeAttendance(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  const AttendanceReconQueryKey = ["employee_attendance_reconciliations"];
  response.useAllEmployeeAttendanceReconciliationsQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["employee_attendance_reconciliations", params],
      queryFn: () => fetchEmployeeAttendanceReconciliations(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  const Pending_Attendance_QUERY_KEY = ["pending_attendance"];
  response.usePendingAttendanceQuery = (params = {}) => {
    return useQuery({
      queryKey: [Pending_Attendance_QUERY_KEY, params],
      queryFn: () => fetchPendingAttendance(params),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };
  // ================= End All Employee Attendance ==================
  // response.toggleAttendanceReconInTimeStatus = useMutation({
  //   mutationFn: (id) =>
  //     attendanceReconInTimeStatus(id, AttendanceReconQueryKey),
  //   onMutate: async (id) => {
  //     // Get ALL user queries from the cache
  //     const allNoteQueries = queryClient.getQueriesData({
  //       queryKey: AttendanceReconQueryKey,
  //     });

  //     // Cancel all user queries
  //     await queryClient.cancelQueries({
  //       queryKey: AttendanceReconQueryKey,
  //     });

  //     // Store previous data for all queries
  //     const previousQueriesData = new Map(allNoteQueries);

  //     // Update ALL user queries in the cache
  //     allNoteQueries.forEach(([queryKey, oldData]) => {
  //       if (!oldData || !oldData.data) return;

  //       queryClient.setQueryData(queryKey, (old) => {
  //         if (!old || !old.data) return old;

  //         return {
  //           ...old,
  //           data: old.data.map((item) =>
  //             item.id === id ? { ...item, isActive: !item.isActive } : item
  //           ),
  //         };
  //       });
  //     });

  //     return { previousQueriesData };
  //   },
  //   onError: (err, id, context) => {
  //     if (context?.previousQueriesData) {
  //       context.previousQueriesData.forEach((data, queryKey) => {
  //         queryClient.setQueryData(queryKey, data);
  //       });
  //     }
  //   },
  //   onSettled: () => {},
  //   onSuccess: () => {
  //     toaster("InTime status changed successfully", "success");
  //     queryClient.invalidateQueries({ queryKey: AttendanceReconQueryKey });
  //   },
  // });

  // ================= Start Employee Dashboard Data ==================

  response.useFetchEmployeeDashboardDataQuery = (id) => {
    return useQuery({
      queryKey: ["employee_dashboard_data", id],
      queryFn: () => fetchEmployeeDashboardDataById(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  response.useFetchEmployeeDashboardDataWithoutIdQuery = (enabled = true) => {
    return useQuery({
      queryKey: ["employee_dashboard_data"],
      queryFn: () => fetchEmployeeDashboardData(),
      keepPreviousData: true,
      enabled: isOnline && enabled,
    });
  };

  response.useFetchEmployeeEventCalendarQuery = (id) => {
    return useQuery({
      queryKey: ["employee_event_calendar", id],
      queryFn: () => fetchEmployeeEventCalendar(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  response.useFetchEmployeeEventCalendarWithoutIdQuery = (enabled = true) => {
    return useQuery({
      queryKey: ["employee_event_calendar"],
      queryFn: () => fetchEmployeeEventCalendarWithoutId(),
      keepPreviousData: true,
      enabled: isOnline && enabled,
    });
  };

  response.useFetchEmployeeProfileDashboardDataQuery = (id) => {
    return useQuery({
      queryKey: ["employee_profile_dashboard_data", id],
      queryFn: () => fetchEmployeeProfileDashboardData(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  response.useFetchEmployeeProfileDashboardDataWithoutIdQuery = (enabled = true) => {
    return useQuery({
      queryKey: ["employee_profile_dashboard_data"],
      queryFn: () => fetchEmployeeProfileDashboardDataWithoutId(),
      keepPreviousData: true,
      enabled: isOnline && enabled,
    });
  };

  // --- Fetch Data ---
  response.useFetchEmployeeHierarchyByEmployeeIdQuery = (id) => {
    return useQuery({
      queryKey: ["employeeHierarchyByEmployeeId", id],
      queryFn: () => fetchEmployeeHierarchyByEmployeeId(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  // --- Fetch Data Without id---
  response.useFetchEmployeeHierarchyByEmployeeQuery = (enabled = true) => {
    return useQuery({
      queryKey: ["employeeHierarchyByEmployeeId"],
      queryFn: () => fetchEmployeeHierarchyByEmployee(),
      keepPreviousData: true,
      enabled: isOnline && enabled,
    });
  };

  response.toggleCheckInReconciliationStatus = useMutation({
    mutationFn: (variables) =>
      updateCheckInReconciliationStatus(variables, AttendanceReconQueryKey),
    onMutate: async (variables) => {
      // Get ALL reconciliation queries from the cache
      const allReconQueries = queryClient.getQueriesData({
        queryKey: AttendanceReconQueryKey,
      });

      // Cancel all reconciliation queries
      await queryClient.cancelQueries({ queryKey: AttendanceReconQueryKey });

      // Store previous data for all queries
      const previousQueriesData = new Map(allReconQueries);

      // Update ALL reconciliation queries in the cache
      allReconQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data?.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data?.data) return old;

          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((item) =>
                item.id === variables.id
                  ? {
                    ...item,
                    inTimeStatusId: variables.data.inTimeStatusId,
                    inTimeRemarks: variables.data.inTimeRemarks,
                    inTimeStatus:
                      oldData.attendanceStatusList?.find(
                        (s) => s.value === variables.data.inTimeStatusId,
                      ) || item.inTimeStatus,
                    inTimeApproveDate: new Date().toISOString(),
                    inTimeSupervisorRemarks: variables.data.inTimeRemarks,
                    updatedAt: new Date().toISOString(),
                  }
                  : item,
              ),
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, variables, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toaster("Failed to update check-in status", "error");
    },
    onSettled: () => { },
    onSuccess: (data, variables) => {
      toaster("Check-in status updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: AttendanceReconQueryKey });
    },
  });

  // --- Update CheckOut Reconciliation Status ---
  response.toggleCheckOutReconciliationStatus = useMutation({
    mutationFn: (variables) =>
      updateCheckOutReconciliationStatus(variables, AttendanceReconQueryKey),
    onMutate: async (variables) => {
      // Get ALL reconciliation queries from the cache
      const allReconQueries = queryClient.getQueriesData({
        queryKey: AttendanceReconQueryKey,
      });

      // Cancel all reconciliation queries
      await queryClient.cancelQueries({ queryKey: AttendanceReconQueryKey });

      // Store previous data for all queries
      const previousQueriesData = new Map(allReconQueries);

      // Update ALL reconciliation queries in the cache
      allReconQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data?.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data?.data) return old;

          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((item) =>
                item.id === variables.id
                  ? {
                    ...item,
                    outTimeStatusId: variables.data.outTimeStatusId,
                    outTimeRemarks: variables.data.outTimeRemarks,
                    outTimeStatus:
                      oldData.attendanceStatusList?.find(
                        (s) => s.value === variables.data.outTimeStatusId,
                      ) || item.outTimeStatus,
                    outTimeApproveDate: new Date().toISOString(),
                    outTimeSupervisorRemarks: variables.data.outTimeRemarks,
                    updatedAt: new Date().toISOString(),
                  }
                  : item,
              ),
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, variables, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toaster("Failed to update check-out status", "error");
    },
    onSettled: () => { },
    onSuccess: (data, variables) => {
      toaster("Check-out status updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: AttendanceReconQueryKey });
    },
  });
  // ================= End Employee Dashboard Data ==================

  // --- Fetch Data ---
  // response.useMonthlyAttendanceQuery = (id) => {
  //   return useQuery({
  //     queryKey: ["monthly_attendance", id],
  //     queryFn: () => fetchMonthlyAttendance(id),
  //     keepPreviousData: true,
  //     enabled: isOnline,
  //   });
  // };

  const MONTHLY_ATTENDANCE_QUERY_KEY = ["monthly_attendance"];
  // --- Fetch Data ---
  response.useMonthlyAttendanceQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: [MONTHLY_ATTENDANCE_QUERY_KEY, params],
      queryFn: () => fetchMonthlyEmployeeAttendance(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  response.useFetchEmployeeDashboardUpcomingEvents = (id) => {
    return useQuery({
      queryKey: ["employee_dashboard_upcoming_events", id],
      queryFn: () => fetchGetEmployeeUpComingEvents(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  response.useFetchEmployeeDashboardUpcomingEventsWithoutId = (enabled = true) => {
    return useQuery({
      queryKey: ["employee_dashboard_upcoming_events"],
      queryFn: () => fetchGetEmployeeUpComingEventsWithoutId(),
      keepPreviousData: true,
      enabled: isOnline && enabled,
    });
  };

  response.useFetchMyUpcomingEvents = () => {
    return useQuery({
      queryKey: ["my_upcoming_events"],
      queryFn: () => fetchGetMyUpComingEvents(),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  response.useFetchEvents = () => {
    return useQuery({
      queryKey: ["all_Events"],
      queryFn: () => fetchGetAllEvents(),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  response.addOrUpdateEventMutation = useMutation({
    mutationFn: (variables) => addOrUpdateEvent(variables, ["all_Events"]),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["all_Events"] });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["all_Events"],
      });
      const previousQueriesData = new Map(allItemsQueries);

      // Optimistically update ALL items queries in the cache
      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Event ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["all_Events"] });
    },
  });

  response.deleteEventMutation = useMutation({
    mutationFn: (id) => deleteEvent(id, ["all_Events"]),
    onMutate: async (id) => {
      // Get ALL office queries from the cache
      const allQueries = queryClient.getQueriesData({
        queryKey: ["all_Events"],
      });

      await queryClient.cancelQueries({ queryKey: ["all_Events"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allQueries);

      // Update ALL weekends queries in the cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Event deleted successfully", "success");
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["all_Events"] });
    },
  });

  response.useFetchDashboardCalendarQuery = () => {
    return useQuery({
      queryKey: ["dashboard-calendar"],
      queryFn: () => fetchDashboardCalendar(),
      enabled: isOnline,
    });
  };
  response.useSingleEventQuery = (id) => {
    return useQuery({
      queryKey: ["single_event", id],
      queryFn: () => fetchSingleEvent(id),
      enabled: !!id,
    });
  };

  // ============Task Workspace ============
  response.useTaskWorkspacesQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["task-workspaces", params],
      queryFn: () => fetchTaskWorkspaces(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  response.addOrUpdateTaskWorkspaceMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdateTaskWorkspace(variables, ["task-workspaces"]),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["task-workspaces"] });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["task-workspaces"],
      });
      const previousQueriesData = new Map(allItemsQueries);

      // Optimistically update ALL items queries in the cache
      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Task ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["task-workspaces"] });
    },
  });

  response.deleteTaskWorkspaceMutation = useMutation({
    mutationFn: (id) => deleteTaskWorkspace(id, ["task-workspaces"]),
    onMutate: async (id) => {
      // Get ALL office queries from the cache
      const allQueries = queryClient.getQueriesData({
        queryKey: ["task-workspaces"],
      });

      await queryClient.cancelQueries({ queryKey: ["task-workspaces"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allQueries);

      // Update ALL weekends queries in the cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Task deleted successfully", "success");
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["task-workspaces"] });
    },
  });

  response.toggleTaskWorkspaceStatusMutation = useMutation({
    mutationFn: (id) =>
      changeTaskWorkspaceActiveStatus(id, ["task-workspaces"]),
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allNoteQueries = queryClient.getQueriesData({
        queryKey: ["task-workspaces"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["task-workspaces"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allNoteQueries);

      // Update ALL user queries in the cache
      allNoteQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isActive: !item.isActive } : item,
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Task status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["task-workspaces"] });
    },
  });

  // ====Task boards =====
  // --- Fetch Data ---
  response.useTaskBoardsQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["task-boards", params],
      queryFn: () => fetchTaskBoards(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  // --- Add/Update ---
  response.addOrUpdateTaskBoardMutation = useMutation({
    mutationFn: (variables) => addOrUpdateTaskBoard(variables, ["task-boards"]),

    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["task-boards"] });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["task-boards"],
      });
      const previousQueriesData = new Map(allItemsQueries);

      // Optimistically update ALL items queries in the cache
      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Task Board ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      console.log(".........................api call Success hosse..........");
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["task-boards"] });
    },
  });

  // --- Patch ----

  response.toggleTaskBoardStatusMutation = useMutation({
    mutationFn: (id) => changeTaskBoardActiveStatus(id, ["task-boards"]),
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allNoteQueries = queryClient.getQueriesData({
        queryKey: ["task-boards"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["task-boards"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allNoteQueries);

      // Update ALL user queries in the cache
      allNoteQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isActive: !item.isActive } : item,
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Task status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["task-boards"] });
    },
  });
  // --- Delete ---

  response.deleteTaskBoardMutation = useMutation({
    mutationFn: (id) => deleteTaskBoard(id, ["task-boards"]),
    onMutate: async (id) => {
      // Get ALL office queries from the cache
      const allQueries = queryClient.getQueriesData({
        queryKey: ["task-boards"],
      });

      await queryClient.cancelQueries({ queryKey: ["task-boards"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allQueries);

      // Update ALL weekends queries in the cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Task deleted successfully", "success");
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["task-boards"] });
    },
  });

  // visit application

  response.useVisitApplicationQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["visit-applications", params],
      queryFn: () => fetchVisitApplications(params),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  // Apply for visit

  response.useApplyVisitQuery = (params = {}) => {
    return useQuery({
      queryKey: ["apply-visit", params],
      queryFn: () => fetchApplyVisit(params),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  //visit Emplyee...

  const VisitEmployeKey = ["visit-employee"];

  response.useVisitEmployeeQuery = (params = {}, options = {}) => {
    return useQuery({
      queryKey: ["visit-employee", params],
      queryFn: () => fetchVisitEmployee(params),
      keepPreviousData: true,
      enabled: isOnline,
      refetchOnWindowFocus: true,
      ...options,
    });
  };

  // --- Add or Update ---
  response.addOrUpdateVisitApplicationMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdateVisitApplication(variables, VisitApplicationKey),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: VisitApplicationKey });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: VisitApplicationKey,
      });
      const previousQueriesData = new Map(allItemsQueries);

      // Optimistically update ALL items queries in the cache
      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Visit Application ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: VisitApplicationKey });
      queryClient.invalidateQueries({ queryKey: ["apply-visit"] });
      queryClient.invalidateQueries({ queryKey: ["visit-employee"] });
      queryClient.refetchQueries({ queryKey: VisitApplicationKey });
      queryClient.refetchQueries({ queryKey: ["apply-visit"] });
      queryClient.refetchQueries({ queryKey: ["visit-employee"] });
      handleClose();
      setShowModal(false);
    },
  });

  // =================  Start Lead Management ==================
  const LEADS_QUERY_KEY = ["leads"];

  // --- Fetch Leads ---
  response.useLeadsQuery = (params = {}) => {
    return useQuery({
      queryKey: [...LEADS_QUERY_KEY, params],
      queryFn: () => fetchLeads(params),
      enabled: isOnline,
    });
  };

  // --- Add or Update Lead ---
  response.addOrUpdateLeadMutation = useMutation({
    mutationFn: (variables) => addOrUpdateLead(variables, LEADS_QUERY_KEY),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: LEADS_QUERY_KEY });
      const previousQueriesData = queryClient.getQueriesData({
        queryKey: LEADS_QUERY_KEY,
      });
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      // Only reset form if there are validation errors, otherwise keep user input
      if (
        error?.response?.data?.message &&
        typeof error.response.data.message === "object"
      ) {
        // Validation errors - reset with user values to keep their input
        reset(variables);
      }
      // Keep modal open on error so user can fix issues
      setShowModal(true);
      // Only handle validation errors for form fields, don't show toast here
      // Component handlers will show error toasts
      if (
        error?.response?.data?.message &&
        typeof error.response.data.message === "object"
      ) {
        helpers.handleApiValidationError(error, setError);
      }
    },
    onSuccess: (data, variables) => {
      // Only show generic toast if it's not a contact/remark-only update
      // Contact and remark operations show their own specific toasts
      const isContactOnlyUpdate =
        variables.contacts !== undefined &&
        !variables.leadType &&
        !variables.name &&
        !variables.contactName &&
        !variables.remarks;
      const isRemarkOnlyUpdate =
        variables.remarks !== undefined &&
        !variables.leadType &&
        !variables.name &&
        !variables.contactName &&
        !variables.contacts;

      if (!isContactOnlyUpdate && !isRemarkOnlyUpdate) {
        const isClient =
          variables.leadStatus === "Converted" ||
          ["customer", "partner", "vendor"].includes(variables.clientStatus);
        toaster(
          `${isClient ? "Client" : "Lead"} ${variables.id ? "updated" : "created"} successfully`,
          "success",
        );
      }

      // Close modal first
      handleClose();
      // Invalidate queries after a small delay to prevent stack overflow
      // Use refetchType: 'active' to only refetch active queries, not all queries
      setTimeout(() => {
        // Invalidate both list and detail queries
        queryClient.invalidateQueries({
          queryKey: LEADS_QUERY_KEY,
          refetchType: "active",
        });
        // Also invalidate the specific lead detail query if we have an ID
        if (variables.id) {
          queryClient.invalidateQueries({
            queryKey: [...LEADS_QUERY_KEY, "detail", variables.id],
            refetchType: "active",
          });
        }
      }, 50);
    },
  });

  // --- Delete Lead ---
  response.deleteLeadMutation = useMutation({
    mutationFn: (id) => deleteLead(id, LEADS_QUERY_KEY),
    onSuccess: () => {
      toaster("Lead deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },
  });

  // --- Bulk Delete Leads ---
  response.bulkDeleteLeadsMutation = useMutation({
    mutationFn: (leadIds) => bulkDeleteLeads(leadIds, LEADS_QUERY_KEY),
    onSuccess: () => {
      toaster("Leads deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },
  });

  // --- Update Lead Status ---
  response.updateLeadStatusMutation = useMutation({
    mutationFn: ({ leadIds, status }) =>
      bulkUpdateLeadStatus(leadIds, status, LEADS_QUERY_KEY),
    onSuccess: () => {
      // Only show success message once - removed duplicate
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },
  });
  // --- Fetch Lead By ID ---
  response.useLeadByIdQuery = (id) => {
    return useQuery({
      queryKey: [...LEADS_QUERY_KEY, "detail", id],
      queryFn: async () => {
        try {
          return await fetchLeadById(id);
        } catch (error) {
          // Suppress 404 errors - return empty data instead
          if (error?.response?.status === 404 || error?._isLeadEndpoint404) {
            return { message: "Lead not found", data: null };
          }
          throw error;
        }
      },
      enabled: !!id && isOnline,
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
      // Suppress error logging for 404s (handled gracefully)
      onError: (error) => {
        // Only log non-404 errors or errors that aren't from lead endpoints
        if (error?.response?.status !== 404 && !error?._isLeadEndpoint404) {
          console.error("Lead fetch error:", error);
        }
      },
    });
  };

  // --- Fetch Lead Activities ---
  response.useLeadActivitiesQuery = (id) => {
    return useQuery({
      queryKey: [...LEADS_QUERY_KEY, "activities", id],
      queryFn: async () => {
        try {
          return await fetchLeadActivities(id);
        } catch (error) {
          // Suppress 404 errors - return empty array instead
          if (error?.response?.status === 404 || error?._isLeadEndpoint404) {
            return { message: "Activities not found", data: [] };
          }
          throw error;
        }
      },
      enabled: !!id && isOnline,
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
      // Suppress error logging for 404s (handled gracefully)
      onError: (error) => {
        // Only log non-404 errors or errors that aren't from lead endpoints
        if (error?.response?.status !== 404 && !error?._isLeadEndpoint404) {
          console.error("Lead activities fetch error:", error);
        }
      },
    });
  };

  // --- Fetch Communications ---
  response.useCommunicationsQuery = (leadId) => {
    return useQuery({
      queryKey: [...LEADS_QUERY_KEY, "communications", leadId],
      queryFn: async () => {
        try {
          return await fetchCommunications(leadId);
        } catch (error) {
          if (error?.response?.status === 404) {
            return { message: "Communications not found", data: [] };
          }
          throw error;
        }
      },
      enabled: !!leadId && isOnline,
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    });
  };

  // --- Create Communication ---
  response.createCommunicationMutation = useMutation({
    mutationFn: ({ leadId, communicationData }) =>
      createCommunication(leadId, communicationData, LEADS_QUERY_KEY),
    onSuccess: async (data, variables) => {
      // Only show toast once - don't duplicate
      if (!data?.offline) {
        toaster("Communication created successfully", "success");
      }
      // Invalidate communications query
      await queryClient.invalidateQueries({
        queryKey: [...LEADS_QUERY_KEY, "communications", variables.leadId],
        refetchType: "active",
      });
    },
    onError: (error) => {
      console.error("Error creating communication:", error);
      if (!error?._suppressToast) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create communication";
        toaster(
          typeof errorMessage === "string"
            ? errorMessage
            : JSON.stringify(errorMessage),
          "error",
        );
      }
    },
  });

  // --- Update Communication ---
  response.updateCommunicationMutation = useMutation({
    mutationFn: ({ communicationId, communicationData }) =>
      updateCommunication(communicationId, communicationData, LEADS_QUERY_KEY),
    onSuccess: async (data, variables) => {
      toaster("Communication updated successfully", "success");
      await queryClient.invalidateQueries({
        queryKey: [...LEADS_QUERY_KEY, "communications"],
        refetchType: "active",
      });
    },
    onError: (error) => {
      console.error("Error updating communication:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update communication";
      toaster(
        typeof errorMessage === "string"
          ? errorMessage
          : JSON.stringify(errorMessage),
        "error",
      );
    },
  });

  // --- Delete Communication ---
  response.deleteCommunicationMutation = useMutation({
    mutationFn: (communicationId) =>
      deleteCommunication(communicationId, LEADS_QUERY_KEY),
    onSuccess: async () => {
      toaster("Communication deleted successfully", "success");
      await queryClient.invalidateQueries({
        queryKey: [...LEADS_QUERY_KEY, "communications"],
        refetchType: "active",
      });
    },
    onError: (error) => {
      console.error("Error deleting communication:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete communication";
      toaster(
        typeof errorMessage === "string"
          ? errorMessage
          : JSON.stringify(errorMessage),
        "error",
      );
    },
  });

  // --- Update Communication Status ---
  response.updateCommunicationStatusMutation = useMutation({
    mutationFn: ({ activityId, status }) =>
      updateCommunication(activityId, { status }, LEADS_QUERY_KEY),
    onSuccess: () => {
      // Invalidate all activity queries
      queryClient.invalidateQueries({
        queryKey: [...LEADS_QUERY_KEY, "activities"],
        refetchType: "active",
      });
      // Also invalidate the leads query to ensure data is fresh
      queryClient.invalidateQueries({
        queryKey: LEADS_QUERY_KEY,
        refetchType: "active",
      });
    },
    onError: (error) => {
      console.error("Error updating communication status:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update communication status";
      toaster(
        typeof errorMessage === "string"
          ? errorMessage
          : JSON.stringify(errorMessage),
        "error",
      );
    },
  });
  // =================  End Lead Management ==================

  const EMPLOYEE_QUERY_KEY = ["hrEmployee"];

  response.addOrUpdateEmployeeMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdateEmployee(variables, EMPLOYEE_QUERY_KEY),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for employee queries
      await queryClient.cancelQueries({ queryKey: ["hrEmployee"] });
      await queryClient.cancelQueries({ queryKey: ["employee"] });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["hrEmployee"],
      });
      const previousQueriesData = new Map(allItemsQueries);

      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving employee:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      setShowModal(true);
      helpers.handleApiValidationError(
        error,
        setError,
        "Failed to save employee",
        false,
      );
    },
    onSuccess: (data, variables) => {
      toaster(
        `Employee ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      handleClose();
      // Invalidate to ensure latest data from server
      queryClient.invalidateQueries({ queryKey: ["hrEmployee"] });
      queryClient.invalidateQueries({ queryKey: ["employee"] });
    },
  });

  //..............For Master Documents start..............////

  // --- Fetch Data ---
  response.masterDocumentsQuery = (params = {}) => {
    return useQuery({
      queryKey: ["master-documents", params],
      queryFn: () => fetchMasterDocuments(params),
      keepPreviousData: true,
    });
  };

  // --- Fetch Data ---
  response.masterDocumentsWithoutPaginationQuery = () => {
    return useQuery({
      queryKey: ["master-documents"],
      queryFn: () => fetchMasterDocumentsWithoutPagination(),
      keepPreviousData: true,
    });
  };

  response.toggleMasterDocumentStatusMutation = useMutation({
    mutationFn: toggleMasterDocumentStatus,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allRoleQueries = queryClient.getQueriesData({
        queryKey: ["master-documents"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["master-documents"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allRoleQueries);

      // Update ALL user queries in the cache
      allRoleQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isActive: !item.isActive } : item,
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Master Document status changed successfully", "success");
    },
  });

  response.addOrUpdateMasterDocumentMutation = useMutation({
    mutationFn: addUpdateMasterDocument,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["master-documents"] });
      // Get all current user queries for rollback
      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["master-documents"],
      });
      const previousQueriesData = new Map(allUserQueries);

      // Optimistically update ALL user queries in the cache
      allUserQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Master Document ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["master-documents"] });
    },
  });

  response.deleteMasterDocumentMutation = useMutation({
    mutationFn: deleteMasterDocument,
    onMutate: async (id) => {
      // Get ALL Master Documents queries from the cache
      const allQueries = queryClient.getQueriesData({
        queryKey: ["master-documents"],
      });
      // console.log("All queries:", allQueries);

      // Cancel all Master Documents queries
      await queryClient.cancelQueries({ queryKey: ["master-documents"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allQueries);

      // Update ALL Master Documents queries in the cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData?.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log(
            "Deleting Master Documents query:",
            queryKey,
            "with data:",
            old,
          );

          if (!old || !old?.data) return old;

          const newData = old?.data?.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Master Documents deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["master-documents"] });
    },
  });

  //..............For Master Documents End..............////

  //..............For Company Documents start..............////

  // --- Fetch Data ---
  response.companyDocumentsQuery = (params = {}) => {
    return useQuery({
      queryKey: ["company-documents", params],
      queryFn: () => fetchCompanyDocuments(params),
      keepPreviousData: true,
    });
  };

  // --- Fetch Data ---
  response.companyDocumentsWithoutPaginationQuery = () => {
    return useQuery({
      queryKey: ["company-documents"],
      queryFn: () => fetchCompanyDocumentsWithoutPagination(),
      keepPreviousData: true,
    });
  };

  response.toggleCompanyDocumentStatusMutation = useMutation({
    mutationFn: toggleCompanyDocumentStatus,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allRoleQueries = queryClient.getQueriesData({
        queryKey: ["company-documents"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["company-documents"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allRoleQueries);

      // Update ALL user queries in the cache
      allRoleQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isActive: !item.isActive } : item,
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Company Document status changed successfully", "success");
    },
  });

  response.addOrUpdateCompanyDocumentMutation = useMutation({
    mutationFn: addUpdateCompanyDocument,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["company-documents"] });
      // Get all current user queries for rollback
      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["company-documents"],
      });
      const previousQueriesData = new Map(allUserQueries);

      // Optimistically update ALL user queries in the cache
      allUserQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Company Document ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["company-documents"] });
    },
  });

  response.deleteCompanyDocumentMutation = useMutation({
    mutationFn: deleteCompanyDocument,
    onMutate: async (id) => {
      // Get ALL Company Documents queries from the cache
      const allQueries = queryClient.getQueriesData({
        queryKey: ["company-documents"],
      });
      // console.log("All queries:", allQueries);

      // Cancel all Company Documents queries
      await queryClient.cancelQueries({ queryKey: ["company-documents"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allQueries);

      // Update ALL Company Documents queries in the cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData?.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log(
            "Deleting Company Documents query:",
            queryKey,
            "with data:",
            old,
          );

          if (!old || !old?.data) return old;

          const newData = old?.data?.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Company Documents deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["company-documents"] });
    },
  });

  //..............For Company Documents End..............////

  //..............For Documents File start ..............////

  response.documentsFileQuery = () => {
    return useQuery({
      queryKey: ["documents"],
      queryFn: () => documentFiles(),
      keepPreviousData: true,
    });
  };

  response.employeeDocumentsFileQuery = (employeeId) => {
    return useQuery({
      queryKey: ["documents", employeeId],
      queryFn: () => employeeDocumentFiles(employeeId),
      enabled: !!employeeId,
      keepPreviousData: true,
    });
  };

  response.addOrUpdateDocumentFileMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdateDocumentFile(variables, ["documents"]),

    onMutate: async () => {
      // Close modal on submit
      handleClose();
      return {};
    },

    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      const id = variables.get("id");

      toaster(
        `Document ${id && id != 0 ? "updated" : "added"} successfully`,
        "success",
      );

      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  //Document add update...With EmployeeId

  response.addOrUpdateDocumentFileMutationWithEmployeeId = useMutation({
    mutationFn: ({ payload, employee_id }) =>
      addOrUpdateDocumentFileWithEmployeeId(payload, employee_id),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["documents"] });
      handleClose?.();
    },

    onError: (error, variables, context) => {
      console.error("Error saving:", error);
      setShowModal?.(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      const id = variables?.payload?.get?.("id");

      toaster(
        `Document ${id && id != 0 ? "updated" : "added"} successfully`,
        "success",
      );

      handleClose?.();
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.refetchQueries({ queryKey: ["documents"] });
    },
  });

  response.deleteDocumenFiletMutation = useMutation({
    mutationFn: deleteDocumentFile,

    onMutate: async (id) => {
      // Cancel all Company Documents queries
      await queryClient.cancelQueries({ queryKey: ["documents"] });

      // Store previous data for rollback
      const allQueries = queryClient.getQueriesData({
        queryKey: ["documents"],
      });
      const previousQueriesData = new Map(allQueries);

      // Update ALL Company Documents queries in the cache (without pagination)
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData?.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old?.data) return old;

          const newData = old.data.filter((item) => item.id !== id);

          return {
            ...old,
            data: newData, // only data, no pagination changes
          };
        });
      });

      return { previousQueriesData };
    },

    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSuccess: () => {
      toaster(" Document File deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  //..............For Documents File end ..............////

  //..............For Individual Employee Certification and Skills file Start ..............////

  response.employeeCertificationsQuery = (employeeId) => {
    return useQuery({
      queryKey: ["certifications", employeeId],
      queryFn: () => employeeCertifications(employeeId),
      enabled: !!employeeId,
      keepPreviousData: true,
    });
  };

  //Certification add update...With EmployeeId

  response.addOrUpdateCertificationFileMutationWithEmployeeId = useMutation({
    mutationFn: ({ payload, employee_id }) =>
      addOrUpdateCertificationFileWithEmployeeId(payload, employee_id),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["certifications"] });

      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["certifications"],
      });

      const previousQueriesData = new Map(allItemsQueries);

      const id = variables.payload.get("id");

      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return { data: [] };
          }

          const exists = old.data.some((item) => item.id == id);

          return {
            ...old,
            data: exists ? old.data : old.data,
          };
        });
      });

      handleClose();

      return { previousQueriesData };
    },

    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      const id = variables.payload.get("id");

      toaster(
        `Certification ${id && id != 0 ? "updated" : "added"} successfully`,
        "success",
      );

      queryClient.invalidateQueries({ queryKey: ["certifications"] });
    },
  });

  response.employeeSkillsQuery = (employeeId) => {
    return useQuery({
      queryKey: ["skills", employeeId],
      queryFn: () => employeeSkills(employeeId),
      enabled: !!employeeId,
      keepPreviousData: true,
    });
  };

  //add and update.... Epmplyee Skills With Id

  response.addOrUpdateSkillsMutationWithEmployeeId = useMutation({
    mutationFn: ({ payload, employee_id }) =>
      addOrUpdateSkillsWithEmployeeId(payload, employee_id),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["skills"] });

      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["skills"],
      });

      const previousQueriesData = new Map(allItemsQueries);

      const id = variables.payload.id || 0; // 👈 now JSON, no FormData

      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return { data: [] };

          const exists = old.data.some((item) => item.id == id);

          return {
            ...old,
            data: exists ? old.data : old.data,
          };
        });
      });

      handleClose();

      return { previousQueriesData };
    },

    onError: (error, variables, context) => {
      console.error("Error saving Skills:", error);

      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      const id = variables.payload.id || 0;

      toaster(
        `Skills ${id && id != 0 ? "updated" : "added"} successfully`,
        "success",
      );

      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });

  response.employeeProgectQuery = (employeeId) => {
    return useQuery({
      queryKey: ["progect", employeeId],
      queryFn: () => employeeProjects(employeeId),
      enabled: !!employeeId,
      keepPreviousData: true,
    });
  };

  //add and update.... Epmplyee Project With Id

  response.addOrUpdateProjectMutationWithEmployeeId = useMutation({
    mutationFn: ({ payload, employee_id }) =>
      addOrUpdateProjectWithEmployeeId(payload, employee_id),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["progect"] });

      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["progect"],
      });

      const previousQueriesData = new Map(allItemsQueries);

      const id = variables.payload.id || 0; // 👈 now JSON, no FormData

      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return { data: [] };

          const exists = old.data.some((item) => item.id == id);

          return {
            ...old,
            data: exists ? old.data : old.data,
          };
        });
      });

      handleClose();

      return { previousQueriesData };
    },

    onError: (error, variables, context) => {
      console.error("Error saving progect:", error);

      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      const id = variables.payload.id || 0;

      toaster(
        `progect ${id && id != 0 ? "updated" : "added"} successfully`,
        "success",
      );

      queryClient.invalidateQueries({ queryKey: ["progect"] });
    },
  });

  //..............For Individual Employee Update Office And Shift end ..............////

  response.UpdateEmployeeOfficeandShiftMutation = useMutation({
    mutationFn: (variables) => updateEmployeeOfficeAndShift(variables),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["employee_profile_dashboard_data"],
      });

      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["employee_profile_dashboard_data"],
      });

      const previousQueriesData = new Map(allItemsQueries);

      const id = variables?.empId;

      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;

          // ✅ Case 1: old.data is Array
          if (Array.isArray(old?.data)) {
            const exists = old.data.some((item) => item?.id == id);

            return {
              ...old,
              data: exists ? old.data : old.data,
            };
          }

          // ✅ Case 2: old.data.data is Array
          if (Array.isArray(old?.data?.data)) {
            const exists = old.data.data.some((item) => item?.id == id);

            return {
              ...old,
              data: {
                ...old.data,
                data: exists ? old.data.data : old.data.data,
              },
            };
          }

          // ✅ Case 3: unknown structure (do nothing)
          return old;
        });
      });

      handleClose();

      return { previousQueriesData };
    },

    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      const id = variables?.empId;

      toaster(
        `Office And Shift ${id && id != 0 ? "updated" : "added"} successfully`,
        "success",
      );

      queryClient.invalidateQueries({
        queryKey: ["employee_profile_dashboard_data"],
      });
    },
  });

  //..............For Employee HierarchyFile start ..............////

  // --- Fetch Data ---

  response.employeeHierarchyQuery = (params = {}) => {
    return useQuery({
      queryKey: ["employeeHierarchy", params],
      queryFn: () => employeeHierarchyFiles(params),
      keepPreviousData: true,
    });
  };

  response.addOrUpdateemployeeHierarchyMutation = useMutation({
    mutationFn: addOrUpdateemployeeHierarchyFile,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["employeeHierarchy"] });
      // Get all current user queries for rollback
      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["employeeHierarchy"],
      });
      const previousQueriesData = new Map(allUserQueries);

      // Optimistically update ALL user queries in the cache
      allUserQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Employee Hierarchy ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );

      console.log("data=>", data);
      console.log("variables=>", variables);

      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({
        queryKey: [
          "employeeHierarchyByEmployeeId",
          JSON.stringify(variables?.empId),
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["employeeHierarchy"] });
    },
  });

  response.deleteEmployeeHierarchyFiletMutation = useMutation({
    mutationFn: deleteEmployeeHierarchyFile,
    onMutate: async (id) => {
      // Get ALL Company Documents queries from the cache
      const allQueries = queryClient.getQueriesData({
        queryKey: ["employeeHierarchy"],
      });
      // console.log("All queries:", allQueries);

      // Cancel all Company Documents queries
      await queryClient.cancelQueries({ queryKey: ["employeeHierarchy"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allQueries);

      // Update ALL Company Documents queries in the cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData?.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log(
            "Deleting employee Hierarchy query:",
            queryKey,
            "with data:",
            old,
          );

          if (!old || !old?.data) return old;

          const newData = old?.data?.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Employee Hierarchy deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["employeeHierarchy"] });
    },
  });

  //..............For Employee HierarchyFile File end ..............////

  //..............For Employee Profile Picture Update File Start ..............////
  response.uploadProfilePictureMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      addOrUpdateEmployeeProfilePicture(id, payload),

    onMutate: async ({ payload }) => {
      await queryClient.cancelQueries({
        queryKey: ["employee_profile_dashboard_data"],
      });

      const previousData = queryClient.getQueryData([
        "employee_profile_dashboard_data",
      ]);

      queryClient.setQueryData(["employee_profile_dashboard_data"], (old) => {
        if (!old) return payload;
        return { ...old, ...payload };
      });

      return { previousData };
    },

    onError: (error, variables, context) => {
      console.error("Error uploading profile picture:", error);

      if (context?.previousData) {
        queryClient.setQueryData(
          ["employee_profile_dashboard_data"],
          context.previousData,
        );
      }

      reset(variables.payload);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      toaster("Profile picture updated successfully", "success");
      queryClient.invalidateQueries({
        queryKey: ["employee_profile_dashboard_data"],
      });
    },
  });

  //Employee Update Status......

  response.toggleEmployeeActiveStatusMutation = useMutation({
    mutationFn: toggleEmployeeActiveStatus, // your API function

    onMutate: async ({ id }) => {
      // Cancel any ongoing query for this employee
      await queryClient.cancelQueries({
        queryKey: ["employee_profile_dashboard_data", id],
      });

      // Snapshot previous data
      const previousData = queryClient.getQueryData([
        "employee_profile_dashboard_data",
        id,
      ]);

      // Optimistically toggle isActive
      queryClient.setQueryData(
        ["employee_profile_dashboard_data", id],
        (old) => ({
          ...old,
          isActive: !old?.isActive,
        }),
      );

      return { previousData };
    },

    onError: (error, variables, context) => {
      console.error("Failed to toggle employee status:", error);

      // Rollback
      if (context?.previousData) {
        queryClient.setQueryData(
          ["employee_profile_dashboard_data", variables.id],
          context.previousData,
        );
      }

      toaster("Failed to change employee status", "error");
    },

    onSuccess: () => {
      toaster(
        "Employee profile completed status updated successfully",
        "success",
      );

      // Refetch employee details after success
      queryClient.invalidateQueries({
        queryKey: ["employee_profile_dashboard_data"],
      });
    },
  });

  //get my Asset..............

  response.useFetchMyAssetsQuery = (queryParams = {}) => {
    return useQuery({
      queryKey: ["my_assets", queryParams],
      queryFn: () => fetchMyAssets(queryParams),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  // Asset Refund Requests
  response.useCreateAssetRefundRequestMutation = () => {
    return useMutation({
      mutationFn: createAssetRefundRequest,
      onSuccess: (data) => {
        toaster(data?.message || "Refund request submitted successfully", "success");
        queryClient.invalidateQueries({ queryKey: ["my_assets"] });
        queryClient.invalidateQueries({ queryKey: ["my_asset_refund_requests"] });
        queryClient.invalidateQueries({ queryKey: ["all_asset_refund_requests"] });
      },
    });
  };

  response.useMyAssetRefundRequestsQuery = () => {
    return useQuery({
      queryKey: ["my_asset_refund_requests"],
      queryFn: () => fetchMyAssetRefundRequests(),
      enabled: isOnline,
    });
  };

  response.useAllAssetRefundRequestsQuery = (queryParams = {}) => {
    return useQuery({
      queryKey: ["all_asset_refund_requests", queryParams],
      queryFn: () => fetchAllAssetRefundRequests(queryParams),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  response.useActionAssetRefundRequestMutation = () => {
    return useMutation({
      mutationFn: actionAssetRefundRequest,
      onSuccess: (data) => {
        toaster(data?.message || "Refund request processed successfully", "success");
        queryClient.invalidateQueries({ queryKey: ["all_asset_refund_requests"] });
        queryClient.invalidateQueries({ queryKey: ["my_asset_refund_requests"] });
        queryClient.invalidateQueries({ queryKey: ["my_assets"] });
        queryClient.invalidateQueries({ queryKey: ["employee_assets"] });
      },
    });
  };

  //get payment History.........

  response.useEmployeePaymentHistoryQuery = (employeeId, queryParams = {}) => {
    console.log("employeeId", employeeId);

    return useQuery({
      queryKey: ["employee_payment_history", employeeId, queryParams],
      queryFn: () => fetchEmployeePaymentHistory(employeeId, queryParams),
      enabled: !!employeeId,
      keepPreviousData: true,
    });
  };

  // //..............Get Salary History ..............////

  response.mySalaryHistoryQuery = (params) => {
    return useQuery({
      queryKey: ["mySalaryHistory", params],
      queryFn: () => fetchMySalaryHistory(params),
      keepPreviousData: true,
    });
  };

  response.salaryHistoryByEmployeeQuery = (employeeId, params) => {
    return useQuery({
      queryKey: ["salaryHistoryByEmployee", employeeId, params],
      queryFn: () => fetchSalaryHistoryByEmployeeId(employeeId, params),
      keepPreviousData: true,
    });
  };

  // //..............Get SEmployee Birth Day ..............////

  response.activeEmployeesBirthdayQuery = () => {
    return useQuery({
      queryKey: ["activeEmployeesBirthday"],
      queryFn: getActiveEmployeesBirthdayInfo,
      keepPreviousData: true,
    });
  };

  /// //..............Get All Office Holiday Day ..............////

  response.allHolidayListWithoutPaginationQuery = () => {
    return useQuery({
      queryKey: ["allHolidayListWithoutPagination"],
      queryFn: getAllHolidayListWithoutPagination,
      keepPreviousData: true,
    });
  };

  response.useGetLeaveReportQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["leaveReport", params],
      queryFn: () => fetchLeavereport(params),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  response.leaveTypesQuery = () => {
    return useQuery({
      queryKey: ["leaveTypes"],
      queryFn: getLeaveTypes,
      keepPreviousData: true,
    });
  };

  /// //..............Get Add Update Job Recuritment step ..............Start ////

  response.jobRecruitmentStepsQuery = (params = {}) => {
    return useQuery({
      queryKey: ["jobRecruitmentSteps", params],
      queryFn: () => fetchJobRecruitmentSteps(params),
      keepPreviousData: true,
    });
  };

  response.addOrUpdateJobRecruitmentStepMutation = useMutation({
    mutationFn: addOrUpdateJobRecruitmentStep,

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["jobRecruitmentSteps"] });

      const previousData = queryClient.getQueryData(["jobRecruitmentSteps"]);

      queryClient.setQueryData(["jobRecruitmentSteps"], (old) => {
        if (!old) return [variables];

        const exists = old.some((item) => item.id === variables.id);

        return exists
          ? old.map((item) => (item.id === variables.id ? variables : item))
          : [...old, variables];
      });

      handleClose();

      return { previousData };
    },

    onError: (error, variables, context) => {
      console.error("Error saving :", error);

      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      reset(variables);

      setShowModal(true);

      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      toaster(
        `Recruitment Step ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );

      queryClient.invalidateQueries({ queryKey: ["jobRecruitmentSteps"] });
      queryClient.invalidateQueries({
        queryKey: ["activeJobRecruitmentStepNames"],
      });
      queryClient.invalidateQueries({ queryKey: ["jobVacancy"] });
    },

    onSettled: () => { },
  });

  response.deleteJobRecruitmentStepMutation = useMutation({
    mutationFn: deleteJobRecruitmentStep,

    onMutate: async (id) => {
      await queryClient.cancelQueries(["jobRecruitmentSteps"]);
      await queryClient.cancelQueries(["activeJobRecruitmentStepNames"]);

      const previousData = queryClient.getQueryData(["jobRecruitmentSteps"]);

      queryClient.setQueryData(
        ["jobRecruitmentSteps"],
        (old) => old?.filter((item) => item.id !== id) || [],
      );

      queryClient.setQueryData(
        ["activeJobRecruitmentStepNames"],
        (old) => {
          if (!old) return old;
          if (Array.isArray(old)) return old.filter((item) => item.id !== id);
          if (Array.isArray(old?.data)) {
            return {
              ...old,
              data: old.data.filter((item) => item.id !== id),
            };
          }
          return old;
        },
      );

      return { previousData };
    },

    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSuccess: () => {
      toaster("Recruitment Step deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["jobRecruitmentSteps"] });
      queryClient.invalidateQueries({
        queryKey: ["activeJobRecruitmentStepNames"],
      });
      queryClient.invalidateQueries({ queryKey: ["jobVacancy"] });
      queryClient.refetchQueries({
        queryKey: ["activeJobRecruitmentStepNames"],
      });
      queryClient.refetchQueries({ queryKey: ["jobVacancy"] });
    },

    onSettled: () => { },
  });

  response.useActiveJobRecruitmentStepNamesQuery = (options = {}) => {
    return useQuery({
      queryKey: ["activeJobRecruitmentStepNames"],
      queryFn: () => fetchAllActiveJobRecruitmentStepNames(),
      staleTime: 0,
      ...options,
    });
  };

  response.useJobRecruitmentStepByIdQuery = (id, isEnabled = true) => {
    return useQuery({
      queryKey: ["jobRecruitmentStepById", id],
      queryFn: () => fetchJobRecruitmentStepById(String(id)),
      keepPreviousData: true,
      enabled: Boolean(id) && Boolean(isEnabled),
    });
  };

  response.useJobRecruitmentStepIdsByJobVacancyIdQuery = (id) => {
    return useQuery({
      queryKey: ["jobRecruitmentStepIdsByJobVacancyId", id],
      queryFn: () => fetchJobRecruitmentStepIdsByJobVacancyId(String(id)),
      keepPreviousData: true,
      enabled: Boolean(id),
    });
  };

  response.addOrUpdateJobRecruitmentStepsMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdateJobRecruitmentSteps(variables, "jobVacancy"),
    onSuccess: () => {
      toaster("Recruitment steps updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["jobVacancy"] });
      queryClient.invalidateQueries({ queryKey: ["jobRecruitmentSteps"] });
      queryClient.invalidateQueries({
        queryKey: ["jobRecruitmentStepIdsByJobVacancyId"],
      });
      queryClient.invalidateQueries({
        queryKey: ["activeJobRecruitmentStepNames"],
      });
    },
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },
  });

  //...............Start Job Vancancy..............//............

  response.useJobVacancyQuery = (params = {}, options = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["jobVacancy", params],
      queryFn: () => fetchJobVacancy(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      ...options,
    });
  };

  // --- Delete ---
  response.deleteJobVacancyMutation = useMutation({
    mutationFn: deleteJobVacancy,
    onMutate: async (id) => {
      // Get ALL job vacancy queries from the cache
      const allJobVacancyQueries = queryClient.getQueriesData({
        queryKey: ["jobVacancy"],
      });
      console.log("All queries:", allJobVacancyQueries);

      // Cancel all job vacancy queries
      await queryClient.cancelQueries({ queryKey: ["jobVacancy"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allJobVacancyQueries);

      // Update ALL job vacancy queries in the cache
      allJobVacancyQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Job Vacancy deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["jobVacancy"] });
    },
  });

  response.addOrUpdateJobVacancyMutation = useMutation({
    mutationFn: (variables) => addOrUpdateJobVacancy(variables, "jobVacancy"),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["jobVacancy"] });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["jobVacancy"],
      });
      const previousQueriesData = new Map(allItemsQueries);

      // Optimistically update ALL items queries in the cache
      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Job Vacancy ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["jobVacancy"] });
    },
  });

  response.useJobWeightsQuery = (params = {}, options = {}) => {
    return useQuery({
      queryKey: ["jobWeights", params],
      queryFn: () => fetchJobWeights(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      ...options,
    });
  };

  response.addOrUpdateJobWeightMutation = useMutation({
    mutationFn: async (variables) => {
      if (variables.id) {
        return updateJobWeight(variables);
      }
      return addBulkJobWeights([variables]);
    },

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["jobWeights"] });
      const previousQueriesData = queryClient.getQueriesData({
        queryKey: ["jobWeights"],
      });

      // Optimistic update
      previousQueriesData.forEach(([queryKey, oldData]) => {
        if (!oldData?.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          const exists = old.data.some((item) => item.id === variables.id);

          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
          };
        });
      });

      handleClose();

      return { previousQueriesData };
    },

    onError: (error, variables, context) => {
      console.error("Error:", error);

      // rollback
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      toaster(
        `Weight ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );

      queryClient.invalidateQueries({ queryKey: ["jobWeights"] });
      queryClient.invalidateQueries({ queryKey: ["jobVacancy"] });
    },
  });

  // --- Delete ---
  response.deleteJobWeightMutation = useMutation({
    mutationFn: deleteJobWeight,
    onMutate: async (id) => {
      // Get ALL job weight queries from the cache
      const allJobWeightsQueries = queryClient.getQueriesData({
        queryKey: ["jobWeights"],
      });
      console.log("All queries:", allJobWeightsQueries);

      // Cancel all job weight queries
      await queryClient.cancelQueries({ queryKey: ["jobWeights"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allJobWeightsQueries);

      // Update ALL job weight queries in the cache
      allJobWeightsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Job Weight deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["jobWeights"] });
      queryClient.invalidateQueries({ queryKey: ["jobVacancy"] });
    },
  });

  response.addOrUpdateJobInterviewersMutation = useMutation({
    mutationFn: (variables) => addOrUpdateJobInterviewers(variables),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["jobVacancy"] });

      const allJobVacancyQueries = queryClient.getQueriesData({
        queryKey: ["jobVacancy"],
      });
      const previousQueriesData = new Map(allJobVacancyQueries);

      // Optimistically update jobInterviewers in the matching row
      // Structure matches API response: { id, employeeId, employee: { user: { fullName } } }
      allJobVacancyQueries.forEach(([queryKey, oldData]) => {
        if (!oldData?.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old?.data) return old;

          const newData = old.data.map((item) => {
            if (item.id !== variables.jobVacancyId) return item;

            const optimisticInterviewers = variables.employeeIds.map(
              (empId, idx) => ({
                id: -(idx + 1), // temp negative id
                employeeId: empId,
                employee: {
                  id: empId,
                  employeeCode: "",
                  user: {
                    id: empId,
                    fullName: "...", // placeholder — real name comes after invalidate
                  },
                  designation: null,
                },
              }),
            );

            return { ...item, jobInterviewers: optimisticInterviewers };
          });

          return { ...old, data: newData };
        });
      });

      handleClose();
      return { previousQueriesData };
    },

    onError: (error, variables, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: () => {
      toaster("Interviewers assigned successfully", "success");
      // Fetch real data with full employee names + avatars
      queryClient.invalidateQueries({ queryKey: ["jobVacancy"] });
    },
  });

  // =====================================================
  // JOB RECRUITMENT
  // =====================================================

  response.useJobRecruitmentStepsByVacancyIdQuery = (vacancyId) => {
    return useQuery({
      queryKey: ["jobRecruitmentSteps", vacancyId],
      queryFn: () => getJobRecruitmentStepsByVacancyId(vacancyId),
      enabled: isOnline && !!vacancyId,
      keepPreviousData: true,
    });
  };
  response.useJobTitleByJobVacancyId = (vacancyId) => {
    return useQuery({
      queryKey: ["jobTitle", vacancyId],
      queryFn: () => getJobTitleByJobVacancyId(vacancyId),
      enabled: isOnline && !!vacancyId,
      keepPreviousData: true,
    });
  };
  /* ── GET all applicants with pagination ── */
  response.useJobApplicantsQuery = (params = {}) => {
    return useQuery({
      queryKey: ["jobApplicants", params],
      queryFn: () => fetchAllJobApplicants(params),
      keepPreviousData: true,
      enabled: isOnline && !!params.jobVacancyId,
    });
  };

  /* ── ADD or UPDATE applicant ── */
  response.addOrUpdateJobApplicantMutation = useMutation({
    mutationFn: (variables) => addOrUpdateJobApplicant(variables),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["jobApplicants"] });

      const allQueries = queryClient.getQueriesData({
        queryKey: ["jobApplicants"],
      });
      const previousQueries = new Map(allQueries);

      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData?.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old?.data) return old;

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? { ...item, ...variables } : item,
            )
            : [variables, ...old.data];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();
      return { previousQueries };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (_, variables) => {
      toaster(
        `Applicant ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["jobApplicants"] });
    },
  });

  // --- Delete ---
  response.deleteJobApplicantMutation = useMutation({
    mutationFn: deleteJobApplicant,
    onMutate: async (id) => {
      // Get ALL job applicant queries from the cache
      const allJobApplicantsQueries = queryClient.getQueriesData({
        queryKey: ["jobApplicants"],
      });
      console.log("All queries:", allJobApplicantsQueries);

      // Cancel all job applicant queries
      await queryClient.cancelQueries({ queryKey: ["jobApplicants"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allJobApplicantsQueries);

      // Update ALL job applicant queries in the cache
      allJobApplicantsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => { },
    onSuccess: () => {
      toaster("Job Applicant deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["jobApplicants"] });
      queryClient.invalidateQueries({ queryKey: ["stepApplicantsCount"] });
    },
  });

  response.updateJobApplicantRecruitmentStatusMutation = useMutation({
    mutationFn: updateJobApplicantRecruitmentStatus,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for leave requests
      await queryClient.cancelQueries({ queryKey: ["jobApplicants"] });

      // Save current cache for rollback
      const allQueries = queryClient.getQueriesData({
        queryKey: ["jobApplicants"],
      });
      const previousQueriesData = new Map(allQueries);

      // Optimistically update cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData?.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return { ...old, data: [variables] };

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
              item.id === variables.id ? variables : item,
            )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      return { previousQueriesData };
    },

    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      toaster(
        "job applicant recruitment step status changed successfully",
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["jobApplicants"] });
      queryClient.invalidateQueries({ queryKey: ["stepApplicants"] });
      queryClient.invalidateQueries({ queryKey: ["stepApplicantsCount"] });
    },
  });

  /* ── Step Applicants Query ── */
  response.useStepApplicantsQuery = (params = {}) => {
    return useQuery({
      queryKey: ["stepApplicants", params],
      queryFn: () => fetchApplicantsByStep(params),
      keepPreviousData: true,
      enabled: isOnline && !!params?.jobVacancyId && !!params?.stepNameId,
    });
  };

  /* ── Top Applicants Query ── */
  response.useTopApplicantsQuery = (jobVacancyId) => {
    return useQuery({
      queryKey: ["topApplicants", jobVacancyId],
      queryFn: () => getTopApplicantsByVacancy(jobVacancyId),
      enabled: isOnline && !!jobVacancyId,
    });
  };

  /* ── Weight Distribution Query ── */
  response.useWeightDistributionQuery = (scheduleId) => {
    return useQuery({
      queryKey: ["weightDistribution", scheduleId],
      queryFn: () => getWeightDistributionBySchedule(scheduleId),
      enabled: isOnline && !!scheduleId,
    });
  };

  /* ── Schedule by ID Query ── */
  response.useInterviewScheduleByIdQuery = (scheduleId) => {
    return useQuery({
      queryKey: ["interviewSchedule", scheduleId],
      queryFn: () => getInterviewScheduleById(scheduleId),
      enabled: isOnline && !!scheduleId,
    });
  };

  /* ── Add or Update Schedule Mutation ── */
  response.addOrUpdateScheduleMutation = useMutation({
    mutationFn: (variables) => addOrUpdateInterviewSchedule(variables),

    onMutate: async () => {
      handleClose();
    },

    onError: (error, variables, context) => {
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (_, variables) => {
      toaster(
        `Schedule ${variables.id ? "updated" : "created"} successfully`,
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["stepApplicants"] });
      queryClient.invalidateQueries({ queryKey: ["topApplicants"] });
      queryClient.invalidateQueries({ queryKey: ["interviewSchedule"] });
    },
  });
  /* ── Add or Update ConFirm Recruitement ── */

  response.confirmRecruitmentMutation = useMutation({
    mutationFn: (variables) => confirmRecruitment(variables),

    onMutate: async () => {
      handleClose(); // ✅ modal close immediately
    },

    onError: (error, variables, context) => {
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (_, variables) => {
      // dynamic message based on applicantId (update vs create)
      toaster(
        `Recruitment ${variables.id ? "updated" : "created"} successfully`,
        "success",
      );

      // refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ["stepApplicants"] });
      queryClient.invalidateQueries({ queryKey: ["topApplicants"] });
      queryClient.invalidateQueries({ queryKey: ["jobApplicants"] });
      queryClient.invalidateQueries({ queryKey: ["hrEmployee"] });
    },
  });

  response.submitMarksMutation = useMutation({
    mutationFn: (variables) => submitInterviewMarks(variables),

    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: () => {
      toaster("Marks submitted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["weightDistribution"] });
      queryClient.invalidateQueries({ queryKey: ["topApplicants"] });
      handleClose();
    },
  });

  /* ── Add Remark for Applicant ── */

  response.addApplicantRemarkMutation = useMutation({
    mutationFn: (variables) => applicantRemark(variables),

    onMutate: async () => {
      handleClose(); // ✅ modal close immediately
    },

    onError: (error, variables, context) => {
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (_, variables) => {
      // dynamic message based on applicantId (update vs create)
      toaster(
        `Apllicant Remark ${variables.id ? "updated" : "created"} successfully`,
        "success",
      );

      // refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ["stepApplicants"] });
      queryClient.invalidateQueries({ queryKey: ["topApplicants"] });
      queryClient.invalidateQueries({ queryKey: ["jobApplicants"] });
      queryClient.invalidateQueries({ queryKey: ["hrEmployee"] });
    },
  });

  return response;
};
