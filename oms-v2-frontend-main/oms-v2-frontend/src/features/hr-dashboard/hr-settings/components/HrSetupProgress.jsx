"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  Lightbulb,
  CalendarOff,
  X,
} from "lucide-react";

const WEEKEND_DAYS = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

const STEPS = [
  {
    key: "shifts",
    label: "Shifts",
    tipTitle: "Set company shifts",
    tip: "Open an office and add working hours or shifts (start/end times).",
    icon: Clock3,
    required: true,
    tab: "office",
  },
  {
    key: "weekends",
    label: "Weekends",
    tipTitle: "Set weekends",
    tip: "From the Office tab, configure weekend days for each office.",
    icon: CalendarOff,
    required: true,
    tab: "office",
  },
  {
    key: "departments",
    label: "Departments",
    tipTitle: "Add departments",
    tip: "Create at least one company department under the Departments tab.",
    icon: Building2,
    required: true,
    tab: "departments",
  },
  {
    key: "designations",
    label: "Designations",
    tipTitle: "Add designations",
    tip: "Create at least one designation under the Designations tab.",
    icon: Briefcase,
    required: true,
    tab: "designations",
  },
  {
    key: "holidays",
    label: "Holidays",
    tipTitle: "Add holidays",
    tip: "Optional — add office holidays, or skip for now.",
    icon: CalendarDays,
    required: false,
    tab: "office-holidays",
  },
];

const TIP_DISMISS_KEY = "hr-setup-tip-dismissed";

const hasActiveWeekendDay = (weekend) =>
  WEEKEND_DAYS.some((day) => Boolean(weekend?.[day]));

const officeHasWorkingHours = (office) => {
  if (!office) return false;
  const shiftCount = Array.isArray(office.officeShifts)
    ? office.officeShifts.length
    : Array.isArray(office.shifts)
      ? office.shifts.length
      : 0;

  if (shiftCount > 0) return true;
  if (office.hasShift) return true;
  return Boolean(office.startTime && office.endTime);
};

export const getHrSetupStatus = ({
  offices = [],
  weekends = [],
  departmentsTotal = 0,
  designationsTotal = 0,
  holidaysTotal = 0,
} = {}) => {
  const officeList = Array.isArray(offices) ? offices : [];
  const weekendList = Array.isArray(weekends) ? weekends : [];

  const hasShifts =
    officeList.length > 0 && officeList.some(officeHasWorkingHours);

  const weekendOfficeIds = new Set(
    weekendList
      .filter((w) => hasActiveWeekendDay(w))
      .map((w) => w.officeId)
      .filter(Boolean),
  );

  const hasOfficeWeekends = officeList.some((office) =>
    (office.officeWeekends || []).some(hasActiveWeekendDay),
  );

  const hasShiftWeekends = officeList.some((office) =>
    (office.officeShifts || []).some((shift) => {
      const weekends = Array.isArray(shift.weekends)
        ? shift.weekends
        : shift.weekends
          ? [shift.weekends]
          : [];
      return weekends.some(hasActiveWeekendDay);
    }),
  );

  const hasWeekends =
    weekendOfficeIds.size > 0 || hasOfficeWeekends || hasShiftWeekends;

  return {
    shifts: hasShifts,
    weekends: hasWeekends,
    departments: Number(departmentsTotal) > 0,
    designations: Number(designationsTotal) > 0,
    holidays: Number(holidaysTotal) > 0,
  };
};

const HrSetupProgress = ({
  offices = [],
  weekends = [],
  departmentsTotal = 0,
  designationsTotal = 0,
  holidaysTotal = 0,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [holidaysSkipped, setHolidaysSkipped] = useState(false);
  const [tipDismissed, setTipDismissed] = useState(false);
  const [focusedStepKey, setFocusedStepKey] = useState(null);

  useEffect(() => {
    try {
      setTipDismissed(sessionStorage.getItem(TIP_DISMISS_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  const status = useMemo(
    () =>
      getHrSetupStatus({
        offices,
        weekends,
        departmentsTotal,
        designationsTotal,
        holidaysTotal,
      }),
    [offices, weekends, departmentsTotal, designationsTotal, holidaysTotal],
  );

  const completedMap = {
    ...status,
    holidays: status.holidays || holidaysSkipped,
  };

  const requiredComplete = STEPS.filter((s) => s.required).every(
    (s) => completedMap[s.key],
  );
  const allComplete = STEPS.every((s) => completedMap[s.key]);
  const completedCount = STEPS.filter((s) => completedMap[s.key]).length;
  const progressPercent = Math.round((completedCount / STEPS.length) * 100);

  const currentStepIndex = STEPS.findIndex((step) => !completedMap[step.key]);
  const activeStep =
    currentStepIndex === -1 ? STEPS.length : currentStepIndex + 1;
  const activeStepData = STEPS[Math.min(activeStep, STEPS.length) - 1];
  const tipStep =
    STEPS.find((step) => step.key === focusedStepKey) || activeStepData;

  const tipTone = allComplete
    ? "success"
    : tipStep?.required && !completedMap[tipStep.key]
      ? "warning"
      : "info";

  const goToStepTab = (tabKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabKey);
    params.set("page", "1");
    if (!params.get("limit")) params.set("limit", "10");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

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

  // Hide entirely once everything (including optional) is done
  if (allComplete) return null;

  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              HR setup
            </h3>
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {progressPercent}%
            </span>
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
          {!completedMap.holidays && requiredComplete && (
            <button
              type="button"
              onClick={() => setHolidaysSkipped(true)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip holidays
            </button>
          )}
          {tipStep && !completedMap[tipStep.key] && (
            <button
              type="button"
              onClick={() => goToStepTab(tipStep.tab)}
              className="rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Go to {tipStep.label}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center overflow-x-auto pb-0.5">
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
                  goToStepTab(step.tab);
                }}
                className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
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
            {tipStep.tip}
          </p>
          <button
            type="button"
            onClick={handleDismissTip}
            className="shrink-0 cursor-pointer rounded p-0.5 opacity-60 transition hover:opacity-100"
            aria-label="Dismiss tip"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default HrSetupProgress;
