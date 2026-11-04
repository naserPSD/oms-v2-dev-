"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ButtonTw from "@/components/ui/ButtonTw";
import { cn } from "@/lib/utils";
import {
  Building2,
  Check,
  ImagePlus,
  Lightbulb,
  MapPin,
  Package,
  X,
} from "lucide-react";
import { hrSettingsHref } from "@/features/setup/useSetupProgressStatus";

const STEPS = [
  {
    key: "logo",
    label: "Logo",
    tipTitle: "Upload your logo",
    tip: "Add a square company logo (JPG/PNG, ~600×600). This step is required.",
    icon: ImagePlus,
    required: true,
  },
  {
    key: "basic",
    label: "Basic Info",
    tipTitle: "Complete basic info",
    tip: "Open Edit and fill email, phone, and address so your company profile is complete.",
    icon: Building2,
    required: true,
  },
  {
    key: "services",
    label: "Services",
    tipTitle: "Add products or services",
    tip: "Optional — add at least one item below, or skip and continue.",
    icon: Package,
    required: false,
  },
  {
    key: "office",
    label: "Office",
    tipTitle: "Set up your office",
    tip: "Continue to HR Settings to configure your office, shifts, weekends, departments, and designations.",
    icon: MapPin,
    required: true,
  },
];

const TIP_DISMISS_KEY = "company-setup-tip-dismissed";

export const getCompanySetupStatus = (
  company,
  servicesCount = 0,
  hasOffice = false,
) => {
  const hasLogo = Boolean(
    company?.logoMediaId ||
      company?.logoMedia?.fileUrl ||
      company?.logoMedia?.id,
  );
  const hasBasicInfo = Boolean(
    company?.name &&
      company?.typeId &&
      company?.sizeId &&
      company?.email &&
      company?.phone &&
      company?.address,
  );
  const hasServices = Number(servicesCount) > 0;

  return {
    logo: hasLogo,
    basic: hasBasicInfo,
    services: hasServices,
    office: Boolean(hasOffice),
  };
};

const CompanySetupProgress = ({
  company,
  servicesCount = 0,
  hasOffice = false,
  hrRequiredComplete = false,
}) => {
  const router = useRouter();
  const [servicesSkipped, setServicesSkipped] = useState(false);
  const [tipDismissed, setTipDismissed] = useState(false);
  const [focusedStepKey, setFocusedStepKey] = useState(null);

  useEffect(() => {
    try {
      setTipDismissed(sessionStorage.getItem(TIP_DISMISS_KEY) === "1");
      setServicesSkipped(
        sessionStorage.getItem("company-setup-services-skipped") === "1",
      );
    } catch {
      // ignore
    }
  }, []);

  const status = useMemo(
    () => getCompanySetupStatus(company, servicesCount, hasOffice),
    [company, servicesCount, hasOffice],
  );

  const completedMap = {
    ...status,
    services: status.services || servicesSkipped,
  };

  const pageStepsComplete = completedMap.logo && completedMap.basic;
  const allComplete = STEPS.every((step) => completedMap[step.key]);
  const completedCount = STEPS.filter((step) => completedMap[step.key]).length;
  const progressPercent = Math.round((completedCount / STEPS.length) * 100);

  const currentStepIndex = STEPS.findIndex((step) => !completedMap[step.key]);
  const activeStep =
    currentStepIndex === -1 ? STEPS.length : currentStepIndex + 1;
  const activeStepData = STEPS[Math.min(activeStep, STEPS.length) - 1];

  const tipStep =
    STEPS.find((step) => step.key === focusedStepKey) || activeStepData;

  const tipTone = allComplete
    ? "success"
    : tipStep?.key === "logo"
      ? "warning"
      : "info";

  const handleDismissTip = () => {
    setTipDismissed(true);
    try {
      sessionStorage.setItem(TIP_DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };

  const handleShowTip = () => {
    setTipDismissed(false);
    try {
      sessionStorage.removeItem(TIP_DISMISS_KEY);
    } catch {
      // ignore
    }
  };

  const handleSkipServices = () => {
    setServicesSkipped(true);
    try {
      sessionStorage.setItem("company-setup-services-skipped", "1");
    } catch {
      // ignore
    }
  };

  const handleContinue = () => {
    if (!pageStepsComplete) return;
    router.push(hrSettingsHref("shifts"));
  };

  if (allComplete && hrRequiredComplete) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      {/* Top row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Company setup
            </h3>
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {progressPercent}%
            </span>
            {progressPercent < 100 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Please complete your company setup
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tipDismissed && (
            <button
              type="button"
              onClick={handleShowTip}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Tip
            </button>
          )}
          {!completedMap.services && pageStepsComplete && (
            <button
              type="button"
              onClick={handleSkipServices}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip services
            </button>
          )}
          {!completedMap.office && (
            <ButtonTw
              type="button"
              size="sm"
              disabled={!pageStepsComplete}
              onClick={handleContinue}
              className="!h-8 !px-3 !text-xs font-semibold"
            >
              Continue to HR Settings
              <i className="fa-solid fa-arrow-right ml-1.5 text-[10px]" />
            </ButtonTw>
          )}
          {allComplete && !hrRequiredComplete && (
            <ButtonTw
              type="button"
              size="sm"
              onClick={handleContinue}
              className="!h-8 !px-3 !text-xs font-semibold"
            >
              Go to HR Settings
              <i className="fa-solid fa-arrow-right ml-1.5 text-[10px]" />
            </ButtonTw>
          )}
        </div>
      </div>

      {/* Compact horizontal stepper — click a step to preview its tip */}
      <div className="mt-3 flex items-center">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedMap[step.key];
          const isActive = !isCompleted && activeStep === index + 1;
          const isFocused = focusedStepKey === step.key;
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.key} className="flex min-w-0 flex-1 items-center">
              <button
                type="button"
                onClick={() => {
                  setFocusedStepKey(step.key);
                  if (tipDismissed) handleShowTip();
                  if (step.key === "office" && pageStepsComplete) {
                    handleContinue();
                  }
                }}
                className="flex min-w-0 items-center gap-1.5 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                title={step.tip}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] transition-colors",
                    isCompleted &&
                      "border-emerald-500 bg-emerald-500 text-white",
                    (isActive || isFocused) &&
                      !isCompleted &&
                      "border-blue-600 bg-blue-600 text-white",
                    !isCompleted &&
                      !isActive &&
                      !isFocused &&
                      "border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </div>
                <span
                  className={cn(
                    "truncate text-xs font-medium",
                    isCompleted && "text-emerald-600 dark:text-emerald-400",
                    (isActive || isFocused) &&
                      !isCompleted &&
                      "text-blue-700 dark:text-blue-300",
                    !isCompleted &&
                      !isActive &&
                      !isFocused &&
                      "text-gray-500 dark:text-gray-400",
                  )}
                >
                  {step.label}
                  {step.required && <span className="text-red-500">*</span>}
                </span>
              </button>

              {!isLast && (
                <div className="mx-2 h-px min-w-4 flex-1 bg-gray-200 dark:bg-gray-700">
                  <div
                    className={cn(
                      "h-full bg-emerald-500 transition-all",
                      isCompleted ? "w-full" : "w-0",
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contextual coach tip — one message at a time */}
      {!tipDismissed && tipStep && (
        <div
          className={cn(
            "mt-2.5 flex items-start gap-2 rounded-lg border px-2.5 py-2 text-xs leading-snug",
            tipTone === "success" &&
              "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200",
            tipTone === "warning" &&
              "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200",
            tipTone === "info" &&
              "border-blue-100 bg-blue-50/80 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200",
          )}
        >
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" />
          <p className="min-w-0 flex-1">
            <span className="font-semibold">{tipStep.tipTitle}: </span>
            {pageStepsComplete && tipStep.key === "office" && !completedMap.office
              ? "Company profile is ready. Continue to HR Settings to configure office, shifts, weekends, departments, and designations."
              : allComplete && !hrRequiredComplete
                ? "Company setup steps are complete. Continue to HR Settings to finish shifts, weekends, departments, and designations."
                : tipStep.tip}
          </p>
          <button
            type="button"
            onClick={handleDismissTip}
            className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
            aria-label="Dismiss tip"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanySetupProgress;
