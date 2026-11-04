"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import { useMeetingQueryApi } from "@/hooks/queryApi/useMeetingQueryApi";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  Video,
  X,
} from "lucide-react";
import MeetingStatusBadge from "./components/MeetingStatusBadge";
import PersonalNotesPanel from "./components/PersonalNotesPanel";
import useMeetingAccess from "./hooks/useMeetingAccess";
import {
  deriveMeetingStatus,
  formatMeetingDate,
  formatMeetingTime,
  formatTime12,
  summarizeAttendance,
  computeOnTimeAttendance,
} from "./data/mockMeetings";
import { meetingBtnOutline, meetingBtnSolid, pc } from "./meetingTheme";
import { toaster } from "@/utils/helpers";
import { openMeetWindow, closeMeetWindow } from "./utils/meetWindowManager";

const ATTENDANCE_OPTS = ["present", "late", "absent"];

function durationLabel(startAt, endAt) {
  const mins = Math.max(
    0,
    Math.round((new Date(endAt) - new Date(startAt)) / 60000),
  );
  return `${mins} minutes`;
}

function formatShortDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MeetingLobby() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    useMeetingByIdQuery,
    updateMeetingStatusMutation,
    updateMeetingAttendanceMutation,
    addMeetingAgendaMutation,
    updateMeetingAgendaMutation,
    deleteMeetingAgendaMutation,
    useMeetingParticipantsQuery,
  } = useMeetingQueryApi({});
  const { data: meetingRes, isLoading } = useMeetingByIdQuery(params?.id);
  const { data: participantsRes } = useMeetingParticipantsQuery();
  const base = meetingRes?.data;
  const status = deriveMeetingStatus(base);
  const { canTakeNotes, canJoin, canManageRoster, canSchedule, userId, user, displayName } = useMeetingAccess();

  const [attendees, setAttendees] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [minutes, setMinutes] = useState([]);
  const [meetUrl, setMeetUrl] = useState("");
  const [toast, setToast] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const employees = useMemo(() => {
    const rows = participantsRes?.data ?? [];
    const list = rows.map((e) => {
      const firstName = e.user?.firstName ?? e.firstName ?? "";
      const lastName = e.user?.lastName ?? e.lastName ?? "";
      const fullName =
        e.user?.fullName ||
        [firstName, lastName].filter(Boolean).join(" ").trim();
      return {
        id: e.id,
        userId: e.userId ?? e.user?.id ?? null,
        name: fullName || e.user?.email || `Employee ${e.id}`,
        role: e.designation?.name || e.designation || "Employee",
        email: e.user?.email || e.email || "",
      };
    });

    const hasAsif = list.some(
      (e) => (e.email || "").toLowerCase() === "asifpatwary630@gmail.com",
    );
    if (!hasAsif) {
      list.unshift({
        id: 99901,
        userId: null,
        name: "Asif Patwary",
        role: "HR / QA",
        email: "asifpatwary630@gmail.com",
      });
    }

    return list;
  }, [participantsRes]);

  const urlAttendeeEmail = (searchParams?.get("attendeeEmail") || "").toLowerCase().trim();
  const urlAttendeeId = searchParams?.get("attendeeId");

  const userEmail = (user?.email || "").toLowerCase().trim();
  const userEmpId = user?.employee?.id || user?.employeeId;
  const userDisplayName = (displayName || "").toLowerCase().trim();
  const userFullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").toLowerCase().trim();

  const findMyAttendeeRecord = (list = []) => {
    if (!list || !list.length) return null;
    return list.find((a) => {
      if (urlAttendeeId && String(a.id) === String(urlAttendeeId)) {
        return true;
      }
      if (urlAttendeeEmail && a.email && a.email.toLowerCase().trim() === urlAttendeeEmail) {
        return true;
      }
      if (
        userId &&
        (String(a.userId) === String(userId) ||
          String(a.employeeId) === String(userId))
      ) {
        return true;
      }
      if (userEmpId && String(a.employeeId) === String(userEmpId)) {
        return true;
      }
      if (userEmail && a.email && a.email.toLowerCase().trim() === userEmail) {
        return true;
      }
      if (
        user?.personalEmail &&
        a.email &&
        a.email.toLowerCase().trim() === user.personalEmail.toLowerCase().trim()
      ) {
        return true;
      }
      if (
        userDisplayName &&
        userDisplayName !== "you" &&
        a.name &&
        a.name.toLowerCase().trim() === userDisplayName
      ) {
        return true;
      }
      if (
        userFullName &&
        a.name &&
        a.name.toLowerCase().trim() === userFullName
      ) {
        return true;
      }
      return false;
    });
  };

  const isEnded = status === "ended" || base?.listStatus === "COMPLETED";

  // Redirect participants to meetings page if meeting transitions to COMPLETED while in lobby
  const initialStatusRef = useRef(base?.listStatus);
  useEffect(() => {
    if (!initialStatusRef.current && base?.listStatus) {
      initialStatusRef.current = base.listStatus;
    }
    if (
      initialStatusRef.current &&
      initialStatusRef.current !== "COMPLETED" &&
      base?.listStatus === "COMPLETED"
    ) {
      if (base?.id) closeMeetWindow(base.id);
      toaster("Meeting has ended.", "info");
      router.push("/hr-dashboard/meeting");
    }
  }, [base?.listStatus, router]);

  useEffect(() => {
    if (!base) return;
    const initialAttendees = (base.attendees || []).map((a) => ({
      ...a,
      email:
        a.email ||
        `${(a.name || "user").split(" ")[0].toLowerCase()}@revinr.com`,
      attendance: a.attendance || (isEnded ? "absent" : ""),
      joinedAt:
        a.joinedAt ||
        ((a.attendance === "present" || a.attendance === "late")
          ? base.startAt
          : null),
    }));
    setAttendees(initialAttendees);
    setAgenda(base.agenda || []);
    setMinutes(base.minutes || []);
    setMeetUrl(base.meetUrl || "");

    // Auto-record attendee attendance if present in lobby
    if (!isEnded) {
      const myRecord = findMyAttendeeRecord(initialAttendees);
      if (
        myRecord &&
        (!myRecord.attendance || myRecord.attendance === "absent")
      ) {
        const now = Date.now();
        const autoStatus = computeOnTimeAttendance(base.startAt, now, 5);
        updateMeetingAttendanceMutation.mutate({
          id: base.id,
          employeeId: myRecord.employeeId
            ? Number(myRecord.employeeId)
            : undefined,
          attendeeId: myRecord.id,
          email: myRecord.email,
          attendance: autoStatus,
        });
        setAttendees((prev) =>
          prev.map((a) =>
            (myRecord.employeeId && a.employeeId === myRecord.employeeId) ||
            a.id === myRecord.id ||
            (myRecord.email &&
              a.email &&
              a.email.toLowerCase().trim() ===
                myRecord.email.toLowerCase().trim())
              ? {
                  ...a,
                  attendance: autoStatus,
                  joinedAt: a.joinedAt || new Date(now).toISOString(),
                }
              : a,
          ),
        );
      }
    }
  }, [base, user, isEnded]);

  const filteredAttendees = useMemo(() => {
    return attendees.filter((p) => {
      // 1. Status Filter
      if (attendanceFilter === "present") {
        if (p.attendance !== "present") return false;
      } else if (attendanceFilter === "late") {
        if (p.attendance !== "late") return false;
      } else if (attendanceFilter === "absent") {
        const isAbsent =
          p.attendance === "absent" || (status === "ended" && !p.attendance);
        if (!isAbsent) return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = (p.name || "").toLowerCase().includes(q);
        const matchEmail = (p.email || "").toLowerCase().includes(q);
        const matchRole = (p.role || "").toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchRole) return false;
      }

      return true;
    });
  }, [attendees, attendanceFilter, searchQuery, status]);

  const meeting = useMemo(
    () =>
      base
        ? {
            ...base,
            attendees,
            agenda,
            minutes,
            meetUrl: meetUrl || base.meetUrl,
          }
        : null,
    [base, attendees, agenda, minutes, meetUrl],
  );

  const attendance = summarizeAttendance(attendees);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const handleEndMeeting = async () => {
    if (!meeting?.id) return;
    const meetingTitle = meeting?.title || "Meeting";
    const confirmResult = await Swal.fire({
      title: "End Meeting?",
      text: `Are you sure you want to end "${meetingTitle}" now?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, end meeting!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal-popup",
        confirmButton: "swal-confirm-btn bg-red-600 hover:bg-red-700",
        cancelButton: "swal-cancel-btn",
      },
      buttonsStyling: false,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await updateMeetingStatusMutation.mutateAsync({
        id: meeting.id,
        listStatus: "COMPLETED",
      });
      closeMeetWindow(meeting.id);
      toaster(`Meeting "${meetingTitle}" has ended.`, "success");
      router.push("/hr-dashboard/meeting");
    } catch (err) {
      toaster(
        err?.response?.data?.message || "Could not end meeting.",
        "error",
      );
    }
  };

  const handleJoin = async () => {
    if (!meeting) return;
    // Mark attendee as present/late upon joining
    const myRecord = findMyAttendeeRecord(attendees);
    if (myRecord) {
      const now = Date.now();
      const autoStatus = computeOnTimeAttendance(meeting.startAt, now, 5);
      setAttendees((prev) =>
        prev.map((a) =>
          (myRecord.employeeId && a.employeeId === myRecord.employeeId) ||
          a.id === myRecord.id ||
          (myRecord.email &&
            a.email &&
            a.email.toLowerCase().trim() ===
              myRecord.email.toLowerCase().trim())
            ? {
                ...a,
                attendance: autoStatus,
                joinedAt: a.joinedAt || new Date(now).toISOString(),
              }
            : a,
        ),
      );
      updateMeetingAttendanceMutation.mutate({
        id: meeting.id,
        employeeId: myRecord.employeeId
          ? Number(myRecord.employeeId)
          : undefined,
        attendeeId: myRecord.id,
        email: myRecord.email,
        attendance: autoStatus,
      });
    }
    const url = meetUrl || meeting.meetUrl;
    if (url) {
      openMeetWindow(url, meeting.id);
    } else {
      showToast("No Google Meet link for this meeting yet.");
    }
    router.push(`/hr-dashboard/meeting/${meeting.id}/live`);
  };

  const setAttendance = (employeeId, value, person) => {
    const myRecord = findMyAttendeeRecord(attendees);
    const isSelf =
      myRecord &&
      ((employeeId && myRecord.employeeId === employeeId) ||
        myRecord.id === employeeId ||
        (person?.id && myRecord.id === person.id) ||
        (person?.email &&
          myRecord.email &&
          myRecord.email.toLowerCase().trim() ===
            person.email.toLowerCase().trim()));

    if (!canManageRoster && !isSelf) {
      showToast("Only HR can change attendance.");
      return;
    }
    setAttendees((prev) =>
      prev.map((a) =>
        (employeeId && a.employeeId === employeeId) ||
        (person?.id && a.id === person.id) ||
        a.id === employeeId ||
        (person?.email &&
          a.email &&
          a.email.toLowerCase().trim() === person.email.toLowerCase().trim())
          ? { ...a, attendance: value }
          : a,
      ),
    );
    updateMeetingAttendanceMutation.mutate({
      id: meeting.id,
      employeeId:
        person?.employeeId || (employeeId ? Number(employeeId) : undefined),
      attendeeId:
        person?.id ||
        (Number.isFinite(Number(employeeId)) ? Number(employeeId) : undefined),
      email: person?.email,
      attendance: value,
    });
  };

  const addAgenda = async () => {
    const text = window.prompt("Agenda item description?");
    if (!text?.trim()) return;
    try {
      const res = await addMeetingAgendaMutation.mutateAsync({
        meetingId: params?.id,
        text: text.trim(),
      });
      const newItem = res?.data || {
        id: `ag-${Date.now()}`,
        text: text.trim(),
        done: false,
      };
      setAgenda((prev) => [...prev, newItem]);
      toaster("Agenda item added successfully", "success");
    } catch {
      toaster("Failed to add agenda item", "error");
    }
  };

  const editAgenda = async (agendaId) => {
    const item = agenda.find((a) => a.id === agendaId);
    const text = window.prompt("Edit agenda item", item?.text || "");
    if (!text?.trim()) return;
    try {
      await updateMeetingAgendaMutation.mutateAsync({
        meetingId: params?.id,
        agendaId,
        text: text.trim(),
      });
      setAgenda((prev) =>
        prev.map((a) => (a.id === agendaId ? { ...a, text: text.trim() } : a)),
      );
      toaster("Agenda item updated", "success");
    } catch {
      toaster("Failed to update agenda item", "error");
    }
  };

  const deleteAgenda = async (agendaId) => {
    if (!window.confirm("Delete this agenda item?")) return;
    try {
      await deleteMeetingAgendaMutation.mutateAsync({
        meetingId: params?.id,
        agendaId,
      });
      setAgenda((prev) => prev.filter((a) => a.id !== agendaId));
      toaster("Agenda item deleted", "success");
    } catch {
      toaster("Failed to delete agenda item", "error");
    }
  };

  const addMinute = () => {
    const description = window.prompt("Meeting minute description?");
    if (!description?.trim()) return;
    const attachment =
      window.prompt("Attachment filename (optional)", "") || "";
    setMinutes((prev) => [
      ...prev,
      {
        id: `min-${Date.now()}`,
        description: description.trim(),
        attachment: attachment.trim() || null,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const editMinute = (id) => {
    const item = minutes.find((m) => m.id === id);
    const description = window.prompt(
      "Edit minute description",
      item?.description || "",
    );
    if (!description?.trim()) return;
    setMinutes((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, description: description.trim() } : m,
      ),
    );
  };

  const deleteMinute = (id) => {
    if (!window.confirm("Delete this minute?")) return;
    setMinutes((prev) => prev.filter((m) => m.id !== id));
  };

  const sendMinutes = () => {
    showToast(
      minutes.length
        ? `Meeting minutes sent to ${attendees.length || meeting?.expectedCount || 0} invitee(s) (UI mock).`
        : "Add a minute first.",
    );
  };

  if (isLoading) {
    return (
      <div className="admin-card p-8 text-center max-w-4xl mx-auto my-8">
        <p className="admin-text-muted">Loading meeting…</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="admin-card p-8 text-center max-w-4xl mx-auto my-8">
        <p className="admin-text font-semibold mb-2">Meeting not found</p>
        <Link
          href="/hr-dashboard/meeting"
          className="text-sm text-primaryColor dark:text-primaryColor-400"
        >
          ← Back to meetings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-24 sm:pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs admin-text-subtle">Meetings / Details</p>
          <h1 className="text-2xl font-bold admin-text mt-0.5">
            Meeting Details
          </h1>
        </div>
        <Link
          href="/hr-dashboard/meeting"
          className={`${meetingBtnOutline} h-9 px-3 gap-1.5`}
        >
          <ArrowLeft size={14} />
          Back to Meetings
        </Link>
      </div>

      {toast && (
        <div className="rounded-lg border border-secondaryColor/30 bg-secondaryColor/10 px-4 py-2 text-sm text-secondaryColor">
          {toast}
        </div>
      )}

      {/* Title + status */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold admin-text">
            {meeting?.title || "Meeting"}
          </h2>
          <p className="text-sm admin-text-muted mt-1">
            Host · {meeting?.host?.name || "Host"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MeetingStatusBadge
            status={isEnded ? "ended" : status}
          />
          {canManageRoster && !isEnded && (
            <button
              type="button"
              onClick={handleEndMeeting}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              End Meeting
            </button>
          )}
        </div>
      </div>

      {/* Info + Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="admin-card p-4 space-y-2 text-sm">
          <h3 className="text-sm font-semibold admin-text mb-3">
            Meeting Information
          </h3>
          <p>
            <span className="admin-text-muted">Type: </span>
            <span className="admin-text">
              {meeting?.meetingType || "Online Meeting"}
            </span>
          </p>
          <p>
            <span className="admin-text-muted">Date: </span>
            <span className="admin-text">
              {formatMeetingDate(meeting?.startAt)}
            </span>
          </p>
          <p>
            <span className="admin-text-muted">Time: </span>
            <span className="admin-text">
              {formatMeetingTime(meeting?.startAt, meeting?.endAt)}
            </span>
          </p>
          <p>
            <span className="admin-text-muted">Duration: </span>
            <span className="admin-text">
              {durationLabel(meeting?.startAt, meeting?.endAt)}
            </span>
          </p>
          <p>
            <span className="admin-text-muted">Host: </span>
            <span className="admin-text">{meeting?.host?.name}</span>
          </p>
          {meeting?.companyName && (
            <p>
              <span className="admin-text-muted">Company: </span>
              <span className="admin-text">{meeting.companyName}</span>
            </p>
          )}
          {meeting?.address && (
            <p>
              <span className="admin-text-muted">Address: </span>
              <span className="admin-text">{meeting.address}</span>
            </p>
          )}
          {meeting?.roomName && (
            <p>
              <span className="admin-text-muted">Room: </span>
              <span className="admin-text">{meeting.roomName}</span>
            </p>
          )}
        </div>

        <div className="admin-card p-4 flex flex-col">
          <h3 className="text-sm font-semibold admin-text mb-3">
            Location Details
          </h3>
          {meeting?.meetUrl ? (
            <>
              <p className="text-xs admin-text-muted break-all mb-4 flex-1">
                {meeting.meetUrl}
              </p>
              <button
                type="button"
                onClick={handleJoin}
                className={`${meetingBtnSolid} h-10 px-4 gap-2 self-start`}
              >
                <Video size={15} />
                Join Meeting
                <ExternalLink size={13} />
              </button>
            </>
          ) : (
            <p className="text-sm admin-text-muted flex-1">
              {meeting?.roomName ||
                meeting?.address ||
                "No online meeting link."}
            </p>
          )}
          {!isEnded && (
            <button
              type="button"
              onClick={() =>
                router.push(`/hr-dashboard/meeting/${meeting?.id}/live`)
              }
              className={`${meetingBtnOutline} h-9 px-3 mt-3 self-start`}
            >
              Open live workspace
            </button>
          )}
        </div>
      </div>

      {/* Participants + attendance filter & search */}
      <div className="admin-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h3 className="text-sm font-semibold admin-text mr-1">Participants</h3>
            {/* Total Filter Pill */}
            <button
              type="button"
              onClick={() => setAttendanceFilter("all")}
              title="Show all participants"
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                attendanceFilter === "all"
                  ? `${pc.border} ${pc.bg} text-white shadow-sm`
                  : "border-gray-200 dark:border-gray-700 admin-text hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Total: {attendance.total || meeting?.expectedCount || 0}
            </button>
            {/* Present Filter Pill */}
            <button
              type="button"
              onClick={() =>
                setAttendanceFilter((prev) => (prev === "present" ? "all" : "present"))
              }
              title="Filter by Present"
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                attendanceFilter === "present"
                  ? "border-secondaryColor bg-secondaryColor text-white shadow-sm"
                  : "border-secondaryColor/30 bg-secondaryColor/10 text-secondaryColor hover:bg-secondaryColor/20"
              }`}
            >
              Present: {attendance.present}
            </button>
            {/* Late Filter Pill */}
            <button
              type="button"
              onClick={() =>
                setAttendanceFilter((prev) => (prev === "late" ? "all" : "late"))
              }
              title="Filter by Late"
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                attendanceFilter === "late"
                  ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                  : "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
              }`}
            >
              Late: {attendance.late}
            </button>
            {/* Absent Filter Pill */}
            <button
              type="button"
              onClick={() =>
                setAttendanceFilter((prev) => (prev === "absent" ? "all" : "absent"))
              }
              title="Filter by Absent"
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                attendanceFilter === "absent"
                  ? "border-red-500 bg-red-500 text-white shadow-sm"
                  : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
              }`}
            >
              Absent: {attendance.absent}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-60 md:w-64">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search participants..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 admin-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primaryColor)]/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {filteredAttendees.length === 0 ? (
          <p className="text-sm admin-text-muted py-6 text-center">
            {searchQuery || attendanceFilter !== "all"
              ? "No participants match the selected filter."
              : "No participants invited yet."}
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredAttendees.map((p) => {
              const isPresentOrLate =
                p.attendance === "present" || p.attendance === "late";
              const presentTime =
                isPresentOrLate && (p.joinedAt || base?.startAt)
                  ? formatTime12(p.joinedAt || base?.startAt)
                  : null;

              return (
                <li
                  key={p.employeeId || p.id || p.email}
                  className="flex items-center gap-2.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5 min-w-0 bg-white dark:bg-gray-800/40"
                >
                  <div
                    className={`w-9 h-9 rounded-full ${pc.bgSofter} flex items-center justify-center text-[11px] font-bold ${pc.text} shrink-0`}
                  >
                    {(p.name || "?")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold admin-text truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] admin-text-subtle truncate">
                      {p.email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                        p.attendance === "present"
                          ? "bg-secondaryColor/15 text-secondaryColor border-secondaryColor/30"
                          : p.attendance === "late"
                          ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700"
                          : p.attendance === "absent" || status === "ended"
                          ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400"
                          : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {p.attendance === "present"
                        ? "Present (On-Time)"
                        : p.attendance === "late"
                        ? "Late"
                        : p.attendance === "absent" || status === "ended"
                        ? "Absent"
                        : "Pending"}
                    </span>
                    {presentTime && (
                      <span
                        title={`Joined at ${presentTime}`}
                        className="text-[10px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1"
                      >
                        <Clock size={10} className="text-secondaryColor shrink-0" />
                        <span>{presentTime}</span>
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Agenda table */}
      <div className="admin-card overflow-hidden">
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold admin-text">Meeting Agenda</h3>
          <button
            type="button"
            onClick={addAgenda}
            className={`${meetingBtnSolid} h-8 px-3 gap-1`}
          >
            <Plus size={13} />
            Add Agenda Item
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-primaryColor)] text-white text-left text-xs uppercase tracking-wide">
                <th className="px-4 py-2.5 font-semibold">Description</th>
                <th className="px-4 py-2.5 font-semibold w-36">Created At</th>
                <th className="px-4 py-2.5 font-semibold w-28 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {agenda.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center admin-text-muted"
                  >
                    No agenda items yet.
                  </td>
                </tr>
              ) : (
                agenda.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  >
                    <td className="px-4 py-2.5 admin-text">{item.text}</td>
                    <td className="px-4 py-2.5 admin-text-muted text-xs">
                      {formatShortDate(
                        item.createdAt || meeting?.startAt,
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => editAgenda(item.id)}
                          className={`p-1.5 rounded-md hover:bg-[var(--color-primaryColor)]/10 ${pc.text}`}
                          aria-label="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAgenda(item.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Minutes table */}
      <div className="admin-card overflow-hidden">
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold admin-text">Meeting Minutes</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={sendMinutes}
              className={`${meetingBtnSolid} h-8 px-3 gap-1`}
            >
              <Send size={13} />
              Send Meeting Minute
            </button>
            <button
              type="button"
              onClick={addMinute}
              className={`${meetingBtnOutline} h-8 px-3 gap-1`}
            >
              <Plus size={13} />
              Add Minute
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-primaryColor)] text-white text-left text-xs uppercase tracking-wide">
                <th className="px-4 py-2.5 font-semibold">Description</th>
                <th className="px-4 py-2.5 font-semibold">Attachments</th>
                <th className="px-4 py-2.5 font-semibold w-36">Created At</th>
                <th className="px-4 py-2.5 font-semibold w-28 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {minutes.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center admin-text-muted"
                  >
                    No meeting minutes yet.
                  </td>
                </tr>
              ) : (
                minutes.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  >
                    <td className="px-4 py-2.5 admin-text">
                      {item.description}
                    </td>
                    <td className="px-4 py-2.5">
                      {item.attachment ? (
                        <span className={`text-xs font-medium ${pc.text}`}>
                          {item.attachment}
                        </span>
                      ) : (
                        <span className="text-xs admin-text-subtle">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 admin-text-muted text-xs">
                      {formatShortDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => editMinute(item.id)}
                          className={`p-1.5 rounded-md hover:bg-[var(--color-primaryColor)]/10 ${pc.text}`}
                          aria-label="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMinute(item.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes — our feature */}
      {canTakeNotes && (
        <PersonalNotesPanel
          meetingId={meeting?.id}
          userId={userId}
          title="Meeting notes"
          hint="Private to you — also available in live workspace."
          minRows={6}
        />
      )}

      {/* Mobile sticky join */}
      {!isEnded && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 dark:border-gray-700 bg-theme-light/95 dark:bg-theme-dark/95 backdrop-blur px-4 py-3">
          <button
            type="button"
            onClick={handleJoin}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primaryColor)] hover:bg-[var(--color-primaryColor-700)] text-white font-semibold py-3 text-sm"
          >
            <Video size={16} />
            Join Meeting
          </button>
        </div>
      )}
    </div>
  );
}
