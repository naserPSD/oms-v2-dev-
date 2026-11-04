"use client";

import { CheckCircle2, Circle, ListTodo } from "lucide-react";

export default function ActionItemsPanel({
  items = [],
  onToggle,
  onAdd,
}) {
  return (
    <div className="admin-card p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold admin-text flex items-center gap-2 mb-3">
        <ListTodo
          size={15}
          className="text-primaryColor dark:text-primaryColor-400"
        />
        Action items
      </h3>

      {items.length === 0 ? (
        <p className="text-sm admin-text-muted text-center py-4">
          No action items yet.
        </p>
      ) : (
        <ul className="space-y-2 flex-1 overflow-y-auto max-h-[280px]">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
            >
              <button
                type="button"
                onClick={() => onToggle?.(item.id)}
                className="mt-0.5 shrink-0"
                aria-label="Toggle action item"
              >
                {item.done ? (
                  <CheckCircle2
                    size={16}
                    className="text-secondaryColor"
                  />
                ) : (
                  <Circle size={16} className="text-gray-400" />
                )}
              </button>
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${
                    item.done
                      ? "admin-text-muted line-through"
                      : "admin-text"
                  }`}
                >
                  {item.title}
                </p>
                <p className="text-[11px] admin-text-subtle mt-0.5">
                  {item.assignee}
                  {item.dueDate ? ` · Due ${item.dueDate}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-3 w-full text-xs font-semibold py-2 rounded-lg border border-dashed border-primaryColor/40 text-primaryColor dark:text-primaryColor-400 hover:bg-primaryColor/5"
        >
          + Add action item
        </button>
      )}
    </div>
  );
}
