import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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

const AddProfileContactInfoModal = ({ showModal = false, onClose }) => {
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
      ?.find((s) => s.code === "proficiencies")
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
    mobilePersonal: z.string().optional(),
    mobileWork: z.string().optional(),
    telephone: z.string().optional(),
    emailPersonal: z.string().email().optional(),
    emailOfficial: z.string().email().optional(),
    emergencyContactPerson: z.string().optional(),
    emergencyContactNumber: z.string().optional(),
    presentAddress: z.string().optional(),
    permanentAddress: z.string().optional(),
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
      mobilePersonal: "",
      mobileWork: "",
      telephone: "",
      emailPersonal: "",
      emailOfficial: "",
      emergencyContactPerson: "",
      emergencyContactNumber: "",
      presentAddress: "",
      permanentAddress: "",
    },
    mode: "onChange",
  });

  // Add this effect:
  useEffect(() => {
    if (user) {
      reset({
        mobilePersonal: user?.userContactInfos?.mobilePersonal,
        mobileWork: user?.userContactInfos?.mobileWork,
        telephone: user?.userContactInfos?.telephone,
        emailPersonal: user?.userContactInfos?.emailPersonal,
        emailOfficial: user?.userContactInfos?.emailOfficial,
        emergencyContactPerson: user?.userContactInfos?.emergencyContactPerson,
        emergencyContactNumber: user?.userContactInfos?.emergencyContactNumber,
        presentAddress: user?.userContactInfos?.presentAddress,
        permanentAddress: user?.userContactInfos?.permanentAddress,
      });
    }
  }, [user, reset]);

  // Handle form submit
  const submitForm = async (values) => {
    // console.log('values', values)
    setLoading(true);
    try {
      await RestApi.patch(
        `api/v1/users/update-contact-information/${user?.id}`,
        values,
      );
      setInternalShowModal(false);
      await getAuthUserInfo(setLoading);

      handleClose();

      toaster("Contact information updated successfully", "success");
      // reset();
      // router.push("/main-dashboard");
    } catch (error) {
      helpers.handleApiValidationError(error, setError);
    } finally {
      setLoading(false);
    }
  };

  // const [dateOfBirth, setDateOfBirth] = useState("");

  //   useEffect(() => {
  //     setValue("dateOfBirth", dateOfBirth);
  //   }, [dateOfBirth, setValue]);

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title="Contact Information"
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
                  name="mobilePersonal"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Mobile Number Personal"
                      placeholder="Enter your Mobile Number Personal"
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
                  name="mobileWork"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Mobile Number Work"
                      placeholder="Enter your Mobile Number Work"
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
                  name="telephone"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Telephone"
                      placeholder="Enter your Telephone"
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
                  name="emailPersonal"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Email Personal"
                      placeholder="Enter your Email Personal"
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
                  name="emailOfficial"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Email Official"
                      placeholder="Enter your Email Official"
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
                  name="emergencyContactPerson"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Emergency Contact Person"
                      placeholder="Enter your Emergency Contact Person"
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
                  name="emergencyContactNumber"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Emergency Contact Number"
                      placeholder="Enter your Emergency Contact Number"
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
                  name="presentAddress"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Present Address"
                      placeholder="Enter your Present Address"
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
                  name="permanentAddress"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Permanent Address"
                      placeholder="Enter your Permanent Address"
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

export default AddProfileContactInfoModal;
