import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import Input from "@/components/ui/Input";
import ButtonTw from "@/components/ui/ButtonTw copy";
import { useCommonStore } from "@/store/useCommonStore";
import SelectSearch from "@/components/ui/SelectSearch";
import "react-image-crop/dist/ReactCrop.css";
import SwitchButton from "@/components/ui/SwitchButton";
import { useEmployeeProfileQueryApi } from "@/hooks/queryApi/useEmployeeProfileQueryApi";

const AddEmployeeEducationModal = ({
  editItem,
  showModal = false,
  onClose,
  id = { id },
}) => {
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const countryList =
    dropdowns.countryList?.map((c) => ({ value: c.id, label: c.name })) || [];

  const educationLevelList =
    dropdowns.statusGroupList?.find((s) => s.code === "education_level")
      ?.statuses ?? [];
  // const educationLevelList = dropdowns.statusGroupList?.find(s => s.code === 'education_levels')?.statuses ?? [];
  const educationGroupList =
    dropdowns.statusGroupList?.find((s) => s.code === "education_group")
      ?.statuses ?? [];
  const resultTypeList =
    dropdowns.statusGroupList?.find((s) => s.code === "education_result_types")
      ?.statuses ?? [];

  // Zod schema with conditional validation
  const schema = z.object({
    id: z.coerce.number().optional(),
    educationLevelId: z.coerce.number().min(1, "Education Level is required"),
    groupId: z.coerce.number().default(null).optional(),
    instituteName: z.string().nullable().optional(),
    isForeignInstitute: z.boolean(),
    instituteCountryId: z.coerce.number().optional(),
    duration: z.coerce.number().optional(),
    isCurrent: z.boolean(),
    yearOfPassing: z.coerce.number().optional(),
    resultTypeId: z.coerce.number().optional(),
    result: z.string().optional(),
    serial: z.coerce.number().optional(),
  });

  const initialValues = {
    id: "",

    instituteName: "",
    isForeignInstitute: false,
    instituteCountryId: null,
    educationLevelId: null,
    groupId: null,
    duration: null,
    isCurrent: false,
    yearOfPassing: null,
    resultTypeId: null,
    result: "",
    serial: null,
  };

  // Handle modal close
  const handleClose = () => {
    if (onClose) onClose(); // Call parent's onClose
    reset(initialValues);
  };

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

  const { addOrUpdateEducationListMutationWithEmployeeId } =
    useEmployeeProfileQueryApi({
      reset,
      setError,
      handleClose,
    });

  const submitForm = async (values) => {
    const payload = { ...values };

    await addOrUpdateEducationListMutationWithEmployeeId.mutateAsync({
      payload,
      employee_id: id,
    });
  };

  const isForeignInstitute = watch("isForeignInstitute");
  const isCurrent = watch("isCurrent");

  useEffect(() => {
    if (!isForeignInstitute) {
      setValue("instituteCountryId", "");
    }
  }, [isForeignInstitute, setValue]);

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${editItem ? "Edit" : "Add"} Education`}
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
                  name="educationLevelId"
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label="Educational Level"
                      options={educationLevelList}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
                      placeholder="Select Educational Level"
                      searchable
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="groupId"
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label="Educational Group"
                      options={educationGroupList}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
                      placeholder="Select Educational Group"
                      searchable
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="instituteName"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Institute Name"
                      placeholder="Enter Your Institute Name"
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
                  name="isForeignInstitute"
                  render={({ field, fieldState }) => (
                    <SwitchButton
                      enabled={field.value}
                      onChange={field.onChange}
                      label="Is Foreign Institute?"
                      className="col-span-12 lg:col-span-4 sm:col-span-12"
                      error={fieldState.error?.message}
                      enabledText="Yes"
                      disabledText="No"
                    />
                  )}
                />

                {isForeignInstitute && (
                  <Controller
                    control={control}
                    name="instituteCountryId"
                    render={({ field, fieldState }) => (
                      <SelectSearch
                        label="Institute Country"
                        options={countryList}
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        className="col-span-12 lg:col-span-6 sm:col-span-12"
                        placeholder="Select Institute Country"
                        searchable
                      />
                    )}
                  />
                )}

                <Controller
                  control={control}
                  name="duration"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Duration (in years)"
                      placeholder="Enter Your Duration"
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
                  name="isCurrent"
                  render={({ field, fieldState }) => (
                    <SwitchButton
                      label="Is Current Education?"
                      enabled={field.value}
                      onChange={field.onChange}
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
                    name="yearOfPassing"
                    render={({ field, fieldState }) => (
                      <Input
                        label="Year of Passing"
                        placeholder="Enter Your Year of Passing"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        className="col-span-12 lg:col-span-6 sm:col-span-12"
                        {...field}
                      />
                    )}
                  />
                )}

                {!isCurrent && (
                  <Controller
                    control={control}
                    name="resultTypeId"
                    render={({ field, fieldState }) => (
                      <SelectSearch
                        label="Result Type"
                        placeholder="Select Result Type"
                        options={resultTypeList}
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        className="col-span-12 lg:col-span-6 sm:col-span-12"
                        searchable
                      />
                    )}
                  />
                )}

                {!isCurrent && (
                  <Controller
                    control={control}
                    name="result"
                    render={({ field, fieldState }) => (
                      <Input
                        label="Result"
                        placeholder="Enter Your Result"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        className="col-span-12 lg:col-span-6 sm:col-span-12"
                        {...field}
                      />
                    )}
                  />
                )}

                <Controller
                  control={control}
                  name="serial"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Serial"
                      placeholder="Enter Your serial"
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
                disabled={
                  addOrUpdateEducationListMutationWithEmployeeId?.isLoading
                }
                loading={
                  addOrUpdateEducationListMutationWithEmployeeId?.isLoading
                }
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

export default AddEmployeeEducationModal;
