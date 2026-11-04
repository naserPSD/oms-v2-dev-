"use client";

import React, { useState, useId } from "react";
import { useAutoRequired } from "@/hooks/useRequiredFields";
import { format, parseISO, isValid } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Input from "./Input";
import { ScrollArea } from "./scroll-area";

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
  placeholder = "Select date and time",
  size = "md",
  mode = "datetime", // "date" | "time" | "datetime"
  className = "",
  disabled = false,
  required = false,
  ...props
}) => {
  const autoRequired = useAutoRequired(name);
  const id = useId();
  const today = new Date();

  // Parse the initial value
  const initialDate = React.useMemo(() => {
    if (!value) return today;

    if (typeof value === "string" && isValid(parseISO(value))) {
      return parseISO(value);
    }

    if (value instanceof Date && isValid(value)) {
      return value;
    }

    return today;
  }, [value]);

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(
    value ? format(initialDate, "HH:mm:ss") : "12:00:00"
  );
  const [showTimeInput, setShowTimeInput] = useState(mode !== "date");

  // Time slots for quick selection
  const timeSlots = [
    { time: "00:00", label: "12:00 AM" },
    { time: "00:30", label: "12:30 AM" },
    { time: "01:00", label: "1:00 AM" },
    { time: "01:30", label: "1:30 AM" },
    { time: "02:00", label: "2:00 AM" },
    { time: "02:30", label: "2:30 AM" },
    { time: "03:00", label: "3:00 AM" },
    { time: "03:30", label: "3:30 AM" },
    { time: "04:00", label: "4:00 AM" },
    { time: "04:30", label: "4:30 AM" },
    { time: "05:00", label: "5:00 AM" },
    { time: "05:30", label: "5:30 AM" },
    { time: "06:00", label: "6:00 AM" },
    { time: "06:30", label: "6:30 AM" },
    { time: "07:00", label: "7:00 AM" },
    { time: "07:30", label: "7:30 AM" },
    { time: "08:00", label: "8:00 AM" },
    { time: "08:30", label: "8:30 AM" },
    { time: "09:00", label: "9:00 AM" },
    { time: "09:30", label: "9:30 AM" },
    { time: "10:00", label: "10:00 AM" },
    { time: "10:30", label: "10:30 AM" },
    { time: "11:00", label: "11:00 AM" },
    { time: "11:30", label: "11:30 AM" },
    { time: "12:00", label: "12:00 PM" },
    { time: "12:30", label: "12:30 PM" },
    { time: "13:00", label: "1:00 PM" },
    { time: "13:30", label: "1:30 PM" },
    { time: "14:00", label: "2:00 PM" },
    { time: "14:30", label: "2:30 PM" },
    { time: "15:00", label: "3:00 PM" },
    { time: "15:30", label: "3:30 PM" },
    { time: "16:00", label: "4:00 PM" },
    { time: "16:30", label: "4:30 PM" },
    { time: "17:00", label: "5:00 PM" },
    { time: "17:30", label: "5:30 PM" },
    { time: "18:00", label: "6:00 PM" },
    { time: "18:30", label: "6:30 PM" },
    { time: "19:00", label: "7:00 PM" },
    { time: "19:30", label: "7:30 PM" },
    { time: "20:00", label: "8:00 PM" },
    { time: "20:30", label: "8:30 PM" },
    { time: "21:00", label: "9:00 PM" },
    { time: "21:30", label: "9:30 PM" },
    { time: "22:00", label: "10:00 PM" },
    { time: "22:30", label: "10:30 PM" },
    { time: "23:00", label: "11:00 PM" },
    { time: "23:30", label: "11:30 PM" },
  ];

  // Handle date selection
  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);

      // Combine with current time and trigger onChange
      if (mode !== "date") {
        const [hours, minutes, seconds] = selectedTime.split(":");
        date.setHours(
          Number.parseInt(hours),
          Number.parseInt(minutes),
          Number.parseInt(seconds || "00")
        );
        onChange(date.toISOString());
      } else {
        // For date-only mode, set time to start of day
        date.setHours(0, 0, 0, 0);
        onChange(date.toISOString());
      }
    }
  };

  // Handle time selection from quick slots
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    const [hours, minutes] = time.split(":");
    const newDate = new Date(selectedDate);
    newDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0);
    setSelectedDate(newDate);
    onChange(newDate.toISOString());
  };

  // Handle manual time input
  const handleTimeInputChange = (e) => {
    const timeValue = e.target.value;
    if (timeValue) {
      setSelectedTime(timeValue + ":00"); // Add seconds for consistency
      const [hours, minutes] = timeValue.split(":");
      const newDate = new Date(selectedDate);
      newDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0);
      setSelectedDate(newDate);
      onChange(newDate.toISOString());
    }
  };

  // Toggle time input visibility
  const toggleTimeInput = () => {
    setShowTimeInput(!showTimeInput);
  };

  // Size classes for consistent styling
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <Label
          htmlFor={id}
          className={`block mb-2 font-medium text-gray-900 dark:text-white ${sizeClasses[size]}`}
        >
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <span>{label}</span>
            {(required || props.required || autoRequired) && !hasAsterisk(label) && (
              <span className="text-red-500 font-bold select-none leading-none">*</span>
            )}
          </span>
        </Label>
      )}

      <div className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
        {/* Calendar Section */}
        <div className="flex max-sm:flex-col">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="p-2 sm:pe-5"
            disabled={[
              { before: today }, // Disable dates before today
            ]}
          />

          {/* Time Selection Section */}
          {(mode === "datetime" || mode === "time") && (
            <div className="relative w-full max-sm:h-48 sm:w-40">
              <div className="absolute inset-0 py-4 max-sm:border-t">
                <ScrollArea className="h-full sm:border-s">
                  <div className="space-y-3">
                    {/* Date Header */}
                    <div className="flex h-5 shrink-0 items-center px-5">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {format(selectedDate, "EEEE, MMM d")}
                      </p>
                    </div>

                    {/* Quick Time Slots */}
                    <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                      {timeSlots.map(({ time, label }) => (
                        <Button
                          key={time}
                          variant={
                            selectedTime.startsWith(time)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="w-full"
                          onClick={() => handleTimeSelect(time)}
                          disabled={disabled}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>

                    {/* Manual Time Input */}
                    <div className="px-5 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`${id}-time`}
                          className="text-xs text-gray-600 dark:text-gray-400"
                        >
                          Custom time
                        </Label>
                        <div className="relative grow">
                          <Input
                            id={`${id}-time`}
                            type="time"
                            step="300" // 5 minute steps
                            value={selectedTime.slice(0, 5)} // Remove seconds for input
                            onChange={handleTimeInputChange}
                            className="peer appearance-none ps-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            disabled={disabled}
                          />
                          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/80 peer-disabled:opacity-50">
                            <Clock size={14} aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>

        {/* Display Selected DateTime */}
        <div className="border-t p-3 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Selected:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {format(selectedDate, "MMM d, yyyy")}
              {(mode === "datetime" || mode === "time") &&
                ` at ${format(selectedDate, "hh:mm a")}`}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default DateTimePicker;
