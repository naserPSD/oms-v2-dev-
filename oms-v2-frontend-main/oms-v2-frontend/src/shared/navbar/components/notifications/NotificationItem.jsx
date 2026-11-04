// components/notification/NotificationItem.tsx
import { FaCheck } from "react-icons/fa";
import helpers from "@/utils/helpers";

export default function NotificationItem({ notification, iconColor = "text-green-500", textColor = "" }) {
    console.log('textColor', textColor)
    return (
        <div className="flex items-start gap-2 border-b border-gray-200 dark:border-gray-700 py-2">
            <div className="rounded-full bg-gray-200 h-8 w-8 flex items-center justify-center">
                <FaCheck className={iconColor} size={12} />
            </div>
            <div className="flex-1">
                {/* <p className={`text-sm font-bold ${textColor}`}>{notification.message}</p> */}
                <div className={`text-sm font-bold ${textColor}`} dangerouslySetInnerHTML={{ __html: notification.message }}></div>
                <p className="text-xs text-gray-500">
                    {helpers.timeAgo(notification.createdAt)}
                </p>
            </div>
        </div>
    );
}
