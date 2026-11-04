"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import { uploadBlogImage } from "@/services/blogAdminApi";
import { resolveImageUrl, toaster } from "@/utils/helpers";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function BlogImageUploadField({
  label,
  value,
  onChange,
  error,
  hint,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const preview = resolveImageUrl(value);

  const handleFile = async (file) => {
    if (!file) return;

    const isImage =
      ALLOWED_IMAGE_TYPES.includes(file.type) ||
      file.type.startsWith("image/");
    if (!isImage) {
      toaster("Only JPG, PNG, or WebP images are allowed", "error");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toaster("Image must be 5MB or smaller", "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadBlogImage(formData);
      const url = res?.data?.url ?? res?.url;
      if (!url) {
        throw new Error("Upload did not return an image URL");
      }
      onChange(url);
      toaster("Image uploaded", "success");
    } catch (err) {
      toaster(err?.response?.data?.message || "Image upload failed", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </label>
      {hint ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{hint}</p>
      ) : null}

      {preview ? (
        <div className="relative mb-3 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt=""
            className="h-36 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="flex flex-wrap items-center gap-2">
        <ButtonTw
          type="button"
          variant="outline.gray"
          size="sm"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={14} className="mr-1" />
          {preview ? "Replace image" : "Upload image"}
        </ButtonTw>
        <button
          type="button"
          className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
          onClick={() => setShowUrlField((open) => !open)}
        >
          {showUrlField ? "Hide URL" : "Paste URL instead"}
        </button>
      </div>

      {showUrlField ? (
        <div className="mt-2">
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
          />
        </div>
      ) : null}

      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
