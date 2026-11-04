"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, MailCheck } from "lucide-react";
import {
  deriveMeetingStatus,
  formatMeetingTimeShort,
  isMeetingExpired,
} from "../data/mockMeetings";

function greetingForHour(h) {
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function TodayAgendaPanel({
  firstName = "there",
  avatarUrl,
  meetings = [],
  canReschedule,
  canSendInvite = false,
  canEndMeeting = false,
  onReschedule,
  onChangeAttendance,
  onSendInvite,
  onEndMeeting,
  sendingInviteId = null,
}) {
  const greeting = greetingForHour(new Date().getHours());

  return (
    <div className="admin-card p-5 sm:p-6 h-full flex flex-col">
      <h2 className="text-2xl sm:text-[1.75rem] font-bold admin-text tracking-tight">
        {greeting}, {firstName}!
      </h2>

      <div className="flex justify-center my-5 sm:my-6">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-primaryColor/15 bg-primaryColor/10">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={firstName}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primaryColor dark:text-primaryColor-400">
              {(firstName || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <p className="text-sm font-semibold admin-text mb-3">Your agenda today:</p>

      {meetings.length === 0 ? (
        <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-gray-200 dark:border-gray-700 px-4 py-8">
          <p className="text-sm admin-text-muted text-center">
            No meetings scheduled for today.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {meetings.map((m) => {
            if (!m) return null;
            const status = deriveMeetingStatus(m);
            const sending = String(sendingInviteId) === String(m.id);
            const isInvited = m.listStatus === "INVITED";
            const isExpired = isMeetingExpired(m);
            const meetingTitle = m?.title || "Meeting";
            return (
              <li
                key={m.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 rounded-lg border border-gray-100 dark:border-gray-800 px-4 py-3 hover:border-primaryColor/25 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/hr-dashboard/meeting/${m.id}`}
                    className="text-sm font-semibold admin-text hover:text-primaryColor dark:hover:text-primaryColor-400 truncate block"
                  >
                    {meetingTitle}
                    {status === "live" && (
                      <span className="ml-2 inline-flex align-middle text-[10px] font-bold uppercase tracking-wide text-secondaryColor">
                        Live
                      </span>
                    )}
                  </Link>
                  {m.attendees && m.attendees.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] font-semibold">
                      <span
                        className="text-secondaryColor bg-secondaryColor/10 px-1.5 py-0.5 rounded"
                        title="Present"
                      >
                        P: {m.attendees.filter((a) => a.attendance === "present").length}
                      </span>
                      <span
                        className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded"
                        title="Late"
                      >
                        L: {m.attendees.filter((a) => a.attendance === "late").length}
                      </span>
                      <span
                        className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded"
                        title="Absent"
                      >
                        A: {m.attendees.filter((a) => a.attendance === "absent").length}
                      </span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 text-xs sm:text-sm font-medium admin-text-muted tabular-nums whitespace-nowrap px-1">
                  {formatMeetingTimeShort(m.startAt, m.endAt)}
                </div>

                <div className="flex items-center justify-start sm:justify-end gap-2 flex-wrap shrink-0 w-full sm:w-auto">
                  {status === "live" ? (
                    <>
                      <Link
                        href={`/hr-dashboard/meeting/${m.id}/live`}
                        className="meeting-join-blink inline-flex h-8 items-center justify-center px-3 rounded-md bg-secondaryColor hover:bg-secondaryColor-600 text-white text-xs font-semibold whitespace-nowrap"
                      >
                        Join meeting
                      </Link>
                      {canEndMeeting && (
                        <button
                          type="button"
                          onClick={() => onEndMeeting?.(m)}
                          className="inline-flex h-8 items-center justify-center px-3 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold whitespace-nowrap"
                        >
                          End meeting
                        </button>
                      )}
                    </>
                  ) : canReschedule?.(m) !== false ? (
                    <button
                      type="button"
                      onClick={() => onReschedule?.(m)}
                      className="inline-flex h-8 items-center justify-center px-3 rounded-md bg-primaryColor hover:bg-primaryColor-700 text-white text-xs font-semibold whitespace-nowrap"
                    >
                      Reschedule
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onChangeAttendance?.(m)}
                    className="inline-flex h-8 items-center justify-center px-3 rounded-md border border-primaryColor text-primaryColor dark:text-primaryColor-400 dark:border-primaryColor-400 text-xs font-semibold whitespace-nowrap hover:bg-primaryColor/5 dark:hover:bg-primaryColor/10"
                  >
                    Change attendance
                  </button>
                  {canSendInvite && !isExpired ? (
                    <button
                      type="button"
                      title={
                        isInvited
                          ? "Invitation sent (Click to resend)"
                          : "Send email invitation"
                      }
                      disabled={sending}
                      onClick={() => onSendInvite?.(m)}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
                        isInvited
                          ? "border-secondaryColor text-secondaryColor bg-secondaryColor/10 hover:bg-secondaryColor/20"
                          : "border-secondaryColor/40 text-secondaryColor hover:bg-secondaryColor/10"
                      } disabled:opacity-50`}
                    >
                      {isInvited ? (
                        <MailCheck size={15} strokeWidth={2.25} />
                      ) : (
                        <Mail size={15} strokeWidth={2.25} />
                      )}
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
