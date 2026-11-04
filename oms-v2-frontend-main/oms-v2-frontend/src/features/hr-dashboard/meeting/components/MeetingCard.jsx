"use client";

import Link from "next/link";
import { Calendar, Clock, User, Video } from "lucide-react";
import MeetingStatusBadge from "./MeetingStatusBadge";
import {
  deriveMeetingStatus,
  formatMeetingDate,
  formatMeetingTime,
} from "../data/mockMeetings";

export default function MeetingCard({ meeting }) {
  if (!meeting) return null;
  const status = deriveMeetingStatus(meeting);

  return (
    <Link
      href={`/hr-dashboard/meeting/${meeting.id}`}
      className="block admin-card p-4 hover:border-primaryColor/40 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold admin-text truncate group-hover:text-primaryColor dark:group-hover:text-primaryColor-400">
            {meeting?.title || "Meeting"}
          </h3>
          <p className="mt-1 text-xs admin-text-muted flex items-center gap-1.5">
            <Calendar size={12} className="text-primaryColor dark:text-primaryColor-400 shrink-0" />
            {formatMeetingDate(meeting.startAt)}
          </p>
          <p className="mt-0.5 text-xs admin-text-muted flex items-center gap-1.5">
            <Clock size={12} className="text-primaryColor dark:text-primaryColor-400 shrink-0" />
            {formatMeetingTime(meeting.startAt, meeting.endAt)}
          </p>
        </div>
        <MeetingStatusBadge status={status} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primaryColor/15 dark:bg-primaryColor/25 flex items-center justify-center shrink-0">
            <User size={14} className="text-primaryColor dark:text-primaryColor-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium admin-text truncate">
              {meeting.host?.name}
            </p>
            <p className="text-[10px] admin-text-subtle truncate">
              Host · {meeting.host?.role}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primaryColor dark:text-primaryColor-400">
          <Video size={12} />
          {status === "ended" ? "Summary" : "Open"}
        </span>
      </div>
    </Link>
  );
}
