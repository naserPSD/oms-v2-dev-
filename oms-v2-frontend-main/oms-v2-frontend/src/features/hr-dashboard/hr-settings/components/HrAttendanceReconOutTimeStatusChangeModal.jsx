// components/HrAttendanceReconOutTimeStatusChangeModal.jsx
"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import { ModalTw } from "@/components/common/ModalTw";
import SelectSearch from "@/components/ui/SelectSearch";
import Input from "@/components/ui/Input";
import ButtonTw from "@/components/ui/ButtonTw";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import helpers from "@/utils/helpers";
import { useEffect } from "react";

// Schema for form validation
const checkOutSchema = z.object({
  outTimeStatusId: z.coerce.number().min(1, "Status is required"),
  outTimeSupervisorRemarks: z.string().optional(),
});

const HrAttendanceReconOutTimeStatusChangeModal = ({
  show,
  onClose,
  data,
  statusOptions = [],
  isLoading = false,
}) => {
  const { toggleCheckOutReconciliationStatus } = useHrQueryApi({});

  const { control, handleSubmit, reset, watch } = useForm({
    resolver: zodResolver(checkOutSchema),
    defaultValues: {
      outTimeStatusId: data?.outTimeStatusId || "",
      outTimeSupervisorRemarks: data?.outTimeSupervisorRemarks || "",
    },
  });

  // Reset form when data changes
  useEffect(() => {
    if (data) {
      reset({
        outTimeStatusId: data?.outTimeStatusId || "",
        outTimeSupervisorRemarks: data?.outTimeSupervisorRemarks || "",
      });
    }
  }, [data, reset]);

  const handleFormSubmit = async (values) => {
    try {
      const payload = {
        id: data.id, // reconciliation ID
        data: {
          outTimeStatusId: values.outTimeStatusId,
          outTimeSupervisorRemarks: values.outTimeSupervisorRemarks || "",
        },
      };

      await toggleCheckOutReconciliationStatus.mutateAsync(payload);
      reset();
      onClose();
    } catch (error) {
      console.error("Error updating check-out status:", error);
    }
  };

  const selectedStatus = watch("outTimeStatusId");
  const currentStatus = statusOptions.find(
    (status) => status.value === selectedStatus
  );

  return (
    <ModalTw
      show={show}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Update Check-Out Reconciliation Status"
      size="lg"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      {/* Employee Information */}
      {data?.employee && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
          <h4 className="font-semibold text-sm mb-2">Employee Details</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <p className="font-medium">{data.employee.user?.fullName}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Date:</span>
              <p className="font-medium">{data.attendanceDate}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Check-Out:
              </span>
              <p className="font-medium">
                {data.attendance?.checkOut
                  ? helpers.dTime(data.attendance.checkOut)
                  : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Current Status:
              </span>
              <p className="font-medium">
                {data.outTimeStatus?.name || "Not Set"}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Reason for Request:</span>
              <p className="font-medium">{data.outTimeRemarks}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-2 gap-x-4">
          {/* Status Selection */}
          <Controller
            name="outTimeStatusId"
            control={control}
            render={({ field, fieldState }) => (
              <SelectSearch
                label="Check-Out Status"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                options={statusOptions}
                className="col-span-2"
                placeholder="Select Check-Out Status"
              />
            )}
          />

          {/* Status Preview */}
          {currentStatus && (
            <div
              className={`col-span-2 p-3 rounded-lg border-2 border-${currentStatus.colorName} bg-${currentStatus.colorName} bg-opacity-10`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full bg-${currentStatus.colorName}`}
                ></div>
                <span className="font-medium">{currentStatus.name}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {currentStatus.description ||
                  "Update check-out reconciliation status"}
              </p>
            </div>
          )}

          {/* Remarks */}
          <Controller
            name="outTimeSupervisorRemarks"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                label="Remarks"
                placeholder="Enter remarks here..."
                type="textarea"
                className="col-span-2"
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />

          {/* Current Remarks Preview */}
          {data?.outTimeSupervisorRemarks && (
            <div className="col-span-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
              <span className="font-medium">Current Remarks:</span>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {data.outTimeSupervisorRemarks}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="col-span-2 flex gap-4 mt-4">
            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              className="w-full font-bold"
              disabled={isLoading}
              loading={isLoading}
            >
              Update Status
            </ButtonTw>
            <ButtonTw
              size="sm"
              variant="outline.gray"
              className="w-full font-bold"
              onClick={() => reset()}
              disabled={isLoading}
            >
              Reset
            </ButtonTw>
          </div>
        </div>
      </form>
    </ModalTw>
  );
};

export default HrAttendanceReconOutTimeStatusChangeModal;
