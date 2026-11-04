import { useMemo } from "react";

import SimpleTooltip from "@/components/ui/SimpleTooltip";

import { Pencil, Trash2 } from "lucide-react";
import SwitchButton from "@/components/ui/SwitchButton";

export const useAttendanceRulesTableColumn = ({
  handleEdit,
  handleDelete,
  changeAttendanceAbsentStatus,
  changeAttendanceActiveStatus,
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
        accessorKey: "office",
        header: "Office Name",
        cell: ({ row }) => {
          const office = row.original?.office;

          return (
            <div>
              <SimpleTooltip text={"Office Name"}>
                <p className="font-semibold dark-title-color text-left">
                  {office?.name}
                </p>
              </SimpleTooltip>
            </div>
          );
        },
        size: 240,
      },

      {
        accessorKey: "minLateMinutes",
        header: "Minute Range",
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
        accessorKey: "fineAmount",
        header: "Fine Amount",
        cell: ({ row }) => (
          <span className="text-xs">{row.original?.fineAmount}</span>
        ),
        size: 80,
      },
      {
        accessorKey: "fineIntervalDays",
        header: "Fine Interval Days",
        cell: ({ row }) => (
          <span className="text-xs">{row.original?.fineIntervalDays}</span>
        ),
        size: 80,
      },

      {
        accessorKey: "isAbsent",
        header: "Absent",
        cell: ({ row }) => {
          const isAbsent = row.original?.isAbsent;
          const id = row.original?.id;
          return (
            <div>
              <SwitchButton
                onClick={() => changeAttendanceAbsentStatus(id)}
                enabled={isAbsent}
                enabledText="Yes"
                disabledText="No"
                className="!mb-0"
                disabled={!hasPermission("hr.attendance_rules_edit")}
              />
            </div>
          );
        },
        size: 240,
      },

      {
        accessorKey: "isActive",
        header: "Active",
        cell: ({ row }) => {
          const isActive = row.original?.isActive;
          const id = row.original?.id;
          return (
            <div>
              <SwitchButton
                onClick={() => changeAttendanceActiveStatus(id)}
                enabled={isActive}
                enabledText="Yes"
                disabledText="No"
                className="!mb-0"
                disabled={!hasPermission("hr.attendance_rules_edit")}
              />
            </div>
          );
        },
        size: 240,
      },

      {
        accessorKey: "actions",
        header: "Action",
        enableSorting: false,
        size: 80,
        cell: ({ row }) => {
          const attendanceRules = row.original;
          return (
            <div className="gap-1 flex">
              {hasPermission("hr.attendance_rules_edit") && (
                <SimpleTooltip text="Edit">
                  <button
                    onClick={() => handleEdit(attendanceRules)}
                    className="btn-action  text-blue-500 hover:text-blue-700"
                  >
                    <Pencil size={16} />
                  </button>
                </SimpleTooltip>
              )}
              {hasPermission("hr.attendance_rules_delete") && (
                <SimpleTooltip text="Delete">
                  <button
                    onClick={() => handleDelete(attendanceRules.id)}
                    className="btn-action  text-red-500 hover:text-red-700"
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
      changeAttendanceAbsentStatus,
      changeAttendanceActiveStatus,
    ],
  );
};
