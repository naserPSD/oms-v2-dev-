// components/monthly-report/AttendanceCharts.jsx
"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaCalendarAlt,
  FaChartLine,
  FaClock,
  FaUsers,
} from "react-icons/fa";
import { EmployeeDetailedReport } from "./EmployeeDetailedReport";
import EmployeePerformanceTable from "./EmployeePerformanceTable";
import SummaryCards from "./SummaryCards";
import { TopPerformers } from "./TopPerformers";
import MonthlyInsights from "./MonthlyInsights";
import { Button } from "react-bootstrap";

// Department performance chart with dark mode support
const DepartmentPerformance = ({ departmentStats }) => {
  const data = departmentStats.map((dept) => ({
    label: dept.department,
    value: dept.attendanceRate,
    employees: dept.totalEmployees,
    overtime: dept.averageOvertime,
    lateArrivals: dept.lateArrivals,
    earlyDepartures: dept.earlyDepartures,
  }));

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <FaUsers className="w-4 h-4" />
          Department Performance
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Detailed attendance metrics by department
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((dept, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm dark:text-gray-200">
                  {dept.label}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs dark:border-gray-600 dark:text-gray-300"
                  >
                    {dept.value}%
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs dark:bg-gray-700 dark:text-gray-300"
                  >
                    {dept.employees} emp
                  </Badge>
                </div>
              </div>

              <Progress value={dept.value} className="h-2 dark:bg-gray-700" />

              <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="font-semibold dark:text-gray-300">
                    {dept.overtime}h
                  </div>
                  <div>Avg OT</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold dark:text-gray-300">
                    {dept.lateArrivals}
                  </div>
                  <div>Late</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold dark:text-gray-300">
                    {dept.earlyDepartures}
                  </div>
                  <div>Early</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Attendance trend chart with enhanced visualization
const AttendanceTrend = ({ trends }) => {
  if (!trends.dailyAttendance) return null;

  const weeklyData = trends.attendanceByWeek || [];
  const maxAttendance = Math.max(
    ...weeklyData.map((week) => week.attendanceRate)
  );

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <FaChartLine className="w-4 h-4" />
          Weekly Performance Trend
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Attendance progression throughout the month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {weeklyData.map((week, index) => {
            const progressPercentage =
              (week.attendanceRate / maxAttendance) * 100;
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm dark:text-gray-200">
                    {week.week}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        week.attendanceRate >= 95 ? "default" : "secondary"
                      }
                      className="text-xs dark:bg-gray-700 dark:text-gray-300"
                    >
                      {week.attendanceRate}%
                    </Badge>
                    {index > 0 && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          week.attendanceRate >
                          weeklyData[index - 1].attendanceRate
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {week.attendanceRate >
                        weeklyData[index - 1].attendanceRate ? (
                          <FaArrowUp className="w-3 h-3" />
                        ) : (
                          <FaArrowDown className="w-3 h-3" />
                        )}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Progress
                    value={progressPercentage}
                    className="h-3 flex-1 dark:bg-gray-700"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">
                    {week.overtimeHours}h OT
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Week {index + 1}</span>
                  <span>Overtime: {week.overtimeHours}h</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Overtime analysis chart
const OvertimeAnalysis = ({ summary, departmentStats }) => {
  const overtimeRanges = [
    {
      range: "High (>15h)",
      count: 8,
      color: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
    },
    {
      range: "Moderate (8-15h)",
      count: 12,
      color: "bg-orange-500",
      text: "text-orange-600 dark:text-orange-400",
    },
    {
      range: "Low (1-7h)",
      count: 20,
      color: "bg-yellow-500",
      text: "text-yellow-600 dark:text-yellow-400",
    },
    {
      range: "No Overtime",
      count: 5,
      color: "bg-green-500",
      text: "text-green-600 dark:text-green-400",
    },
  ];

  const totalEmployees = overtimeRanges.reduce(
    (sum, range) => sum + range.count,
    0
  );

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <FaClock className="w-4 h-4" />
          Overtime Distribution
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Employee distribution by overtime hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {overtimeRanges.map((item, index) => {
            const percentage = (item.count / totalEmployees) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium dark:text-gray-200">
                    {item.range}
                  </div>
                  <div className={`text-sm font-semibold ${item.text}`}>
                    {item.count} ({percentage.toFixed(1)}%)
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-3 rounded-full ${item.color} transition-all hover:opacity-80 dark:opacity-90`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium dark:text-gray-300">
                Total Overtime:
              </span>
              <div className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                {summary?.totalOvertimeHours || 0} hours
              </div>
            </div>
            <div>
              <span className="font-medium dark:text-gray-300">
                Avg per Employee:
              </span>
              <div className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                {summary?.averageOvertimePerEmployee || 0} hours
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Quick stats cards for overview
const QuickStats = ({ summary }) => {
  const stats = [
    {
      label: "Average Attendance",
      value: `${summary?.averageAttendanceRate || 0}%`,
      icon: FaChartLine,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      trend: "+1.5%",
    },
    {
      label: "Total Employees",
      value: summary?.totalEmployees || 0,
      icon: FaUsers,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      trend: "+2%",
    },
    {
      label: "Working Days",
      value: summary?.totalWorkingDays || 0,
      icon: FaCalendarAlt,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      trend: "0%",
    },
    {
      label: "Total Overtime",
      value: `${summary?.totalOvertimeHours || 0}h`,
      icon: FaClock,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      trend: "-3%",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={`${stat.bgColor} border-0 dark:border dark:border-gray-700`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.color} mt-1`}>
                  {stat.value}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    stat.trend.startsWith("+")
                      ? "text-green-600 dark:text-green-400"
                      : stat.trend.startsWith("-")
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {stat.trend} from last month
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Main AttendanceCharts component
const AttendanceCharts = ({
  trends,
  departmentStats,
  month,
  summary,
  employees,
  onSelectWinner,
  employeeOfTheMonth,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // Quick employee stats for overview
  const quickEmployeeStats = {
    totalEmployees: employees.length,
    excellentPerformers: employees.filter(
      (emp) => emp.attendancePercentage >= 95
    ).length,
    onTimeEmployees: employees.filter(
      (emp) => emp.lateArrivals === 0 && emp.earlyDepartures === 0
    ).length,
    needsAttention: employees.filter((emp) => emp.attendancePercentage < 85)
      .length,
    avgAttendance: (
      employees.reduce((sum, emp) => sum + emp.attendancePercentage, 0) /
      employees.length
    ).toFixed(1),
  };
  return (
    <div className="space-y-6">
      {/* Summary Cards - Integrated from your component */}
      <SummaryCards summary={summary} />

      {/* Quick Stats Overview */}
      <QuickStats summary={summary} />

      {/* Tabs for different chart views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:text-gray-300"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="departments"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:text-gray-300"
          >
            Departments
          </TabsTrigger>
          <TabsTrigger
            value="employees"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:text-gray-300"
          >
            Employees Performance
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:text-gray-300"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB - Employee Content Added */}
        <TabsContent value="overview" className="space-y-6">
          {/* Employee Performance Highlights */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                👥 Employee Performance Highlights
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Key employee metrics and top performers overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {quickEmployeeStats.excellentPerformers}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Excellent Performers
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    (95%+ Attendance)
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {quickEmployeeStats.onTimeEmployees}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Always On Time
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Zero late/early
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {quickEmployeeStats.needsAttention}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Need Attention
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    (Below 85%)
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {quickEmployeeStats.avgAttendance}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Attendance
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Per Employee
                  </div>
                </div>
              </div>

              {/* Top 3 Employees Preview */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3 dark:text-gray-200">
                  🏆 Top 3 Performers This Month
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {employees.slice(0, 3).map((emp, index) => (
                    <div
                      key={emp.employeeId}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                              ? "bg-gray-500"
                              : "bg-orange-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm dark:text-gray-200 truncate">
                            {emp.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {emp.department}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {emp.attendancePercentage}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {emp.presentDays}/22
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("employees")}
                  className="flex-1"
                >
                  View All Employees
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectWinner(employees[0])}
                  disabled={!employees.length}
                  className="flex-1"
                >
                  Select Top Performer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttendanceTrend trends={trends} />
            <DepartmentPerformance departmentStats={departmentStats} />
          </div>

          <OvertimeAnalysis
            summary={summary}
            departmentStats={departmentStats}
          />
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <DepartmentPerformance departmentStats={departmentStats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttendanceTrend trends={trends} />
            <OvertimeAnalysis
              summary={summary}
              departmentStats={departmentStats}
            />
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          {/* Employee of the Month Candidates */}
          <TopPerformers employees={employees} />

          {/* Employee Performance Table */}
          <EmployeePerformanceTable
            employees={employees}
            onSelectEmployee={setSelectedEmployee}
          />

          {/* Selected Employee Detailed Report */}
          {selectedEmployee && (
            <EmployeeDetailedReport employee={selectedEmployee} />
          )}
        </TabsContent>
        <TabsContent value="analytics" className="space-y-6">
          <MonthlyInsights
            summary={summary}
            departmentStats={departmentStats}
            month={month}
            employees={employees}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DepartmentPerformance departmentStats={departmentStats} />
            <OvertimeAnalysis
              summary={summary}
              departmentStats={departmentStats}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Monthly Insights */}
      <MonthlyInsights
        summary={summary}
        departmentStats={departmentStats}
        month={month}
        employees={employees}
      />
    </div>
  );
};

export default AttendanceCharts;
