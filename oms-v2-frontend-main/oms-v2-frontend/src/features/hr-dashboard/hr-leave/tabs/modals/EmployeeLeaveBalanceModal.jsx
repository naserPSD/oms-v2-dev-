"use client";

import { useMemo } from "react";
import { ModalTw } from "@/components/common/ModalTw";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BiPlus } from "react-icons/bi";

export const leaveRequestDays = (item) => {
  if (!item?.startDate || !item?.endDate) return 0;
  const start = new Date(item.startDate);
  const end = new Date(item.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const ms = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round(ms / 86400000) + 1);
};

const asBalance = (value) => {
  if (Array.isArray(value?.types)) return value;
  if (Array.isArray(value?.data?.types)) return value.data;
  return null;
};

export function useLeaveBalancesForRows(rows = []) {
  return useMemo(() => {
    const map = {};
    rows.forEach((row) => {
      const id = row?.empId || row?.employee?.id;
      const balance = asBalance(row?.leaveBalance);
      if (id && balance) map[String(id)] = balance;
    });
    return map;
  }, [rows]);
}

const Stat = ({ label, value, tone }) => (
  <div className={`rounded-xl px-3 py-2 ${tone}`}>
    <p className="text-[11px] font-medium uppercase tracking-wide opacity-70">{label}</p>
    <p className="text-xl font-bold leading-tight">{value}</p>
  </div>
);

export default function EmployeeLeaveBalanceModal({
  show,
  onClose,
  empId,
  employeeName,
  highlightLeaveTypeId,
  highlightLeaveTypeName,
  requestDays = 0,
  balance = null,
}) {
  const view = asBalance(balance);
  const types = view?.types || [];
  const total = view?.total || {};

  return (
    <ModalTw
      show={show}
      onClose={onClose}
      title="Leave Available"
      size="3xl"
      showFooter={false}
    >
      <div className="space-y-4 p-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {view?.employee?.name || employeeName || "Employee"}
            </p>
            <p className="text-xs text-gray-500">
              {view?.employee?.email || "Allowance for this year"}
              {view?.year ? ` · ${view.year}` : ""}
            </p>
          </div>
          <div>
            {empId || view?.employee?.id ? (
              <Link
                href={`/hr-dashboard/employee/${empId || view?.employee?.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>View Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/hr-dashboard/employee?tab=employee-list"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <BiPlus className="w-3.5 h-3.5" />
                <span>Add Employee</span>
              </Link>
            )}
          </div>
        </div>

        {!view && (
          <p className="py-8 text-center text-sm text-gray-500">
            Leave available for this year is not on this row yet. Refresh the table and open it again.
          </p>
        )}

        {view && (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Allowed" value={total.totalLeave ?? 0} tone="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100" />
              <Stat label="Used" value={total.totalUsed ?? 0} tone="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-100" />
              <Stat label="Pending" value={total.totalPending ?? 0} tone="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-100" />
              <Stat label="Remaining" value={total.totalRemaining ?? 0} tone="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100" />
            </div>

            <div className="space-y-2">
              {types.length === 0 && (
                <p className="rounded-xl border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-500 dark:border-gray-700">
                  No leave types are set for {view?.year}.
                </p>
              )}
              {types.map((type) => {
                const highlighted =
                  (highlightLeaveTypeId && Number(type.id) === Number(highlightLeaveTypeId)) ||
                  (highlightLeaveTypeName &&
                    type.name?.toLowerCase() === highlightLeaveTypeName.toLowerCase());
                const max = Number(type.total) || 0;
                const usedPct = max ? Math.min(100, (Number(type.used) / max) * 100) : 0;

                return (
                  <div
                    key={type.id}
                    className={`rounded-xl border px-3 py-3 ${
                      highlighted
                        ? "border-violet-400 bg-violet-50 ring-2 ring-violet-300 dark:border-violet-500 dark:bg-violet-950/40 dark:ring-violet-700"
                        : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {type.name}
                          {highlighted && (
                            <span className="ml-2 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                              This request
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {type.isPaid ? "Paid" : "Unpaid"}
                          {highlighted && requestDays > 0
                            ? ` · this application is ${requestDays} day${requestDays === 1 ? "" : "s"}`
                            : ""}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {type.used}
                        <span className="font-normal text-gray-400"> / {type.total}</span>
                      </p>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-full rounded-full ${highlighted ? "bg-violet-600" : "bg-blue-500"}`}
                        style={{ width: `${usedPct}%` }}
                      />
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-gray-500">
                      <span>Used {type.used}</span>
                      <span>Pending {type.pending}</span>
                      <span className="font-medium text-emerald-600">Remaining {type.remaining}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </ModalTw>
  );
}
