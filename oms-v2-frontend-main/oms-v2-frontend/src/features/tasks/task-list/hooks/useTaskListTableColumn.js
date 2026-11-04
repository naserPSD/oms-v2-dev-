//import Avatar from "@/components/ui/Avatar";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { cn } from "@/lib/utils";

import helpers from "@/utils/helpers";
import {
  Calendar,
  Flag,
  Folder,
  Layers,
  MessageSquare,
  Pencil,
  Trash2,
  Users,
  Tag,
  Eye,
} from "lucide-react";
import { useMemo } from "react";

export const useTaskListTableColumn = ({
  handleEdit,
  handleDelete,

  // handleToggleStatus,
  handleViewTaskCommentsModal,
  handleVewTaskAssigneeModal,
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
        accessorKey: "name",
        header: "Task Name",
        cell: ({ row }) => {
          const name = row.original?.name;
          const card = row.original?.card;
          const tags = row.original?.tags || [];

          return (
            <div className="flex items-start gap-3 min-w-[220px]">
              {card?.color && (
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: card.color }}
                />
              )}
              <div className="flex-1 min-w-0">
                {/* Task Name */}
                <p className="font-semibold dark-title-color text-sm truncate leading-tight">
                  {name}
                </p>

                {/* Card Name */}
                {card?.name && (
                  <p className="text-xs text-gray-500 truncate leading-tight mt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Layers size={10} className="flex-shrink-0" />
                      <span className="truncate">{card.name}</span>
                    </span>
                  </p>
                )}

                {/* Tags - Display under task name */}
                {tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag, index) => (
                      <SimpleTooltip key={index} text={`Tag: ${tag.name}`}>
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded text-[10px] font-medium truncate max-w-[60px]">
                          <Tag size={8} className="mr-0.5 flex-shrink-0" />
                          <span className="truncate">{tag.name}</span>
                        </span>
                      </SimpleTooltip>
                    ))}
                    {tags.length > 3 && (
                      <SimpleTooltip text={`+${tags.length - 3} more tags`}>
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded text-[10px] font-medium">
                          +{tags.length - 3}
                        </span>
                      </SimpleTooltip>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        },
        size: 280, // Increased size for tags
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const description = row.original?.description;
          return (
            <div className="w-full">
              <SimpleTooltip text={description || "No description"}>
                <div className="w-full overflow-hidden">
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate whitespace-nowrap overflow-hidden text-ellipsis w-full">
                    {description || "-"}
                  </p>
                </div>
              </SimpleTooltip>
            </div>
          );
        },
        size: 200,
        minSize: 150,
        maxSize: 250,
      },
      {
        accessorKey: "parentTask",
        header: "Parent Task",
        cell: ({ row }) => {
          const parentTask = row.original?.parentTask;
          return (
            <div>
              {parentTask ? (
                <SimpleTooltip text={parentTask.name}>
                  <div className="flex items-center gap-1 w-full">
                    <Folder size={14} className="flex-shrink-0 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate whitespace-nowrap overflow-ellipsis">
                        {parentTask.name}
                      </p>
                    </div>
                  </div>
                </SimpleTooltip>
              ) : (
                <span className="text-sm text-gray-400">-</span>
              )}
            </div>
          );
        },
        size: 160,
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
          const priority = row.original?.priority;
          const colorName = priority?.colorName || "secondary";
          const priorityName = priority?.name || "-";

          // Color classes based on colorName
          const colorClasses = {
            danger:
              "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
            warning:
              "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
            info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
            primary:
              "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
            secondary:
              "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
          };

          const selectedClass =
            colorClasses[colorName] || colorClasses.secondary;

          return (
            <SimpleTooltip text={`Task Priority: ${priorityName}`}>
              <div className="flex items-center gap-2 cursor-pointer">
                {/* Flag icon */}
                <Flag
                  size={14}
                  className={
                    colorName === "danger"
                      ? "text-red-500"
                      : colorName === "warning"
                      ? "text-yellow-500"
                      : colorName === "info"
                      ? "text-blue-500"
                      : colorName === "primary"
                      ? "text-indigo-500"
                      : "text-gray-500"
                  }
                />

                {/* Badge */}
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                    selectedClass,
                    "truncate max-w-[100px]"
                  )}
                >
                  {priorityName}
                </span>
              </div>
            </SimpleTooltip>
          );
        },
        size: 130,
      },
      {
        accessorKey: "assignees",
        header: "Assignees",
        cell: ({ row }) => {
          const assignees = row.original?.assignees || [];
          const assigneesCount = assignees.length;

          return (
            <div className="text-center">
              <SimpleTooltip
                text={`${assigneesCount} assignee(s) - Click to view details`}
              >
                <button
                  onClick={() => handleVewTaskAssigneeModal(row.original)}
                  className="inline-flex flex-col items-center justify-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <Users size={14} className="text-blue-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {assigneesCount}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Assignee(s)</span>
                </button>
              </SimpleTooltip>
            </div>
          );
        },
        size: 100,
      },
      {
        accessorKey: "comments",
        header: "Comments",
        cell: ({ row }) => {
          const comments = row.original?.comments || [];
          const commentsCount = comments.length;

          return (
            <div className="text-center">
              <SimpleTooltip
                text={`${commentsCount} comment(s) - Click to view`}
              >
                <button
                  onClick={() => handleViewTaskCommentsModal(row.original)}
                  className="inline-flex flex-col items-center justify-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <MessageSquare size={14} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {commentsCount}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Comment(s)</span>
                </button>
              </SimpleTooltip>
            </div>
          );
        },
        size: 100,
      },
      // {
      //   accessorKey: "tags",
      //   header: "Tags",
      //   cell: ({ row }) => {
      //     const tags = row.original?.tags || [];
      //     const tagsCount = tags.length;

      //     return (
      //       <div className="text-center">
      //         <SimpleTooltip
      //           text={tags.map((t) => t.name).join(", ") || "No tags"}
      //           className="capitalize"
      //         >
      //           <button className="inline-flex flex-col items-center justify-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded transition-colors">
      //             <div className="flex items-center gap-1">
      //               <Tag size={14} className="text-purple-500" />
      //               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      //                 {tagsCount}
      //               </span>
      //             </div>
      //             <span className="text-xs text-gray-500">Tag(s)</span>
      //           </button>
      //         </SimpleTooltip>
      //       </div>
      //     );
      //   },
      //   size: 100,
      // },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ row }) => {
          const dueDate = row.original?.dueDate;
          return (
            <div className="flex items-center gap-2 min-w-[120px]">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium dark-title-color truncate">
                  {dueDate ? helpers.dDate(dueDate) : "-"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {dueDate ? helpers.dTime(dueDate) : ""}
                </p>
              </div>
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: "completedAt",
        header: "Completed At",
        cell: ({ row }) => {
          const completedAt = row.original?.completedAt;
          const isCompleted = completedAt !== null;

          return (
            <div className="flex items-center gap-2 min-w-[120px]">
              <Calendar
                className={`h-4 w-4 flex-shrink-0 ${
                  isCompleted ? "text-green-500" : "text-gray-400"
                }`}
              />
              <div className="min-w-0">
                <p
                  className={`text-xs font-medium truncate ${
                    isCompleted
                      ? "text-green-600 dark:text-green-400"
                      : "dark-title-color"
                  }`}
                >
                  {isCompleted ? helpers.dDate(completedAt) : "Not Completed"}
                </p>
                {isCompleted && (
                  <p className="text-xs text-gray-500 truncate">
                    {helpers.dTime(completedAt)}
                  </p>
                )}
              </div>
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: "serial",
        header: "Serial",
        cell: ({ row }) => {
          const serial = row.original?.serial;
          return (
            <div className="text-center">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium">
                {serial}
              </span>
            </div>
          );
        },
        size: 80,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
          const createdAt = row.original?.createdAt;
          return (
            <div className="flex items-center gap-2 min-w-[120px]">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium dark-title-color truncate">
                  {createdAt ? helpers.dDate(createdAt) : "-"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {createdAt ? helpers.dTime(createdAt) : ""}
                </p>
              </div>
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        enableSorting: false,
        size: 100,
        cell: ({ row }) => {
          const item = row.original;

          return (
            <div className="flex items-center justify-center gap-2">
              <SimpleTooltip text="View Task">
                <button
                  onClick={() => handleEdit(item, true)} // 👈 view = true
                  className="icon-btn icon-btn-outlined-primary icon-btn-sm"
                >
                  <Eye size={14} />
                </button>
              </SimpleTooltip>

             
                <SimpleTooltip text="Edit Task">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                </SimpleTooltip>
            
                <SimpleTooltip text="Delete Task">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </SimpleTooltip>
           
            </div>
          );
        },
      },
    ],
    [
      handleEdit,
      handleDelete,
      handleViewTaskCommentsModal,
      handleVewTaskAssigneeModal,
     
    ]
  );
};
