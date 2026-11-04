"use client";

import Link from "next/link";
import { ArrowRight, Building2, Lightbulb, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import ButtonTw from "@/components/ui/ButtonTw";
import {
  COMPANY_STEP_LABELS,
  HR_STEP_LABELS,
  hrSettingsHref,
  useSetupProgressStatus,
} from "@/features/setup/useSetupProgressStatus";

const SetupGuideBanner = ({
  showCompany = false,
  showHr = false,
  dismissKey,
  className = "mb-4",
}) => {
  const {
    initialSetupDone,
    canCompany,
    canHr,
    isLoading,
    companyIncomplete,
    companyRequiredComplete,
    hrIncomplete,
    nextCompanyStep,
    nextHrStep,
  } = useSetupProgressStatus({
    fetchCompany: showCompany || showHr,
    fetchHr: showHr,
  });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!dismissKey) return;
    try {
      setDismissed(sessionStorage.getItem(dismissKey) === "1");
    } catch {
      // ignore
    }
  }, [dismissKey]);

  const handleDismiss = () => {
    setDismissed(true);
    if (!dismissKey) return;
    try {
      sessionStorage.setItem(dismissKey, "1");
    } catch {
      // ignore
    }
  };

  if (!initialSetupDone || dismissed || isLoading) return null;

  const needCompany =
    showCompany && canCompany && (!companyRequiredComplete || companyIncomplete);
  const needHr = showHr && canHr && hrIncomplete && companyRequiredComplete;
  const needHrBlockedByCompany =
    showHr && canHr && hrIncomplete && !companyRequiredComplete && canCompany;

  if (!needCompany && !needHr && !needHrBlockedByCompany) return null;

  const title = needCompany || needHrBlockedByCompany
    ? "Finish company settings first"
    : "Finish HR settings before using this page";

  const description =
    needCompany || needHrBlockedByCompany
      ? "Company logo and basic information must be complete before HR modules work correctly."
      : "Shifts, weekends, departments, and designations are still incomplete in HR Settings.";

  const href =
    needCompany || needHrBlockedByCompany
      ? "/settings/company-settings"
      : hrSettingsHref(nextHrStep);

  const label =
    needCompany || needHrBlockedByCompany
      ? "Go to Company Settings"
      : "Go to HR Settings";

  const nextLabel =
    needCompany || needHrBlockedByCompany
      ? COMPANY_STEP_LABELS[nextCompanyStep] || "complete company setup"
      : HR_STEP_LABELS[nextHrStep] || "complete HR setup";

  const Icon = needCompany || needHrBlockedByCompany ? Building2 : Users;

  return (
    <div
      className={`rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <Icon className="h-4 w-4" />
                {title}
              </h3>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                {description} Next: {nextLabel}.
              </p>
            </div>
            {dismissKey && (
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-md p-1 text-gray-400 hover:bg-white/70 hover:text-gray-600 dark:hover:bg-gray-800"
                aria-label="Dismiss setup tip"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-2">
            <Link href={href}>
              <ButtonTw
                type="button"
                size="sm"
                className="!h-8 !px-3 !text-xs font-semibold"
              >
                {label}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </ButtonTw>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuideBanner;
