// src/features/hr-dashboard/recruitment/job/tabs/hooks/useJobApplicantColumns.js
// ─── handleSchedule prop যোগ করা হয়েছে ───
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { Eye, Link2, Pencil, Trash2, User, ChevronLeft } from "lucide-react";
import { useMemo } from "react";

export const useJobApplicantColumns = ({
  handleEdit,
  handleDelete,
  handleView,
  handleViewCV,
  handleStatusChange,
  steps,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL#",
        size: 50,
      },

      /* ── Name + salary badge ── */
      {
        accessorKey: "firstName",
        header: "Name",
        size: 200,
        cell: ({ row }) => {
          const ap = row.original;
          const fullName =
            `${ap.firstName ?? ""} ${ap.lastName ?? ""}`.trim() || "-";
          const initials = fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          const minSalary = ap.jobVacancy?.minSalary;
          const maxSalary = ap.jobVacancy?.maxSalary;
          const salaryBadge =
            minSalary && maxSalary
              ? `${Math.round(minSalary / 1000)}K - ${Math.round(maxSalary / 1000)}K`
              : null;

          return (
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full shrink-0
                bg-primaryColor/15 dark:bg-primaryColor/20
                flex items-center justify-center
                text-xs font-bold text-primaryColor dark:text-primaryColor-400"
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {fullName}
                </p>
                {salaryBadge && (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full
                    text-[10px] font-semibold
                    bg-primaryColor/10 dark:bg-primaryColor/20 text-primaryColor dark:text-primaryColor-400 mt-0.5"
                  >
                    {salaryBadge}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },

      /* ── Contact ── */
      {
        accessorKey: "email",
        header: "Contact",
        size: 200,
        cell: ({ row }) => {
          const ap = row.original;
          return (
            <div className="space-y-0.5">
              {ap.email && (
                <p className="text-xs admin-text flex items-center gap-1.5">
                  <span className="admin-text-subtle">✉</span>
                  {ap.email}
                </p>
              )}
              {ap.phone && (
                <p className="text-xs admin-text-muted flex items-center gap-1.5">
                  <span className="admin-text-subtle">✆</span>
                  {ap.phone}
                </p>
              )}
            </div>
          );
        },
      },

      /* ── Office ── */
      {
        accessorKey: "office.name",
        header: "Office",
        size: 150,
        cell: ({ row }) => {
          const ap = row.original;
          return (
            <div className="space-y-0.5">
              {ap.office?.name && (
                <p className="text-xs admin-text truncate">{ap.office.name}</p>
              )}
            </div>
          );
        },
      },

      /* ── Summary ── */
      {
        accessorKey: "summary",
        header: "Summary",
        size: 200,
        cell: ({ row }) => (
          <div className="max-w-[200px]">
            <p className="text-xs admin-text line-clamp-2">
              {row.original.summary || "—"}
            </p>
          </div>
        ),
      },

      /* ── Expected Salary ── */
      {
        accessorKey: "expectedSalary",
        header: "Expected Salary",
        size: 120,
        cell: ({ row }) => {
          const salary = row.original.expectedSalary;
          if (!salary)
            return <span className="text-xs admin-text-subtle">—</span>;
          return (
            <span className="text-xs font-medium admin-text">
              {typeof salary === "number"
                ? `৳${salary.toLocaleString()}`
                : salary}
            </span>
          );
        },
      },

      /* ── Interview Rating ── */
      {
        accessorKey: "interviewRating",
        header: "Rating",
        size: 80,
        cell: ({ row }) => {
          const rating = row.original.interviewRating;
          if (!rating || rating === 0)
            return <span className="text-xs admin-text-subtle">—</span>;
          return (
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-500">
                ★
              </span>
              <span className="text-xs admin-text">{rating}</span>
            </div>
          );
        },
      },

      /* ── CV / Resume ── */
      {
        accessorKey: "cv",
        header: "CV/Resume",
        size: 120,
        cell: ({ row }) => {
          const cv = row.original.cv;
          if (!cv?.fileUrl)
            return (
              <span className="text-xs admin-text-subtle italic">No CV</span>
            );
          return (
            <SimpleTooltip text="View CV">
              <button
                onClick={() => handleViewCV?.(cv.fileUrl)}
                className="btn-action text-blue-500 hover:text-blue-700 flex items-center gap-1.5 text-xs"
              >
                <Link2 size={13} /> View
              </button>
            </SimpleTooltip>
          );
        },
      },

      /* ── Status ── */
      {
        accessorKey: "jobRecruitmentStep",
        header: "Status",
        size: 180,
        cell: ({ row }) => {
          const step = row.original.jobRecruitmentStep;
          const schedule = row.original.jobInterviewSchedule;
          if (!step && !schedule)
            return <span className="text-xs admin-text-subtle italic">—</span>;
          return (
            <div className="space-y-1">
              {step && (
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full
                  text-[10px] font-bold uppercase tracking-wide
                  bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400"
                >
                  {step.name ?? step.stepName ?? "Step"}
                </span>
              )}
              {schedule?.scheduledAt && (
                <p className="text-[11px] admin-text-muted flex items-center gap-1">
                  <span>🕐</span>
                  {new Date(schedule.scheduledAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          );
        },
      },

      /* ── Applied On ── */
      {
        accessorKey: "createdAt",
        header: "Applied On",
        size: 120,
        cell: ({ row }) => {
          const date = row.original.createdAt;
          if (!date)
            return <span className="text-xs admin-text-subtle">—</span>;
          return (
            <span className="text-xs admin-text">
              {new Date(date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        },
      },

      /* ── Actions ── */
      {
        accessorKey: "actions",
        header: () => <div className="text-center">Actions</div>,
        enableSorting: false,
        size: 130,
        cell: ({ row }) => {
          const ap = row.original;
          const hasSteps = steps && steps.length > 0;
          const currentStepId = ap.jobRecruitmentStep?.id;
          const currentIndex = steps.findIndex((s) => s.stepId === currentStepId);

          // no step yet → forward to steps[0]
          // has step → forward to steps[currentIndex + 1]
          const nextStep = !ap.jobRecruitmentStep
            ? steps[0] ?? null
            : currentIndex >= 0
              ? steps[currentIndex + 1] ?? null
              : null;

          // backward — only if has step and prev exists
          const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null;

          return (
            <div className="flex items-center justify-center gap-2">
              <SimpleTooltip text="View">
                <button
                  onClick={() => handleView?.(ap)}
                  className="btn-action text-cyan-500 hover:text-cyan-700"
                >
                  <Eye size={15} />
                </button>
              </SimpleTooltip>

              {/* Forward — next step আছে → move forward */}
              {hasSteps && nextStep && (
                <SimpleTooltip text={`Mark as ${nextStep.stepName}`}>
                  <button
                    onClick={() => handleStatusChange?.(ap, nextStep)}
                    className="btn-action text-cyan-500 hover:text-cyan-700"
                  >
                    <User size={15} />
                  </button>
                </SimpleTooltip>
              )}

              {/* Backward — prev step আছে → move back */}
              {prevStep && (
                <SimpleTooltip text={`Move back to ${prevStep.stepName}`}>
                  <button
                    onClick={() => handleStatusChange?.(ap, prevStep)}
                    className="btn-action text-orange-500 hover:text-orange-700"
                  >
                    <ChevronLeft size={15} />
                  </button>
                </SimpleTooltip>
              )}

              <SimpleTooltip text="Edit">
                <button
                  onClick={() => handleEdit?.(ap)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={15} />
                </button>
              </SimpleTooltip>

              {!ap.jobRecruitmentStep && (
                <SimpleTooltip text="Delete">
                  <button
                    onClick={() => handleDelete?.(ap.id)}
                    className="btn-action text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={15} />
                  </button>
                </SimpleTooltip>
              )}
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete, handleView, handleViewCV, handleStatusChange],
  );
};
