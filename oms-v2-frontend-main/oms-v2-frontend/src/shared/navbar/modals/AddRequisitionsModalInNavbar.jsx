"use client";

import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { zodResolver } from "@/utils/zodResolver";
import { useForm } from "react-hook-form";
import { z } from "zod";

const initialValues = {
  id: 0,
  itemDescription: "",
  quantity: 1,
  estimatedCost: 0,
};
const schema = z.object({
  id: z.coerce.number().optional(),
  itemDescription: z.string().min(1, "Item Description is required"),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be greater than or equal to 1"),
  estimatedCost: z.coerce
    .number()
    .min(1, "Estimated Cost must be greater than or equal to 1"),
});

const AddRequisitionsModalInNavbar = ({ showModal, handleClose }) => {
  const {
    // register,
    // formState: { errors },
    // setValue,
    reset,
    handleSubmit,
    control,
    watch,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const { addOrUpdateRequisitionMutation } = useHrQueryApi({
    reset,
    setError,
    handleClose,
  });
  const submitForm = async (values) => {
    await addOrUpdateRequisitionMutation.mutateAsync(values);
  };

  const isLoading = addOrUpdateRequisitionMutation.isLoading;
  return (
    <div>
      {" "}
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Requisition`}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-2 gap-x-4 ">
            <Controller
              control={control}
              name="itemDescription"
              render={({ field, fieldState }) => (
                <Input
                  label="Requisition"
                  placeholder="Enter Requisition Here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-2"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="quantity"
              render={({ field, fieldState }) => (
                <Input
                  label="Quantity"
                  placeholder="Enter Quantity Here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className=""
                  type="number"
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name="estimatedCost"
              render={({ field, fieldState }) => (
                <Input
                  label="Estimated Cost"
                  placeholder="Enter Estimated Cost Here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className=""
                  type="number"
                  {...field}
                />
              )}
            />

            <div className=" w-full flex justify-center items-center gap-4 col-span-2">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-4 "
                disabled={isLoading}
                loading={isLoading}
              >
                Submit
              </ButtonTw>

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold mt-4 "
                onClick={() => reset()}
              >
                Reset
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default AddRequisitionsModalInNavbar;
