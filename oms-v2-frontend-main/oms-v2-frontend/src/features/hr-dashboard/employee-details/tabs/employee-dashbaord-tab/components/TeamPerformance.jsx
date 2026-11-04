import { Card, CardContent } from "@/components/ui/card";

export function TeamPerformance() {
  const teamMembers = [
    { name: "You", completion: 95, tasks: 42 },
    { name: "John Doe", completion: 88, tasks: 38 },
    { name: "Jane Smith", completion: 92, tasks: 45 },
    { name: "Mike Johnson", completion: 85, tasks: 36 },
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="px-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          👥 Team Performance
        </h2>
        <div className="space-y-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900 dark:text-white">
                  {member.name}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {member.completion}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    member.completion >= 90
                      ? "bg-green-600"
                      : member.completion >= 80
                      ? "bg-blue-600"
                      : "bg-yellow-600"
                  }`}
                  style={{ width: `${member.completion}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {member.tasks} tasks completed
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
