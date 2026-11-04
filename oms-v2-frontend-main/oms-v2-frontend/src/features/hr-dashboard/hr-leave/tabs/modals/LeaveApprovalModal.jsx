"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { useForm } from "react-hook-form";
import { useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import { ModalTw } from "@/components/common/ModalTw";
import SelectSearch from "@/components/ui/SelectSearch";
import Input from "@/components/ui/Input";
import ButtonTw from "@/components/ui/ButtonTw";

const isRejectedStatus = (statusId, statusOptions) => {
  const selected = (statusOptions || []).find(
    (option) => Number(option.value ?? option.id) === Number(statusId),
  );
  return (
    selected?.code === "leave_request_approval_rejected" ||
    Number(statusId) === 53
  );
};

const statusSchema = z
  .object({
    approvalStatusId: z.coerce.number().min(1, "Status is required"),
    reason: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const options = statusSchema.statusOptions || [];
    if (isRejectedStatus(values.approvalStatusId, options)) {
      if (!String(values.reason || "").trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reason"],
          message: "Rejection reason is required",
        });
      }
    }
  });

export default function LeaveApprovalModal({
  show,
  onClose,
  onSubmit,
  statusOptions = [],
  isLoading,
}) {
  const optionsRef = useRef(statusOptions);
  optionsRef.current = statusOptions;
  statusSchema.statusOptions = statusOptions;

  const { control, handleSubmit, reset, watch } = useForm({
    resolver: zodResolver(statusSchema),
    defaultValues: { approvalStatusId: "", reason: "" },
  });

  const selectedStatusId = watch("approvalStatusId");
  const rejected = isRejectedStatus(selectedStatusId, optionsRef.current);

  const handleFormSubmit = async (values) => {
    await onSubmit({
      ...values,
      reason: String(values.reason || "").trim(),
    });
    reset();
    onClose();
  };

  return (
    <ModalTw
      show={show}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Update Status"
      size="lg"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-2 gap-x-4">
          <Controller
            name="approvalStatusId"
            control={control}
            render={({ field, fieldState }) => (
              <SelectSearch
                label="Leave Status"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                options={statusOptions}
                className="col-span-2"
                placeholder="Select Leave Status"
                required
              />
            )}
          />
          <Controller
            name="reason"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                label={rejected ? "Rejection reason" : "Reason"}
                placeholder={
                  rejected
                    ? "Why is this leave rejected?"
                    : "Enter reason here..."
                }
                type="textarea"
                className="col-span-2"
                required={rejected}
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />
          <div className="col-span-2 flex gap-4 mt-4">
            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              className="w-full font-bold"
              disabled={isLoading}
              loading={isLoading}
            >
              Submit
            </ButtonTw>
            <ButtonTw
              size="sm"
              variant="outline.gray"
              className="w-full font-bold"
              onClick={() => reset()}
            >
              Reset
            </ButtonTw>
          </div>
        </div>
      </form>
    </ModalTw>
  );
}
