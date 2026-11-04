"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import { debounce } from "lodash";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FaSmile,
  FaSadTear,
  FaExclamationCircle,
  FaChartBar,
  FaInfoCircle,
} from "react-icons/fa";
import Image from "next/image";
import { FaCodePullRequest } from "react-icons/fa6";
import { IoMdLogIn, IoMdLogOut } from "react-icons/io";
import { BiLogIn, BiLogOut } from "react-icons/bi";
import ButtonTw from "@/components/ui/ButtonTw";
import {
  Building2,
  Calendar,
  Clock,
  Edit,
  MapPin,
  Trash2,
  Trash2Icon,
} from "lucide-react";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonStore } from "@/store/useCommonStore";
import Swal from "sweetalert2";
import helpers, { toaster } from "@/utils/helpers";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useDashboardQueryApi } from "@/hooks/queryApi/useDashboardQueryApi";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import LateRequestModal from "./LateRequestModal";

const CheckInCheckoutSection = () => {

  const dropdowns = useCommonStore((state) => state.dropdowns);
  const earlyLeaveReasonList =
    dropdowns.statusGroupList?.find((s) => s.code === "early_leave_reasons")
      ?.statuses ?? [];
  const searchParams = useSearchParams();

  const [showModal, setShowModal] = useState(false);

  const holidayTypes =
    dropdowns.statusGroupList
      ?.find((s) => s.code === "holiday_types")
      ?.statuses?.map((c) => ({
        value: c.id,
        label: c.name,
        code: c.code,
      })) ?? [];



  // Zod schema for service information
  const schema = z
    .object({
      id: z.coerce.number().optional(),
      earlyLeaveReasonId: z.coerce.number().min(1, "Early Leave Reason is required"),
    });

  const initialValues = {
    id: 0,
    earlyLeaveReasonId: null,
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


  const handleClose = () => {
    setShowModal(false);
  };

  const {
    useMyAttendanceQuery,
    checkInOrCheckOutAttendanceMutation,
  } = useDashboardQueryApi({ reset, setError, handleClose, setShowModal });

  const { data: responseData, isLoading: isFetching } = useMyAttendanceQuery();

  // console.log('responseData', responseData)

  const myAttendance = useMemo(
    () => responseData?.data || null,
    [responseData?.data]
  );

  const canCheckInOut = useMemo(() => {
    if (typeof responseData?.canCheckInOut === "boolean") {
      return responseData.canCheckInOut;
    }
    // Fallback if API shape differs
    return Boolean(responseData?.officeId && responseData?.officeShiftId);
  }, [responseData]);

  useEffect(() => {
    if (myAttendance) {
      reset({
        id: myAttendance.id,
        earlyLeaveReasonId: myAttendance.earlyLeaveReasonId,
      });
    }
  }, [myAttendance]);


  const { mutateAsync, isLoading } = checkInOrCheckOutAttendanceMutation;
  const [geoLoading, setGeoLoading] = useState(false);

  const handleAttendance = useCallback(
    async (type, payload = {}) => {
      if (!navigator.geolocation) {
        toaster("Geolocation not supported by your browser.", "danger");
        return;
      }

      setGeoLoading(true);

      const getPosition = (opts) =>
        new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, opts)
        );

      try {
        // If permission is explicitly denied, bail out with a friendly message
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const perm = await navigator.permissions.query({ name: "geolocation" });
            if (perm.state === "denied") {
              toaster("Location access denied. Enable location permission in browser settings.", "danger");
              setGeoLoading(false);
              return;
            }
          } catch (e) {
            // ignore permission query failures and continue to try getting position
          }
        }

        let position = null;

        // Try a faster, low-accuracy attempt first (usually quicker on some devices/browsers)
        try {
          position = await getPosition({ enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
        } catch (err) {
          // If it timed out, retry with high accuracy and longer timeout
          if (err?.code === 3) {
            try {
              position = await getPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 });
            } catch (err2) {
              // leave position null to trigger fallback
              position = null;
            }
          } else {
            // other errors (permission denied, position unavailable) -> rethrow to outer catch
            throw err;
          }
        }

        // If we still don't have a position, try an IP-based coarse fallback (best-effort)
        if (!position) {
          try {
            const res = await fetch("https://ipapi.co/json/"); // free IP geolocation service
            if (res.ok) {
              const ipData = await res.json();
              const latitude = parseFloat(ipData.latitude);
              const longitude = parseFloat(ipData.longitude);
              if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
                const locationKey = type === "checkIn" ? "checkInLatLong" : "checkOutLatLong";
                await mutateAsync({
                  ...payload,
                  [locationKey]: { latitude, longitude },
                });
                toaster("Using approximate location (IP-based).", "warning");
                setGeoLoading(false);
                return;
              }
            }
          } catch (ipErr) {
            // ignore IP fallback errors
          }

          toaster("Unable to retrieve location. Please allow location access.", "danger");
          setGeoLoading(false);
          return;
        }

        const { latitude, longitude } = position.coords;
        const locationKey = type === "checkIn" ? "checkInLatLong" : "checkOutLatLong";

        try {
          await mutateAsync({
            ...payload,
            [locationKey]: { latitude, longitude },
          });
        } catch (error) {
          console.error(error);
        } finally {
          setGeoLoading(false);
        }
      } catch (error) {
        console.error(error);
        toaster("Unable to retrieve location. Please allow location access.", "danger");
        setGeoLoading(false);
      }
    },
    [mutateAsync]
  );


  const handleCheckIn = useCallback(() => {
    handleAttendance("checkIn");
  }, [handleAttendance]);


  const handleCheckOut = useCallback(
    async (payload) => {
      const earlyEndTime =
        myAttendance?.shift?.earlyEndTime ?? myAttendance?.office?.earlyEndTime;

      if (earlyEndTime) {
        const now = new Date();
        const currentTime = now.toTimeString().split(" ")[0];
        if (currentTime < earlyEndTime) {
          setShowModal(true);
          return;
        }
      }

      // Wait for the actual async call
      await handleAttendance("checkOut", payload);
    },
    [handleAttendance, myAttendance]
  );


  const submitFormForCheckout = useCallback(
    async (values) => {
      await handleAttendance("checkOut", values);
    },
    [handleAttendance]
  );

  const [showLateRequestFormModal, setShowLateRequestFormModal] = useState(false);

  // const handleRequestForRemoveLateCount = useCallback(
  //   setShowLateRequestForm(true);
  // );


  const getIconByCheckInMethod = () => {
    if (myAttendance?.checkInMethod?.code === "emp_attendance_method_desktop") {
      return <i className="fa fa-desktop"></i>;
    } else if (myAttendance?.checkInMethod?.code === "emp_attendance_method_mobile") {
      return <i className="fa fa-mobile"></i>;
    } else if (myAttendance?.checkInMethod?.code === "emp_attendance_method_bimetric") {
      return <i className="fa fa-fingerprint"></i>;
    } else if (myAttendance?.checkInMethod?.code === "emp_attendance_method_manual") {
      return <i className="fa fa-key"></i>;
    }
  };

  // Hide until the authenticated employee has both office and shift assigned
  if (isFetching && !responseData) return null;
  if (!canCheckInOut) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-9 gap-4 ">
      <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-4">
        <Card className={"border-l-4 border-l-secondaryColor dark:bg-theme-dark bg-theme-light dark:text-theme-light-text text-theme-dark-text"}>
          <CardContent className="grid grid-cols-8">
            {isFetching ? (
              <>
                <div className="col-span-4 flex flex-col border-r pr-4 space-y-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="col-span-4 flex flex-col pl-4 space-y-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </>
            ) : (
              <>
                <div className="col-span-4 flex flex-col border-r pr-4">
                  {!myAttendance && (
                    <ButtonTw onClick={handleCheckIn} loading={geoLoading || isLoading}
                      disabled={geoLoading || isLoading} icon={<BiLogIn />} variant="green">Check In</ButtonTw>
                  )}

                  {myAttendance && (
                    <div>
                      <div>
                        <span className="badge badge-pill badge-outline-success">Checked In</span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-teal-500" />
                        <small className="font-bold">{helpers.dDate(myAttendance?.attendanceDate, 'DD MMM yyyy')}</small>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <small className="font-bold">{myAttendance?.checkIn && helpers.dTime(myAttendance.checkIn)}</small>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <SimpleTooltip
                          icon={getIconByCheckInMethod()}
                          text={`Entry Point: ${myAttendance?.checkInMethod?.name}`}
                        >
                        </SimpleTooltip>
                        {myAttendance?.attendanceStatus?.code === 'emp_attendance_status_present' ? (
                          <span className={`badge badge-pill badge-outline-${myAttendance?.checkInStatus?.colorName}`}>{myAttendance?.checkInStatus?.name}</span>
                        ) : (
                          <span className={`badge badge-pill badge-outline-${myAttendance?.attendanceStatus?.colorName}`}>{myAttendance?.attendanceStatus?.name}</span>
                        )}

                        {myAttendance?.checkInStatus?.code === 'attendance_checkin_status_late' && !myAttendance?.lateReason && (
                          <SimpleTooltip
                            text={`Appeal for on-time arrival`}
                          >
                            <button onClick={() => {
                              setShowLateRequestFormModal(true);
                            }} className="btn-action text-blue-500 hover:text-blue-700"><FaCodePullRequest /></button>
                          </SimpleTooltip>
                        )}

                        {myAttendance?.lateReason && (
                          <SimpleTooltip
                            text={`Late Reason: ${myAttendance?.lateReason}`}
                          >
                            <div className="flex items-center gap-1">
                              <FaInfoCircle className="h-4 w-4 text-blue-500" />
                              <span className={`badge badge-pill badge-outline-warning ${myAttendance?.attendanceRecon?.inTimeStatus?.colorName}`}>{myAttendance?.attendanceRecon?.inTimeStatus?.name}</span>
                            </div>
                          </SimpleTooltip>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-span-4 flex flex-col pl-4">
                  {myAttendance && (
                    <div>
                      {!myAttendance?.checkOut && (
                        <ButtonTw onClick={() => handleCheckOut(myAttendance)} loading={geoLoading || isLoading}
                          disabled={geoLoading || isLoading} icon={<BiLogOut />} variant="red">Check Out</ButtonTw>
                      )}
                      {myAttendance?.checkOut && (
                        <>
                          <div>
                            <span className="badge badge-pill badge-outline-danger">Checked Out</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-teal-500" />
                            <small className="font-bold">{helpers.dDate(myAttendance?.checkOut, 'DD MMM yyyy')}</small>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4 text-purple-500" />
                            <small className="font-bold">{myAttendance?.checkOut && helpers.dTime(myAttendance.checkOut)}</small>
                          </div>
                          <div className="flex items-center flex-wrap gap-2 mt-1">
                            <SimpleTooltip
                              icon={getIconByCheckInMethod()}
                              text={`Exit Point: ${myAttendance?.checkInMethod?.name}`}
                            >
                            </SimpleTooltip>
                            <span className={`badge badge-pill badge-outline-${myAttendance?.checkOutStatus?.colorName}`}>{myAttendance?.checkOutStatus?.name}</span>

                            {myAttendance?.earlyLeaveReason && (
                              <SimpleTooltip
                                text={`Early Leave Reason: ${myAttendance?.earlyLeaveReason?.name}`}
                              >
                                <div className="flex items-center gap-1">
                                  <FaInfoCircle className="h-4 w-4 text-blue-500" />
                                  <span className={`badge badge-pill badge-outline-warning ${myAttendance?.attendanceRecon?.outTimeStatus?.colorName}`}>{myAttendance?.attendanceRecon?.outTimeStatus?.name}</span>
                                </div>
                              </SimpleTooltip>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <ModalTw
          show={showModal}
          onClose={() => setShowModal(false)}
          title="Checkout"
          size="md"
          onConfirm={() => setShowModal(false)}
          dismissible={true}
          confirmText="Confirm"
          cancelText="Cancel"
          showHeader={false}
          showFooter={false}
        >
          <form className="p-3" onSubmit={handleSubmit(submitFormForCheckout)}>
            <h2 className="text-2xl font-bold mb-2">Are you sure to checkout?</h2>
            <p className="text-gray-500 mb-4">You won't be able to revert this!</p>
            <div className="grid grid-cols-12 gap-x-4">

              <Controller
                control={control}
                name="earlyLeaveReasonId"
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Early Leave Reason"
                    placeholder="Select Early Leave Reason"
                    options={earlyLeaveReasonList}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-12 sm:col-span-12"
                    searchable
                  />
                )}
              />

              <div className="col-span-12 flex justify-center items-center gap-4">
                <ButtonTw
                  type="submit"
                  size="sm"
                  variant="default"
                  className="w-full font-bold mt-4 col-span-12"
                  disabled={geoLoading || isLoading}
                  loading={geoLoading || isLoading}
                >
                  Yes
                </ButtonTw>

                <ButtonTw
                  size="sm"
                  variant="outline.gray"
                  className="w-full font-bold mt-4 col-span-12"
                  onClick={() => {
                    reset()
                    setShowModal(false)
                  }}
                >
                  No
                </ButtonTw>
              </div>
            </div>
          </form>
        </ModalTw>

        <LateRequestModal
          showModal={showLateRequestFormModal}
          handleClose={() => setShowLateRequestFormModal(false)}
          setShowModal={() => setShowLateRequestFormModal(true)}
          initialProps={myAttendance}
        />

      </div>
    </div>
  );
};

export default CheckInCheckoutSection;
