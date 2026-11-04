"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";

/**
 * Reusable instruction and prerequisite dependency banner for Payroll Management pages.
 *
 * @param {Object} props
 * @param {number} props.stepNumber Current step in the 5-step payroll setup (1 to 5)
 * @param {string} props.stepTitle Title of the current payroll configuration step
 * @param {string} props.description Explanatory instructions for what this page does
 * @param {Array} props.prerequisites Dependent data needed: [{ label, href, count, isRequired, isMissing, helperText }]
 * @param {Object} [props.nextStep] Link to the next payroll setup page { label, href }
 * @param {Object} [props.prevStep] Link to the previous payroll setup page { label, href }
 * @param {string} [props.storageKey] Unique key to remember collapse state in localStorage
 */
const PayrollPageInstructionBanner = ({
  stepNumber = 1,
  stepTitle = "",
  description = "",
  prerequisites = [],
  nextStep = null,
  prevStep = null,
  storageKey = "",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined" && storageKey) {
      return localStorage.getItem(`payroll_banner_${storageKey}`) === "collapsed";
    }
    return false;
  });

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (typeof window !== "undefined" && storageKey) {
      localStorage.setItem(
        `payroll_banner_${storageKey}`,
        newState ? "collapsed" : "expanded",
      );
    }
  };

  const hasMissingPrerequisites = prerequisites.some((p) => p.isMissing);

  return (
    <div
      className={`mb-6 rounded-2xl border transition-all duration-200 ${
        hasMissingPrerequisites
          ? "border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-white dark:border-amber-900/60 dark:from-amber-950/40 dark:via-gray-900/40 dark:to-gray-900"
          : "border-sky-200/80 bg-gradient-to-r from-sky-50/90 via-indigo-50/40 to-white dark:border-sky-900/50 dark:from-sky-950/30 dark:via-gray-900/40 dark:to-gray-900"
      } shadow-sm`}
    >
      {/* Banner Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              hasMissingPrerequisites
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                : "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
            }`}
          >
            {hasMissingPrerequisites ? (
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            ) : (
              <Lightbulb className="h-5 w-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  hasMissingPrerequisites
                    ? "bg-amber-200/80 text-amber-900 dark:bg-amber-900/70 dark:text-amber-200"
                    : "bg-sky-200/80 text-sky-900 dark:bg-sky-900/70 dark:text-sky-200"
                }`}
              >
                <Layers className="h-3 w-3" /> Step {stepNumber} of 5
              </span>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                {stepTitle}
              </h2>
            </div>
            {hasMissingPrerequisites && (
              <p className="mt-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                Action required: Prerequisite data is missing before you can fully configure this page.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleCollapse}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-white/80 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label={isCollapsed ? "Expand instructions" : "Collapse instructions"}
          >
            {isCollapsed ? (
              <>
                <span>View Guide & Dependencies</span>
                <ChevronDown className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Minimize</span>
                <ChevronUp className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Content Body */}
      {!isCollapsed && (
        <div className="border-t border-gray-200/60 px-5 py-4 dark:border-gray-800/80">
          {/* Main Instructional Text */}
          <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
            {description}
          </p>

          {/* Prerequisite Dependencies Cards */}
          {prerequisites.length > 0 && (
            <div className="mt-3.5 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Prerequisite Data Required for This Page:
              </h3>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {prerequisites.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col justify-between rounded-xl border p-3 transition-all ${
                      item.isMissing
                        ? "border-amber-300 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20"
                        : "border-gray-200 bg-white/80 dark:border-gray-800 dark:bg-gray-900/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                          {item.label}
                        </span>
                        {item.isMissing ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            <AlertTriangle className="h-3 w-3" /> Missing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" /> Ready
                            {item.count !== undefined && item.count !== null
                              ? ` (${item.count})`
                              : ""}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
                        {item.helperText}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                      <Link
                        href={item.href}
                        className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-colors ${
                          item.isMissing
                            ? "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-gray-900 dark:hover:bg-amber-400"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span>{item.isMissing ? `Go Setup ${item.label}` : `Manage ${item.label}`}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Flow Navigation Links */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200/60 pt-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <div>
              {prevStep ? (
                <Link
                  href={prevStep.href}
                  className="inline-flex items-center gap-1 font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous: {prevStep.label}</span>
                </Link>
              ) : (
                <span className="text-gray-400 dark:text-gray-600">Start of Payroll Setup Flow</span>
              )}
            </div>

            <div>
              {nextStep ? (
                <Link
                  href={nextStep.href}
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>Next: {nextStep.label}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Final Step: Monthly Payroll Disbursement
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPageInstructionBanner;
