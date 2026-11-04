import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import Input from "@/components/ui/Input";

import ButtonTw from "@/components/ui/ButtonTw copy";

import "react-image-crop/dist/ReactCrop.css";

import { useEmployeeProfileQueryApi } from "@/hooks/queryApi/useEmployeeProfileQueryApi";

// Zod schema with conditional validation
const schema = z.object({
  mobileNumberPersonal: z.string().optional(),
  mobileWork: z.string().optional(),
  telephone: z.string().optional(),
  emailPersonal: z.string().email().optional(),
  emailOfficial: z.string().email().optional(),
  emergencyContactPerson: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
});

const initialValues = {
  mobileNumberPersonal: "",
  mobileWork: "",
  telephone: "",
  emailPersonal: "",
  emailOfficial: "",
  emergencyContactPerson: "",
  emergencyContactNumber: "",
  presentAddress: "",
  permanentAddress: "",
};

const AddContactInfoModal = ({
  showModal = false,
  onClose,
  id,
  setOpenModalName,
  employeeDetails,
}) => {
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

  // Add this effect:
  // Update useEffect to run whenever modal opens or employeeDetails changes
  useEffect(() => {
    if (showModal && employeeDetails?.contactInformation) {
      // When modal is open and we have data, populate the form
      const personalInfo = employeeDetails.contactInformation;

      reset({
        mobileNumberPersonal: personalInfo?.mobileNumberPersonal,
        mobileWork: personalInfo?.mobileWork,
        telephone: personalInfo?.telephone,
        emailPersonal: personalInfo?.emailPersonal,
        emailOfficial: personalInfo?.emailOfficial,
        emergencyContactPerson: personalInfo?.emergencyContactPerson,
        emergencyContactNumber: personalInfo?.emergencyContactNumber,
        presentAddress: personalInfo?.presentAddress,
        permanentAddress: personalInfo?.permanentAddress,
      });
    } else if (!showModal) {
      // When modal closes, reset to initial values
      reset(initialValues);
    }
  }, [showModal, employeeDetails?.contactInformation, reset]);

  // 🧠 ---------- API HOOKS ----------
  const { updateEmployeeDetailsMutation } = useEmployeeProfileQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal: setOpenModalName,
  });

  const submitForm = async (values) => {
    try {
      await updateEmployeeDetailsMutation.mutateAsync({
        id: id,
        payload: {
          contactInformation: values
        },
      });
    } catch (error) {
      console.error("Error submitting task board:", error);
    }
  };

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
                  name="mobileNumberPersonal"
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

export default AddContactInfoModal;
