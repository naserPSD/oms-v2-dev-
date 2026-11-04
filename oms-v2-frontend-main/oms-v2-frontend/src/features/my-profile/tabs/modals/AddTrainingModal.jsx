import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import React, { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import Input from "@/components/ui/Input";
import RestApi from "@/utils/RestApi";
import helpers, { toaster } from "@/utils/helpers";
import { useTranslation } from "next-i18next";
import ButtonTw from "@/components/ui/ButtonTw copy";
import FileUpload from "@/components/ui/FileUpload";
import { useCommonStore } from "@/store/useCommonStore";
import SelectSearch from "@/components/ui/SelectSearch";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Image from "next/image";
import { RadioButton } from "@/components/ui/RadioButton";
import AvatarUpload from "@/components/ui/AvatarUpload";
import RadioGroup from "@/components/ui/RadioGroup";
import { useAuthStore } from "@/store/useAuthStore";
import { getAuthUserInfo } from "@/utils/commonApiFunction";
import DatePicker from "@/components/ui/DatePicker";
import { parseISO, isValid } from "date-fns";
import SwitchButton from "@/components/ui/SwitchButton";
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

const AddTrainingModal = ({ editItem, showModal = false, onClose }) => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const dropdowns = useCommonStore((state) => state.dropdowns);

  // const [showModal, setInternalShowModal] = useState(false);
  const [internalShowModal, setInternalShowModal] = useState(showModal);
  const [isLoading, setLoading] = useState(false);

  // Handle modal close
  const handleClose = () => {
    if (onClose) onClose();
    reset(initialValues); // Call parent's onClose
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
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
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

  // Handle form submit
  const submitForm = async (values) => {
    // console.log('values', values)
    setLoading(true);
    try {
      await RestApi.post(`/api/v1/users/add-or-update-training`, values);
      setInternalShowModal(false);
      reset(initialValues);
      await getAuthUserInfo(setLoading);

      handleClose();
      toaster(
        `Training ${editItem ? "updated" : "added"} successfully`,
        "success",
      );
    } catch (error) {
      helpers.handleApiValidationError(error, setError);
    } finally {
      setLoading(false);
    }
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
                disabled={isLoading}
                loading={isLoading}
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

export default AddTrainingModal;
