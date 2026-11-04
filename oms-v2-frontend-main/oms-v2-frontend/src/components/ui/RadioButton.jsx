import React from "react";
import { useAutoRequired } from "@/hooks/useRequiredFields";

const colorClasses = {
    blue: "accent-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600",
    red: "accent-red-600 focus:ring-red-500 dark:focus:ring-red-600",
    green: "accent-green-600 focus:ring-green-500 dark:focus:ring-green-600",
    purple: "accent-purple-600 focus:ring-purple-500 dark:focus:ring-purple-600",
    teal: "accent-teal-600 focus:ring-teal-500 dark:focus:ring-teal-600",
    yellow: "accent-yellow-400 focus:ring-yellow-500 dark:focus:ring-yellow-600",
    orange: "accent-orange-500 focus:ring-orange-500 dark:focus:ring-orange-600",
};

const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-7 h-7",
};

// Card-specific size classes for border, padding, and text
const cardSizeClasses = {
    sm: "p-1 text-xs",
    md: "p-1.5 text-sm",
    lg: "p-2.5 text-base",
    xl: "p-4.5 text-lg",
};

const variantClasses = {
    default: "",
    bordered: "border border-gray-200 rounded-md p-3 dark:border-gray-700",
    list: "w-full rounded-t-lg",
    card: "inline-flex items-center justify-between w-full bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 dark:peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700",
    inline: "inline-flex items-center",
};

export function RadioButton({
    options = [],
    name,
    value,
    onChange,
    variant = "default",
    color = "blue",
    size = "md",
    label,
    className = "",
    disabled = false,
    direction = "vertical", // "vertical" or "horizontal"
    error,
    description,
    required = false,
}) {

    const autoRequired = useAutoRequired(name);
    const showRequired = Boolean(required || autoRequired);

    // Merge all variant classes from a space-separated string
    function getVariantClasses(variant) {
        if (!variant) return "";
        return variant
            .split(" ")
            .map(v => {
                if (v === "card") {
                    // Add card size classes if card variant
                    return `${variantClasses.card} ${cardSizeClasses[size]}`;
                }
                return variantClasses[v] || "";
            })
            .join(" ");
    }

    return (
        <div className={`mb-4 ${className}`}>
            {label && (
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    <span className="inline-flex items-center gap-1">
                        <span>{label}</span>
                        {showRequired && !String(label).includes("*") && (
                            <span className="text-red-500 font-bold leading-none">*</span>
                        )}
                    </span>
                </label>
            )}
            <div
                className={
                    variant.includes("inline")
                        ? "flex flex-row gap-4"
                        : direction === "horizontal"
                            ? "flex flex-row gap-4"
                            : "flex flex-col gap-2"
                }
            >
                {options.map((option, idx) => (
                    <label
                        key={option.value}
                        className={`flex items-center gap-2 cursor-pointer ${getVariantClasses(variant)} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={onChange}
                            disabled={disabled}
                            className={`
                                ${sizeClasses[size]}
                                ${colorClasses[color]}
                                border-gray-300 dark:border-gray-600
                                rounded-full
                                focus:outline-none
                                ${disabled ? "cursor-not-allowed" : ""}
                            `}
                        />
                        <span className={`text-gray-900 dark:text-gray-200 ${cardSizeClasses[size]}`}>{option.label}</span>
                    </label>
                ))}
            </div>
            {description && (
                <div className="text-xs text-gray-500 mt-1">{description}</div>
            )}
            {error && (
                <div className="text-xs text-red-500 mt-1">{error}</div>
            )}
        </div>
    );
}

export default RadioButton;