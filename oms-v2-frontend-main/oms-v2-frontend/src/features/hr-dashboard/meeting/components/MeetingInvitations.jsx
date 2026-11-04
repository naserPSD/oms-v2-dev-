"use client";

import Link from "next/link";
import { Check, Calendar, Clock } from "lucide-react";
import { formatMeetingDate, formatMeetingTime } from "../data/mockMeetings";

export default function MeetingInvitations({
  invitations = [],
  isLoading = false,
  onAccept,
}) {
  return (
    <div className="admin-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold admin-text">Invitations</h3>
        {invitations.length > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-secondaryColor/15 text-secondaryColor text-xs font-bold px-2 py-0.5">
            {invitations.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4 animate-pulse">
          <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
        </div>
      ) : invitations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <p className="text-sm admin-text-muted text-center">
            No pending invitations.
          </p>
          <p className="text-xs admin-text-subtle text-center mt-1">
            When meeting organizers send you an invitation, it will appear here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[280px] pr-1">
          {invitations.map((inv) => {
            if (!inv) return null;
            const isAccepted = inv.inviteStatus === "accepted";
            const isTimeOver =
              inv.startAt && new Date(inv.startAt).getTime() < Date.now();
            const meetingTitle = inv.meetingTitle || inv.title || "Meeting";
            const fromName = inv.fromName || "Host";

            return (
              <li
                key={inv.id || inv.meetingId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primaryColor/25 transition-colors bg-gray-50/50 dark:bg-gray-800/30"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primaryColor/15 dark:bg-primaryColor/25 flex items-center justify-center text-xs font-bold text-primaryColor dark:text-primaryColor-400 shrink-0">
                    {fromName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs admin-text leading-snug">
                      <span className="font-semibold">{fromName}</span>
                      <span className="admin-text-muted"> invited you to </span>
                      <Link
                        href={`/hr-dashboard/meeting/${inv.meetingId}`}
                        className="font-semibold text-primaryColor dark:text-primaryColor-400 hover:underline"
                      >
                        {meetingTitle}
                      </Link>
                    </p>
                    {inv.startAt && (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatMeetingDate(inv.startAt)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatMeetingTime(inv.startAt, inv.endAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isAccepted ? (
                  <span className="sm:shrink-0 w-full sm:w-auto text-center inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-secondaryColor/10 text-secondaryColor text-xs font-semibold">
                    <Check size={12} />
                    Accepted
                  </span>
                ) : isTimeOver ? (
                  <span
                    className="sm:shrink-0 w-full sm:w-auto text-center inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium border border-gray-200 dark:border-gray-700"
                    title="Meeting time has passed. This invitation can no longer be accepted and remains pending."
                  >
                    Pending (Time Over)
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onAccept?.(inv)}
                    className="sm:shrink-0 w-full sm:w-auto h-8 min-w-[5rem] px-3 rounded-lg bg-primaryColor hover:bg-primaryColor-700 text-white text-xs font-semibold transition-colors"
                  >
                    Accept
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
