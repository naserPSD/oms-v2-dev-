import React from 'react'
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

const ServiceAndExperience = ({ totalExperience = 0, totalPromotions = 0}) => {
    return (
        <div>
            <Card className="card-gradient border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                                Serving & Experience
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Employment History
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {totalExperience}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Years
                            </p>
                        </div>
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {totalPromotions}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Promotions
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ServiceAndExperience
