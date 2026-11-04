import React, { useEffect, useState, forwardRef } from "react";
import { useAutoRequired } from "@/hooks/useRequiredFields";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { RiCloseLine } from "react-icons/ri";

const sizeClasses = {
  xs: "block w-full px-2 py-0 text-xs min-h-[34px] h-[34px]",
  sm: "block w-full p-2 text-xs min-h-[38px]",
  md: "block w-full p-2.5 text-sm",
  lg: "block w-full p-3 text-base",
  xl: "block w-full p-4 text-base",
};

const hasAsterisk = (val) => {
  if (!val) return false;
  if (typeof val === "string") return val.includes("*");
  if (typeof val === "number") return false;
  if (Array.isArray(val)) return val.some(hasAsterisk);
  if (React.isValidElement(val)) {
    return hasAsterisk(val.props?.children);
  }
  return false;
};

function InputBase(
  {
    id,
    name,
    label,
    labelClassName,
    type = "text",
    numberAlignment = "right",
    size = "sm",
    error,
    placeholder,
    autoComplete,
    className = "",
    checkboxLabel,
    rows = 3,
    showPasswordToggle = true,
    icon = null,
    iconPosition = "left",
    iconBackground = false,
    clearable = false,
    value: externalValue,
    defaultValue,
    onChange,
    onBlur, // Add onBlur prop
    roundedFull = false,
    labelCenter = false,
    disabled = false,
    hints = null,
    min, // Add min prop for number inputs
    max, // Add max prop for number inputs
    step, // Add step prop for number inputs
    required = false,
    ...props
  },
  ref,
) {
  const [internalValue, setInternalValue] = useState(
    externalValue ?? defaultValue ?? "",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isTouched, setIsTouched] = useState(false); // Track if field was touched

  const autoRequired = useAutoRequired(name);
  const isPassword = type === "password";
  const isCheckbox = type === "checkbox";
  const isTextarea = type === "textarea";
  const isNumber = type === "number";

  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  // Sync internal value with external value changes
  useEffect(() => {
    if (externalValue !== undefined) {
      // React inputs cannot receive null — coerce to empty string
      setInternalValue(externalValue ?? "");
    }
  }, [externalValue]);

  // Safe value for controlled <input> / <textarea>
  const safeValue = internalValue ?? "";

  const handleClear = () => {
    const newValue = "";
    setInternalValue(newValue);
    // Trigger onChange event if provided
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleInputChange = (e) => {
    let newValue = e.target.value;

    // For number inputs, handle empty string and validate min/max
    if (isNumber) {
      if (newValue === "") {
        setInternalValue("");
        if (onChange) {
          onChange("", e);
        }
        return;
      }

      // Convert to number for validation
      const numValue = Number(newValue);

      // Apply min/max constraints if provided
      if (min !== undefined && numValue < min) {
        newValue = min.toString();
      } else if (max !== undefined && numValue > max) {
        newValue = max.toString();
      }
    }

    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue, e); // Pass both value and event
    }
  };

  const handleBlur = (e) => {
    setIsTouched(true);

    // For number inputs, ensure empty string is handled
    if (isNumber && e.target.value === "") {
      setInternalValue("");
      if (onChange) {
        onChange("", e);
      }
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  // Show error only if field is touched or has error
  const shouldShowError = error && (isTouched || error);
  const isRequired = Boolean(required || props.required || autoRequired);
  const nativeRequired = type === "email" && isRequired;

  const renderLabelContent = (lbl) => {
    if (!lbl) return null;
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <span>{lbl}</span>
        {isRequired && !hasAsterisk(lbl) && (
          <span className="text-red-500 font-bold select-none leading-none">*</span>
        )}
      </span>
    );
  };

  // Determine text alignment
  // const textAlignment = isNumber ? "text-right" : "text-left";
  const textAlignment = isNumber && numberAlignment === "right" ? "text-right" : "text-left";

  if (isCheckbox) {
    return (
      <div className={` ${className}`}>
        <div className="">
          <input
            type="checkbox"
            id={id || name}
            name={name}
            className={`accent-primary w-4 h-4 ${className}`}
            checked={Boolean(internalValue)}
            onChange={handleInputChange}
            onBlur={handleBlur}
            ref={ref}
            {...props}
            required={nativeRequired}
          />
          <label
            htmlFor={id || name}
            className="text-sm text-primary hover:underline"
          >
            <span className={`text-sm ${labelClassName}`}>
              {renderLabelContent(checkboxLabel || label)}
            </span>
          </label>
        </div>
        {shouldShowError && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }

  if (isTextarea) {
    return (
      <div className={`mb-5 ${className}`}>
        {label && (
          <label
            htmlFor={id || name}
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            <span className={`text-sm ${labelClassName}`}>{renderLabelContent(label)}</span>
          </label>
        )}
        <textarea
          id={id || name}
          name={name}
          value={safeValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          ref={ref}
          placeholder={placeholder}
          autoComplete={autoComplete}
          rows={rows}
          className={`
            ${sizeClasses[size]}
            text-gray-900 border rounded-md bg-gray-50
            focus:ring-blue-500 focus:border-blue-500
            border-gray-300
            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
            ${shouldShowError ? "border-red-500 focus:border-red-500" : ""}
            ${className}
          `}
          {...props}
          required={nativeRequired}
        />
        {shouldShowError && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className={`block font-medium text-gray-900 dark:text-white ${size === "xs" ? "mb-1 text-xs" : "mb-2 text-sm"} ${labelCenter ? "text-center" : ""}`}
        >
          <span className={`${size === "xs" ? "text-xs" : "text-sm"} ${labelClassName}`}>{renderLabelContent(label)}</span>
        </label>
      )}
      <div className="relative flex items-center">
        {/* Left Icon (optional) */}
        {icon &&
          iconPosition === "left" &&
          (iconBackground ? (
            <>
              <span className="absolute left-[-5px] bg-gray-100 px-3 h-full flex items-center justify-center border border-r border-gray-300 rounded-l-md text-gray-500">
                {icon}
              </span>
            </>
          ) : (
            <span className="absolute left-3 text-gray-400">{icon}</span>
          ))}

        <input
          id={id || name}
          name={name}
          type={inputType}
          value={safeValue}
          disabled={disabled}
          onChange={handleInputChange}
          onBlur={handleBlur}
          ref={ref}
          placeholder={placeholder}
          autoComplete={autoComplete}
          min={min}
          max={max}
          step={step}
          {...props}
          required={nativeRequired}
          className={`
            ${sizeClasses[size]}
            ${textAlignment}
            ${isNumber && numberAlignment === "left" ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" : ""}
            text-gray-900 border bg-gray-50
            focus:ring-blue-500 focus:border-blue-500
            border-gray-300
            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
            ${error ? "border-red-500 focus:border-red-500" : ""}
            ${icon && iconPosition === "left" ? "pl-10" : ""}
            ${(isPassword && showPasswordToggle) ||
              (icon && iconPosition === "right") ||
              (clearable && internalValue)
              ? "pr-10"
              : ""
            }
            ${roundedFull ? "rounded-full" : "rounded-sm"}
            ${disabled ? "cursor-not-allowed" : ""}
            ${className}
          `}
        />

        {/* Right Icon (optional) */}
        {icon &&
          iconPosition === "right" &&
          !isPassword &&
          !(clearable && internalValue) &&
          (iconBackground ? (
            <>
              <span className="absolute right-0 bg-gray-100 px-3 h-full flex items-center justify-center border border-l border-gray-300 dark:bg-gray-300 dark:border-gray-300 rounded-r-md text-gray-500">
                {icon}
              </span>
            </>
          ) : (
            <span className="absolute right-3 text-gray-400">{icon}</span>
          ))}

        {/* Clear button (appears when clearable is true and there's text) */}
        {clearable && internalValue && !isPassword && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Clear input"
          >
            <RiCloseLine className="w-4.5 h-4.5" />
          </button>
        )}

        {/* Password toggle (overrides clear button and right icon if both used) */}
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <FaEyeSlash className="w-5 h-5" />
            ) : (
              <FaEye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {shouldShowError && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {hints && <p className="mt-1 text-xs text-gray-500">{hints}</p>}
    </div>
  );
}

const Input = forwardRef(InputBase);
Input.displayName = "Input"; // Add display name for debugging

export default Input;