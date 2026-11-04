"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { AiOutlineAreaChart } from "react-icons/ai";
import { FaCheck } from "react-icons/fa6";
import { RiBarChartFill, RiLineChartFill } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown } from "lucide-react";
import BarChartSkeleton from "@/components/loader/BarChartSkeleton";

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{`Day ${label}`}</p>
        {payload.map(
          (entry, index) =>
            entry.value > 0 && (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {`${entry.name}: ${entry.value}`}
              </p>
            )
        )}
      </div>
    );
  }
  return null;
};

export default function AttendanceSummaryChart({ attSummery, onMonthChange, isLoading }) {
  // const [chartView, setChartView] = useState("Bar Chart View");
  const chartViewOptions = [
    {
      label: "Bar Chart View",
      value: "bar",
      icon: <RiBarChartFill className="w-4 h-4 mr-2 text-primary" />,
    },
    {
      label: "Line Chart View",
      value: "line",
      icon: <RiLineChartFill className="w-4 h-4 mr-2 text-blue-500" />,
    },
    {
      label: "Area Chart View",
      value: "area",
      icon: <AiOutlineAreaChart className="w-4 h-4 mr-2 text-green-500" />,
    },
  ];

  const [chartView, setChartView] = useState("bar");

  // Generate last 12 months
  const monthOptions = useMemo(() => {
    const list = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      list.push({ label, value: date });
    }
    return list;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].label);

  // Notify parent API call
  const handleMonthSelect = (m) => {
    console.log('m', m)
    setSelectedMonth(m.label);
    onMonthChange?.(m.value); // calls parent page to reload API
  };

  const chartData = useMemo(() => {
    const d = attSummery?.dailySummery;
    return d || [];
  }, [attSummery]);

  const barKeys = [
    { key: "present", label: "Present", color: "#22c55e" },
    { key: "absent", label: "Absent", color: "#ef4444" },
    { key: "halfDay", label: "Half Day", color: "#8b5cf6" },
    { key: "onLeave", label: "On Leave", color: "#64748b" },
    { key: "weekend", label: "Weekend", color: "#9ca3af" },
    { key: "holiday", label: "Holiday", color: "#1e40af" },
    { key: "late", label: "Late", color: "#f97110" },
    { key: "onTime", label: "On Time", color: "#31774b" },
    { key: "leftEarly", label: "Left Early", color: "#f91110" },
    { key: "leftTimely", label: "Left Timely", color: "#21774b" },
  ];

  const [visibleKeys, setVisibleKeys] = useState(
    barKeys.reduce((a, b) => ({ ...a, [b.key]: true }), {})
  );

  const toggleBar = (key) =>
    setVisibleKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  // ───────────────────────────────────────────────────────────
  // CHART RENDER FUNCTION
  // ───────────────────────────────────────────────────────────
  const renderChart = () => {
    const grid = <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />;
    const x = <XAxis dataKey="day" axisLine={false} tickLine={false} />;
    const y = <YAxis axisLine={false} tickLine={false} />;
    const tooltip = <Tooltip content={<CustomTooltip />} />;

    if (chartView === "line") {
      return (
        <LineChart data={chartData}>
          {grid}
          {x}
          {y}
          {tooltip}
          {barKeys.map(
            (item) =>
              visibleKeys[item.key] && (
                <Line
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  stroke={item.color}
                  dot={false}
                />
              )
          )}
        </LineChart>
      );
    }

    if (chartView === "area") {
      return (
        <AreaChart data={chartData}>
          {grid}
          {x}
          {y}
          {tooltip}
          {barKeys.map(
            (item) =>
              visibleKeys[item.key] && (
                <Area
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  stroke={item.color}
                  fill={item.color + "30"}
                />
              )
          )}
        </AreaChart>
      );
    }

    // Default: Bar
    return (
      <BarChart data={chartData}>
        {grid}
        {x}
        {y}
        {tooltip}
        {barKeys.map(
          (item) =>
            visibleKeys[item.key] && (
              <Bar key={item.key} dataKey={item.key} stackId="a" fill={item.color} />
            )
        )}
      </BarChart>
    );

  };

  return (
    <div className="card-gradient rounded-lg p-4 ">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="font-bold text-lg title-color">Monthly Attendance Summary Chart</h4>

          {/* Chart View Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto title-color">
                <span className="text-sm">
                  {chartViewOptions.find((v) => v.value === chartView)?.label}
                </span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            {/* <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setChartView("Bar Chart View")}>
                Bar Chart View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartView("Line Chart View")}>
                Line Chart View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartView("Area Chart View")}>
                Area Chart View
              </DropdownMenuItem>
            </DropdownMenuContent> */}


            {/* {chartViewOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setChartView(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))} */}

            <DropdownMenuContent className="w-48">
              {chartViewOptions.map((option) => {
                const isActive = chartView === option.value;

                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setChartView(option.value)}
                    className={`flex items-center justify-between ${isActive ? "bg-gray-100 dark:bg-gray-800" : ""
                      }`}
                  >
                    <div className="flex items-center">
                      {option.icon}
                      {option.label}
                    </div>

                    {isActive && <FaCheck className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>

          </DropdownMenu>
        </div>

        {/* MONTH DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full px-4 bg-transparent">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">{selectedMonth}</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            {monthOptions.map((m, i) => (
              <DropdownMenuItem key={i} onClick={() => handleMonthSelect(m)}>
                {m.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* CHART DISPLAY */}
      <div className="h-[300px]">
        {(isLoading || !attSummery?.dailySummery) && (
          <BarChartSkeleton />
        )}
        
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* CLICKABLE LEGEND */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs">
        {barKeys.map((item) => (
          <div
            key={item.key}
            onClick={() => toggleBar(item.key)}
            className="flex items-center gap-1 cursor-pointer select-none"
            style={{ opacity: visibleKeys[item.key] ? 1 : 0.3 }}
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            ></div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
