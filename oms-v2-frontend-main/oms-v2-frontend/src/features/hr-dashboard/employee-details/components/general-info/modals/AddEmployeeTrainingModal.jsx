import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import Input from "@/components/ui/Input";

import ButtonTw from "@/components/ui/ButtonTw copy";

import "react-image-crop/dist/ReactCrop.css";

import DatePicker from "@/components/ui/DatePicker";

import SwitchButton from "@/components/ui/SwitchButton";
import { useEmployeeProfileQueryApi } from "@/hooks/queryApi/useEmployeeProfileQueryApi";


  const initialValues = {
    id: "",
    name: "",
    trainingYear: null,
    description: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    address: "",
  };

const AddEmployeeTrainingModal = ({
  editItem,
  showModal = false,
  onClose,
  id,
}) => {
  // Handle modal close
  const handleClose = () => {
    if (onClose) onClose(); // Call parent's onClose
    reset(initialValues)
  };

  // Zod schema with conditional validation
  const schema = z
    .object({
      id: z.coerce.number().optional(),
      name: z.string().min(1, "Training Name is required"),
      trainingYear: z.coerce.number().nullable().default(null).optional(),
      description: z.string().nullable().optional(),
      startDate: z.string().nullable().optional(),
      isCurrent: z.boolean().default(false).optional(),
      endDate: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
    })
    .superRefine((data, ctx) => {
      // if (!data.isCurrent && (!data.endDate || data.endDate === "")) {
      //     ctx.addIssue({
      //         code: z.ZodIssueCode.custom,
      //         message: "End Date is required if not currently working",
      //         path: ["endDate"],
      //     });
      // }
    });


  const {
    handleSubmit,
    setError,
    setValue,
    control,

    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Add this effect:
  useEffect(() => {
    if (editItem) {
      reset({
        ...editItem,
      });
    } else {
      reset(initialValues);
    }
  }, [editItem, reset]);

  const { addOrUpdateTrainingMutationWithEmployeeId } =
    useEmployeeProfileQueryApi({
      reset,
      setError,
      handleClose,
    });

  const submitForm = async (values) => {
    const payload = { ...values };

    await addOrUpdateTrainingMutationWithEmployeeId.mutateAsync({
      payload,
      employee_id: id,
    });
  };

  const isCurrent = watch("isCurrent");

  useEffect(() => {
    if (isCurrent) {
      setValue("endDate", ""); // Set to empty string when current job
    }
  }, [isCurrent, setValue]);

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${editItem ? "Edit" : "Add"} Training`}
        size="2xl"
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
          {/* <h2 className="card-title font-bold mb-2">Basic Information</h2> */}
          {/* <p className="text-gray-500 mb-4">Please fill in your details to get started</p> */}
          <div className="flex flex-row gap-[80px]">
            <div className="container">
              <div className="grid grid-cols-12 gap-x-4">
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Training Name"
                      placeholder="Enter Training Name"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
                      {...field}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="trainingYear"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Training Year"
                      placeholder="Enter Training Year"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
                      {...field}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="startDate"
                  render={({ field, fieldState }) => (
                    <DatePicker
                      label="Start Date"
                      options={{
                        dateFormat: "d-m-Y",
                        maxDate: "today",
                      }}
                      {...field}
                      className="col-span-12 lg:col-span-4 sm:col-span-12"
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="isCurrent"
                  render={({ field, fieldState }) => (
                    <SwitchButton
                      enabled={field.value}
                      onChange={field.onChange}
                      label="Currently Working"
                      className="col-span-12 lg:col-span-4 sm:col-span-12"
                      error={fieldState.error?.message}
                      enabledText="Yes"
                      disabledText="No"
                    />
                  )}
                />

                {!isCurrent && (
                  <Controller
                    control={control}
                    name="endDate"
                    render={({ field, fieldState }) => (
                      <DatePicker
                        label="End Date"
                        options={{
                          dateFormat: "d-m-Y",
                          maxDate: "today",
                        }}
                        {...field}
                        className="col-span-12 lg:col-span-4 sm:col-span-12"
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                )}

                <Controller
                  control={control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <Input
                      type="textarea"
                      label="Training description"
                      placeholder="Enter Training Description"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-12 sm:col-span-12"
                      {...field}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="address"
                  render={({ field, fieldState }) => (
                    <Input
                      type="text"
                      label="Address"
                      placeholder="Enter Address of Training Venue"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-12 sm:col-span-12"
                      {...field}
                    />
                  )}
                />
              </div>

              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold"
                disabled={addOrUpdateTrainingMutationWithEmployeeId?.isLoading}
                loading={addOrUpdateTrainingMutationWithEmployeeId?.isLoading}
              >
                Submit
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default AddEmployeeTrainingModal;
