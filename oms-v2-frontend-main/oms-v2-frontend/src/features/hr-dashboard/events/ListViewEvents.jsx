import Pagination from "@/components/common/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

const ListViewEvents = ({
  listViewEvents,
  handleViewDetails,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  eventsData,
  setItemsPerPage,
  events,
}) => {
  return (
    <div>
      {" "}
      <Card className="bg-theme-light dark:bg-theme-dark border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          {listViewEvents.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-2">
                No events found
              </div>
              <div className="text-sm text-gray-400 dark:text-gray-500">
                There are no events scheduled at the moment.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {listViewEvents
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((event, index) => (
                  <div
                    key={event.id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleViewDetails(event)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-center min-w-16">
                        <div className="text-sm font-bold dark-title-color">
                          {event.date}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium dark-title-color truncate">
                          {event.event}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span>{event.time}</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{event.type}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs capitalize badge badge-pill badge-outline-${
                        event.colorClass || "secondary"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={
                eventsData?.pagination?.total || listViewEvents.length
              }
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>

          {listViewEvents.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Showing {listViewEvents.length} of {events.length} events
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ListViewEvents;
