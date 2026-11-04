import { useMemo } from "react";
import helpers from "@/utils/helpers";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { Pencil, Trash2 } from "lucide-react";
export const useRecruitmentStepTableColumn = ({
  handleEdit,
  handleDelete,
  hasPermission,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
      },
      // {
      //   accessorKey: "userProfile",
      //   header: "Employee Details",
      //   accessorFn: (row) => row.user?.fullName,
      //   enableGlobalFilter: true,
      //   filterFn: "includesString",
      //   cell: ({ row }) => {
      //     const user = row?.original?.user;
      //     const userProfile = row?.original?.user?.profile;
      //     const designation = row?.original?.designation;
      //     return (
      //       <Link
      //         href={`/hr-dashboard/employee/${row.original.id}`}
      //         className="flex items-center gap-2 cursor-pointer"
      //       >
      //         {userProfile?.profilePicture?.fileUrl ? (
      //           <img
      //             src={userProfile?.profilePicture?.fileUrl}
      //             alt={user?.fullName}
      //             className="w-8 h-8 rounded-full object-cover"
      //           />
      //         ) : (
      //           <Avatar
      //             text={helpers.avatarText(user?.fullName)}
      //             color="info"
      //             size="lg"
      //             // className="bg-blue-200 text-blue-700 dark:bg-blue-600 dark:text-blue-100"
      //           />
      //         )}

      //         <div className="ml-1">
      //           <p className="font-semibold dark-title-color">
      //             {user?.fullName}
      //           </p>
      //           <SimpleTooltip text={"Designation"}>
      //             {designation?.name && (
      //               <span className="badge badge-rounded badge-outline-secondary">
      //                 {designation?.name}
      //               </span>
      //             )}
      //           </SimpleTooltip>
      //           <p className="text-xs text-gray-500">{user?.email}</p>
      //           <p className="text-xs text-gray-500">
      //             {userProfile?.phoneWithCallingCode}
      //           </p>
      //         </div>
      //       </Link>
      //     );
      //   },
      //   size: 310,
      // },
      {
        accessorKey: "name",
        header: " Job Recruitment Step Name",
        cell: ({ row }) => {
          const RecruitmentStepName = row.original?.name;
          // const officeShift = row.original?.officeShift;
          // const department = row.original?.designation?.department;
          return (
            <div className="flex items-center gap-2">
              <div>
                {/* <p className="font-semibold dark-title-color">{office?.name}</p> */}
                <div className="flex items-center gap-[2px]">
                  <SimpleTooltip text={"Recruitment Step Name"}>
                    <span className="text-xs">{RecruitmentStepName}</span>
                  </SimpleTooltip>
                  {/* <i className="fa-solid fa-circle text-gray-500 text-[4px]"></i> */}
                  {/* <SimpleTooltip
                    text={`Office Shift: ${formatTime(
                      officeShift?.startTime,
                    )} to ${formatTime(officeShift?.endTime)}`}
                  >
                    <span className="text-xs">{officeShift?.name}</span>
                  </SimpleTooltip> */}
                </div>
                {/* <SimpleTooltip text={"Department"}>
                  <p className="text-xs text-gray-500">{department?.name}</p>
                </SimpleTooltip> */}
              </div>
            </div>
          );
        },
        //size: 200,
      },
      {
        accessorKey: "createdAt",
        header: "Created Date",
        cell: ({ row }) => (
          <>
            <p className="text-xs ">
              {" "}
              {row.original.createdAt
                ? helpers.dDate(row.original.createdAt)
                : "-"}
            </p>
            {/* <span>{row.original.reminderAt ? helpers.dDate(row.original.reminderAt, 'DD-MM-YYYY HH:mm A') : "-"}</span> */}
          </>
        ),
        // size: 100,
      },
      // {
      //   accessorKey: "employmentStatus",
      //   header: "Employment Status",
      //   cell: ({ row }) => {
      //     const employmentStatus = row.original?.employmentStatus;
      //     return (
      //       <div className="text-center">
      //         <span
      //           className={`badge badge-pill badge-outline-${
      //             employmentStatus?.colorName || "secondary"
      //           }`}
      //         >
      //           {employmentStatus?.name}
      //         </span>
      //       </div>
      //     );
      //   },
      //   size: 50,
      // },
      // {
      //   accessorKey: "employeeStatus",
      //   header: "Employee Status",
      //   cell: ({ row }) => {
      //     const employeeStatus = row.original?.employeeStatus;
      //     return (
      //       <div className="text-center">
      //         <span
      //           className={`badge badge-pill badge-outline-${
      //             employeeStatus?.colorName || "secondary"
      //           }`}
      //         >
      //           {employeeStatus?.name}
      //         </span>
      //       </div>
      //     );
      //   },
      //   size: 50,
      // },
      // {
      //   accessorKey: "status",
      //   header: "Active",
      //   cell: ({ row }) => {
      //     const value = row.original?.user?.isActive;
      //     return (
      //       <div className="text-center">
      //         <span
      //           className={`badge badge-pill ${
      //             value === true
      //               ? "badge-outline-success"
      //               : "badge-outline-danger"
      //           }`}
      //         >
      //           {value === true ? "Yes" : "No"}
      //         </span>
      //       </div>
      //     );
      //   },
      //   size: 50,
      // },
      // {
      //   accessorKey: "remarks",
      //   header: "Remarks",
      //   cell: ({ row }) => {
      //     // const office = row.original?.office;
      //     // const officeShift = row.original?.officeShift;
      //     // const department = row.original?.designation?.department;
      //     return (
      //       <div className="flex items-center gap-2">
      //         <div>
      //           <p className="text-xs text-gray-500">{row.original?.remarks}</p>
      //           <SimpleTooltip text={"Resignation Date"}>
      //             <p className="text-xs text-red-500">
      //               {helpers.dDate(row.original?.resignationDate)}
      //             </p>
      //           </SimpleTooltip>
      //         </div>
      //       </div>
      //     );
      //   },
      // },
      {
        accessorKey: "actions",
        header: "Action",
        enableSorting: false,
        size: 80,
        cell: ({ row }) => {
          const employee = row.original;
          return (
            <div className="action flex gap-2">
              {hasPermission("hr.job_recruitment_step_name_delete") && (
                <button
                  onClick={() => handleEdit(employee)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              )}
              {hasPermission("hr.job_recruitment_step_name_edit") && (
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="btn-action text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete],
  );
};
