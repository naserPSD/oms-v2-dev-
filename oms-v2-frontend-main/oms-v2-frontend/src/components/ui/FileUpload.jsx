import React, { useRef, useReducer, useEffect } from "react";
import { useAutoRequired } from "@/hooks/useRequiredFields";

const sizeClasses = {
  sm: "py-1 px-2 text-xs h-8",
  md: "py-2 px-3 text-sm h-10",
  lg: "py-3 px-4 text-base h-12",
  xl: "py-4 px-5 text-lg h-14",
};

const FileUpload = React.forwardRef(
  (
    {
      id,
      name,
      label = "Upload file",
      accept = "*",
      multiple = false,
      error,
      className = "",
      size = "md",
      description,
      clearable = false,
      value,
      onChange,
      onBlur,
      required = false,
      ...props
    },
    ref
  ) => {
    const autoRequired = useAutoRequired(name);
    const showRequired = Boolean(required || props.required || autoRequired);
    const inputRef = useRef(null);
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    // Track the current files separately from the input element
    const [currentFiles, setCurrentFiles] = React.useState(null);

    const resetInputElement = () => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      setCurrentFiles(null);
    };

    useEffect(() => {
      if (!value) {
        resetInputElement();
      } else {
        setCurrentFiles(value);
      }
    }, [value]);

    const getFileName = () => {
      if (currentFiles) {
        if (multiple) {
          return currentFiles.length ? Array.from(currentFiles).map(f => f.name).join(", ") : "";
        }
        return currentFiles?.name || "";
      }

      const files = inputRef.current?.files;
      if (!files || (multiple ? files.length === 0 : !files)) return "";
      return multiple
        ? Array.from(files).map(f => f.name).join(", ")
        : files[0]?.name || "";
    };

    const handleChange = (e) => {
      const files = multiple ? e.target.files : (e.target.files?.length ? e.target.files[0] : null);
      setCurrentFiles(files);
      onChange?.(files);
      forceUpdate();
    };

    const handleClear = () => {
      resetInputElement();
      onChange?.(multiple ? [] : null);
      forceUpdate();
    };

    return (
      <div className={`mb-5 ${className}`}>
        {label && (
          <label htmlFor={id || name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            <span className="inline-flex items-center gap-1">
              <span>{label}</span>
              {showRequired && !String(label).includes("*") && (
                <span className="text-red-500 font-bold leading-none">*</span>
              )}
            </span>
          </label>
        )}
        <div className="relative">
          <label
            htmlFor={id || name}
            className={`flex items-center w-full border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 cursor-pointer ${sizeClasses[size]} ${error ? "border-red-500" : ""}`}
            style={{ minHeight: "auto" }}
          >
            <span className="inline-flex items-center px-3 bg-gray-100 dark:bg-gray-800 rounded-l-lg h-full font-medium text-gray-900 dark:text-gray-400">
              Choose file
            </span>
            <input
              ref={el => {
                inputRef.current = el;
                if (typeof ref === "function") ref(el);
                else if (ref) ref.current = el;
              }}
              id={id || name}
              name={name}
              type="file"
              accept={accept}
              multiple={multiple}
              className="hidden"
              onChange={handleChange}
              onBlur={onBlur}
              {...props}
            />
            <span className="flex-1 px-3 truncate flex items-center h-full text-gray-700 dark:text-gray-300">
              {getFileName() || "No file chosen"}
            </span>
          </label>
          {clearable && getFileName() && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-200 hover:bg-gray-600 hover:text-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              aria-label="Clear selected file"
              tabIndex={0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {description && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";

export default FileUpload;