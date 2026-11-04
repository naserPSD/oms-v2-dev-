"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAutoRequired } from "@/hooks/useRequiredFields";
import { ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES_5 = Array.from({ length: 12 }, (_, i) => i * 5);
const MINUTES_1 = Array.from({ length: 60 }, (_, i) => i);

function pad(n) {
  return String(n).padStart(2, "0");
}

/** Parse "HH:mm:ss", "HH:mm", or Date-like time strings into { hour24, minute }. */
function parseTimeValue(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();

  // 24h: HH:mm or HH:mm:ss
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const hour24 = Number(match24[1]);
    const minute = Number(match24[2]);
    if (hour24 >= 0 && hour24 <= 23 && minute >= 0 && minute <= 59) {
      return { hour24, minute };
    }
  }

  // 12h: h:mm AM/PM
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hour = Number(match12[1]);
    const minute = Number(match12[2]);
    const period = match12[3].toUpperCase();
    if (hour < 1 || hour > 12 || minute > 59) return null;
    if (period === "AM") {
      hour = hour === 12 ? 0 : hour;
    } else {
      hour = hour === 12 ? 12 : hour + 12;
    }
    return { hour24: hour, minute };
  }

  return null;
}

const hasAsterisk = (val) => {
  if (!val) return false;
  if (typeof val === "string") return val.includes("*");
  if (typeof val === "number") return false;
  if (Array.isArray(val)) return val.some(hasAsterisk);
  if (React.isValidElement(val)) {
    return hasAsterisk(val.props?.children);
  }
  return false;
};

function to12hParts(hour24, minute) {
  const period = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute, period };
}

function formatDisplay(hour24, minute) {
  const { hour12, period } = to12hParts(hour24, minute);
  return `${hour12}:${pad(minute)} ${period}`;
}

function toValue24(hour24, minute) {
  return `${pad(hour24)}:${pad(minute)}:00`;
}

function hour12To24(hour12, period) {
  if (period === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function nearestMinute(minute, step) {
  if (step <= 1) return minute;
  const rounded = Math.round(minute / step) * step;
  return rounded === 60 ? 0 : rounded;
}

function ScrollColumn({
  items,
  value,
  onChange,
  label,
  formatItem = (v) => pad(v),
}) {
  const listRef = useRef(null);
  const itemRefs = useRef({});

  useEffect(() => {
    const el = itemRefs.current[value];
    if (el && listRef.current) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [value]);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div
        ref={listRef}
        className="h-44 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/80 py-1 dark:border-gray-700 dark:bg-gray-800/60"
        role="listbox"
        aria-label={label}
      >
        {items.map((item) => {
          const selected = item === value;
          return (
            <button
              key={item}
              type="button"
              role="option"
              aria-selected={selected}
              ref={(node) => {
                if (node) itemRefs.current[item] = node;
              }}
              onClick={() => onChange(item)}
              className={cn(
                "flex w-full items-center justify-center px-2 py-1.5 text-sm transition-colors",
                selected
                  ? "bg-blue-600 font-semibold text-white"
                  : "text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-gray-700",
              )}
            >
              {formatItem(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Standard clock-style time picker (12h display, 24h value).
 * Value format remains "HH:mm:ss" for API compatibility.
 */
export function TimePicker({
  label,
  value,
  onChange,
  error,
  className,
  name,
  minuteStep = 1,
  disabled = false,
  placeholder = "Select time",
  required = false,
  ...props
}) {
  const autoRequired = useAutoRequired(name);
  const [open, setOpen] = useState(false);

  const parsed = useMemo(() => parseTimeValue(value), [value]);
  const parts = useMemo(() => {
    if (!parsed) {
      return { hour12: 9, minute: 0, period: "AM", hour24: 9 };
    }
    const step = minuteStep > 0 ? minuteStep : 1;
    const minute = nearestMinute(parsed.minute, step);
    const { hour12, period } = to12hParts(parsed.hour24, minute);
    return { hour12, minute, period, hour24: parsed.hour24 };
  }, [parsed, minuteStep]);

  const [draft, setDraft] = useState(parts);

  useEffect(() => {
    if (open) setDraft(parts);
  }, [open, parts]);

  const minutes = useMemo(() => {
    if (minuteStep <= 1) return MINUTES_1;
    if (minuteStep === 5) return MINUTES_5;
    return Array.from(
      { length: Math.ceil(60 / minuteStep) },
      (_, i) => i * minuteStep,
    );
  }, [minuteStep]);

  const applyDraft = (next) => {
    setDraft(next);
    const hour24 = hour12To24(next.hour12, next.period);
    onChange?.(toValue24(hour24, next.minute));
  };

  const display = parsed
    ? formatDisplay(parsed.hour24, parsed.minute)
    : "";

  return (
    <div className={cn("flex flex-col mb-2", className)}>
      {label && (
        <label
          htmlFor={name}
          className="mb-2 text-sm font-medium text-foreground"
        >
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <span>{label}</span>
            {(required || props.required || autoRequired) && !hasAsterisk(label) && (
              <span className="text-red-500 font-bold select-none leading-none">
                *
              </span>
            )}
          </span>
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={name}
            disabled={disabled}
            className={cn(
              "relative flex h-10 w-full items-center rounded-md border bg-gray-50 px-3 text-left text-sm shadow-xs transition-colors",
              "border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30",
              "dark:border-gray-600 dark:bg-gray-700 dark:text-white",
              error && "border-red-500 focus:ring-red-500/30",
              disabled && "cursor-not-allowed opacity-60",
              !display && "text-gray-400",
            )}
          >
            <span className="flex-1 truncate">{display || placeholder}</span>
            <ClockIcon
              size={16}
              className="ml-2 shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="z-[200] w-[280px] p-3 dark:bg-gray-900"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {label || "Select time"}
            </p>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {formatDisplay(
                hour12To24(draft.hour12, draft.period),
                draft.minute,
              )}
            </span>
          </div>

          <div className="flex gap-2">
            <ScrollColumn
              label="Hour"
              items={HOURS_12}
              value={draft.hour12}
              formatItem={(v) => String(v)}
              onChange={(hour12) => applyDraft({ ...draft, hour12 })}
            />
            <ScrollColumn
              label="Min"
              items={minutes}
              value={draft.minute}
              onChange={(minute) => applyDraft({ ...draft, minute })}
            />
            <div className="flex w-16 flex-col">
              <div className="mb-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Period
              </div>
              <div className="flex h-44 flex-col justify-center gap-2">
                {["AM", "PM"].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => applyDraft({ ...draft, period })}
                    className={cn(
                      "rounded-lg border px-2 py-3 text-sm font-semibold transition-colors",
                      draft.period === period
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200",
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
            <button
              type="button"
              className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400"
              onClick={() => {
                onChange?.("");
                setOpen(false);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              onClick={() => {
                // Commit current draft even if user only opened picker and pressed Done
                applyDraft(draft);
                setOpen(false);
              }}
            >
              Done
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
