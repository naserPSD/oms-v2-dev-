"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Cell, Label, Pie, PieChart, Tooltip } from "recharts";

const LEAVE_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#f59e0b", // amber — Regular Leave etc.
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
  "#f97316", // orange
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage =
      data.type === "Remaining"
        ? Math.round((data.days / (data.totalDays || 1)) * 100)
        : data.total > 0
          ? Math.min(100, Math.round((data.used / data.total) * 100))
          : 0;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <p className="font-bold text-gray-900 dark:text-white text-base">
            {data.type}
          </p>
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {data.days} days
        </p>
        {data.type !== "Remaining" ? (
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {data.used} of {data.total} days used
            </p>
            <p className="text-xs text-primaryColor dark:text-primaryColor-400 font-medium">
              {percentage}% utilized
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {percentage}% of total leave
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function LeaveOverview({
  leaveData = {},
  totalData = {},
  isLoading = false,
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const processedLeaveData =
    leaveData && Object.keys(leaveData).length > 0 ? leaveData : {};

  const processedTotalData = {
    totalLeave: totalData?.totalLeave ?? 0,
    totalUsed: totalData?.totalUsed ?? 0,
    totalRemaining: totalData?.totalRemaining ?? 0,
  };

  // Every leave type gets its own color (Regular Leave included)
  const chartData = Object.entries(processedLeaveData).map(
    ([type, data], index) => ({
      type,
      days: Number(data?.used) || 0,
      used: Number(data?.used) || 0,
      total: Number(data?.total) || 0,
      color: LEAVE_COLORS[index % LEAVE_COLORS.length],
    }),
  );

  const pieUsedSlices = chartData.filter((item) => item.days > 0);

  const totalUsed = chartData.reduce((acc, curr) => acc + curr.days, 0);
  const remainingDays = Math.max(
    0,
    processedTotalData.totalRemaining ??
      processedTotalData.totalLeave - totalUsed,
  );

  const getUsagePercent = (used, total) => {
    if (!total || total <= 0) return used > 0 ? 100 : 0;
    return Math.min(100, (used / total) * 100);
  };

  const remainingColor = isDark ? "#4b5563" : "#e5e7eb";
  const pieStroke = isDark ? "#1f2937" : "#ffffff";
  const centerFill = isDark ? "#f9fafb" : "#111827";
  const centerSubFill = isDark ? "#d1d5db" : "#6b7280";

  const fullChartData = [
    ...pieUsedSlices,
    {
      type: "Remaining",
      days: remainingDays > 0 ? remainingDays : 0,
      color: remainingColor,
      totalDays: processedTotalData.totalLeave || totalUsed + remainingDays,
    },
  ].filter((item) => item.days > 0);

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full">
        <CardContent className="p-4 sm:p-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-6 animate-pulse" />
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto animate-pulse" />
            <div className="flex-1 space-y-4 w-full">
              {[1, 2, 3].map((item) => (
                <div key={item} className="space-y-2 animate-pulse">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const monthLabel = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          Leave Overview — {monthLabel}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-wrap justify-center items-center lg:items-start gap-6">
        <div className="w-full max-w-[220px]">
          {fullChartData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-500 dark:text-gray-300">
              No leave usage yet
            </div>
          ) : (
            <PieChart width={220} height={220}>
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "transparent" }}
              />
              <Pie
                data={fullChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="days"
                strokeWidth={2}
                stroke={pieStroke}
              >
                {fullChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            fill={centerFill}
                            style={{ fontSize: 28, fontWeight: 700 }}
                          >
                            {remainingDays}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 28}
                            fill={centerSubFill}
                            style={{ fontSize: 12, fontWeight: 500 }}
                          >
                            Available
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          )}
        </div>

        <div className="flex-1 space-y-4 min-w-[200px]">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Leave Breakdown
          </h3>

          {chartData.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-300">
              No leave types found.
            </p>
          ) : (
            chartData.map((item, index) => {
              const isOverLimit = item.used > item.total;
              const barPercent = getUsagePercent(item.used, item.total);

              return (
                <div key={item.type || index} className="space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/5 dark:ring-white/20"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                        {item.type}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-semibold shrink-0 ${
                        isOverLimit
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {item.used}/{item.total}
                    </span>
                  </div>
                  <div className="w-full overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 max-w-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barPercent}%`,
                        backgroundColor: isOverLimit ? "#ef4444" : item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                Total Used:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {totalUsed} days
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-300">
                Remaining:
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {remainingDays} days
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-300">
                Total Leave:
              </span>
              <span className="font-semibold text-primaryColor dark:text-primaryColor-400">
                {processedTotalData.totalLeave} days
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
