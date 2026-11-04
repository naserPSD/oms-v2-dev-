import RestApi, { offlineHandler } from "@/utils/RestApi";

/** Prevent Google Calendar/Meet failures from triggering session logout */
const googleSafeOpts = { skipUnauthorizedHandler: true };

export const fetchMeetings = async ({ tab = "all", page = 1, limit = 10 } = {}) => {
  const query = new URLSearchParams({
    tab,
    page: String(page),
    limit: String(limit),
  }).toString();
  return offlineHandler.get(async () =>
    RestApi.get(`/api/v1/meetings?${query}`),
  );
};

export const fetchMeetingById = async (id) => {
  return offlineHandler.get(async () => RestApi.get(`/api/v1/meetings/${id}`));
};

export const createOrUpdateMeeting = async (payload) => {
  return offlineHandler.post(async () => {
    const res = await RestApi.post(
      "/api/v1/meetings/add-or-update",
      payload,
      googleSafeOpts,
    );
    if (res?.offline) {
      const err = new Error(
        "You appear offline — meeting was not saved. Check connection and try again.",
      );
      err.code = "OFFLINE_QUEUED";
      throw err;
    }
    return res;
  });
};

export const startMeeting = async (id) => {
  return offlineHandler.post(async () =>
    RestApi.post(`/api/v1/meetings/${id}/start`, {}, googleSafeOpts),
  );
};

export const updateMeetingStatus = async (id, listStatus) => {
  return offlineHandler.post(async () =>
    RestApi.patch(`/api/v1/meetings/${id}/status`, { listStatus }),
  );
};

export const deleteMeeting = async (id) => {
  return offlineHandler.post(async () =>
    RestApi.delete(`/api/v1/meetings/${id}`),
  );
};

export const fetchMeetingNotes = async (id) => {
  return offlineHandler.get(async () =>
    RestApi.get(`/api/v1/meetings/${id}/notes`),
  );
};

export const saveMeetingNotes = async (id, content) => {
  return offlineHandler.post(async () =>
    RestApi.post(`/api/v1/meetings/${id}/notes`, { content }),
  );
};

export const updateMeetingAttendance = async (
  id,
  employeeId,
  attendance,
  extra = {},
) => {
  return offlineHandler.post(async () =>
    RestApi.patch(`/api/v1/meetings/${id}/attendance`, {
      ...(employeeId ? { employeeId: Number(employeeId) } : {}),
      ...(extra?.attendeeId ? { attendeeId: Number(extra.attendeeId) } : {}),
      ...(extra?.email ? { email: extra.email } : {}),
      attendance,
    }),
  );
};

export const sendMeetingInvitation = async (id, payload = {}) => {
  return offlineHandler.post(async () =>
    RestApi.post(`/api/v1/meetings/${id}/send-invitation`, payload),
  );
};

export const fetchGoogleCalendarStatus = async () => {
  return offlineHandler.get(async () =>
    RestApi.get("/api/v1/meetings/google/status", googleSafeOpts),
  );
};

export const fetchGoogleCalendarConnectUrl = async () => {
  return offlineHandler.get(async () =>
    RestApi.get("/api/v1/meetings/google/connect-url", googleSafeOpts),
  );
};

export const fetchMeetingInvitations = async () => {
  return offlineHandler.get(async () =>
    RestApi.get("/api/v1/meetings/invitations"),
  );
};

export const respondMeetingInvitation = async (id, status) => {
  return offlineHandler.post(async () =>
    RestApi.post(`/api/v1/meetings/${id}/respond-invitation`, { status }),
  );
};

export const addMeetingAgendaItem = async (meetingId, text) => {
  return offlineHandler.post(async () =>
    RestApi.post(`/api/v1/meetings/${meetingId}/agendas`, { text }),
  );
};

export const updateMeetingAgendaItem = async (meetingId, agendaId, payload) => {
  return offlineHandler.post(async () =>
    RestApi.patch(`/api/v1/meetings/${meetingId}/agendas/${agendaId}`, payload),
  );
};

export const deleteMeetingAgendaItem = async (meetingId, agendaId) => {
  return offlineHandler.post(async () =>
    RestApi.delete(`/api/v1/meetings/${meetingId}/agendas/${agendaId}`),
  );
};

export const fetchMeetingParticipants = async () => {
  return offlineHandler.get(async () =>
    RestApi.get("/api/v1/meetings/participants"),
  );
};
