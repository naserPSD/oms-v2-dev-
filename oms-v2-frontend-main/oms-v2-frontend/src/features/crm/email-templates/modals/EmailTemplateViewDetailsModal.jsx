"use client";

import { ModalTw } from "@/components/common/ModalTw";
import helpers from "@/utils/helpers";
import { Calendar, Mail } from "lucide-react";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800",
  inactive: "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700",
  draft: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800",
};

const formatLabel = (value) => {
  if (!value) return "—";
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatWhen = (value) => {
  if (!value) return "—";
  return `${helpers.dDate(value)} ${helpers.dTime(value)}`;
};

const EmailTemplateViewDetailsModal = ({ showModal, onClose, template }) => {
  if (!template) return null;

  const variables = Array.isArray(template.variables) ? template.variables : [];
  const status = template.status || "draft";

  return (
    <ModalTw
      show={showModal}
      onClose={onClose}
      title="Template Details"
      subTitle={template.name}
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
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-800">
            {formatLabel(template.category)}
          </span>
          {template.isDefault && (
            <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-800">
              Default template
            </span>
          )}
          {template.availableForSubscriber && (
            <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-800">
              Available for subscriber
            </span>
          )}
        </div>

        {template.description && (
          <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
            {template.description}
          </p>
        )}

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
                {template.subject}
              </p>
            </div>
          </div>
          <iframe
            title={`${template.name} preview`}
            className="h-80 w-full bg-white"
            sandbox=""
            srcDoc={
              template.content ||
              "<p style='font-family:sans-serif;color:#6b7280;padding:24px'>This template has no content.</p>"
            }
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Variables
          </p>
          {variables.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <span
                  key={variable}
                  className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  {`{{${variable}}}`}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No variables in this template.</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-gray-200 pt-4 text-sm dark:border-gray-700 sm:grid-cols-3">
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p>{formatWhen(template.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Last updated</p>
              <p>{formatWhen(template.updatedAt)}</p>
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            <p className="text-xs text-gray-500">Times used</p>
            <p>{template.usedCount || 0}</p>
          </div>
        </div>
      </div>
    </ModalTw>
  );
};

export default EmailTemplateViewDetailsModal;
