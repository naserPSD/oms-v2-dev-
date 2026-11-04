"use client";

import React from "react";

const TaskTimeScheduleSkeleton = () => {
  return (
    <div className="border dark:bg-theme-dark bg-theme-light dark:text-theme-light-text text-theme-dark-text rounded-lg shadow py-4 min-h-[720px] animate-pulse">
      <div className="mt-6 px-2">
        {/* Tabs Skeleton */}
        <div className="flex items-center gap-2 mb-4 mt-1">
          <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="size-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>

        {/* Task Items Skeleton */}
        <div className="space-y-2 px-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskTimeScheduleSkeleton;
