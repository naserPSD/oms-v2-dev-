const BarChartSkeleton = () => {
    return (
        <div className="h-full w-full flex flex-col justify-between animate-pulse">

            {/* Header skeleton bars */}
            <div className="flex gap-3 px-4">
                <div className="h-4 w-24 bg-gray-300/50 rounded"></div>
                <div className="h-4 w-16 bg-gray-300/50 rounded"></div>
                <div className="h-4 w-20 bg-gray-300/50 rounded"></div>
            </div>

            {/* Chart skeleton blocks */}
            <div className="flex-1 flex items-end gap-2 px-4 pb-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className="w-full bg-gray-300/40 rounded"
                        style={{ height: `${20 + Math.random() * 60}%` }}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default BarChartSkeleton;