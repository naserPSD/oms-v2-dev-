"use client";
import { useEffect } from "react";

export default function Toast({ message, show, onClose, duration = 2000 }) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, duration); // auto close after 2s
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="fixed bottom-5 right-5 bg-gray-900 dark:bg-gray-800 text-green-500 px-4 py-1 text-sm rounded-lg shadow-lg animate-slide-in z-99">
            {message}
        </div>
    );
}
