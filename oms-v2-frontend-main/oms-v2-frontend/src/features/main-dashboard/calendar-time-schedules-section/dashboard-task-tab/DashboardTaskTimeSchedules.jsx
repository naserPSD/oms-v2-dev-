"use client";

import React, { useState, useMemo } from "react";

import TaskTimeScheduleSkeleton from "./TaskTimeScheduleSkeleton";
import DashboardTaskDetailsModal from "./DashboardTaskDetailsModal";
import DashboardTaskItem from "./DashboardTaskItem";
import DashboardMeetingItem from "./DashboardMeetingItem";
import DashboardMeetingDetailsModal from "./DashboardMeetingDetailsModal";
import { useMeetingQueryApi } from "@/hooks/queryApi/useMeetingQueryApi";
import Pagination from "@/components/common/Pagination";

const DashboardTaskTimeSchedules = ({ dataArray, isLoading }) => {
  const [activeTab, setActiveTab] = useState("Tasks");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  // Task pagination (5 per page)
  const [taskPage, setTaskPage] = useState(1);
  const tasksPerPage = 5;
  const paginatedTasks = useMemo(() => {
    if (!dataArray || dataArray.length === 0) return [];
    const start = (taskPage - 1) * tasksPerPage;
    return dataArray.slice(start, start + tasksPerPage);
  }, [dataArray, taskPage]);

  // Meeting query with pagination (5 per page)
  const [meetingPage, setMeetingPage] = useState(1);
  const { useMeetingsQuery } = useMeetingQueryApi();
  const { data: meetingsResponse, isLoading: isMeetingsLoading } =
    useMeetingsQuery({
      tab: "upcoming",
      page: meetingPage,
      limit: 10,
    });

  const meetingsList = meetingsResponse?.data || [];
  const pagination = meetingsResponse?.pagination || {
    page: 1,
    limit: 10,
    total: meetingsList.length,
    totalPages: Math.max(1, Math.ceil((meetingsList.length || 0) / 10)),
  };

  const tabs = [
    { key: "Tasks", label: "Tasks" },
    // { key: "Milestone", label: "Milestone" },
    { key: "Meetings", label: "Meetings" },
  ];

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleMeetingClick = (meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingModal(true);
  };

  const handleCloseMeetingModal = () => {
    setShowMeetingModal(false);
    setSelectedMeeting(null);
  };

  if (isLoading) {
    return (
      <div className="col-span-1 lg:col-span-8">
        <div className="flex sm:flex-row sm:items-center sm:justify-between flex-col gap-6 p-1">
          <p className="text-gray-700 dark:text-theme-light-text whitespace-nowrap">
            Timeline & Schedules
          </p>
          <hr className="w-full hidden sm:flex" />
        </div>
        <TaskTimeScheduleSkeleton />
      </div>
    );
  }

  return (
    <div className="col-span-1 lg:col-span-8">
      <div className="flex sm:flex-row sm:items-center sm:justify-between flex-col gap-6 p-1">
        <p className="text-gray-700 dark:text-theme-light-text whitespace-nowrap">
          Timeline & Schedules
        </p>
        <hr className="w-full hidden sm:flex" />
      </div>

      {/* content */}
      <div className="border dark:bg-theme-dark bg-theme-light dark:text-theme-light-text text-theme-dark-text rounded-lg shadow py-2.5 min-h-[720px] flex flex-col justify-between">
        <div>
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4 mt-1 px-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {tab.label}
                {tab.key === "Tasks" && dataArray?.length > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                    {dataArray.length}
                  </span>
                )}
                {tab.key === "Meetings" && pagination?.total > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                    {pagination.total}
                  </span>
                )}
              </button>
            ))}
            {/* <Link
              href="/hr-dashboard/meeting"
              title="Go to Meetings"
              className="size-6 bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 ml-auto sm:ml-0"
            >
              <HiDotsHorizontal className="text-gray-500 dark:text-gray-400 text-base" />
            </Link> */}
          </div>

          {/* Tab Content */}
          <div className="px-2">
            {activeTab === "Tasks" && (
              <div className="space-y-3">
                {paginatedTasks && paginatedTasks.length > 0 ? (
                  paginatedTasks.map((task, index) => (
                    <DashboardTaskItem
                      key={task.id || index}
                      task={task}
                      index={index}
                      onClick={handleTaskClick}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500 mb-2">
                      No tasks scheduled
                    </div>
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      Add new tasks to see them here
                    </div>
                  </div>
                )}

                {/* Tasks Pagination (if > 10) */}
                {dataArray && dataArray.length > tasksPerPage && (
                  <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Pagination
                      currentPage={taskPage}
                      totalItems={dataArray.length}
                      itemsPerPage={tasksPerPage}
                      onPageChange={(page) => setTaskPage(page)}
                      showItemsPerPage={false}
                      showResultInfo={true}
                      size="sm"
                      background={false}
                      className="my-1 justify-center sm:justify-between flex-wrap gap-2"
                    />
                  </div>
                )}
              </div>
            )}

            {/* {activeTab === "Milestone" && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  No milestones scheduled
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-500">
                  Create milestones to track project progress
                </div>
              </div>
            )} */}

            {activeTab === "Meetings" && (
              <div className="space-y-3">
                {isMeetingsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className="animate-pulse bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-24"
                      />
                    ))}
                  </div>
                ) : meetingsList && meetingsList.length > 0 ? (
                  <>
                    {meetingsList.map((meeting, index) => (
                      <DashboardMeetingItem
                        key={meeting.id || index}
                        meeting={meeting}
                        onClick={handleMeetingClick}
                      />
                    ))}

                    {/* Meetings Pagination (5 per page) */}
                    {pagination.total > 5 && (
                      <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <Pagination
                          currentPage={meetingPage}
                          totalItems={pagination.total}
                          itemsPerPage={10}
                          onPageChange={(page) => setMeetingPage(page)}
                          showItemsPerPage={false}
                          showResultInfo={true}
                          size="sm"
                          background={false}
                          className="my-1 justify-center sm:justify-between flex-wrap gap-2"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500 mb-2">
                      No meetings scheduled
                    </div>
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      Schedule meetings with your team
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      <DashboardTaskDetailsModal
        showModal={showTaskModal}
        handleClose={handleCloseModal}
        taskData={selectedTask}
      />

      {/* Meeting Details Modal */}
      <DashboardMeetingDetailsModal
        showModal={showMeetingModal}
        handleClose={handleCloseMeetingModal}
        meetingData={selectedMeeting}
      />
    </div>
  );
};

export default DashboardTaskTimeSchedules;
