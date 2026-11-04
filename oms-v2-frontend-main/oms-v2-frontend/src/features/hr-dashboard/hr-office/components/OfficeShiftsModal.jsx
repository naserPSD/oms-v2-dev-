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
  Plus,
  Save,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { z } from "zod";

const shiftSchema = z.object({
  id: z.number().default(0),
  name: z.string().min(1, "Shift name is required"),
  startTime: z.string().min(1, "Start time is required"),
  delayStartTime: z.string().min(1, "Delay start time is required"),
  endTime: z.string().min(1, "End time is required"),
  earlyEndTime: z.string().min(1, "Early end time is required"),
});

export default function OfficeShiftsModal({
  showModal,
  handleClose,
  officeData,
  showAddForm,
  setShowAddForm,
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
    formState: { errors },
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
  // const formatTime = (time) => {
  //   return time.slice(0, 5); // Remove seconds from HH:MM:SS
  // };
  const { data: officeShiftsData, isLoading: getShiftDataLoading } =
    useOfficeShiftsByOfficeIdQuery(officeData?.id || 0);
  const officeShiftsArray = officeShiftsData?.data || [];
  const submitForm = async (values) => {
    console.log(values, "form values");
    try {
      const payload = {
        ...values,
        officeId: officeData?.id,
      };

      await addOrUpdateOfficeShiftMutation.mutateAsync(payload);

      setShowAddForm(false);
      setEditingShift(null);
      reset(initialValues);
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
    [deleteOfficeShiftMutation]
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
    reset(initialValues);
  };

  if (!officeData) return null;

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title={`Office Shifts - ${officeData.name}`}
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
            Manage shifts for this office location
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
                        placeholder="e.g., Morning Shift"
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

                <div className="flex gap-2 pt-4">
                  <ButtonTw type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Shift
                  </ButtonTw>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
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
          ) : !officeShiftsArray || officeShiftsArray.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No shifts found for this office
                </p>
              </CardContent>
            </Card>
          ) : (
            officeShiftsArray.map((shift) => (
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
  );
}
