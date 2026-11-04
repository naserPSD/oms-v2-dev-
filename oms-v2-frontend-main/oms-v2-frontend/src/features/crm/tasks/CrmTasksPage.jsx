"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useCrmTasks } from "./useCrmTasks";
import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import { Card, CardContent } from "@/components/ui/card";
import Pagination from "@/components/common/Pagination";
import {
  CheckSquare,
  Clock,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  User,
  Search,
  CheckCircle2,
  ListTodo,
} from "lucide-react";

export default function CrmTasksPage() {
  const { taskList, addTask, toggleTask, deleteTask } = useCrmTasks();

  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "previous" | "all"
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    contact: "",
    date: "",
    priority: "Normal",
  });
  const [taskError, setTaskError] = useState("");

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, priorityFilter, searchQuery]);

  const pendingCount = useMemo(
    () => taskList.filter((t) => !t.completed).length,
    [taskList]
  );
  const completedCount = useMemo(
    () => taskList.filter((t) => t.completed).length,
    [taskList]
  );

  const filteredTasks = useMemo(() => {
    return taskList.filter((task) => {
      // Tab filter
      if (activeTab === "upcoming" && task.completed) return false;
      if (activeTab === "previous" && !task.completed) return false;

      // Priority filter
      if (priorityFilter !== "all" && task.priority !== priorityFilter)
        return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = (task.title || "").toLowerCase().includes(query);
        const matchContact = (task.contact || "").toLowerCase().includes(query);
        if (!matchTitle && !matchContact) return false;
      }

      return true;
    });
  }, [taskList, activeTab, priorityFilter, searchQuery]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTasks.length);

  const paginatedTasks = useMemo(() => {
    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, startIndex, endIndex]);

  const handleOpenTaskModal = () => {
    setTaskForm({
      title: "",
      contact: "",
      date: "Today, 5:00 PM",
      priority: "Normal",
    });
    setTaskError("");
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setTaskError("");
  };

  const handleSaveTask = () => {
    if (!taskForm.title.trim()) {
      setTaskError("Please enter a task title");
      return;
    }

    addTask({
      title: taskForm.title.trim(),
      contact: taskForm.contact.trim() || "General",
      date: taskForm.date.trim() || "Today",
      priority: taskForm.priority,
    });

    setActiveTab("upcoming");
    handleCloseTaskModal();
  };

  return (
    <div className="py-4 space-y-5 max-w-6xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Link
              href="/crm"
              className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to CRM Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Tasks
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <ListTodo className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            CRM Tasks & Follow-ups
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage pending follow-ups, client meetings, and review past completed activities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ButtonTw
            onClick={handleOpenTaskModal}
            variant="blue"
            size="sm"
            className="flex items-center gap-1.5 text-xs px-3.5 py-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add New Task
          </ButtonTw>
        </div>
      </div>

      {/* KPI Stats Overview - HR Module Styled Cards with border-l-4 accent */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Upcoming Pending Card */}
        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md border-l-4 border-l-blue-500 bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 rounded-xl shadow-xs">
          <CardContent className="p-4 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Upcoming Pending
              </span>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {pendingCount}
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/50">
                Action Required
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
              <span>Requires follow-up action</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Pending</span>
            </div>
          </CardContent>
        </Card>

        {/* Previous Completed Card */}
        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md border-l-4 border-l-emerald-500 bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 rounded-xl shadow-xs">
          <CardContent className="p-4 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Previous Completed
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {completedCount}
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50">
                Completed
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
              <span>Tasks successfully done</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Archived</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Records Card */}
        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md border-l-4 border-l-purple-500 bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 rounded-xl shadow-xs">
          <CardContent className="p-4 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Total Records
              </span>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
                {taskList.length}
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/50">
                All Records
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
              <span>Overall logged tasks & reminders</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">Total</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Task Section */}
      <Card className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Controls: Tabs & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            {/* View Tabs */}
            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs self-start">
              <button
                type="button"
                onClick={() => setActiveTab("upcoming")}
                className={`py-1.5 px-3 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "upcoming"
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <span>Upcoming</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                    activeTab === "upcoming"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {pendingCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("previous")}
                className={`py-1.5 px-3 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "previous"
                    ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <span>Previous</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                    activeTab === "previous"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {completedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`py-1.5 px-3 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "all"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <span>All</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  {taskList.length}
                </span>
              </button>
            </div>

            {/* Search & Priority Filter */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search task or contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Normal">Normal Priority</option>
              </select>
            </div>
          </div>

          {/* Task List Items - Styled in HR Card Style with Left Accent Border */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-xs">
                {activeTab === "upcoming" ? (
                  <>
                    <CheckSquare className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      No upcoming tasks found
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      All your upcoming tasks are completed or click "+ Add New Task" to create one.
                    </p>
                  </>
                ) : activeTab === "previous" ? (
                  <>
                    <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      No previous completed tasks
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Completed tasks will be saved and archived here.
                    </p>
                  </>
                ) : (
                  <>
                    <ListTodo className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      No tasks found matching your filter
                    </p>
                  </>
                )}
              </div>
            ) : (
              paginatedTasks.map((task) => {
                const borderAccent = task.completed
                  ? "border-l-4 border-l-emerald-500 bg-gray-50/70 dark:bg-gray-800/40 opacity-80"
                  : task.priority === "High"
                  ? "border-l-4 border-l-rose-500 bg-white dark:bg-gray-800/90 hover:shadow-md hover:border-gray-300"
                  : task.priority === "Medium"
                  ? "border-l-4 border-l-amber-500 bg-white dark:bg-gray-800/90 hover:shadow-md hover:border-gray-300"
                  : "border-l-4 border-l-blue-500 bg-white dark:bg-gray-800/90 hover:shadow-md hover:border-gray-300";

                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`group p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/80 text-xs cursor-pointer transition-all duration-200 flex items-start gap-3.5 shadow-2xs ${borderAccent}`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="mt-0.5 size-4 rounded text-blue-600 focus:ring-0 cursor-pointer pointer-events-none"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-semibold ${
                            task.completed
                              ? "line-through text-gray-400 dark:text-gray-500"
                              : "text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          {task.title}
                        </p>

                        <div className="flex items-center gap-2">
                          {task.priority && (
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                task.priority === "High"
                                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50"
                                  : task.priority === "Medium"
                                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50"
                                  : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50"
                              }`}
                            >
                              {task.priority}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 transition-opacity p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 mt-2.5 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {task.date}
                        </span>
                        {task.contact && (
                          <span className="flex items-center gap-1.5 font-medium">
                            <div className="size-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-[9px] font-bold flex items-center justify-center">
                              {task.contact.slice(0, 1).toUpperCase()}
                            </div>
                            {task.contact}
                          </span>
                        )}
                        <span
                          className={`text-[11px] font-semibold ml-auto flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${
                            task.completed
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              task.completed ? "bg-emerald-500" : "bg-blue-500"
                            }`}
                          ></span>
                          {task.completed ? "Completed" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* HR Module Standard Pagination */}
          {filteredTasks.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={filteredTasks.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newLimit) => {
                setItemsPerPage(newLimit);
                setCurrentPage(1);
              }}
              background={false}
              circular={true}
              variant="primary"
              size="sm"
              className="!my-0 !pt-3 !border-t !border-gray-100 dark:!border-gray-800"
            />
          )}
        </CardContent>
      </Card>

      {/* Task Creation Modal */}
      {isTaskModalOpen && (
        <ModalTw
          show={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          title="Add New Task"
          showFooter={false}
          size="md"
        >
          <div className="space-y-4 py-2">
            {taskError && (
              <div className="p-2.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900/40 font-medium">
                {taskError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) => {
                  setTaskForm({ ...taskForm, title: e.target.value });
                  if (taskError) setTaskError("");
                }}
                placeholder="e.g. Follow-up call with prospective client"
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={taskForm.contact}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, contact: e.target.value })
                  }
                  placeholder="e.g. Tanvir Hasan"
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Due Date & Time
                </label>
                <input
                  type="text"
                  value={taskForm.date}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, date: e.target.value })
                  }
                  placeholder="e.g. Today, 5:00 PM"
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="Normal">Normal</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <ButtonTw
                onClick={handleCloseTaskModal}
                variant="outline"
                size="sm"
                className="text-xs cursor-pointer"
              >
                Cancel
              </ButtonTw>
              <ButtonTw
                onClick={handleSaveTask}
                variant="blue"
                size="sm"
                className="text-xs cursor-pointer"
              >
                Save Task
              </ButtonTw>
            </div>
          </div>
        </ModalTw>
      )}
    </div>
  );
}
