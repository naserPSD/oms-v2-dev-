"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "suneditor/dist/css/suneditor.min.css";
import { uploadBlogImage } from "@/services/blogAdminApi";
import { resolveImageUrl, toaster } from "@/utils/helpers";

const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

const EDITOR_HEIGHT = "400px";

const EDITOR_BUTTONS = [
  [
    "undo",
    "redo",
    "formatBlock",
    "fontSize",
    "bold",
    "underline",
    "italic",
    "strike",
    "removeFormat",
    "fontColor",
    "hiliteColor",
    "align",
    "list",
    "table",
    "link",
    "image",
    "codeView",
    "fullScreen",
  ],
];

async function uploadEditorImage(file, uploadHandler) {
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await uploadBlogImage(formData);
    const url = resolveImageUrl(res?.data?.url ?? res?.url);
    if (!url) {
      throw new Error("No URL returned");
    }
    uploadHandler({
      result: [
        {
          url,
          name: file.name,
          size: file.size,
        },
      ],
    });
  } catch (err) {
    toaster(err?.response?.data?.message || "Image upload failed", "error");
    uploadHandler({ errorMessage: "Image upload failed" });
  }
}

export default function BlogBodyEditor({
  value,
  onChange,
  editorKey,
  error,
}) {
  const editorOptions = useMemo(
    () => ({
      buttonList: EDITOR_BUTTONS,
      height: EDITOR_HEIGHT,
      defaultTag: "p",
      imageUploadSizeLimit: 5 * 1024 * 1024,
    }),
    []
  );

  const handleImageUploadBefore = (files, _info, uploadHandler) => {
    uploadEditorImage(files?.[0], uploadHandler);
    return false;
  };

  return (
    <div className="min-w-0">
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Body
      </label>
      <div className="blog-body-editor-shell rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <SunEditor
          key={editorKey}
          defaultValue={value || ""}
          onChange={onChange}
          height={EDITOR_HEIGHT}
          placeholder="Write your article…"
          setOptions={editorOptions}
          onImageUploadBefore={handleImageUploadBefore}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
