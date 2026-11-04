import React from 'react';

const ButtonTw = ({
    children,
    type = 'button',
    variant = 'default',
    size = 'base',
    rounded = 'default',
    disabled = false,
    loading = false,
    icon = null,
    iconPosition = 'left',
    badge = null,
    pointer = true,
    className = '',
    block = false,
    iconOnly = false,
    tooltip = '',
    shadow = '', // "sm", "md", "lg", "xl"
    ...props
}) => {

    // Flat variant maps
    const baseVariants = {
        default: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
        alternative: 'text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:ring-gray-200 dark:bg-theme-dark dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700',
        dark: 'text-white bg-gray-800 hover:bg-gray-900 focus:ring-gray-300 dark:bg-theme-dark dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700',
        light: 'text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-gray-200 dark:bg-theme-dark dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700',
        green: 'text-white bg-green-700 hover:bg-green-800 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800',
        red: 'text-white bg-red-700 hover:bg-red-800 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900',
        yellow: 'text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300 dark:focus:ring-yellow-900',
        purple: 'text-white bg-purple-700 hover:bg-purple-800 focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900',
    };

    const outlineVariants = {
        blue: 'text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800',
        gray: 'text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800',
        green: 'text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800',
        red: 'text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900',
        yellow: 'text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-400 dark:focus:ring-yellow-900',
        purple: 'text-purple-700 hover:text-white border border-purple-700 hover:bg-purple-800 focus:ring-purple-300 dark:border-purple-400 dark:text-purple-400 dark:hover:text-white dark:hover:bg-purple-500 dark:focus:ring-purple-900',
    };


    const gradientVariants = {
        blue: 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-linear-to-br focus:ring-blue-300 dark:focus:ring-blue-800',
        green: 'bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-linear-to-br focus:ring-green-300 dark:focus:ring-green-800',
        cyan: 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-linear-to-br focus:ring-cyan-300 dark:focus:ring-cyan-800',
        teal: 'bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-linear-to-br focus:ring-teal-300 dark:focus:ring-teal-800',
        lime: 'bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 hover:bg-linear-to-br focus:ring-lime-300 dark:focus:ring-lime-800 text-gray-900',
        red: 'bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-linear-to-br focus:ring-red-300 dark:focus:ring-red-800',
        pink: 'bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-linear-to-br focus:ring-pink-300 dark:focus:ring-pink-800',
        purple: 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-linear-to-br focus:ring-purple-300 dark:focus:ring-purple-800',
        purpleToBlue: 'bg-linear-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-blue-300 dark:focus:ring-blue-800',
        cyanToBlue: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800',
        greenToBlue: 'bg-linear-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-green-200 dark:focus:ring-green-800',
        purpleToPink: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-purple-200 dark:focus:ring-purple-800',
        pinkToOrange: 'bg-linear-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-pink-200 dark:focus:ring-pink-800',
        tealToLime: 'bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-lime-200 dark:focus:ring-teal-700 text-gray-900',
        redToYellow: 'bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-red-100 dark:focus:ring-red-400 text-gray-900',
    };

    const socialVariants = {
        facebook: 'bg-[#3b5998] hover:bg-[#3b5998]/90 focus:ring-[#3b5998]/50 dark:focus:ring-[#3b5998]/55',
        twitter: 'bg-[#1da1f2] hover:bg-[#1da1f2]/90 focus:ring-[#1da1f2]/50 dark:focus:ring-[#1da1f2]/55',
        github: 'bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-[#24292F]/50 dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30',
        google: 'bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-[#4285F4]/50 dark:focus:ring-[#4285F4]/55',
        apple: 'bg-[#050708] hover:bg-[#050708]/90 focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30 dark:focus:ring-[#050708]/50',
        metamask: 'text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-gray-100 dark:focus:ring-gray-600 dark:bg-theme-dark dark:border-gray-700 dark:text-white dark:hover:bg-gray-700',
        opera: 'text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-gray-100 dark:focus:ring-gray-600 dark:bg-theme-dark dark:border-gray-700 dark:text-white dark:hover:bg-gray-700',
        bitcoin: 'bg-[#FF9119] hover:bg-[#FF9119]/80 focus:ring-[#FF9119]/50 dark:hover:bg-[#FF9119]/80 dark:focus:ring-[#FF9119]/40',
        paypal: 'bg-[#F7BE38] hover:bg-[#F7BE38]/90 focus:ring-[#F7BE38]/50 dark:focus:ring-[#F7BE38]/50',
        applePay: 'bg-[#050708] hover:bg-[#050708]/80 focus:ring-[#050708]/50 dark:hover:bg-[#050708]/40 dark:focus:ring-gray-600',
        amex: 'bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-[#2557D6]/50 dark:focus:ring-[#2557D6]/50',
        visa: 'text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-gray-100 dark:focus:ring-gray-800 dark:bg-white dark:border-gray-700 dark:text-gray-900 dark:hover:bg-gray-200',
        mastercard: 'text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-gray-100 dark:focus:ring-gray-600 dark:bg-theme-dark dark:border-gray-700 dark:text-white dark:hover:bg-gray-700',
        ethereum: 'text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-gray-100 dark:focus:ring-gray-500',
    };

    const sizeClasses = {
        sm: iconOnly ? 'p-2 text-sm' : 'text-sm px-3 py-1.5',
        base: iconOnly ? 'p-2.5 text-base' : 'text-base px-4 py-2',
        lg: iconOnly ? 'p-3 text-lg' : 'text-lg px-5 py-3',
        xl: iconOnly ? 'p-4 text-xl' : 'text-xl px-6 py-3.5',
    };

    const roundedClasses = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        default: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
    };

    const shadowClasses = {
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
    };

    const getVariantClass = () => {
        if (variant.startsWith('outline.')) return outlineVariants[variant.split('.')[1]] || '';
        if (variant.startsWith('gradient.')) return gradientVariants[variant.split('.')[1]] || '';
        if (variant.startsWith('social.')) return socialVariants[variant.split('.')[1]] || '';
        return baseVariants[variant] || '';
    };

    const cursorClass = disabled
        ? 'cursor-not-allowed'
        : pointer
            ? 'cursor-pointer'
            : 'cursor-default';

    const isIconOnly = iconOnly || (!!icon && !children);

    const finalClass = [
        'inline-flex items-center justify-center transition duration-150 ease-in-out',
        getVariantClass(),
        sizeClasses[size],
        roundedClasses[rounded],
        shadow ? shadowClasses[shadow] : '',
        cursorClass,
        block ? 'w-full' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    // Regular button
    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={finalClass}
            title={tooltip}
            {...props}
        >
            {loading ? (
                <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            ) : (
                <>
                    {icon && iconPosition === 'left' && !isIconOnly && <span className="mr-2">{icon}</span>}
                    {children}
                    {icon && iconPosition === 'right' && !isIconOnly && <span className="ml-2">{icon}</span>}
                    {isIconOnly && icon}
                    {badge && <span className="ml-2">{badge}</span>}
                </>
            )}
        </button>
    );
};

export { ButtonTw };
export default ButtonTw;