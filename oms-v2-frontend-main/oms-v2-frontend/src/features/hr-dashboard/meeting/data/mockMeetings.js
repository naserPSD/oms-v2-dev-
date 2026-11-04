// Mock data for HR Meetings UI (no backend yet)

const now = new Date();
const at = (h, m = 0, dayOffset = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const MOCK_CURRENT_USER = {
  id: 12,
  name: "Demo User",
  role: "HR Manager",
  /** @deprecated Prefer useMeetingAccess() — kept for mock data host ids only */
  isHr: true,
  avatar: null,
};

export const MOCK_EMPLOYEES = [
  {
    id: 99,
    name: "Asif Patwary",
    role: "HR / QA",
    department: "HR",
    email: "asifpatwary630@gmail.com",
    avatar: null,
  },
  {
    id: 1,
    name: "Ayesha Rahman",
    role: "HR Executive",
    department: "HR",
    email: "ayesha@revinr.com",
    avatar: null,
  },
  {
    id: 2,
    name: "Karim Hossain",
    role: "Software Engineer",
    department: "Engineering",
    email: "karim@revinr.com",
    avatar: null,
  },
  {
    id: 3,
    name: "Nusrat Jahan",
    role: "Product Designer",
    department: "Design",
    email: "nusrat@revinr.com",
    avatar: null,
  },
  {
    id: 4,
    name: "Rafiul Islam",
    role: "Team Lead",
    department: "Engineering",
    email: "rafiul@revinr.com",
    avatar: null,
  },
  {
    id: 5,
    name: "Sadia Akter",
    role: "Recruiter",
    department: "HR",
    email: "sadia@revinr.com",
    avatar: null,
  },
  {
    id: 6,
    name: "Tanvir Ahmed",
    role: "QA Engineer",
    department: "Engineering",
    email: "tanvir@revinr.com",
    avatar: null,
  },
  {
    id: 7,
    name: "Farhana Islam",
    role: "Finance Officer",
    department: "Finance",
    email: "farhana@revinr.com",
    avatar: null,
  },
  {
    id: 8,
    name: "Imran Khan",
    role: "Ops Manager",
    department: "Operations",
    email: "imran@revinr.com",
    avatar: null,
  },
];

export const MOCK_MEETINGS = [
  {
    id: "m-live-1",
    title: "Weekly HR Sync",
    host: { id: 12, name: "Demo User", role: "HR Manager" },
    startAt: at(now.getHours() - 0, Math.max(0, now.getMinutes() - 20)),
    endAt: at(now.getHours() + 1, now.getMinutes()),
    meetUrl: "https://meet.google.com/abc-defg-hij",
    status: "live",
    meetingType: "Online Meeting",
    listStatus: "SCHEDULED",
    joinedCount: 6,
    expectedCount: 10,
    agenda: [
      { id: "a1", text: "Attendance policy update", done: true },
      { id: "a2", text: "Leave calendar review", done: false },
      { id: "a3", text: "Open hiring pipeline", done: false },
    ],
    attendees: [
      { employeeId: 99, name: "Asif Patwary", role: "HR / QA", attendance: "present", online: true, email: "asifpatwary630@gmail.com" },
      { employeeId: 1, name: "Ayesha Rahman", role: "HR Executive", attendance: "present", online: true },
      { employeeId: 2, name: "Karim Hossain", role: "Software Engineer", attendance: "late", online: true },
      { employeeId: 3, name: "Nusrat Jahan", role: "Product Designer", attendance: "present", online: true },
      { employeeId: 4, name: "Rafiul Islam", role: "Team Lead", attendance: null, online: false },
      { employeeId: 5, name: "Sadia Akter", role: "Recruiter", attendance: "present", online: true },
      { employeeId: 6, name: "Tanvir Ahmed", role: "QA Engineer", attendance: "absent", online: false },
    ],
    actionItems: [
      { id: "ai1", title: "Share updated leave SOP", assignee: "Ayesha Rahman", dueDate: "2026-09-15", done: false },
      { id: "ai2", title: "Prepare hiring funnel slides", assignee: "Sadia Akter", dueDate: "2026-09-16", done: true },
    ],
  },
  {
    id: "m-today-2",
    title: "Engineering Standup with HR",
    host: { id: 4, name: "Rafiul Islam", role: "Team Lead" },
    startAt: at(16, 30),
    endAt: at(17, 0),
    meetUrl: "https://meet.google.com/xyz-uvwx-yz",
    status: "upcoming",
    meetingType: "Online Meeting",
    listStatus: "INVITED",
    joinedCount: 0,
    expectedCount: 8,
    agenda: [
      { id: "b1", text: "Sprint blockers", done: false },
      { id: "b2", text: "Resource planning", done: false },
    ],
    attendees: [
      { employeeId: 2, name: "Karim Hossain", role: "Software Engineer", attendance: null, online: false },
      { employeeId: 4, name: "Rafiul Islam", role: "Team Lead", attendance: null, online: false },
      { employeeId: 6, name: "Tanvir Ahmed", role: "QA Engineer", attendance: null, online: false },
    ],
    actionItems: [],
  },
  {
    id: "m-up-1",
    title: "Onboarding Kickoff — New Joiners",
    host: { id: 5, name: "Sadia Akter", role: "Recruiter" },
    startAt: at(11, 0, 1),
    endAt: at(12, 0, 1),
    meetUrl: "https://meet.google.com/onb-1234-xyz",
    status: "upcoming",
    meetingType: "Online Meeting",
    listStatus: "SCHEDULED",
    joinedCount: 0,
    expectedCount: 12,
    agenda: [
      { id: "c1", text: "Welcome & culture", done: false },
      { id: "c2", text: "Tooling walkthrough", done: false },
      { id: "c3", text: "Q&A", done: false },
    ],
    attendees: [],
    actionItems: [],
  },
  {
    id: "m-up-2",
    title: "Performance Review Calibration",
    host: { id: 12, name: "Demo User", role: "HR Manager" },
    startAt: at(14, 0, 2),
    endAt: at(15, 30, 2),
    meetUrl: "https://meet.google.com/perf-cal-99",
    status: "upcoming",
    meetingType: "Conference Room",
    roomName: "Board Room A",
    listStatus: "SCHEDULED",
    joinedCount: 0,
    expectedCount: 5,
    agenda: [
      { id: "d1", text: "Rating distribution", done: false },
      { id: "d2", text: "Promotion cases", done: false },
    ],
    attendees: [],
    actionItems: [],
  },
  {
    id: "m-past-1",
    title: "Monthly All-Hands Prep",
    host: { id: 1, name: "Ayesha Rahman", role: "HR Executive" },
    startAt: at(10, 0, -1),
    endAt: at(11, 0, -1),
    meetUrl: "https://meet.google.com/past-ah-01",
    status: "ended",
    meetingType: "Online Meeting",
    listStatus: "COMPLETED",
    joinedCount: 9,
    expectedCount: 10,
    agenda: [
      { id: "e1", text: "Agenda draft", done: true },
      { id: "e2", text: "Speaker lineup", done: true },
    ],
    attendees: [
      { employeeId: 1, name: "Ayesha Rahman", role: "HR Executive", email: "ayesha@revinr.com", attendance: "present", inviteStatus: "accepted" },
      { employeeId: 2, name: "Karim Hossain", role: "Software Engineer", email: "karim@revinr.com", attendance: "present", inviteStatus: "accepted" },
      { employeeId: 5, name: "Sadia Akter", role: "Recruiter", email: "sadia@revinr.com", attendance: "late", inviteStatus: "accepted" },
      { employeeId: 6, name: "Tanvir Ahmed", role: "QA Engineer", email: "tanvir@revinr.com", attendance: "absent", inviteStatus: "accepted" },
    ],
    actionItems: [
      { id: "ai3", title: "Send all-hands invite", assignee: "Ayesha Rahman", dueDate: "2026-09-12", done: true },
    ],
    notesPreview: "Finalize speaker list before Friday.",
    minutes: [{ id: "min1", description: "All-hands prep notes", attachment: "allhands-prep.pdf", createdAt: at(11, 5, -1) }],
  },
  {
    id: "m-past-2",
    title: "Exit Interview Sync",
    host: { id: 12, name: "Demo User", role: "HR Manager" },
    startAt: at(15, 0, -3),
    endAt: at(15, 45, -3),
    meetUrl: "https://meet.google.com/exit-88",
    status: "ended",
    meetingType: "Online Meeting",
    listStatus: "CANCELLED",
    joinedCount: 3,
    expectedCount: 3,
    agenda: [{ id: "f1", text: "Feedback themes", done: true }],
    attendees: [
      { employeeId: 1, name: "Ayesha Rahman", role: "HR Executive", email: "ayesha@revinr.com", attendance: "present", inviteStatus: "accepted" },
      { employeeId: 5, name: "Sadia Akter", role: "Recruiter", email: "sadia@revinr.com", attendance: "present", inviteStatus: "accepted" },
      { employeeId: 12, name: "Demo User", role: "HR Manager", email: "demo@revinr.com", attendance: "present", inviteStatus: "accepted" },
    ],
    actionItems: [],
    notesPreview: "Theme: onboarding gaps.",
    minutes: [],
  },
];

/** Extra ended meetings for history pagination (10+/page demo) */
const PAST_EXTRA = [
  ["Full Team Meeting", "Online Meeting", -4, 15, 30, 16, 0],
  ["Q3 Hiring Review", "Online Meeting", -5, 11, 0, 12, 0],
  ["Client Kickoff — Acme", "External Meeting", -6, 14, 0, 15, 0],
  ["Payroll Policy Briefing", "Conference Room", -7, 10, 0, 10, 45],
  ["Design Critique Sync", "Online Meeting", -8, 16, 0, 16, 45],
  ["Ops Weekly Wrap", "Online Meeting", -9, 9, 30, 10, 0],
  ["Finance Close Check-in", "Online Meeting", -10, 13, 0, 13, 30],
  ["Campus Drive Planning", "External Meeting", -11, 11, 0, 12, 30],
  ["Security Awareness", "Online Meeting", -12, 15, 0, 15, 40],
  ["Manager 1:1 Calibration", "Online Meeting", -13, 10, 0, 11, 0],
  ["Product Roadmap Align", "Online Meeting", -14, 14, 30, 15, 30],
  ["Vendor Review Call", "External Meeting", -15, 12, 0, 12, 45],
].map(([title, meetingType, day, sh, sm, eh, em], i) => ({
  id: `m-past-x-${i + 1}`,
  title,
  host: MOCK_EMPLOYEES[i % MOCK_EMPLOYEES.length],
  startAt: at(sh, sm, day),
  endAt: at(eh, em, day),
  meetUrl: meetingType.includes("Online") || meetingType.includes("External")
    ? `https://meet.google.com/hist-${i + 1}`
    : null,
  status: "ended",
  meetingType,
  listStatus: i % 7 === 0 ? "CANCELLED" : "COMPLETED",
  joinedCount: 4 + (i % 6),
  expectedCount: 8 + (i % 5),
  agenda: [
    { id: `px-a-${i}-1`, text: "Recap last actions", done: true },
    { id: `px-a-${i}-2`, text: "Open discussion", done: true },
  ],
  attendees: MOCK_EMPLOYEES.slice(0, 4).map((e, j) => ({
    employeeId: e.id,
    name: e.name,
    role: e.role,
    email: e.email,
    attendance: j === 2 ? "late" : j === 3 ? "absent" : "present",
    inviteStatus: j === 3 ? "declined" : "accepted",
  })),
  actionItems: i % 2 === 0
    ? [{ id: `px-ai-${i}`, title: "Follow up notes", assignee: MOCK_EMPLOYEES[0].name, dueDate: "", done: false }]
    : [],
  notesPreview: i % 3 === 0 ? "Private follow-ups saved." : "",
  minutes: i % 4 === 0
    ? [{ id: `px-min-${i}`, description: "Meeting minute", attachment: `minute-${i + 1}.pdf`, createdAt: at(eh, em + 5, day) }]
    : [],
}));

MOCK_MEETINGS.push(...PAST_EXTRA);

export const getMeetingById = (id) =>
  MOCK_MEETINGS.find((m) => m.id === id) || null;

export const isMeetingRescheduleLocked = (meeting, now = Date.now()) => {
  if (!meeting?.startAt) return false;
  if (
    meeting.listStatus === "COMPLETED" ||
    meeting.listStatus === "CANCELLED" ||
    meeting.status === "ended"
  ) {
    return false;
  }
  const startMs = new Date(meeting.startAt).getTime();
  const endMs = meeting.endAt
    ? new Date(meeting.endAt).getTime()
    : startMs + 30 * 60 * 1000;
  const t = typeof now === "number" ? now : new Date(now).getTime();
  const tenMinutesMs = 10 * 60 * 1000;

  // Locked ONLY:
  // 1) Within 10 minutes of start time
  // 2) While meeting is ongoing / in progress
  // Before 10 min of start, or after meeting ends (t > endMs), it is NOT locked.
  return t >= startMs - tenMinutesMs && t <= endMs;
};

export const canModifyMeeting = (meeting) => {
  if (!meeting) return false;
  return true;
};

export const deriveMeetingStatus = (meeting, now = Date.now()) => {
  if (!meeting) return "upcoming";
  if (
    meeting.listStatus === "COMPLETED" ||
    meeting.listStatus === "CANCELLED" ||
    meeting.status === "ended"
  ) {
    return "ended";
  }
  const start = new Date(meeting.startAt).getTime();
  const end = new Date(meeting.endAt || meeting.startAt).getTime();
  const t = typeof now === "number" ? now : new Date(now).getTime();
  if (t > end) return "ended";
  // "start meeting and join meeting egula meeting er 10 minutes age show korbe"
  // Active/live from 10 minutes before startAt until endAt
  const tenMinutesBefore = start - 10 * 60 * 1000;
  if (t >= tenMinutesBefore && t <= end) return "live";
  return "upcoming";
};

export const getPastMeetings = () =>
  MOCK_MEETINGS.filter((m) => deriveMeetingStatus(m) === "ended").sort(
    (a, b) => new Date(b.startAt) - new Date(a.startAt),
  );

export const computeOnTimeAttendance = (
  startAt,
  joinTime = Date.now(),
  graceMinutes = 5,
) => {
  if (!startAt) return "present";
  const start = new Date(startAt).getTime();
  const graceMs = graceMinutes * 60 * 1000;
  return joinTime <= start + graceMs ? "present" : "late";
};

export const summarizeAttendance = (attendees = [], meeting = null) => {
  const isEnded =
    meeting?.endAt && new Date(meeting.endAt).getTime() < Date.now();
  const present = attendees.filter((a) => a.attendance === "present").length;
  const late = attendees.filter((a) => a.attendance === "late").length;
  const absent = attendees.filter(
    (a) => a.attendance === "absent" || (isEnded && !a.attendance),
  ).length;
  return { total: attendees.length, present, late, absent };
};

export const summarizeInvites = (attendees = []) => {
  const accepted = attendees.filter((a) => a.inviteStatus === "accepted").length;
  const declined = attendees.filter((a) => a.inviteStatus === "declined").length;
  const pending = attendees.filter(
    (a) => !a.inviteStatus || a.inviteStatus === "pending",
  ).length;
  return { accepted, declined, pending, total: attendees.length };
};

export const isSameDay = (iso, base = new Date()) => {
  const d = new Date(iso);
  return (
    d.getFullYear() === base.getFullYear() &&
    d.getMonth() === base.getMonth() &&
    d.getDate() === base.getDate()
  );
};

export const formatTime12 = (isoOrDate) => {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatMeetingTime = (startAt, endAt) => {
  if (!startAt) return "";
  const s = formatTime12(startAt);
  if (!endAt) return s;
  const e = formatTime12(endAt);
  return `${s} – ${e}`;
};

export const formatMeetingDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

export const notesStorageKey = (meetingId, userId) =>
  `oms-meeting-notes:${meetingId}:${userId}`;

export const formatMeetingTimeShort = (startAt, endAt) => {
  return formatMeetingTime(startAt, endAt);
};

export const getMeetingDurationMinutes = (startAt, endAt) => {
  const mins = Math.round(
    (new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000,
  );
  return mins > 0 ? mins : 0;
};

export const formatMeetingDateBadge = (iso) =>
  new Date(iso)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

export const getMeetingTypeLabel = (meeting) => {
  const t = (meeting?.meetingType || "").toLowerCase();
  if (t.includes("conference") || t.includes("room")) return "CONFERENCE";
  if (t.includes("external")) return "EXTERNAL";
  return "ONLINE";
};

export const isMeetingExpired = (meeting) => {
  if (!meeting) return false;
  if (meeting.listStatus === "COMPLETED" || meeting.listStatus === "CANCELLED") return true;
  const end = new Date(meeting.endAt || meeting.startAt).getTime();
  return Boolean(end && end < Date.now());
};

/**
 * Resolves whether a meeting applies to today (either scheduled for today or an active repeat).
 * If it applies to today, returns an object with today's startAt & endAt Date objects.
 * Otherwise returns null.
 */
export function getTodayMeetingOccurrence(meeting, now = new Date()) {
  if (!meeting?.startAt) return null;

  const origStart = new Date(meeting.startAt);
  const origEnd = new Date(meeting.endAt || meeting.startAt);
  const durationMs = Math.max(0, origEnd.getTime() - origStart.getTime());

  // 1. Regular meeting scheduled on today's calendar day
  if (isSameDay(origStart, now)) {
    return {
      startAt: origStart,
      endAt: origEnd,
      isRepeat: false,
    };
  }

  // 2. Repeated meeting
  const isRepeat = Boolean(meeting.isRepeat ?? meeting.repeat);
  if (isRepeat) {
    const startDay = new Date(origStart);
    startDay.setHours(0, 0, 0, 0);
    const todayDay = new Date(now);
    todayDay.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (todayDay.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000),
    );

    const repeatDays =
      meeting.repeatDays != null ? Number(meeting.repeatDays) : 30;

    // Series must have started on or before today, and not exceed repeatDays
    if (diffDays >= 0 && (repeatDays <= 0 || diffDays <= repeatDays)) {
      const occStart = new Date(todayDay);
      occStart.setHours(
        origStart.getHours(),
        origStart.getMinutes(),
        origStart.getSeconds(),
        origStart.getMilliseconds(),
      );
      const occEnd = new Date(occStart.getTime() + durationMs);

      return {
        startAt: occStart,
        endAt: occEnd,
        isRepeat: true,
      };
    }
  }

  return null;
}

/**
 * Checks if a meeting for today is finished (sesh).
 * It is finished if:
 * - Cancelled
 * - Or Completed (for non-repeating meetings)
 * - Or current time is past today's end time
 */
export function isTodayMeetingFinished(meeting, now = new Date()) {
  if (!meeting) return true;
  if (meeting.listStatus === "CANCELLED") return true;

  const occ = getTodayMeetingOccurrence(meeting, now);
  if (!occ) return true;

  // If current time is strictly after the occurrence end time
  if (now.getTime() > occ.endAt.getTime()) return true;

  if (meeting.listStatus === "COMPLETED" && !occ.isRepeat) return true;
  if (meeting.status === "ended" && !occ.isRepeat) return true;

  return false;
}

export const getMeetingListStatus = (meeting) => {
  if (!meeting) return "SCHEDULED";
  if (meeting.listStatus === "CANCELLED") return "CANCELLED";
  const now = Date.now();
  const end = new Date(meeting.endAt || meeting.startAt).getTime();
  if (end && end < now) return "COMPLETED";
  if (meeting.listStatus === "INVITED") return "INVITED";
  return meeting.listStatus || "SCHEDULED";
};

export const LIST_STATUS_OPTIONS = [
  "SCHEDULED",
  "INVITED",
  "COMPLETED",
  "CANCELLED",
];

/** Filter tabs: today | upcoming | archive | previous | all */
export const filterMeetingsByTab = (meetings, tab) => {
  const now = Date.now();
  return meetings.filter((m) => {
    const start = new Date(m.startAt).getTime();
    const end = new Date(m.endAt).getTime();
    const status = getMeetingListStatus(m);
    const derived = deriveMeetingStatus(m);

    if (tab === "today") return isSameDay(m.startAt);
    if (tab === "upcoming") {
      return (
        status !== "CANCELLED" &&
        status !== "COMPLETED" &&
        (derived === "upcoming" || derived === "live" || start > now)
      );
    }
    if (tab === "archive" || tab === "previous") {
      return (
        status === "COMPLETED" ||
        status === "CANCELLED" ||
        derived === "ended" ||
        end < now
      );
    }
    return true;
  });
};

export const MOCK_INVITATIONS = [
  {
    id: "inv-1",
    fromName: "Samson",
    fromAvatar: null,
    meetingTitle: "Q4 planning",
    meetingId: "m-up-1",
  },
  {
    id: "inv-2",
    fromName: "Helena",
    fromAvatar: null,
    meetingTitle: "Coffee chat",
    meetingId: "m-up-2",
  },
  {
    id: "inv-3",
    fromName: "Elle",
    fromAvatar: null,
    meetingTitle: "Sprint retro",
    meetingId: "m-today-2",
  },
];

export const MOCK_INSIGHTS = {
  hostedThisWeek: 8,
  attendedThisWeek: 16,
};
