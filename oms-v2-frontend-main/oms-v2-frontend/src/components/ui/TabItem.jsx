import React from "react";

const TabItem = ({ active, onClick, children, className = "" }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex flex-row items-center gap-2 cursor-pointer btn hover:bg-blue-300 dark:hover:text-gray-700 font-bold leading-[16px] py-[15px] px-[10px] rounded-none text-[12px] 2xl:text-[16px] w-full
            ${active
                ? "bg-blue-200 text-gray-700"
                : "bg-white text-gray-700 dark:bg-theme-dark dark:text-gray-500"
            }
            ${className}`}
    >
        {children}
    </button>
);

export default TabItem;