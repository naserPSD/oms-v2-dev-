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
import { useEmployeeProfileQueryApi } from "@/hooks/queryApi/useEmployeeProfileQueryApi";
import helpers from "@/utils/helpers";

const AddEmployeeReferences = ({
  editItem,
  showModal = false,
  onClose,
  id,
}) => {
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const initialValues = {
    id: "",
    name: "",
    designation: null,
    organization: "",
    email: "",
    relation: "",
    phoneCountryId: null,
    phone: "",
    address: "",
  };

  // Zod schema with conditional validation
  const schema = z
    .object({
      id: z.coerce.number().optional(),
      name: z.string().min(1, "Name is required"),
      designation: z.string().nullable().optional(),
      organization: z.string().nullable().optional(),
      email: z.string().email().nullable().optional(),
      relation: z.string().nullable().optional(),
      phoneCountryId: z.coerce.number().default(null).nullable().optional(),
      phone: z.string().nullable().optional(),
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

  // Handle modal close
  const handleClose = () => {
    if (onClose) onClose(); // Call parent's onClose
    reset(initialValues);
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

  const { addOrUpdateReferenceMutationWithEmployeeId } =
    useEmployeeProfileQueryApi({
      reset,
      setError,
      handleClose,
    });

  const submitForm = async (values) => {
    // 🔹 prepare phone
    const phoneCountry = dropdowns.countryList?.find(
      (country) => country.id === values.phoneCountryId,
    );
    const callingCode = phoneCountry?.callingCode;

    values.phoneIdentifier = values.phone;
    values.phone = "+" + callingCode + values.phone;

    // 🔹 create payload
    const payload = { ...values };

    try {
      // 🔹 call mutation
      await addOrUpdateReferenceMutationWithEmployeeId.mutateAsync({
        payload,
        employee_id: id,
      });

      reset(initialValues);
      handleClose();
    } catch (error) {
      helpers.handleApiValidationError(error, setError);
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
        title={`${editItem ? "Edit" : "Add"} Reference`}
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
                      label="Name"
                      placeholder="Enter Name"
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
                  name="designation"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Designation"
                      placeholder="Enter Designation"
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
                  name="organization"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Organization"
                      placeholder="Enter Organization"
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
                  name="email"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Email"
                      placeholder="Enter Email"
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
                  name="relation"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Relation"
                      placeholder="Enter Relation"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
                      {...field}
                    />
                  )}
                />

                <div className="col-span-12 lg:col-span-6 sm:col-span-12 flex flex-row">
                  <Controller
                    control={control}
                    name="phoneCountryId"
                    render={({ field, fieldState }) => (
                      <SelectSearch
                        label="Phone"
                        className="w-1/2 border-r-0 rounded-r-none"
                        options={dropdowns.countryList?.map((c) => ({
                          value: c.id,
                          label: `(+${c.callingCode}) ${c.name}`,
                        }))}
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        size="sm"
                        placeholder="Select code"
                        searchable
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="phone"
                    render={({ field, fieldState }) => (
                      <Input
                        className="w-1/2 border-l-0 rounded-l-none z-2 mt-[14px]"
                        label=""
                        placeholder="Enter Phone Number"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        size="sm"
                        {...field}
                      />
                    )}
                  />
                </div>

                <Controller
                  control={control}
                  name="address"
                  render={({ field, fieldState }) => (
                    <Input
                      type="text"
                      label="Address"
                      placeholder="Enter Address"
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
                disabled={addOrUpdateReferenceMutationWithEmployeeId?.isLoading}
                loading={addOrUpdateReferenceMutationWithEmployeeId?.isLoading}
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

export default AddEmployeeReferences;
