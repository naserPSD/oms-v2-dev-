import React, { useEffect } from "react";
import { FormController as Controller } from "@/components/common/FormController";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import SwitchButton from "@/components/ui/SwitchButton";
import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { useCommonStore } from "@/store/useCommonStore";
import { Textarea } from "@/components/ui/textarea";

const SubscriptionAddOrUpdateModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
  setValue,
}) => {
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const nameValue = watch("name");
  const billingCycleValue = watch("billingCycle");

  useEffect(() => {
    if (nameValue) {
      const slug = nameValue
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
      setValue("slug", slug);
    }
  }, [nameValue, setValue]);

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Subscription Plan`}
        size="2xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4 ">
          <div className="grid grid-cols-12 gap-x-4">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Plan Name"
                  required={true}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Plan Name"
                  className="col-span-12 lg:col-span-12 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <Input
                  label="Slug"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Slug"
                  disabled={true}
                  className="col-span-12 lg:col-span-12 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <label
                    className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white`}
                  >
                    <span className="text-sm inline-flex items-center gap-1 whitespace-nowrap">
                      <span>Description</span>
                      <span className="text-red-500 font-bold leading-none select-none">*</span>
                    </span>
                  </label>
                  <Textarea
                    label="Description"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    placeholder="Enter Plan Description"
                    className="col-span-12 mb-3"
                  />
                </>
              )}
            />

            <Controller
              name="currency"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Currency"
                  required={true}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="e.g., BDT, USD"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="billingCycle"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Billing Cycle"
                  required={true}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={dropdowns.billingCycles || []}
                  placeholder="Select Billing Cycle"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            {billingCycleValue == "monthly" && (
              <>
                <Controller
                  name="monthlyPrice"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      label="Per User Monthly Price"
                      type="number"
                      required={true}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      placeholder="Enter Per User Monthly Price"
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
                    />
                  )}
                />

              </>
            )}

            {billingCycleValue == "yearly" && (
              <>
                <Controller
                  name="yearlyPrice"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      label="Per User Yearly Price"
                      type="number"
                      required={true}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      placeholder="Enter Per User Yearly Price"
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
                    />
                  )}
                />

                <Controller
                  name="perUserYearlyPrice"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      label="Per User Yearly Price"
                      type="number"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      placeholder="Enter Per User Yearly Price"
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
                    />
                  )}
                />
              </>
            )}

            <Controller
              name="trialDays"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Trial Days"
                  type="number"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Trial Days"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="sortOrder"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Sort Order"
                  type="number"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Sort Order"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <div className="col-span-12 lg:col-span-12 sm:col-span-12 mb-4">
              <Controller
                name="features"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <span>Features</span>
                        <span className="text-red-500 font-bold leading-none select-none">*</span>
                      </span>
                    </label>
                    <div className="suneditor-wrapper dark:bg-gray-800 dark:text-white rounded-md">
                      <SunEditor
                        setContents={field.value}
                        onChange={field.onChange}
                        height="180px"
                        placeholder="Enter Plan Features"
                        setOptions={{
                          buttonList: [
                            [
                              "undo",
                              "redo",
                              "formatBlock",
                              "fontSize",
                              "bold",
                              "underline",
                              "italic",
                              "strike",
                              "removeFormat",
                              "fontColor",
                              "hiliteColor",
                              "align",
                              "list",
                              "table",
                              "link",
                              "codeView",
                              "fullScreen",
                            ],
                          ],
                          height: "180px",
                        }}
                      />
                    </div>
                    {fieldState.error?.message && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <SwitchButton
                  label="Active"
                  enabled={field.value}
                  onClick={() => field.onChange(!field.value)}
                  enabledText="Yes"
                  disabledText="No"
                  className="col-span-12 lg:col-span-12 sm:col-span-12 mb-4"
                />
              )}
            />

            <div className="col-span-12 flex justify-center items-center gap-4">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-4 col-span-12"
                disabled={isLoading}
                loading={isLoading}
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
        </form>
      </ModalTw>
    </div>
  );
};

export default SubscriptionAddOrUpdateModal;
