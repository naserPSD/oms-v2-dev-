"use client";

import { useState, useMemo } from "react";
import DataFilter from "@/components/common/DataFilter";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import { format } from "date-fns";
import { toast } from "sonner";
import { EventCalendar } from "@/components/big-calender/event-calendar";

const CalendarView = ({
  // Props from parent
  tasks = [],
  onEdit,
  onDelete,
  onViewAssignees,
  onViewComments,
  onToggleStatus,
  onAddTask,
  isLoading = false,
  total = 0,
  refetch,
  filters,
  globalFilter,
  hasActiveFilters,
  filterConfig,
  showFilter,
  toggleFilter,
  handleFilterChange,
  clearAllFilters,
}) => {
  // Transform tasks to calendar events
  const calendarEvents = useMemo(() => {
    return tasks.map((task) => {
      // Determine event color based on priority and status
      const getEventColor = () => {
        // Completed tasks
        if (task.completedAt) return "#10b981"; // Green

        // Priority based colors
        const priorityColor = {
          danger: "#ef4444", // Red
          warning: "#f59e0b", // Yellow/Orange
          info: "#3b82f6", // Blue
          primary: "#8b5cf6", // Purple
          secondary: "#6b7280", // Gray
        };

        return priorityColor[task.priority?.colorName] || "#3b82f6";
      };

      // Get assignees names
      const getAssignees = () => {
        if (!task.assignees || task.assignees.length === 0) {
          return "Unassigned";
        }
        return task.assignees
          .map(
            (a) =>
              a.assignedOn?.user?.fullName ||
              a.assignedOn?.user?.firstName ||
              "Unknown"
          )
          .join(", ");
      };

      // Get tags
      const getTags = () => {
        if (!task.tags || task.tags.length === 0) {
          return [];
        }
        return task.tags.map((tag) => tag.name);
      };

      // Format dates
      const formatDate = (dateString) => {
        if (!dateString) return "No date";
        return format(new Date(dateString), "MMM d, yyyy h:mm a");
      };

      // Create event description
      const eventDescription = `
        ${task.description || "No description"}
        
        Card: ${task.card?.name || "No Card"}
        Priority: ${task.priority?.name || "No Priority"}
        Assignees: ${getAssignees()}
        Tags: ${getTags().join(", ") || "No tags"}
        Created: ${formatDate(task.createdAt)}
        Due: ${formatDate(task.dueDate)}
        ${task.completedAt ? `Completed: ${formatDate(task.completedAt)}` : ""}
      `;

      // Use due date if available, otherwise use creation date
      const eventDate = task.dueDate
        ? new Date(task.dueDate)
        : new Date(task.createdAt);

      // For all-day events, we set time to start of day
      const startDate = new Date(eventDate);
      startDate.setHours(0, 0, 0, 0);

      // End date is same as start date for all-day events
      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);

      return {
        id: `task-${task.id}`,
        title: task.name,
        description: eventDescription,
        start: startDate,
        end: endDate,
        allDay: true,
        color: getEventColor(),
        type: "task",
        rawData: task,
        extendedProps: {
          taskId: task.id,
          completed: !!task.completedAt,
          priority: task.priority?.name,
          card: task.card?.name,
          assignees: getAssignees(),
          tags: getTags(),
          commentsCount: task.comments?.length || 0,
        },
      };
    });
  }, [tasks]);

  // Event handlers for calendar
  const handleEventAdd = (event) => {
    console.log("New event to add:", event);

    // Transform calendar event to task format
    const newTask = {
      name: event.title || "New Task",
      description: event.description || "",
      dueDate: event.start,
      cardId: 1, // Default card ID
      priorityId: 1, // Default priority ID
      taskAssignees: [],
      taskTags: [],
    };

    // Show toast
    toast.success("Task created", {
      description: `New task scheduled for ${format(
        event.start,
        "MMM d, yyyy"
      )}`,
    });

    // You can implement API call here or call parent's add function
    // console.log("New task data:", newTask);
  };

  const handleEventUpdate = (updatedEvent) => {
    // console.log("Event updated:", updatedEvent);

    // Extract task ID from event ID
    const taskId = parseInt(updatedEvent.id.replace("task-", ""));

    if (taskId && updatedEvent.rawData) {
      // Update task due date
      const updatedTask = {
        ...updatedEvent.rawData,
        dueDate: updatedEvent.start,
      };

      // Show toast
      toast.info("Task updated", {
        description: `Task moved to ${format(
          updatedEvent.start,
          "MMM d, yyyy"
        )}`,
      });

      // Call parent's edit function
      onEdit(updatedTask);
    }
  };

  const handleEventDelete = (eventId) => {
    console.log("Event deleted:", eventId);

    // Extract task ID from event ID
    const taskId = parseInt(eventId.replace("task-", ""));

    if (taskId) {
      // Show confirmation toast or directly delete
      toast.warning("Task deleted", {
        description: "Task has been removed from calendar",
      });

      // Call parent's delete function
      onDelete(taskId);
    }
  };

  // Handle event click - show task details
  const handleEventClick = (eventInfo) => {
    const task = eventInfo.rawData || eventInfo.event.extendedProps?.rawData;
    if (task) {
      // Open edit modal for the task
      onEdit(task);
    }
  };

  // Handle date click - create new task on that date
  const handleDateClick = (date) => {
    // Create a new task with the clicked date as due date
    const newTask = {
      id: 0,
      name: "",
      description: "",
      dueDate: format(date, "yyyy-MM-dd"),
      cardId: 0,
      priorityId: 0,
      taskAssignees: [],
      taskTags: [],
    };

    // Call parent's add function with pre-filled date
    onAddTask(newTask);
  };

  // Loading state for calendar
  if (isLoading) {
    return (
      <div className="my-6">
        <div className="flex items-center justify-between my-5">
          <div>
            <h1 className="title-color font-bold text-2xl">Task Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Loading tasks...
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-6 animate-pulse"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-2xl">Task Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and Manage Tasks on Calendar ({total} Tasks)
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <SimpleTooltip text={`${showFilter ? "Hide" : "Show"} Filters`}>
            <ButtonTw
              onClick={toggleFilter}
              variant="alternative"
              className="gap-2"
            >
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>

          <ButtonTw onClick={() => onAddTask?.()} variant="blue" className="gap-2">
            <BiPlus /> Add Task
          </ButtonTw>
        </div>
      </div>

      {/* Filter Bar */}
      <DataFilter
        showFilter={showFilter}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Calendar Component */}
      <div className="mt-4">
        <EventCalendar
          events={calendarEvents}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          onEventClick={handleEventClick}
          initialView="month"
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        />
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
          Calendar Legend
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Completed Tasks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              High Priority
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Medium Priority
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Normal Priority
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Low Priority
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Tasks
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {tasks.filter((t) => t.completedAt).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Completed
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {
              tasks.filter((t) => t.assignees?.length > 0 && !t.completedAt)
                .length
            }
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            In Progress
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {
              tasks.filter(
                (t) =>
                  !t.completedAt && (!t.assignees || t.assignees.length === 0)
              ).length
            }
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">To Do</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
          How to use:
        </h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Click on a task to edit it</li>
          <li>Drag and drop tasks to change their due dates</li>
          <li>
            Use keyboard shortcuts: M (Month), W (Week), D (Day), A (Agenda)
          </li>
          <li>Click "Today" to return to current date</li>
          <li>Click "+ Add Task" to create a new task</li>
        </ul>
      </div>
    </div>
  );
};

export default CalendarView;
