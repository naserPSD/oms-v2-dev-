"use client";

import { CheckSquare, Square } from "lucide-react";

export default function AgendaChecklist({
  agenda = [],
  editable = false,
  onToggle,
}) {
  if (!agenda.length) {
    return (
      <p className="text-sm admin-text-muted py-4 text-center">
        No agenda items yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {agenda.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            disabled={!editable}
            onClick={() => editable && onToggle?.(item.id)}
            className={`w-full flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
              item.done
                ? "border-primaryColor/20 bg-primaryColor/5 dark:bg-primaryColor/10"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40"
            } ${editable ? "hover:border-primaryColor/40 cursor-pointer" : "cursor-default"}`}
          >
            {item.done ? (
              <CheckSquare
                size={16}
                className="text-primaryColor dark:text-primaryColor-400 shrink-0 mt-0.5"
              />
            ) : (
              <Square
                size={16}
                className="text-gray-400 dark:text-gray-500 shrink-0 mt-0.5"
              />
            )}
            <span
              className={`text-sm ${
                item.done
                  ? "admin-text-muted line-through"
                  : "admin-text font-medium"
              }`}
            >
              {item.text}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
