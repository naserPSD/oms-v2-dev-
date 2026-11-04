"use client";

import { useState, useMemo } from "react";
import { ModalTw } from "@/components/common/ModalTw";
import { Users, Clock, CheckCircle, AlertTriangle, XCircle, Sparkles } from "lucide-react";
import { computeOnTimeAttendance, formatMeetingDate, formatMeetingTime } from "../data/mockMeetings";

export default function ChangeAttendanceModal({
  show,
  onClose,
  meeting,
  onSaveAttendance,
}) {
  // Sync attendees whenever modal opens with a new meeting
  const attendees = useMemo(() => {
    if (!meeting) return [];
    const isEnded = meeting.endAt && new Date(meeting.endAt).getTime() < Date.now();
    return (meeting.attendees || []).map((a) => ({
      ...a,
      id: a.employeeId ?? a.id,
      attendance: a.attendance || (isEnded ? "absent" : null),
    }));
  }, [meeting]);

  const [roster, setRoster] = useState(attendees);

  // Keep roster in sync when meeting prop changes
  useMemo(() => {
    setRoster(attendees);
  }, [attendees]);

  const stats = useMemo(() => {
    const total = roster.length;
    const present = roster.filter((a) => a.attendance === "present").length;
    const late = roster.filter((a) => a.attendance === "late").length;
    const absent = roster.filter((a) => a.attendance === "absent").length;
    const unrecorded = roster.filter((a) => !a.attendance).length;
    return { total, present, late, absent, unrecorded };
  }, [roster]);

  const handleMark = (employeeId, value, attendee) => {
    setRoster((prev) =>
      prev.map((a) =>
        (attendee?.id && a.id === attendee.id) ||
        (employeeId && (a.employeeId ?? a.id) === employeeId) ||
        (attendee?.email &&
          a.email &&
          a.email.toLowerCase().trim() ===
            attendee.email.toLowerCase().trim())
          ? { ...a, attendance: value }
          : a,
      ),
    );
    onSaveAttendance?.(employeeId, value, attendee);
  };

  const handleAutoMarkOnTime = () => {
    if (!meeting) return;
    const isEnded = meeting.endAt && new Date(meeting.endAt).getTime() < Date.now();
    const autoStatus = isEnded
      ? "absent"
      : computeOnTimeAttendance(meeting.startAt, Date.now(), 5);

    roster.forEach((a) => {
      const empId = a.employeeId ?? a.id;
      // Mark anyone not already manually marked
      if (!a.attendance) {
        handleMark(empId, autoStatus, a);
      }
    });
  };

  const handleMarkAll = (value) => {
    roster.forEach((a) => {
      const empId = a.employeeId ?? a.id;
      handleMark(empId, value, a);
    });
  };

  if (!meeting) return null;

  return (
    <ModalTw
      show={show}
      onClose={onClose}
      title="Manage Attendance"
      size="3xl"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-5">
        {/* Meeting Header Info */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-base font-semibold admin-text">{meeting?.title || "Meeting"}</h4>
              <p className="text-xs admin-text-muted mt-1 flex items-center gap-2">
                <span>{formatMeetingDate(meeting.startAt)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-primaryColor dark:text-primaryColor-400" />
                  {formatMeetingTime(meeting.startAt, meeting.endAt)}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoMarkOnTime}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primaryColor hover:bg-primaryColor-700 text-white text-xs font-semibold shadow-sm transition-colors"
              title="Automatically mark present (if on-time) or late based on meeting start time"
            >
              <Sparkles size={14} />
              Auto-Mark by Time
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <Users size={16} className="text-gray-500" />
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Total</p>
                <p className="text-sm font-bold admin-text">{stats.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-secondaryColor/10 border border-secondaryColor/30">
              <CheckCircle size={16} className="text-secondaryColor" />
              <div>
                <p className="text-[10px] uppercase font-bold text-secondaryColor">Present</p>
                <p className="text-sm font-bold text-secondaryColor">{stats.present}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Late</p>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">{stats.late}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <XCircle size={16} className="text-red-500" />
              <div>
                <p className="text-[10px] uppercase font-bold text-red-500">Absent</p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{stats.absent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick bulk action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold admin-text">Participants Roster ({roster.length})</span>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 text-[11px] mr-1">Mark all:</span>
            <button
              type="button"
              onClick={() => handleMarkAll("present")}
              className="px-2 py-0.5 rounded border border-secondaryColor/40 text-secondaryColor hover:bg-secondaryColor/10 text-[11px] font-semibold"
            >
              Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll("late")}
              className="px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-[11px] font-semibold"
            >
              Late
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll("absent")}
              className="px-2 py-0.5 rounded border border-red-300 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-[11px] font-semibold"
            >
              Absent
            </button>
          </div>
        </div>

        {/* Attendees List */}
        <div className="max-h-[50vh] overflow-y-auto space-y-2.5 pr-1">
          {roster.length === 0 ? (
            <p className="text-sm admin-text-muted text-center py-8">
              No participants found for this meeting.
            </p>
          ) : (
            roster.map((p) => {
              const empId = p.employeeId ?? p.id;
              const current = p.attendance;

              return (
                <div
                  key={empId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primaryColor/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primaryColor/10 text-primaryColor dark:text-primaryColor-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {(p.name || "?")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold admin-text truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {p.email || p.role || "Participant"}
                      </p>
                    </div>
                  </div>

                  {/* Attendance Controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMark(empId, "present", p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        current === "present"
                          ? "bg-secondaryColor text-white border-secondaryColor shadow-sm"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-secondaryColor/50 hover:bg-secondaryColor/5"
                      }`}
                    >
                      Present (On Time)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMark(empId, "late", p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        current === "late"
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                      }`}
                    >
                      Late
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMark(empId, "absent", p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        current === "absent"
                          ? "bg-red-500 text-white border-red-500 shadow-sm"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs admin-text-muted">
          <p>On-time rule: Joining on or before scheduled start time (+5 mins) is marked Present; otherwise Late.</p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Done
          </button>
        </div>
      </div>
    </ModalTw>
  );
}
