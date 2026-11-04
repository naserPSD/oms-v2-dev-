// src/features/hr-dashboard/recruitment/job/JobApplicant.jsx
"use client";

import { TabItemTw } from "@/components/ui/TabItemTw";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { fetchApplicantsByStep } from "@/services/hrServiceApi";
import { useQueries } from "@tanstack/react-query";
import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaUsers } from "react-icons/fa";
import AllApplicantsTab from "./tabs/AllApplicantsTab";
import StepApplicantsTab from "./tabs/StepApplicantsTab";

/* ─── Step tab placeholder — swap later ── */
// const StepApplicantsTab = ({ jobId, stepId, stepName }) => (
//   <div className="admin-card p-8 text-center admin-text-muted text-sm">
//     {stepName} — jobId: {jobId}, stepId: {stepId}
//   </div>
// );

/* ─── Breadcrumb ──────────────────────────────────────────────── */
const Breadcrumb = ({ jobTitle }) => {
  const crumbs = [
    { label: "HR", href: "/hr-dashboard" },
    { label: "Recruitment", href: "/hr-dashboard/recruitment" },
    {
      label: "Job Vacancy",
      href: "/hr-dashboard/recruitment?tab=job-vacancies",
    },
    { label: jobTitle || "...", href: null },
    { label: "Applicant List", href: null },
  ];

  return (
    <nav className="flex items-center flex-wrap gap-1 text-xs admin-text-muted mb-5">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-primaryColor transition-colors font-medium"
            >
              {crumb.label}
            </Link>
          ) : (
            <span
              className={
                i === crumbs.length - 1
                  ? "admin-text font-semibold"
                  : "font-medium"
              }
            >
              {crumb.label}
            </span>
          )}
          {i < crumbs.length - 1 && (
            <ChevronRight size={12} className="admin-text-subtle shrink-0" />
          )}
        </span>
      ))}
    </nav>
  );
};

/* ─── Page ───────────────────────────────────────────────────── */
const JobApplicant = () => {
  const { jobId } = useParams();

  const router = useRouter();
  const searchParams = useSearchParams();

  /* ── fetch dynamic steps by vacancyId ── */
  const { useJobRecruitmentStepsByVacancyIdQuery, useJobTitleByJobVacancyId } =
    useHrQueryApi({});
  const { data: stepsResponse, isLoading: isLoadingSteps } =
    useJobRecruitmentStepsByVacancyIdQuery(jobId);

  const { data: jobTitleResponse } = useJobTitleByJobVacancyId(jobId);

  const steps = useMemo(() => {
    let list = [];
    if (Array.isArray(stepsResponse)) list = stepsResponse;
    else if (Array.isArray(stepsResponse?.data)) list = stepsResponse.data;
    else if (Array.isArray(stepsResponse?.data?.data)) list = stepsResponse.data.data;
    else if (Array.isArray(stepsResponse?.items)) list = stepsResponse.items;
    else if (Array.isArray(stepsResponse?.results)) list = stepsResponse.results;

    return list
      .map((item) => ({
        ...item,
        stepId: item?.stepId ?? item?.step?.id ?? item?.id,
        stepName: item?.stepName ?? item?.step?.name ?? item?.name ?? "",
      }))
      .filter((s) => s.stepId && s.stepName);
  }, [stepsResponse]);

  const allApplicantsCountParams = useMemo(
    () => ({
      jobVacancyId: Number(jobId),
      page: 1,
      limit: 1,
    }),
    [jobId],
  );

  const { data: allApplicantsCountResponse, isLoading: isAllCountLoading } =
    useHrQueryApi({}).useJobApplicantsQuery(allApplicantsCountParams);

  const allApplicantsCount =
    allApplicantsCountResponse?.pagination?.total ??
    allApplicantsCountResponse?.total ??
    0;

  const stepCountQueries = useQueries({
    queries: steps.map((step) => ({
      queryKey: ["stepApplicantsCount", Number(jobId), Number(step.stepId)],
      queryFn: () =>
        fetchApplicantsByStep({
          jobVacancyId: Number(jobId),
          stepNameId: Number(step.stepId),
          page: 1,
          limit: 1,
        }),
      enabled: !!jobId && !!step?.stepId,
      staleTime: 60 * 1000,
    })),
  });

  const stepApplicantCounts = useMemo(() => {
    return steps.reduce((acc, step, index) => {
      const queryData = stepCountQueries[index]?.data;
      acc[step.stepId] = queryData?.pagination?.total ?? queryData?.total ?? 0;
      return acc;
    }, {});
  }, [steps, stepCountQueries]);

  const isStepCountsLoading = stepCountQueries.some((q) => q.isLoading);

  const tabKeys = useMemo(
    () => ["all-applicants", ...steps.map((step) => `step-${step.stepId}`)],
    [steps],
  );

  /* ── build tab config ── */
  const TAB_CONFIG = useMemo(
    () => [
      {
        key: "all-applicants",
        label: `All Applicants (${isAllCountLoading ? "..." : allApplicantsCount})`,
        icon: <FaUsers className="w-3.5 h-3.5" />,
        component: <AllApplicantsTab jobId={jobId} />,
      },
      ...steps.map((step) => ({
        key: `step-${step.stepId}`,
        label: `${step.stepName} (${isStepCountsLoading ? "..." : (stepApplicantCounts[step.stepId] ?? 0)})`,
        stepId: step.stepId,
        icon: <Users size={14} />,
        component: (
          <StepApplicantsTab
            jobId={jobId}
            stepId={step.stepId}
            stepName={step.stepName}
            steps={steps}
            jobTitleResponse={jobTitleResponse}
          />
        ),
      })),
    ],
    [
      allApplicantsCount,
      isAllCountLoading,
      isStepCountsLoading,
      jobId,
      jobTitleResponse,
      stepApplicantCounts,
      steps,
    ],
  );

  /* ── active tab — URL sync ── */
  const [activeTab, setActiveTab] = useState("all-applicants");

  useEffect(() => {
    const tabParam = searchParams.get("tab");

    if (!tabParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "all-applicants");

      router.replace(`?${params.toString()}`, { scroll: false });
      setActiveTab("all-applicants");
      return;
    }

    if (tabKeys.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams, tabKeys, router]);

  const handleTabChange = (key) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);

    setActiveTab(key);
    router.push(`?${params.toString()}`, { scroll: false });
  };
  const activeContent = TAB_CONFIG.find((t) => t.key === activeTab)?.component;
  const jobTitle = jobTitleResponse?.data?.jobTitle;

  return (
    <div className="px-4 sm:px-6 py-6">
      <Breadcrumb jobTitle={jobTitle} />

      {/* Page header */}
      <div className="mb-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 sm:px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primaryColor mb-1">
              Recruitment · Applicants
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              {jobTitle || "Applicant List"}
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              Review applicants by recruitment step, schedule interviews, and
              track assessment scores.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
            <Users size={14} className="text-primaryColor shrink-0" />
            <span>
              {isAllCountLoading ? "…" : allApplicantsCount} total applicant
              {!isAllCountLoading && allApplicantsCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 dark:border-gray-700 mb-5 overflow-x-auto">
        {isLoadingSteps && steps.length === 0
          ? [1, 2, 3].map((i) => (
              <div key={i} className="px-3 py-2">
                <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/[0.06] animate-pulse" />
              </div>
            ))
          : TAB_CONFIG.map((tab) => (
              <TabItemTw
                key={tab.key}
                active={activeTab === tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`!mx-0 px-3 py-2.5 rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-primaryColor text-primaryColor bg-primaryColor/5"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-primaryColor hover:bg-gray-50 dark:hover:bg-gray-800/60"
                }`}
              >
                {tab.icon}
                <span className="whitespace-nowrap">{tab.label}</span>
              </TabItemTw>
            ))}
      </div>

      <div>{activeContent}</div>
    </div>
  );
};

export default JobApplicant;
