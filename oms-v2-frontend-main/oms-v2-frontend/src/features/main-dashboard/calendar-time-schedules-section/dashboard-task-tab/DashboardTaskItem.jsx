"use client";

import React from "react";
import {
  Calendar,
  Users,
  Tag,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import helpers from "@/utils/helpers";

const DashboardTaskItem = ({ task, onClick }) => {
  // Get priority badge class
  const getPriorityBadgeClass = (priority) => {
    const colorMap = {
      critical: "danger",
      high: "warning",
      medium: "info",
      low: "warning",
      normal: "secondary",
    };

    const colorName = priority?.colorName?.toLowerCase() || "secondary";
    const mappedColor = colorMap[colorName] || colorName;

    return `badge badge-pill badge-outline-${mappedColor}`;
  };

  // Get status badge class
  const getStatusBadgeClass = (taskStatus) => {
    const colorMap = {
      success: "success",
      warning: "warning",
      danger: "danger",
      info: "info",
      secondary: "secondary",
    };

    const colorName = taskStatus?.colorName?.toLowerCase() || "secondary";
    const mappedColor = colorMap[colorName] || colorName;

    return `badge badge-pill badge-outline-${mappedColor}`;
  };

  // Format date for tooltip
  const formatFullDate = (dateString) => {
    if (!dateString) return "No date";
    return helpers.dDate(dateString);
  };

  // Calculate days remaining
  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(task.dueDate);

  // Get assignee names for tooltip
  const getAssigneeNames = () => {
    if (!task.assignees || task.assignees.length === 0) {
      return "No assignees";
    }
    return task.assignees
      .map((a) => a.assignedOn?.user?.fullName || "Unknown")
      .join(", ");
  };

  // Get tag names for tooltip
  const getTagNames = () => {
    if (!task.tags || task.tags.length === 0) {
      return "No tags";
    }
    return task.tags.map((t) => t.name).join(", ");
  };

  // Get due date status
  const getDueDateStatus = () => {
    if (!task.dueDate) return "No due date";

    if (daysRemaining < 0) {
      return `Overdue by ${Math.abs(daysRemaining)} days`;
    } else if (daysRemaining === 0) {
      return "Due today";
    } else {
      return `${daysRemaining} days remaining`;
    }
  };

  return (
    <button
      onClick={() => onClick(task)}
      className="w-full text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 group cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Task Name and ID */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 break-words">
                {task.name || `Task ${task.id}`}
              </h4>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 mt-1" />
          </div>

          {/* Task Meta Info with Tooltips */}
          <div className="flex flex-wrap items-center  justify-between  gap-3 text-xs">
            <div className="flex items-center gap-1">
              {/* Priority with Tooltip */}
              {task.priority && (
                <SimpleTooltip text={`Priority: ${task.priority.name}`}>
                  <span className={getPriorityBadgeClass(task.priority)}>
                    {task.priority.name}
                  </span>
                </SimpleTooltip>
              )}

              {/* Status with Tooltip */}
              {task.taskStatus && (
                <SimpleTooltip text={`Status: ${task.taskStatus.name}`}>
                  <span className={getStatusBadgeClass(task.taskStatus)}>
                    {task.taskStatus.name}
                  </span>
                </SimpleTooltip>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Assignees with Tooltip */}
              {task.assignees && task.assignees.length > 0 && (
                <SimpleTooltip text={`Assignees: ${getAssigneeNames()}`}>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Users className="h-3 w-3" />
                    <span>{task.assignees.length}</span>
                  </div>
                </SimpleTooltip>
              )}

              {/* Tags with Tooltip */}
              {task.tags && task.tags.length > 0 && (
                <SimpleTooltip text={`Tags: ${getTagNames()}`}>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Tag className="h-3 w-3" />
                    <span>{task.tags.length}</span>
                  </div>
                </SimpleTooltip>
              )}

              {/* Comments with Tooltip */}
              {task.comments && task.comments.length > 0 && (
                <SimpleTooltip text={`${task.comments.length} comments`}>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <MessageSquare className="h-3 w-3" />
                    <span>{task.comments.length}</span>
                  </div>
                </SimpleTooltip>
              )}

              {/* Due Date with Tooltip */}
              {task.dueDate && (
                <SimpleTooltip
                  text={`Due: ${formatFullDate(
                    task.dueDate
                  )} - ${getDueDateStatus()}`}
                >
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {daysRemaining !== null && (
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          daysRemaining < 0
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            : daysRemaining <= 3
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        }`}
                      >
                        {daysRemaining < 0
                          ? `${Math.abs(daysRemaining)}d`
                          : daysRemaining === 0
                          ? "Today"
                          : `${daysRemaining}d`}
                      </span>
                    )}
                  </div>
                </SimpleTooltip>
              )}

              {/* Card with Tooltip */}
              {/* {task.card && (
                <SimpleTooltip text={`Card: ${task.card.name}`}>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: task.card.color || "#3b82f6" }}
                    />
                  </div>
                </SimpleTooltip>
              )} */}

              {/* Task ID (always visible) */}
              {/* <span className="text-gray-500">#{task.id}</span> */}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default DashboardTaskItem;
