"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Phone, Mail, Users, FileText, Tag, Clock, CheckSquare } from "lucide-react";
import helpers from "@/utils/helpers";

const LeadActivityLog = ({ activities = [], userMap = null, isLoading = false }) => {
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only rendering dates on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get activity icon based on type
  const getActivityIcon = (activityType) => {
    const type = activityType?.toLowerCase() || '';
    if (type === 'call' || type.includes('call')) return <Phone className="w-4 h-4" />;
    if (type === 'email' || type.includes('email') || type.includes('mail')) return <Mail className="w-4 h-4" />;
    if (type === 'appointment' || type === 'meeting' || type.includes('meeting') || type.includes('appointment')) return <Users className="w-4 h-4" />;
    if (type === 'task' || type.includes('task')) return <CheckSquare className="w-4 h-4" />;
    if (type.includes('note')) return <FileText className="w-4 h-4" />;
    if (type.includes('status') || type.includes('change')) return <Tag className="w-4 h-4" />;
    if (type.includes('communication')) return <Phone className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  // Get activity color based on type
  const getActivityColor = (activityType) => {
    const type = activityType?.toLowerCase() || '';
    if (type.includes('call')) return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    if (type.includes('email') || type.includes('mail')) return 'text-green-500 bg-green-50 dark:bg-green-900/20';
    if (type.includes('meeting') || type.includes('appointment')) return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
    if (type.includes('task')) return 'text-green-500 bg-green-50 dark:bg-green-900/20';
    if (type.includes('note')) return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    if (type.includes('status') || type.includes('change')) return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
    if (type.includes('communication')) return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
  };

  // Sort activities by date (newest first)
  // Filter out communication-related activities (they are shown in Communication section, not Activity Log)
  const sortedActivities = [...activities]
    .filter(activity => {
      if (!activity || activity.isActive === false) return false;

      // Filter out communication-related activity logs
      const activityType = String(activity.activityType || '').toLowerCase();
      if (activityType === 'communication added' ||
        activityType === 'communication updated' ||
        activityType.includes('communication added') ||
        activityType.includes('communication updated')) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.activityDate || a.createdAt || 0);
      const dateB = new Date(b.activityDate || b.createdAt || 0);
      return dateB - dateA; // Newest first
    });

  // Get user name from userMap
  const getUserName = (userId) => {
    if (!userId) return null;
    if (!userMap) return null;

    // Normalize userId - ensure it's a clean string/number
    const userIdStr = String(userId).trim();
    const userIdNum = Number(userId);
    const isValidNum = !isNaN(userIdNum) && isFinite(userIdNum);
    let userInfo = null;

    // If userMap is a Map
    if (userMap instanceof Map) {
      // Try all possible key variations - be very thorough
      userInfo = userMap.get(userIdStr) ||
        (isValidNum ? userMap.get(userIdNum) : null) ||
        userMap.get(String(userIdStr)) ||
        userMap.get(String(userIdNum));

      // Also try searching through all entries if direct lookup fails
      if (!userInfo) {
        for (const [key, value] of userMap.entries()) {
          const keyStr = String(key);
          const keyNum = Number(key);
          // Match if strings match or numbers match (very permissive matching)
          if (keyStr === userIdStr ||
            keyStr === String(userIdNum) ||
            String(keyNum) === userIdStr ||
            (isValidNum && !isNaN(keyNum) && keyNum === userIdNum) ||
            (isValidNum && keyStr === String(userIdNum)) ||
            (isValidNum && String(keyNum) === userIdStr)) {
            userInfo = value;
            break;
          }
        }
      }
    } else if (typeof userMap === 'object' && userMap !== null) {
      // If userMap is a plain object, try all variations
      userInfo = userMap[userIdStr] ||
        (isValidNum ? userMap[userIdNum] : null) ||
        userMap[String(userIdStr)] ||
        userMap[String(userIdNum)];

      // Also try searching through all keys if direct lookup fails
      if (!userInfo) {
        const keys = Object.keys(userMap);
        for (const key of keys) {
          const keyStr = String(key);
          const keyNum = Number(key);
          // Match if strings match or numbers match (very permissive matching)
          if (keyStr === userIdStr ||
            keyStr === String(userIdNum) ||
            String(keyNum) === userIdStr ||
            (isValidNum && !isNaN(keyNum) && keyNum === userIdNum) ||
            (isValidNum && keyStr === String(userIdNum)) ||
            (isValidNum && String(keyNum) === userIdStr)) {
            userInfo = userMap[key];
            break;
          }
        }
      }
    }

    return userInfo?.name || null;
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="text-lg font-semibold dark-title-color">Activity Log</h3>
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Loading activities...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg font-semibold dark-title-color">Activity Log</h3>
        </div>

        {/* Activities List */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {!sortedActivities || sortedActivities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No activities recorded yet.</p>
          ) : (
            sortedActivities.map((activity, index) => {
              const activityType = activity?.activityType || 'Activity';
              const title = activity?.title || activityType;
              const description = activity?.description || '';
              const activityDate = activity?.activityDate || activity?.createdAt;
              const userId = activity?.userId;
              // Try to get user name - pass the raw userMap (might be Map or object)
              const userName = getUserName(userId);
              const metadata = activity?.metadata || {};

              // Format communication activities to show type and action
              let displayText = description;
              if (activityType === 'Communication Added' || activityType === 'Communication Updated') {
                const communicationType = metadata?.communicationType || 'Communication';
                const action = activityType === 'Communication Added' ? 'added' : 'updated';
                // Extract the description part after the type
                const descMatch = description.match(/: (.+)$/);
                const descPart = descMatch ? descMatch[1] : description;
                displayText = `${communicationType} communication ${action}: ${descPart}`;
              }

              // Debug: Log user lookup for troubleshooting (only for first activity and if name not found)
              if (typeof window !== 'undefined' && index === 0 && !userName && userId) {
                const sampleKeys = userMap instanceof Map ?
                  Array.from(userMap.keys()).slice(0, 10).map(k => ({ key: String(k), type: typeof k })) :
                  (userMap ? Object.keys(userMap).slice(0, 10).map(k => ({ key: k, type: typeof k })) : []);
                const sampleValues = userMap instanceof Map ?
                  Array.from(userMap.values()).slice(0, 3) :
                  (userMap ? Object.values(userMap).slice(0, 3) : []);

                // Try all lookup variations
                const lookupAttempts = userMap instanceof Map ? {
                  userIdStr: userMap.get(String(userId)),
                  userIdNum: userMap.get(Number(userId)),
                  userIdStrTrimmed: userMap.get(String(userId).trim()),
                } : {
                  userIdStr: userMap[String(userId)],
                  userIdNum: userMap[Number(userId)],
                  userIdStrTrimmed: userMap[String(userId).trim()],
                };
              }

              return (
                <div
                  key={`activity-${index}-${activity?._id || activity?.id || activityDate || index}`}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Activity Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(metadata?.communicationType || activityType)}`}>
                      {getActivityIcon(metadata?.communicationType || activityType)}
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {displayText && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {displayText}
                            </p>
                          )}

                          {/* Metadata */}
                          {Object.keys(metadata).length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1 mb-2">
                              {metadata.subject && (
                                <p><span className="font-medium">Subject:</span> {metadata.subject}</p>
                              )}
                              {metadata.duration && (
                                <p><span className="font-medium">Duration:</span> {metadata.duration}</p>
                              )}
                              {metadata.location && (
                                <p><span className="font-medium">Location:</span> {metadata.location}</p>
                              )}
                            </div>
                          )}

                          {/* Date and User */}
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {activityDate && isMounted && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{helpers.dDateTime(activityDate)}</span>
                              </div>
                            )}
                            {userName ? (
                              <div className="flex items-center gap-1">
                                <span>•</span>
                                <span>by {userName}</span>
                              </div>
                            ) : (
                              userId && (
                                <div className="flex items-center gap-1">
                                  <span>•</span>
                                  <span>by User ID: {userId}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadActivityLog;

