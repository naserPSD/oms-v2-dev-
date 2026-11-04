// oms-v2-frontend/src/features/hr-dashboard/meeting/utils/meetWindowManager.js

// In-memory cache of active meet window references
const meetWindows = {};

/**
 * Open a Google Meet URL in a named auxiliary window/tab,
 * and track its reference so it can be automatically closed when the meeting ends.
 *
 * @param {string} url - Google Meet URL
 * @param {string|number} meetingId - Meeting ID
 * @returns {Window|null}
 */
export function openMeetWindow(url, meetingId) {
  if (!url || typeof window === "undefined") return null;

  const targetName = meetingId ? `oms_meet_${meetingId}` : "_blank";

  try {
    // Open without noopener/noreferrer so opener control is preserved for closing
    const win = window.open(url, targetName);
    if (win && meetingId) {
      meetWindows[meetingId] = win;
      try {
        localStorage.setItem(`oms_meet_active_${meetingId}`, String(Date.now()));
      } catch (_) {}
    }
    return win;
  } catch (err) {
    console.error("Failed to open Google Meet window:", err);
    return null;
  }
}

/**
 * Automatically close the Google Meet tab/window for a given meeting.
 * Uses 3 strategies:
 * 1. Closes the direct in-memory WindowProxy object if available.
 * 2. Re-targets the named window (`oms_meet_${meetingId}`) and calls close().
 * 3. Broadcasts a storage event to close the window in any other open OMS tabs.
 *
 * @param {string|number} meetingId - Meeting ID
 */
export function closeMeetWindow(meetingId) {
  if (!meetingId || typeof window === "undefined") return;

  // Strategy 1: Direct in-memory window handle
  try {
    const win = meetWindows[meetingId];
    if (win && !win.closed) {
      win.close();
    }
    delete meetWindows[meetingId];
  } catch (err) {
    console.warn("Could not close in-memory Meet window:", err);
  }

  // Strategy 2: Re-target named window and close
  try {
    const targetName = `oms_meet_${meetingId}`;
    const win = window.open("", targetName);
    if (win && !win.closed) {
      win.close();
    }
  } catch (err) {
    console.warn("Could not close named Meet window:", err);
  }

  // Strategy 3: Broadcast event across tabs
  try {
    localStorage.removeItem(`oms_meet_active_${meetingId}`);
    localStorage.setItem(
      "oms_meet_event",
      JSON.stringify({ action: "close", meetingId, timestamp: Date.now() }),
    );
  } catch (_) {}
}

// Global listener for cross-tab close events
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "oms_meet_event" && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        if (data?.action === "close" && data?.meetingId) {
          const mid = data.meetingId;
          if (meetWindows[mid] && !meetWindows[mid].closed) {
            meetWindows[mid].close();
            delete meetWindows[mid];
          }
          const win = window.open("", `oms_meet_${mid}`);
          if (win && !win.closed) {
            win.close();
          }
        }
      } catch (_) {}
    }
  });
}
