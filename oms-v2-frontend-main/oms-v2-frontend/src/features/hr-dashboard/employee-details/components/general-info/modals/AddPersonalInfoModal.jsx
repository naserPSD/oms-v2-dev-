import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import Input from "@/components/ui/Input";

import ButtonTw from "@/components/ui/ButtonTw copy";

import { useCommonStore } from "@/store/useCommonStore";
import SelectSearch from "@/components/ui/SelectSearch";

import "react-image-crop/dist/ReactCrop.css";

import RadioGroup from "@/components/ui/RadioGroup";
//import { useAuthStore } from "@/store/useAuthStore";
//import { getAuthUserInfo } from "@/utils/commonApiFunction";
import DatePicker from "@/components/ui/DatePicker";
import { useEmployeeProfileQueryApi } from "@/hooks/queryApi/useEmployeeProfileQueryApi";

const initialValues = {
  firstName: "",
  lastName: "",
  fathersName: "",
  mothersName: "",
  nidNumber: "",
  passportNumber: "",
  dateOfBirth: "",
  gender: "",
  countryId: null,
  bloodGroupId: null,
  maritalStatusId: null,
  religionId: null,
  languageTable: [
    {
      languageId: null,
      speakingLevelId: null,
      readingLevelId: null,
      writingLevelId: null,
    },
  ],
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
  countryId: z.preprocess((val) => {
    // if empty string, undefined, or null → return null
    if (val === "" || val === undefined || val === null) return null;
    return Number(val); // otherwise convert to number
  }, z.number().nullable()), // allow null
  bloodGroupId: z.coerce.string().optional(),
  maritalStatusId: z.coerce.string().optional(),
  religionId: z.coerce.string().optional(),
  languageTable: z
    .array(
      z.object({
        languageId: z.coerce.string().min(1, "Language is required"),
        speakingLevelId: z.coerce.string().min(1, "Speaking level is required"),
        readingLevelId: z.coerce.string().min(1, "Reading level is required"),
        writingLevelId: z.coerce.string().min(1, "Writing level is required"),
      }),
    )
    .min(1, "At least one language proficiency is required"),
});

const AddPersonalInfoModal = ({
  showModal = false,
  onClose,
  id,
  employeeDetails,
  setOpenModalName,
}) => {
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

  // const initialSetupTypeList = useCommonStore(
  //   (state) => state.initialSetupTypeList,
  // );

  // const [showModal, setInternalShowModal] = useState(false);
  //const [internalShowModal, setInternalShowModal] = useState(showModal);
  // const [isLoading, setLoading] = useState(false);

  // Handle modal close
  const handleClose = () => {
    if (onClose) onClose(); // Call parent's onClose
    reset(initialValues);
  };

  const { handleSubmit, setError, control, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "languageTable",
  });

  // Add this effect:
  // Update useEffect to run whenever modal opens or employeeDetails changes
  // useEffect(() => {
  //   if (showModal && employeeDetails?.personalInformation) {
  //     // When modal is open and we have data, populate the form
  //     const personalInfo = employeeDetails.personalInformation;

  //     reset({
  //       firstName: personalInfo.firstName || "",
  //       lastName: personalInfo.lastName || "",
  //       fathersName: personalInfo.fathersName || "",
  //       mothersName: personalInfo.mothersName || "",
  //       nidNumber: personalInfo.nidNumber || "",
  //       passportNumber: personalInfo.passportNumber || "",
  //       dateOfBirth: personalInfo.dateOfBirth || "",
  //       gender: personalInfo.gender || "",
  //       countryId: personalInfo.countryId || "",
  //       bloodGroupId: personalInfo.bloodGroupId || "",
  //       maritalStatusId: personalInfo.maritalStatusId || "",
  //       religionId: personalInfo.religionId || "",
  //       languageTable:
  //         employeeDetails.languageTable?.length > 0
  //           ? employeeDetails.languageTable
  //           : [
  //               {
  //                 languageId: "",
  //                 speakingLevelId: "",
  //                 readingLevelId: "",
  //                 writingLevelId: "",
  //               },
  //             ],
  //     });
  //   } else if (!showModal) {
  //     // When modal closes, reset to initial values
  //     reset(initialValues);
  //   }
  // }, [
  //   showModal,
  //   employeeDetails?.personalInformation,
  //   reset,
  //   employeeDetails.languageTable,
  // ]);

  useEffect(() => {
    if (showModal && employeeDetails?.personalInformation) {
      const personalInfo = employeeDetails.personalInformation;

      const languages =
        employeeDetails.languageTable?.length > 0
          ? employeeDetails.languageTable.map((l) => ({
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
        firstName: personalInfo.firstName || "",
        lastName: personalInfo.lastName || "",
        fathersName: personalInfo.fathersName || "",
        mothersName: personalInfo.mothersName || "",
        nidNumber: personalInfo.nidNumber || "",
        passportNumber: personalInfo.passportNumber || "",
        dateOfBirth: personalInfo.dateOfBirth || "",
        gender: personalInfo.gender || "",
        countryId: personalInfo.countryId || null,
        bloodGroupId: personalInfo.bloodGroupId || "",
        maritalStatusId: personalInfo.maritalStatusId || "",
        religionId: personalInfo.religionId || "",
        languageTable: languages,
      });

      replace(languages);
    } else if (!showModal) {
      reset(initialValues);
      replace(initialValues.languageTable);
    }
  }, [
    showModal,
    employeeDetails?.personalInformation,
    employeeDetails?.languageTable,
    reset,
    replace,
  ]);

  //const dateOfBirth = watch("dateOfBirth");

  // console.log("dateOfBirth", helpers.dDate(dateOfBirth));

  // 🧠 ---------- API HOOKS ----------
  const { updateEmployeeDetailsMutation } = useEmployeeProfileQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal: setOpenModalName,
  });

  const submitForm = async (values) => {
    try {
      // Don't combine id with values - keep them separate
      await updateEmployeeDetailsMutation.mutateAsync({
        id: id,
        payload: {
          personalInformation: values,
          languageTable: values.languageTable,
        }, // Pass values as payload
      });
    } catch (error) {
      console.error("Error submitting task board:", error);
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
                              name={`languageTable.${index}.languageId`}
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
                                name={`languageTable.${index}.speakingLevelId`}
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
                                name={`languageTable.${index}.readingLevelId`}
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
                                name={`languageTable.${index}.writingLevelId`}
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
              <div className="flex gap-x-4">
                {" "}
                <ButtonTw
                  type="submit"
                  size="sm"
                  variant="default"
                  className="w-full font-bold mt-4 col-span-12"
                  disabled={updateEmployeeDetailsMutation?.isLoading}
                  loading={updateEmployeeDetailsMutation?.isLoading}
                >
                  Submit
                </ButtonTw>
                <ButtonTw
                  size="sm"
                  variant="outline.gray"
                  className="w-full font-bold mt-4 col-span-12"
                  onClick={() => reset()}
                >
                  Reset
                </ButtonTw>
              </div>
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default AddPersonalInfoModal;
