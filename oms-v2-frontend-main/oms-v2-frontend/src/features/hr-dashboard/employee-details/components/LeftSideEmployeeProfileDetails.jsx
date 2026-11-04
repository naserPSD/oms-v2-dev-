"use client";

import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import AttendanceAndLeaveCard from "@/components/common/profile/AttendanceAndLeaveCard";
import ServiceAndExperience from "@/components/common/profile/ServiceAndExperience";
import Avatar from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import ButtonTw from "@/components/ui/ButtonTw";
import { Card, CardContent } from "@/components/ui/card";
import SelectSearch from "@/components/ui/SelectSearch";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useEmployeeProfileQueryApi } from "@/hooks/queryApi/useEmployeeProfileQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { formatTime } from "@/utils/formatTime";
import helpers from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  Building,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  Pencil,
  Phone,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import UpdateEmployeeProfilePicture from "./UpdateEmployeeProfilePicture";
import SwitchButton from "@/components/ui/SwitchButton";


const schema = z
  .object({
    id: z.coerce.number().optional(),
    officeId: z.coerce.number().min(1, "Office is required"),
    officeShiftId: z.union([z.coerce.number(), z.null()]).optional(),
  })
  .superRefine((data, ctx) => {
    const officeList = ctx.options?.context?.officeList || [];
    const selectedOffice = officeList.find((o) => o.value === data.officeId);
    const hasShift = selectedOffice?.officeShifts?.length > 0;

    // Require shift if office has shifts
    const shiftInvalid =
      data.officeShiftId === null ||
      data.officeShiftId === undefined ||
      data.officeShiftId <= 0;

    if (hasShift && shiftInvalid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["officeShiftId"],
        message: "Shift is required for this office",
      });
    }
  });

// ---------------- Initial Values ----------------
const initialValues = {
  id: "",
  officeId: "",
  officeShiftId: null,
};

const LeftSideEmployeeProfileDetails = ({
  employeeData,
  employeeDetails,
  isLoading,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { id } = useParams();

  // ---------------------------Employee Update Ofiice And Shift Start-------------------------//
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => {
    setShowModal(false);
    reset(initialValues);
  };

 
  const { useOfficeListQuery } = useCommonQueryApi({
    setShowModal,
  });
  const { data: officeList = [] } = useOfficeListQuery();

  const { handleSubmit, control, reset, watch, setValue, setError } = useForm({
    resolver: zodResolver(schema, {
      context: { officeList },
    }),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // ---------------- Selected Office ----------------
  const selectedOfficeId = watch("officeId");

  const selectedOffice = useMemo(() => {
    return officeList.find((o) => o.value === selectedOfficeId);
  }, [selectedOfficeId, officeList]);

  // ---------------- Shift Options ----------------
  const officeShiftOptions = useMemo(() => {
    if (selectedOffice?.officeShifts?.length > 0) {
      return selectedOffice.officeShifts.map((shift) => ({
        value: shift.id,
        label: `${shift.name} (${helpers.stringTimeToLocalTime(shift.startTime)} - ${helpers.stringTimeToLocalTime(shift.endTime)})`,
      }));
    }
    return [];
  }, [selectedOffice]);

  const {
    UpdateEmployeeOfficeandShiftMutation,
    toggleEmployeeActiveStatusMutation,
  } = useHrQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });


  const submitForm = async (values) => {
    const payload = {
      empId: id,
      officeId: values.officeId,
      officeShiftId: values.officeShiftId || null, // null-safe
    };

    await UpdateEmployeeOfficeandShiftMutation.mutateAsync(payload);
  };

  // ---------------------------Employee Update Ofiice And Shift Start-------------------------//

  // Calculate work duration
  const calculateWorkDuration = () => {
    if (!employeeData?.todayAttendance?.checkIn) return "N/A";

    const checkIn = new Date(employeeData.todayAttendance.checkIn);
    const now = new Date();
    const diffMs = now - checkIn;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHours}h ${diffMinutes}m`;
  };

  // Get employee data with fallbacks
  const getEmployeeData = () => {
    if (!employeeData?.employeeProfile) return null;
    return employeeData.employeeProfile;
  };

  const employee = getEmployeeData();

  
  useEffect(() => {
    if (showModal && employee) {
      reset({
        officeId: employee.officeId || "",
        officeShiftId: employee.officeShiftId || null,
      });
    }
  }, [showModal, employee, reset]);

  const todayAttendance = employeeData?.todayAttendance;
  const breaksToday = employeeData?.breaksToday || [];

  const {
    useAttendanceAndLeaveSummeryForEmployeeQuery,
    useTotalExperienceAndPromotionForEmployeeQuery,
  } = useEmployeeProfileQueryApi({
    reset,
    setError,
  });

  const { data: attendanceAndLeaveSummeryResponseData, isLoading: isFetching } =
    useAttendanceAndLeaveSummeryForEmployeeQuery(id);

  const { data: totalExperienceAndPromotionResponseData } =
    useTotalExperienceAndPromotionForEmployeeQuery(id);

  const responseData = {
    totalExperienceAndPromotion: totalExperienceAndPromotionResponseData?.data,
    attendanceAndLeaveSummery: attendanceAndLeaveSummeryResponseData?.data,
  };

  const handleLockToggle = useCallback(() => {
    toggleEmployeeActiveStatusMutation.mutateAsync(id)
  }, [id]);

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

      {/* Time In/Out Skeleton */}
      <Card className="mb-4 sm:mb-6 dark:bg-theme-dark bg-theme border-gray-200 dark:border-gray-700">
        <CardContent className="p-4 sm:p-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-3 animate-pulse"></div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 animate-pulse"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breaks Skeleton */}
      <Card className="dark:bg-theme-dark bg-theme border-gray-200 dark:border-gray-700">
        <CardContent className="p-4 sm:p-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-3 animate-pulse"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-full animate-pulse"></div>
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

  return (
    <div className="">
      <div className="">
        {/* Mobile Header - Collapsible */}
        <div className="lg:hidden flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold dark-title-color ">
            Employee Profile
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`cursor-pointer ${
              isExpanded ? "text-primaryColor" : ""
            }`}
          >
            <SimpleTooltip
              className="cursor-pointer"
              text={isExpanded ? "Hide Profile" : "Show Profile"}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 hand" />
              ) : (
                <ChevronDown className="w-5 h-5 hand" />
              )}
            </SimpleTooltip>
          </Button>
        </div>

        {/* Content - Hidden on mobile when collapsed */}
        <div
          className={`${isExpanded ? "block" : "hidden"} lg:block space-y-4`}
        >
          {/* Employee Profile Card */}
          <Card className="card-gradient border-gray-200 dark:border-gray-700">
            <CardContent className="px-4 sm:px-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Picture */}

                {/* <Avatar
                  text={helpers.avatarText(employee?.user?.fullName)}
                  image={employee?.user?.profile?.profilePicture?.fileUrl}
                  color="info"
                  size="17xl"
                  ring={!employee?.user?.profile?.profilePicture?.fileUrl}
                  className="mb-4"
                /> */}

                <UpdateEmployeeProfilePicture
                  userProfile={employee?.user?.profile?.profilePicture?.fileUrl}
                  id={id}
                />

                {/* Name & Title */}
                <h2 className="text-xl sm:text-2xl font-bold dark-title-color">
                  {employee?.user?.fullName || "Employee Name"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-3">
                  {employee?.designation?.name || "Designation: N/A"}
                </p>

                {/* Contact Info */}
                {(employee?.user?.email ||
                  employee?.user?.profile?.phoneWithCallingCode) && (
                  <div className="flex flex-wrap justify-center gap-3 mb-4 text-xs">
                    {employee?.user?.email && (
                      <a href={`mailto:${employee.user.email}`}>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">
                            {employee.user.email}
                          </span>
                        </div>
                      </a>
                    )}
                    {employee?.user?.profile?.phoneWithCallingCode && (
                      <a
                        href={`tel:${employee.user.profile.phoneWithCallingCode}`}
                      >
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Phone className="w-3 h-3" />
                          <span>
                            {employee.user.profile.phoneWithCallingCode}
                          </span>
                        </div>
                      </a>
                    )}
                  </div>
                )}

                <div className="flex flex-col items-center gap-2">
                <SimpleTooltip
                  text={employee?.user?.profileCompleted ? "Employee user cannot update his/her profile" : "Employee user can update his/her profile"}
                >
                  <SwitchButton
                    onLockToggle={handleLockToggle}
                    enabled={employee?.user?.profileCompleted}
                    enabledText="Profile Locked"
                    disabledText="Profile Unlocked"
                    className="!mb-0"
                    mode="lock"
                    color="danger"
                    shape="square"
                    size="lg"
                  />
                </SimpleTooltip>
                </div>

                <div className="!w-full flex items-center justify-end">
                  <SimpleTooltip text="Edit">
                    <button
                      onClick={() => setShowModal(true)}
                      className="btn-action text-blue-500 hover:text-blue-700"
                    >
                      <Pencil size={16} />
                    </button>
                  </SimpleTooltip>
                </div>

                {/* Employee Details */}
                <div className="w-full space-y-3 text-sm sm:text-base">
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
                      {employee?.office?.name || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between flex-wrap items-center">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      Department:
                    </span>
                    <span className="dark-title-color text-sm font-medium">
                      {employee?.designation?.department?.name || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between flex-wrap items-center">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joining Date:
                    </span>
                    <span className="dark-title-color text-sm font-medium">
                      {helpers.dDate(employee?.joiningDate)}
                    </span>
                  </div>

                  {/* Office Shift Timing */}
                  {employee?.officeShift && (
                    <div className="flex justify-between flex-wrap items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Shift:
                      </span>
                      <span className="dark-title-color  font-medium text-xs">
                        {formatTime(employee.officeShift.startTime)} -{" "}
                        {formatTime(employee.officeShift.endTime)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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

              {/* Breaks List */}
              {todayAttendance?.startBreak ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Last Break
                    </span>
                    <span className="dark-title-color text-sm">
                      {todayAttendance?.startBreak
                        ? helpers.dTime(todayAttendance.startBreak)
                        : "N/A"}{" "}
                      -
                      {todayAttendance?.endBreak
                        ? helpers.dTime(todayAttendance.endBreak)
                        : "Ongoing"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Break Minutes:
                    </span>
                    <span className="dark-title-color text-sm">
                      {todayAttendance?.breakMinutes ?? 0}
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
          {/* Update Profile Office And Time Shift */}
          <div>
            <ModalTw
              show={showModal}
              onClose={handleClose}
              title={`Update Employee Office & Time Shift`}
              size="lg"
              onConfirm={handleClose}
              dismissible={true}
              confirmText="Confirm"
              cancelText="Cancel"
              showHeader={true}
              showFooter={false}
              type="default"
              position="center"
            >
              <form className="p-3" onSubmit={handleSubmit(submitForm)}>
                <div className="">
                  {/* <Controller
                    name="officeId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <SelectSearch
                        label="Select Office"
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val);
                          reset({
                            ...watch(),
                            officeShiftId: null,
                            officeId: val,
                          });
                        }}
                        error={fieldState.error?.message}
                        options={officeList || []}
                        placeholder="Select Office Here..."
                        className="col-span-12 lg:col-span-6 sm:col-span-12"
                      />
                    )}
                  /> */}

                  <Controller
                    name="officeId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <SelectSearch
                        label="Select Office"
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(Number(val)); // ensure number
                          setValue("officeShiftId", null); // reset shift
                        }}
                        options={officeList || []}
                        placeholder="Select Office Here..."
                        error={fieldState.error?.message}
                      />
                    )}
                  />

                  {/* Shift (Conditional) */}
                  {officeShiftOptions.length > 0 && (
                    // <Controller
                    //   name="officeShiftId"
                    //   control={control}
                    //   render={({ field, fieldState }) => (
                    //     <SelectSearch
                    //       label="Select Shift"
                    //       value={field.value}
                    //       onChange={field.onChange}
                    //       error={fieldState.error?.message}
                    //       options={officeShiftOptions}
                    //       placeholder="Select Shift Here..."
                    //       className="col-span-12 lg:col-span-6 sm:col-span-12"
                    //     />
                    //   )}
                    // />

                    <Controller
                      name="officeShiftId"
                      control={control}
                      render={({ field, fieldState }) => (
                        <SelectSearch
                          label="Select Office Shift"
                          value={field.value}
                          onChange={(val) => {
                            field.onChange(val ? Number(val) : null); // convert to number, null if unselected
                          }}
                          options={officeShiftOptions}
                          placeholder="Select Shift Here..."
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                  )}
                </div>

                <div className="col-span-12 flex justify-center items-center gap-4">
                  <ButtonTw
                    type="submit"
                    size="sm"
                    variant="default"
                    className="w-full font-bold mt-4 col-span-12 "
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    Submit
                  </ButtonTw>

                  <ButtonTw
                    size="sm"
                    variant="outline.gray"
                    className="w-full font-bold mt-4 col-span-12"
                    onClick={() => reset(initialValues)}
                  >
                    Reset
                  </ButtonTw>
                </div>
              </form>
            </ModalTw>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSideEmployeeProfileDetails;
