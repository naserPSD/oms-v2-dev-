"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Code2, Eye, PenLine } from "lucide-react";
import "suneditor/dist/css/suneditor.min.css";

const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

const COMMON_VARIABLES = [
  "company_name",
  "user_name",
  "customer_name",
  "email",
  "start_date",
  "reset_link",
  "expiry_time",
  "order_number",
  "order_date",
  "total_amount",
  "meeting_topic",
  "month",
  "year",
];

const EDITOR_OPTIONS = {
  height: "320px",
  minHeight: "240px",
  buttonList: [
    ["undo", "redo"],
    ["formatBlock", "font", "fontSize"],
    ["bold", "underline", "italic", "strike", "removeFormat"],
    ["fontColor", "hiliteColor"],
    ["align", "list", "lineHeight"],
    ["table", "link", "image", "horizontalRule"],
    ["blockquote", "codeView", "fullScreen", "preview"],
  ],
  formats: ["p", "div", "h1", "h2", "h3", "blockquote"],
  defaultTag: "p",
};

const isEmptyHtml = (html = "") => {
  const text = String(html)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return text.length === 0;
};

const extractVariables = (html = "") => {
  const found = new Set();
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  let match = regex.exec(html);
  while (match) {
    found.add(match[1]);
    match = regex.exec(html);
  }
  return Array.from(found);
};

const EmailTemplateContentEditor = ({
  value,
  onChange,
  error,
  editorKey = "new",
  extraVariables = [],
}) => {
  const editorRef = useRef(null);
  const htmlRef = useRef(null);
  const [mode, setMode] = useState("visual");
  const [syncedKey, setSyncedKey] = useState(editorKey);
  const [htmlDraft, setHtmlDraft] = useState(value || "");

  if (editorKey !== syncedKey) {
    setSyncedKey(editorKey);
    setHtmlDraft(value || "");
    setMode("visual");
  }

  const variables = useMemo(() => {
    const merged = new Set([
      ...COMMON_VARIABLES,
      ...extraVariables,
      ...extractVariables(value || ""),
    ]);
    return Array.from(merged);
  }, [extraVariables, value]);

  const applyHtml = (nextHtml) => {
    const normalized = isEmptyHtml(nextHtml) ? "" : nextHtml;
    setHtmlDraft(nextHtml);
    onChange(normalized);
    if (editorRef.current && mode === "visual") {
      editorRef.current.setContents(nextHtml || "");
    }
  };

  const insertVariable = (name) => {
    const token = `{{${name}}}`;
    if (mode === "html") {
      const el = htmlRef.current;
      if (!el) {
        applyHtml(`${htmlDraft || ""}${token}`);
        return;
      }
      const start = el.selectionStart ?? htmlDraft.length;
      const end = el.selectionEnd ?? htmlDraft.length;
      const next = `${htmlDraft.slice(0, start)}${token}${htmlDraft.slice(end)}`;
      applyHtml(next);
      requestAnimationFrame(() => {
        el.focus();
        const cursor = start + token.length;
        el.setSelectionRange(cursor, cursor);
      });
      return;
    }

    const editor = editorRef.current;
    if (editor) {
      editor.focus();
      editor.insertHTML(token);
      onChange(isEmptyHtml(editor.getContents()) ? "" : editor.getContents());
      return;
    }
    applyHtml(`${value || ""}${token}`);
  };

  const switchMode = (nextMode) => {
    if (nextMode === mode) return;

    let nextHtml = htmlDraft;
    if (mode === "visual" && editorRef.current) {
      try {
        nextHtml = editorRef.current.getContents() || "";
      } catch {
        editorRef.current = null;
      }
      setHtmlDraft(nextHtml);
      onChange(isEmptyHtml(nextHtml) ? "" : nextHtml);
    }

    setMode(nextMode);

    if (nextMode === "visual") {
      const html = nextHtml || "";
      requestAnimationFrame(() => {
        try {
          editorRef.current?.setContents(html);
        } catch {
          editorRef.current = null;
        }
      });
    }
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Template Content
          <span className="ml-0.5 text-red-500">*</span>
        </label>
        <div className="inline-flex overflow-hidden rounded-md border border-gray-200 dark:border-gray-600">
          {[
            { id: "visual", label: "Visual", icon: PenLine },
            { id: "html", label: "HTML", icon: Code2 },
            { id: "preview", label: "Preview", icon: Eye },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => switchMode(id)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium ${
                mode === id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2">
        <p className="mb-1.5 text-xs text-gray-500 dark:text-gray-400">
          Click a variable to insert it at the cursor. Tokens stay as{" "}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">
            {"{{variable_name}}"}
          </code>{" "}
          and are replaced when the email is sent.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {variables.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => insertVariable(name)}
              className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-[11px] text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
            >
              {`{{${name}}}`}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
        <div
          className={
            mode === "visual"
              ? "suneditor-wrapper bg-white dark:bg-gray-800"
              : "hidden"
          }
        >
          <SunEditor
            key={`${editorKey}-visual`}
            getSunEditorInstance={(instance) => {
              editorRef.current = instance;
            }}
            defaultValue={htmlDraft || ""}
            setContents={mode === "visual" ? htmlDraft || "" : undefined}
            onChange={(contents) => {
              setHtmlDraft(contents);
              onChange(isEmptyHtml(contents) ? "" : contents);
            }}
            setOptions={EDITOR_OPTIONS}
            placeholder="Write the email body. Use variables like {{user_name}}."
            height="320px"
          />
        </div>

        {mode === "html" && (
          <textarea
            ref={htmlRef}
            value={htmlDraft}
            onChange={(event) => applyHtml(event.target.value)}
            spellCheck={false}
            rows={16}
            placeholder="<p>Hello {{user_name}},</p>"
            className="min-h-[320px] w-full resize-y bg-gray-950 px-3 py-2 font-mono text-xs leading-5 text-gray-100 outline-none"
          />
        )}

        {mode === "preview" && (
          <iframe
            title="Email template preview"
            className="h-[360px] w-full bg-white"
            sandbox=""
            srcDoc={
              htmlDraft ||
              value ||
              "<p style='font-family:sans-serif;color:#6b7280;padding:16px'>Nothing to preview yet.</p>"
            }
          />
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default EmailTemplateContentEditor;
