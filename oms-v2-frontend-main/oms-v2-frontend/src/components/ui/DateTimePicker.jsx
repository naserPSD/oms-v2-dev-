"use client";

import React from "react";
import { useAutoRequired } from "@/hooks/useRequiredFields";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";
import { parseISO, isValid, format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";

const sizeClasses = {
  sm: "p-2 text-xs h-[34px]",
  md: "p-2.5 text-sm h-[42px]",
  lg: "p-4 text-base h-[50px]",
  xl: "p-5 text-lg h-14",
};

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

const DateTimePicker = ({
  label,
  error,
  value,
  onChange,
  name,
  placeholder = "Select",
  size = "sm",
  mode = "date", // "date" | "time" | "datetime"
  options = {},
  className,
  required = false,
  ...props
}) => {
  const autoRequired = useAutoRequired(name);
  const dateValue = React.useMemo(() => {
    if (!value) return null;

    // Handle time-only values like "14:30:00" or "14:30"
    if (mode === "time" && typeof value === "string") {
      if (value.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        // Create a date object with today's date and the provided time
        const today = new Date();
        const [hours, minutes, seconds = "00"] = value.split(":");
        today.setHours(
          Number.parseInt(hours),
          Number.parseInt(minutes),
          Number.parseInt(seconds),
          0
        );
        return today;
      }
    }

    // Handle ISO date strings
    if (typeof value === "string" && isValid(parseISO(value))) {
      return parseISO(value);
    }

    // Handle Date objects
    if (value instanceof Date && isValid(value)) {
      return value;
    }

    return null;
  }, [value, mode]);

  const modeOptions = React.useMemo(() => {
    const baseOptions = {
      allowInput: true,
      clickOpens: true,
      closeOnSelect: mode === "date",
      onClose: (selectedDates, dateStr, instance) => {
        // Only close if user clicked outside or pressed escape
        // Don't close when selecting time values
        if (mode === "time" || mode === "datetime") {
          // Allow manual closing by clicking outside
          return true;
        }
      },
    };

    switch (mode) {
      case "date":
        return {
          ...baseOptions,
          enableTime: false,
          noCalendar: false,
          dateFormat: "Y-m-d",
          closeOnSelect: true,
        };
      case "time":
        return {
          ...baseOptions,
          enableTime: true,
          noCalendar: true,
          dateFormat: "H:i:S",
          time_24hr: true,
          closeOnSelect: false,
          onValueUpdate: (selectedDates, dateStr, instance) => {
            // Don't close the picker when time is being selected
          },
        };
      case "datetime":
        return {
          ...baseOptions,
          enableTime: true,
          noCalendar: false,
          dateFormat: "Y-m-d H:i:S",
          time_24hr: true,
          closeOnSelect: false,
        };
      default:
        return baseOptions;
    }
  }, [mode]);

  const handleChange = React.useCallback(
    (dateArray) => {
      if (!onChange) return;

      if (dateArray && dateArray[0] instanceof Date) {
        const selectedDate = dateArray[0];

        if (mode === "time") {
          const timeString = format(selectedDate, "HH:mm:ss");
          onChange(timeString);
        } else if (mode === "datetime") {
          onChange(selectedDate.toISOString());
        } else {
          // date mode
          onChange(format(selectedDate, "yyyy-MM-dd"));
        }
      } else {
        onChange("");
      }
    },
    [onChange, mode]
  );

  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <span>{label}</span>
            {(required || props.required || autoRequired) && !hasAsterisk(label) && (
              <span className="text-red-500 font-bold select-none leading-none">*</span>
            )}
          </span>
        </label>
      )}

      <Flatpickr
        id={name}
        name={name}
        className={`block w-full border rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
          sizeClasses[size]
        } ${error ? "border-red-500" : ""}`}
        placeholder={placeholder}
        value={dateValue}
        onChange={handleChange}
        options={{ ...modeOptions, ...options }}
        render={({ defaultValue, value, ...props }, ref) => (
          <div className="relative">
            <input
              {...props}
              ref={ref}
              defaultValue={defaultValue}
              value={value}
              onFocus={(e) => {
                if (mode === "time" || mode === "datetime") {
                  // Keep picker open when focusing on time inputs
                  e.target.blur();
                  e.target.focus();
                }
              }}
            />
            <div className="absolute top-0 right-0 flex items-center px-2 py-2 pointer-events-none">
              {mode === "time" ? (
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </div>
        )}
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default DateTimePicker;
