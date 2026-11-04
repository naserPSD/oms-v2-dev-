"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
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

export default function AttendanceSummaryChartForAll() {
  const [selectedMonth, setSelectedMonth] = useState("Jan 2025");
  const [chartView, setChartView] = useState("Bar Chart View");

    const {
      useAttendanceSummeryForAuthUserQuery,
    } = useMyProfileQueryApi({});
  
    const { data: attendanceSummeryResponseData } =
      useAttendanceSummeryForAuthUserQuery();
  
    const responseData = {
      attendanceSummery: attendanceSummeryResponseData?.data,
    };

  return (
    <div className="border rounded-lg p-4 ">
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
          <BarChart
            data={attendanceChartData}
            margin={{ top: 20, right: 30, }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
            />
            <Bar dataKey="present" stackId="a" fill="#22c55e" name="Present" />
            <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
            <Bar
              dataKey="extremeDelay"
              stackId="a"
              fill="#f97316"
              name="Extreme delay"
            />
            <Bar dataKey="delay" stackId="a" fill="#eab308" name="Delay" />
            <Bar dataKey="onLeave" stackId="a" fill="#374151" name="On leave" />
            <Bar dataKey="weekend" stackId="a" fill="#9ca3af" name="Weekend" />
            <Bar
              dataKey="holidays"
              stackId="a"
              fill="#1e40af"
              name="Holidays"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span className="title-color">Present</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span className="title-color">Absent</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-orange-500" />
          <span className="title-color">Extreme delay</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-yellow-500" />
          <span className="title-color">Delay</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-700" />
          <span className="title-color">On leave</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-400" />
          <span className="title-color">Weekend</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-blue-700" />
          <span className="title-color">Holidays</span>
        </div>
      </div>
    </div>
  );
}
