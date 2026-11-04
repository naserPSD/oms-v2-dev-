"use client";
import { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import SimpleTooltip from "../ui/SimpleTooltip";

export default function FullscreenButton() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    return (
        <SimpleTooltip text={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}>
            <button
                type="button"
                onClick={toggleFullscreen}
                className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-100 dark:hover:bg-gray-700/80 flex items-center justify-center transition-all duration-200 active:scale-95 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer shadow-xs"
                aria-label="Toggle Fullscreen"
            >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
        </SimpleTooltip>
    );
}
