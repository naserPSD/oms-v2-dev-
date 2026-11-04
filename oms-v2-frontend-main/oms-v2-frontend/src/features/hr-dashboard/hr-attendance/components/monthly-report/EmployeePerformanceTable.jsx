import Avatar from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import helpers from "@/utils/helpers";
// components/monthly-report/EmployeePerformanceTable.jsx
const EmployeePerformanceTable = ({ employees, onSelectEmployee }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Performance Ranking</CardTitle>
        <CardDescription>
          Top performers based on attendance and punctuality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Attendance %</TableHead>
              <TableHead>Present Days</TableHead>
              <TableHead>Late Arrivals</TableHead>
              <TableHead>Early Departures</TableHead>
              <TableHead>Overtime</TableHead>
              <TableHead>Performance Score</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp, index) => (
              <TableRow key={emp.employeeId}>
                <TableCell>
                  {index < 3 ? (
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      #{index + 1}
                    </Badge>
                  ) : (
                    `#${index + 1}`
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar
                      text={helpers.avatarText(emp.name)}
                      color="info"
                      size="md"
                      // className="bg-blue-200 text-blue-700 dark:bg-blue-600 dark:text-blue-100"
                    />

                    <div>
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-sm text-gray-500">
                        {emp.designation}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={emp.attendancePercentage}
                      className="w-16"
                    />
                    <span>{emp.attendancePercentage}%</span>
                  </div>
                </TableCell>
                <TableCell>{emp.presentDays}/22</TableCell>
                <TableCell>
                  <Badge
                    variant={emp.lateArrivals > 5 ? "destructive" : "outline"}
                  >
                    {emp.lateArrivals}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      emp.earlyDepartures > 3 ? "destructive" : "outline"
                    }
                  >
                    {emp.earlyDepartures}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={emp.overtimeHours > 15 ? "default" : "outline"}
                  >
                    {emp.overtimeHours}h
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      emp.attendancePercentage >= 95
                        ? "default"
                        : emp.attendancePercentage >= 85
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {emp.attendancePercentage >= 95
                      ? "Excellent"
                      : emp.attendancePercentage >= 85
                      ? "Good"
                      : "Needs Improvement"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => onSelectEmployee(emp)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EmployeePerformanceTable;
