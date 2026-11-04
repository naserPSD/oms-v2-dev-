import Link from "next/link";
import { forwardRef, useEffect, useState } from "react";

// Color variants - high visibility & contrast
const colorClasses = {
  primary:
    "bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-600/25 dark:bg-blue-900/60 dark:text-blue-200",
  success:
    "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-600/25 dark:bg-emerald-900/60 dark:text-emerald-200",
  info:
    "bg-cyan-100 text-cyan-800 ring-1 ring-inset ring-cyan-600/25 dark:bg-cyan-900/60 dark:text-cyan-200",
  warning:
    "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-600/25 dark:bg-amber-900/60 dark:text-amber-200",
  danger:
    "bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-600/25 dark:bg-rose-900/60 dark:text-rose-200",
  secondary:
    "bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-600/25 dark:bg-gray-800 dark:text-gray-200",
  dark: "bg-gray-900 text-white dark:bg-gray-800 dark:text-gray-100",
  light: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  white:
    "bg-white text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-100",
  black: "bg-gray-900 text-white",
  gray:
    "bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-600/25 dark:bg-gray-800 dark:text-gray-200",
  blue:
    "bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-600/25 dark:bg-blue-900/60 dark:text-blue-200",
  green:
    "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-600/25 dark:bg-emerald-900/60 dark:text-emerald-200",
  red:
    "bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-600/25 dark:bg-rose-900/60 dark:text-rose-200",
  yellow:
    "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-600/25 dark:bg-amber-900/60 dark:text-amber-200",
  purple:
    "bg-purple-100 text-purple-800 ring-1 ring-inset ring-purple-600/25 dark:bg-purple-900/60 dark:text-purple-200",
  pink:
    "bg-pink-100 text-pink-800 ring-1 ring-inset ring-pink-600/25 dark:bg-pink-900/60 dark:text-pink-200",
};

// Random color classes for random background generation with distinct contrast
const randomColorClasses = [
  "bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-600/30 dark:bg-blue-900/60 dark:text-blue-200",
  "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-600/30 dark:bg-emerald-900/60 dark:text-emerald-200",
  "bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-600/30 dark:bg-violet-900/60 dark:text-violet-200",
  "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-600/30 dark:bg-amber-900/60 dark:text-amber-200",
  "bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-600/30 dark:bg-rose-900/60 dark:text-rose-200",
  "bg-indigo-100 text-indigo-800 ring-1 ring-inset ring-indigo-600/30 dark:bg-indigo-900/60 dark:text-indigo-200",
  "bg-purple-100 text-purple-800 ring-1 ring-inset ring-purple-600/30 dark:bg-purple-900/60 dark:text-purple-200",
  "bg-teal-100 text-teal-900 ring-1 ring-inset ring-teal-600/30 dark:bg-teal-900/60 dark:text-teal-200",
  "bg-cyan-100 text-cyan-800 ring-1 ring-inset ring-cyan-600/30 dark:bg-cyan-900/60 dark:text-cyan-200",
  "bg-orange-100 text-orange-900 ring-1 ring-inset ring-orange-600/30 dark:bg-orange-900/60 dark:text-orange-200",
];

// Size variants for container
const sizeClasses = {
  xs: "size-4",
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
  xl: "size-12",
  "2xl": "size-14",
  "3xl": "size-16",
  "4xl": "size-18",
  "5xl": "size-20",
  "6xl": "size-22",
  "7xl": "size-24",
  "8xl": "size-26",
  "9xl": "size-28",
  "10xl": "size-30",
  "11xl": "size-32",
  "12xl": "size-34",
  "13xl": "size-36",
  "14xl": "size-38",
  "15xl": "size-40",
  "16xl": "size-42",
  "17xl": "size-44",
  "18xl": "size-46",
  "19xl": "size-48",
  "20xl": "size-50",
};

// Icon size mapping
const iconSizeClasses = {
  xs: "w-2 h-2",
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
  xl: "w-6 h-6",
  "2xl": "w-7 h-7",
  "3xl": "w-8 h-8",
  "4xl": "w-9 h-9",
  "5xl": "w-10 h-10",
  "6xl": "w-11 h-11",
  "7xl": "w-12 h-12",
  "8xl": "w-13 h-13",
  "9xl": "w-14 h-14",
  "10xl": "w-15 h-15",
  "11xl": "w-16 h-16",
  "12xl": "w-17 h-17",
  "13xl": "w-18 h-18",
  "14xl": "w-19 h-19",
  "15xl": "w-20 h-20",
  "16xl": "w-21 h-21",
  "17xl": "w-22 h-22",
  "18xl": "w-23 h-23",
  "19xl": "w-24 h-24",
  "20xl": "w-25 h-25",
};

const textClasses = {
  xs: "text-[9px] font-bold",
  sm: "text-[11px] font-bold",
  md: "text-xs font-bold tracking-wide",
  lg: "text-sm font-bold tracking-wide",
  xl: "text-base font-bold tracking-wide",
  "2xl": "text-lg font-bold",
  "3xl": "text-xl font-bold",
  "9xl": "text-[34px] font-bold",
  "12xl": "text-[48px] font-bold",
  "13xl": "text-[56px] font-bold",
  "14xl": "text-[60px] font-bold",
  "15xl": "text-[64px] font-bold",
  "16xl": "text-[68px] font-bold",
  "17xl": "text-[72px] font-bold",
  "18xl": "text-[76px] font-bold",
  "19xl": "text-[80px] font-bold",
  "20xl": "text-[88px] font-bold",
};

// Ring color variants
const ringColorClasses = {
  primary: "ring-2 ring-blue-500 dark:ring-blue-400",
  success: "ring-2 ring-green-500 dark:ring-green-400",
  info: "ring-2 ring-cyan-500 dark:ring-cyan-400",
  warning: "ring-2 ring-yellow-500 dark:ring-yellow-400",
  danger: "ring-2 ring-red-500 dark:ring-red-400",
  secondary: "ring-2 ring-gray-500 dark:ring-gray-400",
  dark: "ring-2 ring-gray-800 dark:ring-gray-700",
  light: "ring-2 ring-gray-300 dark:ring-gray-500",
  white: "ring-2 ring-gray-300 dark:ring-gray-500",
  black: "ring-2 ring-gray-800 dark:ring-gray-700",
  gray: "ring-2 ring-gray-500 dark:ring-gray-400",
  blue: "ring-2 ring-blue-500 dark:ring-blue-400",
  green: "ring-2 ring-green-500 dark:ring-green-400",
  red: "ring-2 ring-red-500 dark:ring-red-400",
  yellow: "ring-2 ring-yellow-500 dark:ring-yellow-400",
  purple: "ring-2 ring-purple-500 dark:ring-purple-400",
  pink: "ring-2 ring-pink-500 dark:ring-pink-400",
};

const Avatar = forwardRef(
  (
    {
      text = "",
      value = "",
      image = "",
      size = "lg",
      color = "primary",
      icon: CustomIcon = null,
      circular = true,
      className = "",
      ring = false,
      ringColor = "primary",
      href = "",
      alt = "Avatar",
      randomBg = false,
      hoverEffect = true,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
      setImageFailed(false);
    }, [image]);

    const usableImage = (() => {
      if (typeof image !== "string") return "";
      const trimmed = image.trim();
      if (
        !trimmed ||
        trimmed === "null" ||
        trimmed === "undefined" ||
        trimmed.startsWith("undefined") ||
        trimmed.includes("/static/undefined/")
      ) {
        return "";
      }
      return trimmed;
    })();

    const showImage = Boolean(usableImage) && !imageFailed;

    // Get the display text
    const displayText = text || (value ? value.charAt(0).toUpperCase() : "");

    // Generate random color (simpler version without useMemo)
    const getRandomColor = () => {
      if (!randomBg || showImage) return "";

      const seed = value || text || "avatar";
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      }

      const index = Math.abs(hash) % randomColorClasses.length;
      return randomColorClasses[index];
    };

    const randomColor = randomBg ? getRandomColor() : "";

    // Determine ring classes
    const ringClass = ring
      ? `${ringColorClasses[ringColor] || ringColorClasses.primary} ring-offset-2`
      : "";

    // Determine shape class
    const shapeClass = circular ? "rounded-full" : "rounded";

    // Hover transition classes
    const hasInteraction = href || onClick;
    const hoverTransitionClasses =
      hoverEffect && hasInteraction
        ? "hover:opacity-80 transition-opacity duration-200 ease-in-out"
        : "";

    // Combined classes
    const avatarClasses = `
    flex items-center justify-center overflow-hidden
    ${sizeClasses[size]}
    ${!showImage ? (randomBg ? randomColor : colorClasses[color]) : ""}
    ${shapeClass}
    ${ringClass}
    ${hoverTransitionClasses}
    ${className}
    ${hasInteraction ? "cursor-pointer" : ""}
  `
      .replace(/\s+/g, " ")
      .trim();

    // Render the avatar content
    const renderAvatarContent = () => {
      if (showImage) {
        return (
          <img
            src={usableImage}
            alt={alt}
            width={100}
            height={100}
            className={`w-full h-full object-cover ${shapeClass} ${hasInteraction && hoverEffect ? "hover:opacity-80 transition-opacity duration-200 ease-in-out" : ""}`}
            onError={() => setImageFailed(true)}
          />
        );
      }

      if (CustomIcon) {
        return (
          <CustomIcon
            className={`${iconSizeClasses[size]} ${hasInteraction && hoverEffect ? "hover:opacity-80 transition-opacity duration-200 ease-in-out" : ""}`}
          />
        );
      }

      return (
        <span
          className={`font-bold leading-none select-none ${hasInteraction && hoverEffect ? "hover:opacity-80 transition-opacity duration-200 ease-in-out" : ""} ${textClasses[size]}`}
        >
          {displayText}
        </span>
      );
    };

    // Create the avatar element
    const avatarElement = (
      <div
        ref={ref}
        className={avatarClasses}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        {...props}
      >
        {renderAvatarContent()}
      </div>
    );

    // Wrap with Link if href is provided
    if (href) {
      return (
        <Link
          href={href}
          className={`inline-block group ${hoverEffect ? "hover:opacity-80 transition-opacity duration-200 ease-in-out" : ""}`}
        >
          {avatarElement}
        </Link>
      );
    }

    return avatarElement;
  },
);

Avatar.displayName = "Avatar";

export default Avatar;
