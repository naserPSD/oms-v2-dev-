// components/HrAttendanceReconInTimeStatusChangeModal.jsx
"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import helpers from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BiPlus } from "react-icons/bi";

// Schema for form validation
const checkInSchema = z.object({
  inTimeStatusId: z.coerce.number().min(1, "Status is required"),
  inTimeSupervisorRemarks: z.string().optional(),
});

const HrAttendanceReconInTimeStatusChangeModal = ({
  show,
  onClose,
  data,
  statusOptions = [],
  isLoading = false,
}) => {
  const { toggleCheckInReconciliationStatus } = useHrQueryApi({});

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      inTimeStatusId: data?.inTimeStatusId || "",
      inTimeSupervisorRemarks: data?.inTimeSupervisorRemarks || "",
    },
  });

  // Reset form when data changes
  useEffect(() => {
    if (data) {
      reset({
        inTimeStatusId: data?.inTimeStatusId || "",
        inTimeSupervisorRemarks: data?.inTimeSupervisorRemarks || "",
      });
    }
  }, [data, reset]);

  const handleFormSubmit = async (values) => {
    try {
      const payload = {
        id: data.id, // reconciliation ID
        data: {
          inTimeStatusId: values.inTimeStatusId,
          inTimeSupervisorRemarks: values.inTimeSupervisorRemarks || "",
        },
      };

      await toggleCheckInReconciliationStatus.mutateAsync(payload);
      reset();
      onClose();
    } catch (error) {
      console.error("Error updating check-in status:", error);
    }
  };

  return (
    <ModalTw
      show={show}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Update Check-In Reconciliation Status"
      size="lg"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      {/* Employee Information */}
      {data?.employee ? (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Employee Details</h4>
            {(() => {
              const empId = data.employee.id || data.employee.userId || data.empId;
              return (
                <Link
                  href={empId ? `/hr-dashboard/employee/${empId}` : "#"}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <span>View Employee Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              );
            })()}
          </div>
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
                Check-In:
              </span>
              <p className="font-medium">
                {data.attendance?.checkIn
                  ? helpers.dTime(data.attendance.checkIn)
                  : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Current Status:
              </span>
              <p className="font-medium">
                {data.inTimeStatus?.name || "Not Set"}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Reason for Request:</span>
              <p className="font-medium">{data.inTimeRemarks}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Approved by:</span>
              <p className="font-medium">
                {[data.attendance?.lateApprovalUser?.firstName, data.attendance?.lateApprovalUser?.lastName]
                  .filter(Boolean)
                  .join(" ") || "Pending"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg mb-4 flex items-center justify-between">
          <span className="text-xs text-amber-800 dark:text-amber-200">
            No employee assigned to this record.
          </span>
          <Link
            href="/hr-dashboard/employee?tab=employee-list"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
          >
            <BiPlus className="w-3.5 h-3.5" />
            <span>Add Employee</span>
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-2 gap-x-4">
          {/* Status Selection */}
          <Controller
            name="inTimeStatusId"
            control={control}
            render={({ field, fieldState }) => (
              <SelectSearch
                label="Check-In Status"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                options={statusOptions}
                className="col-span-2"
                placeholder="Select Check-In Status"
              />
            )}
          />

          {/* Remarks */}
          <Controller
            name="inTimeSupervisorRemarks"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                label="Supervisor Remarks"
                placeholder="Enter remarks here..."
                type="textarea"
                className="col-span-2"
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />

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

export default HrAttendanceReconInTimeStatusChangeModal;
