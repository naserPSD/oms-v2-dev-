"use client";

import { Users } from "lucide-react";

const CHIP = {
  present:
    "bg-secondaryColor/15 text-secondaryColor border-secondaryColor/30 dark:bg-secondaryColor/20 dark:text-secondaryColor dark:border-secondaryColor/40",
  late: "bg-primaryColor/10 text-primaryColor dark:text-primaryColor-400 border-primaryColor/25 dark:bg-primaryColor/20 dark:border-primaryColor/40",
  absent:
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
};

const OPTIONS = [
  { key: "present", label: "Present" },
  { key: "late", label: "Late" },
  { key: "absent", label: "Absent" },
];

export default function RosterPanel({
  attendees = [],
  canMark = false,
  onMark,
}) {
  return (
    <div className="admin-card p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold admin-text flex items-center gap-2 mb-3">
        <Users
          size={15}
          className="text-primaryColor dark:text-primaryColor-400"
        />
        Roster
        <span className="ml-auto text-[11px] font-medium admin-text-muted">
          {attendees.filter((a) => a.online).length} online
        </span>
      </h3>

      {!canMark && (
        <p className="text-[11px] admin-text-subtle mb-3">
          Attendance marking is available to HR during a live meeting.
        </p>
      )}

      <ul className="space-y-3 overflow-y-auto flex-1 max-h-[420px] pr-1">
        {attendees.length === 0 ? (
          <li className="text-sm admin-text-muted text-center py-6">
            No attendees listed yet.
          </li>
        ) : (
          attendees.map((person) => (
            <li
              key={person.id || person.employeeId || person.email}
              className="rounded-lg border border-gray-200 dark:border-gray-700 p-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-primaryColor/15 dark:bg-primaryColor/25 flex items-center justify-center text-[11px] font-bold text-primaryColor dark:text-primaryColor-400">
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${
                      person.online ? "bg-secondaryColor" : "bg-gray-400 dark:bg-gray-500"
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium admin-text truncate">
                    {person.name}
                  </p>
                  <p className="text-[11px] admin-text-subtle truncate">
                    {person.role}
                  </p>
                </div>
              </div>

              {canMark ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() =>
                        onMark?.(person.employeeId || person.id, opt.key, person)
                      }
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
                        person.attendance === opt.key
                          ? CHIP[opt.key]
                          : "bg-transparent admin-text-muted border-gray-200 dark:border-gray-600 hover:border-primaryColor/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : person.attendance ? (
                <span
                  className={`mt-2 inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${CHIP[person.attendance] || CHIP.absent}`}
                >
                  {person.attendance}
                </span>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
