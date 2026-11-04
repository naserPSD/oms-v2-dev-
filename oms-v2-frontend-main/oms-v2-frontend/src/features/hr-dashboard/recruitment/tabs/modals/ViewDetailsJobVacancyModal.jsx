"use client";

import React, { useMemo } from "react";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import helpers from "@/utils/helpers";
import {
  Briefcase,
  Building2,
  Clock,
  Calendar,
  CalendarClock,
  Coins,
  Users,
  MapPin,
  Layers,
  CheckCircle2,
  FileText,
  Award,
  GraduationCap,
  Sparkles,
  UserCheck,
  Pencil,
  AlertCircle,
  EyeOff,
  ChevronRight,
  Camera,
  Video,
  Sliders,
  Check,
  X,
  TrendingUp,
} from "lucide-react";

/**
 * StatCard component for top key details grid
 */
const StatCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  subtext,
  badge,
}) => (
  <div className="bg-white dark:bg-gray-800/90 rounded-xl p-4 border border-gray-200/90 dark:border-gray-700/80 shadow-xs hover:border-gray-300 dark:hover:border-gray-600 transition-all flex flex-col justify-between">
    <div className="flex items-start justify-between gap-2 mb-2">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
        >
          <Icon size={19} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-0.5 leading-snug">
            {value || "Not Specified"}
          </div>
        </div>
      </div>
      {badge}
    </div>
    {subtext && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-[52px]">
        {subtext}
      </p>
    )}
  </div>
);

/**
 * SectionCard wrapper for content sections
 */
const SectionCard = ({
  icon: Icon,
  title,
  count,
  action,
  children,
  className = "",
}) => (
  <div
    className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 shadow-xs overflow-hidden ${className}`}
  >
    <div className="px-5 py-3.5 bg-gray-50/80 dark:bg-gray-800 border-b border-gray-200/80 dark:border-gray-700 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-lg bg-primaryColor/10 dark:bg-primaryColor/20 text-primaryColor dark:text-primaryColor-400 flex items-center justify-center shrink-0">
          <Icon size={15} />
        </span>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200/80 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {count}
            </span>
          )}
        </h3>
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const ViewDetailsJobVacancyModal = ({
  viewModal,
  handleViewClose,
  selectedJob,
  officeList = [],
  jobCategoryList = [],
  jobLevelOptions = [],
  stepList = [],
  statusGroupList = [],
  handleEdit,
  handleAssignInterviewers,
  handleSetupRecruitmentSteps,
}) => {
  // ─── 1. RESOLVE OFFICE NAME ──────────────────────────────────────────
  const officeName = useMemo(() => {
    if (selectedJob?.office?.name) return selectedJob.office.name;
    if (!selectedJob?.officeId) return null;
    const matched = officeList?.find(
      (o) => o.value === selectedJob.officeId || o.id === selectedJob.officeId,
    );
    return matched?.label || matched?.name || null;
  }, [selectedJob, officeList]);

  // ─── 2. RESOLVE SHIFT & TIMINGS ──────────────────────────────────────
  const shiftInfo = useMemo(() => {
    if (selectedJob?.shift) {
      const shift = selectedJob.shift;
      const times =
        shift.startTime && shift.endTime
          ? `${helpers.stringTimeToLocalTime(shift.startTime)} - ${helpers.stringTimeToLocalTime(shift.endTime)}`
          : null;
      return {
        name: shift.name,
        times,
        label: times ? `${shift.name} (${times})` : shift.name,
      };
    }
    if (selectedJob?.shiftId && officeList?.length) {
      const office = officeList.find(
        (o) =>
          o.value === selectedJob.officeId || o.id === selectedJob.officeId,
      );
      const shift = office?.officeShifts?.find(
        (s) => s.id === selectedJob.shiftId || s.value === selectedJob.shiftId,
      );
      if (shift) {
        const times =
          shift.startTime && shift.endTime
            ? `${helpers.stringTimeToLocalTime(shift.startTime)} - ${helpers.stringTimeToLocalTime(shift.endTime)}`
            : null;
        return {
          name: shift.name,
          times,
          label: times ? `${shift.name} (${times})` : shift.name,
        };
      }
    }
    return null;
  }, [selectedJob, officeList]);

  // ─── 3. RESOLVE JOB CATEGORY ─────────────────────────────────────────
  const jobCategoryName = useMemo(() => {
    if (selectedJob?.jobCategory?.name) return selectedJob.jobCategory.name;
    if (!selectedJob?.jobCategoryId) return null;
    const matched = jobCategoryList?.find(
      (c) =>
        c.value === selectedJob.jobCategoryId ||
        c.id === selectedJob.jobCategoryId,
    );
    return matched?.label || matched?.name || null;
  }, [selectedJob, jobCategoryList]);

  // ─── 4. RESOLVE JOB LEVEL ────────────────────────────────────────────
  const jobLevelName = useMemo(() => {
    if (!selectedJob?.jobLevel) return null;
    if (
      typeof selectedJob.jobLevel === "string" &&
      isNaN(Number(selectedJob.jobLevel))
    ) {
      return selectedJob.jobLevel;
    }
    const options = jobLevelOptions?.length
      ? jobLevelOptions
      : statusGroupList?.find((s) => s.code === "job_levels")?.statuses || [];
    const matched = options.find(
      (l) => l.id == selectedJob.jobLevel || l.value == selectedJob.jobLevel,
    );
    return matched?.name || matched?.label || `Level ${selectedJob.jobLevel}`;
  }, [selectedJob, jobLevelOptions, statusGroupList]);

  // ─── 5. RESOLVE EMPLOYMENT STATUS ────────────────────────────────────
  const employmentStatusName = useMemo(() => {
    if (selectedJob?.employmentStatus?.name) {
      return selectedJob.employmentStatus.name;
    }
    if (!selectedJob?.employmentStatusId) return null;
    const statuses =
      statusGroupList?.find(
        (s) =>
          s.code === "emp_statuses" || s.code === "emp_invitation_statuses",
      )?.statuses || [];
    const matched = statuses.find(
      (s) =>
        s.id == selectedJob.employmentStatusId ||
        s.value == selectedJob.employmentStatusId,
    );
    return matched?.name || matched?.label || null;
  }, [selectedJob, statusGroupList]);

  // ─── 6. RESOLVE WORKPLACE TYPE ───────────────────────────────────────
  const workplaceName = useMemo(() => {
    if (selectedJob?.workplace) {
      if (
        typeof selectedJob.workplace === "string" &&
        isNaN(Number(selectedJob.workplace))
      ) {
        return selectedJob.workplace;
      }
      const statuses =
        statusGroupList?.find(
          (s) =>
            s.code === "emp_workplace_types" || s.code === "workplaces",
        )?.statuses || [];
      const matched = statuses.find(
        (s) =>
          s.id == selectedJob.workplace || s.value == selectedJob.workplace,
      );
      return matched?.name || matched?.label || selectedJob.workplace;
    }
    return null;
  }, [selectedJob, statusGroupList]);

  // ─── 7. RESOLVE RECRUITMENT STEPS ────────────────────────────────────
  const resolvedSteps = useMemo(() => {
    const rawSteps = selectedJob?.jobRecruitmentSteps || [];
    if (!rawSteps.length) return [];
    return rawSteps.map((item, index) => {
      const stepId = item.stepId ?? item.id;
      const nameFromRelation = item.step?.name;
      const matchedFromList = stepList?.find(
        (s) => s.value == stepId || s.id == stepId,
      );
      return {
        id: item.id || index + 1,
        stepId,
        name:
          nameFromRelation ||
          matchedFromList?.label ||
          matchedFromList?.name ||
          `Step ${index + 1}`,
      };
    });
  }, [selectedJob, stepList]);

  // ─── 8. RESOLVE ASSIGNED INTERVIEWERS ────────────────────────────────
  const validInterviewers = useMemo(() => {
    const interviewers = selectedJob?.jobInterviewers || [];
    return interviewers
      .map((iv) => {
        const emp = iv.employee;
        const user = emp?.user;
        const fullName = user
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.fullName ||
            "Unnamed Interviewer"
          : "Interviewer";
        const initials = fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        const photoUrl =
          iv.employee?.user?.profile?.profilePicture?.fileUrl ||
          (user?.profile?.profilePicture?.filename
            ? `/uploads/${user.profile.profilePicture.filename}`
            : null);
        const designationName = emp?.designation?.name || "Assigned Panelist";
        const employeeCode = emp?.employeeCode || null;
        return {
          id: iv.id,
          fullName,
          initials,
          photoUrl,
          designationName,
          employeeCode,
          email: user?.email,
        };
      })
      .filter(Boolean);
  }, [selectedJob]);

  // ─── 9. RESOLVE DEADLINE STATUS & REMAINING DAYS ─────────────────────
  const deadlineInfo = useMemo(() => {
    if (!selectedJob?.applicationDeadline) return null;
    const deadlineDate = new Date(selectedJob.applicationDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((deadlineDate - today) / (1000 * 60 * 60 * 24));
    const formattedDate = helpers.dDate(selectedJob.applicationDeadline);

    if (diffDays < 0) {
      return {
        formattedDate,
        status: "expired",
        badgeText: "Deadline Expired",
        badgeColor:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
        dotColor: "bg-red-500",
      };
    }
    if (diffDays === 0) {
      return {
        formattedDate,
        status: "today",
        badgeText: "Last Day Today",
        badgeColor:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
        dotColor: "bg-amber-500 animate-pulse",
      };
    }
    return {
      formattedDate,
      status: "active",
      badgeText: `${diffDays} Day${diffDays > 1 ? "s" : ""} Remaining`,
      badgeColor:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
      dotColor: "bg-emerald-500",
    };
  }, [selectedJob]);

  // ─── 10. RESOLVE SKILLS LIST ─────────────────────────────────────────
  const parsedSkills = useMemo(() => {
    if (!selectedJob?.skills) return [];
    return selectedJob.skills
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [selectedJob?.skills]);

  // ─── 11. RESOLVE JOB WEIGHTS ─────────────────────────────────────────
  const weightsList = useMemo(() => {
    return selectedJob?.jobWeights || [];
  }, [selectedJob?.jobWeights]);

  // Check if content sections exist
  const hasJobContext =
    selectedJob?.jobContext &&
    selectedJob.jobContext.replace(/<[^>]*>/g, "").trim() !== "";

  const hasResponsibilities =
    selectedJob?.jobResponsibilities &&
    selectedJob.jobResponsibilities.replace(/<[^>]*>/g, "").trim() !== "";

  const hasEducation =
    selectedJob?.othersEduQualification ||
    selectedJob?.preferredEduInstitute ||
    selectedJob?.professionalCertification ||
    selectedJob?.trainingAndTradeCourse;

  const hasExperience =
    selectedJob?.experienceRequired ||
    selectedJob?.minYearExperience ||
    selectedJob?.maxYearExperience ||
    selectedJob?.areaOfExperience ||
    selectedJob?.isApplyFresher !== undefined;

  const hasDemographics =
    selectedJob?.gender ||
    selectedJob?.minAge ||
    selectedJob?.maxAge ||
    selectedJob?.requiredPhoto ||
    selectedJob?.preferVideoResume;

  const hasAdditionalRequirements =
    selectedJob?.additionalRequirement || selectedJob?.specialInstruction;

  if (!selectedJob) return null;

  return (
    <ModalTw
      show={viewModal}
      onClose={handleViewClose}
      title={"Job Vacancy Details"}
      size="5xl"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="max-h-[calc(85vh-110px)] overflow-y-auto pr-1 -mr-1 space-y-6">
        {/* ════════════════════════════════════════════════════════════════
            1. HERO / HEADER BANNER
            ════════════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white dark:from-gray-800/90 dark:via-gray-800/50 dark:to-gray-900 border border-blue-100 dark:border-gray-700/80 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primaryColor/10 dark:bg-primaryColor/20 text-primaryColor dark:text-primaryColor-400 text-xs font-semibold">
                  <Briefcase size={13} />
                  <span>Job ID #{selectedJob.id}</span>
                </span>

                {deadlineInfo && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${deadlineInfo.badgeColor}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${deadlineInfo.dotColor}`}
                    />
                    {deadlineInfo.badgeText}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {selectedJob.jobTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <div className="bg-primaryColor/10 dark:bg-primaryColor/20 text-primaryColor dark:text-primaryColor-400 border border-primaryColor/20 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                <Users size={14} />
                <span>
                  {selectedJob.noOfVacancies}{" "}
                  {Number(selectedJob.noOfVacancies) === 1
                    ? "Vacancy"
                    : "Vacancies"}
                </span>
              </div>

              {handleEdit && (
                <SimpleTooltip text="Edit Job Vacancy">
                  <ButtonTw
                    type="button"
                    size="xs"
                    variant="outline.gray"
                    onClick={() => {
                      handleViewClose();
                      handleEdit(selectedJob);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    <Pencil size={12} />
                    <span>Edit</span>
                  </ButtonTw>
                </SimpleTooltip>
              )}
            </div>
          </div>

          {/* Quick Meta Badges Strip */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200/60 dark:border-gray-700/60 text-xs">
            {jobCategoryName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-medium">
                <Layers size={12} />
                {jobCategoryName}
              </span>
            )}

            {jobLevelName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 font-medium">
                <Award size={12} />
                {jobLevelName}
              </span>
            )}

            {employmentStatusName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-medium">
                <UserCheck size={12} />
                {employmentStatusName}
              </span>
            )}

            {workplaceName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 font-medium">
                <MapPin size={12} />
                {workplaceName}
              </span>
            )}

            {officeName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-medium">
                <Building2 size={12} />
                {officeName}
              </span>
            )}

            {shiftInfo?.name && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-medium">
                <Clock size={12} />
                {shiftInfo.name}
              </span>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            2. KEY DETAILS STAT CARDS MATRIX (GRID)
            ════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Card 1: Salary Package */}
          <StatCard
            icon={Coins}
            iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            iconColor="text-emerald-600 dark:text-emerald-400"
            label="Offered Salary"
            value={
              selectedJob.showSalaryRange ? (
                selectedJob.minSalary && selectedJob.maxSalary ? (
                  <span>
                    ৳{Number(selectedJob.minSalary).toLocaleString()} - ৳
                    {Number(selectedJob.maxSalary).toLocaleString()}
                  </span>
                ) : selectedJob.minSalary ? (
                  <span>৳{Number(selectedJob.minSalary).toLocaleString()}</span>
                ) : (
                  "Negotiable"
                )
              ) : (
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 text-sm">
                  <EyeOff size={14} />
                  <span>Confidential</span>
                </span>
              )
            }
            subtext={
              selectedJob.additionalSalaryInfo
                ? selectedJob.additionalSalaryInfo
                : selectedJob.showSalaryRange
                  ? "Standard monthly salary (BDT)"
                  : "Hidden from job post"
            }
            badge={
              selectedJob.salaryNegotiable ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                  Negotiable
                </span>
              ) : !selectedJob.showSalaryRange ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  Hidden
                </span>
              ) : null
            }
          />

          {/* Card 2: Application Deadline */}
          <StatCard
            icon={CalendarClock}
            iconBg="bg-blue-50 dark:bg-blue-950/40"
            iconColor="text-blue-600 dark:text-blue-400"
            label="Application Deadline"
            value={
              deadlineInfo ? deadlineInfo.formattedDate : "No Deadline Set"
            }
            subtext={
              deadlineInfo ? deadlineInfo.badgeText : "Open continuously"
            }
            badge={
              deadlineInfo && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${deadlineInfo.badgeColor}`}
                >
                  {deadlineInfo.status === "expired"
                    ? "Expired"
                    : deadlineInfo.status === "today"
                      ? "Today"
                      : "Active"}
                </span>
              )
            }
          />

          {/* Card 3: Office Location */}
          <StatCard
            icon={Building2}
            iconBg="bg-violet-50 dark:bg-violet-950/40"
            iconColor="text-violet-600 dark:text-violet-400"
            label="Office Location"
            value={officeName || "Not Assigned"}
            subtext={
              workplaceName
                ? `${workplaceName} arrangement`
                : "Assigned company facility"
            }
            badge={
              workplaceName && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300">
                  {workplaceName}
                </span>
              )
            }
          />

          {/* Card 4: Work Shift */}
          <StatCard
            icon={Clock}
            iconBg="bg-amber-50 dark:bg-amber-950/40"
            iconColor="text-amber-600 dark:text-amber-400"
            label="Work Shift"
            value={shiftInfo?.name || "General Shift"}
            subtext={shiftInfo?.times || "Standard company working hours"}
            badge={
              shiftInfo?.times && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                  Scheduled
                </span>
              )
            }
          />

          {/* Card 5: Category & Level */}
          <StatCard
            icon={Award}
            iconBg="bg-sky-50 dark:bg-sky-950/40"
            iconColor="text-sky-600 dark:text-sky-400"
            label="Job Category & Level"
            value={jobCategoryName || "General"}
            subtext={
              jobLevelName ? `${jobLevelName} Position` : "Standard role"
            }
            badge={
              jobLevelName && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300">
                  {jobLevelName}
                </span>
              )
            }
          />

          {/* Card 6: Applicants & Pipeline */}
          <StatCard
            icon={Users}
            iconBg="bg-rose-50 dark:bg-rose-950/40"
            iconColor="text-rose-600 dark:text-rose-400"
            label="Candidate Pool"
            value={`${Number(selectedJob.totalApplicants ?? 0)} Applicants`}
            subtext={`${selectedJob.noOfVacancies ?? 1} Vacancy slots available`}
            badge={
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300">
                {resolvedSteps.length} Steps
              </span>
            }
          />
        </div>

        {/* ════════════════════════════════════════════════════════════════
            3. HIRING PIPELINE / RECRUITMENT STEPS
            ════════════════════════════════════════════════════════════════ */}
        {resolvedSteps.length > 0 && (
          <SectionCard
            icon={Sliders}
            title="Recruitment Pipeline & Stages"
            count={resolvedSteps.length}
            action={
              handleSetupRecruitmentSteps && (
                <button
                  onClick={() => {
                    handleViewClose();
                    handleSetupRecruitmentSteps(selectedJob);
                  }}
                  className="text-xs font-semibold text-primaryColor hover:underline dark:text-primaryColor-400"
                >
                  Manage Steps
                </button>
              )
            }
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {resolvedSteps.map((step, idx) => (
                <React.Fragment key={step.id || idx}>
                  <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-800/80 px-3.5 py-2 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs hover:border-primaryColor/50 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-primaryColor/10 dark:bg-primaryColor/25 text-primaryColor dark:text-primaryColor-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {step.name}
                    </span>
                  </div>
                  {idx < resolvedSteps.length - 1 && (
                    <ChevronRight
                      size={15}
                      className="text-gray-400 dark:text-gray-500 shrink-0 hidden sm:block"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ════════════════════════════════════════════════════════════════
            4. ASSIGNED INTERVIEWERS TEAM
            ════════════════════════════════════════════════════════════════ */}
        {validInterviewers.length > 0 && (
          <SectionCard
            icon={UserCheck}
            title="Assigned Interviewers Panel"
            count={validInterviewers.length}
            action={
              handleAssignInterviewers && (
                <button
                  onClick={() => {
                    handleViewClose();
                    handleAssignInterviewers(
                      selectedJob.id,
                      selectedJob.jobInterviewers ?? [],
                    );
                  }}
                  className="text-xs font-semibold text-primaryColor hover:underline dark:text-primaryColor-400"
                >
                  Update Panel
                </button>
              )
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {validInterviewers.map((iv, idx) => (
                <div
                  key={iv.id || idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/80"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-gray-600 bg-primaryColor/10 dark:bg-primaryColor/25 flex items-center justify-center">
                    {iv.photoUrl ? (
                      <img
                        src={iv.photoUrl}
                        alt={iv.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-primaryColor dark:text-primaryColor-400">
                        {iv.initials}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {iv.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {iv.designationName}
                    </p>
                    {iv.employeeCode && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        Code: {iv.employeeCode}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ════════════════════════════════════════════════════════════════
            5. INTERVIEW ASSESSMENT CRITERIA & WEIGHTS
            ════════════════════════════════════════════════════════════════ */}
        {weightsList.length > 0 && (
          <SectionCard
            icon={TrendingUp}
            title="Interview Assessment Weights"
            count={weightsList.length}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {weightsList.map((weight, idx) => (
                <div
                  key={weight.id || idx}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {weight.weightName}
                    </span>
                    <span className="text-xs font-bold text-primaryColor dark:text-primaryColor-400">
                      {weight.weightValue}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primaryColor dark:bg-primaryColor-500 transition-all duration-300"
                      style={{
                        width: `${Math.min(Number(weight.weightValue) || 0, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ════════════════════════════════════════════════════════════════
            6. MAIN CONTENT: JOB CONTEXT & RESPONSIBILITIES
            ════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-6">
          {/* Job Context */}
          {hasJobContext && (
            <SectionCard icon={FileText} title="Job Context & Overview">
              <div
                className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
                  [&_li]:mb-1 [&_p]:mb-3.5
                  [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:dark:text-white
                  [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:dark:text-white
                  [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:dark:text-white
                  [&_strong]:font-semibold [&_strong]:text-gray-900 [&_strong]:dark:text-white
                  [&_table]:w-full [&_table]:border-collapse [&_table]:my-3
                  [&_td]:border [&_td]:border-gray-200 [&_td]:dark:border-gray-700 [&_td]:p-2
                  [&_th]:border [&_th]:border-gray-200 [&_th]:dark:border-gray-700 [&_th]:p-2 [&_th]:bg-gray-50 [&_th]:dark:bg-gray-800"
                dangerouslySetInnerHTML={{
                  __html: selectedJob.jobContext,
                }}
              />
            </SectionCard>
          )}

          {/* Job Responsibilities */}
          {hasResponsibilities && (
            <SectionCard
              icon={CheckCircle2}
              title="Key Job Responsibilities"
            >
              <div
                className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
                  [&_li]:mb-1 [&_p]:mb-3.5
                  [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:dark:text-white
                  [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:dark:text-white
                  [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:dark:text-white
                  [&_strong]:font-semibold [&_strong]:text-gray-900 [&_strong]:dark:text-white
                  [&_table]:w-full [&_table]:border-collapse [&_table]:my-3
                  [&_td]:border [&_td]:border-gray-200 [&_td]:dark:border-gray-700 [&_td]:p-2
                  [&_th]:border [&_th]:border-gray-200 [&_th]:dark:border-gray-700 [&_th]:p-2 [&_th]:bg-gray-50 [&_th]:dark:bg-gray-800"
                dangerouslySetInnerHTML={{
                  __html: selectedJob.jobResponsibilities,
                }}
              />
            </SectionCard>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════
            7. REQUIREMENTS & QUALIFICATIONS (WHEN PRESENT)
            ════════════════════════════════════════════════════════════════ */}
        {/* Required Skills */}
        {parsedSkills.length > 0 && (
          <SectionCard
            icon={Sparkles}
            title="Required Technical & Core Skills"
            count={parsedSkills.length}
          >
            <div className="flex flex-wrap gap-2">
              {parsedSkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {skill}
                </span>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Experience Requirements */}
        {hasExperience && (
          <SectionCard icon={Briefcase} title="Experience Requirements">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(selectedJob.minYearExperience ||
                selectedJob.maxYearExperience) && (
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Experience Range
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                    {selectedJob.minYearExperience ?? 0} -{" "}
                    {selectedJob.maxYearExperience ?? "+"} Years
                  </p>
                </div>
              )}

              {selectedJob.experienceRequired !== undefined &&
                selectedJob.experienceRequired !== null && (
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Candidate Type
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                      {String(selectedJob.experienceRequired) === "1"
                        ? "Experienced Candidates"
                        : String(selectedJob.experienceRequired) === "0"
                          ? "Freshers Eligible"
                          : selectedJob.experienceRequired}
                    </p>
                  </div>
                )}

              {selectedJob.isApplyFresher !== undefined &&
                selectedJob.isApplyFresher !== null && (
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Freshers Policy
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-1.5">
                      {String(selectedJob.isApplyFresher) === "1" ? (
                        <>
                          <Check size={16} className="text-emerald-500" />
                          <span>Freshers Allowed to Apply</span>
                        </>
                      ) : (
                        <>
                          <X size={16} className="text-red-500" />
                          <span>Experience Mandatory</span>
                        </>
                      )}
                    </p>
                  </div>
                )}

              {selectedJob.areaOfExperience && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Area of Experience
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                    {selectedJob.areaOfExperience}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Educational Requirements */}
        {hasEducation && (
          <SectionCard icon={GraduationCap} title="Educational Requirements">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedJob.othersEduQualification && (
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Degree / Qualification
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                    {selectedJob.othersEduQualification}
                  </p>
                </div>
              )}

              {selectedJob.preferredEduInstitute && (
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Preferred Institutions
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                    {selectedJob.preferredEduInstitute}
                  </p>
                </div>
              )}

              {selectedJob.professionalCertification && (
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Professional Certifications
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                    {selectedJob.professionalCertification}
                  </p>
                </div>
              )}

              {selectedJob.trainingAndTradeCourse && (
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Training & Trade Courses
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                    {selectedJob.trainingAndTradeCourse}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Candidate Preferences & Demographics */}
        {hasDemographics && (
          <SectionCard
            icon={UserCheck}
            title="Candidate Demographics & Preferences"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {selectedJob.gender && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Gender
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {selectedJob.gender}
                  </p>
                </div>
              )}

              {(selectedJob.minAge || selectedJob.maxAge) && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Age Range
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {selectedJob.minAge ?? 18} - {selectedJob.maxAge ?? 60}{" "}
                    years
                  </p>
                </div>
              )}

              {selectedJob.requiredPhoto !== undefined && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
                    <Camera size={12} />
                    <span>Photo</span>
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {selectedJob.requiredPhoto ? "Required" : "Optional"}
                  </p>
                </div>
              )}

              {selectedJob.preferVideoResume !== undefined && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
                    <Video size={12} />
                    <span>Video Resume</span>
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {selectedJob.preferVideoResume ? "Accepted" : "Not Required"}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Additional Requirements & Special Instructions */}
        {hasAdditionalRequirements && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedJob.additionalRequirement && (
              <SectionCard
                icon={AlertCircle}
                title="Additional Requirements"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {selectedJob.additionalRequirement}
                </p>
              </SectionCard>
            )}

            {selectedJob.specialInstruction && (
              <SectionCard
                icon={FileText}
                title="Special Instructions for Applicants"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {selectedJob.specialInstruction}
                </p>
              </SectionCard>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            8. FOOTER METADATA & ACTIONS
            ════════════════════════════════════════════════════════════════ */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              <strong className="text-gray-700 dark:text-gray-300">
                Job ID:
              </strong>{" "}
              #{selectedJob.id}
            </span>
            <span>•</span>
            <span>
              <strong className="text-gray-700 dark:text-gray-300">
                Created:
              </strong>{" "}
              {helpers.dDate(selectedJob.createdAt)}
            </span>
            {selectedJob.updatedAt && (
              <>
                <span>•</span>
                <span>
                  <strong className="text-gray-700 dark:text-gray-300">
                    Updated:
                  </strong>{" "}
                  {helpers.dDate(selectedJob.updatedAt)}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ButtonTw
              type="button"
              size="sm"
              variant="outline.gray"
              onClick={handleViewClose}
              className="w-full sm:w-auto font-medium"
            >
              Close
            </ButtonTw>

            {handleEdit && (
              <ButtonTw
                type="button"
                size="sm"
                variant="default"
                onClick={() => {
                  handleViewClose();
                  handleEdit(selectedJob);
                }}
                className="w-full sm:w-auto font-medium flex items-center justify-center gap-1.5"
              >
                <Pencil size={13} />
                <span>Edit Job Vacancy</span>
              </ButtonTw>
            )}
          </div>
        </div>
      </div>
    </ModalTw>
  );
};

export default ViewDetailsJobVacancyModal;
