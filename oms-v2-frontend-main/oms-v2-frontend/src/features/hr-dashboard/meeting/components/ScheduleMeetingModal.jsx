"use client";

import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toaster } from "@/utils/helpers";
import { isMeetingRescheduleLocked } from "../data/mockMeetings";

const MEETING_TYPES = [
  "Online Meeting",
  "Conference Room",
  "External Meeting",
];

const REPEAT_DAYS = [5, 10, 15, 20, 25, 30];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toLocalDateInputValue(isoOrDate) {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toLocalTimeInputValue(isoOrDate) {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return "";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Local date YYYY-MM-DD and times HH:mm from "now" (+duration for end). */
function getNowDefaults(durationMinutes = 30) {
  const now = new Date();
  const end = new Date(now.getTime() + durationMinutes * 60 * 1000);
  return {
    date: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,
    startTime: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
    endTime: `${pad2(end.getHours())}:${pad2(end.getMinutes())}`,
  };
}

const emptyForm = {
  title: "",
  hostId: "",
  date: "",
  startTime: "",
  endTime: "",
  meetingType: "Online Meeting",
  meetUrl: "",
  companyName: "",
  clientName: "",
  address: "",
  roomName: "",
  inviteeIds: [],
  selectAll: false,
  repeat: false,
  repeatDays: 10,
  agendaText: "",
};

function calcDurationMinutes(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return mins > 0 ? mins : 0;
}

const fieldClass =
  "mt-1.5 block w-full min-w-0 p-2.5 text-sm text-gray-900 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primaryColor/30 focus:border-primaryColor dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primaryColor dark:focus:border-primaryColor";

const labelClass =
  "block text-sm font-medium text-gray-900 dark:text-white";

export default function ScheduleMeetingModal({
  show,
  onClose,
  preselectedEmployeeId = null,
  onCreated,
  employees = [],
  currentEmployeeId = null,
  googleConnected = false,
  isSubmitting = false,
  editMeeting = null,
}) {
  const isEdit = Boolean(editMeeting?.id);
  const isTimeLocked = useMemo(() => {
    if (!isEdit || !editMeeting) return false;
    return isMeetingRescheduleLocked(editMeeting);
  }, [isEdit, editMeeting]);
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const isBusy = isSubmitting || isLocalSubmitting;
  const [participantSearch, setParticipantSearch] = useState("");
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    inviteeIds: preselectedEmployeeId ? [preselectedEmployeeId] : [],
  }));

  useEffect(() => {
    if (!show) return;
    setParticipantSearch("");

    if (editMeeting?.id) {
      let resolvedHostId = "";
      if (editMeeting.host?.id != null) {
        const empById = employees.find(
          (e) => String(e.id) === String(editMeeting.host.id),
        );
        if (empById) {
          resolvedHostId = String(empById.id);
        } else {
          const empByUserId = employees.find(
            (e) => String(e.userId) === String(editMeeting.host.id),
          );
          resolvedHostId = empByUserId
            ? String(empByUserId.id)
            : String(editMeeting.host.id);
        }
      }

      const inviteeIds = (editMeeting.attendees || [])
        .map((a) => {
          if (
            a.employeeId &&
            employees.some((e) => String(e.id) === String(a.employeeId))
          ) {
            return Number(a.employeeId);
          }
          const matchUser = employees.find(
            (e) => a.userId && String(e.userId) === String(a.userId),
          );
          if (matchUser) return Number(matchUser.id);
          if (a.email) {
            const matchEmail = employees.find(
              (e) =>
                e.email &&
                e.email.toLowerCase().trim() === a.email.toLowerCase().trim(),
            );
            if (matchEmail) return Number(matchEmail.id);
          }
          if (employees.some((e) => String(e.id) === String(a.id))) {
            return Number(a.id);
          }
          return null;
        })
        .filter((id) => id != null && Number.isFinite(id));

      let agendaText = "";
      if (Array.isArray(editMeeting.agenda)) {
        agendaText = editMeeting.agenda
          .map((item) => (typeof item === "string" ? item : item?.text || ""))
          .filter(Boolean)
          .join("\n");
      }

      const meetingDate = toLocalDateInputValue(editMeeting.startAt);
      const startTime = toLocalTimeInputValue(editMeeting.startAt);
      const endTime = toLocalTimeInputValue(editMeeting.endAt);

      setForm({
        ...emptyForm,
        title: editMeeting.title || "",
        hostId:
          resolvedHostId ||
          (currentEmployeeId ? String(currentEmployeeId) : ""),
        date: meetingDate,
        startTime: startTime,
        endTime: endTime,
        meetingType: editMeeting.meetingType || "Online Meeting",
        meetUrl: editMeeting.meetUrl || "",
        roomName: editMeeting.roomName || "",
        companyName: editMeeting.companyName || "",
        clientName: editMeeting.clientName || "",
        address: editMeeting.address || "",
        inviteeIds,
        selectAll:
          employees.length > 0 && inviteeIds.length === employees.length,
        repeat: Boolean(editMeeting.repeat || editMeeting.isRepeat),
        repeatDays: editMeeting.repeatDays || 10,
        agendaText,
      });
    } else {
      const now = getNowDefaults(30);
      setForm({
        ...emptyForm,
        ...now,
        hostId: currentEmployeeId
          ? String(currentEmployeeId)
          : employees?.[0]?.id
            ? String(employees[0].id)
            : "",
        inviteeIds: preselectedEmployeeId ? [preselectedEmployeeId] : [],
        selectAll: false,
      });
    }
  }, [show, editMeeting, preselectedEmployeeId, currentEmployeeId, employees]);

  const filteredEmployees = useMemo(() => {
    if (!participantSearch.trim()) return employees;
    const term = participantSearch.trim().toLowerCase();
    return employees.filter(
      (e) =>
        e.name?.toLowerCase().includes(term) ||
        e.email?.toLowerCase().includes(term) ||
        e.role?.toLowerCase().includes(term) ||
        e.department?.toLowerCase().includes(term),
    );
  }, [employees, participantSearch]);

  const duration = useMemo(
    () => calcDurationMinutes(form.startTime, form.endTime),
    [form.startTime, form.endTime],
  );

  const invitees = useMemo(
    () => employees.filter((e) => form.inviteeIds.includes(e.id)),
    [form.inviteeIds, employees],
  );

  const hostOptions = useMemo(() => employees, [employees]);

  const host = useMemo(
    () => hostOptions.find((e) => String(e.id) === String(form.hostId)) || null,
    [form.hostId, hostOptions],
  );

  const isOnline = form.meetingType === "Online Meeting";
  const isExternal = form.meetingType === "External Meeting";
  const isRoom = form.meetingType === "Conference Room";

  const setType = (meetingType) => {
    setForm((p) => ({
      ...p,
      meetingType,
      roomName: meetingType === "Conference Room" ? p.roomName : "",
      companyName: meetingType === "External Meeting" ? p.companyName : "",
      clientName: meetingType === "External Meeting" ? p.clientName : "",
      address: meetingType === "External Meeting" ? p.address : "",
    }));
  };

  const toggleInvitee = (id) => {
    setForm((prev) => {
      const next = prev.inviteeIds.includes(id)
        ? prev.inviteeIds.filter((x) => x !== id)
        : [...prev.inviteeIds, id];
      return {
        ...prev,
        inviteeIds: next,
        selectAll: employees.length > 0 && next.length === employees.length,
      };
    });
  };

  const toggleSelectAll = () => {
    setForm((prev) => {
      if (prev.selectAll) {
        return { ...prev, selectAll: false, inviteeIds: [] };
      }
      return {
        ...prev,
        selectAll: true,
        inviteeIds: employees.map((e) => e.id),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hostId) {
      toaster("Please select a meeting host.", "warning");
      return;
    }
    if (!form.date) {
      toaster("Please select a meeting date.", "warning");
      return;
    }
    if (!form.startTime || !form.endTime || duration <= 0) {
      toaster("Meeting end time must be after start time.", "warning");
      return;
    }
    if (form.inviteeIds.length === 0) {
      toaster("Please select at least one participant.", "warning");
      return;
    }

    if (isEdit) {
      const origDate = toLocalDateInputValue(editMeeting.startAt);
      const origStartTime = toLocalTimeInputValue(editMeeting.startAt);
      const origEndTime = toLocalTimeInputValue(editMeeting.endAt);
      const timeChanged =
        form.date !== origDate ||
        form.startTime !== origStartTime ||
        form.endTime !== origEndTime;

      if (timeChanged) {
        if (isTimeLocked) {
          toaster(
            "Meeting time cannot be changed within 10 minutes of start time or while in progress.",
            "error",
          );
          return;
        }

        const newStart = new Date(`${form.date}T${form.startTime}:00`);
        if (
          !isNaN(newStart.getTime()) &&
          newStart.getTime() < Date.now() + 10 * 60 * 1000
        ) {
          toaster(
            "New meeting start time must be at least 10 minutes from now.",
            "warning",
          );
          return;
        }
      }
    }

    const payload = {
      ...form,
      id: editMeeting?.id || undefined,
      meetUrl: form.meetUrl?.trim() || null,
      host,
      duration,
      invitees,
      agenda: form.agendaText
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    setIsLocalSubmitting(true);
    try {
      await onCreated?.(payload);
      const now = getNowDefaults(30);
      setForm({
        ...emptyForm,
        ...now,
        hostId: currentEmployeeId ? String(currentEmployeeId) : "",
        inviteeIds: preselectedEmployeeId ? [preselectedEmployeeId] : [],
      });
      onClose?.();
    } catch {
      // parent shows error toast
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  return (
    <ModalTw
      show={show}
      onClose={onClose}
      title={isEdit ? "Update Meeting" : "Schedule New Meeting"}
      size="4xl"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-h-[78vh] overflow-y-auto pr-1"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <span>Meeting Title</span>
                <span className="text-red-500 font-bold leading-none select-none">*</span>
              </span>
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className={fieldClass}
              placeholder="Enter meeting title"
            />
          </div>
          <div>
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <span>Host</span>
                <span className="text-red-500 font-bold leading-none select-none">*</span>
              </span>
            </label>
            <select
              required
              value={form.hostId}
              onChange={(e) =>
                setForm((p) => ({ ...p, hostId: e.target.value }))
              }
              className={fieldClass}
            >
              <option value="">Select Host</option>
              {hostOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isTimeLocked && (
          <div className="rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 px-3.5 py-2.5 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <span className="text-base leading-none">⚠️</span>
            <span>
              <strong>Reschedule Locked:</strong> Cannot change meeting time within 10 minutes of start time or while in progress.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="min-w-0">
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <span>Date</span>
                <span className="text-red-500 font-bold leading-none select-none">*</span>
              </span>
            </label>
            <input
              required
              type="date"
              disabled={isTimeLocked}
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className={`${fieldClass} ${isTimeLocked ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}`}
            />
          </div>
          <div className="min-w-0">
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <span>Start Time</span>
                <span className="text-red-500 font-bold leading-none select-none">*</span>
              </span>
            </label>
            <input
              required
              type="time"
              disabled={isTimeLocked}
              value={form.startTime}
              onChange={(e) =>
                setForm((p) => ({ ...p, startTime: e.target.value }))
              }
              className={`${fieldClass} ${isTimeLocked ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}`}
            />
          </div>
          <div className="min-w-0">
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <span>End Time</span>
                <span className="text-red-500 font-bold leading-none select-none">*</span>
              </span>
            </label>
            <input
              required
              type="time"
              disabled={isTimeLocked}
              value={form.endTime}
              onChange={(e) =>
                setForm((p) => ({ ...p, endTime: e.target.value }))
              }
              className={`${fieldClass} ${isTimeLocked ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}`}
            />
          </div>
          <div className="min-w-0">
            <label className={labelClass}>Duration (minutes)</label>
            <input
              readOnly
              tabIndex={-1}
              value={`${duration} minutes`}
              className={`${fieldClass} bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed`}
            />
          </div>
        </div>

        {isOnline && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="min-w-0">
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span>Meeting Type</span>
                  <span className="text-red-500 font-bold leading-none select-none">*</span>
                </span>
              </label>
              <select
                value={form.meetingType}
                onChange={(e) => setType(e.target.value)}
                className={fieldClass}
              >
                {MEETING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>
                Meeting Link (Google Meet / Zoom / MS Teams)
              </label>
              <input
                type="url"
                value={form.meetUrl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, meetUrl: e.target.value }))
                }
                className={fieldClass}
                placeholder={
                  googleConnected
                    ? "Leave blank to auto-generate Meet link, or enter custom URL"
                    : "Enter Meet or Zoom URL (or connect Google Calendar)"
                }
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {googleConnected
                  ? "Google Calendar is connected — leaving empty auto-creates a Google Meet link."
                  : "Google Calendar is not connected — you can paste a meeting link here, or leave empty."}
              </p>
            </div>
          </div>
        )}

        {isRoom && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="min-w-0">
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span>Meeting Type</span>
                  <span className="text-red-500 font-bold leading-none select-none">*</span>
                </span>
              </label>
              <select
                value={form.meetingType}
                onChange={(e) => setType(e.target.value)}
                className={fieldClass}
              >
                {MEETING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span>Meeting Room</span>
                  <span className="text-red-500 font-bold leading-none select-none">*</span>
                </span>
              </label>
              <input
                required
                value={form.roomName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, roomName: e.target.value }))
                }
                className={fieldClass}
                placeholder="Enter meeting room"
              />
            </div>
          </div>
        )}

        {isExternal && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="min-w-0">
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span>Meeting Type</span>
                  <span className="text-red-500 font-bold leading-none select-none">*</span>
                </span>
              </label>
              <select
                value={form.meetingType}
                onChange={(e) => setType(e.target.value)}
                className={fieldClass}
              >
                {MEETING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Company Name</label>
              <input
                value={form.companyName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, companyName: e.target.value }))
                }
                className={fieldClass}
                placeholder="Enter company name"
              />
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Client Name</label>
              <input
                value={form.clientName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, clientName: e.target.value }))
                }
                className={fieldClass}
                placeholder="Enter client name"
              />
            </div>
            <div className="min-w-0">
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span>Address</span>
                  <span className="text-red-500 font-bold leading-none select-none">*</span>
                </span>
              </label>
              <input
                required
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                className={fieldClass}
                placeholder="Enter address"
              />
            </div>
          </div>
        )}

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <span>Participants</span>
                <span className="text-red-500 font-bold leading-none select-none">*</span>
              </span>
              {employees.length > 0 && (
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1.5">
                  ({form.inviteeIds.length}/{employees.length} selected)
                </span>
              )}
            </label>
            {employees.length > 0 && (
              <label className="inline-flex items-center gap-2 text-xs title-color cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.selectAll}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 dark:border-gray-600 text-primaryColor focus:ring-primaryColor"
                />
                Select All ({employees.length})
              </label>
            )}
          </div>

          {employees.length > 5 && (
            <div className="mt-1 mb-1.5">
              <input
                type="text"
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                placeholder="Search participants by name, role, email or department…"
                className="w-full text-xs p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primaryColor"
              />
            </div>
          )}

          <div className="mt-1.5 max-h-52 overflow-y-auto rounded-md border border-gray-300 dark:border-gray-600 divide-y divide-gray-200 dark:divide-gray-700 bg-gray-50 dark:bg-gray-700/40">
            {employees.length === 0 ? (
              <p className="px-4 py-6 text-sm title-color text-center">
                Loading participants from database…
              </p>
            ) : filteredEmployees.length === 0 ? (
              <p className="px-4 py-6 text-sm title-color text-center">
                No participants match “{participantSearch}”.
              </p>
            ) : (
              filteredEmployees.map((emp) => (
                <label
                  key={emp.id}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={form.inviteeIds.includes(emp.id)}
                    onChange={() => toggleInvitee(emp.id)}
                    className="rounded border-gray-300 dark:border-gray-600 text-primaryColor focus:ring-primaryColor"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm dark-title-color font-medium truncate">
                      {emp.name}
                    </span>
                    {emp.email && (
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {emp.email}
                      </span>
                    )}
                  </div>
                  <div className="ml-auto text-right shrink-0">
                    <span className="text-[11px] title-color font-medium block truncate max-w-[140px]">
                      {emp.role}
                    </span>
                    {emp.department && emp.department !== "General" && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block truncate max-w-[140px]">
                        {emp.department}
                      </span>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
          {form.inviteeIds.length === 0 && (
            <p className="mt-1 text-[11px] text-red-500">
              Select at least one participant.
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Agenda (one item per line)</label>
          <textarea
            value={form.agendaText}
            onChange={(e) =>
              setForm((p) => ({ ...p, agendaText: e.target.value }))
            }
            rows={4}
            className={fieldClass}
            placeholder={"Welcome\nPolicy update\nQ&A"}
          />
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <label className="inline-flex items-center gap-2 text-sm title-color cursor-pointer pb-2">
            <input
              type="checkbox"
              checked={form.repeat}
              onChange={(e) =>
                setForm((p) => ({ ...p, repeat: e.target.checked }))
              }
              className="rounded border-gray-300 dark:border-gray-600 text-primaryColor focus:ring-primaryColor"
            />
            Repeat Meeting?
          </label>
          {form.repeat && (
            <div className="min-w-[10rem]">
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span>Select Days</span>
                  <span className="text-red-500 font-bold leading-none select-none">*</span>
                </span>
              </label>
              <select
                required={form.repeat}
                value={form.repeatDays}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    repeatDays: Number(e.target.value),
                  }))
                }
                className={fieldClass}
              >
                {REPEAT_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d} Days
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {isBusy && form.repeat && (
          <div className="rounded-lg border border-primaryColor/40 bg-primaryColor/10 dark:bg-primaryColor/20 px-4 py-3 flex items-center gap-3 text-primaryColor dark:text-primaryColor-300 animate-pulse">
            <Loader2 className="animate-spin shrink-0" size={18} />
            <div className="text-xs">
              <p className="font-semibold">Scheduling Repeat Meetings...</p>
              <p className="opacity-80">Generating {form.repeatDays} daily sessions. Please wait...</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <ButtonTw type="button" variant="outline.gray" onClick={onClose} disabled={isBusy}>
            <span className="inline-flex items-center gap-1.5">
              <ArrowLeft size={14} />
              Back
            </span>
          </ButtonTw>
          <ButtonTw
            type="submit"
            variant="blue"
            className="gap-2 min-w-[140px] justify-center"
            disabled={isBusy || employees.length === 0}
          >
            {isBusy ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>
                  {form.repeat
                    ? `Creating ${form.repeatDays} Days…`
                    : isEdit
                      ? "Updating…"
                      : "Saving…"}
                </span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>{isEdit ? "Update Meeting" : "Save Meeting"}</span>
              </>
            )}
          </ButtonTw>
        </div>
      </form>
    </ModalTw>
  );
}
