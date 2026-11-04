// src/features/hr-dashboard/recruitment/job/tabs/Components/AddOrUpdateApplicantModal.jsx

"use client";

import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import FileUpload from "@/components/ui/FileUpload";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { FormController as Controller } from "@/components/common/FormController";

const AddOrUpdateApplicantModal = ({
  showModal,
  handleClose,
  isLoading,
  handleSubmit,
  submitForm,
  control,
  watch,
  reset,
  dropdowns, // countryList for phone country code
}) => {
  const isEdit = !!watch("id");

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title={isEdit ? "Update Applicant" : "Add New Applicant"}
      size="2xl"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="grid grid-cols-12 gap-x-4">
          {/* First Name */}
          <Controller
            control={control}
            name="firstName"
            render={({ field, fieldState }) => (
              <Input
                label="First Name"
                placeholder="Enter first name"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
              />
            )}
          />

          {/* Last Name */}
          <Controller
            control={control}
            name="lastName"
            render={({ field, fieldState }) => (
              <Input
                label="Last Name"
                placeholder="Enter last name"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
              />
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Input
                label="Email"
                type="email"
                placeholder="Enter email address"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
              />
            )}
          />

          {/* Phone: country code + number */}
          <div className="col-span-12 lg:col-span-6">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              <span className="inline-flex items-center gap-1">
                Phone
                <span className="text-red-500 font-bold leading-none">*</span>
              </span>
            </label>
            <div className="flex items-start gap-0">
              <Controller
                control={control}
                name="phoneCountryId"
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label=""
                    className="w-[46%] mb-0 [&_button]:rounded-r-none"
                    options={
                      dropdowns?.countryList?.map((c) => ({
                        value: c.id,
                        label: `+${c.callingCode} ${c.name}`,
                      })) || []
                    }
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    placeholder="Code"
                    searchable
                  />
                )}
              />
              <Controller
                control={control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Input
                    label=""
                    placeholder="Phone number"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="flex-1 mb-0 [&_input]:rounded-l-none"
                  />
                )}
              />
            </div>
          </div>

          {/* Expected Salary */}
          {/* <Controller
            control={control}
            name="expectedSalary"
            render={({ field, fieldState }) => (
              <Input
                label="Expected Salary"
                type="number"
                placeholder="Enter expected salary"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
              />
            )}
          /> */}

          {/* Summary */}
          <Controller
            control={control}
            name="summary"
            render={({ field, fieldState }) => (
              <Input
                label="Summary"
                type="textarea"
                placeholder="Brief summary about the applicant"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12"
                rows={3}
              />
            )}
          />

          {/* CV Upload */}
          <Controller
            control={control}
            name="cvFile"
            render={({ field, fieldState }) => (
              <FileUpload
                {...field}
                label="Upload CV"
                accept="application/pdf,image/*"
                className="col-span-12"
                error={fieldState.error?.message}
                size="sm"
                clearable
              />
            )}
          />

          {/* Submit + Reset */}
          <div className="col-span-12 flex justify-center items-center gap-4 mt-2">
            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              className="w-full font-bold"
              disabled={isLoading}
              loading={isLoading}
            >
              {isEdit ? "Update Applicant" : "Add Applicant"}
            </ButtonTw>
            <ButtonTw
              type="button"
              size="sm"
              variant="outline.gray"
              className="w-full font-bold"
              onClick={() => reset()}
            >
              Reset
            </ButtonTw>
          </div>
        </div>
      </form>
    </ModalTw>
  );
};

export default AddOrUpdateApplicantModal;
