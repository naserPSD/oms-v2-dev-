import { Card, CardContent } from "@/components/ui/card";
import { useMyProfileQueryApi } from "@/hooks/queryApi/useMyProfileQueryApi";

export function RecentActivities() {
  const activities = [
    { action: "Checked in", time: "Today, 9:00 AM", icon: "✅" },
    { action: "Leave application submitted", time: "Yesterday", icon: "📝" },
    { action: "Project task completed", time: "Oct 25", icon: "✅" },
    { action: "Performance review completed", time: "Oct 24", icon: "⭐" },
  ];

  const { useFetchRecentActivitiesQuery } = useMyProfileQueryApi({});

  const { data: responseData } = useFetchRecentActivitiesQuery()

  const listData = responseData?.data || []
  console.log('listData===', listData)

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="px-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          📋 Recent Activities
        </h2>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-2">
              <div className="text-xl">{activity.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.action}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
