// components/StatusChangeModal.jsx
"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import { ModalTw } from "@/components/common/ModalTw";
import SelectSearch from "@/components/ui/SelectSearch";
import Input from "@/components/ui/Input";
import ButtonTw from "@/components/ui/ButtonTw";
import { useMemo, useEffect } from "react";

const createStatusSchema = (statusOptions) =>
  z
    .object({
      statusId: z.coerce.number().min(1, "Status is required"),
      remarks: z.string().optional(),
    })
    .refine(
      (data) => {
        const selected = statusOptions.find(
          (opt) => Number(opt.value ?? opt.id) === Number(data.statusId),
        );
        const isRejected =
          selected?.code === "requisition_status_rejected" ||
          selected?.name?.toLowerCase().includes("reject") ||
          selected?.label?.toLowerCase().includes("reject");

        if (isRejected) {
          return !!data.remarks && data.remarks.trim().length > 0;
        }
        return true;
      },
      {
        message: "Remarks are required when rejecting a requisition.",
        path: ["remarks"],
      },
    );

export default function RequisitionListTabChangeStatusModal({
  show,
  onClose,
  onSubmit,
  statusOptions = [],
  isLoading,
  requisition = null,
}) {
  const schema = useMemo(
    () => createStatusSchema(statusOptions),
    [statusOptions],
  );

  const { control, handleSubmit, reset, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { statusId: "", remarks: "" },
    mode: "onChange",
  });

  // Reset form whenever modal is opened
  useEffect(() => {
    if (show) {
      reset({
        statusId: requisition?.statusId ?? requisition?.status?.id ?? "",
        remarks: requisition?.remarks ?? "",
      });
    }
  }, [show, reset, requisition]);

  const selectedStatusId = watch("statusId");
  const selectedStatus = useMemo(
    () =>
      statusOptions.find(
        (opt) => Number(opt.value ?? opt.id) === Number(selectedStatusId),
      ),
    [statusOptions, selectedStatusId],
  );
  const isRejected =
    selectedStatus?.code === "requisition_status_rejected" ||
    selectedStatus?.name?.toLowerCase().includes("reject") ||
    selectedStatus?.label?.toLowerCase().includes("reject");

  const handleFormSubmit = async (values) => {
    try {
      await onSubmit({
        statusId: Number(values.statusId),
        remarks: values.remarks,
      });
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to submit status update:", error);
    }
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
            name="statusId"
            control={control}
            render={({ field, fieldState }) => (
              <SelectSearch
                label="Requisition Status"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                options={statusOptions}
                className="col-span-2"
                placeholder="Select Requisition Status"
              />
            )}
          />
          <Controller
            name="remarks"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                label={isRejected ? "Remarks *" : "Remarks"}
                placeholder={
                  isRejected
                    ? "Enter reason for rejection (required)..."
                    : "Enter remarks here..."
                }
                type="textarea"
                className="col-span-2"
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
