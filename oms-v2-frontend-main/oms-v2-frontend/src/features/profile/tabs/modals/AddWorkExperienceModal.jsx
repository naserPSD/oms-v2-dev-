import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw copy";
import DatePicker from "@/components/ui/DatePicker";
import Input from "@/components/ui/Input";
import SwitchButton from "@/components/ui/SwitchButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useCommonStore } from "@/store/useCommonStore";
import RestApi from "@/utils/RestApi";
import { getAuthUserInfo } from "@/utils/commonApiFunction";
import helpers, { toaster } from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "react-image-crop/dist/ReactCrop.css";
import { z } from "zod";

const AddWorkExperienceModal = ({ editItem, showModal = false, onClose }) => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const dropdowns = useCommonStore((state) => state.dropdowns);

  // const [showModal, setInternalShowModal] = useState(false);
  const [internalShowModal, setInternalShowModal] = useState(showModal);
  const [isLoading, setLoading] = useState(false);

  // Handle modal close
  const handleClose = () => {
    if (onClose) onClose(); // Call parent's onClose
  };

  // Zod schema with conditional validation
  const schema = z
    .object({
      id: z.coerce.number().optional(),
      companyName: z.string().min(1, "Company Name is required"),
      jobTitle: z.string().min(1, "Designation is required"),
      // jobDuration: z.string().min(1, "Job Duration is required"),
      responsibility: z.string().min(1, "Job Responsibility is required"),
      startDate: z.string().min(1, "Start Date is required"),
      isCurrent: z.boolean().default(false).optional(),
      endDate: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.isCurrent && (!data.endDate || data.endDate === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End Date is required if not currently working",
          path: ["endDate"],
        });
      }
    });

  const initialValues = {
    id: "",
    companyName: "",
    jobTitle: "",
    // jobDuration: '',
    responsibility: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    address: "",
  };

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
    console.log("values", values);
    setLoading(true);
    try {
      await RestApi.post(`/users/add-or-update-work-experience`, values);
      setInternalShowModal(false);
      await getAuthUserInfo(setLoading);

      handleClose();
      toaster(
        `Work Experience ${editItem ? "updated" : "added"} successfully`,
        "success"
      );
    } catch (error) {
      helpers.handleApiValidationError(error, setError);
    } finally {
      setLoading(false);
    }
  };

  const addLanguageProficiency = () => {
    append({
      languageId: "",
      speakingLevelId: "",
      readingLevelId: "",
      writingLevelId: "",
    });
  };

  const removeLanguageProficiency = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const isCurrent = watch("isCurrent");

  useEffect(() => {
    console.log("isCurrent", isCurrent);
    if (isCurrent) {
      setValue("endDate", ""); // Set to empty string when current job
    }
  }, [isCurrent, setValue]);

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${editItem ? "Edit" : "Add"} Work Experience`}
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
                  name="companyName"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Company Name"
                      placeholder="Enter your Company Name"
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
                  name="jobTitle"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Designation"
                      placeholder="Enter your Designation"
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
                  name="responsibility"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Job Responsibility"
                      placeholder="Enter your Job Responsibility"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
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

export default AddWorkExperienceModal;
