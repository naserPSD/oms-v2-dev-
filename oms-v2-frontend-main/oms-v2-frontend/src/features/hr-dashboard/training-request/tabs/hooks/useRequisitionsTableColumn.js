import { useMemo } from "react";
import helpers from "@/utils/helpers";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import Avatar from "@/components/ui/Avatar";
import { Pencil, Trash2, Eye } from "lucide-react";
import { FaCheck } from "react-icons/fa";
import Link from "next/link";
export const useRequisitionsTableColumn = ({
  handleStatusChange,
  handleEdit,
  handleDelete,
  handleView,
  readOnly = false,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
      },
      {
        accessorKey: "employeeDetails",
        header: "Employee Details",
        accessorFn: (row) =>
          [
            row.employee?.user?.fullName,
            row.employee?.employeeCode,
            row.employee?.user?.email,
          ]
            .filter(Boolean) // Remove null/undefined values
            .join(" "),
        enableGlobalFilter: true,
        filterFn: "includesString",
        cell: ({ row }) => {
          const employee = row.original?.employee;
          const user = employee?.user;
          return (
            <Link
              href={`/hr-dashboard/employee/${row.original?.employee?.id}`}
              className="flex items-center gap-2"
            >
              <Avatar
                text={helpers.avatarText(user?.fullName)}
                color="info"
                size="md"
              />
              <div className="text-left">
                <p className="font-semibold dark-title-color">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  <SimpleTooltip text="User ID">
                    User ID: {employee?.employeeCode}
                  </SimpleTooltip>
                </p>
                <p className="text-xs text-gray-500">
                  <SimpleTooltip text="User Email">
                    {employee?.user?.email}
                  </SimpleTooltip>
                </p>
              </div>
            </Link>
          );
        },
        size: 220,
      },
      {
        accessorKey: "office",
        header: "Office Info",
        cell: ({ row }) => {
          const office = row.original?.employee?.office;
          const officeShift = row.original?.employee?.officeShift;
          const department = row.original?.department;
          return (
            <div>
              <SimpleTooltip text={"Office Name"}>
                <p className="font-semibold dark-title-color text-left">
                  {office?.name}
                </p>
              </SimpleTooltip>
              <div className=" gap-2 flex items-center  text-left">
                <div className="flex items-center gap-[3px]">
                  <SimpleTooltip text={"Office Shift"}>
                    <span className="text-xs text-left text-nowrap">
                      {office?.officeType?.name}
                    </span>
                  </SimpleTooltip>
                  <i className="fa-solid fa-circle text-gray-500 text-[4px]"></i>
                  <SimpleTooltip
                    text={`Office Shift: ${helpers.dTime(
                      officeShift?.startTime,
                    )} to ${helpers.dTime(officeShift?.endTime)}`}
                  >
                    <span className="text-xs text-left text-nowrap">
                      {officeShift?.name}
                    </span>
                  </SimpleTooltip>
                </div>
              </div>
              <SimpleTooltip text={"Department"}>
                <p className="text-xs text-gray-500 text-left">
                  {department?.name}
                </p>
              </SimpleTooltip>
            </div>
          );
        },
        size: 240,
      },
      {
        accessorKey: "requisitionNo",
        header: "Training Request No",
        cell: ({ row }) => (
          <span className="text-xs font-semibold">
            {row.original?.requisitionNo}
          </span>
        ),
        size: 200,
      },
      {
        accessorKey: "itemDescription",
        header: "Description",
        cell: ({ row }) => (
          <span className="text-xs dark-title-color font-semibold">
            {row.original?.itemDescription || "-"}
          </span>
        ),
        size: 200,
      },
      {
        accessorKey: "locationName",
        header: "Location",
        cell: ({ row }) => (
          <span className="text-xs text-gray-500">
            {row.original?.locationName || "-"}
          </span>
        ),
        size: 150,
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => {
          const val = row.original?.startDate || row.original?.start_date || row.original?.fromDate || row.original?.from_date || row.original?.preferredTrainingDate;
          return (
            <span className="text-xs text-gray-500">
              {val ? helpers.dDateUtc(val) : "-"}
            </span>
          );
        },
        size: 120,
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) => {
          const val = row.original?.endDate || row.original?.end_date || row.original?.toDate || row.original?.to_date || row.original?.preferredTrainingDate;
          return (
            <span className="text-xs text-gray-500">
              {val ? helpers.dDateUtc(val) : "-"}
            </span>
          );
        },
        size: 120,
      },
      {
        accessorKey: "requisitionDate",
        header: "Request Date",
        cell: ({ row }) => (
          <span className="text-xs">
            {helpers.dDateUtc(row.original?.requisitionDate)}
          </span>
        ),
        size: 120,
      },
      ...(readOnly
        ? [
            {
              accessorKey: "approvedDate",
              header: "Rejected Date",
              cell: ({ row }) => (
                <span className="text-xs">
                  {row.original?.approvedDate
                    ? helpers.dDateUtc(row.original.approvedDate)
                    : "-"}
                </span>
              ),
              size: 120,
            },
          ]
        : []),
      {
        accessorKey: "status",
        header: "Training Status",
        cell: ({ row }) => {
          const status = row.original?.status;
          return (
            <div className="text-center">
              <span
                className={`badge badge-pill badge-outline-${
                  readOnly ? "danger" : status?.colorName || "secondary"
                }`}
              >
                {readOnly ? "Rejected" : status?.name}
              </span>
            </div>
          );
        },
        size: 50,
      },
      {
        accessorKey: "remarks",
        header: readOnly ? "Rejection Remarks" : "Remarks",
        cell: ({ row }) => (
          <p className="text-xs text-gray-500 ">
            {row.original?.remarks || "-"}
          </p>
        ),
        size: 200,
      },
      ...(!readOnly
        ? [
            {
              accessorKey: "actions",
              header: "Action",
              enableSorting: false,
              size: 80,
              cell: ({ row }) => {
                const requisition = row.original;
                return (
                  <div className="gap-1 flex">
                    <SimpleTooltip text="Approve">
                      <button
                        onClick={() => handleStatusChange(requisition)}
                        className="btn-action  text-cyan-500 hover:text-cyan-700 "
                      >
                        <FaCheck size={16} />
                      </button>
                    </SimpleTooltip>
                    <SimpleTooltip text="Edit">
                      <button
                        onClick={() => handleEdit(requisition)}
                        className="btn-action  text-blue-500 hover:text-blue-700"
                      >
                        <Pencil size={16} />
                      </button>
                    </SimpleTooltip>
                    <SimpleTooltip text="View History">
                      <button
                        onClick={() => handleView && handleView(requisition)}
                        className="btn-action  text-purple-500 hover:text-purple-700"
                      >
                        <Eye size={16} />
                      </button>
                    </SimpleTooltip>
                    {requisition.status?.code !== "requisition_status_approved" && requisition.status?.code !== "requisition_status_rejected" && (
                      <SimpleTooltip text="Delete">
                        <button
                          onClick={() => handleDelete(requisition.id)}
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
          ]
        : []),
    ],
    [handleEdit, handleDelete, handleStatusChange, handleView, readOnly],
  );
};
