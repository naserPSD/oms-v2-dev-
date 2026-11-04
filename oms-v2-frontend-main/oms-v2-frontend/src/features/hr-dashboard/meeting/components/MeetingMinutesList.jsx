"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Copy,
  Eye,
  History,
  List,
  Mail,
  MailCheck,
  Pencil,
  Trash2,
  UserCheck,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";
import {
  filterMeetingsByTab,
  formatMeetingDateBadge,
  formatMeetingTimeShort,
  getMeetingDurationMinutes,
  getMeetingListStatus,
  getMeetingTypeLabel,
  deriveMeetingStatus,
  isMeetingExpired,
  canModifyMeeting,
  LIST_STATUS_OPTIONS,
  summarizeInvites,
} from "../data/mockMeetings";
import { pc } from "../meetingTheme";
import { openMeetWindow } from "../utils/meetWindowManager";

const FILTERS = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "previous", label: "Previous", icon: History },
  { id: "all", label: "All", icon: List },
];

const DEFAULT_PAGE_SIZE = 10;

const STATUS_STYLE = {
  COMPLETED:
    "bg-secondaryColor/15 text-secondaryColor border-secondaryColor/30",
  INVITED:
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
  CANCELLED:
    "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  SCHEDULED: `${pc.bgSoft} ${pc.text} ${pc.borderSoft}`,
};

const TYPE_STYLE = {
  ONLINE:
    "bg-secondaryColor/15 text-secondaryColor border-secondaryColor/30",
  CONFERENCE: `${pc.bgSoft} ${pc.text} ${pc.borderSoft}`,
  EXTERNAL:
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
};

function FilterTabs({ active, onChange }) {
  return (
    <div className="flex overflow-x-auto max-w-full items-stretch pb-1 sm:pb-0">
      {FILTERS.map((f) => {
        const isActive = active === f.id;
        const Icon = f.icon;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            className={[
              "inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 text-sm font-medium border transition-colors",
              "first:rounded-l-lg last:rounded-r-lg -ml-px first:ml-0",
              isActive
                ? "bg-[var(--color-primaryColor)] border-[var(--color-primaryColor)] text-white z-[1]"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 admin-text hover:bg-primaryColor/[0.04] dark:hover:bg-primaryColor/10",
            ].join(" ")}
          >
            {Icon ? (
              <Icon
                size={14}
                className={isActive ? "text-white" : pc.text}
                strokeWidth={2.25}
              />
            ) : null}
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

function StatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border",
          STATUS_STYLE[value] || STATUS_STYLE.SCHEDULED,
        ].join(" ")}
      >
        {value}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 min-w-[140px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1">
          {LIST_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={[
                "w-full text-left px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:bg-gray-50 dark:hover:bg-gray-800",
                opt === value ? pc.text : "admin-text",
              ].join(" ")}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ParticipantStats({ meeting }) {
  const attendees = meeting.attendees || [];
  const isEnded =
    meeting.endAt && new Date(meeting.endAt).getTime() < Date.now();
  const total = attendees.length || meeting.expectedCount || 0;
  const present = attendees.filter((a) => a.attendance === "present").length;
  const late = attendees.filter((a) => a.attendance === "late").length;
  const absent = attendees.filter(
    (a) => a.attendance === "absent" || (isEnded && !a.attendance),
  ).length;

  return (
    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
      <span
        className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-[10px] font-bold px-1.5"
        title={`Total Attendees: ${total}`}
      >
        {total}
      </span>
      <span
        className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondaryColor text-white text-[10px] font-bold px-1.5"
        title={`Present (On-time): ${present}`}
      >
        P: {present}
      </span>
      <span
        className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold px-1.5"
        title={`Late: ${late}`}
      >
        L: {late}
      </span>
      <span
        className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5"
        title={`Absent: ${absent}`}
      >
        A: {absent}
      </span>
    </div>
  );
}

function ActionIcon({ title, onClick, children, danger, href }) {
  const className = [
    "inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
    danger
      ? "border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/40"
      : "border-gray-200 dark:border-gray-700 admin-text-muted hover:border-primaryColor/40 hover:text-primaryColor hover:bg-primaryColor/5",
  ].join(" ");

  if (href) {
    return (
      <Link href={href} title={title} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" title={title} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export default function MeetingMinutesList({
  meetings,
  canManage = false,
  onStatusChange,
  onDelete,
  onDuplicate,
  onEmail,
  onEdit,
  onManageAttendance,
  serverMode = false,
  pagination = null,
  isLoading = false,
  activeTab,
  onTabChange,
  onPageChange,
}) {
  const [localTab, setLocalTab] = useState("previous");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const tab = serverMode ? activeTab ?? "previous" : localTab;

  const filtered = useMemo(() => {
    const valid = (meetings || []).filter(Boolean);
    const rows = serverMode
      ? valid
      : filterMeetingsByTab(valid, tab).sort(
          (a, b) => new Date(b.startAt) - new Date(a.startAt),
        );
    return rows;
  }, [meetings, tab, serverMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [tab, itemsPerPage, meetings.length]);

  const totalItems = serverMode
    ? pagination?.total ?? filtered.length
    : filtered.length;
  const totalPages = serverMode
    ? Math.max(1, pagination?.totalPages ?? 1)
    : Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = serverMode
    ? Math.min(pagination?.page ?? 1, totalPages)
    : Math.min(currentPage, totalPages);

  const pageRows = useMemo(() => {
    const valid = (filtered || []).filter(Boolean);
    if (serverMode) return valid;
    const start = (safePage - 1) * itemsPerPage;
    return valid.slice(start, start + itemsPerPage);
  }, [filtered, safePage, itemsPerPage, serverMode]);

  const handleTabChange = (next) => {
    if (serverMode) {
      onTabChange?.(next);
      onPageChange?.(1);
      return;
    }
    setLocalTab(next);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (serverMode) {
      onPageChange?.(page);
      return;
    }
    setCurrentPage(page);
  };

  return (
    <div className="admin-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
        <div>
          <h3 className="text-base font-semibold admin-text">
            Meeting History
          </h3>
          <p className="text-xs admin-text-muted mt-0.5">
            Upcoming and previous meetings
          </p>
        </div>
        <FilterTabs active={tab} onChange={handleTabChange} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] text-sm">
          <thead>
            <tr className="bg-[var(--color-primaryColor)] text-white">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide w-14">
                SL.
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Meeting Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Host / Participants
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide whitespace-nowrap min-w-[190px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center admin-text-muted">
                  Loading meetings…
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center admin-text-muted"
                >
                  No meetings in this view.
                </td>
              </tr>
            ) : (
              pageRows.map((m, idx) => {
                if (!m) return null;
                const typeLabel = getMeetingTypeLabel(m);
                const listStatus = getMeetingListStatus(m);
                const isInvited = listStatus === "INVITED";
                const isExpired = isMeetingExpired(m);
                const duration = getMeetingDurationMinutes(m.startAt, m.endAt);
                const derived = deriveMeetingStatus(m);
                const isLive = derived === "live";
                const canModify = canModifyMeeting(m);
                const showJoin =
                  Boolean(m.meetUrl) &&
                  listStatus !== "COMPLETED" &&
                  listStatus !== "CANCELLED" &&
                  isLive;
                const sl = (safePage - 1) * itemsPerPage + idx + 1;
                const meetingTitle = m?.title || "Meeting";

                return (
                  <tr
                    key={m.id}
                    className="border-b border-gray-100 dark:border-gray-800 odd:bg-white even:bg-gray-50/70 dark:odd:bg-gray-900 dark:even:bg-gray-900/50 hover:bg-primaryColor/[0.03] dark:hover:bg-primaryColor/10 transition-colors"
                  >
                    <td className="px-4 py-3.5 align-top admin-text font-medium">
                      {sl}
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <Link
                        href={`/hr-dashboard/meeting/${m.id}`}
                        className={`font-semibold admin-text ${pc.textHover} transition-colors`}
                      >
                        {meetingTitle}
                      </Link>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span
                          className={[
                            "inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border",
                            TYPE_STYLE[typeLabel] || TYPE_STYLE.ONLINE,
                          ].join(" ")}
                        >
                          {typeLabel}
                        </span>
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-orange-400/30 bg-orange-500 text-white">
                          {formatMeetingDateBadge(m.startAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      <span className="font-medium admin-text">
                        {formatMeetingTimeShort(m.startAt, m.endAt)}
                      </span>
                      <span className="admin-text-muted ml-1">
                        ({duration} min)
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <span
                        className={`inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${pc.bg}`}
                        title={m.host?.name}
                      >
                        {(m.host?.name || "—").toUpperCase()}
                      </span>
                      <ParticipantStats meeting={m} />
                      {showJoin ? (
                        <button
                          type="button"
                          onClick={() => openMeetWindow(m.meetUrl, m.id)}
                          className={[
                            "inline-flex mt-2 items-center rounded-md bg-amber-400 hover:bg-amber-500 text-gray-900 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1.5 transition-colors cursor-pointer",
                            isLive ? "meeting-join-blink" : "",
                          ].join(" ")}
                        >
                          Join Online
                        </button>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      {canManage && onStatusChange ? (
                        <StatusDropdown
                          value={listStatus}
                          onChange={(newStatus) => onStatusChange(m.id, newStatus)}
                        />
                      ) : (
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border",
                            STATUS_STYLE[listStatus] || STATUS_STYLE.SCHEDULED,
                          ].join(" ")}
                        >
                          {listStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                        <ActionIcon
                          title="View"
                          href={`/hr-dashboard/meeting/${m.id}`}
                        >
                          <Eye size={14} />
                        </ActionIcon>
                        {canManage ? (
                          <>
                            {canModify ? (
                              <>
                                <ActionIcon title="Edit" onClick={() => onEdit?.(m)}>
                                  <Pencil size={14} />
                                </ActionIcon>
                                <ActionIcon
                                  title="Delete"
                                  danger
                                  onClick={() => onDelete?.(m)}
                                >
                                  <Trash2 size={14} />
                                </ActionIcon>
                              </>
                            ) : null}
                            <ActionIcon
                              title="Duplicate"
                              onClick={() => onDuplicate?.(m)}
                            >
                              <Copy size={14} />
                            </ActionIcon>
                            <ActionIcon
                              title="Attendance"
                              onClick={() => onManageAttendance?.(m)}
                            >
                              <UserCheck size={14} />
                            </ActionIcon>
                            {!isExpired ? (
                              <ActionIcon
                                title={
                                  isInvited
                                    ? "Invitation sent (Click to resend)"
                                    : "Email invite"
                                }
                                onClick={() => onEmail?.(m)}
                              >
                                {isInvited ? (
                                  <MailCheck
                                    size={14}
                                    className="text-secondaryColor"
                                  />
                                ) : (
                                  <Mail size={14} />
                                )}
                              </ActionIcon>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 sm:px-5 py-3 border-t border-gray-100 dark:border-gray-800">
        <Pagination
          currentPage={safePage}
          totalItems={totalItems}
          resultRows={pageRows.length}
          itemsPerPage={serverMode ? pagination?.limit ?? DEFAULT_PAGE_SIZE : itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={
            serverMode ? undefined : setItemsPerPage
          }
        />
      </div>
    </div>
  );
}
