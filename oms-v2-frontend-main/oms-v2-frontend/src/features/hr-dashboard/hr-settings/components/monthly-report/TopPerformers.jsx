import Avatar from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import helpers from "@/utils/helpers";
import { Award, Crown, Medal } from "lucide-react";
// components/monthly-report/TopPerformers.jsx
export const calculatePerformanceScore = (employee) => {
  const {
    attendancePercentage,
    presentDays,
    lateArrivals,
    earlyDepartures,
    overtimeHours,
  } = employee;

  // Score components (weights)
  const attendanceScore = attendancePercentage * 0.4; // 40% weight
  const punctualityScore =
    Math.max(0, 100 - (lateArrivals + earlyDepartures) * 5) * 0.3; // 30% weight
  const overtimeScore = Math.min(overtimeHours * 2, 30) * 0.2; // 20% weight (max 30 points)
  const consistencyScore = (presentDays / 22) * 100 * 0.1; // 10% weight

  return Math.round(
    attendanceScore + punctualityScore + overtimeScore + consistencyScore
  );
};

// Sort employees by performance score
const getTopPerformers = (employees) => {
  return employees
    .map((emp) => ({
      ...emp,
      performanceScore: calculatePerformanceScore(emp),
    }))
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 3);
};

export const TopPerformers = ({ employees, onSelectWinner }) => {
  const top3 = getTopPerformers(employees);

  const handleSelectWinner = (employee) => {
    // API call to mark as employee of the month
    onSelectWinner(employee);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🏆 Employee of the Month Candidates</CardTitle>
        <CardDescription>
          Top performers based on real performance scoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((emp, index) => (
            <Card
              key={emp.employeeId}
              className={
                index === 0
                  ? "border-yellow-400 border-2 bg-yellow-50 dark:bg-yellow-900/20"
                  : index === 1
                  ? "border-gray-400 border-2 bg-gray-50 dark:bg-gray-900/20"
                  : "border-orange-400 border-2 bg-orange-50 dark:bg-orange-900/20"
              }
            >
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  {index === 0 ? (
                    <Crown className="w-8 h-8 text-yellow-500" />
                  ) : index === 1 ? (
                    <Medal className="w-6 h-6 text-gray-500" />
                  ) : (
                    <Award className="w-6 h-6 text-orange-500" />
                  )}
                </div>

                <div className="flex items-center justify-center mb-2">
                  <Avatar
                    text={helpers.avatarText(emp.name)}
                    color="info"
                    size="md"
                  />
                </div>

                <h4 className="font-bold text-lg">{emp.name}</h4>
                <p className="text-sm text-gray-500">{emp.designation}</p>
                <p className="text-sm">{emp.department}</p>

                {/* Performance Score */}
                <div className="mt-2 mb-3">
                  <div className="text-xs text-gray-500">Performance Score</div>
                  <div className="text-xl font-bold text-blue-600">
                    {emp.performanceScore}/100
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Attendance:</span>
                    <span className="font-semibold">
                      {emp.attendancePercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Present Days:</span>
                    <span>{emp.presentDays}/22</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime:</span>
                    <span>{emp.overtimeHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Punctuality:</span>
                    <span
                      className={
                        emp.lateArrivals + emp.earlyDepartures > 5
                          ? "text-red-500"
                          : "text-green-500"
                      }
                    >
                      {emp.lateArrivals + emp.earlyDepartures} issues
                    </span>
                  </div>
                </div>

                {index === 0 && (
                  <Button
                    className="w-full mt-3 bg-yellow-500 hover:bg-yellow-600"
                    onClick={() => handleSelectWinner(emp)}
                  >
                    👑 Select as Employee of the Month
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Criteria Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h5 className="font-semibold text-sm mb-2">
            📊 Performance Criteria
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="font-medium">Attendance:</span> 40%
            </div>
            <div>
              <span className="font-medium">Punctuality:</span> 30%
            </div>
            <div>
              <span className="font-medium">Overtime:</span> 20%
            </div>
            <div>
              <span className="font-medium">Consistency:</span> 10%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
