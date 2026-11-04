import Avatar from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import helpers from "@/utils/helpers";
import { Calendar, Mail, Phone } from "lucide-react";
import Link from "next/link";

const AdminHierarchy = ({ isLoading, hierarchyData }) => {
  // // Transform API data
  const transformHierarchyData = (data) => {
    if (!data) return { supervisors: [], subordinates: [] };

    const supervisors = data?.supervisors || [];
    const subordinates = data?.subordinates || [];

    const formatName = (user) => {
      if (!user) return "N/A";
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      return fullName || user.fullName || "N/A";
    };

    return {
      supervisors: supervisors.map((item) => {
        const sup = item.supervisor || {};
        const supUser = sup.user || {};
        return {
          id: item.id,
          name: formatName(supUser),
          position: sup.designation?.name || "No Designation",
          empId: sup.id || item.supervisorId,
          employeeId: sup.employeeId,
          employee: sup,
          supervisorId: item.supervisorId,
          supervisor: item.supervisor || "N/A",
          endDate: item.endDate || "N/A",
          department:
            sup.designation?.department?.name || "No Department",
          email: supUser.email || "N/A",
          phone: supUser.profile?.phone || "N/A",
          profileImage:
            supUser.profile?.profilePicture?.fileUrl,
          startDate: item.startDate,
          status:
            item.endDate && new Date(item.endDate) >= new Date()
              ? "Active"
              : "Inactive",
        };
      }),
      subordinates: subordinates.map((item) => {
        const sub = item.employee || {};
        const subUser = sub.user || {};
        return {
          id: item.id,
          name: formatName(subUser),
          position: sub.designation?.name || "No Designation",
          empId: sub.id || item.empId,
          employeeId: sub.employeeId,
          employee: sub,
          supervisorId: item.supervisorId,
          supervisor: item.supervisor || "N/A",
          endDate: item.endDate || "N/A",
          startDate: item.startDate,
          department:
            sub.designation?.department?.name || "No Department",
          email: subUser.email || "N/A",
          phone: subUser.profile?.phone || "N/A",
          profileImage:
            subUser.profile?.profilePicture?.fileUrl,
          status:
            item.endDate && new Date(item.endDate) >= new Date()
              ? "Active"
              : "Inactive",
        };
      }),
    };
  };

  const { supervisors, subordinates } = transformHierarchyData(
    hierarchyData?.data,
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Loading Skeleton
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full">
        <CardContent className="p-4">
          {/* Tabs Skeleton */}
          <div className="flex gap-2 mb-4 animate-pulse">
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            {/* Supervisor Card Skeleton */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>

            {/* Buttons Skeleton */}
            <div className="flex gap-2 animate-pulse">
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
            </div>
          </div>

          {/* Subordinates List Skeleton */}
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  //Empty state
  if (
    !hierarchyData?.data ||
    (supervisors.length === 0 && subordinates.length === 0)
  ) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Organization Hierarchy
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm ">
            No hierarchy data available
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full">
      <div className="pl-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Employee Hierarchy
        </h2>
      </div>
      <CardContent className="p-4">
        <Tabs defaultValue="supervisors">
          {/* Tabs List - Only 2 tabs */}
          <div className="overflow-x-auto rounded-lg mb-4 flex items-center justify-between">
            <div>
              {" "}
              <TabsList className="inline-flex items-center gap-x-2 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger
                  value="supervisors"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 text-xs sm:text-sm"
                >
                  Supervisors ({supervisors.length})
                </TabsTrigger>
                <TabsTrigger
                  value="subordinates"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 text-xs sm:text-sm"
                >
                  Subordinates ({subordinates.length})
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Supervisors Tab */}
          <TabsContent value="supervisors" className="space-y-4">
            {supervisors.length > 0 ? (
              supervisors.map((supervisor, index) => (
                <div key={supervisor.id || index} className="space-y-3">
                  <Link
                    href={`/hr-dashboard/employee/${supervisor.empId}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    {" "}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0">
                      {supervisor.profileImage ? (
                        <img
                          src={supervisor.profileImage}
                          alt={supervisor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Avatar
                          text={helpers.avatarText(supervisor.name)}
                          color="info"
                          size="md"
                          // className="bg-blue-200 text-blue-700 dark:bg-blue-600 dark:text-blue-100"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        {supervisor.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        {supervisor.position}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {[supervisor.employeeId, supervisor.department].filter(Boolean).join(" • ")}
                      </p>

                      <div className="flex flex-col  mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{supervisor.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{supervisor.phone}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>Start Date : {supervisor.startDate}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>End Date : {supervisor.endDate}</span>
                      </div>
                      <div className="flex items-center justify-between xs:justify-end gap-2">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(
                            supervisor.status,
                          )}`}
                        >
                          {supervisor.status}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-shrink-0"
                        ></Button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No supervisors found
              </div>
            )}
          </TabsContent>

          {/* Subordinates Tab */}
          <TabsContent value="subordinates" className="mt-4">
            <div className="space-y-2 sm:space-y-3">
              {subordinates.length > 0 ? (
                subordinates.map((subordinate, index) => (
                  <div key={subordinate.id || index} className="space-y-3">
                    <Link
                      href={`/hr-dashboard/employee/${subordinate.empId}`}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0">
                        {subordinate.profileImage ? (
                          <img
                            src={subordinate.profileImage}
                            alt={subordinate.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Avatar
                            text={helpers.avatarText(subordinate.name)}
                            color="info"
                            size="md"
                            // className="bg-blue-200 text-blue-700 dark:bg-blue-600 dark:text-blue-100"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          {subordinate.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          {subordinate.position}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {[subordinate.employeeId, subordinate.department].filter(Boolean).join(" • ")}
                        </p>

                        <div className="flex flex-col  mt-2 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {subordinate.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span>{subordinate.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>Start Date : {subordinate.startDate}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>End Date : {subordinate.endDate}</span>
                        </div>
                        <div className="flex items-center justify-between xs:justify-end gap-2">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(
                              subordinate.status,
                            )}`}
                          >
                            {subordinate.status}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-shrink-0"
                          ></Button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No subordinates found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Organization Summary */}
        {/* <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs sm:text-sm">
            <div className="flex justify-between xs:flex-col xs:gap-1">
              <span className="text-gray-600 dark:text-gray-400">
                Supervisors:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {supervisors.length} people
              </span>
            </div>
            <div className="flex justify-between xs:flex-col xs:gap-1">
              <span className="text-gray-600 dark:text-gray-400">
                Subordinates:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {subordinates.length} people
              </span>
            </div>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default AdminHierarchy;
