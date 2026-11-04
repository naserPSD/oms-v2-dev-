import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, Pencil } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import helpers from "@/utils/helpers";
import { useParams } from "next/navigation";
import ButtonTw from "@/components/ui/ButtonTw";
import { BiPlus } from "react-icons/bi";
import { useState } from "react";
import AddSupervisorModal from "./AddSupervisorModal";
import AddSubordinateModal from "./AddSubordinateModal";
import Link from "next/link";

export function Hierarchy({ isLoading, hierarchyData }) {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [selectedSubordinate, setSelectedSubordinate] = useState(null);
  const [showSubModal, setShowSubModal] = useState(false);

  const handleEdit = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setShowModal(true);
  };

  const handleSubordinateEdit = (supervisor) => {
    setSelectedSubordinate(supervisor);
    setShowSubModal(true);
  };

  // Transform API data
  const transformHierarchyData = (data) => {
    if (!data?.data) return { supervisors: [], subordinates: [] };

    const supervisors = data.data.supervisors || [];
    const subordinates = data.data.subordinates || [];

    return {
      supervisors: supervisors.map((item) => ({
        id: item.id,
        name: item.employee?.user?.fullName || "N/A",
        position: item.employee?.designation?.name || "No Designation",
        empId: item.empId,
        employee: item.employee,
        supervisorId: item.supervisorId,
        supervisor: item.supervisor || "N/A",
        endDate: item.endDate || "N/A",
        department:
          item.employee?.designation?.department?.name || "No Department",
        email: item.employee?.user?.email || "N/A",
        phone: item.employee?.user?.profile?.phone || "N/A",
        profileImage:
          item.employee?.user?.profile?.profilePicture?.fileUrl ||
          "/api/placeholder/64/64",
        startDate: item.startDate,
        status:
          item.endDate && new Date(item.endDate) >= new Date()
            ? "Active"
            : "Inactive",
      })),
      subordinates: subordinates.map((item) => ({
        id: item.id,
        name: item.employee?.user?.fullName || "N/A",
        position: item.employee?.designation?.name || "No Designation",
        empId: item.empId,
        employee: item.employee,
        supervisorId: item.supervisorId,
        supervisor: item.supervisor || "N/A",
        endDate: item.endDate || "N/A",
        startDate: item.startDate,
        department:
          item.employee?.designation?.department?.name || "No Department",
        email: item.employee?.user?.email || "N/A",
        phone: item.employee?.user?.profile?.phone || "N/A",
        profileImage:
          item.employee?.user?.profile?.profilePicture?.fileUrl ||
          "/api/placeholder/64/64",
        status:
          item.endDate && new Date(item.endDate) >= new Date()
            ? "Active"
            : "Inactive",
      })),
    };
  };

  const { supervisors, subordinates } = transformHierarchyData(hierarchyData);

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

  // Empty state
  // if (
  //   !hierarchyData?.data ||
  //   (supervisors.length === 0 && subordinates.length === 0)
  // ) {
  //   return (
  //     <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full">
  //       <CardContent className="p-6 text-center">
  //         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
  //           Organization Hierarchy
  //         </h3>
  //         <p className="text-gray-500 dark:text-gray-400">
  //           No hierarchy data available
  //         </p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

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
                  Supervisors/Manager ({supervisors.length})
                </TabsTrigger>
                <TabsTrigger
                  value="subordinates"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 text-xs sm:text-sm"
                >
                  Subordinates ({subordinates.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex justify-end">
              <TabsContent value="supervisors">
                {" "}
                <ButtonTw
                  onClick={() => setShowModal(true)}
                  variant="blue"
                  className="gap-2"
                >
                  <BiPlus /> Add Supervisor/Manager
                </ButtonTw>
              </TabsContent>

              <TabsContent value="subordinates">
                {" "}
                <ButtonTw
                  onClick={() => setShowSubModal(true)}
                  variant="blue"
                  className="gap-2"
                >
                  <BiPlus /> Add Subordinates
                </ButtonTw>
              </TabsContent>
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
                        {supervisor.employeeId} • {supervisor.department}
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
                    <div>
                      <button
                        onClick={() => handleEdit(supervisor)}
                        className="btn-action text-blue-500 hover:text-blue-700"
                      >
                        <Pencil size={16} />
                      </button>
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
                          {subordinate.employeeId} • {subordinate.department}
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
                      <div>
                        <button
                          onClick={() => handleSubordinateEdit(subordinate)}
                          className="btn-action text-blue-500 hover:text-blue-700"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </Link>
                  </div>

                  // <div className="flex items-center justify-between xs:justify-end gap-2">
                  //     <span
                  //       className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(
                  //         subordinate.status,
                  //       )}`}
                  //     >
                  //       {subordinate.status}
                  //     </span>
                  //     <Button
                  //       size="sm"
                  //       variant="ghost"
                  //       className="flex-shrink-0"
                  //     >
                  //       <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                  //     </Button>
                  //   </div>
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

      {/* ........SupperVisor End......... */}
      <AddSupervisorModal
        id={id}
        setShowModal={setShowModal}
        showModal={showModal}
        selectedSupervisor={selectedSupervisor}
      />

      <AddSubordinateModal
        id={id}
        setShowModal={setShowSubModal}
        showModal={showSubModal}
        selectedSubordinate={selectedSubordinate}
      />
    </Card>
  );
}
