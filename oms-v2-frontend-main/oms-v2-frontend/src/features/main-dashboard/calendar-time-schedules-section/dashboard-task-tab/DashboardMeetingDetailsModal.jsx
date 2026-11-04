"use client";

import React from "react";
import Link from "next/link";
import { ModalTw } from "@/components/common/ModalTw";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  Video,
  Users,
  MapPin,
  ExternalLink,
  Repeat,
  CheckCircle2,
  ListTodo,
  User,
  ArrowUpRight,
} from "lucide-react";

const formatTime12 = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatFullDate = (isoDate) => {
  if (!isoDate) return "Not set";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getDurationMinutes = (startAt, endAt) => {
  if (!startAt || !endAt) return null;
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const diffMinutes = Math.round((end - start) / (1000 * 60));
  return diffMinutes > 0 ? diffMinutes : null;
};

const DashboardMeetingDetailsModal = ({
  showModal,
  handleClose,
  meetingData,
}) => {
  if (!meetingData) return null;

  const isLive = meetingData.status === "live";
  const duration = getDurationMinutes(meetingData.startAt, meetingData.endAt);
  const startTime = formatTime12(meetingData.startAt);
  const endTime = formatTime12(meetingData.endAt);
  const attendees = meetingData.attendees || [];
  const agendaItems = meetingData.agenda || [];
  const isOnline =
    meetingData.meetingType?.toLowerCase().includes("online") ||
    Boolean(meetingData.meetUrl);

  const getAttendanceBadge = (attendance, inviteStatus) => {
    if (attendance === "present") {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          Present
        </span>
      );
    }
    if (attendance === "late") {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          Late
        </span>
      );
    }
    if (attendance === "absent") {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
          Absent
        </span>
      );
    }
    if (inviteStatus === "accepted") {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          Accepted
        </span>
      );
    }
    if (inviteStatus === "declined") {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Declined
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        Pending
      </span>
    );
  };

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title="Meeting Details"
      size="3xl"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Meeting Header */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">
                {meetingData.title || "Untitled Meeting"}
              </h2>
              <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                <span>ID: #{meetingData.id}</span>
                {meetingData.host?.name && (
                  <>
                    <span>•</span>
                    <span>Host: <strong className="text-gray-700 dark:text-gray-300">{meetingData.host.name}</strong></span>
                  </>
                )}
                {meetingData.isRepeat && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <Repeat className="h-3 w-3" />
                      Recurring ({meetingData.repeatDays || 30} days)
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 ring-1 ring-rose-400">
                  <span className="size-2 rounded-full bg-rose-600 dark:bg-rose-400 animate-ping" />
                  Live Now
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {meetingData.listStatus || "Scheduled"}
                </span>
              )}
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
            {meetingData.meetUrl ? (
              <a
                href={meetingData.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow transition-colors"
              >
                <Video className="h-4 w-4" />
                <span>Join Google Meet</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                In-person or room meeting
              </span>
            )}

            <Link
              href={`/hr-dashboard/meeting/${meetingData.id}`}
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Open in Meeting Workspace</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Date & Time Schedule Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-blue-500" />
              Schedule & Time
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Date</span>
                <span className="text-sm font-medium text-foreground">
                  {formatFullDate(meetingData.startAt)}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Time</span>
                <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {startTime} - {endTime}
                </span>
              </div>
              {duration && (
                <div>
                  <span className="text-xs text-muted-foreground block">Duration</span>
                  <span className="text-sm font-medium text-foreground">
                    {duration} minutes
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location & Format Card */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-purple-500" />
              Meeting Location & Format
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Type</span>
                <span className="text-sm font-medium text-foreground">
                  {meetingData.meetingType || (isOnline ? "Online Meeting" : "Offline Meeting")}
                </span>
              </div>
              {meetingData.roomName && (
                <div>
                  <span className="text-xs text-muted-foreground block">Room</span>
                  <span className="text-sm font-medium text-foreground">
                    {meetingData.roomName}
                  </span>
                </div>
              )}
              {meetingData.address && (
                <div>
                  <span className="text-xs text-muted-foreground block">Address</span>
                  <span className="text-sm font-medium text-foreground">
                    {meetingData.address}
                  </span>
                </div>
              )}
              {meetingData.companyName && (
                <div>
                  <span className="text-xs text-muted-foreground block">Company</span>
                  <span className="text-sm font-medium text-foreground">
                    {meetingData.companyName}
                  </span>
                </div>
              )}
              {meetingData.clientName && (
                <div>
                  <span className="text-xs text-muted-foreground block">Client</span>
                  <span className="text-sm font-medium text-foreground">
                    {meetingData.clientName}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agenda Section */}
        {agendaItems.length > 0 && (
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="py-3 px-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <ListTodo className="h-4 w-4 text-emerald-500" />
                Agenda ({agendaItems.length})
              </CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className="px-4 py-2">
              <ul className="space-y-2">
                {agendaItems.map((item, idx) => (
                  <li
                    key={item.id || idx}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${
                        item.done ? "text-emerald-500" : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                    <span className={item.done ? "line-through text-muted-foreground" : ""}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Attendees Section */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-amber-500" />
              Attendees ({attendees.length})
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="px-4 py-2">
            {attendees.length === 0 ? (
              <p className="text-xs text-muted-foreground">No attendees added yet</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {attendees.map((attendee, idx) => (
                  <div
                    key={attendee.id || idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-semibold shrink-0">
                        {(attendee.name || attendee.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {attendee.name || attendee.email}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {attendee.role || attendee.email}
                        </p>
                      </div>
                    </div>
                    <div>
                      {getAttendanceBadge(attendee.attendance, attendee.inviteStatus)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModalTw>
  );
};

export default DashboardMeetingDetailsModal;
