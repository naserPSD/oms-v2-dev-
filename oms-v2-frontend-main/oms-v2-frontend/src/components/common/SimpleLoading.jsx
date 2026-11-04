const SimpleLoading = ({
    loading = true,
    loadingText = "Loading...",
    showText = true,
    overlay = true,
    children,
}) => {
    if (!loading) return null;

    return (
        <div
            className={`flex items-center justify-center ${overlay
                    ? "absolute inset-0 bg-white/70 dark:bg-black/60 z-10"
                    : "h-64"
                }`}
        >
            <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

                {showText && !children && (
                    <span className="text-blue-600 text-sm animate-pulse">
                        {loadingText}
                    </span>
                )}

                {children}
            </div>
        </div>
    );
};

export default SimpleLoading;
