// src/features/hr-dashboard/recruitment/tabs/modals/InterViewRoundModal.jsx
"use client";

import { ModalTw } from "@/components/common/ModalTw";
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Star,
  User,
} from "lucide-react";

/** Visible on light + dark (lighter blue in dark mode) */
const primaryText = "text-primaryColor dark:text-primaryColor-400";
const primaryIcon = `${primaryText} shrink-0`;

const InfoCard = ({ icon: Icon, title, children }) => (
  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 p-4 space-y-3">
    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
      <span className="w-7 h-7 rounded-lg bg-primaryColor/15 dark:bg-primaryColor/25 flex items-center justify-center shrink-0">
        <Icon size={14} className={primaryIcon} />
      </span>
      {title}
    </h4>
    {children}
  </div>
);

const InterViewRoundModal = ({
  viewModal,
  handleViewClose,
  selectedApplicant,
}) => {
  if (!selectedApplicant) return null;

  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    expectedSalary,
    summary,
    experience,
    education,
    noticePeriod,
    cv,
    jobVacancy,
    office,
    createdAt,
    interviewRating,
    jobRecruitmentStep,
    jobInterviewSchedule,
  } = selectedApplicant;

  const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "N/A";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleViewCV = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return "N/A";
    if (typeof salary === "number") {
      return `৳${salary.toLocaleString()}`;
    }
    return salary;
  };

  const getStatusBadge = () => {
    if (!jobRecruitmentStep) {
      return {
        color:
          "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-200 dark:border-amber-700",
        text: "Pending",
      };
    }

    const statusMap = {
      Interview:
        "bg-primaryColor/10 dark:bg-primaryColor/20 text-primaryColor dark:text-primaryColor-400 border border-primaryColor/20",
      Exam: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700",
      Written:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700",
      Mcq: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700",
      Selected:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700",
      Rejected:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-700",
    };

    return {
      color:
        statusMap[jobRecruitmentStep.name] ||
        "bg-primaryColor/10 dark:bg-primaryColor/20 text-primaryColor dark:text-primaryColor-400 border border-primaryColor/20",
      text: jobRecruitmentStep.name,
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <ModalTw
      show={viewModal}
      onClose={handleViewClose}
      title="Applicant Details"
      size="3xl"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-5">
        {/* Profile header */}
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-linear-to-r from-primaryColor/8 via-slate-50 to-white dark:from-primaryColor/15 dark:via-gray-800 dark:to-gray-900 px-4 py-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-full bg-primaryColor/15 dark:bg-primaryColor/25 ring-4 ring-white dark:ring-gray-800 flex items-center justify-center shrink-0">
              <span className={`text-xl font-bold ${primaryText}`}>
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {fullName}
              </h3>
              {(jobVacancy?.title || jobVacancy?.designation) && (
                <p
                  className={`mt-1 text-sm font-medium truncate flex items-center gap-1.5 ${primaryText}`}
                >
                  <Briefcase size={13} className={primaryIcon} />
                  <span>{jobVacancy?.title || jobVacancy?.designation}</span>
                </p>
              )}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-2 ${statusBadge.color}`}
              >
                {statusBadge.text}
              </span>
            </div>
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5">
            Applied: {formatDate(createdAt)}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard icon={User} title="Contact Information">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                <Mail size={14} className={primaryIcon} />
                <span className="break-all">{email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                <Phone size={14} className={primaryIcon} />
                <span>{phone || "N/A"}</span>
              </div>
              {address && (
                <div className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-100">
                  <MapPin
                    size={14}
                    className={`${primaryIcon} mt-0.5`}
                  />
                  <span>{address}</span>
                </div>
              )}
            </div>
          </InfoCard>

          <InfoCard icon={Briefcase} title="Employment Details">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm gap-3">
                <span className="text-gray-500 dark:text-gray-400">
                  Experience
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {experience ? `${experience} years` : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm gap-3">
                <span className="text-gray-500 dark:text-gray-400">
                  Notice Period
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {noticePeriod ? `${noticePeriod} days` : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm gap-3">
                <span className="text-gray-500 dark:text-gray-400">
                  Expected Salary
                </span>
                <span className={`font-semibold ${primaryText}`}>
                  {formatSalary(expectedSalary)}
                </span>
              </div>
              {interviewRating ? (
                <div className="flex items-center justify-between text-sm gap-3">
                  <span className="text-gray-500 dark:text-gray-400">
                    Interview Rating
                  </span>
                  <div className="flex items-center gap-1">
                    <Star
                      size={14}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {interviewRating}/5
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </InfoCard>

          <InfoCard icon={GraduationCap} title="Education">
            <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
              {education || "Not provided"}
            </p>
          </InfoCard>

          {office ? (
            <InfoCard icon={Building2} title="Office Details">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {office.name || "N/A"}
                </p>
                {office.typeId ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Type ID: {office.typeId}
                  </p>
                ) : null}
              </div>
            </InfoCard>
          ) : null}

          {jobInterviewSchedule ? (
            <InfoCard icon={Calendar} title="Interview Schedule">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                  <Clock size={14} className={primaryIcon} />
                  <span>{formatDate(jobInterviewSchedule.scheduledAt)}</span>
                </div>
                {jobInterviewSchedule.venue ? (
                  <div className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-100">
                    <MapPin
                      size={14}
                      className={`${primaryIcon} mt-0.5`}
                    />
                    <span>{jobInterviewSchedule.venue}</span>
                  </div>
                ) : null}
              </div>
            </InfoCard>
          ) : null}
        </div>

        {summary ? (
          <InfoCard icon={FileText} title="Summary / Cover Letter">
            <div className="rounded-lg bg-slate-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700 p-3">
              <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                {summary}
              </p>
            </div>
          </InfoCard>
        ) : null}

        {cv?.fileUrl ? (
          <InfoCard icon={FileText} title="CV / Resume">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleViewCV(cv.fileUrl)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primaryColor hover:bg-primaryColor-700 rounded-lg transition-colors"
              >
                <Eye size={16} />
                View CV
              </button>
              {cv.originalName ? (
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {cv.originalName}
                </span>
              ) : null}
            </div>
          </InfoCard>
        ) : null}
      </div>
    </ModalTw>
  );
};

export default InterViewRoundModal;
