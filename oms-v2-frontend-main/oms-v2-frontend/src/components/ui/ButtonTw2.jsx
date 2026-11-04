import React from 'react';

const ButtonTw2 = ({
    children,
    type = 'button',
    variant = 'default',
    size = 'xs',
    rounded = 'default',
    gradient = false,
    shadow = false,
    disabled = false,
    loading = false,
    icon = null,
    iconPosition = 'left',
    badge = null,
    pointer = true,
    className = '',
    ...props
}) => {

 // Determine cursor class
  const cursorClass = disabled
  ? 'cursor-not-allowed'
  : pointer
  ? 'cursor-pointer'
  : 'cursor-default';

    const finalClass = `${className} ${cursorClass}`;
  
    // Variant classes
    const variants = {
        default: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
        alternative: 'text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:ring-gray-200 dark:bg-theme-dark dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700',
        dark: 'text-white bg-gray-800 hover:bg-gray-900 focus:ring-gray-300 dark:bg-theme-dark dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700',
        light: 'text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-gray-200 dark:bg-theme-dark dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700',
        green: 'text-white bg-green-700 hover:bg-green-800 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800',
        red: 'text-white bg-red-700 hover:bg-red-800 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900',
        yellow: 'text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300 dark:focus:ring-yellow-900',
        purple: 'text-white bg-purple-700 hover:bg-purple-800 focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900',
        outline: {
            blue: 'text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800',
            gray: 'text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800',
            green: 'text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800',
            red: 'text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900',
            yellow: 'text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-400 dark:focus:ring-yellow-900',
            purple: 'text-purple-700 hover:text-white border border-purple-700 hover:bg-purple-800 focus:ring-purple-300 dark:border-purple-400 dark:text-purple-400 dark:hover:text-white dark:hover:bg-purple-500 dark:focus:ring-purple-900',
        },
        gradient: {
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
        },
        social: {
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
        },
        borderedGradient: {
            purpleToBlue: 'bg-linear-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-blue-300 dark:focus:ring-blue-800',
            cyanToBlue: 'bg-linear-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-cyan-200 dark:focus:ring-cyan-800',
            greenToBlue: 'bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-green-200 dark:focus:ring-green-800',
            purpleToPink: 'bg-linear-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-purple-200 dark:focus:ring-purple-800',
            pinkToOrange: 'bg-linear-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-pink-200 dark:focus:ring-pink-800',
            tealToLime: 'bg-linear-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-lime-200 dark:focus:ring-lime-800',
            redToYellow: 'bg-linear-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-red-100 dark:focus:ring-red-400',
        }
    };

    // Size classes
    const sizes = {
        xs: 'px-3 py-2 text-xs',
        sm: 'px-3 py-2 text-sm',
        base: 'px-5 py-2.5 text-sm',
        lg: 'px-5 py-3 text-base',
        xl: 'px-6 py-3.5 text-base',
        icon: {
            sm: 'p-2 text-sm',
            base: 'p-2.5 text-sm',
            lg: 'p-3 text-base',
            xl: 'p-3.5 text-base',
        }
    };

    // Rounded classes
    const roundedStyles = {
        default: 'rounded-lg',
        full: 'rounded-full',
        none: 'rounded-none',
    };

    // Shadow classes
    const shadowStyles = {
        blue: 'shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80',
        green: 'shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80',
        cyan: 'shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80',
        teal: 'shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80',
        lime: 'shadow-lg shadow-lime-500/50 dark:shadow-lg dark:shadow-lime-800/80',
        red: 'shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80',
        pink: 'shadow-lg shadow-pink-500/50 dark:shadow-lg dark:shadow-pink-800/80',
        purple: 'shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80',
    };

    // Determine variant classes
    let variantClasses = '';
    if (gradient) {
        variantClasses = variants.gradient[variant] || variants.gradient.blue;
    } else if (variant.startsWith('outline-')) {
        const outlineVariant = variant.replace('outline-', '');
        variantClasses = variants.outline[outlineVariant] || variants.outline.blue;
    } else if (variant.startsWith('social-')) {
        const socialVariant = variant.replace('social-', '');
        variantClasses = variants.social[socialVariant] || variants.social.facebook;
    } else if (variant.startsWith('borderedGradient-')) {
        const gradientVariant = variant.replace('borderedGradient-', '');
        variantClasses = variants.borderedGradient[gradientVariant] || variants.borderedGradient.purpleToBlue;
    } else {
        variantClasses = variants[variant] || variants.default;
    }

    // Determine size classes
    let sizeClasses = sizes[size] || sizes.base;

    // Determine rounded classes
    let roundedClass = roundedStyles[rounded] || roundedStyles.default;

    // Determine shadow classes
    let shadowClass = '';
    if (shadow) {
        shadowClass = shadowStyles[variant] || shadowStyles.blue;
    }

    // Loading state
    const loadingSpinner = (
        <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
        </svg>
    );

    // Bordered gradient button
    if (variant.startsWith('borderedGradient-')) {
        return (
            <button
                type={type}
                disabled={disabled || loading}
                className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group ${variantClasses} focus:ring-4 focus:outline-none ${className} ${cursorClass}`}
                {...props}
            >
                <span className={`relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent ${sizeClasses}`}>
                    {loading && loadingSpinner}
                    {icon && iconPosition === 'left' && icon}
                    {children}
                    {icon && iconPosition === 'right' && icon}
                    {badge && (
                        <span className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">
                            {badge}
                        </span>
                    )}
                </span>
            </button>
        );
    }

    // Regular button
    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`font-medium text-center inline-flex items-center ${variantClasses} focus:ring-4 focus:outline-none ${roundedClass} ${sizeClasses} ${shadowClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className} ${cursorClass}`}
            {...props}
        >
            {loading && loadingSpinner}
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
            {badge && (
                <span className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">
                    {badge}
                </span>
            )}
        </button>
    );
};

export { ButtonTw2 };
export default ButtonTw2;