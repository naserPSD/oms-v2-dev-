"use client";

import { useEffect, useRef, useState } from "react";
import { Check, StickyNote } from "lucide-react";
import { notesStorageKey } from "../data/mockMeetings";
import { useMeetingQueryApi } from "@/hooks/queryApi/useMeetingQueryApi";

export default function PersonalNotesPanel({
  meetingId,
  userId,
  title = "Meeting notes",
  hint = "Private to you — auto-saves to database as you type.",
  minRows = 8,
}) {
  const key = notesStorageKey(meetingId, userId || "guest");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("idle");
  const skipSave = useRef(true);

  const { useMeetingNotesQuery, saveMeetingNotesMutation } =
    useMeetingQueryApi();
  const { data: noteRes, isLoading: noteLoading } = useMeetingNotesQuery(
    meetingId,
    {
      enabled: Boolean(meetingId),
    },
  );

  useEffect(() => {
    skipSave.current = true;
    if (noteRes?.data?.content !== undefined) {
      setValue(noteRes.data.content || "");
    } else {
      try {
        const local = localStorage.getItem(key);
        if (local) setValue(local);
      } catch {
        setValue("");
      }
    }
    setStatus("idle");
    const t = setTimeout(() => {
      skipSave.current = false;
    }, 100);
    return () => clearTimeout(t);
  }, [noteRes, key]);

  useEffect(() => {
    if (skipSave.current) return;
    setStatus("saving");
    const t = setTimeout(async () => {
      try {
        if (meetingId) {
          await saveMeetingNotesMutation.mutateAsync({
            id: meetingId,
            content: value,
          });
        }
        localStorage.setItem(key, value);
        setStatus("saved");
      } catch {
        setStatus("idle");
      }
    }, 550);
    return () => clearTimeout(t);
  }, [meetingId, key, value, saveMeetingNotesMutation]);

  return (
    <div className="admin-card flex flex-col overflow-hidden p-4 h-full min-h-[280px]">
      <div className="flex items-start justify-between gap-3 mb-3 shrink-0">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold admin-text flex items-center gap-2.5">
            <span className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-primaryColor/10 dark:bg-primaryColor/20 shrink-0">
              <StickyNote
                size={15}
                className="text-primaryColor dark:text-primaryColor-400"
              />
            </span>
            {title}
          </h3>
          <p className="text-[11px] admin-text-subtle mt-1.5 pl-[2.625rem]">
            {hint}
          </p>
        </div>
        <div className="shrink-0 h-8 flex items-center">
          {status === "saving" && (
            <span className="text-[10px] font-medium admin-text-subtle">
              Saving…
            </span>
          )}
          {status === "saved" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-secondaryColor">
              <Check size={12} />
              Saved
            </span>
          )}
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={minRows}
        placeholder="Jot decisions, follow-ups, or reminders while the meeting runs…"
        className="w-full flex-1 min-h-[160px] resize-y rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/50 px-3.5 py-3 text-sm leading-relaxed admin-text placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primaryColor/25 focus:border-primaryColor/40 focus:bg-white dark:focus:bg-gray-900"
      />

      <div className="mt-2.5 flex items-center justify-between gap-2 shrink-0">
        <span className="text-[10px] admin-text-subtle tabular-nums">
          {value.length} characters
        </span>
        <button
          type="button"
          onClick={async () => {
            try {
              setStatus("saving");
              if (meetingId) {
                await saveMeetingNotesMutation.mutateAsync({
                  id: meetingId,
                  content: value,
                });
              }
              localStorage.setItem(key, value);
              setStatus("saved");
            } catch {
              setStatus("idle");
            }
          }}
          className="text-[11px] font-semibold text-primaryColor dark:text-primaryColor-400 hover:underline"
        >
          Save
        </button>
      </div>
    </div>
  );
}
