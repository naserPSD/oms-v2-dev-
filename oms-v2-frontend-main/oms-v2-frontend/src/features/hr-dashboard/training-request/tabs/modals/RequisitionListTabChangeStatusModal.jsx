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

const statusSchema = z.object({
  statusId: z.coerce.number().min(1, "Status is required"),
  remarks: z.string().optional(),
});

export default function RequisitionListTabChangeStatusModal({
  show,
  onClose,
  onSubmit,
  statusOptions = [],
  isLoading,
}) {
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(statusSchema),
    defaultValues: { statusId: "", remarks: "" },
  });

  const handleFormSubmit = async (values) => {
    await onSubmit(values);
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
            name="statusId"
            control={control}
            render={({ field, fieldState }) => (
              <SelectSearch
                label="Training Status"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                options={statusOptions}
                className="col-span-2"
                placeholder="Select Training Status"
              />
            )}
          />
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <Input
                label="Remarks"
                placeholder="Enter remarks here..."
                type="textarea"
                className="col-span-2"
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
