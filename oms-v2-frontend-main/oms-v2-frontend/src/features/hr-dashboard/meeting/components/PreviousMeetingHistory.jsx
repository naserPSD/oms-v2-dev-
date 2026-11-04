"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  StickyNote,
  Users,
  FileText,
  ExternalLink,
} from "lucide-react";
import MeetingStatusBadge from "./MeetingStatusBadge";
import {
  formatMeetingDate,
  formatMeetingTime,
  getPastMeetings,
  notesStorageKey,
  summarizeAttendance,
  summarizeInvites,
} from "../data/mockMeetings";
import { meetingBtnOutline, meetingBtnSolid, pc } from "../meetingTheme";
import useMeetingAccess from "../hooks/useMeetingAccess";

const PAGE_SIZE = 10;

const ATTENDANCE_LABEL = {
  present: "Present",
  late: "Late",
  absent: "Absent",
};

const ATTENDANCE_CHIP = {
  present:
    "bg-secondaryColor/15 text-secondaryColor border-secondaryColor/30",
  late: "bg-[var(--color-primaryColor)]/10 text-[var(--color-primaryColor)] dark:text-[var(--color-primaryColor-400)] border-[var(--color-primaryColor)]/25",
  absent:
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
};

function readStoredNotes(meetingId, userId) {
  if (!userId || typeof window === "undefined") return "";
  try {
    return localStorage.getItem(notesStorageKey(meetingId, userId)) || "";
  } catch {
    return "";
  }
}

function HistoryExpanded({ meeting, userId }) {
  const attendance = summarizeAttendance(meeting.attendees);
  const invites = summarizeInvites(meeting.attendees);
  const privateNotes =
    readStoredNotes(meeting.id, userId) || meeting.notesPreview || "";

  return (
    <div className="bg-gray-50/70 dark:bg-gray-900/50 px-4 py-4 space-y-4 border-t border-gray-100 dark:border-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 space-y-1.5 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide admin-text-subtle mb-2">
            Meeting information
          </p>
          <p className="admin-text">
            <span className="admin-text-muted">Type: </span>
            {meeting.meetingType || "Online Meeting"}
          </p>
          <p className="admin-text">
            <span className="admin-text-muted">Date: </span>
            {formatMeetingDate(meeting.startAt)}
          </p>
          <p className="admin-text">
            <span className="admin-text-muted">Time: </span>
            {formatMeetingTime(meeting.startAt, meeting.endAt)}
          </p>
          <p className="admin-text">
            <span className="admin-text-muted">Host: </span>
            {meeting.host?.name}
          </p>
          {meeting.roomName && (
            <p className="admin-text">
              <span className="admin-text-muted">Room: </span>
              {meeting.roomName}
            </p>
          )}
          {meeting.companyName && (
            <p className="admin-text">
              <span className="admin-text-muted">Company: </span>
              {meeting.companyName}
            </p>
          )}
          {meeting.clientName && (
            <p className="admin-text">
              <span className="admin-text-muted">Client: </span>
              {meeting.clientName}
            </p>
          )}
          {meeting.address && (
            <p className="admin-text">
              <span className="admin-text-muted">Address: </span>
              {meeting.address}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 space-y-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide admin-text-subtle mb-2">
            Invitation summary
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border border-gray-200 dark:border-gray-600 admin-text">
              Total {invites.total}
            </span>
            <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border border-secondaryColor/30 bg-secondaryColor/10 text-secondaryColor">
              Accepted {invites.accepted}
            </span>
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${pc.borderSoft} ${pc.bgSoft} ${pc.text}`}
            >
              Pending {invites.pending}
            </span>
            <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border border-gray-200 dark:border-gray-600 admin-text-muted">
              Declined {invites.declined}
            </span>
          </div>
          {meeting.meetUrl && (
            <a
              href={meeting.meetUrl}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1.5 mt-2 text-xs font-semibold ${pc.text}`}
            >
              Meet link <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h4 className="text-sm font-semibold admin-text flex items-center gap-1.5">
            <Users size={14} className={pc.text} />
            Participants
          </h4>
          <span className="text-[11px] font-semibold admin-text-muted">
            Total: {attendance.total}
          </span>
          <span className="text-[11px] font-semibold text-secondaryColor">
            Present: {attendance.present}
          </span>
          <span className={`text-[11px] font-semibold ${pc.text}`}>
            Late: {attendance.late}
          </span>
          <span className="text-[11px] font-semibold admin-text-muted">
            Absent: {attendance.absent}
          </span>
        </div>
        {meeting.attendees?.length ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {meeting.attendees.map((p) => (
              <li
                key={`${meeting.id}-${p.employeeId}`}
                className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-gray-800 px-2.5 py-2"
              >
                <div
                  className={`w-8 h-8 rounded-full ${pc.bgSofter} flex items-center justify-center text-[10px] font-bold ${pc.text} shrink-0`}
                >
                  {(p.name || "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold admin-text truncate">
                    {p.name}
                  </p>
                  <p className="text-[10px] admin-text-subtle truncate">
                    {p.email || p.role}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded border text-[10px] font-semibold ${
                    ATTENDANCE_CHIP[p.attendance] || ATTENDANCE_CHIP.absent
                  }`}
                >
                  {ATTENDANCE_LABEL[p.attendance] || "—"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm admin-text-muted py-2">No participant data.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
          <h4 className="text-sm font-semibold admin-text mb-2">Agenda</h4>
          {meeting.agenda?.length ? (
            <ul className="space-y-1.5">
              {meeting.agenda.map((a) => (
                <li
                  key={a.id}
                  className={`text-xs ${
                    a.done ? "admin-text-muted line-through" : "admin-text"
                  }`}
                >
                  {a.done ? "✓ " : "○ "}
                  {a.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs admin-text-muted">No agenda items.</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
          <h4 className="text-sm font-semibold admin-text mb-2 flex items-center gap-1.5">
            <StickyNote size={14} className={pc.text} />
            Notes
          </h4>
          <p className="text-xs admin-text-muted leading-relaxed whitespace-pre-wrap min-h-12">
            {privateNotes || "No notes saved for this meeting."}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
          <h4 className="text-sm font-semibold admin-text mb-2 flex items-center gap-1.5">
            <FileText size={14} className={pc.text} />
            Minutes / action items
          </h4>
          {meeting.minutes?.length
            ? meeting.minutes.map((m) => (
                <p key={m.id} className="text-xs admin-text mb-1">
                  {m.description}
                  {m.attachment ? (
                    <span className={`ml-1 ${pc.text}`}>({m.attachment})</span>
                  ) : null}
                </p>
              ))
            : null}
          {meeting.actionItems?.length
            ? meeting.actionItems.map((ai) => (
                <p
                  key={ai.id}
                  className={`text-xs ${
                    ai.done ? "admin-text-muted line-through" : "admin-text"
                  }`}
                >
                  {ai?.title || "Action Item"}
                </p>
              ))
            : !meeting.minutes?.length && (
                <p className="text-xs admin-text-muted">No minutes yet.</p>
              )}
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href={`/hr-dashboard/meeting/${meeting.id}`}
          className={`${meetingBtnOutline} h-8 px-3`}
        >
          Open summary
        </Link>
      </div>
    </div>
  );
}

export default function PreviousMeetingHistory() {
  const { userId } = useMeetingAccess();
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const past = useMemo(() => getPastMeetings(), []);
  const total = past.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return past.slice(start, start + PAGE_SIZE);
  }, [past, safePage]);

  const goPage = (p) => {
    setExpandedId(null);
    setPage(Math.min(Math.max(1, p), totalPages));
  };

  return (
    <div className="admin-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold admin-text">
            Previous Meeting History
          </h2>
          <p className="text-xs admin-text-muted mt-0.5">
            Past meetings with attendance, invitations, notes & agenda.
          </p>
        </div>
        <span className="text-xs font-semibold admin-text-muted">
          {total} meeting{total !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] table-fixed border-collapse">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[12%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="bg-(--color-primaryColor) text-white text-left text-[11px] font-semibold uppercase tracking-wide">
              <th className="px-4 py-3 align-middle">Title</th>
              <th className="px-4 py-3 align-middle">Host</th>
              <th className="px-4 py-3 align-middle">Date &amp; time</th>
              <th className="px-4 py-3 align-middle">Type</th>
              <th className="px-4 py-3 align-middle">Attendance</th>
              <th className="px-4 py-3 align-middle">Invites</th>
              <th className="px-4 py-3 align-middle text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm admin-text-muted"
                >
                  No previous meetings yet.
                </td>
              </tr>
            ) : (
              pageItems.map((m) => {
                const att = summarizeAttendance(m.attendees);
                const inv = summarizeInvites(m.attendees);
                const open = expandedId === m.id;
                const hasNotes =
                  Boolean(m.notesPreview) ||
                  Boolean(readStoredNotes(m.id, userId));

                if (!m) return null;
                return (
                  <Fragment key={m.id}>
                    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 align-middle">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold admin-text truncate">
                            {m?.title || "Meeting"}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <MeetingStatusBadge status="ended" />
                            {hasNotes && (
                              <span
                                className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${pc.text}`}
                              >
                                <StickyNote size={11} />
                                Notes
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle text-xs admin-text-muted truncate">
                        {m.host?.name || "—"}
                      </td>
                      <td className="px-4 py-3 align-middle text-xs admin-text-muted">
                        <p className="leading-snug">
                          {formatMeetingDate(m.startAt)}
                        </p>
                        <p className="leading-snug tabular-nums mt-0.5">
                          {formatMeetingTime(m.startAt, m.endAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-middle text-xs admin-text-muted truncate">
                        {m.meetingType || "Online Meeting"}
                      </td>
                      <td className="px-4 py-3 align-middle text-[11px] admin-text-muted whitespace-nowrap">
                        <span className="text-secondaryColor font-semibold">
                          {att.present}P
                        </span>
                        <span className="mx-1">·</span>
                        <span className={`font-semibold ${pc.text}`}>
                          {att.late}L
                        </span>
                        <span className="mx-1">·</span>
                        <span className="font-semibold">{att.absent}A</span>
                      </td>
                      <td className="px-4 py-3 align-middle text-[11px] admin-text-muted whitespace-nowrap">
                        {inv.accepted}/{inv.total || 0}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center justify-end gap-2 flex-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(open ? null : m.id)
                            }
                            className={`${meetingBtnOutline} h-8 px-2.5 gap-1 shrink-0`}
                            aria-expanded={open}
                          >
                            Details
                            <ChevronDown
                              size={13}
                              className={`transition-transform ${open ? "rotate-180" : ""}`}
                            />
                          </button>
                          <Link
                            href={`/hr-dashboard/meeting/${m.id}`}
                            className={`${meetingBtnSolid} h-8 px-2.5 shrink-0`}
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                    {open && (
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td colSpan={7} className="p-0">
                          <HistoryExpanded meeting={m} userId={userId} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs admin-text-muted">
          Showing{" "}
          <span className="font-semibold admin-text">
            {total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
          </span>
          –
          <span className="font-semibold admin-text">
            {Math.min(safePage * PAGE_SIZE, total)}
          </span>{" "}
          of <span className="font-semibold admin-text">{total}</span>
          {" · "}
          {PAGE_SIZE} per page
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => goPage(safePage - 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 admin-text disabled:opacity-40 hover:border-primaryColor/40"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              if (totalPages <= 7) return true;
              return p === 1 || p === totalPages || Math.abs(p - safePage) <= 1;
            })
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, idx) =>
              p === "…" ? (
                <span
                  key={`e-${idx}`}
                  className="px-1 text-xs admin-text-subtle"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goPage(p)}
                  className={`inline-flex h-8 min-w-8 px-2 items-center justify-center rounded-lg text-xs font-semibold border transition-colors ${
                    p === safePage
                      ? "bg-(--color-primaryColor) border-(--color-primaryColor) text-white"
                      : "border-gray-200 dark:border-gray-700 admin-text hover:border-primaryColor/40"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => goPage(safePage + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 admin-text disabled:opacity-40 hover:border-primaryColor/40"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
