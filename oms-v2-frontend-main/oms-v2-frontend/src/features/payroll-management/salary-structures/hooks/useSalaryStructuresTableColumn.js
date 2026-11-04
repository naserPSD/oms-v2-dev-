// src/features/payroll/salary-structures/hooks/useSalaryStructuresTableColumn.js
import Avatar from "@/components/ui/Avatar";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import { formatTime } from "@/utils/formatTime";
import helpers from "@/utils/helpers";
import { Calendar, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export const useSalaryStructuresTableColumn = ({
  handleEdit,
  handleDelete,
  handleToggleStatus,
  handleViewDetails,
  hasPermission,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 60,
        cell: ({ row }) => (
          <div className="text-center text-gray-500 dark:text-gray-400">
            {row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "employeeDetails",
        header: "Employee Details",
        cell: ({ row }) => {
          const employee = row.original?.employee;
          const user = employee?.user;
          const userProfile = user?.profile;
          const designation = employee?.designation;
          const department = employee?.designation?.department;

          return (
            <Link
              href={`/hr-dashboard/employee/${row.original.empId}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="max-w-[300px]">
                {/* Employee Basic Info */}
                <div className="flex items-center gap-3">
                  {/* Avatar/Profile Picture */}
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Avatar
                      image={userProfile?.profilePicture?.fileUrl || ""}
                      text={helpers.avatarText(user?.fullName)}
                      value={user?.fullName || ""}
                      alt={user?.fullName || "Employee"}
                      color="info"
                      size="md"
                    />
                  </div>

                  {/* Employee Information */}
                  <div className="flex-1 min-w-0">
                    {/* Name and Email */}
                    <div className="mb-2">
                      <p className="font-semibold text-sm dark-title-color truncate">
                        {user?.fullName || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || "No email"}
                      </p>

                      <p>
                        {designation?.name && (
                          <SimpleTooltip text="Designation">
                            <span className="inline-flex items-center px-2 py-.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {designation.name}
                            </span>
                          </SimpleTooltip>
                        )}
                      </p>
                      <p>
                        {" "}
                        {department?.name && (
                          <SimpleTooltip text="Department">
                            <p className="text-[10px] text-gray-500 truncate">
                              {department.name}
                            </p>
                          </SimpleTooltip>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        },
        size: 300,
      },

      {
        accessorKey: "office",
        header: "Office",
        cell: ({ row }) => {
          const employee = row.original?.employee;
          const office = employee?.office;
          const officeShift = employee?.officeShift;

          return (
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div>
                  <p className="font-semibold dark-title-color">
                    {office?.name}
                  </p>
                  <div className="">
                    <SimpleTooltip text={"Office Shift"}>
                      <span className="text-xs">
                        {office?.officeType?.name}
                      </span>
                    </SimpleTooltip>

                    <SimpleTooltip
                      text={`Office Shift: ${formatTime(
                        officeShift?.startTime,
                      )} to ${formatTime(officeShift?.endTime)}`}
                    >
                      <span className="text-xs">{officeShift?.name}</span>
                    </SimpleTooltip>
                  </div>
                </div>
              </div>
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: "grade",
        header: "Salary Grade",
        cell: ({ row }) => {
          const grade = row.original?.grade;
          return (
            <div>
              <p className="font-medium text-sm dark-title-color">
                {grade?.gradeName || "N/A"}
              </p>
              {grade?.gradeCode && (
                <p className="text-xs text-gray-500">Code: {grade.gradeCode}</p>
              )}
              <p className="text-xs text-gray-500">
                Min: {parseFloat(grade?.minSalary || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Max: {parseFloat(grade?.maxSalary || 0).toLocaleString()}
              </p>
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "basicSalary",
        header: "Basic Salary",
        cell: ({ row }) => {
          const basicSalary = row.original?.basicSalary;
          return (
            <div className="text-right">
              <p className="font-semibold text-sm text-green-600">
                {parseFloat(basicSalary || 0).toLocaleString()}
              </p>
            </div>
          );
        },
        size: 120,
      },
      // {
      //   accessorKey: "salaryStructureDetails",
      //   header: "Additional",
      //   cell: ({ row }) => {
      //     const details = row.original?.salaryStructureDetails || [];
      //     const totalAdditional = details.reduce(
      //       (sum, item) => sum + parseFloat(item.calculatedAmount || 0),
      //       0
      //     );
      //     const basicSalary = parseFloat(row.original?.basicSalary || 0);
      //     const grossSalary = basicSalary + totalAdditional;

      //     return (
      //       <div className="text-center space-y-1">
      //         <SimpleTooltip text="Click to view details">
      //           <button
      //             onClick={() => handleViewDetails(details)}
      //             className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
      //           >
      //             {details.length}
      //           </button>
      //         </SimpleTooltip>
      //         <div className="text-xs text-gray-500">
      //           <div>Gross: ৳{grossSalary.toLocaleString()}</div>
      //           {totalAdditional > 0 && (
      //             <SimpleTooltip text="Total Additional Amount">
      //               <div>+৳{totalAdditional.toLocaleString()}</div>
      //             </SimpleTooltip>
      //           )}
      //         </div>
      //       </div>
      //     );
      //   },
      //   size: 120,
      // },
      {
        accessorKey: "effectiveFrom",
        header: "Effective Date",
        cell: ({ row }) => {
          const effectiveFrom = row.original?.effectiveFrom;
          const effectiveTo = row.original?.effectiveTo;

          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="text-[12px] flex flex-col gap-1 text-gray-600 dark:text-gray-400">
                <SimpleTooltip text="Effective From">
                  <span>
                    {effectiveFrom ? helpers.dDate(effectiveFrom) : "N/A"}
                  </span>
                </SimpleTooltip>
                <SimpleTooltip text="Effective To">
                  <span>
                    {effectiveTo ? helpers.dDate(effectiveTo) : "Continued"}
                  </span>
                </SimpleTooltip>
              </div>
            </div>
          );
        },
        size: 120,
      },

      {
        accessorKey: "isActive",
        header: "Active",
        cell: ({ row }) => (
          <SimpleTooltip
            text={`Salary Structure Status : ${
              row.original?.isActive ? "Active" : "Inactive"
            }`}
          >
            <SwitchButton
              enabled={row.original.isActive}
              onClick={() => handleToggleStatus(row.original.id)}
              color={row.original?.isActive ? "success" : "danger"}
              enabledText="Yes"
              disabledText="No"
              className="cursor-pointer"
              disabled={
                !hasPermission("payroll_management.salary_structures_edit")
              }
            />
          </SimpleTooltip>
        ),
        size: 50,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => {
          const remarks = row.original?.remarks;
          return (
            <div className="max-w-[200px]">
              <SimpleTooltip text={remarks || "No remarks"}>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                  {remarks || "-"}
                </p>
              </SimpleTooltip>
            </div>
          );
        },
        size: 150,
      },
      // {
      //   accessorKey: "createdAt",
      //   header: "Created Date",
      //   cell: ({ row }) => {
      //     const createdAt = row.original?.createdAt;
      //     return (
      //       <div className="flex items-center gap-2">
      //         <Calendar className="h-4 w-4 text-gray-400" />
      //         <div>
      //           <p className="text-xs font-medium dark-title-color">
      //             {createdAt ? helpers.dDate(createdAt) : "-"}
      //           </p>
      //           <p className="text-xs text-gray-500">
      //             {createdAt ? helpers.dTime(createdAt) : ""}
      //           </p>
      //         </div>
      //       </div>
      //     );
      //   },
      //   size: 150,
      // },
      {
        accessorKey: "actions",
        header: "Actions",
        enableSorting: false,
        size: 100,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              {hasPermission("payroll_management.salary_structures_view") && (
                <SimpleTooltip text="View Salary Structure">
                  <button
                    onClick={() => handleViewDetails(item)}
                    className="icon-btn icon-btn-outlined-primary icon-btn-sm"
                  >
                    <Eye size={16} />
                  </button>
                </SimpleTooltip>
              )}

              {hasPermission("payroll_management.salary_structures_edit") && (
                <SimpleTooltip text="Edit Salary Structure">
                  <button
                    onClick={() => handleEdit(item)}
                    className="icon-btn icon-btn-outlined-info icon-btn-sm"
                  >
                    <Pencil size={16} />
                  </button>
                </SimpleTooltip>
              )}

              {hasPermission("payroll_management.salary_structures_delete") && (
                <SimpleTooltip text="Delete Salary Structure">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="icon-btn icon-btn-outlined-danger icon-btn-sm"
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
    [handleEdit, handleDelete, handleToggleStatus, handleViewDetails],
  );
};
