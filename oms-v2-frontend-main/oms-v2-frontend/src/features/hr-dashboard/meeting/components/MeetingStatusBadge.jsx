"use client";

const STATUS_STYLES = {
  live: "bg-secondaryColor/15 text-secondaryColor border border-secondaryColor/30",
  upcoming:
    "bg-primaryColor/10 text-primaryColor dark:text-primaryColor-400 border border-primaryColor/20",
  ended:
    "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600",
};

const LABELS = {
  live: "Live",
  upcoming: "Upcoming",
  ended: "Ended",
};

export default function MeetingStatusBadge({ status }) {
  const key = STATUS_STYLES[status] ? status : "upcoming";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[key]}`}
    >
      {status === "live" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondaryColor opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-secondaryColor" />
        </span>
      )}
      {LABELS[key]}
    </span>
  );
}
