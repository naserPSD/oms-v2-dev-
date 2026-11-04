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
  Area,
  Legend,
  Scatter,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown } from "lucide-react";
import { attendanceChartData } from "@/data/attendanceChartData";
import { useMyProfileQueryApi } from "@/hooks/queryApi/useMyProfileQueryApi";

// Sample data for January 2025

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
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

export default function AttendanceSummaryBarChart({ attSummery }) {
  const [selectedMonth, setSelectedMonth] = useState("Jan 2025");
  const [chartView, setChartView] = useState("Bar Chart View");

  console.log('attSummery===================>', attSummery)

  const chartData = useMemo(() => {
    const dailySummery = attSummery?.dailySummery;
    if (!dailySummery) return [];

    return dailySummery;

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

  const [visibleBars, setVisibleBars] = useState(
    barKeys.reduce((acc, item) => {
      acc[item.key] = true;
      return acc;
    }, {})
  );

  const toggleBar = (key) => {
    setVisibleBars(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="card-gradient rounded-lg p-4 ">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="font-bold text-lg title-color mb-1">
            Attendance summery
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="p-0 h-auto title-color"
              >
                <span className="text-sm">{chartView}</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setChartView("Bar Chart View")}>
                Bar Chart View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartView("Line Chart View")}>
                Line Chart View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartView("Area Chart View")}>
                Area Chart View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-full px-4 bg-transparent"
            >
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-semibold title-color">
                {selectedMonth}
              </span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedMonth("Dec 2024")}>
              Dec 2024
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedMonth("Jan 2025")}>
              Jan 2025
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedMonth("Feb 2025")}>
              Feb 2025
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -40 }}>
            <CartesianGrid strokeDasharray="1 6" stroke="#23c4c1" />

            <XAxis dataKey="day" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false}/>

            <Tooltip content={<CustomTooltip />} />

            {/* <Legend />
            <Area type="monotone" dataKey="holiday" fill="#8884d8" stroke="#8884d8" />
            <Bar dataKey="present" barSize={20} fill="#413ea0" />
            <Scatter dataKey="absent" fill="red" />
            <Line type="monotone" dataKey="late" stroke="#ff7300" /> */}

            {barKeys.map(item =>
              visibleBars[item.key] ? (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  stackId="a"
                  fill={item.color}
                  name={item.label}
                />
              ) : null
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs">
        {barKeys.map(item => (
          <div
            key={item.key}
            className="flex items-center gap-1 cursor-pointer select-none"
            onClick={() => toggleBar(item.key)}
            style={{ opacity: visibleBars[item.key] ? 1 : 0.3 }}
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
