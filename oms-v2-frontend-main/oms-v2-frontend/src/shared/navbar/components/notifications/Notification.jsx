// components/notification/NotificationItem.jsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useDashboardQueryApi } from "@/hooks/queryApi/useDashboardQueryApi";
import NotificationItem from "./NotificationItem";
import NotificationsModal from "../../modals/NotificationsModal";
import helpers from "@/utils/helpers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationSocket } from "@/hooks/common/useNotificationSocket";
import SimpleTooltip from "@/components/ui/SimpleTooltip";

const Notification = () => {

  const userId = useAuthStore((state) => state.user?.id);

  // ✅ start socket listener
  useNotificationSocket(userId);

  const [open, setOpen] = useState(false);

  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const { useAllNotificationsQuery, useMarkAllReadMutation } = useDashboardQueryApi({});
  const { data: notificationList = [] } = useAllNotificationsQuery();

  const unreadNotificationCount = notificationList && notificationList.length && notificationList.filter((notification) => !notification.isRead).length

  const groupNotifications = (notifications) => {
    const todayDate = helpers.dDate(new Date());

    return notifications.reduce(
      (groups, notification) => {
        const notifDate = helpers.dDate(notification.createdAt);

        if (!notification.isRead) {
          groups.new.push(notification);
        } else if (notifDate === todayDate) {
          groups.today.push(notification);
        } else {
          groups.old.push(notification);
        }

        return groups;
      },
      { new: [], today: [], old: [] }
    );
  };

  const getNotificationGroups = groupNotifications(notificationList || []);

  const markAllReadNotification = async () => {
    await useMarkAllReadMutation.mutateAsync();
  };

  const prevOpen = useRef(open);

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      // only runs when popover just closed

      if (getNotificationGroups.new.length > 0) {
        markAllReadNotification();
      }
    }
    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (notificationList) {
      // console.log("notificationList", notificationList);
    }
  }, [notificationList]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <SimpleTooltip
          disabled={open}
          text={
            unreadNotificationCount > 0
              ? `${unreadNotificationCount} unread notification${unreadNotificationCount > 1 ? "s" : ""}`
              : "Notifications"
          }
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-100 dark:hover:bg-gray-700/80 flex items-center justify-center transition-all duration-200 active:scale-95 relative cursor-pointer shadow-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              aria-label="Notifications"
            >
              <Bell
                size={18}
                className="transition-transform duration-200"
              />
              {getNotificationGroups.new.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                  {getNotificationGroups.new.length > 99
                    ? "99+"
                    : getNotificationGroups.new.length}
                </span>
              )}
            </button>
          </PopoverTrigger>
        </SimpleTooltip>
        <PopoverContent className="w-72 sm:w-96 dark:bg-gray-900">
          <div className="p-3 pb-5 flex justify-between">
            <h5 className="text-xl font-bold">Notification {unreadNotificationCount > 0 && `(${unreadNotificationCount})`}</h5>
            {/* <div>
              <button
                className="text-white   badge badge-primary badge-rounded cursor-pointer"
                onClick={() => {
                  setShowNotificationsModal(true);
                  setOpen(false);
                }}
              >
                View all
              </button>
            </div> */}
          </div>

          <div className="max-h-full overflow-y-auto">
            {/* 🔔 New */}
            {getNotificationGroups.new.length > 0 && (
              <>
                <h3 className="font-semibold text-blue-600">
                  New ({getNotificationGroups.new.length})
                </h3>
                {getNotificationGroups.new.map((notification, index) => (
                  <NotificationItem
                    key={`new-${index}`}
                    notification={notification}
                    iconColor={"text-blue-500"}
                  />
                ))}
              </>
            )}

            {/* 📅 Today */}
            {getNotificationGroups.today.length > 0 && (
              <>
                <h3 className="font-semibold text-green-600 mt-4">
                  Today ({getNotificationGroups.today.length})
                </h3>
                {getNotificationGroups.today.map((notification, index) => (
                  <NotificationItem
                    key={`today-${index}`}
                    notification={notification}
                  />
                ))}
              </>
            )}

            {/* 📜 Old */}
            {getNotificationGroups.old.length > 0 && (
              <>
                <h3 className="font-semibold text-gray-400 mt-4">
                  Old ({getNotificationGroups.old.length})
                </h3>
                {getNotificationGroups.old.map((notification, index) => (
                  <NotificationItem
                    key={`old-${index}`}
                    notification={notification}
                    iconColor={"text-gray-500"}
                    textColor={"text-gray-400"}
                  />
                ))}
              </>
            )}

            {getNotificationGroups.new.length < 1 && getNotificationGroups.today.length < 1 && getNotificationGroups.old.length < 1 && (
              <div className="text-center text-gray-500">
                You have no notifications
              </div>
            )}

            {/* <div className="flex items-start gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              <div className="rounded-full bg-gray-200 h-8 w-8 flex items-center justify-center">
                <FaCheck className="text-green-500" size={12} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">
                  Order 12345 ready to ship
                </p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>

            <div className="flex items-start gap-2 border-b border-gray-200 dark:border-gray-700 py-2">
              <div className="rounded-full bg-gray-200 h-8 w-8 flex items-center justify-center">
                <FaEyeSlash className="text-red-500" size={12} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Stock update failed</p>
                <p className="text-xs text-gray-500">3 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-2 border-b border-gray-200 dark:border-gray-700 py-2">
              <div className="rounded-full bg-gray-200 h-8 w-8 flex items-center justify-center">
                <FaPlus className="text-gray-700" size={12} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">New order received</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div> */}

            {/* <div className="flex items-center justify-end">
              <Button variant="link" className="text-primary  mt-1">
                Mark all as read
              </Button>
            </div> */}
          </div>
        </PopoverContent>
      </Popover>

      <NotificationsModal
        showModal={showNotificationsModal}
        handleClose={() => setShowNotificationsModal(false)}
      />
    </>
  );
}

export default Notification;
