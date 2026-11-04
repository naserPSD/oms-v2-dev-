// src/features/hr-dashboard/job-vacancy/hooks/useJobListTableColumn.jsx
import { useMemo } from "react";
import helpers from "@/utils/helpers";
import { Eye, Pencil, Trash2, UserPlus } from "lucide-react";
import { IoMdSettings } from "react-icons/io";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import Avatar from "@/components/ui/Avatar";

import ButtonTw from "@/components/ui/ButtonTw";
import { BsViewList } from "react-icons/bs";
import Link from "next/link";
export const useJobListTableColumn = ({
  handleEdit,
  handleDelete,
  handleView,
  handleSetupRecruitmentSteps,
  handleAssignInterviewers, // ← new
  jobWeightDataArray,
  handleViewWeights,
  hasPermission,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
      },
      {
        accessorKey: "jobTitle",
        header: "Job Title",
        cell: ({ row }) => (
          <div>
            <Link
              href={`/hr-dashboard/recruitment/applicants/${row.original.id}`}
              className="font-semibold hover:text-primaryColor hover:underline"
            >
              {row.original?.jobTitle}
            </Link>
            <p className="text-sm text-gray-500">
              Vacancies: {row.original?.noOfVacancies}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "salary",
        header: "Salary",
        cell: ({ row }) => {
          const min = row.original?.minSalary;
          const max = row.original?.maxSalary;
          return (
            <div className="text-sm">
              {row.original?.showSalaryRange ? (
                <span>
                  {min} - {max}
                </span>
              ) : (
                <span className="text-gray-400">Hidden</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "applicants",
        header: "Applicants",
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-center">
              <Link
                href={`/hr-dashboard/recruitment/applicants/${row.original.id}`}
              >
                <span className="badge-outline-primary badge badge-rounded cursor-pointer hover:!text-black transition-colors">
                  {/* {row.original?.totalApplicants ?? 0} Applicants */}
                  {Number(row.original?.totalApplicants ?? 0)} Applicants
                </span>
              </Link>
            </div>
          );
        },
      },
      // {
      //   accessorKey: "noOfVacancies",
      //   header: "Vacancies",
      //   cell: ({ row }) => (
      //     <span className="">{row.original?.noOfVacancies}</span>
      //   ),
      // },
      // {
      //   accessorKey: "experience",
      //   header: "Experience",
      //   cell: ({ row }) => (
      //     <span>
      //       {row.original?.experienceRequired
      //         ? `${row.original?.experienceRequired} Years`
      //         : "0 Years"}
      //     </span>
      //   ),
      // },
      // {
      //   accessorKey: "experience",
      //   header: "Experience Range",
      //   cell: ({ row }) => {
      //     const min = row.original?.minYearExperience;
      //     const max = row.original?.maxYearExperience;

      //     return (
      //       <div className="text-sm">
      //         {row.original?.minYearExperience && (
      //           <span>
      //             {min} - {max} Years
      //           </span>
      //         )}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   accessorKey: "age",
      //   header: "Age Range",
      //   cell: ({ row }) => (
      //     <span>
      //       {row.original?.minAge} - {row.original?.maxAge}
      //     </span>
      //   ),
      // },
      {
        accessorKey: "deadline",
        header: "Application Deadline",
        cell: ({ row }) => (
          <span className="text-sm">
            {helpers.dDate(row.original?.applicationDeadline)}
          </span>
        ),
      },
      {
        accessorKey: "jobRecruitmentSteps",
        header: "Recruitment Steps",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            {hasPermission("hr.setup_recruitment_steps_edit") && (
              <span
                onClick={() => handleSetupRecruitmentSteps(row.original)}
                className="badge-outline-primary badge badge-rounded cursor-pointer"
              >
                {row.original?.jobRecruitmentSteps?.length ?? 0} Steps
              </span>
            )}
          </div>
        ),
      },

      /* ── Interviewers column ── */
      {
        accessorKey: "jobInterviewers",
        header: "Interviewers",
        size: 140,
        cell: ({ row }) => {
          const jobInterviewers = row.original?.jobInterviewers ?? [];

          // filter only valid employees
          const validInterviewers = jobInterviewers.filter(
            (iv) => iv?.employee?.user,
          );

          const MAX_SHOW = 4;
          const visible = validInterviewers.slice(0, MAX_SHOW);
          const extra = validInterviewers.length - MAX_SHOW;
          const hasAny = validInterviewers.length > 0;

          return (
            <div className="flex items-center gap-2">
              {/* Avatar stack */}
              {hasAny ? (
                <div className="flex items-center -space-x-3 overflow-visible">
                  {visible.map((iv, idx) => {
                    const user = iv.employee?.user;
                    const fullName = user?.fullName ?? "N/A";
                    const fileUrl =
                      iv.employee?.user?.profile?.profilePicture?.fileUrl ??
                      null;
                    const initials = fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <SimpleTooltip key={iv.id ?? idx} text={fullName}>
                        <div
                          className="relative w-8 h-8 rounded-full overflow-hidden
                            border-2 border-white dark:border-card cursor-pointer"
                          style={{ zIndex: MAX_SHOW - idx }}
                        >
                          <Avatar
                            image={fileUrl || ""}
                            text={initials}
                            value={fullName}
                            alt={fullName || "Employee"}
                            color="info"
                            size="sm"
                          />
                        </div>
                      </SimpleTooltip>
                    );
                  })}

                  {extra > 0 && (
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-card
                      bg-gray-200 dark:bg-white/10
                      flex items-center justify-center
                      text-[10px] font-semibold admin-text-muted"
                      style={{ zIndex: 0 }}
                    >
                      +{extra}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-xs admin-text-subtle italic">None</span>
              )}

              {/* Add / Edit button */}
              <SimpleTooltip
                text={hasAny ? "Update Interviewers" : "Assign Interviewers"}
              >
                <button
                  onClick={() =>
                    handleAssignInterviewers(
                      row.original.id,
                      row.original.jobInterviewers ?? [],
                    )
                  }
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center
                    transition-colors shrink-0
                    ${
                      hasAny
                        ? "bg-primaryColor/10 dark:bg-primaryColor/15 text-primaryColor hover:bg-primaryColor/20"
                        : "bg-gray-100 dark:bg-white/[0.06] admin-text-muted hover:bg-primaryColor/10 hover:text-primaryColor"
                    }
                  `}
                >
                  {hasAny ? <Pencil size={11} /> : <UserPlus size={11} />}
                </button>
              </SimpleTooltip>
            </div>
          );
        },
      },
      {
        accessorKey: "weights",
        header: "Job Weights",
        cell: ({ row }) => {
          const jobId = row.original.id;

          // ✅ match weights
          const matchedWeights = jobWeightDataArray?.filter(
            (item) => item.jobVacancyId === jobId,
          );

          const hasWeights = matchedWeights?.length > 0;

          // ✅ sum of weightValue
          const totalWeight = matchedWeights?.reduce(
            (sum, item) => sum + (item.weightValue || 0),
            0,
          );

          return (
            <div className="flex flex-col items-center gap-1">
              {hasWeights ? (
                <>
                  <SimpleTooltip text="View Job Weights">
                    <ButtonTw
                      variant="outline.green"
                      size="xs"
                      className="gap-1"
                      onClick={() => handleViewWeights(matchedWeights, jobId)}
                    >
                      <BsViewList /> View
                    </ButtonTw>
                  </SimpleTooltip>

                  {/* ✅ total weight show */}
                  <span className="text-sm text-gray-500 mt-0.5">
                    Total Weights :{" "}
                    <span className="badge badge-circle badge-secondary">
                      {totalWeight}
                    </span>
                  </span>
                </>
              ) : (
                <SimpleTooltip text="Add New Job Weight">
                  <ButtonTw
                    variant="blue"
                    size="xs"
                    className="gap-1"
                    onClick={() => handleViewWeights([], jobId)}
                  >
                    <BsViewList /> Add
                  </ButtonTw>
                </SimpleTooltip>
              )}
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "actions",
        header: "Action",
        enableSorting: false,
        size: 120,
        cell: ({ row }) => {
          const job = row.original;
          return (
            <div className="gap-2 flex items-center">
              {/* Assign Interviewers — new button */}
              {/* <SimpleTooltip text="Assign Interviewers">
                <button
                  onClick={() => handleAssignInterviewers(job.id)}
                  className="btn-action text-violet-500 hover:text-violet-700"
                >
                  <UserPlus size={16} />
                </button>
              </SimpleTooltip> */}

              <SimpleTooltip text="Recruitment Steps">
                <button
                  onClick={() => handleSetupRecruitmentSteps(job)}
                  className="text-blue-500 hover:text-blue-700 btn-action"
                >
                  <IoMdSettings size={16} />
                </button>
              </SimpleTooltip>

              <SimpleTooltip text="View">
                <button
                  onClick={() => handleView(job)}
                  className="btn-action text-cyan-500 hover:text-cyan-700"
                >
                  <Eye size={16} />
                </button>
              </SimpleTooltip>

              {hasPermission("hr.job_vacancy_edit") && (
                <SimpleTooltip text="Edit">
                  <button
                    onClick={() => handleEdit(job)}
                    className="btn-action text-blue-500 hover:text-blue-700"
                  >
                    <Pencil size={16} />
                  </button>
                </SimpleTooltip>
              )}

              {hasPermission("hr.job_vacancy_delete") && (
                <SimpleTooltip text="Delete">
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="btn-action text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </SimpleTooltip>
              )}
            </div>
          );
        },
      },
    ],
    [
      handleEdit,
      handleDelete,
      handleView,
      handleSetupRecruitmentSteps,
      handleAssignInterviewers,
      jobWeightDataArray,
      handleViewWeights,
    ],
  );
};
