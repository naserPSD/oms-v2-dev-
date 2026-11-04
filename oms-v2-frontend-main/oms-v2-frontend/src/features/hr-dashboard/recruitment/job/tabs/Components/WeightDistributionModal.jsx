// src/features/hr-dashboard/recruitment/job/tabs/Components/WeightDistributionModal.jsx
"use client";

import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useAuthStore } from "@/store/useAuthStore";
import { Calendar, Scale, User } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

const statusBadgeClass = (status) => {
  const normalized = (status || "Pending").toLowerCase();
  if (normalized === "completed") {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
  }
  if (normalized === "in progress" || normalized === "in_progress") {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
  }
  return "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-300 dark:border-amber-700";
};

/* ─── Interviewers Mini Cards ────────────────────────────────── */
const InterviewersMiniCards = ({ interviewers, authUserId }) => {
  if (!interviewers || interviewers.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
        Interviewers
      </p>
      <div className="flex flex-wrap gap-2.5">
        {interviewers.map((iv) => (
          <div
            key={iv.jobInterviewerId}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"
          >
            {iv.profilePicture ? (
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-white dark:ring-gray-700">
                <Image
                  src={iv.profilePicture}
                  alt={iv.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primaryColor/15 dark:bg-primaryColor/25 flex items-center justify-center shrink-0">
                <User size={14} className="text-primaryColor dark:text-primaryColor-400" />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                {iv.name}
                {iv.userId === authUserId && (
                  <span className="ml-1.5 text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 px-1.5 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </p>
              <span
                className={`inline-flex mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusBadgeClass(iv.status)}`}
              >
                {iv.status || "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Main Modal ─────────────────────────────────────────────── */
const WeightDistributionModal = ({
  showModal,
  onClose,
  scheduleId,
  jobTitleResponse,
}) => {
  const authUser = useAuthStore((state) => state.user);

  const { useWeightDistributionQuery } = useHrQueryApi({});
  const { data: response, isLoading } = useWeightDistributionQuery(scheduleId);

  const details =
    response?.data?.scheduleDetails ?? response?.scheduleDetails ?? null;
  const matrix = response?.data?.matrix ?? response?.matrix ?? [];
  const interviewersFromApi =
    response?.data?.interviewers ?? response?.interviewers ?? [];

  /* Prefer API interviewers (score keys match); enrich from job title */
  const interviewers = useMemo(() => {
    const fromJobTitle = jobTitleResponse?.data?.interviewers ?? [];
    const source =
      interviewersFromApi.length > 0 ? interviewersFromApi : fromJobTitle;

    const map = new Map();
    source.forEach((iv) => {
      const key = iv.jobInterviewerId ?? iv.userId;
      if (key == null || map.has(key)) return;

      const enriched =
        fromJobTitle.find(
          (a) =>
            a.jobInterviewerId === iv.jobInterviewerId ||
            a.userId === iv.userId,
        ) ?? {};

      map.set(key, {
        ...enriched,
        ...iv,
        status: iv.status ?? enriched.status,
      });
    });

    return Array.from(map.values());
  }, [interviewersFromApi, jobTitleResponse]);

  const handleClose = () => onClose();

  const formattedDatetime = details?.interviewDatetime
    ? new Date(details.interviewDatetime).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title="Interview Weight Distribution"
      size="3xl"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-primaryColor/30 border-t-primaryColor rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* ── Applicant summary ── */}
          {details && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-slate-50 dark:from-gray-800 dark:to-gray-800/80 px-4 py-3">
              <div className="min-w-0">
                <p className="text-base font-bold text-gray-900 dark:text-white truncate">
                  {details.applicantName}
                </p>
                {details.designation && (
                  <p className="text-xs font-medium text-primaryColor dark:text-primaryColor-400 mt-0.5">
                    {details.designation}
                  </p>
                )}
              </div>
              {formattedDatetime && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5">
                  <Calendar size={13} className="text-primaryColor dark:text-primaryColor-400 shrink-0" />
                  <span>{formattedDatetime}</span>
                </div>
              )}
            </div>
          )}

          <InterviewersMiniCards
            interviewers={
              interviewersFromApi.length > 0
                ? interviewersFromApi
                : interviewers
            }
            authUserId={authUser?.id}
          />

          {matrix.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
              <Scale size={28} className="text-primaryColor/70 dark:text-primaryColor-400" />
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Weights not set up yet
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Interview weights have not been configured for this schedule.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-700 dark:text-slate-100 uppercase tracking-wider">
                      Weight Name
                    </th>
                    <th className="text-center px-4 py-3 text-[11px] font-bold text-slate-700 dark:text-slate-100 uppercase tracking-wider">
                      Max
                    </th>
                    {interviewers.map((iv) => (
                      <th
                        key={iv.jobInterviewerId}
                        className="text-center px-4 py-3 text-[11px] font-bold text-slate-700 dark:text-slate-100 uppercase tracking-wider"
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Assessed By
                          </span>
                          <span className="font-semibold text-sm normal-case text-slate-900 dark:text-white">
                            {iv.name}
                            {iv.userId === authUser?.id && (
                              <span className="ml-1 text-[10px] bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 px-1.5 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusBadgeClass(iv.status)}`}
                          >
                            {iv.status || "Pending"}
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="text-center px-4 py-3 text-[11px] font-bold text-slate-700 dark:text-slate-100 uppercase tracking-wider">
                      Avg.
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {matrix.map((row, i) => (
                    <tr
                      key={i}
                      className={
                        i % 2 === 0
                          ? "bg-white dark:bg-gray-900"
                          : "bg-slate-50/80 dark:bg-gray-800/40"
                      }
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {row.weightName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 text-center font-semibold">
                        {row.weightValue}
                      </td>
                      {interviewers.map((iv) => {
                        const score = row.scores?.[iv.jobInterviewerId];
                        return (
                          <td
                            key={iv.jobInterviewerId}
                            className="px-4 py-3 text-sm text-center text-gray-800 dark:text-gray-200 font-medium"
                          >
                            {score?.weightMarking ?? (
                              <span className="text-gray-400 dark:text-gray-500">
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-sm text-center font-bold text-primaryColor">
                        {row.weightAverage ?? "—"}
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-blue-50 dark:bg-primaryColor/15 font-bold border-t border-blue-100 dark:border-primaryColor/20">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">
                      {details?.totalMaxWeight ??
                        matrix.reduce((s, r) => s + (r.weightValue ?? 0), 0)}
                    </td>
                    {interviewers.map((iv) => {
                      const total = matrix.reduce(
                        (sum, row) =>
                          sum +
                          (row.scores?.[iv.jobInterviewerId]?.weightMarking ??
                            0),
                        0,
                      );
                      return (
                        <td
                          key={iv.jobInterviewerId}
                          className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white"
                        >
                          {total}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-sm text-center text-primaryColor">
                      —
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {details?.averageScore !== undefined && details.averageScore > 0 && (
            <div className="flex items-center justify-center gap-3 py-1">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Average Score
              </span>
              <span className="min-w-10 h-10 px-2 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-extrabold shadow-sm">
                {details.averageScore}
              </span>
            </div>
          )}

          <div className="flex justify-end pt-1 border-t border-gray-200 dark:border-gray-700">
            <ButtonTw size="sm" variant="outline.gray" onClick={handleClose}>
              Close
            </ButtonTw>
          </div>
        </div>
      )}
    </ModalTw>
  );
};

export default WeightDistributionModal;
