import React from "react";

const TabContent = ({ active, className, children }) => {
    return (
        active ? <div
            className={`transition-opacity duration-300 ${active ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} ${className}`}
            style={{ minHeight: 0, display: active ? "block" : "none" }}
            aria-hidden={!active}
        >
            {children}
        </div> : null
    );
}

export default TabContent;