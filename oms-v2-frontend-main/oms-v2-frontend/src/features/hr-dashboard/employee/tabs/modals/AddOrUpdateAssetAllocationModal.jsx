import React from "react";
import { FormController as Controller } from "@/components/common/FormController";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import SwitchButton from "@/components/ui/SwitchButton";
import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import FileUpload from "@/components/ui/FileUpload";
import DatePicker from "@/components/ui/DatePicker";
import { parseISO } from "date-fns/parseISO";
import { format } from "date-fns/format";
import SelectSearch from "@/components/ui/SelectSearch";
import { useCommonStore } from "@/store/useCommonStore";

const AddOrUpdateAssetAllocationModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
  dropdowns,
  // errors,
}) => {
  // const { t } = useTranslation();
  // const dropdowns = useCommonStore((state) => state.dropdowns);

  const assetStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "asset_statuses")
      ?.statuses ?? [];

  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const startDate = watch("startDate");

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Asset Allocation`}
        size="3xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form
          noValidate
          onSubmit={handleSubmit(submitForm)}
          className="space-y-4 "
        >
          <div className="grid grid-cols-12 gap-x-4">
            <Controller
              name="employeeId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Employee"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={dropdowns.appEmployeeUsers}
                  placeholder="Select Employee"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="assetTypeId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Asset Type"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={dropdowns.assetTypeList}
                  placeholder="Select Asset Type"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="assetStatusId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Asset Status"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={assetStatusList}
                  placeholder="Select Asset Status"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Asset Description"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Description"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="model"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Model"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Model"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="serial"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Serial"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Serial"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="amount"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type="number"
                  label="Amount"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Amount"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              control={control}
              name="allocationDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Allocation Date"
                  options={{
                    dateFormat: "d-m-Y",
                    minDate: getTodayDate(),
                    defaultDate: field.value
                      ? parseISO(field.value)
                      : getTodayDate(),
                  }}
                  value={field.value}
                  onChange={(date) => {
                    if (!date) {
                      field.onChange("");
                      return;
                    }
                    if (date instanceof Date) {
                      field.onChange(format(date, "yyyy-MM-dd"));
                      return;
                    }
                    field.onChange(typeof date === "string" ? date.split("T")[0] : date);
                  }}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="refundable"
              control={control}
              render={({ field }) => (
                <div className="col-span-12 lg:col-span-6 sm:col-span-12 flex flex-col justify-center">
                  <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                    Refundable
                  </label>
                  <SwitchButton
                    id="refundable"
                    name="refundable"
                    enabled={Boolean(field.value)}
                    onChange={(val) => field.onChange(val)}
                    enabledText="Yes"
                    disabledText="No"
                    color="success"
                  />
                </div>
              )}
            />

            <Controller
              name="remarks"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type="textarea"
                  label="Remarks"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Remarks"
                  className="col-span-12 lg:col-span-12 sm:col-span-12"
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

export default AddOrUpdateAssetAllocationModal;
