import React from 'react'
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const AttendanceAndLeaveCard = ({ attendancePercentage = 0, totalLeaveTaken = 0}) => {
    return (
        <div>
            <Card className="card-gradient border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center justify-center">
                            <Star className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                                Attendance & Leave
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Current Status
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {attendancePercentage} %
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                On Time
                            </p>
                        </div>
                        <div className="text-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                                {totalLeaveTaken}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Leave Days
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AttendanceAndLeaveCard
