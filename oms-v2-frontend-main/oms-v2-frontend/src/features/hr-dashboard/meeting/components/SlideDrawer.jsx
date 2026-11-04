"use client";

import { X } from "lucide-react";

/** Simple slide-in drawer for tablet panels */
export default function SlideDrawer({
  open,
  onClose,
  title,
  side = "right",
  children,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <div
        className={`absolute top-0 bottom-0 w-[min(100%,380px)] bg-theme-light dark:bg-theme-dark shadow-xl flex flex-col ${
          side === "left" ? "left-0" : "right-0"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold admin-text">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 admin-text-muted"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
