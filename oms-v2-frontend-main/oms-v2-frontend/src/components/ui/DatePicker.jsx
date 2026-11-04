import React, { useMemo } from "react";
import { useAutoRequired } from "@/hooks/useRequiredFields";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";
import { parseISO, isValid, format } from "date-fns";
import { CalendarIcon, XCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const EMPTY_OPTIONS = {};

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

const DatePicker = ({
  label,
  error,
  value,
  onChange,
  name,
  placeholder = "Select Date",
  options = EMPTY_OPTIONS,
  size = "sm",
  className,
  inputClassName,
  disabled = false,
  mode = "single", // 'single' or 'range'
  minDate, // Minimum selectable date
  maxDate, // Maximum selectable date
  enableTime = false, // Enable time selection
  timeFormat = "H:i", // Time format
  time24hr = true,
  dateFormat = "Y-m-d", // Date format
  clearable = false, // Show clear button
  compact = false,
  required = false,
  ...props
}) => {
  const autoRequired = useAutoRequired(name);
  // Convert string value(s) to Date object(s) for Flatpickr
  const getDateValue = () => {
    if (!value) return null;

    if (mode === "range" && Array.isArray(value)) {
      return value.map(date =>
        date && isValid(parseISO(date)) ? parseISO(date) : null
      ).filter(Boolean);
    }

    return value && isValid(parseISO(value)) ? parseISO(value) : null;
  };

  // Check if there's a selected value
  const hasValue = () => {
    if (!value) return false;
    if (mode === "range" && Array.isArray(value)) {
      return value.length > 0 && value.some(v => v);
    }
    return true;
  };

  // Handle Flatpickr's date array and convert based on mode
  const handleChange = (selectedDates) => {
    if (!onChange) return;

    if (mode === "range") {
      if (selectedDates && selectedDates.length === 2) {
        // Format range as array of YYYY-MM-DD strings
        const range = selectedDates.map(date =>
          date ? format(date, "yyyy-MM-dd") : ""
        );
        onChange(range);
      } else if (selectedDates && selectedDates.length === 0) {
        onChange([]);
      }
    } else {
      // Single date mode
      if (selectedDates && selectedDates[0] instanceof Date) {
        if (enableTime) {
          // Include time in ISO format
          onChange(selectedDates[0].toISOString());
        } else {
          onChange(format(selectedDates[0], "yyyy-MM-dd"));
        }
      } else {
        onChange("");
      }
    }
  };

  // Handle clear button click
  const handleClear = (e) => {
    e.stopPropagation(); // Prevent flatpickr from opening

    if (mode === "range") {
      onChange([]);
    } else {
      onChange("");
    }
  };

  const minStamp =
    minDate instanceof Date ? Math.floor(minDate.getTime() / 60000) : minDate ?? "";
  const maxStamp =
    maxDate instanceof Date ? Math.floor(maxDate.getTime() / 60000) : maxDate ?? "";

  // Keep this object stable. A new options object on each keystroke
  // makes react-flatpickr destroy the calendar before the time is chosen.
  const resolvedTimeFormat =
    enableTime && !time24hr && timeFormat === "H:i" ? "h:i K" : timeFormat;

  const flatpickrOptions = useMemo(
    () => ({
      ...options,
      mode,
      enableTime,
      closeOnSelect: !enableTime,
      dateFormat: enableTime ? `${dateFormat} ${resolvedTimeFormat}` : dateFormat,
      time_24hr: time24hr,
      minDate,
      maxDate,
      disable: disabled ? [() => true] : [],
      allowInput: false,
    }),
    // minDate/maxDate are read from the render that produced these stamps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options, mode, enableTime, dateFormat, resolvedTimeFormat, time24hr, disabled, minStamp, maxStamp],
  );

  const dateValue = getDateValue();
  const flatpickrValue = Array.isArray(dateValue)
    ? dateValue
    : dateValue instanceof Date
      ? format(
          dateValue,
          enableTime
            ? time24hr
              ? "yyyy-MM-dd HH:mm"
              : "yyyy-MM-dd h:mm a"
            : "yyyy-MM-dd",
        )
      : "";

  return (
    <div className={cn(compact ? "mb-0" : "mb-5", className)}>
      {label && (
        <label
          htmlFor={name}
          className={cn(
            "block text-sm font-medium text-gray-900 dark:text-white",
            compact ? "mb-1" : "mb-2",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <span>{label}</span>
            {(required || props.required || autoRequired) && !hasAsterisk(label) && (
              <span className="text-red-500 font-bold select-none leading-none">*</span>
            )}
          </span>
        </label>
      )}
      <div className="relative">
        <Flatpickr
          id={name}
          name={name}
          className={cn(
            "block w-full border rounded-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
            sizeClasses[size] || "",
            error && "border-red-500",
            disabled && "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-600",
            inputClassName
          )}
          placeholder={placeholder}
          value={flatpickrValue}
          onChange={handleChange}
          options={flatpickrOptions}
          disabled={disabled}
          {...props}
        />
        <div className="absolute top-0 right-0 flex items-center h-full px-2">
          {clearable && hasValue() && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="focus:outline-none hover:opacity-75 transition-opacity"
              aria-label="Clear date"
            >
              <XCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
            </button>
          )}
          <div className={`${clearable && hasValue() && !disabled ? 'ml-1' : ''} pointer-events-none`}>
            <CalendarIcon className={`w-4 h-4 ${disabled
                ? "text-gray-300 dark:text-gray-600"
                : "text-gray-500 dark:text-gray-400"
              }`} />
          </div>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default DatePicker;