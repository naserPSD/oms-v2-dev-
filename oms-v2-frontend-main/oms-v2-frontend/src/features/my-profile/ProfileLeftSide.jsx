"use client";

import { FormController as Controller } from "@/components/common/FormController";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AvatarUpload from "@/components/ui/AvatarUpload";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useAuthStore } from "@/store/useAuthStore";
import { useCommonStore } from "@/store/useCommonStore";
import { getAuthUserInfo } from "@/utils/commonApiFunction";
import helpers, { toaster } from "@/utils/helpers";
import RestApi from "@/utils/RestApi";
import { formatTime } from "@/utils/formatTime";
import { zodResolver } from "@/utils/zodResolver";
import {
  Building,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  Phone,
  Users,
  Award,
  TrendingUp,
  Star,
  Briefcase,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDashboardQueryApi } from "@/hooks/queryApi/useDashboardQueryApi";
import { useMyProfileQueryApi } from "@/hooks/queryApi/useMyProfileQueryApi";
import AttendanceAndLeaveCard from "@/components/common/profile/AttendanceAndLeaveCard";
import ServiceAndExperience from "@/components/common/profile/ServiceAndExperience";

const ProfileLeftSide = ({ employeeData, isLoading }) => {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const isAdminProfile =
    user?.appUseCase === "Admin" || pathname?.startsWith("/admin/my-profile");
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const [isExpanded, setIsExpanded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isLoadingUpload, setIsLoadingUpload] = useState(false);
  const [copied, setCopied] = useState(false);

  const schema = z.object({
    profilePic: z.any().optional(),
  });

  const initialValues = {
    profilePic: user?.profile?.profilePicture?.fileUrl,
  };

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Add this effect:
  useEffect(() => {
    if (user?.profile?.profilePicture?.fileUrl) {
      reset({
        ...initialValues,
        profilePic: user?.profile?.profilePicture?.fileUrl,
      });
    } else {
      reset(initialValues);
    }
  }, [user?.profile?.profilePicture?.fileUrl, reset]);

  const submitFormToUploadProfile = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      // Append all values to formData
      // Object.keys(values).forEach((key) => {
      //   if (values[key] !== null && values[key] !== undefined) {
      //     formData.append(key, values[key]);
      //   }
      // });
      formData.append("profilePic", values.profilePic);
      const { data } = await RestApi.post(`/api/v1/users/update-profile-picture`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const savedProfile = data?.data;
      const fileUrl = savedProfile?.profilePicture?.fileUrl;
      const currentUser = useAuthStore.getState().user;
      if (currentUser && fileUrl) {
        const { accessToken, tokenType } = useAuthStore.getState();
        useAuthStore.getState().setAuth({
          accessToken,
          tokenType,
          callLoginApi: true,
          user: {
            ...currentUser,
            profile: {
              ...currentUser.profile,
              profilePictureId:
                savedProfile.profilePictureId || savedProfile.profilePicture?.id,
              profilePicture: {
                ...savedProfile.profilePicture,
                fileUrl,
              },
            },
          },
        });
        reset({ profilePic: fileUrl });
      }
      await getAuthUserInfo(setLoading);
      const refreshedUser = useAuthStore.getState().user;
      if (fileUrl && refreshedUser && !refreshedUser.profile?.profilePicture?.fileUrl) {
        const { accessToken, tokenType } = useAuthStore.getState();
        useAuthStore.getState().setAuth({
          accessToken,
          tokenType,
          callLoginApi: true,
          user: {
            ...refreshedUser,
            profile: {
              ...refreshedUser.profile,
              profilePicture: {
                ...(savedProfile?.profilePicture || {}),
                fileUrl,
              },
            },
          },
        });
      }
      if (fileUrl) reset({ profilePic: fileUrl });

      toaster("Profile picture updated successfully", "success");
    } catch (error) {
      console.error(error);
      const apiMessage = error?.response?.data?.message;
      if (typeof apiMessage === "string") {
        toaster(apiMessage, "error");
      } else {
        helpers.handleApiValidationError(error, setError, "Failed to upload profile picture", true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
  }, [copied]);

  // Get employee data with fallbacks
  const getEmployeeData = () => {
    if (!employeeData?.employeeSummary) return null;
    return employeeData.employeeSummary;
  };

  const employee = getEmployeeData();

  const {
    useAttendanceAndLeaveSummeryForAuthUserQuery,
    useTotalExperienceAndPromotionForAuthUserQuery,
    useMyTodayDashboardDataQuery,
    useStartBreakMutation,
    useEndBreakMutation,
    useFetchMySalaryGradeQuery,
  } = useMyProfileQueryApi({});

  const { data: attendanceAndLeaveSummeryResponseData, isLoading: isFetching } =
    useAttendanceAndLeaveSummeryForAuthUserQuery(!isAdminProfile);

  const { data: totalExperienceAndPromotionResponseData } =
    useTotalExperienceAndPromotionForAuthUserQuery(!isAdminProfile);

  const { data: myTodayDashboardDataResponseData } =
    useMyTodayDashboardDataQuery(!isAdminProfile);

  const { data: salaryGradeResponseData } = useFetchMySalaryGradeQuery(!isAdminProfile);

  const responseData = {
    totalExperienceAndPromotion: totalExperienceAndPromotionResponseData?.data,
    attendanceAndLeaveSummery: attendanceAndLeaveSummeryResponseData?.data,
    myToday: myTodayDashboardDataResponseData?.data,
    salaryGrade: salaryGradeResponseData?.data,
  };

  const attendancePct =
    responseData?.attendanceAndLeaveSummery?.attendancePercentage;

  const performanceRating = useMemo(() => {
    if (
      attendancePct == null ||
      isNaN(attendancePct) ||
      Number(attendancePct) <= 0
    ) {
      return { score: "—", grade: "—" };
    }
    const score = Number(((attendancePct / 100) * 5).toFixed(1));
    let grade = "C";
    if (score >= 4.5) grade = "A+";
    else if (score >= 4.0) grade = "A";
    else if (score >= 3.5) grade = "B+";
    else if (score >= 3.0) grade = "B";
    return { score, grade };
  }, [attendancePct]);

  const salaryStructure = responseData?.salaryGrade?.structure;
  const salaryGradeInfo = useMemo(() => {
    const grade =
      salaryStructure?.grade?.gradeName ||
      salaryStructure?.grade?.gradeCode ||
      employee?.currentGrade?.gradeName ||
      employee?.currentGrade?.gradeCode ||
      "—";

    const rawDate =
      salaryStructure?.effectiveFrom ||
      salaryStructure?.updatedAt ||
      salaryStructure?.createdAt ||
      employee?.joiningDate;

    let lastUpdate = "—";
    if (rawDate) {
      const date = new Date(rawDate);
      if (!isNaN(date.getTime())) {
        const now = new Date();
        const diffMonths =
          (now.getFullYear() - date.getFullYear()) * 12 +
          (now.getMonth() - date.getMonth());
        if (diffMonths >= 12) {
          const years = Math.floor(diffMonths / 12);
          lastUpdate = `${years}Y`;
        } else if (diffMonths >= 1) {
          lastUpdate = `${diffMonths}M`;
        } else {
          const diffDays = Math.floor(
            (now - date) / (1000 * 60 * 60 * 24),
          );
          lastUpdate = diffDays > 0 ? `${diffDays}D` : "Today";
        }
      }
    }

    return { grade, lastUpdate };
  }, [salaryStructure, employee]);

  const todayAttendance = responseData?.myToday?.todayAttendance || [];

  const startBreakMutation = () => {
    return useStartBreakMutation.mutateAsync(todayAttendance.id);
  };

  const endBreakMutation = () => {
    return useEndBreakMutation.mutateAsync(todayAttendance.id);
  };

  // console.log('responseData', responseData);

  // const calculateWorkDuration = () => {
  //   if (!responseData?.myToday?.todayAttendance?.checkIn) return "N/A";

  //   const checkIn = new Date(responseData.myToday.todayAttendance.checkIn);
  //   const now = new Date();
  //   const diffMs = now - checkIn;
  //   const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  //   const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  //   return `${diffHours}h ${diffMinutes}m`;
  // };

  // Loading Skeleton Component
  const SkeletonLoader = () => (
    <div className="space-y-4">
      {/* Profile Skeleton */}
      <Card className="mb-4 sm:mb-6 dark:bg-theme-dark bg-theme border-gray-200 dark:border-gray-700 ">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-300 dark:bg-gray-600 mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-3 animate-pulse"></div>

            <div className="w-full space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex justify-between">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-2">
        <SkeletonLoader />
      </div>
    );
  }
  
  const showUploadIcon = user?.profileCompleted === true ? false : true
  
  return (
    <div className="">
      <div className="">
        {/* Mobile Header - Collapsible */}
        <div className="lg:hidden flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold dark-title-color ">
            My Profile
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Content - Hidden on mobile when collapsed */}
        <div className={`${isExpanded ? "block" : "hidden"} lg:block `}>
          {/* Employee Profile Card */}
          <Card className="mb-4 sm:mb-6 card-gradient border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Picture with Upload Functionality */}
                <div className="mb-2">
                  <form onSubmit={handleSubmit(submitFormToUploadProfile)}>
                    <Controller
                      control={control}
                      name="profilePic"
                      render={({ field, fieldState }) => (
                        <AvatarUpload
                          id="profilePic"
                          value={field.value}
                          onChange={(file) => field.onChange(file)}
                          shape="square"
                          size={200}
                          label=""
                          error={fieldState.error?.message}
                          clearable={
                            watch("profilePic") !==
                            user?.profile?.profilePicture?.fileUrl
                          }
                          showUploadIcon={showUploadIcon}
                          uploadIconPosition="bottom-right"
                          className="mb-2"
                        />
                      )}
                    />

                    {watch("profilePic") &&
                      watch("profilePic") !==
                        user?.profile?.profilePicture?.fileUrl && (
                        <ButtonTw
                          type="submit"
                          size="sm"
                          variant="default"
                          className="w-full font-bold"
                          disabled={loading}
                          loading={loading}
                        >
                          Upload
                        </ButtonTw>
                      )}
                  </form>
                </div>

                {/* Name & Title */}
                <h2 className="text-xl sm:text-2xl font-bold dark-title-color">
                  {user?.fullName || "Employee Name"}
                </h2>
                {/* <p className="text-gray-600 dark:text-gray-300 text-sm  mb-3">
                  {user?.designation?.name || "Designation: N/A"}
                </p> */}

                {/* Contact Info */}
                {(user?.email || user?.profile?.phoneWithCallingCode) && (
                  <div className="flex flex-wrap justify-center gap-3 mb-4 text-xs">
                    {user?.email && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">
                          {user.email}
                        </span>
                        <SimpleTooltip text={"Click to copy"}>
                          <i
                            onClick={() => {
                              navigator.clipboard.writeText(user?.email);
                              setCopied(true);
                            }}
                            className="fa-regular fa-copy cursor-pointer text-md text-gray-700 dark:text-gray-300 hover:text-gray-500 hover:scale-[1.2] ml-1"
                          ></i>
                        </SimpleTooltip>
                        {copied && (
                          <span className="text-green-500 text-xs ml-1">
                            Copied!
                          </span>
                        )}
                      </div>
                    )}
                    {user?.profile?.phoneWithCallingCode && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Phone className="w-3 h-3" />
                        <span>{user.profile.phoneWithCallingCode}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Email Verification Status */}
                <div className="mb-4">
                  <span
                    className={`badge badge-rounded badge-outline-${
                      user?.emailVerifiedAt ? "success" : "danger"
                    }`}
                  >
                    Email {user?.emailVerifiedAt ? "Verified" : "Not Verified"}
                  </span>
                </div>

                {user?.profileCompleted && (
                  <div className="flex flex-col items-center mt-1 mb-4">
                    <SimpleTooltip text="Employee user cannot update his/her profile">
                      <div className="px-10 py-1 text-xs font-semibold rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
                        Profile Locked
                      </div>
                    </SimpleTooltip>
                  </div>
                )}

                {/* Employee Details */}
                <div className="w-full space-y-3 text-sm">
                  <div className="flex justify-between flex-wrap items-center">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Employee ID:
                    </span>
                    <span className="dark-title-color text-sm font-medium">
                      {employee?.employeeCode || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between flex-wrap items-center">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      Branch:
                    </span>
                    <span className="dark-title-color text-sm font-medium">
                      {employee?.branch || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between flex-wrap items-center">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      Department:
                    </span>
                    <span className="dark-title-color text-sm font-medium">
                      {employee?.department || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between flex-wrap items-center">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joining Date:
                    </span>
                    <span className="dark-title-color text-sm font-medium">
                      {helpers.dDate(employee?.joiningDate) || "N/A"}
                    </span>
                  </div>

                  {/* App Use Case */}
                  <div className="flex justify-between flex-wrap items-center">
                    <span className="text-gray-500 dark:text-gray-400">
                      App Use Case:
                    </span>
                    <span className="badge badge-rounded badge-outline-info text-xs">
                      {user?.appUseCase || "N/A"}
                    </span>
                  </div>

                  {/* Office Shift Timing */}
                  {employeeData?.officeShift && (
                    <div className="flex justify-between flex-wrap items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Shift:
                      </span>
                      <span className="dark-title-color font-medium text-xs">
                        {formatTime(employeeData?.officeShift?.startTime)} -{" "}
                        {formatTime(employeeData?.officeShift?.endTime)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Additional User Details */}
                <div className="w-full mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h3 className="text-sm font-semibold mb-2 dark-title-color">
                    Additional Info
                  </h3>

                  {/* Social Links */}
                  <div className="space-y-2 text-xs">
                    {user?.profile?.portfolioUrl && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">
                          Portfolio:
                        </span>
                        <a
                          href={user?.profile?.portfolioUrl}
                          target="_blank"
                          className="btn-link text-blue-600 dark:text-blue-400"
                        >
                          Visit
                          <i className="fa-solid fa-up-right-from-square ml-1"></i>
                        </a>
                      </div>
                    )}
                    {user?.profile?.githubUrl && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">
                          GitHub:
                        </span>
                        <a
                          href={user?.profile?.githubUrl}
                          target="_blank"
                          className="btn-link text-blue-600 dark:text-blue-400"
                        >
                          Visit
                          <i className="fa-solid fa-up-right-from-square ml-1"></i>
                        </a>
                      </div>
                    )}
                    {user?.profile?.linkedinUrl && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">
                          LinkedIn:
                        </span>
                        <a
                          href={user?.profile?.linkedinUrl}
                          target="_blank"
                          className="btn-link text-blue-600 dark:text-blue-400"
                        >
                          Visit
                          <i className="fa-solid fa-up-right-from-square ml-1"></i>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span
                      className={`badge badge-rounded badge-outline-${
                        user?.isPublic ? "success" : "danger"
                      } text-xs`}
                    >
                      <SimpleTooltip
                        text={
                          user?.isPublic
                            ? "Profile is Public"
                            : "Profile is Private"
                        }
                      >
                        {user?.isPublic ? "Public" : "Private"}
                      </SimpleTooltip>
                    </span>
                    <span
                      className={`badge badge-rounded badge-outline-${
                        user?.remoteOnly ? "success" : "danger"
                      } text-xs`}
                    >
                      <SimpleTooltip
                        text={`Willing to Work On Site: ${user?.remoteOnly ? "No" : "Yes"}`}
                      >
                        {user?.remoteOnly ? "Remote Only" : "On-site"}
                      </SimpleTooltip>
                    </span>
                    <span
                      className={`badge badge-rounded badge-outline-${
                        user?.willingToRelocate ? "success" : "danger"
                      } text-xs`}
                    >
                      <SimpleTooltip
                        text={`Willing To Relocate: ${user?.willingToRelocate ? "Relocatable" : "Not Relocatable"}`}
                      >
                        {user?.willingToRelocate
                          ? "Relocatable"
                          : "Not Relocatable"}
                      </SimpleTooltip>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isAdminProfile && (
          <div className="space-y-6">
            {/* Time In/Out */}
            <Card className="card-gradient border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold mb-3 dark-title-color  text-base sm:text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Time In/Out
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                      In Time:
                    </span>
                    <span
                      className={`font-semibold text-sm  ${
                        todayAttendance?.checkIn
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {todayAttendance?.checkIn
                        ? helpers.dTime(todayAttendance.checkIn)
                        : "Not Checked In"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                      Out Time:
                    </span>
                    {todayAttendance?.checkOut ? (
                      <span className="text-red-600 dark:text-red-400 font-semibold text-sm ">
                        {helpers.dTime(todayAttendance.checkOut)}
                      </span>
                    ) : (
                      <span className="text-gray-500  dark:text-gray-400 font-semibold text-sm ">
                        Not Checked Out
                      </span>
                    )}
                  </div>

                  {/* Work Duration */}
                  {todayAttendance?.checkIn && !todayAttendance?.checkOut && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                        Work Duration:
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm ">
                        {/* {calculateWorkDuration()} */}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Breaks Today */}
            <Card className="card-gradient border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold mb-3 dark-title-color text-base sm:text-lg">
                  Breaks Today
                </h3>

                <Button
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 mb-3"
                  onClick={async () => {
                    if (!todayAttendance.startBreak) {
                      await startBreakMutation();
                    } else if (
                      todayAttendance.startBreak &&
                      !todayAttendance.endBreak
                    ) {
                      await endBreakMutation();
                    } else if (
                      todayAttendance.startBreak &&
                      todayAttendance.endBreak
                    ) {
                      await startBreakMutation();
                    }
                  }}
                >
                  {!todayAttendance.startBreak
                    ? "Start Break"
                    : !todayAttendance.endBreak
                      ? "End Break"
                      : "Start Break"}
                </Button>

                {/* Breaks List */}
                {todayAttendance.startBreak ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        Last Break
                      </span>
                      <span className="dark-title-color text-sm">
                        {todayAttendance.startBreak
                          ? helpers.dTime(todayAttendance.startBreak)
                          : "N/A"}{" "}
                        -
                        {todayAttendance.endBreak
                          ? helpers.dTime(todayAttendance.endBreak)
                          : "Ongoing"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total Break Minutes:
                      </span>
                      <span className="dark-title-color text-sm">
                        {todayAttendance.breakMinutes}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                    No breaks taken today
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Attendance & Leave Card */}
            <AttendanceAndLeaveCard
              totalLeaveTaken={
                responseData?.attendanceAndLeaveSummery?.totalLeaveTaken
              }
              attendancePercentage={
                responseData?.attendanceAndLeaveSummery?.attendancePercentage
              }
            />

            {/* Serving & Experience Card */}
            <ServiceAndExperience
              totalExperience={(() => {
                const exp =
                  responseData?.totalExperienceAndPromotion?.totalExperience;
                if (!exp) return "—"; // fallback if no data

                const totalYears = exp.years + exp.months / 12;
                return Number(totalYears).toFixed(1);
              })()}
              totalPromotions={
                responseData?.totalExperienceAndPromotion?.promotions
              }
            />

            {/* Performance Card */}
            <Card className="card-gradient border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                      Performance
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current Rating
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {performanceRating.score}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Score
                    </p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {performanceRating.grade}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Grade
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Salary & Benefits Card */}
            <Card className="card-gradient border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                      Salary & Benefits
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Compensation Details
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 truncate px-1" title={salaryGradeInfo.grade}>
                      {salaryGradeInfo.grade}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Grade
                    </p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {salaryGradeInfo.lastUpdate}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Last Update
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileLeftSide;
