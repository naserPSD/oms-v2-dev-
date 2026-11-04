/**
 * Google Meet link helpers (UI mock until Calendar API / backend).
 * Real creation will come from Google Calendar event with conferenceData.
 */

const CODE_CHARS = "abcdefghijklmnopqrstuvwxyz";

function randomChunk(len = 3) {
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

/** Creates a Meet-style URL: https://meet.google.com/xxx-xxxx-xxx */
export function createGoogleMeetLink() {
  return `https://meet.google.com/${randomChunk(3)}-${randomChunk(4)}-${randomChunk(3)}`;
}

export function isOnlineMeetingType(meetingType) {
  const t = String(meetingType || "").toLowerCase();
  return t.includes("online") || t === "online meeting";
}

/**
 * Ensure an online meeting has a Meet link.
 * Returns a new meeting object when a link is generated.
 */
export function ensureGoogleMeetUrl(meeting) {
  if (!meeting) return meeting;
  const type = meeting.meetingType || "Online Meeting";
  if (!isOnlineMeetingType(type)) return meeting;
  if (meeting.meetUrl?.trim()) return meeting;
  return {
    ...meeting,
    meetUrl: createGoogleMeetLink(),
    meetLinkAutoCreated: true,
  };
}

export function isValidMeetUrl(url) {
  if (!url || typeof url !== "string") return false;
  return /^https:\/\/meet\.google\.com\/[a-z0-9-]+$/i.test(url.trim());
}
