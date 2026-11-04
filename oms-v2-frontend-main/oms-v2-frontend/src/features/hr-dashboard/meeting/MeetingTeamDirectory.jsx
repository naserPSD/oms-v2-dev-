"use client";

import ButtonTw from "@/components/ui/ButtonTw";
import { Search, CalendarPlus } from "lucide-react";
import { useMemo, useState } from "react";
import ScheduleMeetingModal from "./components/ScheduleMeetingModal";
import useMeetingAccess from "./hooks/useMeetingAccess";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useMeetingQueryApi } from "@/hooks/queryApi/useMeetingQueryApi";
import { toaster } from "@/utils/helpers";

export default function MeetingTeamDirectory({
  embedded = false,
  onScheduleClick,
}) {
  const { canSchedule, userId } = useMeetingAccess();
  const [q, setQ] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [preselect, setPreselect] = useState(null);
  const [toast, setToast] = useState("");

  const { useHrEmployeeQuery } = useHrQueryApi({});
  const { data: employeeRes, isLoading } = useHrEmployeeQuery({
    page: 1,
    limit: 500,
  });

  const {
    createOrUpdateMeetingMutation,
    useGoogleCalendarStatusQuery,
    useMeetingParticipantsQuery,
  } = useMeetingQueryApi();
  const { data: participantsRes, isLoading: participantsLoading } =
    useMeetingParticipantsQuery();
  const { data: googleStatusRes } = useGoogleCalendarStatusQuery({
    enabled: canSchedule,
  });
  const googleConnected = Boolean(googleStatusRes?.data?.connected);

  const employees = useMemo(() => {
    const fromApi = participantsRes?.data ?? [];
    if (Array.isArray(fromApi) && fromApi.length > 0) {
      return fromApi;
    }

    const rows = employeeRes?.data ?? employeeRes?.list ?? [];
    return rows.map((e) => {
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
        department: e.department?.name || e.department || "General",
        email: e.user?.email || e.email || "",
      };
    });
  }, [participantsRes, employeeRes]);

  const currentEmployeeId = useMemo(() => {
    if (!userId) return null;
    const match = employees.find((e) => Number(e.userId) === Number(userId));
    return match?.id ?? null;
  }, [employees, userId]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.role.toLowerCase().includes(term) ||
        e.department.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term),
    );
  }, [q, employees]);

  const openSchedule = (empId) => {
    if (!canSchedule) {
      setToast("You don’t have permission to schedule meetings.");
      setTimeout(() => setToast(""), 3200);
      return;
    }
    setPreselect(empId);
    if (onScheduleClick) {
      onScheduleClick(empId);
      if (embedded) return;
    }
    setShowSchedule(true);
  };

  const handleCreateMeeting = async (payload) => {
    const isOnline = payload.meetingType === "Online Meeting";
    const body = {
      title: payload.title,
      hostId: Number(payload.hostId),
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
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
      const successMsg = created?.meetUrl
        ? `“${payload.title}” created with Google Meet link.`
        : `Meeting “${payload.title}” created successfully.`;
      toaster(successMsg, "success");
      setToast(successMsg);
      setTimeout(() => setToast(""), 3500);
      setShowSchedule(false);
      setPreselect(null);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Could not schedule meeting.";
      toaster(errMsg, "error");
      setToast(errMsg);
      setTimeout(() => setToast(""), 3500);
    }
  };

  return (
    <div className="space-y-4">
      {!embedded && (
        <div>
          <h1 className="text-2xl font-bold admin-text">Team directory</h1>
          <p className="text-sm admin-text-muted mt-1">
            Find people and schedule a meeting in one click.
          </p>
        </div>
      )}

      {toast && (
        <div className="rounded-lg border border-secondaryColor/30 bg-secondaryColor/10 dark:bg-secondaryColor/15 px-4 py-2 text-sm text-secondaryColor">
          {toast}
        </div>
      )}

      <div className="relative max-w-md">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-primaryColor dark:text-primaryColor-400"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, role, department…"
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 py-2.5 text-sm admin-text placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div className="admin-card overflow-hidden">
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map((emp) => (
            <li
              key={emp.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primaryColor/15 dark:bg-primaryColor/25 flex items-center justify-center text-xs font-bold text-primaryColor dark:text-primaryColor-400 shrink-0">
                  {emp.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold admin-text truncate">
                    {emp.name}
                  </p>
                  <p className="text-xs admin-text-muted truncate">
                    {emp.role} · {emp.department}
                  </p>
                </div>
              </div>
              {canSchedule && (
                <ButtonTw
                  type="button"
                  size="xs"
                  variant="alternative"
                  onClick={() => openSchedule(emp.id)}
                  className="!border-primaryColor/40 !text-primaryColor dark:!text-primaryColor-400"
                >
                  <span className="inline-flex items-center gap-1">
                    <CalendarPlus size={13} />
                    Schedule meeting
                  </span>
                </ButtonTw>
              )}
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-8 text-center text-sm admin-text-muted">
              No employees match your search.
            </li>
          )}
        </ul>
      </div>

      {canSchedule && (
        <ScheduleMeetingModal
          show={showSchedule}
          onClose={() => {
            setShowSchedule(false);
            setPreselect(null);
          }}
          preselectedEmployeeId={preselect}
          employees={employees}
          currentEmployeeId={currentEmployeeId}
          googleConnected={googleConnected}
          isSubmitting={createOrUpdateMeetingMutation.isPending}
          onCreated={handleCreateMeeting}
        />
      )}
    </div>
  );
}
