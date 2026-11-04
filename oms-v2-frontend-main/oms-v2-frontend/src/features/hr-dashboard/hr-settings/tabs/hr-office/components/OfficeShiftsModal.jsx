"use client";

import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import { Button } from "@/components/ui/button";
import ButtonTw from "@/components/ui/ButtonTw";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/Input";
import { TimePicker } from "@/components/ui/TimePicker";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { formatTime } from "@/utils/formatTime";
import helpers from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  Calendar,
  Clock,
  Edit,
  Pencil,
  Plus,
  Save,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import { BsViewList } from "react-icons/bs";
import { useCallback, useMemo, useState } from "react";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { z } from "zod";
import SwitchButton from "@/components/ui/SwitchButton";

// const shiftSchema = z.object({
//   id: z.number().default(0),
//   name: z.string().min(1, "Shift name is required"),
//   startTime: z.string().min(1, "Start time is required"),
//   delayStartTime: z.string().min(1, "Delay start time is required"),
//   endTime: z.string().min(1, "End time is required"),
//   earlyEndTime: z.string().min(1, "Early end time is required"),
// });

const shiftSchema = z
  .object({
    id: z.number().default(0),
    name: z.string().min(1, "Shift name is required"),
    startTime: z.string().min(1, "Start time is required"),
    delayStartTime: z.string().min(1, "Delay start time is required"),
    endTime: z.string().min(1, "End time is required"),
    earlyEndTime: z.string().min(1, "Early end time is required"),
  })
  .superRefine((data, ctx) => {
    const toMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const start = toMinutes(data.startTime);
    const delayStart = toMinutes(data.delayStartTime);
    const end = toMinutes(data.endTime);
    const earlyEnd = toMinutes(data.earlyEndTime);

    if (earlyEnd >= end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Early end time must be less than end time",
        path: ["earlyEndTime"],
      });
    }

    if (delayStart <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Delay start time must be greater than start time",
        path: ["delayStartTime"],
      });
    }
  });

export default function OfficeShiftsModal({
  showModal,
  handleClose,
  officeData,
  showAddForm,
  setShowAddForm,
  openAddWeekendModal,
  openEditWeekendCard,
  weekendForm,
  activeWeekendShiftId,
  setActiveWeekendShiftId,
  modalLoading,
  handleSubmitWeekend,
}) {
  const [editingShift, setEditingShift] = useState(null);

  const initialValues = {
    id: 0,
    name: "",
    startTime: "",
    delayStartTime: "",
    endTime: "",
    earlyEndTime: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    //formState: { errors },
  } = useForm({
    resolver: zodResolver(shiftSchema),
    defaultValues: initialValues,
  });

  const {
    // office shift
    useOfficeShiftsByOfficeIdQuery,

    addOrUpdateOfficeShiftMutation,
    deleteOfficeShiftMutation,
  } = useHrQueryApi({ reset });
  // fetch weekends for this office (for shift-specific display)
  // const formatTime = (time) => {
  //   return time.slice(0, 5); // Remove seconds from HH:MM:SS
  // };
  const { data: officeShiftsData, isLoading: getShiftDataLoading } =
    useOfficeShiftsByOfficeIdQuery(officeData?.id || 0);
  const officeShiftsArray = officeShiftsData?.data || [];

  //console.log("officeShiftsArray All :", officeShiftsArray);

  // load weekends for this office once (used to show badges and to pass weekend object to parent edit)
  const { useWeekendsQuery } = useHrQueryApi({ reset });
  const { data: weekendsResponse } = useWeekendsQuery({
    officeId: officeData?.id || 0,
    limit: 1000,
  });
  const weekendsArray = weekendsResponse?.data || [];
  const weekendsMapByShift = useMemo(() => {
    const m = new Map();
    weekendsArray.forEach((w) => {
      if (w?.shiftId) m.set(w.shiftId, w);
    });
    return m;
  }, [weekendsArray]);
  const weekendsMapByOffice = useMemo(() => {
    const m = new Map();
    weekendsArray.forEach((w) => {
      if (w?.officeId) m.set(w.officeId, w);
    });
    return m;
  }, [weekendsArray]);

  // --- Submit Shift Form ---
  const submitForm = async (values) => {
    try {
      const weekendValues = weekendForm.getValues();
      const payload = {
        ...values,
        officeId: officeData?.id,
        weekend: {
          ...weekendValues,
          shiftId: values.id,
        },
      };

      //console.log("Office Shift Edit :", payload);

      await addOrUpdateOfficeShiftMutation.mutateAsync(payload);

      setShowAddForm(false);
      setEditingShift(null);
      reset(initialValues);

      weekendForm.reset({
        officeId: officeData?.id,
        saturday: true,
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: true,
        shiftId: null,
      });
    } catch (error) {
      console.error("Error saving shift:", error);
    }
  };

  const handleDelete = useCallback(
    async (id) => {
      console.log(id, "delete id");
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        customClass: {
          popup: "swal-popup",
          confirmButton: "swal-confirm-btn",
          cancelButton: "swal-cancel-btn",
        },
        buttonsStyling: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deleteOfficeShiftMutation.mutateAsync(id);
        }
      });
    },
    [deleteOfficeShiftMutation],
  );

  const startEdit = (shift) => {
    setEditingShift(shift.id);
    reset({
      id: shift.id,
      name: shift.name,
      startTime: shift.startTime,
      delayStartTime: shift.delayStartTime,
      endTime: shift.endTime,
      earlyEndTime: shift.earlyEndTime,
    });
  };

  const startAdd = () => {
    setShowAddForm(true);
    setEditingShift(null);
    reset(initialValues);
    weekendForm.reset({
      officeId: officeData?.id,
      saturday: true,
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: true,
      shiftId: null,
    });
  };

  if (!officeData) return null;

  return (
    <>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`Office Shift - ${officeData.name}`}
        size="3xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <div className="space-y-6">
          {/* Add New Shift Button */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Manage shifts for this office
            </p>

            <ButtonTw onClick={startAdd} variant="blue" className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Shift
            </ButtonTw>
          </div>

          {/* Add New Shift Form */}
          {!getShiftDataLoading && showAddForm && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5 text-green-500" />
                  Add New Shift
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                      name="name"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Input
                          label="Shift Name"
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                          placeholder="E.G., Morning Shift"
                        />
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Controller
                      control={control}
                      name="startTime"
                      render={({ field, fieldState }) => (
                        <TimePicker
                          label="Start Time"
                          value={field.value}
                          onChange={field.onChange}
                          name="startTime"
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="delayStartTime"
                      render={({ field, fieldState }) => (
                        <TimePicker
                          label="Delay Start Time"
                          name="delayStartTime"
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="endTime"
                      render={({ field, fieldState }) => (
                        <TimePicker
                          label="End Time"
                          name="endTime"
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="earlyEndTime"
                      render={({ field, fieldState }) => (
                        <TimePicker
                          label="Early End Time"
                          name="earlyEndTime"
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                  </div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Plus className="h-5 w-5 text-green-500" />
                    Add Weekends
                  </CardTitle>

                  <div className="px-4 bg-white dark:bg-gray-900  rounded shadow">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <input
                        type="hidden"
                        {...weekendForm.register("officeId")}
                      />

                      {[
                        { name: "saturday", label: "Saturday" },
                        { name: "sunday", label: "Sunday" },
                        { name: "monday", label: "Monday" },
                        { name: "tuesday", label: "Tuesday" },
                        { name: "wednesday", label: "Wednesday" },
                        { name: "thursday", label: "Thursday" },
                        { name: "friday", label: "Friday" },
                      ].map((day) => (
                        <Controller
                          key={day.name}
                          name={day.name}
                          control={weekendForm.control}
                          render={({ field }) => (
                            <SwitchButton
                              label={day.label}
                              enabled={field.value}
                              onClick={() => field.onChange(!field.value)}
                              enabledText="Yes"
                              disabledText="No"
                            />
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <ButtonTw type="submit" className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Shift
                    </ButtonTw>
                    <Button
                      type="button"
                      variant="outline"
                      // onClick={() => {
                      //   setShowAddForm(false);
                      //   reset(initialValues);
                      // }}
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingShift(null);
                        reset(initialValues);
                      }}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Shifts List */}
          <div className="space-y-4">
            {getShiftDataLoading ? (
              // --- Skeleton Loading ---
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-l-4 border-l-gray-200">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
                      <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="space-y-2">
                          <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
                          <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
                        </div>
                      ))}
                    </div>
                    <div className="h-3 w-40 rounded bg-gray-200 animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : (!officeShiftsArray || officeShiftsArray?.length === 0) &&
              !showAddForm ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No shifts found for this office
                  </p>
                </CardContent>
              </Card>
            ) : (
              officeShiftsArray?.map((shift) => (
                <Card
                  key={shift.id}
                  className={`border-l-4 ${
                    shift.isActive ? "border-l-green-500" : "border-l-gray-400"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Timer className="h-5 w-5 text-blue-500" />
                        {shift.name} 
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingShift === shift.id ? (
                      <form
                        onSubmit={handleSubmit(submitForm)}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Controller
                            name="name"
                            control={control}
                            render={({ field, fieldState }) => (
                              <Input
                                label="Shift Name"
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                              />
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <Controller
                            control={control}
                            name="startTime"
                            render={({ field, fieldState }) => (
                              <TimePicker
                                label="Start Time"
                                value={field.value}
                                onChange={field.onChange}
                                name="startTime"
                                error={fieldState.error?.message}
                              />
                            )}
                          />
                          <Controller
                            control={control}
                            name="delayStartTime"
                            render={({ field, fieldState }) => (
                              <TimePicker
                                label="Delay Start Time"
                                name="delayStartTime"
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                              />
                            )}
                          />
                          <Controller
                            control={control}
                            name="endTime"
                            render={({ field, fieldState }) => (
                              <TimePicker
                                label="End Time"
                                name="endTime"
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                              />
                            )}
                          />
                          <Controller
                            control={control}
                            name="earlyEndTime"
                            render={({ field, fieldState }) => (
                              <TimePicker
                                label="Early End Time"
                                name="earlyEndTime"
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                              />
                            )}
                          />
                        </div>

                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Plus className="h-5 w-5 text-green-500" />
                          Edit Weekends
                        </CardTitle>
                        <div className="px-4 bg-white dark:bg-gray-900  rounded shadow">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <input
                              type="hidden"
                              {...weekendForm.register("officeId")}
                            />

                            {[
                              { name: "saturday", label: "Saturday" },
                              { name: "sunday", label: "Sunday" },
                              { name: "monday", label: "Monday" },
                              { name: "tuesday", label: "Tuesday" },
                              { name: "wednesday", label: "Wednesday" },
                              { name: "thursday", label: "Thursday" },
                              { name: "friday", label: "Friday" },
                            ].map((day) => (
                              <Controller
                                key={day.name}
                                name={day.name}
                                control={weekendForm.control}
                                render={({ field }) => (
                                  <SwitchButton
                                    label={day.label}
                                    enabled={field.value}
                                    onClick={() => field.onChange(!field.value)}
                                    enabledText="Yes"
                                    disabledText="No"
                                  />
                                )}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            type="submit"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save Changes
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingShift(null)}
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-muted-foreground">
                              Start Time
                            </p>
                            <p className="font-mono">
                              {formatTime(shift.startTime)}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">
                              Delay Start
                            </p>
                            <p className="font-mono">
                              {formatTime(shift.delayStartTime)}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">
                              End Time
                            </p>
                            <p className="font-mono">
                              {formatTime(shift.endTime)}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">
                              Early End
                            </p>
                            <p className="font-mono">
                              {formatTime(shift.earlyEndTime)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Created: {helpers.dDateTime(shift.createdAt)}
                          {shift.updatedAt && (
                            <span>
                              • Updated: {helpers.dDateTime(shift.updatedAt)}
                            </span>
                          )}
                        </div>

                        {/* Weekends for this shift (fallback to office-level weekends) */}
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 mb-2">
                            Office Weekends
                          </p>
                          {(() => {
                            const weekend =
                              weekendsMapByShift.get(shift.id) ||
                              weekendsMapByOffice.get(officeData.id);
                            const dayLabels = {
                              saturday: "Saturday",
                              sunday: "Sunday",
                              monday: "Monday",
                              tuesday: "Tuesday",
                              wednesday: "Wednesday",
                              thursday: "Thursday",
                              friday: "Friday",
                            };

                            if (!weekend) {
                              return (
                                <div className="flex items-center">
                                  <SimpleTooltip text="Add Weekends">
                                    <ButtonTw
                                      variant="blue"
                                      size="xs"
                                      className="gap-1"
                                      onClick={() => {
                                        // call parent handler and pass shiftId so parent modal pre-fills shiftId
                                        if (openAddWeekendModal)
                                          openAddWeekendModal({
                                            id: officeData?.id,
                                            shiftId: shift.id,
                                          });
                                      }}
                                    >
                                      <BsViewList /> Add
                                    </ButtonTw>
                                  </SimpleTooltip>
                                </div>
                              );
                            }

                            const active = Object.keys(dayLabels).filter(
                              (d) => weekend[d],
                            );
                            return (
                              <div className="flex items-center gap-3">
                                <div className="flex flex-wrap gap-2">
                                  {active.map((d) => (
                                    <span
                                      key={d}
                                      className="badge badge-pill badge-outline-danger"
                                    >
                                      {dayLabels[d]}
                                    </span>
                                  ))}
                                </div>
                                <SimpleTooltip text="Edit Weekends">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // pass the weekend object to parent handler so it can open the central modal
                                      if (openEditWeekendCard)
                                        openEditWeekendCard(weekend);
                                    }}
                                    className="btn-action text-blue-500 hover:text-blue-700 ml-1"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                </SimpleTooltip>
                              </div>
                            );
                          })()}
                          {activeWeekendShiftId === shift.id && (
                            <div className="p-4 bg-white dark:bg-gray-900  rounded shadow">
                              <form onSubmit={handleSubmitWeekend}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <input
                                    type="hidden"
                                    {...weekendForm.register("id")}
                                  />
                                  <input
                                    type="hidden"
                                    {...weekendForm.register("officeId")}
                                  />
                                  <input
                                    type="hidden"
                                    {...weekendForm.register("shiftId")}
                                  />

                                  {[
                                    { name: "saturday", label: "Saturday" },
                                    { name: "sunday", label: "Sunday" },
                                    { name: "monday", label: "Monday" },
                                    { name: "tuesday", label: "Tuesday" },
                                    { name: "wednesday", label: "Wednesday" },
                                    { name: "thursday", label: "Thursday" },
                                    { name: "friday", label: "Friday" },
                                  ].map((day) => (
                                    <Controller
                                      key={day.name}
                                      name={day.name}
                                      control={weekendForm.control}
                                      render={({ field }) => (
                                        <SwitchButton
                                          label={day.label}
                                          enabled={field.value}
                                          onClick={() =>
                                            field.onChange(!field.value)
                                          }
                                          enabledText="Yes"
                                          disabledText="No"
                                        />
                                      )}
                                    />
                                  ))}
                                </div>

                                <div className="flex gap-4 mt-4">
                                  <ButtonTw
                                    type="submit"
                                    size="sm"
                                    variant="default"
                                    className="w-full font-bold"
                                    disabled={modalLoading}
                                    loading={modalLoading}
                                  >
                                    Save
                                  </ButtonTw>

                                  <ButtonTw
                                    type="button"
                                    size="sm"
                                    variant="outline.gray"
                                    className="w-full font-bold"
                                    onClick={() =>
                                      setActiveWeekendShiftId(null)
                                    }
                                  >
                                    Close
                                  </ButtonTw>
                                </div>
                              </form>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(shift)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <ButtonTw
                            size="sm"
                            variant="red"
                            onClick={() => handleDelete(shift.id)}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </ButtonTw>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </ModalTw>
    </>
  );
}
