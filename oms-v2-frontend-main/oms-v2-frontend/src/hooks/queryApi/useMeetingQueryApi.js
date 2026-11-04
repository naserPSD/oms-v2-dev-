import {
  addMeetingAgendaItem,
  createOrUpdateMeeting,
  deleteMeeting,
  deleteMeetingAgendaItem,
  fetchGoogleCalendarConnectUrl,
  fetchGoogleCalendarStatus,
  fetchMeetingById,
  fetchMeetingInvitations,
  fetchMeetingNotes,
  fetchMeetingParticipants,
  fetchMeetings,
  respondMeetingInvitation,
  saveMeetingNotes,
  sendMeetingInvitation,
  startMeeting,
  updateMeetingAgendaItem,
  updateMeetingAttendance,
  updateMeetingStatus,
} from "@/services/meetingServiceApi";
import helpers, { toaster } from "@/utils/helpers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const response = {};

export const useMeetingQueryApi = ({
  setError = () => {},
  handleClose = () => {},
} = {}) => {
  const queryClient = useQueryClient();

  response.useMeetingsQuery = (params = {}, options = {}) =>
    useQuery({
      queryKey: ["meetings", params],
      queryFn: () => fetchMeetings(params),
      keepPreviousData: true,
      ...options,
    });

  response.useMeetingByIdQuery = (id, options = {}) =>
    useQuery({
      queryKey: ["meeting", id],
      queryFn: () => fetchMeetingById(id),
      enabled: Boolean(id),
      ...options,
    });

  response.useMeetingNotesQuery = (id, options = {}) =>
    useQuery({
      queryKey: ["meetingNotes", id],
      queryFn: () => fetchMeetingNotes(id),
      enabled: Boolean(id),
      ...options,
    });

  response.useGoogleCalendarStatusQuery = (options = {}) =>
    useQuery({
      queryKey: ["googleCalendarStatus"],
      queryFn: () => fetchGoogleCalendarStatus(),
      ...options,
    });

  response.useMeetingInvitationsQuery = (options = {}) =>
    useQuery({
      queryKey: ["meetingInvitations"],
      queryFn: () => fetchMeetingInvitations(),
      ...options,
    });

  response.useMeetingParticipantsQuery = (options = {}) =>
    useQuery({
      queryKey: ["meetingParticipants"],
      queryFn: () => fetchMeetingParticipants(),
      ...options,
    });

  response.createOrUpdateMeetingMutation = useMutation({
    mutationFn: createOrUpdateMeeting,
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
      const code = error?.response?.data?.code;
      if (code === "GOOGLE_CALENDAR_NOT_CONNECTED") {
        toaster(
          "Connect Google Calendar first to create online meetings with Meet links.",
          "error",
        );
      }
    },
    onSuccess: async () => {
      handleClose();
      await queryClient.invalidateQueries({ queryKey: ["meetings"] });
      await queryClient.refetchQueries({ queryKey: ["meetings"] });
      await queryClient.invalidateQueries({ queryKey: ["meeting"] });
    },
  });

  response.startMeetingMutation = useMutation({
    mutationFn: startMeeting,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", String(id)] });
    },
  });

  response.updateMeetingStatusMutation = useMutation({
    mutationFn: ({ id, listStatus }) => updateMeetingStatus(id, listStatus),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", String(id)] });
      queryClient.invalidateQueries({ queryKey: ["meeting"] });
    },
  });

  response.deleteMeetingMutation = useMutation({
    mutationFn: deleteMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });

  response.saveMeetingNotesMutation = useMutation({
    mutationFn: ({ id, content }) => saveMeetingNotes(id, content),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["meetingNotes", id] });
    },
  });

  response.updateMeetingAttendanceMutation = useMutation({
    mutationFn: ({ id, employeeId, attendance, attendeeId, email }) =>
      updateMeetingAttendance(id, employeeId, attendance, {
        attendeeId,
        email,
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["meeting"] });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });

  response.connectGoogleCalendarMutation = useMutation({
    mutationFn: fetchGoogleCalendarConnectUrl,
    onSuccess: (res) => {
      const url = res?.data?.url;
      if (url && typeof window !== "undefined") {
        window.location.href = url;
      }
    },
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },
  });

  response.sendMeetingInvitationMutation = useMutation({
    mutationFn: ({ id, ...payload }) => sendMeetingInvitation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting"] });
    },
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },
  });

  response.respondMeetingInvitationMutation = useMutation({
    mutationFn: ({ id, status }) => respondMeetingInvitation(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetingInvitations"] });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting"] });
    },
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },
  });

  response.addMeetingAgendaMutation = useMutation({
    mutationFn: ({ meetingId, text }) => addMeetingAgendaItem(meetingId, text),
    onSuccess: (_, { meetingId }) => {
      queryClient.invalidateQueries({ queryKey: ["meeting", String(meetingId)] });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },
  });

  response.updateMeetingAgendaMutation = useMutation({
    mutationFn: ({ meetingId, agendaId, ...payload }) =>
      updateMeetingAgendaItem(meetingId, agendaId, payload),
    onSuccess: (_, { meetingId }) => {
      queryClient.invalidateQueries({ queryKey: ["meeting", String(meetingId)] });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },
  });

  response.deleteMeetingAgendaMutation = useMutation({
    mutationFn: ({ meetingId, agendaId }) =>
      deleteMeetingAgendaItem(meetingId, agendaId),
    onSuccess: (_, { meetingId }) => {
      queryClient.invalidateQueries({ queryKey: ["meeting", String(meetingId)] });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },
  });

  return response;
};
