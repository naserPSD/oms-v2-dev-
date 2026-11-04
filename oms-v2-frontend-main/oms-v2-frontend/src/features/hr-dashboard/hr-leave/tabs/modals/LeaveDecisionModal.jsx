"use client";

import { ModalTw } from "@/components/common/ModalTw";
import helpers from "@/utils/helpers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const leaveDayCount = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const ms = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  return Math.max(1, Math.round(ms / 86400000) + 1);
};

export function LeaveDurationCell({ startDate, endDate }) {
  const days = leaveDayCount(startDate, endDate);
  return (
    <div className="whitespace-nowrap text-sm leading-5">
      <span className="text-gray-800 dark:text-gray-200">
        {startDate ? helpers.dDate(startDate) : "-"}
      </span>
      <span className="mx-1.5 text-gray-400">–</span>
      <span className="text-gray-800 dark:text-gray-200">
        {endDate ? helpers.dDate(endDate) : "-"}
      </span>
      {days > 0 && (
        <p className="text-xs text-gray-500">{days} day{days > 1 ? "s" : ""}</p>
      )}
    </div>
  );
}

const personFromRow = (row) => {
  const approver = row?.approver;
  const name =
    approver?.fullName ||
    [approver?.firstName, approver?.lastName].filter(Boolean).join(" ") ||
    row?.actionByName ||
    "";
  const designation =
    approver?.employee?.designation?.name || row?.actionByDesignation || "";
  return { name, designation };
};

export function LeaveStatusCell({ row, status, onView }) {
  const code = row?.approvalStatus?.code || row?.approveStatus?.code;
  const isFinal =
    code === "leave_request_approval_approved" ||
    code === "leave_request_approval_rejected" ||
    row?.approvalStatusId === 52 ||
    row?.approvalStatusId === 53;
  const { name, designation } = personFromRow(row);

  return (
    <div
      className="flex w-full cursor-pointer flex-col items-center gap-1 text-center"
      onClick={() => onView?.(row)}
    >
      <span className={`badge badge-pill badge-outline-${status.color}`}>
        {status.name}
      </span>
      {isFinal && name && (
        <div className="max-w-[140px]">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-200">
            {name}
          </p>
          {designation && (
            <p className="text-[11px] text-gray-500">{designation}</p>
          )}
        </div>
      )}
    </div>
  );
}

const showValue = (value) => value || "Not recorded";

const statusMeta = (row) => {
  const code = row?.approvalStatus?.code || row?.approveStatus?.code;
  const id = row?.approvalStatusId;
  if (code === "leave_request_approval_rejected" || id === 53) {
    return { label: "Rejected", tone: "text-red-600" };
  }
  if (code === "leave_request_approval_approved" || id === 52) {
    return { label: "Approved", tone: "text-emerald-600" };
  }
  return {
    label: row?.approvalStatus?.name || row?.approveStatus?.name || "Pending",
    tone: "text-amber-600",
  };
};

export default function LeaveDecisionModal({ show, onClose, row }) {
  const user = row?.employee?.user;
  const employee = row?.employee;
  const { name, designation } = personFromRow(row);
  const status = statusMeta(row);
  const isFinal = status.label === "Approved" || status.label === "Rejected";
  const employeeName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    row?.employeeName ||
    "";
  const email = user?.email || row?.email || "";
  const phone =
    user?.profile?.phoneWithCallingCode || user?.profile?.phone || "";
  const applicantDesignation =
    employee?.designation?.name || row?.designation || "";
  const office = employee?.office?.name || "";
  const department = employee?.designation?.department?.name || "";
  const leaveType = row?.empLeaveType?.name || row?.leaveType || "";
  const appliedOn = row?.createdAt || row?.appliedOn;
  const attachmentUrl =
    row?.attachmentMedia?.fileUrl || row?.attachment?.fileUrl || "";
  const days = leaveDayCount(row?.startDate, row?.endDate);

  const fields = [
    ["Employee", employeeName],
    ["Email", email],
    ["Phone", phone],
    ["Designation", applicantDesignation],
    ["Office", office],
    ["Department", department],
    ["Leave type", leaveType],
    [
      "Duration",
      row?.startDate
        ? `${helpers.dDate(row.startDate)} – ${helpers.dDate(row.endDate)}${
            days ? ` (${days} day${days > 1 ? "s" : ""})` : ""
          }`
        : "",
    ],
    ["Applied on", appliedOn ? helpers.dDate(appliedOn) : ""],
    ["Leave reason", row?.reason],
  ];

  return (
    <ModalTw
      show={show}
      onClose={onClose}
      title="Leave details"
      size="lg"
      showFooter={false}
    >
      <div className="space-y-4 p-1 text-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {showValue(employeeName)}
            </p>
            {(row?.employee?.id || row?.empId) && (
              <Link
                href={`/hr-dashboard/employee/${row.employee?.id || row.empId}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>View Employee Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          <span className={`text-sm font-semibold ${status.tone}`}>
            {status.label}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {label}
              </p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {showValue(value)}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {status.label === "Rejected" ? "Rejected by" : "Approved by"}
          </p>
          {isFinal ? (
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium">{showValue(name)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Designation</p>
                <p className="font-medium">{showValue(designation)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {status.label === "Rejected" ? "Rejected on" : "Approved on"}
                </p>
                <p className="font-medium">
                  {row?.approvalDate
                    ? helpers.dDate(row.approvalDate)
                    : "Not recorded"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {status.label === "Rejected"
                    ? "Rejection reason"
                    : "Decision note"}
                </p>
                <p className="font-medium">{showValue(row?.decisionReason)}</p>
              </div>
            </div>
          ) : (
            <p className="mt-2 font-medium text-gray-700 dark:text-gray-200">
              This leave is still pending.
            </p>
          )}
        </div>
        {attachmentUrl && (
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-600 underline"
          >
            View attachment
          </a>
        )}
      </div>
    </ModalTw>
  );
}
