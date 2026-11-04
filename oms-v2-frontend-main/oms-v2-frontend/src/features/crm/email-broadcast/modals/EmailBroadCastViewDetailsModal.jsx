"use client";

import { ModalTw } from "@/components/common/ModalTw";
import helpers from "@/utils/helpers";
import { Calendar, Mail, Paperclip, Users } from "lucide-react";

const STATUS_STYLES = {
  sent: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800",
  scheduled:
    "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-800",
  draft:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800",
  failed:
    "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800",
};

const RECIPIENT_LABELS = {
  all: "All users",
  selected: "Selected users",
  custom: "Custom emails",
};

const formatLabel = (value) => {
  if (!value) return "—";
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatWhen = (value) => {
  if (!value) return "Not sent";
  return `${helpers.dDate(value)} ${helpers.dTime(value)}`;
};

const toPreviewHtml = (message = "") => {
  const content = String(message || "").trim();
  if (!content) {
    return "<p style='font-family:sans-serif;color:#6b7280;padding:24px'>This broadcast has no message.</p>";
  }
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");
  return `<div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#111827;padding:24px">${escaped}</div>`;
};

const EmailBroadCastViewDetailsModal = ({ showModal, onClose, emailDetails }) => {
  if (!emailDetails) return null;

  const status = emailDetails.status || "draft";

  return (
    <ModalTw
      show={showModal}
      onClose={onClose}
      title="Broadcast Details"
      subTitle={emailDetails.subject}
      size="4xl"
      dismissible
      showFooter={false}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
              STATUS_STYLES[status] || STATUS_STYLES.draft
            }`}
          >
            {formatLabel(status)}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700">
            {RECIPIENT_LABELS[emailDetails.recipientType] ||
              formatLabel(emailDetails.recipientType)}
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/80">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
              <Mail className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                Subject
              </p>
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {emailDetails.subject}
              </p>
            </div>
          </div>
          <iframe
            title={`${emailDetails.subject} preview`}
            className="h-72 w-full bg-white"
            sandbox=""
            srcDoc={toPreviewHtml(emailDetails.message)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-4 text-sm dark:border-gray-700 sm:grid-cols-4">
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Recipients</p>
              <p>{emailDetails.recipients || 0}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Received</p>
              <p>{emailDetails.received || 0}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Bounced</p>
              <p>{emailDetails.bounced || 0}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
            <Paperclip className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Attachments</p>
              <p>{emailDetails.attachments || 0}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Sent</p>
              <p>{formatWhen(emailDetails.sentAt)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p>{formatWhen(emailDetails.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </ModalTw>
  );
};

export default EmailBroadCastViewDetailsModal;
