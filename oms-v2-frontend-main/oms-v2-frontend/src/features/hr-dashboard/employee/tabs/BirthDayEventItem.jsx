"use client";
import { useMemo } from "react";
import { differenceInMinutes, format, getMinutes, isPast } from "date-fns";

import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  //getBorderRadiusClasses,
  getEventColorClasses,
} from "@/components/big-calender/utils";

// Using date-fns format with custom formatting:
const formatTimeWithOptionalMinutes = (date) => {
  return format(date, getMinutes(date) === 0 ? "ha" : "h:mma").toLowerCase();
};

// Event details tooltip content generator
const EventTooltipContent = ({ event }) => {
  if (!event) return null;

  const { rawData, type, title, start, end } = event;

  const getEventTypeDisplay = () => {
    switch (type) {
      case "holiday":
        return "🏖️ Holiday";
      case "leave":
        return "📅 Leave";
      case "birthday":
        return "🎂 Birthday";
      case "weekend":
        return "🏢 Weekend";
      default:
        return "📌 Event";
    }
  };

  const getEventSpecificDetails = () => {
    switch (type) {
      case "holiday":
        return (
          <>
            <div className="text-gray-300 text-sm">
              Type: {rawData?.typeName || "Holiday"}
            </div>
            {rawData?.code && (
              <div className="text-gray-300 text-sm">Code: {rawData.code}</div>
            )}
          </>
        );

      case "leave":
        return (
          <>
            <div className="text-gray-300 text-sm">
              Leave Type: {rawData?.typeName || "Leave"}
            </div>
            <div className="text-gray-300 text-sm">
              Duration: {format(new Date(start), "MMM d")} -{" "}
              {format(new Date(end), "MMM d")}
            </div>
            {rawData?.description && (
              <div className="text-gray-300 text-sm">
                Reason: {rawData.description}
              </div>
            )}
          </>
        );

      case "birthday":
        return (
          <>
            <div className="text-gray-300 text-sm">
              Date of Birth:{" "}
              {format(new Date(rawData?.birthday), "MMM d, yyyy")}
            </div>
            <div className="text-gray-300 text-sm">
              Age:{" "}
              {new Date().getFullYear() -
                new Date(rawData?.birthday).getFullYear()}{" "}
              years
            </div>
          </>
        );

      case "weekend":
        return (
          <>
            <div className="text-gray-300 text-sm">
              Office: {rawData?.officeName || "Office"}
            </div>
            <div className="text-gray-300 text-sm">
              Day: {event.dayOfWeek || ""}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-xs p-2">
      <div className="font-semibold mb-2">{title}</div>
      <div className="flex items-center gap-1 mb-2">
        <div
          className={`w-3 h-3 rounded`}
          style={{ backgroundColor: event.color }}
        />
        <div className="text-sm">{getEventTypeDisplay()}</div>
      </div>
      <div className="text-gray-300 text-sm mb-1">
        Date: {format(new Date(start), "PPP")}
      </div>
      {!event.allDay && (
        <div className="text-gray-300 text-sm">
          Time: {format(new Date(start), "h:mm a")} -{" "}
          {format(new Date(end), "h:mm a")}
        </div>
      )}
      {getEventSpecificDetails()}
    </div>
  );
};

// Shared wrapper component for event styling
// function EventWrapper({
//   event,
//   isFirstDay = true,
//   isLastDay = true,
//   isDragging,
//   onClick,
//   className,
//   children,
//   currentTime,
//   dndListeners,
//   dndAttributes,
//   onMouseDown,
//   onTouchStart,
// }) {
//   const displayEnd = currentTime
//     ? new Date(
//         new Date(currentTime).getTime() +
//           (new Date(event.end).getTime() - new Date(event.start).getTime()),
//       )
//     : new Date(event.end);

//   const isEventInPast = isPast(displayEnd);

//   return (
//     <button
//       className={cn(
//         "flex size-full overflow-hidden px-2 text-left font-medium backdrop-blur-md transition outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-dragging:cursor-grabbing data-dragging:shadow-lg data-past-event:line-through sm:px-2",
//         getEventColorClasses(event.color),
//         getBorderRadiusClasses(isFirstDay, isLastDay),
//         className,
//       )}
//       data-dragging={isDragging || undefined}
//       data-past-event={isEventInPast || undefined}
//       onClick={onClick}
//       onMouseDown={onMouseDown}
//       onTouchStart={onTouchStart}
//       {...dndListeners}
//       {...dndAttributes}
//     >
//       {children}
//     </button>
//   );
// }

function EventWrapper({
  event,
  //isFirstDay = true,
 // isLastDay = true,
  isDragging,
  onClick,
 // className,
  children,
  currentTime,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}) {
  const displayEnd = currentTime
    ? new Date(
        new Date(currentTime).getTime() +
          (new Date(event.end).getTime() - new Date(event.start).getTime()),
      )
    : new Date(event.end);

  const isEventInPast = isPast(displayEnd);

  return (
    <button
      // className={cn(
      //   "flex size-full overflow-hidden px-2 text-left font-medium backdrop-blur-md transition outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-dragging:cursor-grabbing data-dragging:shadow-lg data-past-event:line-through sm:px-2",
      //   // Red background with dark/light mode support
      //   "bg-red-500 dark:bg-red-600",
      //   // Text color with proper contrast
      //   "text-white dark:text-gray-100",
      //   getEventColorClasses(event.color),
      //   getBorderRadiusClasses(isFirstDay, isLastDay),
      //   className,
      // )}
      className="w-full"
      data-dragging={isDragging || undefined}
      data-past-event={isEventInPast || undefined}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      {...dndListeners}
      {...dndAttributes}
    >
      {children}
    </button>
  );
}

export function BirthDayEventItem({
  event,
  view,
  isDragging,
  onClick,
  showTime,
  currentTime,
  isFirstDay = true,
  isLastDay = true,
  //children,
  className,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}) {
  const eventColor = event.color;

  // Use the provided currentTime (for dragging) or the event's actual time
  const displayStart = useMemo(() => {
    return currentTime || new Date(event.start);
  }, [currentTime, event.start]);

  const displayEnd = useMemo(() => {
    return currentTime
      ? new Date(
          new Date(currentTime).getTime() +
            (new Date(event.end).getTime() - new Date(event.start).getTime()),
        )
      : new Date(event.end);
  }, [currentTime, event.start, event.end]);

  // Calculate event duration in minutes
  const durationMinutes = useMemo(() => {
    return differenceInMinutes(displayEnd, displayStart);
  }, [displayStart, displayEnd]);

  const getEventTime = () => {
    if (event.allDay) return "All day";

    if (durationMinutes < 45) {
      return formatTimeWithOptionalMinutes(displayStart);
    }

    return `${formatTimeWithOptionalMinutes(
      displayStart,
    )} - ${formatTimeWithOptionalMinutes(displayEnd)}`;
  };

  // Wrapper with tooltip for all views
  const EventWithTooltip = ({ children }) => (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="bg-gray-900 text-white border-gray-700 p-0 overflow-hidden z-50"
        >
          <EventTooltipContent event={event} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  if (view === "month") {
    return (
      // <EventWithTooltip>
      //   <EventWrapper
      //     event={event}
      //     isFirstDay={isFirstDay}
      //     isLastDay={isLastDay}
      //     isDragging={isDragging}
      //     onClick={onClick}
      //     className={cn(
      //       "mt-[var(--event-gap)] h-[var(--event-height)] items-center text-[10px] sm:text-sm hover:opacity-90 ",
      //       className,
      //     )}
      //     currentTime={currentTime}
      //     dndListeners={dndListeners}
      //     dndAttributes={dndAttributes}
      //     onMouseDown={onMouseDown}
      //     onTouchStart={onTouchStart}
      //   >
      //     {/* {children || ( */}
      //     <div className="flex items-center w-full">
      //       <div
      //         className="w-2 h-2 rounded-full mr-1 flex-shrink-0"
      //         style={{ backgroundColor: event.color }}
      //       />
      //       <span className="truncate">
      //         {!event.allDay && (
      //           <span className="truncate font-normal opacity-70 sm:text-[11px]">
      //             {formatTimeWithOptionalMinutes(displayStart)}{" "}
      //           </span>
      //         )}
      //         {event.title}
      //       </span>
      //     </div>
      //     {/* )} */}
      //   </EventWrapper>
      // </EventWithTooltip>
      <EventWithTooltip>
        <EventWrapper
          event={event}
          isFirstDay={isFirstDay}
          isLastDay={isLastDay}
          isDragging={isDragging}
          onClick={onClick}
          className={cn(
            "mt-[var(--event-gap)] h-[var(--event-height)] items-center",
            "text-xs sm:text-sm hover:opacity-90",
            // full title show
            className,
          )}
          currentTime={currentTime}
          dndListeners={dndListeners}
          dndAttributes={dndAttributes}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <div className="flex items-start w-full gap-1">
            {!event.allDay && (
              <span className="text-[10px] sm:text-[11px] opacity-80 shrink-0">
                {formatTimeWithOptionalMinutes(displayStart)}
              </span>
            )}

            <span className="inline-block w-full px-2 py-1 m-1 text-xs sm:text-sm font-medium  rounded-lg bg-red-100 text-red-700 border border-red-200 dark:bg-red-700/40 dark:text-white dark:border-red-700 shadow-sm ">
              {event.title}
            </span>
          </div>
        </EventWrapper>
      </EventWithTooltip>
    );
  }

  if (view === "week" || view === "day") {
    return (
      <EventWithTooltip>
        <EventWrapper
          event={event}
          isFirstDay={isFirstDay}
          isLastDay={isLastDay}
          isDragging={isDragging}
          onClick={onClick}
          className={cn(
            "py-1 hover:opacity-90",
            durationMinutes < 45 ? "items-center" : "flex-col",
            view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
            className,
          )}
          currentTime={currentTime}
          dndListeners={dndListeners}
          dndAttributes={dndAttributes}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <div
            className={`w-full h-1 rounded mb-1`}
            style={{ backgroundColor: event.color }}
          />
          {durationMinutes < 45 ? (
            <div className="truncate">
              {event.title}{" "}
              {showTime && (
                <span className="opacity-70">
                  {formatTimeWithOptionalMinutes(displayStart)}
                </span>
              )}
            </div>
          ) : (
            <>
              <div className="truncate font-medium">{event.title}</div>
              {showTime && (
                <div className="truncate font-normal opacity-70 sm:text-[11px]">
                  {getEventTime()}
                </div>
              )}
            </>
          )}
        </EventWrapper>
      </EventWithTooltip>
    );
  }

  // Agenda view
  return (
    <EventWithTooltip>
      <button
        className={cn(
          "flex w-full flex-col gap-1 rounded p-2 text-left transition outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-past-event:line-through data-past-event:opacity-90 hover:opacity-90",
          getEventColorClasses(eventColor),
          className,
        )}
        data-past-event={isPast(new Date(event.end)) || undefined}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        {...dndListeners}
        {...dndAttributes}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: event.color }}
          />
          <div className="text-sm font-medium truncate">{event.title}</div>
        </div>
        <div className="text-xs opacity-70 ml-5">
          {event.allDay ? (
            <span>All day</span>
          ) : (
            <span className="uppercase">
              {formatTimeWithOptionalMinutes(displayStart)} -{" "}
              {formatTimeWithOptionalMinutes(displayEnd)}
            </span>
          )}
          {event.location && (
            <>
              <span className="px-1 opacity-35"> · </span>
              <span>{event.location}</span>
            </>
          )}
        </div>
        {event.description && (
          <div className="my-1 text-xs opacity-90 ml-5">
            {event.description}
          </div>
        )}
      </button>
    </EventWithTooltip>
  );
}
