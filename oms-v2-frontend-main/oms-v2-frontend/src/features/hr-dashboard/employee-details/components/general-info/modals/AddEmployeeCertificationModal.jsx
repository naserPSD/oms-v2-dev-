import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import Input from "@/components/ui/Input";

import ButtonTw from "@/components/ui/ButtonTw copy";
import FileUpload from "@/components/ui/FileUpload";
import "react-image-crop/dist/ReactCrop.css";

import DatePicker from "@/components/ui/DatePicker";
import { parseISO } from "date-fns";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";

const AddEmployeeCertificationModal = ({
  editItem,
  showModal = false,
  onClose,
  employeeId,
}) => {
  // Zod schema with conditional validation
  const schema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, "Certification Name is required"),
    issuingOrganization: z.string().nullable().optional(),
    issueDate: z.string().nullable().optional(),
    expirationDate: z.string().nullable().optional(),
    attachmentFile: z.any().optional(),
  });

  const initialValues = {
    id: null,
    name: "",
    issuingOrganization: "",
    issueDate: null,
    expirationDate: null,
    attachmentFile: null,
  };

  // Handle modal close
  const handleClose = () => {
    if (onClose) onClose();
    reset(initialValues); // Call parent's onClose
  };

  const { handleSubmit, control, reset, setError, watch } = useForm({
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

  //   // Handle form submit
  //   const submitForm = async (values) => {
  //     // console.log('values', values)
  //     setLoading(true);
  //     try {
  //       const formData = new FormData();
  //       // Append all values to formData
  //       Object.keys(values).forEach((key) => {
  //         if (values[key] !== null && values[key] !== undefined) {
  //           formData.append(key, values[key]);
  //         }
  //       });
  //       await RestApi.post(`api/v1/users/add-or-update-certification`, formData, {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       });
  //       reset(initialValues);
  //       setInternalShowModal(false);
  //       await getAuthUserInfo(setLoading);

  //       handleClose();
  //       toaster(
  //         `Skill ${editItem ? "updated" : "added"} successfully`,
  //         "success",
  //       );
  //     } catch (error) {
  //       helpers.handleApiValidationError(error, setError);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const { addOrUpdateCertificationFileMutationWithEmployeeId } = useHrQueryApi({
    reset,
    setError,
    handleClose,
  });

  const submitForm = async (values) => {
    console.log("values :", values);

    const formData = new FormData();

    // 🔹 append id only for edit
    if (values.id && values.id !== 0) {
      formData.append("id", values.id); // string
    }

    formData.append("name", values.name);
    formData.append("issuingOrganization", values.issuingOrganization);
    formData.append("issueDate", values.issueDate);
    formData.append("expirationDate", values.expirationDate);

    // 🔹 file optional
    if (values.attachmentFile) {
      formData.append("attachmentFile", values.attachmentFile);
    }

    // 🔹 call mutation
    await addOrUpdateCertificationFileMutationWithEmployeeId.mutateAsync({
      payload: formData,
      employee_id: employeeId,
    });
  };

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${editItem ? "Edit" : "Add"} Certification`}
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
                      label="Certification Name"
                      placeholder="Enter Your Certification Name"
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
                  name="issuingOrganization"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Issuing Organization"
                      placeholder="Enter Your Issuing Organization"
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
                  name="issueDate"
                  render={({ field, fieldState }) => (
                    <DatePicker
                      label="Issue Date"
                      options={{
                        dateFormat: "d-m-Y",
                        maxDate: "today",
                      }}
                      {...field}
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="expirationDate"
                  render={({ field, fieldState }) => (
                    <DatePicker
                      label="Expiration Date"
                      options={{
                        dateFormat: "d-m-Y",
                        minDate: watch("issueDate")
                          ? parseISO(watch("issueDate"))
                          : undefined,
                      }}
                      {...field}
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="attachmentFile"
                  render={({ field, fieldState }) => (
                    <FileUpload
                      {...field}
                      label="Attachment"
                      accept="image/*,application/pdf"
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
                      error={fieldState.error?.message}
                      size="sm"
                      clearable
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
                  addOrUpdateCertificationFileMutationWithEmployeeId?.isLoading
                }
                loading={
                  addOrUpdateCertificationFileMutationWithEmployeeId?.isLoading
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

export default AddEmployeeCertificationModal;
