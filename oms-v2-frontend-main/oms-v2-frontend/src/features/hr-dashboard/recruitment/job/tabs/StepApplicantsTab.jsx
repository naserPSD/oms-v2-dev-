// src/features/hr-dashboard/recruitment/job/tabs/StepApplicantsTab.jsx
"use client";

import CommonTable from "@/components/common/CommonTable";
import Pagination from "@/components/common/Pagination";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import ScheduleModal from "./Components/ScheduleModal";
import SubmitMarksModal from "./Components/SubmitMarksModal";
import WeightDistributionModal from "./Components/WeightDistributionModal";
import { useCallback, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Medal, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStepApplicantColumns } from "./hooks/useStepApplicantColumns";
import InterViewRoundModal from "../../tabs/modals/InterViewRoundModal";
import { useTopCandidatesTableColumn } from "./hooks/useTopCandidatesTableColumn";
import Image from "next/image";
import ConfirmRecruitmentModal from "./Components/ConfirmRecruitmentModal";
import ApplicantsStatusChangedModal from "./ApplicantsStatusChangedModal";
import AddApplicantRemarksModal from "./Components/AddApplicantRemarksModal";
import ViewApplicantRemarkModal from "./Components/ViewApplicantRemarkModal";
import SimpleTooltip from "@/components/ui/SimpleTooltip";

/* ─── Interviewers Card Section ───────────────────────────────────── */
const InterviewersCard = ({ interviewers }) => {
  if (!interviewers || interviewers.length === 0) return null;

  const seen = new Set();

  const uniqueInterviewers = interviewers.filter(({ email, name }) => {
  const key = email?.trim().toLowerCase() || name?.trim().toLowerCase();

  if (!key) return true;

  if (seen.has(key)) return false;

  seen.add(key);
  return true;
});

if (!uniqueInterviewers.length) return null;




  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primaryColor/10 flex items-center justify-center">
          <User size={15} className="text-primaryColor" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Interviewers
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({uniqueInterviewers.length})
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {uniqueInterviewers.map((interviewer) => (
          <div
            key={interviewer.jobInterviewerId || interviewer.employeeId}
            className="admin-card p-3.5 hover:border-primaryColor/40 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {interviewer.profilePicture ? (
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ring-2 ring-primaryColor/15">
                    <Image
                      src={interviewer.profilePicture}
                      alt={interviewer.name}
                      width={44}
                      height={44}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full bg-primaryColor/15 dark:bg-primaryColor/25 flex items-center justify-center">
                    <User size={20} className="text-primaryColor" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  <SimpleTooltip text={`${interviewer.name}`}>
                    <span>{interviewer.name}</span>
                  </SimpleTooltip>
                </h4>
                {interviewer.email && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">
                    <SimpleTooltip text={`${interviewer.email}`}>
                      <span>{interviewer.email}</span>
                    </SimpleTooltip>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Top Candidates Table ───────────────────────────────────── */
const TopCandidatesTable = ({ jobVacancyId, jobTitleResponse }) => {
  const [weightModal, setWeightModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [selectedRemarkApplicant, setSelectedRemarkApplicant] = useState(null);
  const [showViewRemarksModal, setShowViewRemarksModal] = useState(false);
  const [selectedViewRemark, setSelectedViewRemark] = useState(null);
  const { useTopApplicantsQuery } = useHrQueryApi({});
  const { data: response, isLoading } = useTopApplicantsQuery(jobVacancyId);

  const candidates = useMemo(
    () => response?.data ?? response ?? [],
    [response],
  );

  /* ── Interviewers always from jobTitleResponse ── */
  const interviewers = useMemo(
    () => jobTitleResponse?.data?.interviewers ?? [],
    [jobTitleResponse],
  );

  const listData = useMemo(
    () => candidates?.map((c, i) => ({ ...c, sl: i + 1 })),
    [candidates],
  );


  const handleViewWeights = (scheduleId) => {
    setSelectedScheduleId(scheduleId);
    setWeightModal(true);
  };

  const handleConFirmRecruitment = useCallback((ap) => {
    setSelectedApplicant(ap);
    setShowConfirmModal(true);
  }, []);

  const handleAddRemarks = useCallback((applicant) => {
    setSelectedRemarkApplicant(applicant);
    setShowRemarksModal(true);
  }, []);

  const handleViewRemarks = useCallback((applicant) => {
    setSelectedViewRemark(applicant);
    setShowViewRemarksModal(true);
  }, []);

  const columns = useTopCandidatesTableColumn({
    handleViewWeights,
    handleConFirmRecruitment,
    handleAddRemarks,
    handleViewRemarks,
  });

  const table = useReactTable({
    data: listData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="admin-card p-6 mt-6">
        <div className="h-4 w-32 bg-gray-200 dark:bg-white/[0.06] rounded animate-pulse mb-4" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 bg-gray-100 dark:bg-white/[0.03] rounded mb-2 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* ── Interviewers Card — candidates ছাড়াও দেখাবে ── */}
      <InterviewersCard interviewers={interviewers} />

      {/* ── Top Candidates Table — candidates থাকলে দেখাবে ── */}
      {candidates.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primaryColor/10 flex items-center justify-center">
              <Medal size={15} className="text-primaryColor" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Top Candidates
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({candidates.length})
            </span>
          </div>

          <div className="rounded-xl overflow-hidden shadow-sm [&_.table-container]:border-gray-200 dark:[&_.table-container]:border-gray-700 [&_.table-container]:rounded-xl">
            <CommonTable
              table={table}
              isFetching={isLoading}
              columns={columns}
              hasActiveFilters={false}
            />
          </div>
        </>
      )}

      <ConfirmRecruitmentModal
        showModal={showConfirmModal}
        applicant={selectedApplicant}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedApplicant(null);
        }}
      />

      <AddApplicantRemarksModal
        showModal={showRemarksModal}
        onClose={() => {
          setShowRemarksModal(false);
          setSelectedApplicant(null);
        }}
        applicant={selectedRemarkApplicant}
      />

      <ViewApplicantRemarkModal
        showModal={showViewRemarksModal}
        onClose={() => {
          setShowViewRemarksModal(false);
          setSelectedViewRemark(null);
        }}
        viewReamrk={selectedViewRemark}
      />
      {/* ── Weight Distribution Modal ── */}
      <WeightDistributionModal
        showModal={weightModal}
        onClose={() => {
          setWeightModal(false);
          setSelectedScheduleId(null);
        }}
        scheduleId={selectedScheduleId}
        jobTitleResponse={jobTitleResponse}
      />
    </div>
  );
};

/* ─── Main StepApplicantsTab ─────────────────────────────────── */
const StepApplicantsTab = ({
  jobId,
  stepId,
  stepName,
  steps,
  jobTitleResponse,
}) => {
  const authUserId = useAuthStore((state) => state.user?.id);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sorting, setSorting] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [selectedViewApplicant, setSelectedViewApplicant] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [existingSchedule, setExistingSchedule] = useState(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalData, setModalData] = useState({
    applicantId: null,
    applicantName: null,
    nextStep: null,
  });
  const [showSubmitMarksModal, setShowSubmitMarksModal] = useState(false);
  const [submitMarksScheduleId, setSubmitMarksScheduleId] = useState(null);

  const {
    useStepApplicantsQuery,
    updateJobApplicantRecruitmentStatusMutation,
  } = useHrQueryApi({
    reset: () => {},
    setError: () => {},
    handleClose: () => {},
    setShowModal: () => {},
  });
  const queryParams = useMemo(
    () => ({
      jobVacancyId: Number(jobId),
      stepNameId: Number(stepId),
      page: currentPage,
      limit: itemsPerPage,
    }),
    [jobId, stepId, currentPage, itemsPerPage],
  );

  const { data: responseData, isLoading: isFetching } =
    useStepApplicantsQuery(queryParams);

  const dataArray = useMemo(() => responseData?.data ?? [], [responseData]);
  const pagination = useMemo(
    () => responseData?.pagination ?? { total: 0 },
    [responseData],
  );

  const listData = useMemo(
    () =>
      dataArray.map((item, i) => ({
        ...item,
        sl: (currentPage - 1) * itemsPerPage + i + 1,
      })),
    [dataArray, currentPage, itemsPerPage],
  );

  const handleSchedule = useCallback((ap) => {
    setSelectedApplicant(ap);

    if (ap.jobInterviewScheduleId && ap.jobInterviewSchedule) {
      setExistingSchedule({
        ...ap.jobInterviewSchedule,
        id: ap.jobInterviewSchedule.id, // important
      });
    } else {
      setExistingSchedule(null);
    }

    setShowScheduleModal(true);
  }, []);

  const handleView = (applicant) => {
    setSelectedViewApplicant(applicant);
    setViewModal(true);
  };

  const handleViewClose = () => {
    setViewModal(false);
    setSelectedViewApplicant(null);
  };

  const handleViewCV = (fileUrl) => window.open(fileUrl, "_blank");

  const handleSubmitMarks = useCallback((scheduleId) => {
    setSubmitMarksScheduleId(scheduleId);
    setShowSubmitMarksModal(true);
  }, []);

  const handleStatusChange = (item, nextStep) => {
    const fullName =
      `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim() || "-";

    setModalData({
      applicantId: item.id,
      applicantName: fullName,
      nextStep: nextStep, // এইটা dynamic হবে
    });

    setShowStatusModal(true);
  };

  const handleStatusFrom = async (payloadFromModal) => {
    // payloadFromModal = { jobRecruitmentStepNameId, id }
    try {
      await updateJobApplicantRecruitmentStatusMutation.mutateAsync(
        payloadFromModal,
      );
      setShowStatusModal(false); // modal close after success
      // optional: success toast / refresh table
    } catch (error) {
      console.error("Status update failed:", error);
      // optional: error toast
    }
  };

  const columns = useStepApplicantColumns({
    handleEdit: () => {},
    handleDelete: () => {},
    handleView,
    handleSchedule,
    handleViewCV,
    handleStatusChange,
    handleSubmitMarks,
    steps,
    authUserId,
  });

  const table = useReactTable({
    data: listData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {stepName}
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
            {pagination.total ?? 0} applicant
            {(pagination.total ?? 0) !== 1 ? "s" : ""} in this step
          </p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden shadow-sm [&_.table-container]:border-gray-200 dark:[&_.table-container]:border-gray-700 [&_.table-container]:rounded-xl">
        <CommonTable
          table={table}
          isFetching={isFetching}
          itemsPerPage={itemsPerPage}
          columns={columns}
          hasActiveFilters={false}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={pagination.total ?? 0}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <InterViewRoundModal
        viewModal={viewModal}
        handleViewClose={handleViewClose}
        selectedApplicant={selectedViewApplicant}
      />

      <ApplicantsStatusChangedModal
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSubmit={handleStatusFrom}
        modalData={modalData}
        isLoading={updateJobApplicantRecruitmentStatusMutation?.isLoading}
      />
      {/* Top Candidates + Interviewers Card */}
      <TopCandidatesTable
        jobVacancyId={jobId}
        jobTitleResponse={jobTitleResponse}
      />

      {/* Submit Marks Modal */}
      <SubmitMarksModal
        showModal={showSubmitMarksModal}
        onClose={() => {
          setShowSubmitMarksModal(false);
          setSubmitMarksScheduleId(null);
        }}
        scheduleId={submitMarksScheduleId}
      />

      {/* Schedule Modal */}
      <ScheduleModal
        showModal={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedApplicant(null);
          setExistingSchedule(null);
        }}
        jobVacancyId={jobId}
        applicant={selectedApplicant}
        existingSchedule={existingSchedule}
      />
    </div>
  );
};

export default StepApplicantsTab;
