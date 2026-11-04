import { useMemo } from "react";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { Pencil, Trash2 } from "lucide-react";

import {
  FaBriefcase,
  FaUsers,
  FaTag,
  FaClock,
  FaMoneyBillWave,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaEdit,
} from "react-icons/fa";
import Link from "next/link";

/* icon map (headerData theke) */
const headerIconMap = {
  "Job Title": FaBriefcase,
  Vacancies: FaUsers,
  Category: FaTag,
  Deadline: FaClock,
  "Salary Range": FaMoneyBillWave,
  Experience: FaGraduationCap,
  Location: FaMapMarkerAlt,
  Action: FaEdit,
};

/* reusable header renderer */
const HeaderWithIcon = ({ title }) => {
  const Icon = headerIconMap[title];
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon size={14} />}
      <span>{title}</span>
    </div>
  );
};

export const useJobRecruitmentTableColumn = ({ handleDelete }) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
      },

      {
        accessorKey: "JobTitle",
        header: () => <HeaderWithIcon title="Job Title" />,
        cell: ({ row }) => {
          const office = row.original?.office;
          return (
            <SimpleTooltip text={"Office Name"}>
              <p className="font-semibold dark-title-color text-left">
                {office?.name}
              </p>
            </SimpleTooltip>
          );
        },
        size: 240,
      },

      {
        accessorKey: "Vacancies",
        header: () => <HeaderWithIcon title="Vacancies" />,
        cell: ({ row }) => {
          const min = row.original?.minLateMinutes;
          const max = row.original?.maxLateMinutes;
          return (
            <span className="text-xs dark-title-color font-semibold">
              {max !== null && max !== undefined && max > 0
                ? `${min}-${max}`
                : `${min} - Above`}
            </span>
          );
        },
        size: 200,
      },

      {
        accessorKey: "Category",
        header: () => <HeaderWithIcon title="Category" />,
        cell: ({ row }) => (
          <span className="text-xs">{row.original?.fineAmount}</span>
        ),
        size: 80,
      },

      {
        accessorKey: "Deadline",
        header: () => <HeaderWithIcon title="Deadline" />,
        cell: ({ row }) => (
          <span className="text-xs">{row.original?.fineIntervalDays}</span>
        ),
        size: 80,
      },

      {
        accessorKey: "SalaryRange",
        header: () => <HeaderWithIcon title="Salary Range" />,
        cell: ({ row }) => (
          <span className="text-xs">{row.original?.fineIntervalDays}</span>
        ),
        size: 80,
      },

      {
        accessorKey: "Experience",
        header: () => <HeaderWithIcon title="Experience" />,
        cell: ({ row }) => (
          <span className="text-xs">{row.original?.fineIntervalDays}</span>
        ),
        size: 80,
      },

      {
        accessorKey: "Location",
        header: () => <HeaderWithIcon title="Location" />,
        cell: ({ row }) => (
          <span className="text-xs">{row.original?.fineIntervalDays}</span>
        ),
        size: 80,
      },

      // {
      //   accessorKey: "actions",
      //   header: () => <HeaderWithIcon title="Action" />,
      //   enableSorting: false,
      //   size: 80,
      //   cell: ({ row }) => {
      //     const attendanceRules = row.original;
      //     return (
      //       <div className="gap-1 flex">
      //         <SimpleTooltip text="Edit">
      //           <Link
      //             href={`/hr-dashboard/recruitment/job-vacancy/${attendanceRules.id}`}
      //             className="btn-action text-blue-500 hover:text-blue-700"
      //           >
      //             <Pencil size={16} />
      //           </Link>
      //         </SimpleTooltip>
      //         <SimpleTooltip text="Delete">
      //           <button
      //             onClick={() => handleDelete(attendanceRules.id)}
      //             className="btn-action text-red-500 hover:text-red-700"
      //           >
      //             <Trash2 size={16} />
      //           </button>
      //         </SimpleTooltip>
      //       </div>
      //     );
      //   },
      // },
    ],
    [handleDelete],
  );
};
