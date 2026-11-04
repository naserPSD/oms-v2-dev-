// components/monthly-report/EmployeeDetailedReport.jsx
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export const EmployeeDetailedReport = ({ employee }) => {
  if (!employee) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Employee Detailed Report - {employee.name}</CardTitle>
        <CardDescription>
          Complete attendance and performance analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {employee.attendancePercentage}%
              </div>
              <div className="text-sm text-gray-500">Attendance Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {employee.presentDays}/22
              </div>
              <div className="text-sm text-gray-500">Present Days</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {employee.overtimeHours}h
              </div>
              <div className="text-sm text-gray-500">Overtime</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {employee.lateArrivals + employee.earlyDepartures}
              </div>
              <div className="text-sm text-gray-500">Punctuality Issues</div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Attendance Calendar View */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">📅 Daily Attendance Log</h4>
          <div className="grid grid-cols-7 gap-1 text-sm">
            {Array.from({ length: 22 }, (_, i) => (
              <div key={i} className="text-center p-2 border rounded">
                <div className="text-xs">Day {i + 1}</div>
                <div className="text-green-500">✓</div>
              </div>
            ))}
            {Array.from({ length: 2 }, (_, i) => (
              <div
                key={i + 22}
                className="text-center p-2 border rounded bg-red-50"
              >
                <div className="text-xs">Day {i + 23}</div>
                <div className="text-red-500">✗</div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">⏰ Punctuality Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Late Arrivals:</span>
                  <Badge
                    variant={
                      employee.lateArrivals > 5 ? "destructive" : "outline"
                    }
                  >
                    {employee.lateArrivals} times
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Early Departures:</span>
                  <Badge
                    variant={
                      employee.earlyDepartures > 3 ? "destructive" : "outline"
                    }
                  >
                    {employee.earlyDepartures} times
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>On-time Percentage:</span>
                  <span className="font-semibold">
                    {Math.round(
                      ((22 - employee.lateArrivals - employee.earlyDepartures) /
                        22) *
                        100
                    )}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">💪 Work Ethic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Overtime Hours:</span>
                  <Badge
                    variant={
                      employee.overtimeHours > 15 ? "default" : "outline"
                    }
                  >
                    {employee.overtimeHours}h
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Average Daily Hours:</span>
                  <span className="font-semibold">
                    {(
                      employee.totalWorkingHours / employee.presentDays
                    ).toFixed(1)}
                    h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Productivity Score:</span>
                  <span className="font-semibold text-green-600">
                    {employee.attendancePercentage >= 95 ? "Excellent" : "Good"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
