// hooks/useMonthlyReportTableColumn.js
import { useMemo } from "react";
import helpers from "@/utils/helpers";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";
import { formatNumber } from "@/utils/currencyFormat";

export const useMonthlyReportTableColumn = () => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
      },
      {
        accessorKey: "employeeName",
        header: "Employee Details",
        // filterFn: "includesString",
        cell: ({ row }) => {
          const employee = row.original;
          return (
            <Link
              href={`/hr-dashboard/employee/${employee.employeeId}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Avatar
                text={helpers.avatarText(employee.employeeName)}
                color="info"
                size="md"
              />
              <div>
                <p className="font-semibold dark-title-color">
                  {employee.employeeName}
                </p>
                <SimpleTooltip text={"Designation: " + employee.designation}>
                  <span className="badge badge-rounded badge-outline-secondary">
                    {employee.designation}
                  </span>
                </SimpleTooltip>
              </div>
            </Link>
          );
        },
        size: 200,
        enableGlobalFilter: true
      },
      {
        accessorKey: "presentDays",
        header: "Present Days",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="font-semibold text-green-600">
              {row.original.present}
            </span>
          </div>
        ),
        size: 80,
      },
      {
        accessorKey: "absentDays",
        header: "Absent Days",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="font-semibold text-red-600">
              {row.original.absent}
            </span>
          </div>
        ),
        size: 80,
      },
      {
        accessorKey: "lateArrivals",
        header: "Late Arrivals",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="font-semibold text-orange-600">
              {row.original.late}
            </span>
          </div>
        ),
        size: 80,
      },
      {
        accessorKey: "earlyDepartures",
        header: "Early Departures",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="font-semibold text-yellow-600">
              {row.original.earlyLeave}
            </span>
          </div>
        ),
        size: 80,
      },
      {
        accessorKey: "overtimeHours",
        header: "Overtime Hours",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="font-semibold text-blue-600">
              {formatNumber(row.original.overTimeHours)}
            </span>
          </div>
        ),
        size: 80,
      },
      {
        accessorKey: "attendancePercentage",
        header: "Attendance %",
        cell: ({ row }) => {
          const percentage = row.original.attendancePercentage;
          let color = "green";
          if (percentage < 80) color = "red";
          else if (percentage < 90) color = "yellow";

          return (
            <div className="text-center">
              <span className={`badge badge-pill badge-outline-${color}`}>
                {formatNumber(percentage)}%
              </span>
            </div>
          );
        },
        size: 80,
      },
    ],
    [formatNumber]
  );
};
