"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useMyProfileQueryApi } from "@/hooks/queryApi/useMyProfileQueryApi";
import Pagination from "@/components/common/Pagination";
import helpers from "@/utils/helpers";
import { useMemo, useState } from "react";
import { ModalTw } from "@/components/common/ModalTw";

export function EmployeeRecentActivities({ id }) {
  const { useFetchEmployeeRecentActivitiesQuery } = useMyProfileQueryApi({});
  const initialLimit = helpers.perPageListItems();
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const queryParams = useMemo(
    () => ({ page: currentPage, limit: itemsPerPage }),
    [currentPage, itemsPerPage],
  );

  const { data: responseData, isLoading } =
    useFetchEmployeeRecentActivitiesQuery(id, queryParams);

   
    

  const listData = responseData?.data || [];

  const activities = listData.map((item, idx) => {
    let details = {};

    try {
      details =
        typeof item.details === "string"
          ? JSON.parse(item.details)
          : item.details;
    } catch {
      details = {};
    }

    const changedFields = [];

    if (item.action === "UPDATE") {
      // UPDATE logic
      if (details?.before && details?.after) {
        // Normal case: both exist → compare and show differences
        for (const key in details.after) {
          if (details.before[key] !== details.after[key]) {
            changedFields.push({
              field: key,
              before: details.before[key],
              after: details.after[key],
            });
          }
        }
      } else if (details?.after) {
        // Only 'after' exists → treat as new value
        for (const key in details.after) {
          changedFields.push({
            field: key,
            before: null,
            after: details.after[key],
          });
        }
      } else if (details?.before) {
        // Only 'before' exists → treat as deleted value
        for (const key in details.before) {
          changedFields.push({
            field: key,
            before: details.before[key],
            after: null,
          });
        }
      }
    } else if (item.action === "INSERT" && details?.after) {
      // INSERT → show new fields
      for (const key in details.after) {
        changedFields.push({
          field: key,
          before: null,
          after: details.after[key],
        });
      }
    } else if (item.action === "DELETE" && details?.before) {
      // DELETE → show old fields
      for (const key in details.before) {
        changedFields.push({
          field: key,
          before: details.before[key],
          after: null,
        });
      }
    }

    const action =
      item.message || item.action || item.event || item.activity || "Action";
    const timeRaw =
      item.createdAt || item.time || item.date || item.timestamp || "";
    const time = timeRaw ? helpers.dDateTime(timeRaw) : "";

    // helper for icon check
    const textIncludes = (text, keywords) =>
      keywords.some((kw) => text.toLowerCase().includes(kw));

    // Icon based on action
    let icon = "🕒"; // default
    if (textIncludes(action, ["leave"])) icon = "📝";
    else if (textIncludes(action, ["review", "performance"])) icon = "⭐";
    else if (textIncludes(action, ["check", "in"])) icon = "✅";
    else if (item.action === "DELETE") icon = "❌";
    else if (item.action === "INSERT") icon = "🟢";

    const sl = (currentPage - 1) * itemsPerPage + idx + 1;

    return {
      id: item.id || item._id,
      action,
      time,
      icon,
      sl,
      changedFields,
      rawDetails: details,
    };
  });

  const openDetails = (activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedActivity(null);
  };

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="px-6 py-5">
          <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
            📋 Recent Activities Of Employee
          </h2>

          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  Loading Activities...
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  No Activities Found.
                </div>
              ) : (
                activities.map((activity, index) => (
                  <div key={activity.id || index} className="flex gap-4">
                    <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                      {activity.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </div>

                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 wrap-break-word">
                        {activity.action}
                      </div>

                      {activity?.changedFields?.length > 0 && (
                        <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                          <div className="font-semibold flex items-center gap-2">
                            Changed Data
                          </div>
                          <ul className="ml-4 list-disc space-y-1 mt-1">
                            {activity?.changedFields
                              ?.slice(0, 4)
                              .map((field, idx) => (
                                <li key={idx} className="wrap-break-word">
                                  <span className="font-medium">
                                    {field.field}:{" "}
                                  </span>
                                  <span className="text-red-500">
                                    {typeof field.before === "object" &&
                                    field.before !== null
                                      ? JSON.stringify(field.before)
                                      : String(field.before ?? "-")}
                                  </span>
                                  {" → "}
                                  <span className="text-green-500">
                                    {typeof field.after === "object" &&
                                    field.after !== null
                                      ? JSON.stringify(field.after)
                                      : String(field.after ?? "-")}
                                  </span>
                                </li>
                              ))}
                          </ul>

                          {/* Single button to show modal with full details */}
                          <div className="mt-1">
                            <button
                              onClick={() => openDetails(activity)}
                              className="text-green-600 dark:text-green-400 hover:underline font-medium cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4">
            {responseData?.pagination && (
              <Pagination
                currentPage={responseData.pagination.page || currentPage}
                totalItems={
                  responseData.pagination.total ||
                  responseData.pagination.totalElements ||
                  0
                }
                itemsPerPage={responseData.pagination.limit || itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
                onItemsPerPageChange={(l) => {
                  setItemsPerPage(l);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <ModalTw
        show={showModal}
        onClose={closeModal}
        title="Activity Details"
        size="2xl"
        showFooter={false}
      >
        <div className="p-4 space-y-3 max-h-[60vh] overflow-auto">
          {selectedActivity?.changedFields?.map((field, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 dark:border-gray-700 p-3"
            >
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {field.field}
              </div>
              <div className="text-xs mt-1">
                <span className="text-red-500 wrap-break-word">
                  {typeof field.before === "object" && field.before !== null
                    ? JSON.stringify(field.before)
                    : String(field.before ?? "-")}
                </span>
                <span className="mx-2 text-gray-400">→</span>
                <span className="text-green-500 wrap-break-word">
                  {typeof field.after === "object" && field.after !== null
                    ? JSON.stringify(field.after)
                    : String(field.after ?? "-")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ModalTw>
    </>
  );
}
