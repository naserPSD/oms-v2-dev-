// hooks/useNotificationSocket.js
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

let socket;
let attendanceSocket; // Optional: separate socket for attendance

export const useNotificationSocket = (userId) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!userId) return;

        if (!socket) {
            socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
                path: "/socket.io",
                transports: ["websocket", "polling"], // fallback
                withCredentials: true,
            });
        }

        socket.emit("register", { userId });

        socket.on("notification", (newNotification) => {
            // console.log("📩 new notification:", newNotification);
            // update react-query cache instantly
            queryClient.setQueryData(["notificationList"], (old) => {
                if (!old) return [newNotification];
                return [newNotification, ...old];
            });
        });

        // Listen for attendance updates
        socket.on("attendanceUpdate", (updateData) => {
            console.log("📊 Received attendance update:", updateData);

            if (updateData.type === 'dashboardStats') {
                // Update dashboard stats cache
                queryClient.setQueryData(["dashboardAttendanceStats"], (old) => {
                    if (!old) return updateData.data;
                    return {
                        ...old,
                        ...updateData.data
                    };
                });
            }

            // Also invalidate to refetch fresh data
            queryClient.invalidateQueries({ queryKey: ["dashboardAttendanceStats"] });
            queryClient.invalidateQueries({ queryKey: ["myAttendance"] });
        });

        return () => {
            socket.off("notification");
            socket.off("attendanceUpdate");
        };
    }, [userId, queryClient]);
};
