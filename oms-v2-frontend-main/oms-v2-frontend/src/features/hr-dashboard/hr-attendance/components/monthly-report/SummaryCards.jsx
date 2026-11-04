// components/monthly-report/SummaryCards.jsx
import {
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaClock,
  FaUserTimes,
  FaRunning,
} from "react-icons/fa";

const StatCard = ({ title, value, trend, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "text-blue-600 border-blue-200 dark:text-blue-300 dark:border-blue-900",
    green:
      "text-green-600 border-green-200 dark:text-green-300 dark:border-green-900",
    orange:
      "text-orange-600 border-orange-200 dark:text-orange-300 dark:border-orange-900",
    purple:
      "text-purple-600 border-purple-200 dark:text-purple-300 dark:border-purple-900",
    red: "text-red-600 border-red-200 dark:text-red-300 dark:border-red-900",
    yellow:
      "text-yellow-600 border-yellow-200 dark:text-yellow-300 dark:border-yellow-900",
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 card-gradient ${colorClasses[color]} transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm dark-title-color font-medium opacity-80">
            {title}
          </h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-1 ${
                trend.startsWith("+") ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend} from last month
            </p>
          )}
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  );
};

const SummaryCards = ({ summary }) => {
  const cards = [
    {
      title: "Total Employees",
      value: summary.totalEmployees || 0,
      trend: "+2%",
      icon: <FaUsers />,
      color: "blue",
    },
    {
      title: "Avg. Attendance Rate",
      value: `${summary.averageAttendanceRate || 0}%`,
      trend: "+1.5%",
      icon: <FaChartLine />,
      color: "green",
    },
    {
      title: "Working Days",
      value: summary.totalWorkingDays || 0,
      trend: "0%",
      icon: <FaCalendarAlt />,
      color: "purple",
    },
    {
      title: "Total Overtime",
      value: `${summary.totalOvertimeHours || 0}h`,
      trend: "-3%",
      icon: <FaClock />,
      color: "orange",
    },
    {
      title: "Late Arrivals",
      value: summary.totalLateArrivals || 0,
      trend: "+5%",
      icon: <FaUserTimes />,
      color: "red",
    },
    {
      title: "Early Departures",
      value: summary.totalEarlyDepartures || 0,
      trend: "-2%",
      icon: <FaRunning />,
      color: "yellow",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
};

export default SummaryCards;
