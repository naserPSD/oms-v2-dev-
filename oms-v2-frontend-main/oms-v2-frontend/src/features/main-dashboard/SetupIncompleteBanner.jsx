"use client";

import Link from "next/link";
import { ArrowRight, Building2, Lightbulb, Users, X } from "lucide-react";
import ButtonTw from "@/components/ui/ButtonTw";
import {
  useSetupIncompleteStatus,
  COMPANY_STEP_LABELS,
  HR_STEP_LABELS,
} from "./useSetupIncompleteStatus";

const SetupIncompleteBanner = ({ status }) => {
  const selfStatus = useSetupIncompleteStatus();
  const currentStatus = status || selfStatus;

  const {
    showBanner,
    companyIncomplete,
    hrIncomplete,
    nextCompanyStep,
    nextHrStep,
    hrHref,
    handleDismiss,
  } = currentStatus;

  if (!showBanner) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
          <Lightbulb className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Finish your company setup
              </h3>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                Complete the remaining setup steps so attendance, HR, and other
                modules work correctly.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-md p-1 text-gray-400 hover:bg-white/70 hover:text-gray-600 dark:hover:bg-gray-800"
              aria-label="Dismiss setup tip"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {companyIncomplete && (
              <div className="rounded-lg border border-amber-200/80 bg-white/80 p-3 dark:border-amber-900/40 dark:bg-gray-900/50">
                <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Company Settings
                </div>
                <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                  Next:{" "}
                  {COMPANY_STEP_LABELS[nextCompanyStep] ||
                    "complete company setup"}
                  .
                </p>
                <Link href="/settings/company-settings">
                  <ButtonTw
                    type="button"
                    size="sm"
                    className="!h-8 !px-3 !text-xs font-semibold"
                  >
                    Go to Company Settings
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </ButtonTw>
                </Link>
              </div>
            )}

            {hrIncomplete && (
              <div className="rounded-lg border border-amber-200/80 bg-white/80 p-3 dark:border-amber-900/40 dark:bg-gray-900/50">
                <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  <Users className="h-4 w-4 text-emerald-600" />
                  HR Settings
                </div>
                <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                  Next: {HR_STEP_LABELS[nextHrStep] || "complete HR setup"}.
                </p>
                <Link href={hrHref}>
                  <ButtonTw
                    type="button"
                    size="sm"
                    variant="alternative"
                    className="!h-8 !px-3 !text-xs font-semibold"
                  >
                    Go to HR Settings
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </ButtonTw>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupIncompleteBanner;
