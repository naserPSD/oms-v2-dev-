import React from 'react';

// type RadioColor = 'primary' | 'success' | 'danger' | 'info' | 'warning' | 'secondary';

// interface RadioProps {
//     name: string;
//     value: string;
//     label: string;
//     checked?: boolean;
//     color?: RadioColor;
//     onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     className?: string;
// }


const Radio = ({
    name,
    value,
    label,
    checked = false,
    color = 'success',
    activeColor = false,
    onChange,
    variant = 'default',
    size = 'md',
    className = '',
    disabled = false,
}) => {


    const colorClasses = {
        primary: 'text-blue-500',
        success: 'text-green-500',
        danger: 'text-red-500',
        info: 'text-cyan-500',
        warning: 'text-yellow-400',
        secondary: 'text-gray-600',
    };

    const bgColorClasses = {
        primary: '!bg-blue-500/20',
        success: '!bg-green-500/20',
        danger: '!bg-red-500/20',
        info: '!bg-cyan-500/20',
        warning: '!bg-yellow-400/20',
        secondary: '!bg-gray-600/20',
    };

    const colorClass = colorClasses[color];
    const bgColorClass = bgColorClasses[color];

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

    const isActiveBgColorAndChecked = checked && activeColor;

    return (
        <>
            <label className={`flex items-center cursor-pointer ${className} ${getVariantClasses(variant)} ${disabled ? "opacity-60 cursor-not-allowed" : ""}  ${isActiveBgColorAndChecked ? `${bgColorClass}`: ""}`}>
                <input
                    type="radio"
                    name={name}
                    value={value}
                    checked={checked}
                    disabled={disabled}
                    onChange={onChange}
                    className="absolute opacity-0 h-0 w-0"
                />
                <span className={`flex items-center transition-colors duration-200`}>
                    <span className={`
                    flex-shrink-0
                    w-5 h-5
                    rounded-full
                    border-2
                    mr-2
                    flex items-center justify-center
                    ${sizeClasses[size]}
                    ${colorClass}
                    ${checked ? `border-current` : 'border-gray-300'}
                    `}>
                        {checked && (
                            <span className={`w-2.5 h-2.5 rounded-full bg-current`}></span>
                        )}
                    </span>
                    <span className={`text-gray-900 dark:text-gray-200 ${cardSizeClasses[size]}`}>{label}</span>
                </span>
            </label>
        </>
    );
};

export default Radio;