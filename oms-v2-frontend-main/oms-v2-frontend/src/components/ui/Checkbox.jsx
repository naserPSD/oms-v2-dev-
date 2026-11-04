import React from "react";
import { useAutoRequired } from "@/hooks/useRequiredFields";

const Checkbox = ({
  id,
  name,
  label,
  checked = false,
  onChange,
  onCheckedChange, // ✅ New prop for consistency
  disabled = false,
  color = "primary",
  size = "md",
  showIcon = true,
  icon: CustomIcon = null,
  circular = false,
  error = "",
  className = "",
  labelClassName = "",
  required = false,
  ...props
}) => {
  const autoRequired = useAutoRequired(name);
  const showRequired = Boolean(required || props.required || autoRequired);
  const colorClasses = {
    primary: "text-blue-600 border-blue-400 focus:ring-blue-500",
    success: "text-green-600 border-green-400 focus:ring-green-500",
    info: "text-cyan-600 border-cyan-400 focus:ring-cyan-500",
    warning: "text-yellow-600 border-yellow-400 focus:ring-yellow-500",
    danger: "text-red-600 border-red-400 focus:ring-red-500",
  };

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-7 h-7",
  };

  const labelSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6",
  };

  const DefaultCheckIcon = ({ size }) => (
    <svg
      className={iconSizeClasses[size]}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );

  // ✅ Unified change handler
  const handleChange = (e) => {
    const newChecked = e.target.checked;

    // Fire both callbacks if provided
    if (onChange) onChange(e);
    if (onCheckedChange) onCheckedChange(newChecked);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <label
        htmlFor={id}
        className={`relative flex items-center cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {/* Hidden native checkbox */}
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={handleChange} // ✅ unified handler
          disabled={disabled}
          className="sr-only"
          {...props}
        />

        {/* Custom checkbox */}
        <div
          className={`
            flex items-center justify-center
            border-2 transition-all duration-200
            ${sizeClasses[size]}
            ${colorClasses[color]}
            ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
            ${
              checked ? "bg-current border-current" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            }
            ${circular ? "rounded-full" : "rounded"}
          `}
        >
          {checked && showIcon && (
            <span className="text-white">
              {CustomIcon ? (
                <CustomIcon className={iconSizeClasses[size]} />
              ) : (
                <DefaultCheckIcon size={size} />
              )}
            </span>
          )}
        </div>

        {/* Label */}
        {label && (
          <span
            className={`ml-3 inline-flex items-center gap-1 text-primary dark:text-gray-200 select-none ${labelSizeClasses[size]} ${labelClassName}`}
          >
            <span dangerouslySetInnerHTML={{ __html: label }} />
            {showRequired && !String(label).includes("*") && (
              <span className="text-red-500 font-bold leading-none">*</span>
            )}
          </span>
        )}
      </label>

      {/* Error message */}
      {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
    </div>
  );
};

export default Checkbox;
