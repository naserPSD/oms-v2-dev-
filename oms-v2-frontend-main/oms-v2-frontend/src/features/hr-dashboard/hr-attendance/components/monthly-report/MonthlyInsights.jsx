// components/monthly-report/MonthlyInsights.jsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FaExclamationTriangle,
  FaStar,
  FaTrophy,
  FaUserClock,
} from "react-icons/fa";
import { FaChartBar } from "react-icons/fa6";

const MonthlyInsights = ({ summary, departmentStats, month, employees }) => {
  // Department calculations
  const bestDept = departmentStats.reduce((best, current) =>
    current.attendanceRate > best.attendanceRate ? current : best
  );

  const worstDept = departmentStats.reduce((worst, current) =>
    current.attendanceRate < worst.attendanceRate ? current : worst
  );

  const highOvertimeDept = departmentStats.reduce((high, current) =>
    current.averageOvertime > high.averageOvertime ? current : high
  );

  // Employee analytics calculations
  const totalEmployees = employees.length;
  const excellentPerformers = employees.filter(
    (emp) => emp.attendancePercentage >= 95
  ).length;
  const goodPerformers = employees.filter(
    (emp) => emp.attendancePercentage >= 85 && emp.attendancePercentage < 95
  ).length;
  const needsImprovement = employees.filter(
    (emp) => emp.attendancePercentage < 85
  ).length;

  const avgLatePerEmployee = (
    employees.reduce((sum, emp) => sum + emp.lateArrivals, 0) / totalEmployees
  ).toFixed(1);
  const avgOvertimePerEmployee = (
    employees.reduce((sum, emp) => sum + emp.overtimeHours, 0) / totalEmployees
  ).toFixed(1);

  // Find best performing employee
  const bestEmployee = employees.reduce((best, current) =>
    current.attendancePercentage > best.attendancePercentage ? current : best
  );

  // Department with most employees
  const largestDept = departmentStats.reduce((largest, current) =>
    current.totalEmployees > largest.totalEmployees ? current : largest
  );

  const insights = [
    {
      type: "excellent",
      icon: FaTrophy,
      title: "Top Performing Employee",
      description: `${bestEmployee.name} from ${bestEmployee.department}`,
      metric: `${bestEmployee.attendancePercentage}%`,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    {
      type: "success",
      icon: FaStar,
      title: "Best Department",
      description: `${bestDept.department} leads with ${bestDept.attendanceRate}% attendance`,
      metric: `${bestDept.attendanceRate}%`,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      type: "warning",
      icon: FaExclamationTriangle,
      title: "Needs Attention",
      description: `${worstDept.department} has lowest attendance`,
      metric: `${worstDept.attendanceRate}%`,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    {
      type: "info",
      icon: FaUserClock,
      title: "Employee Performance",
      description: `${excellentPerformers} excellent performers`,
      metric: `${Math.round((excellentPerformers / totalEmployees) * 100)}%`,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
  ];

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <FaChartBar className="w-4 h-4" />
          Monthly Insights & Analytics
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Comprehensive performance analysis for{" "}
          {month
            ? new Date(month + "-01").toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "this month"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${insight.bgColor} ${insight.borderColor} transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <insight.icon className={`w-4 h-4 ${insight.color}`} />
                    <h4 className="font-semibold text-sm dark:text-gray-200">
                      {insight.title}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {insight.description}
                  </p>
                  <div className={`text-lg font-bold ${insight.color}`}>
                    {insight.metric}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Advanced Employee Analytics */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h5 className="font-semibold text-sm mb-3 dark:text-gray-200">
            📈 Employee Performance Distribution
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="text-center">
              <div className="font-bold text-lg text-green-600 dark:text-green-400">
                {excellentPerformers}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Excellent (95%+)
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {goodPerformers}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Good (85-94%)
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-orange-600 dark:text-orange-400">
                {needsImprovement}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Needs Improvement
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-purple-600 dark:text-purple-400">
                {totalEmployees}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Total Employees
              </div>
            </div>
          </div>
        </div>

        {/* Department & Employee Metrics */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h5 className="font-semibold text-sm mb-2 dark:text-white">
              🏢 Department Overview
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Largest Department:</span>
                <span className="font-semibold">{largestDept.department}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Departments:</span>
                <span className="font-semibold">{departmentStats.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Department Avg Attendance:</span>
                <span className="font-semibold">
                  {summary?.averageAttendanceRate || 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h5 className="font-semibold text-sm mb-2 dark:text-white">
              👥 Employee Metrics
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Avg Late per Employee:</span>
                <span className="font-semibold">{avgLatePerEmployee}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Overtime per Employee:</span>
                <span className="font-semibold">{avgOvertimePerEmployee}h</span>
              </div>
              <div className="flex justify-between">
                <span>Total Present Days:</span>
                <span className="font-semibold">
                  {summary?.totalPresentDays || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Recommendations */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h5 className="font-semibold text-sm mb-2 dark:text-white">
            💡 Performance Recommendations
          </h5>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>
              • Focus on improving attendance in {worstDept.department}{" "}
              department
            </li>
            <li>• Recognize {bestEmployee.name} as top performer</li>
            <li>
              • Monitor overtime in {highOvertimeDept.department} (
              {highOvertimeDept.averageOvertime}h avg)
            </li>
            <li>
              • {needsImprovement} employees need performance improvement plans
            </li>
            <li>
              • Consider flexible hours to reduce {avgLatePerEmployee} avg late
              arrivals
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyInsights;
