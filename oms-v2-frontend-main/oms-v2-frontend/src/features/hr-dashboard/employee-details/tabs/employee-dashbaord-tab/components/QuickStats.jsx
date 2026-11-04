import { Card, CardContent } from "@/components/ui/card";

export function QuickStats() {
  const stats = [
    { label: "This Week Hours", value: "40.5h", trend: "+2.5h" },
    { label: "Productivity", value: "92%", trend: "+3%" },
    { label: "Meeting Hours", value: "8.2h", trend: "-1.3h" },
    { label: "Focus Time", value: "28h", trend: "+4h" },
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="px-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          📈 Quick Stats
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
              <div
                className={`text-xs mt-1 ${
                  stat.trend.startsWith("+")
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {stat.trend}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
