"use client";

import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import { useAuthStore } from "@/store/useAuthStore";
import { useMemo } from "react";

/** Reserved permission codes (seed later with API). */
export const MEETING_PERMISSIONS = {
  view: "hr.meeting_view",
  add: "hr.meeting_add",
  edit: "hr.meeting_edit",
  manageRoster: "hr.meeting_roster_edit",
};

function collectRoleNames(user) {
  const buckets = [user?.userRole, user?.userRoles, user?.roles].filter(
    Boolean,
  );
  const names = [];
  for (const bucket of buckets) {
    if (Array.isArray(bucket)) {
      for (const item of bucket) {
        names.push(
          item?.role?.name ||
            item?.name ||
            item?.roleName ||
            (typeof item === "string" ? item : ""),
        );
      }
    } else if (typeof bucket === "string") {
      names.push(bucket);
    } else if (bucket?.name) {
      names.push(bucket.name);
    }
  }
  return names.filter(Boolean);
}

function roleLooksLikeAdmin(user) {
  return collectRoleNames(user).some((n) => {
    const s = String(n).toLowerCase();
    return (
      s.includes("admin") ||
      s.includes("super admin") ||
      s.includes("hr") ||
      s.includes("human resource")
    );
  });
}

/**
 * Access rules (UI phase — wire to API permissions later):
 * - Admin / HR: create & start meetings, roster, reschedule, edit/delete
 * - Employees: see their meetings, join Meet, agenda, private notes
 */
export default function useMeetingAccess() {
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions) || [];
  const { hasPermission } = useCommonFunctions();

  return useMemo(() => {
    const hasHrPermission = permissions.some(
      (code) => typeof code === "string" && code.startsWith("hr."),
    );
    const isAdmin = roleLooksLikeAdmin(user) || hasHrPermission;

    const canManageRoster =
      hasPermission(MEETING_PERMISSIONS.manageRoster) ||
      hasPermission(MEETING_PERMISSIONS.edit) ||
      isAdmin;

    /** Only admin/HR can create / schedule / start */
    const canSchedule =
      hasPermission(MEETING_PERMISSIONS.add) ||
      hasPermission(MEETING_PERMISSIONS.edit) ||
      isAdmin;

    const canStart = canSchedule;

    const canReschedule = (meeting) => {
      if (!meeting) return false;
      if (canManageRoster) return true;
      if (!meeting?.host?.id || !user?.id) return false;
      return Number(meeting.host.id) === Number(user.id);
    };

    const userId = user?.id ?? null;
    const displayName =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      user?.name ||
      "You";

    /** Employee: meeting is visible if host, invitee, or attendee */
    const canSeeMeeting = (meeting) => {
      if (canSchedule || isAdmin) return true;
      if (!meeting) return false;
      if (!userId) return true; // mock fallback when not logged in
      if (Number(meeting.host?.id) === Number(userId)) return true;
      const inAttendees = (meeting.attendees || []).some(
        (a) => Number(a.employeeId) === Number(userId),
      );
      if (inAttendees) return true;
      return false;
    };

    return {
      user,
      userId,
      displayName,
      avatarUrl: user?.profile?.profilePicture?.fileUrl || null,
      firstName: user?.firstName || displayName.split(" ")[0] || "there",
      isAdmin,
      canManageRoster,
      canSchedule,
      canStart,
      canReschedule,
      canSeeMeeting,
      /** Employees + admin */
      canJoin: true,
      canTakeNotes: true,
      canViewAgenda: true,
    };
  }, [user, permissions, hasPermission]);
}
