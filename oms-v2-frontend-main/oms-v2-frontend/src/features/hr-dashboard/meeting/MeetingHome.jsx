"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import ButtonTw from "@/components/ui/ButtonTw";
import { useMeetingQueryApi } from "@/hooks/queryApi/useMeetingQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import TodayAgendaPanel from "./components/TodayAgendaPanel";
import MeetingQuickActions from "./components/MeetingQuickActions";
import MeetingMiniCalendar from "./components/MeetingMiniCalendar";
import MeetingInvitations from "./components/MeetingInvitations";
import MeetingMinutesList from "./components/MeetingMinutesList";
import ScheduleMeetingModal from "./components/ScheduleMeetingModal";
import JoinMeetingModal from "./components/JoinMeetingModal";
import ChangeAttendanceModal from "./components/ChangeAttendanceModal";
import useMeetingAccess from "./hooks/useMeetingAccess";
import {
  deriveMeetingStatus,
  isSameDay,
  getTodayMeetingOccurrence,
  isTodayMeetingFinished,
  canModifyMeeting,
  isMeetingRescheduleLocked,
} from "./data/mockMeetings";
import { isOnlineMeetingType } from "./utils/googleMeet";
import Swal from "sweetalert2";
import { toaster } from "@/utils/helpers";
import { openMeetWindow, closeMeetWindow } from "./utils/meetWindowManager";

function openMeetAndLive(router, meeting) {
  if (meeting?.meetUrl) {
    openMeetWindow(meeting.meetUrl, meeting.id);
  }
  router.push(`/hr-dashboard/meeting/${meeting.id}/live`);
}

export default function MeetingHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const {
    firstName,
    avatarUrl,
    canSchedule,
    canStart,
    canReschedule,
    canJoin,
    canSeeMeeting,
    isAdmin,
    userId,
  } = useMeetingAccess();

  const {
    useMeetingsQuery,
    useGoogleCalendarStatusQuery,
    createOrUpdateMeetingMutation,
    startMeetingMutation,
    updateMeetingStatusMutation,
    deleteMeetingMutation,
    connectGoogleCalendarMutation,
    sendMeetingInvitationMutation,
    updateMeetingAttendanceMutation,
    useMeetingInvitationsQuery,
    respondMeetingInvitationMutation,
    useMeetingParticipantsQuery,
  } = useMeetingQueryApi({ handleClose: () => setShowSchedule(false) });

  const { data: participantsRes } = useMeetingParticipantsQuery();
  const { useHrEmployeeQuery } = useHrQueryApi({});
  const { data: employeeRes } = useHrEmployeeQuery({
    page: 1,
    limit: 500,
  });

  const employees = useMemo(() => {
    const fromApi = participantsRes?.data ?? [];
    if (Array.isArray(fromApi) && fromApi.length > 0) {
      return fromApi;
    }

    const rows = employeeRes?.data ?? employeeRes?.list ?? [];
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
  }, [participantsRes, employeeRes]);

  const currentEmployeeId = useMemo(() => {
    if (!userId) return null;
    const match = employees.find((e) => Number(e.userId) === Number(userId));
    return match?.id ?? null;
  }, [employees, userId]);

  const [historyTab, setHistoryTab] = useState("today");
  const [historyPage, setHistoryPage] = useState(1);
  const {
    data: invitationsRes,
    isLoading: invitationsLoading,
    refetch: refetchInvitations,
  } = useMeetingInvitationsQuery();
  const invitations = useMemo(
    () => (invitationsRes?.data ?? []).filter(Boolean),
    [invitationsRes],
  );
  const [showSchedule, setShowSchedule] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [showJoin, setShowJoin] = useState(false);
  const [attendanceMeeting, setAttendanceMeeting] = useState(null);
  const [toast, setToast] = useState("");
  const [nowTick, setNowTick] = useState(() => Date.now());

  const { data: todayRes, refetch: refetchToday } = useMeetingsQuery({
    tab: "today",
    page: 1,
    limit: 50,
  });

  const {
    data: historyRes,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useMeetingsQuery({
    tab: historyTab,
    page: historyPage,
    limit: 10,
  });

  const { data: googleStatusRes, refetch: refetchGoogleStatus } =
    useGoogleCalendarStatusQuery({ enabled: canSchedule });

  const googleConnected = Boolean(googleStatusRes?.data?.connected);
  const calendarApiReady = Boolean(googleStatusRes?.data?.calendarApiReady);
  const enableApiUrl =
    googleStatusRes?.data?.enableApiUrl ||
    'https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview?project=377729302416';

  const handleSendInvitation = async (m) => {
    if (!canSchedule) {
      toaster("Only admin can send meeting invitations.", "warning");
      showToast("Only admin can send meeting invitations.");
      return;
    }

    const isExpired =
      new Date(m.endAt || m.startAt).getTime() < Date.now() ||
      m.status === "ended" ||
      m.listStatus === "COMPLETED";
    if (isExpired) {
      await Swal.fire({
        title: "Meeting Expired",
        text: "Cannot send invitation for an expired meeting.",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          popup: "swal-popup",
          confirmButton: "swal-confirm-btn",
        },
        buttonsStyling: false,
      });
      return;
    }

    const meetingTitle = m?.title || "Meeting";
    const confirmResult = await Swal.fire({
      title: "Are you sure to send invitation?",
      text: `Do you want to send meeting invitation emails to attendees of "${meetingTitle}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, send it!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal-popup",
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
      },
      buttonsStyling: false,
    });

    if (!confirmResult.isConfirmed) return;

    Swal.fire({
      title: "Sending Invitations...",
      text: "Please wait while meeting invitation emails are being sent.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await sendMeetingInvitationMutation.mutateAsync({
        id: m.id,
      });
      const sent = res?.data?.sent ?? 0;
      const failed = res?.data?.failed?.length ?? 0;
      if (sent > 0) {
        const msg = failed
          ? `Invitation sent to ${sent} attendee(s); ${failed} failed.`
          : `Meeting invitation email sent to ${sent} attendee(s)!`;
        toaster(msg, "success");
        showToast(msg);
        await Swal.fire({
          title: "Invitation Sent!",
          text: msg,
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            popup: "swal-popup",
            confirmButton: "swal-confirm-btn",
          },
          buttonsStyling: false,
        });
      } else {
        const msg =
          res?.message || "No valid attendee emails found to send invitations.";
        toaster(msg, "warning");
        showToast(msg);
        await Swal.fire({
          title: "No Invitations Sent",
          text: msg,
          icon: "warning",
          confirmButtonText: "OK",
          customClass: {
            popup: "swal-popup",
            confirmButton: "swal-confirm-btn",
          },
          buttonsStyling: false,
        });
      }
      refreshMeetings();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        "Could not send invitation emails. Please check your email configuration.";
      toaster(errMsg, "error");
      showToast(errMsg);
      await Swal.fire({
        title: "Failed to Send Invitation",
        text: errMsg,
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: "swal-popup",
          confirmButton: "swal-confirm-btn",
        },
        buttonsStyling: false,
      });
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3600);
  };

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (searchParams.get("googleCalendar") === "connected") {
      setToast("Google Calendar connected. You can create real Meet links now.");
      refetchGoogleStatus();
      router.replace("/hr-dashboard/meeting");
    }
  }, [searchParams, refetchGoogleStatus, router]);

  const meetings = useMemo(
    () => (todayRes?.data ?? []).filter(Boolean),
    [todayRes],
  );

  const historyMeetings = useMemo(
    () => (historyRes?.data ?? []).filter(Boolean),
    [historyRes],
  );

  const visibleMeetings = useMemo(
    () => meetings.filter((m) => m && canSeeMeeting(m)),
    [meetings, canSeeMeeting],
  );

  const todayMeetings = useMemo(() => {
    void nowTick;
    const now = new Date();

    return visibleMeetings
      .map((m) => {
        const occ = getTodayMeetingOccurrence(m, now);
        if (!occ) return null;

        // "jegula sesh segula thakbe na" — exclude completed / past meetings
        if (isTodayMeetingFinished(m, now)) return null;

        return {
          ...m,
          startAt: occ.startAt.toISOString(),
          endAt: occ.endAt.toISOString(),
          isRepeatOccurrence: occ.isRepeat,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
  }, [visibleMeetings, nowTick]);

  const liveMeeting = useMemo(
    () => todayMeetings.find((m) => deriveMeetingStatus(m) === "live") || null,
    [todayMeetings],
  );

  const startCandidate = useMemo(() => {
    if (liveMeeting) return liveMeeting;
    return (
      todayMeetings.find((m) => deriveMeetingStatus(m) === "upcoming") || null
    );
  }, [liveMeeting, todayMeetings]);

  const meetingDates = useMemo(
    () => visibleMeetings.map((m) => m.startAt),
    [visibleMeetings],
  );

  const refreshMeetings = async () => {
    await queryClient.invalidateQueries({ queryKey: ["meetings"] });
    await queryClient.refetchQueries({ queryKey: ["meetings"] });
    await Promise.all([
      refetchToday(),
      refetchHistory(),
      refetchInvitations(),
    ]);
  };

  const startOnlineMeeting = async (meeting) => {
    if (!meeting) return;
    try {
      let next = meeting;
      const meetingTitle = next?.title || "Meeting";
      if (isOnlineMeetingType(next?.meetingType || "Online Meeting") && !next?.meetUrl) {
        const res = await startMeetingMutation.mutateAsync(meeting.id);
        next = res?.data ?? next;
        showToast(`Google Meet link ready for “${next?.title || meetingTitle}”.`);
      } else {
        showToast(`Starting “${meetingTitle}”.`);
      }
      openMeetAndLive(router, next);
      refreshMeetings();
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === "GOOGLE_CALENDAR_NOT_CONNECTED") {
        showToast("Connect Google Calendar first to start online meetings.");
      } else {
        showToast(err?.response?.data?.message || "Could not start meeting.");
      }
    }
  };

  const handleQuickAction = (key) => {
    if (key === "schedule") {
      if (!canSchedule) {
        showToast("Only admin can create meetings.");
        return;
      }
      setEditingMeeting(null);
      setShowSchedule(true);
      return;
    }

    if (key === "join") {
      if (!canJoin) return;
      if (liveMeeting) {
        openMeetAndLive(router, liveMeeting);
        return;
      }
      setShowJoin(true);
      return;
    }

    if (key === "start") {
      if (!canStart) {
        showToast("Only admin can start meetings.");
        return;
      }
      if (startCandidate) {
        startOnlineMeeting(startCandidate);
        return;
      }
      setEditingMeeting(null);
      setShowSchedule(true);
      showToast("No meeting to start — create one first.");
    }
  };

  const handleCreateMeeting = async (payload) => {
    const isOnline = payload.meetingType === "Online Meeting";
    const isEdit = Boolean(payload.id);

    let startAtIso = undefined;
    let endAtIso = undefined;
    if (payload.date && payload.startTime) {
      const s = new Date(`${payload.date}T${payload.startTime}:00`);
      if (!isNaN(s.getTime())) startAtIso = s.toISOString();
    }
    if (payload.date && payload.endTime) {
      const e = new Date(`${payload.date}T${payload.endTime}:00`);
      if (!isNaN(e.getTime())) endAtIso = e.toISOString();
    }

    const body = {
      id: payload.id ? Number(payload.id) : undefined,
      title: payload.title,
      hostId: Number(payload.hostId),
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      startAt: startAtIso,
      endAt: endAtIso,
      timeZone:
        Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka",
      meetingType: payload.meetingType,
      roomName: payload.roomName || undefined,
      companyName: payload.companyName || undefined,
      clientName: payload.clientName || undefined,
      address: payload.address || undefined,
      repeat: payload.repeat,
      repeatDays: payload.repeatDays,
      agenda: payload.agenda || [],
      invitees: (payload.invitees || []).map((e) => ({
        employeeId: e.id,
        userId: e.userId,
        name: e.name,
        email: e.email,
        role: e.role,
      })),
      createGoogleMeet: isOnline && !payload.meetUrl && Boolean(googleConnected),
      meetUrl: payload.meetUrl || undefined,
    };

    try {
      const res = await createOrUpdateMeetingMutation.mutateAsync(body);
      const created = res?.data;
      const successMsg = isEdit
        ? `Meeting “${payload.title}” updated successfully.`
        : created?.meetUrl
          ? `“${payload.title}” created with Google Meet link.`
          : `Meeting “${payload.title}” created successfully.`;
      toaster(successMsg, "success");
      showToast(successMsg);
      await refreshMeetings();
      setShowSchedule(false);
      setEditingMeeting(null);
    } catch (err) {
      const code = err?.response?.data?.code;
      const status = err?.response?.status;
      if (!err?.response || err?.code === "ERR_NETWORK" || err?.message?.includes("Network Error")) {
        showToast("Backend offline — wait for API on port 4000, then try again.");
      } else if (err?.code === "OFFLINE_QUEUED") {
        showToast(err.message || "Offline — meeting was not saved.");
      } else if (
        code === "GOOGLE_CALENDAR_API_DISABLED" ||
        code === "GOOGLE_CALENDAR_NOT_CONNECTED" ||
        /Calendar API|Reconnect Google/i.test(
          String(err?.response?.data?.message || ""),
        )
      ) {
        const apiUrl = err?.response?.data?.enableApiUrl || enableApiUrl;
        showToast(
          err?.response?.data?.message ||
            "Enable Google Calendar API to create Meet links.",
        );
        if (apiUrl && typeof window !== "undefined") {
          // keep user logged in; open console so they can enable API
          console.info("Enable Calendar API:", apiUrl);
        }
      } else if (code === "GOOGLE_MEET_CREATE_FAILED") {
        showToast(
          err?.response?.data?.message ||
            "Google Meet link could not be created. Check Calendar connect / API.",
        );
      } else if (status === 500) {
        showToast(
          err?.response?.data?.message ||
            "Server error saving meeting. Check API terminal logs.",
        );
      } else {
        const msg = err?.response?.data?.message;
        showToast(
          typeof msg === "string"
            ? msg
            : msg
              ? JSON.stringify(msg)
              : "Could not save meeting.",
        );
      }
      throw err;
    }
  };

  const handleEndMeeting = async (m) => {
    if (!m) return;
    if (!canSchedule) {
      showToast("Only admin can end meetings.");
      return;
    }
    const meetingTitle = m?.title || "Meeting";
    const confirmResult = await Swal.fire({
      title: "Are you sure to end this meeting?",
      text: `Do you want to end "${meetingTitle}" now?`,
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
        id: m.id,
        listStatus: "COMPLETED",
      });
      closeMeetWindow(m.id);
      toaster(`Meeting “${meetingTitle}” has been ended.`, "success");
      showToast(`Ended “${meetingTitle}”.`);
      refreshMeetings();
      await Swal.fire({
        title: "Meeting Ended!",
        text: `“${meetingTitle}” is now completed.`,
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          popup: "swal-popup",
          confirmButton: "swal-confirm-btn",
        },
        buttonsStyling: false,
      });
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Could not end meeting.";
      toaster(errMsg, "error");
      showToast(errMsg);
    }
  };

  return (
    <div className="pt-3 sm:pt-5 space-y-6">
      {toast && (
        <div className="rounded-lg border border-secondaryColor/30 bg-secondaryColor/10 dark:bg-secondaryColor/15 px-4 py-2.5 text-sm text-secondaryColor">
          {toast}
        </div>
      )}

      {canSchedule && !googleConnected && (
        <div className="rounded-lg border border-amber-300/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm admin-text">
            Connect Google Calendar to generate real Google Meet links for online
            meetings.
          </p>
          <ButtonTw
            variant="blue"
            size="sm"
            disabled={connectGoogleCalendarMutation.isPending}
            onClick={() => connectGoogleCalendarMutation.mutate()}
          >
            Connect Google Calendar
          </ButtonTw>
        </div>
      )}

      {canSchedule && googleConnected && !calendarApiReady && (() => {
        const detail = googleStatusRes?.data?.detail || "";
        const isAuthError =
          googleStatusRes?.data?.needsReconnect ||
          /invalid authentication credentials|Expected OAuth 2|invalid_grant|unauthorized|session expired/i.test(
            detail,
          );

        if (isAuthError) {
          return (
            <div className="rounded-lg border border-amber-300/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[260px]">
                <p className="text-sm admin-text font-semibold text-amber-900 dark:text-amber-200">
                  Google Calendar session has expired or requires re-authentication.
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1">
                  Please click below to reconnect Google Calendar so online meetings can create Meet links.
                </p>
                {detail && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-mono">
                    {detail}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ButtonTw
                  variant="blue"
                  size="sm"
                  disabled={connectGoogleCalendarMutation.isPending}
                  onClick={() => connectGoogleCalendarMutation.mutate()}
                >
                  Reconnect Google Calendar
                </ButtonTw>
              </div>
            </div>
          );
        }

        return (
          <div className="rounded-lg border border-amber-300/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[260px]">
              <p className="text-sm admin-text">
                Google is connected, but <strong>Calendar API is disabled</strong> —
                online meetings cannot create Meet links until you enable it.
              </p>
              {detail && (
                <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1 font-mono">
                  {detail}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  refetchGoogleStatus();
                  toaster("Checking Google Calendar status...", "info");
                }}
                className="inline-flex h-8 items-center justify-center px-3 rounded-md border border-amber-400 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              >
                Re-check Status
              </button>
              <ButtonTw
                variant="blue"
                size="sm"
                disabled={connectGoogleCalendarMutation.isPending}
                onClick={() => connectGoogleCalendarMutation.mutate()}
              >
                Reconnect
              </ButtonTw>
              <a
                href={enableApiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <ButtonTw variant="blue" size="sm">
                  Enable Calendar API
                </ButtonTw>
              </a>
            </div>
          </div>
        );
      })()}

      {!isAdmin && (
        <div className="rounded-lg border border-primaryColor/20 bg-primaryColor/5 dark:bg-primaryColor/10 px-4 py-2.5 text-sm admin-text">
          You’re signed in as an employee — you can view your meetings, join,
          and take private notes. Only admin can create or start meetings.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 min-h-0">
          <TodayAgendaPanel
            firstName={firstName}
            avatarUrl={avatarUrl}
            meetings={todayMeetings}
            canReschedule={canSchedule ? canReschedule : () => false}
            canSendInvite={canSchedule}
            sendingInviteId={
              sendMeetingInvitationMutation.isPending
                ? sendMeetingInvitationMutation.variables?.id
                : null
            }
            onReschedule={(m) => {
              if (isMeetingRescheduleLocked(m)) {
                toaster(
                  "Meeting time cannot be changed within 10 minutes of start time or while in progress.",
                  "warning",
                );
                return;
              }
              if (!canSchedule || !canReschedule(m)) {
                showToast("Only admin can reschedule meetings.");
                return;
              }
              setEditingMeeting(m);
              setShowSchedule(true);
            }}
            onChangeAttendance={(m) => {
              setAttendanceMeeting(m);
            }}
            onSendInvite={handleSendInvitation}
            onEndMeeting={handleEndMeeting}
            canEndMeeting={canSchedule}
          />
        </div>
        <div className="xl:col-span-4 min-h-0">
          <MeetingQuickActions
            onAction={handleQuickAction}
            canSchedule={canSchedule}
            canStart={canStart}
            canJoin={canJoin}
            hasActiveMeeting={Boolean(liveMeeting)}
            blinkJoin={Boolean(liveMeeting)}
            liveTitle={liveMeeting?.title || ""}
          />
        </div>

        <div className="xl:col-span-5 min-h-[280px]">
          <MeetingMiniCalendar meetingDates={meetingDates} />
        </div>
        <div className="xl:col-span-7 min-h-[280px]">
          <MeetingInvitations
            invitations={invitations}
            isLoading={invitationsLoading}
            onAccept={async (inv) => {
              try {
                await respondMeetingInvitationMutation.mutateAsync({
                  id: inv.meetingId,
                  status: "accepted",
                });
                refetchInvitations();
                refreshMeetings();

                const mTitle = inv.meetingTitle || inv.title || "Meeting";
                const dateStr = inv.startAt ? formatMeetingDate(inv.startAt) : "";
                const timeStr = inv.startAt
                  ? formatMeetingTime(inv.startAt, inv.endAt)
                  : "";

                await Swal.fire({
                  title: "Invitation Accepted!",
                  html: `
                    <div style="text-align: left; font-size: 13px; line-height: 1.6;">
                      <p style="margin-bottom: 8px;">You have accepted the invitation for <strong>${mTitle}</strong>.</p>
                      ${
                        dateStr
                          ? `<div style="background: rgba(99, 102, 241, 0.08); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                              <p style="margin: 0;"><strong>📅 Date:</strong> ${dateStr}</p>
                              <p style="margin: 4px 0 0 0;"><strong>⏰ Time:</strong> ${timeStr}</p>
                            </div>`
                          : ""
                      }
                      <p style="color: #6b7280; margin: 0;">
                        To give your attendance, simply click <strong>"Join Google Meet"</strong> from your Gmail invitation email or from this dashboard when the meeting starts. Joining on time will automatically mark you as <strong>Present</strong> (or <strong>Late</strong> if after grace time).
                      </p>
                    </div>
                  `,
                  icon: "success",
                  confirmButtonText: "Got it!",
                  customClass: {
                    popup: "swal-popup",
                    confirmButton: "swal-confirm-btn",
                  },
                  buttonsStyling: false,
                });
              } catch (err) {
                toaster(
                  err?.response?.data?.message || "Could not accept invitation.",
                  "error",
                );
              }
            }}
          />
        </div>

        <div className="xl:col-span-12">
          <MeetingMinutesList
            meetings={historyMeetings}
            canManage={canSchedule}
            serverMode
            isLoading={historyLoading}
            activeTab={historyTab}
            pagination={historyRes?.pagination}
            onTabChange={(tab) => {
              setHistoryTab(tab);
              setHistoryPage(1);
            }}
            onPageChange={setHistoryPage}
            onEndMeeting={handleEndMeeting}
            onStatusChange={async (id, listStatus) => {
              if (!canSchedule) {
                showToast("Only admin can change meeting status.");
                return;
              }
              try {
                await updateMeetingStatusMutation.mutateAsync({ id, listStatus });
                if (listStatus === "COMPLETED" || listStatus === "CANCELLED") {
                  closeMeetWindow(id);
                }
                showToast(`Status updated to ${listStatus}.`);
                refreshMeetings();
              } catch {
                showToast("Could not update status.");
              }
            }}
            onEdit={(m) => {
              if (!canSchedule) {
                showToast("Only admin can edit meetings.");
                return;
              }
              setEditingMeeting(m);
              setShowSchedule(true);
            }}
            onDelete={async (m) => {
              if (!canSchedule) {
                showToast("Only admin can delete meetings.");
                return;
              }
              if (!m) return;
              const meetingTitle = m?.title || "Meeting";
              const confirmResult = await Swal.fire({
                title: "Are you sure to delete this meeting?",
                text: `Do you want to permanently delete "${meetingTitle}"? This action cannot be undone.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
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
                await deleteMeetingMutation.mutateAsync(m.id);
                toaster(`Meeting “${meetingTitle}” deleted successfully.`, "success");
                showToast(`Deleted “${meetingTitle}”.`);
                refreshMeetings();
                await Swal.fire({
                  title: "Deleted!",
                  text: `“${meetingTitle}” has been deleted.`,
                  icon: "success",
                  confirmButtonText: "OK",
                  customClass: {
                    popup: "swal-popup",
                    confirmButton: "swal-confirm-btn",
                  },
                  buttonsStyling: false,
                });
              } catch (err) {
                const errMsg =
                  err?.response?.data?.message || "Could not delete meeting.";
                toaster(errMsg, "error");
                showToast(errMsg);
              }
            }}
            onDuplicate={(m) => {
              if (!m) return;
              if (!canSchedule) {
                showToast("Only admin can duplicate meetings.");
                return;
              }
              showToast(`Duplicate “${m?.title || "Meeting"}” — use Schedule to recreate.`);
            }}
            onEmail={handleSendInvitation}
            onManageAttendance={(m) => setAttendanceMeeting(m)}
          />
        </div>
      </div>

      {canSchedule && (
        <ScheduleMeetingModal
          show={showSchedule}
          onClose={() => {
            setShowSchedule(false);
            setEditingMeeting(null);
          }}
          editMeeting={editingMeeting}
          employees={employees}
          currentEmployeeId={currentEmployeeId}
          googleConnected={googleConnected}
          isSubmitting={createOrUpdateMeetingMutation.isPending}
          onCreated={handleCreateMeeting}
        />
      )}
      <JoinMeetingModal
        show={showJoin}
        onClose={() => setShowJoin(false)}
        meetings={visibleMeetings}
      />
      {attendanceMeeting && (
        <ChangeAttendanceModal
          show={Boolean(attendanceMeeting)}
          onClose={() => setAttendanceMeeting(null)}
          meeting={attendanceMeeting}
          onSaveAttendance={async (employeeId, attendance, attendee) => {
            try {
              await updateMeetingAttendanceMutation.mutateAsync({
                id: attendanceMeeting.id,
                employeeId:
                  attendee?.employeeId ||
                  (employeeId ? Number(employeeId) : undefined),
                attendeeId: attendee?.id,
                email: attendee?.email,
                attendance,
              });
              const msg = `Attendance updated to ${attendance.toUpperCase()}.`;
              toaster(msg, "success");
              showToast(msg);
              refreshMeetings();
            } catch (err) {
              const errMsg =
                err?.response?.data?.message || "Could not update attendance.";
              toaster(errMsg, "error");
              showToast(errMsg);
            }
          }}
        />
      )}
    </div>
  );
}
