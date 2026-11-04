"use client";

import { ModalTw } from "@/components/common/ModalTw";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deriveMeetingStatus } from "../data/mockMeetings";
import { openMeetWindow } from "../utils/meetWindowManager";

export default function JoinMeetingModal({
  show,
  onClose,
  meetings = [],
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");

  const joinable = (meetings || []).filter((m) => {
    if (!m) return false;
    const st = deriveMeetingStatus(m);
    return st === "live" || st === "upcoming";
  });

  const handleOpenUrl = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    openMeetWindow(trimmed, null);
    onClose?.();
  };

  return (
    <ModalTw
      show={show}
      onClose={onClose}
      title="Join a meeting"
      size="md"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold admin-text-muted">
            Paste Google Meet link
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm admin-text"
          />
          <button
            type="button"
            className="mt-2 w-full sm:w-auto inline-flex items-center justify-center h-9 px-4 rounded-lg bg-primaryColor hover:bg-primaryColor-700 disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-semibold"
            onClick={handleOpenUrl}
            disabled={!url.trim()}
          >
            Open Meet link
          </button>
        </div>

        {joinable.length > 0 && (
          <div>
            <p className="text-xs font-semibold admin-text-muted mb-2">
              Or pick from your meetings
            </p>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {joinable.map((m) => {
                if (!m) return null;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2.5 hover:bg-primaryColor/5 transition-colors"
                      onClick={() => {
                        onClose?.();
                        router.push(`/hr-dashboard/meeting/${m.id}/live`);
                      }}
                    >
                      <span className="block text-sm font-semibold admin-text">
                        {m.title || "Meeting"}
                      </span>
                      <span className="text-[11px] admin-text-muted">
                        {deriveMeetingStatus(m) === "live" ? "Live now" : "Upcoming"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </ModalTw>
  );
}
