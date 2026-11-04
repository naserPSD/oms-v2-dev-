// src/features/hr-dashboard/recruitment/job/tabs/hooks/useJobApplicantColumns.js
// ─── handleSchedule prop যোগ করা হয়েছে ───
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { Eye, MessageCircle } from "lucide-react";
import { useMemo } from "react";

export const useTopCandidatesTableColumn = ({
  handleViewWeights,
  handleConFirmRecruitment,
  handleAddRemarks,
  handleViewRemarks,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
        cell: ({ row }) => row.original.sl,
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 200,
        cell: ({ row }) => (
          <span className="text-sm font-semibold admin-text">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 200,
        cell: ({ row }) => (
          <span className="text-xs admin-text-muted">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        size: 150,
        cell: ({ row }) => (
          <span className="text-xs admin-text-muted">{row.original.phone}</span>
        ),
      },
      {
        accessorKey: "expectedSalary",
        header: "Expected Salary",
        size: 120,
        cell: ({ row }) =>
          row.original.expectedSalary
            ? `৳${row.original.expectedSalary.toLocaleString()}`
            : "—",
      },
      {
        accessorKey: "averageScore",
        header: "Avg. Score",
        size: 100,
        cell: ({ row }) => {
          const score = row.original.averageScore ?? 0;
          const hasSchedule = !!row.original.scheduleId;

          const isClickable = score > 0 && hasSchedule;

          const content = (
            <div
              className={`rounded-full flex items-center justify-center gap-[2px]
    text-xs font-extrabold shadow-sm 
    ${
      isClickable
        ? "bg-primaryColor text-white h-6 px-3"
        : "bg-primaryColor text-white h-6 w-6"
    }`}
            >
              <span className="text-[14px]">{score}</span>
              {isClickable && <span className="text-[16px]">≡</span>}
            </div>
          );

          return (
            <div className="flex items-center justify-center">
              {isClickable ? (
                <SimpleTooltip text="View Weight Distribution">
                  <button
                    onClick={() => handleViewWeights(row.original.scheduleId)}
                    className="p-0 cursor-pointer"
                  >
                    {content}
                  </button>
                </SimpleTooltip>
              ) : (
                content
              )}
            </div>
          );
        },
      },

      // {
      //   accessorKey: "remarks",
      //   header: "Remarks",
      //   size: 150,
      //   cell: ({ row }) => (
      //     <div className="text-center">
      //       {" "}
      //       <SimpleTooltip text="Add a remark for this applicant">
      //         <ButtonTw
      //           onClick={() => handleAddRemarks(row.original)}
      //           size="xs"
      //         >
      //           Add
      //         </ButtonTw>
      //       </SimpleTooltip>
      //     </div>
      //   ),
      // },

      {
        accessorKey: "remarks",
        header: "Remarks",
        size: 180,
        cell: ({ row }) => {
          const applicant = row.original;
          const hasRemarks = applicant.remarks && applicant.remarks.length > 0;

          return (
            <div className="flex justify-center items-center gap-2">
              {/* Add Remark button */}
              <SimpleTooltip text="Add a remark for this applicant">
                <button
                  onClick={() => handleAddRemarks(applicant)}
                  className="btn-action text-cyan-500 hover:text-cyan-700"
                >
                  <MessageCircle size={18} fill="currentColor"/>
                </button>
              </SimpleTooltip>

              {/* View Remarks button (if remarks exist) */}
              {hasRemarks && (
                <SimpleTooltip text="View remarks for this applicant">
                  <button
                    onClick={() => handleViewRemarks(applicant.remarks)}
                    className="btn-action text-cyan-500 hover:text-cyan-700"
                  >
                    <Eye size={18} />
                  </button>
                </SimpleTooltip>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        size: 150,
        cell: ({ row }) => {
          const applicant = row.original;

          return applicant.employeeId ? (
            <span className="text-xs font-semibold text-green-600">
              Already Recruited
            </span>
          ) : (
            <ButtonTw
              size="sm"
              variant="default"
              className="text-xs"
              onClick={() => handleConFirmRecruitment(applicant)}
            >
              Confirm Recruitment
            </ButtonTw>
          );
        },
      },
    ],
    [
      handleViewWeights,
      handleConFirmRecruitment,
      handleAddRemarks,
      handleViewRemarks,
    ],
  );
};
