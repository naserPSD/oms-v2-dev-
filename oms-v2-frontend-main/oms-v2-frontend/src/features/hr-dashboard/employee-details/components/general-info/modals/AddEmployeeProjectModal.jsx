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
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
const initialValues = {
  id: "",
  projectName: "",
  projectUrl: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
  usedTechnologies: "",
};
const AddEmployeeProjectModal = ({
  editItem,
  showModal = false,
  onClose,
  employeeId,
}) => {
  // Handle modal close
  const handleClose = () => {
    if (onClose) onClose(); // Call parent's onClose
    reset(initialValues);
  };

  // Zod schema with conditional validation
  const schema = z
    .object({
      id: z.coerce.number().optional(),
      projectName: z.string().min(1, "Project Name is required"),
      projectUrl: z
        .union([
          z.string().url().nullable(), // Either a valid URL
          z.literal(""), // Or an empty string
          z.literal(null), // Or null
        ])
        .optional()
        .transform((e) => (e === "" ? null : e)), // Convert empty string to null
      description: z.string().nullable().optional(),
      startDate: z.string().nullable().optional(),
      isCurrent: z.boolean().default(false).optional(),
      endDate: z.string().nullable().optional(),
      usedTechnologies: z.string().nullable().optional(),
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

  const { addOrUpdateProjectMutationWithEmployeeId } = useHrQueryApi({
    reset,
    setError,
    handleClose,
  });

  const submitForm = async (values) => {
    const payload = { ...values };

    await addOrUpdateProjectMutationWithEmployeeId.mutateAsync({
      payload,
      employee_id: employeeId, // path param
    });
  };

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

  // Handle form submit
  //   const submitForm = async (values) => {
  //     // console.log('values', values)
  //     setLoading(true);
  //     try {
  //       const payload = values.id
  //         ? values
  //         : delete values.id && {
  //             ...values,
  //           };
  //       // console.log('payload', payload)
  //       await RestApi.post(`api/v1/users/add-or-update-project/{employeeId}`, payload);
  //       setInternalShowModal(false);
  //       reset(initialValues);
  //       await getAuthUserInfo(setLoading);

  //       handleClose();
  //       toaster(
  //         `Project ${editItem ? "updated" : "added"} successfully`,
  //         "success",
  //       );
  //     } catch (error) {
  //       helpers.handleApiValidationError(error, setError);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

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
        title={`${editItem ? "Edit" : "Add"} Project`}
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
                  name="projectName"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Project Name"
                      placeholder="Enter Project Name"
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
                  name="projectUrl"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Project URL"
                      placeholder="Enter Project URL"
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
                      label="Project description"
                      placeholder="Enter Project description"
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
                  name="usedTechnologies"
                  render={({ field, fieldState }) => (
                    <Input
                      type="textarea"
                      label="Used Technologies"
                      placeholder="Enter Used Technologies"
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
                disabled={addOrUpdateProjectMutationWithEmployeeId?.isLoading}
                loading={addOrUpdateProjectMutationWithEmployeeId?.isLoading}
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

export default AddEmployeeProjectModal;
