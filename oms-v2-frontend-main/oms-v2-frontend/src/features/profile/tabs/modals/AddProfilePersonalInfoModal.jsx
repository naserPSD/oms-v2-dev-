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

const AddProfilePersonalInfoModal = ({ showModal = false, onClose }) => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const citizenshipList = dropdowns.countryList?.map((c) => ({
    value: c.id,
    label: c.citizenship,
  }));
  const languageList = [
    ...new Map(
      dropdowns.countryList
        ?.filter((c) => c.language)
        .map((c) => [c.language, { value: c.id, label: c.language }]),
    ).values(),
  ];

  const bloodGroupList =
    dropdowns.statusGroupList
      ?.find((s) => s.code === "blood_groups")
      ?.statuses?.map((c) => ({
        value: c.id,
        label: c.name,
        code: c.code,
      })) ?? [];

  const maritalStatusList =
    dropdowns.statusGroupList
      ?.find((s) => s.code === "marital_statuses")
      ?.statuses?.map((c) => ({
        value: c.id,
        label: c.name,
        code: c.code,
      })) ?? [];

  const religionList =
    dropdowns.statusGroupList
      ?.find((s) => s.code === "religions")
      ?.statuses?.map((c) => ({
        value: c.id,
        label: c.name,
        code: c.code,
      })) ?? [];

  const proficiencyList =
    dropdowns.statusGroupList
      ?.find((s) => s.code === "proficiency_levels")
      ?.statuses?.map((c) => ({
        value: c.id,
        label: c.name,
        code: c.code,
      })) ?? [];

  const initialSetupTypeList = useCommonStore(
    (state) => state.initialSetupTypeList,
  );

  // const [showModal, setInternalShowModal] = useState(false);
  const [internalShowModal, setInternalShowModal] = useState(showModal);
  const [isLoading, setLoading] = useState(false);

  // Handle modal close
  const handleClose = () => {
    if (onClose) onClose(); // Call parent's onClose
  };

  // Zod schema with conditional validation
  const schema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    fathersName: z.string().optional(),
    mothersName: z.string().optional(),
    nidNumber: z.string().optional(),
    passportNumber: z.string().optional(),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.string().min(1, "Gender is required"),
    countryId: z.coerce.number({
      required_error: "Nationality is required",
      invalid_type_error: "Nationality must be a number",
    }),
    bloodGroupId: z.coerce.string().optional(),
    maritalStatusId: z.coerce.string().optional(),
    religionId: z.coerce.string().optional(),
    userLanguageProficiencies: z
      .array(
        z.object({
          languageId: z.coerce.string().min(1, "Language is required"),
          speakingLevelId: z.coerce
            .string()
            .min(1, "Speaking level is required"),
          readingLevelId: z.coerce.string().min(1, "Reading level is required"),
          writingLevelId: z.coerce.string().min(1, "Writing level is required"),
        }),
      )
      .min(1, "At least one language proficiency is required"),
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
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      fathersName: user?.profile?.fathersName || "",
      mothersName: user?.profile?.mothersName || "",
      nidNumber: user?.profile?.nidNumber || "",
      passportNumber: user?.profile?.passportNumber || "",
      dateOfBirth: user?.profile?.dateOfBirth || "",
      gender: user?.profile?.gender || "",
      countryId: user?.profile?.countryId || "",
      bloodGroupId: user?.profile?.bloodGroupId || "",
      maritalStatusId: user?.profile?.maritalStatusId || "",
      religionId: user?.profile?.religionId || "",
      userLanguageProficiencies: user?.userLanguageProficiencies || [
        {
          languageId: "",
          speakingLevelId: "",
          readingLevelId: "",
          writingLevelId: "",
        },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "userLanguageProficiencies",
  });

  // Sync form when modal opens or user updates
  useEffect(() => {
    if (showModal && user) {
      const languages =
        (user?.userLanguageProficiencies || user?.languageProficiencies)?.length > 0
          ? (user?.userLanguageProficiencies || user?.languageProficiencies).map((l) => ({
              languageId: l.languageId ?? "",
              speakingLevelId: l.speakingLevelId ?? "",
              readingLevelId: l.readingLevelId ?? "",
              writingLevelId: l.writingLevelId ?? "",
            }))
          : [
              {
                languageId: "",
                speakingLevelId: "",
                readingLevelId: "",
                writingLevelId: "",
              },
            ];

      reset({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        fathersName: user?.profile?.fathersName || "",
        mothersName: user?.profile?.mothersName || "",
        nidNumber: user?.profile?.nidNumber || "",
        passportNumber: user?.profile?.passportNumber || "",
        dateOfBirth: user?.profile?.dateOfBirth
          ? String(user.profile.dateOfBirth).split("T")[0]
          : "",
        gender: user?.profile?.gender || "",
        countryId: user?.profile?.countryId || "",
        bloodGroupId: user?.profile?.bloodGroupId || "",
        maritalStatusId: user?.profile?.maritalStatusId || "",
        religionId: user?.profile?.religionId || "",
        userLanguageProficiencies: languages,
      });

      replace(languages);
    }
  }, [showModal, user, reset, replace]);

  // Handle form submit
  const submitForm = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        countryId: values.countryId ? Number(values.countryId) : null,
        bloodGroupId: values.bloodGroupId ? Number(values.bloodGroupId) : null,
        maritalStatusId: values.maritalStatusId ? Number(values.maritalStatusId) : null,
        religionId: values.religionId ? Number(values.religionId) : null,
        userLanguageProficiencies: (values.userLanguageProficiencies || [])
          .filter((item) => item.languageId)
          .map((item) => ({
            languageId: Number(item.languageId),
            speakingLevelId: Number(item.speakingLevelId),
            readingLevelId: Number(item.readingLevelId),
            writingLevelId: Number(item.writingLevelId),
          })),
      };

      await RestApi.patch(
        `/api/v1/users/update-personal-information/${user?.id}`,
        payload,
      );
      setInternalShowModal(false);
      await getAuthUserInfo(setLoading);

      handleClose();

      toaster("Personal information updated successfully", "success");
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      if (typeof apiMessage === "string") {
        toaster(apiMessage, "error");
      } else {
        helpers.handleApiValidationError(error, setError, "Failed to update personal information", true);
      }
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

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title="Personal Information"
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
                  name="firstName"
                  render={({ field, fieldState }) => (
                    <Input
                      label="First Name"
                      placeholder="Enter your First Name"
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
                  name="lastName"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Last Name"
                      placeholder="Enter your Last Name"
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
                  name="fathersName"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Father's Name"
                      placeholder="Enter your Father's Name"
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
                  name="mothersName"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Mother's Name"
                      placeholder="Enter your Mother's Name"
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
                  name="nidNumber"
                  render={({ field, fieldState }) => (
                    <Input
                      label="NID Number"
                      placeholder="Enter your NID Number"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-4 sm:col-span-12"
                      {...field}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="passportNumber"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Passport Number"
                      placeholder="Enter your Passport Number"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-4 sm:col-span-12"
                      {...field}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="dateOfBirth"
                  render={({ field, fieldState }) => (
                    <DatePicker
                      label="Date of Birth"
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
                  name="countryId"
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label="Nationality"
                      options={citizenshipList}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
                      placeholder="Select Nationality"
                      searchable
                    />
                  )}
                />

                {/* <Controller
                                    control={control}
                                    name="gender"
                                    render={({ field, fieldState }) => (
                                        <SelectSearch
                                            label="Gender"
                                            options={dropdowns.genderList}
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            className="col-span-12 lg:col-span-6 sm:col-span-12"
                                            placeholder="Select Gender"
                                            searchable
                                        />
                                    )}
                                /> */}

                <Controller
                  control={control}
                  name="gender"
                  render={({ field, fieldState }) => (
                    <RadioGroup
                      label="Gender"
                      name={field.name}
                      options={dropdowns.genderList}
                      selectedValue={field.value}
                      activeColor={false}
                      direction="horizontal"
                      variant="card"
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="religionId"
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label="Religion"
                      options={religionList}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-4 sm:col-span-12"
                      placeholder="Select Religion"
                      searchable
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="bloodGroupId"
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label="Blood Group"
                      options={bloodGroupList}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-4 sm:col-span-12"
                      placeholder="Select Blood Group"
                      searchable
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="maritalStatusId"
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label="Marital Status"
                      options={maritalStatusList}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-4 sm:col-span-12"
                      placeholder="Select Marital Status"
                      searchable
                    />
                  )}
                />

                <div className="col-span-12">
                  <div className="flex flex-col space-x-3 border border-dashed rounded pt-7 pb-4 pl-3">
                    {fields.map((field, index) => (
                      <>
                        <div className="flex flex-row">
                          <div className="w-[130px] mt-2.5">
                            <Controller
                              control={control}
                              name={`userLanguageProficiencies.${index}.languageId`}
                              render={({ field, fieldState }) => (
                                <SelectSearch
                                  label="Language"
                                  options={languageList}
                                  value={field.value}
                                  onChange={field.onChange}
                                  error={fieldState.error?.message}
                                  placeholder="Select"
                                  searchable
                                />
                              )}
                            />
                          </div>

                          <div className="relative flex-1 max-w-md mx-auto">
                            <div className="absolute left-0 right-0 -top-6 flex items-center justify-between">
                              {index === 0 && (
                                <div className="relative w-full text-center title-color font-semibold">
                                  <div className="flex justify-center items-center">
                                    <div className="h-6 w-0.5 border border-dashed absolute left-0 top-4"></div>
                                    <span className="background-color mt-[5px] z-10 px-2">
                                      Proficiency
                                    </span>
                                    <div className="h-6 w-0.5 border border-dashed absolute right-0 top-4"></div>
                                  </div>
                                  <div className="absolute top-4 left-0 right-0 border border-dashed"></div>
                                </div>
                              )}
                            </div>

                            <div className="w-full flex flex-row items-center justify-around space-x-2 pl-2 pt-2">
                              <Controller
                                control={control}
                                name={`userLanguageProficiencies.${index}.speakingLevelId`}
                                render={({ field, fieldState }) => (
                                  <SelectSearch
                                    label="Speaking"
                                    options={proficiencyList}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    placeholder="Select"
                                    className="w-1/3"
                                    searchable
                                  />
                                )}
                              />

                              <Controller
                                control={control}
                                name={`userLanguageProficiencies.${index}.readingLevelId`}
                                render={({ field, fieldState }) => (
                                  <SelectSearch
                                    label="Reading"
                                    options={proficiencyList}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    placeholder="Select"
                                    className="w-1/3"
                                    searchable
                                  />
                                )}
                              />

                              <Controller
                                control={control}
                                name={`userLanguageProficiencies.${index}.writingLevelId`}
                                render={({ field, fieldState }) => (
                                  <SelectSearch
                                    label="Writing"
                                    options={proficiencyList}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    placeholder="Select"
                                    className="w-1/3"
                                    searchable
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        {index === fields.length - 1 && (
                          <div className="flex justify-end space-x-2 pr-3">
                            <ButtonTw
                              icon={<i className="fa-solid fa-plus"></i>}
                              iconOnly
                              variant="outline.green"
                              size="sm"
                              onClick={addLanguageProficiency}
                            />

                            {fields.length > 1 && (
                              <ButtonTw
                                icon={<i className="fa-solid fa-minus"></i>}
                                iconOnly
                                variant="outline.red"
                                size="sm"
                                onClick={() => removeLanguageProficiency(index)}
                              />
                            )}
                          </div>
                        )}
                      </>
                    ))}
                  </div>
                </div>
              </div>

              {/* <Controller
                                    control={control}
                                    name="address"
                                    render={({ field, fieldState }) => (
                                        <Input
                                            label="Address"
                                            placeholder="Enter address"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            {...field}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="city"
                                    render={({ field, fieldState }) => (
                                        <Input
                                            label="City"
                                            placeholder="Enter city"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            {...field}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="timezone"
                                    render={({ field, fieldState }) => (
                                        <SelectSearch
                                            label="Timezone"
                                            options={dropdowns.timezoneList?.map(c => ({ value: c.id, label: c.name }))}
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            placeholder="Select timezone"
                                            searchable
                                        />
                                    )}
                                /> */}

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

export default AddProfilePersonalInfoModal;
