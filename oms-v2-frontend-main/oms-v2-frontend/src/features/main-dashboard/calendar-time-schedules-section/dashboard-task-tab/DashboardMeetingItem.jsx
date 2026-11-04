"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Users,
  Video,
  MapPin,
  ChevronRight,
  ExternalLink,
  Repeat,
} from "lucide-react";
import SimpleTooltip from "@/components/ui/SimpleTooltip";

const formatTime12 = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatMeetingDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "";
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  const isTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate();

  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";

  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const getRelativeDaysText = (startAt) => {
  if (!startAt) return null;
  const now = new Date();
  const start = new Date(startAt);
  const diffTime = start.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    const diffHours = Math.round(diffTime / (1000 * 60 * 60));
    if (diffHours <= 0) return "Starting soon";
    return `In ${diffHours}h`;
  }
  if (diffDays === 1) return "Tomorrow";
  return `In ${diffDays}d`;
};

const DashboardMeetingItem = ({ meeting, onClick }) => {
  if (!meeting) return null;

  const isLive = meeting.status === "live";
  const dateText = formatMeetingDate(meeting.startAt);
  const startTime = formatTime12(meeting.startAt);
  const endTime = formatTime12(meeting.endAt);
  const timeRange = startTime
    ? endTime
      ? `${startTime} - ${endTime}`
      : startTime
    : "";
  const relativeText = getRelativeDaysText(meeting.startAt);

  const attendees = meeting.attendees || [];
  const attendeeCount = attendees.length;
  const attendeeNames =
    attendeeCount > 0
      ? attendees
          .slice(0, 5)
          .map((a) => a.name || a.email || "Attendee")
          .join(", ") + (attendeeCount > 5 ? ` +${attendeeCount - 5} more` : "")
      : "No attendees";

  const isOnline =
    meeting.meetingType?.toLowerCase().includes("online") ||
    Boolean(meeting.meetUrl);

  return (
    <div
      onClick={() => onClick?.(meeting)}
      className="w-full text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 group cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header: Title and Status */}
          <div className="flex items-start justify-between mb-2.5 gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 break-words">
                  {meeting.title || "Untitled Meeting"}
                </h4>
                {meeting.isRepeat && (
                  <SimpleTooltip text="Recurring meeting">
                    <span className="inline-flex items-center text-gray-400 dark:text-gray-500">
                      <Repeat className="h-3 w-3" />
                    </span>
                  </SimpleTooltip>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 ring-1 ring-rose-300 dark:ring-rose-800">
                  <span className="size-1.5 rounded-full bg-rose-600 dark:bg-rose-400 animate-ping" />
                  Live
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Upcoming
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 mt-0.5" />
            </div>
          </div>

          {/* Time & Date bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300 mb-3">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              <span>{dateText}</span>
              {relativeText && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-normal">
                  {relativeText}
                </span>
              )}
            </div>

            {timeRange && (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3 shrink-0" />
                <span>{timeRange}</span>
              </div>
            )}
          </div>

          {/* Meta Info Footer: Host, Attendees, Location, Join Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Host */}
              {meeting.host?.name && (
                <span className="text-gray-600 dark:text-gray-400 text-[11px]">
                  Host:{" "}
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {meeting.host.name}
                  </span>
                </span>
              )}

              {/* Attendees count */}
              {attendeeCount > 0 && (
                <SimpleTooltip text={`Attendees: ${attendeeNames}`}>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Users className="h-3 w-3" />
                    <span>{attendeeCount}</span>
                  </div>
                </SimpleTooltip>
              )}

              {/* Meeting Type */}
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[11px]">
                {isOnline ? (
                  <>
                    <Video className="h-3 w-3 text-emerald-500" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-3 w-3 text-amber-500" />
                    <span className="truncate max-w-[100px]">
                      {meeting.roomName || meeting.address || "In Person"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Action: Join Meet */}
            {meeting.meetUrl && (
              <a
                href={meeting.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
              >
                <Video className="h-3 w-3" />
                <span>Join</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMeetingItem;
