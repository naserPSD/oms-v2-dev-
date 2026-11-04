"use client";

import ButtonTw from "@/components/ui/ButtonTw";
import { TabItemTw } from "@/components/ui/TabItemTw";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMeetingQueryApi } from "@/hooks/queryApi/useMeetingQueryApi";
import {
  ArrowLeft,
  ClipboardList,
  ExternalLink,
  StickyNote,
  Users,
  Video,
} from "lucide-react";
import ActionItemsPanel from "./components/ActionItemsPanel";
import AgendaChecklist from "./components/AgendaChecklist";
import MeetingStatusBadge from "./components/MeetingStatusBadge";
import PersonalNotesPanel from "./components/PersonalNotesPanel";
import RosterPanel from "./components/RosterPanel";
import SlideDrawer from "./components/SlideDrawer";
import useMeetingAccess from "./hooks/useMeetingAccess";
import {
  deriveMeetingStatus,
  formatMeetingTime,
  computeOnTimeAttendance,
} from "./data/mockMeetings";
import Swal from "sweetalert2";
import { toaster } from "@/utils/helpers";
import { openMeetWindow, closeMeetWindow } from "./utils/meetWindowManager";

const MOBILE_TABS = [
  { key: "video", label: "Video", icon: Video },
  { key: "roster", label: "Roster", icon: Users },
  { key: "notes", label: "Notes", icon: StickyNote },
  { key: "agenda", label: "Agenda", icon: ClipboardList },
];

export default function MeetingLiveWorkspace() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    useMeetingByIdQuery,
    updateMeetingAttendanceMutation,
    updateMeetingAgendaMutation,
    updateMeetingStatusMutation,
  } = useMeetingQueryApi({});
  const { data: meetingRes, isLoading } = useMeetingByIdQuery(params?.id);
  const base = meetingRes?.data;
  const status = deriveMeetingStatus(base);
  const {
    canManageRoster,
    canTakeNotes,
    userId,
    displayName,
    user,
  } = useMeetingAccess();

  const [agenda, setAgenda] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [meetUrl, setMeetUrl] = useState("");
  const [mobileTab, setMobileTab] = useState("video");
  const [rosterDrawer, setRosterDrawer] = useState(false);
  const [notesDrawer, setNotesDrawer] = useState(false);

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

  // Redirect to meetings page if meeting transitions to COMPLETED / ended
  useEffect(() => {
    if (base && (base.listStatus === "COMPLETED" || status === "ended")) {
      closeMeetWindow(base.id);
      toaster("Meeting has ended.", "info");
      router.push("/hr-dashboard/meeting");
    }
  }, [base?.listStatus, status, router, base?.id]);

  useEffect(() => {
    if (!base) return;
    setAgenda(base.agenda || []);
    setAttendees(base.attendees || []);
    setActionItems(base.actionItems || []);
    setMeetUrl(base.meetUrl || "");

    // Auto-record current attendee attendance based on on-time rule
    if (
      base.attendees?.length &&
      base.listStatus !== "COMPLETED" &&
      status !== "ended"
    ) {
      const match = findMyAttendeeRecord(base.attendees);
      if (match && (!match.attendance || match.attendance === "absent")) {
        const autoStatus = computeOnTimeAttendance(base.startAt, Date.now(), 5);
        console.log(`[AutoAttendance] Marking ${match.name} (id=${match.id}) as ${autoStatus}`);
        updateMeetingAttendanceMutation.mutate({
          id: base.id,
          employeeId: match.employeeId ? Number(match.employeeId) : undefined,
          attendeeId: match.id,
          email: match.email,
          attendance: autoStatus,
        });
        setAttendees((prev) =>
          prev.map((a) =>
            (match.employeeId && a.employeeId === match.employeeId) ||
            a.id === match.id ||
            (match.email &&
              a.email &&
              a.email.toLowerCase().trim() ===
                match.email.toLowerCase().trim())
              ? { ...a, attendance: autoStatus }
              : a,
          ),
        );
      } else if (!match) {
        console.log(`[AutoAttendance] Could not find attendee record for userId=${userId}, email=${userEmail}, name=${userDisplayName}`);
      }
    }
  }, [base, userId, user]);

  const showRoster = canManageRoster;

  const meeting = useMemo(
    () =>
      base
        ? { ...base, agenda, attendees, actionItems, meetUrl: meetUrl || base.meetUrl }
        : null,
    [base, agenda, attendees, actionItems, meetUrl],
  );

  if (isLoading) {
    return (
      <div className="admin-card p-8 text-center">
        <p className="admin-text-muted">Loading meeting…</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="admin-card p-8 text-center">
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

  const toggleAgenda = async (id) => {
    const item = agenda.find((a) => a.id === id);
    const nextDone = !item?.done;
    setAgenda((prev) =>
      prev.map((a) => (a.id === id ? { ...a, done: nextDone } : a)),
    );
    try {
      await updateMeetingAgendaMutation.mutateAsync({
        meetingId: params?.id,
        agendaId: id,
        isDone: nextDone,
      });
    } catch {
      // rollback
      setAgenda((prev) =>
        prev.map((a) => (a.id === id ? { ...a, done: !nextDone } : a)),
      );
    }
  };

  const markAttendance = (employeeId, value, person) => {
    if (!meeting) return;
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
    if (!canManageRoster && !isSelf) return;

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

  const toggleAction = (id) => {
    setActionItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, done: !a.done } : a)),
    );
  };

  const addAction = () => {
    const title = window.prompt("Action item title?");
    if (!title?.trim()) return;
    setActionItems((prev) => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        title: title.trim(),
        assignee: displayName,
        dueDate: "",
        done: false,
      },
    ]);
  };

  const openMeet = () => {
    const url = meetUrl || meeting.meetUrl;
    if (!url) return;

    // Mark attendance when user clicks Open Meet
    if (
      meeting?.id &&
      meeting?.listStatus !== "COMPLETED" &&
      status !== "ended"
    ) {
      const match = findMyAttendeeRecord(attendees);
      if (match && (!match.attendance || match.attendance === "absent")) {
        const autoStatus = computeOnTimeAttendance(meeting.startAt, Date.now(), 5);
        console.log(`[OpenMeet] Marking ${match.name} as ${autoStatus}`);
        updateMeetingAttendanceMutation.mutate({
          id: meeting.id,
          employeeId: match.employeeId ? Number(match.employeeId) : undefined,
          attendeeId: match.id,
          email: match.email,
          attendance: autoStatus,
        });
        setAttendees((prev) =>
          prev.map((a) =>
            (match.employeeId && a.employeeId === match.employeeId) ||
            a.id === match.id ||
            (match.email &&
              a.email &&
              a.email.toLowerCase().trim() ===
                match.email.toLowerCase().trim())
              ? { ...a, attendance: autoStatus }
              : a,
          ),
        );
      }
    }

    openMeetWindow(url, meeting?.id);
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
      toaster(`Meeting “${meetingTitle}” has ended.`, "success");
      router.push("/hr-dashboard/meeting");
    } catch (err) {
      toaster(
        err?.response?.data?.message || "Could not end meeting.",
        "error",
      );
    }
  };

  const centerPanel = (
    <div className="space-y-4">
      <div className="admin-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <MeetingStatusBadge status={status} />
              <span className="text-xs admin-text-muted">
                {formatMeetingTime(meeting?.startAt, meeting?.endAt)}
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold admin-text truncate">
              {meeting?.title || "Meeting"}
            </h2>
            <p className="text-xs admin-text-muted mt-0.5">
              Host · {meeting?.host?.name || "Host"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ButtonTw type="button" onClick={openMeet}>
              <span className="inline-flex items-center gap-1.5">
                <Video size={14} />
                Open Meet
                <ExternalLink size={12} />
              </span>
            </ButtonTw>
            {canManageRoster && status !== "ended" && (
              <button
                type="button"
                onClick={handleEndMeeting}
                className="inline-flex h-9 items-center justify-center px-3.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold whitespace-nowrap transition-colors shadow-sm"
              >
                End Meeting
              </button>
            )}
          </div>
        </div>

        {meeting.meetUrl && (
          <p className="mt-3 text-xs admin-text-subtle break-all">
            {meeting.meetUrl}
          </p>
        )}
      </div>

      <div className="admin-card p-4">
        <h3 className="text-sm font-semibold admin-text mb-3 flex items-center gap-2">
          <ClipboardList
            size={15}
            className="text-primaryColor dark:text-primaryColor-400"
          />
          Agenda checklist
        </h3>
        <AgendaChecklist
          agenda={agenda}
          editable={status !== "ended"}
          onToggle={toggleAgenda}
        />
      </div>
    </div>
  );

  const notesColumn = canTakeNotes ? (
    <div className="space-y-4 h-full">
      <PersonalNotesPanel
        meetingId={meeting.id}
        userId={userId}
        title="Live notes"
        hint="Private to you — auto-saved on this device."
        minRows={12}
      />
      <ActionItemsPanel
        items={actionItems}
        onToggle={toggleAction}
        onAdd={status !== "ended" ? addAction : undefined}
      />
    </div>
  ) : null;

  const rosterColumn = showRoster ? (
    <RosterPanel
      attendees={attendees}
      canMark={canManageRoster && status === "live"}
      onMark={markAttendance}
    />
  ) : null;

  return (
    <div className="space-y-4 pb-24 md:pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/hr-dashboard/meeting"
          className="inline-flex items-center gap-1.5 text-sm admin-text-muted hover:text-primaryColor dark:hover:text-primaryColor-400"
        >
          <ArrowLeft size={14} />
          Back to Meetings
        </Link>

        <div className="hidden md:flex lg:hidden items-center gap-2">
          {showRoster && (
            <button
              type="button"
              onClick={() => setRosterDrawer(true)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold admin-text hover:border-primaryColor/40"
            >
              Roster
            </button>
          )}
          {canTakeNotes && (
            <button
              type="button"
              onClick={() => setNotesDrawer(true)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold admin-text hover:border-primaryColor/40"
            >
              Notes
            </button>
          )}
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-start">
        {showRoster ? <div className="lg:col-span-3">{rosterColumn}</div> : null}
        <div className={showRoster ? "lg:col-span-5" : "lg:col-span-8"}>
          {centerPanel}
        </div>
        <div className="lg:col-span-4">{notesColumn}</div>
      </div>

      <div className="hidden md:block lg:hidden">{centerPanel}</div>

      <div className="md:hidden">
        <div className="flex items-center overflow-x-auto border-b border-gray-200 dark:border-gray-700 mb-3">
          {MOBILE_TABS.filter((t) => {
            if (t.key === "roster") return showRoster;
            if (t.key === "notes") return canTakeNotes;
            return true;
          }).map((tab) => {
            const Icon = tab.icon;
            return (
              <TabItemTw
                key={tab.key}
                active={mobileTab === tab.key}
                onClick={() => setMobileTab(tab.key)}
              >
                <Icon size={13} />
                {tab.label}
              </TabItemTw>
            );
          })}
        </div>

        {mobileTab === "video" && centerPanel}
        {mobileTab === "roster" && showRoster && rosterColumn}
        {mobileTab === "notes" && notesColumn}
        {mobileTab === "agenda" && (
          <div className="admin-card p-4">
            <AgendaChecklist
              agenda={agenda}
              editable={status !== "ended"}
              onToggle={toggleAgenda}
            />
          </div>
        )}
      </div>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 dark:border-gray-700 bg-theme-light/95 dark:bg-theme-dark/95 backdrop-blur px-4 py-3">
        <button
          type="button"
          onClick={openMeet}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primaryColor hover:bg-primaryColor-700 text-white font-semibold py-3 text-sm"
        >
          <Video size={16} />
          Join with Google Meet
        </button>
      </div>

      {showRoster && (
        <SlideDrawer
          open={rosterDrawer}
          onClose={() => setRosterDrawer(false)}
          title="Roster"
          side="left"
        >
          {rosterColumn}
        </SlideDrawer>
      )}
      {canTakeNotes && (
        <SlideDrawer
          open={notesDrawer}
          onClose={() => setNotesDrawer(false)}
          title="Notes & actions"
          side="right"
        >
          {notesColumn}
        </SlideDrawer>
      )}
    </div>
  );
}
