import { useState, useEffect, useRef, useCallback } from "react";
import { useAutoRequired } from "@/hooks/useRequiredFields";

const sizeConfig = {
  sm: {
    height: "h-5",
    knob: "w-4 h-4",
    text: "text-xs",
    padding: "px-1",
    minWidth: "min-w-[3rem]",
    knobOffset: {
      left: "left-0.5",
      right: "left-[calc(100%-1.2rem)]"
    },
    textPadding: {
      left: "pl-5",
      right: "pr-5"
    }
  },
  md: {
    height: "h-7",
    knob: "w-6 h-6",
    text: "text-sm",
    padding: "px-2",
    minWidth: "min-w-[3.5rem]",
    knobOffset: {
      left: "left-0.5",
      right: "left-[calc(100%-1.7rem)]"
    },
    textPadding: {
      left: "pl-7",
      right: "pr-7"
    }
  },
  lg: {
    height: "h-10",
    knob: "w-8 h-8",
    text: "text-base",
    padding: "px-3",
    minWidth: "min-w-[5rem]",
    knobOffset: {
      left: "left-0.5",
      right: "left-[calc(100%-2.2rem)]"
    },
    textPadding: {
      left: "pl-9",
      right: "pr-9"
    }
  }
};

const colorConfig = {
  primary: {
    enabled: "bg-blue-500",
    disabled: "bg-blue-500/20",
    text: "text-blue-500"
  },
  secondary: {
    enabled: "bg-gray-600",
    disabled: "bg-gray-600/20",
    text: "text-gray-600"
  },
  info: {
    enabled: "bg-cyan-500",
    disabled: "bg-cyan-500/20",
    text: "text-cyan-500"
  },
  success: {
    enabled: "bg-green-500",
    disabled: "bg-green-500/20",
    text: "text-green-500"
  },
  warning: {
    enabled: "bg-yellow-400",
    disabled: "bg-yellow-400/20",
    text: "text-yellow-400"
  },
  danger: {
    enabled: "bg-red-500",
    disabled: "bg-red-500/20",
    text: "text-red-500"
  }
};

const SwitchButton = ({
  id,
  name,
  enabled = false,
  label = "",
  error,
  onChange = () => {},
  color = "success",
  enabledColor,
  disabledColor,
  enabledText = "",
  disabledText = "",
  textColor,
  size = "sm",
  className = "",
  knobClass = "",
  mode = "default",
  onLockToggle = () => {},
  shape = "rounded",
  disabled = false, // New prop for external disable
  required = false,
  ...props
}) => {
  const autoRequired = useAutoRequired(name);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isLocked, setIsLocked] = useState(false);
  const [textWidth, setTextWidth] = useState({ enabled: 0, disabled: 0 });
  const enabledTextRef = useRef(null);
  const disabledTextRef = useRef(null);
  
  const prevEnabledRef = useRef(enabled);
  const isTogglingRef = useRef(false);
  const timeoutRef = useRef(null);

  // Update internal state when enabled prop changes
  useEffect(() => {
    if (prevEnabledRef.current !== enabled) {
      setIsEnabled(enabled);
      prevEnabledRef.current = enabled;
    }
  }, [enabled]);

  useEffect(() => {
    if (enabledTextRef.current && disabledTextRef.current) {
      setTextWidth({
        enabled: enabledTextRef.current.offsetWidth,
        disabled: disabledTextRef.current.offsetWidth
      });
    }
  }, [enabledText, disabledText]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const toggleSwitch = useCallback(
    (event) => {
      // If disabled by permission, don't toggle
      if (disabled) {
        event?.preventDefault();
        event?.stopPropagation();
        return;
      }

      event?.preventDefault();
      event?.stopPropagation();

      if (isTogglingRef.current) {
        return;
      }

      isTogglingRef.current = true;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (mode === "lock") {
        const newState = !isLocked;
        setIsLocked(newState);
        timeoutRef.current = setTimeout(() => {
          onLockToggle(newState);
          isTogglingRef.current = false;
          timeoutRef.current = null;
        }, 50);
      } else {
        const newState = !isEnabled;
        setIsEnabled(newState);
        timeoutRef.current = setTimeout(() => {
          onChange(newState);
          isTogglingRef.current = false;
          timeoutRef.current = null;
        }, 50);
      }
    },
    [mode, onLockToggle, onChange, isLocked, isEnabled, disabled]
  );

  const cfg = sizeConfig[size] || sizeConfig.sm;
  const colors = colorConfig[color] || colorConfig.primary;
  const activeEnabledColor = enabledColor || colors.enabled;
  const activeDisabledColor = disabledColor || colors.disabled;
  const activeTextColor = textColor || colors.text;

  const dynamicWidth = `w-[calc(${Math.max(
    textWidth.enabled,
    textWidth.disabled
  )}px + 4rem)]`;

  const switchId = id || name || `switch-${Math.random().toString(36).slice(2)}`;

  const getShapeClasses = () => {
    switch (shape) {
      case "square":
        return { container: "rounded-sm", knob: "rounded-sm" };
      case "default":
        return { container: "rounded", knob: "rounded" };
      case "rounded":
      default:
        return { container: "rounded-full", knob: "rounded-full" };
    }
  };

  const shapeClasses = getShapeClasses();

  const displayText =
    mode === "lock"
      ? isLocked
        ? enabledText || "Locked"
        : disabledText || "Unlocked"
      : isEnabled
      ? enabledText
      : disabledText;

  const displayIcon = mode === "lock" && (
    <span className="ml-1">{isLocked ? "🔒" : "🔓"}</span>
  );

  const isOn = mode === "lock" ? isLocked : isEnabled;
  const textPadding = isOn ? cfg.textPadding.right : cfg.textPadding.left;
  const knobPosition = isOn ? cfg.knobOffset.right : cfg.knobOffset.left;

  // Add disabled styles when permission is false
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={switchId}
          className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
        >
          <span className="inline-flex items-center gap-1">
            <span>{label}</span>
            {(required || autoRequired) && !String(label).includes("*") && (
              <span className="text-red-500 font-bold leading-none">*</span>
            )}
          </span>
        </label>
      )}
      <div className="relative inline-block">
        <span
          ref={enabledTextRef}
          className={`absolute invisible whitespace-nowrap ${cfg.text}`}
        >
          {enabledText || (mode === "lock" ? "Locked" : "ON")}
        </span>
        <span
          ref={disabledTextRef}
          className={`absolute invisible whitespace-nowrap ${cfg.text}`}
        >
          {disabledText || (mode === "lock" ? "Unlocked" : "OFF")}
        </span>
        <button
          id={switchId}
          type="button"
          role="switch"
          aria-checked={isOn}
          onClick={toggleSwitch}
          className={`relative inline-flex items-center justify-center transition-colors ${disabledStyles} ${
            isOn ? activeEnabledColor : activeDisabledColor
          } ${cfg.height} ${cfg.padding} ${cfg.minWidth} ${dynamicWidth} ${
            shapeClasses.container
          }`}
          disabled={disabled}
          {...props}
        >
          <span className="sr-only">
            {mode === "lock" ? "Toggle Lock" : "Toggle Switch"}
          </span>
          <span
            className={`absolute bg-white shadow-md transition-all duration-200 ${
              cfg.knob
            } ${shapeClasses.knob} ${knobPosition} ${knobClass} z-10`}
          />
          <span
            className={`whitespace-nowrap ${cfg.text} font-medium flex items-center justify-center ${
              isOn ? "text-white" : activeTextColor
            } ${textPadding} w-full text-center z-0`}
          >
            {displayText}
            {displayIcon}
          </span>
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default SwitchButton;