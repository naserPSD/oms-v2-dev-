"use client";

import { CalendarCheck, CirclePlus, Video, ArrowUpRight } from "lucide-react";

const ACTIONS = [
  {
    key: "start",
    label: "Start a meeting",
    hint: "Host — open Meet & live workspace",
    icon: Video,
    needsStart: true,
  },
  {
    key: "join",
    label: "Join a meeting",
    hint: "Enter with Meet link or from your list",
    icon: CirclePlus,
  },
  {
    key: "schedule",
    label: "Schedule New Meeting",
    hint: "Create meeting & generate Meet link",
    icon: CalendarCheck,
    needsSchedule: true,
  },
];

export default function MeetingQuickActions({
  onAction,
  canSchedule = false,
  canStart = false,
  canJoin = true,
  hasActiveMeeting = false,
  blinkJoin = false,
  liveTitle = "",
}) {
  const visible = ACTIONS.filter((a) => {
    // Show start and join only 10 minutes before meeting starts or while live
    if (a.key === "start") return canStart && hasActiveMeeting;
    if (a.key === "join") return canJoin && hasActiveMeeting;
    if (a.needsSchedule) return canSchedule;
    return true;
  });

  return (
    <div className="admin-card p-5 sm:p-6 h-full flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold admin-text">
            Quick Actions
          </h2>
          <p className="text-xs admin-text-muted mt-0.5">
            Manage and host meetings
          </p>
        </div>
        {hasActiveMeeting && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondaryColor/15 text-secondaryColor">
            <span className="w-1.5 h-1.5 rounded-full bg-secondaryColor animate-ping"></span>
            Live
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5 my-auto">
        {visible.map(({ key, label, hint, icon: Icon }) => {
          const isJoinBlink = key === "join" && blinkJoin;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onAction?.(key)}
              className={[
                "w-full px-4 py-3 flex items-center justify-between gap-3 text-left rounded-xl border transition-all duration-150 group",
                isJoinBlink
                  ? "meeting-join-blink bg-secondaryColor/10 border-secondaryColor/40 hover:bg-secondaryColor/15"
                  : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-primaryColor/50 hover:bg-primaryColor/5 dark:hover:bg-primaryColor/10",
              ].join(" ")}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={[
                    "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105",
                    isJoinBlink
                      ? "bg-secondaryColor/20 text-secondaryColor"
                      : "bg-primaryColor/10 text-primaryColor dark:bg-primaryColor-400 dark:text-gray-900",
                  ].join(" ")}
                >
                  <Icon size={18} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex flex-col">
                  <span
                    className={[
                      "text-sm font-semibold leading-snug",
                      isJoinBlink
                        ? "text-secondaryColor"
                        : "admin-text group-hover:text-primaryColor dark:group-hover:text-primaryColor-400 transition-colors",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                  <span className="text-[11px] admin-text-muted truncate">
                    {isJoinBlink && liveTitle ? `Now: ${liveTitle}` : hint}
                  </span>
                </div>
              </div>
              <ArrowUpRight
                size={16}
                className="shrink-0 text-gray-400 group-hover:text-primaryColor group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </button>
          );
        })}
      </div>

      {!hasActiveMeeting && (
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/80 px-3 py-2 text-[11px] admin-text-muted flex items-center gap-2">
          <Video size={14} className="text-primaryColor/70 shrink-0" />
          <span>
            Start &amp; Join buttons will appear 10 mins before your scheduled meeting.
          </span>
        </div>
      )}
    </div>
  );
}
