// hooks/useLeaveReportTableColumn.js
import { useMemo } from "react";
import helpers from "@/utils/helpers";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";

export const useLeaveReportTableColumn = (leaveTypeDataArray) => {
  return useMemo(() => {
    // 🔹 leaveTypeDataArray থেকে Total Allowed Days summation
    const totalMaxDays = leaveTypeDataArray.reduce(
      (sum, lt) => sum + (lt.maxDaysPerYear || 0),
      0,
    );
    const baseColumns = [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
        meta: { className: "text-center font-medium" },
      },
      {
        accessorKey: "employeeName",
        header: "Employee Details",
        cell: ({ row }) => {
          const employee = row.original;
          return (
            <Link
              href={`/hr-dashboard/employee/${employee.employeeId}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Avatar
                image={employee?.employeeProfilePictureURL || ""}
                text={helpers.avatarText(employee.employeeName)}
                value={employee.employeeName || ""}
                alt={employee.employeeName || "Employee"}
                color="info"
                size="md"
              />
              <div>
                <p className="font-semibold dark-title-color">
                  {employee.employeeName}
                </p>
                <p className="text-xs text-gray-500">{employee.employeeCode}</p>
                <SimpleTooltip text={"Designation: " + employee.designation}>
                  <span className="badge badge-rounded badge-outline-secondary mt-1">
                    {employee.designation}
                  </span>
                </SimpleTooltip>
              </div>
            </Link>
          );
        },
        size: 380,
        enableGlobalFilter: true,
      },
    ];

    const leaveTypesWithTotal = [
      {
        id: "totalAllowed",
        name: "Total Allowed Days",
        maxDaysPerYear: leaveTypeDataArray.reduce(
          (sum, lt) => sum + (lt.maxDaysPerYear || 0),
          0,
        ),
        isTotal: true, // এই flag ব্যবহার করব
      },
      ...leaveTypeDataArray,
    ];

    const leaveTypeColumns = leaveTypesWithTotal.map((leaveType) => {
      const leaveTypeId = leaveType.id;
      const leaveTypeName = leaveType.name;
      const totalDays = leaveType.maxDaysPerYear;
       const paid = leaveType.isPaid;

      // ✅ Total column হলে শুধু header দেখানো
      if (leaveType.isTotal) {
        return {
          id: leaveTypeName,
          header: () => (
            <div className="text-center font-semibold whitespace-nowrap">
              Total Allowed Days ({totalDays})
            </div>
          ),
          columns: [
            {
              id: `${leaveTypeName}-totalLeaveDays`,
              header: "Total Leave Days", // sub-column header খালি
              cell: ({ row }) => (
                <div className="text-center font-medium">
                  {row?.original?.totalLeaveDays}
                </div>
              ),
              meta: { className: "text-center" },
            },
          ],
        };
      }

      return {
        header: () => (
          <div className="text-center font-semibold whitespace-nowrap">
            {leaveTypeName} ({totalDays} Days) - ({paid ? "Paid" : "Unpaid"})
          </div>
        ),
        id: leaveTypeName,
        columns: [
          {
            id: `${leaveTypeName}-used`,
            header: "Used Days",
            accessorFn: (row) => {
              const lt = row.leaveTypes?.find(
                (l) => l.leaveTypeId === leaveTypeId,
              );
              return lt?.usedDays || 0;
            },
            cell: ({ row }) => {
              const lt = row.original.leaveTypes?.find(
                (l) => l.leaveTypeId === leaveTypeId,
              );
              const used = lt?.usedDays || 0;
              const max = totalDays || 0;
              const pct = max ? Math.min(100, (used / max) * 100) : 0;
              return (
                <div className="mx-auto w-16">
                  <div className="text-center text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {used}
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            },
            // size: 80,
          },
          {
            id: `${leaveTypeName}-remaining`,
            header: "Remaining Days",
            accessorFn: (row) => {
              const lt = row.leaveTypes?.find(
                (l) => l.leaveTypeId === leaveTypeId,
              );
              return lt?.remainingDays || 0;
            },
            cell: ({ row }) => {
              const lt = row.original.leaveTypes?.find(
                (l) => l.leaveTypeId === leaveTypeId,
              );
              const remaining = lt?.remainingDays || 0;
              return (
                <div
                  className={`text-center font-medium ${
                    remaining < 2 ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  {remaining}
                </div>
              );
            },
            // size: 80,
          },
        ],
      };
    });

    return [...baseColumns, ...leaveTypeColumns];
  }, [leaveTypeDataArray]);
};
