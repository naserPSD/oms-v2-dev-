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

const HolidayAddOrUpdateModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
  // errors,
}) => {
  const startDate = watch("startDate");
    const dropdowns = useCommonStore((state) => state.dropdowns);
    
    const holidayTypes =
      dropdowns.statusGroupList
        ?.find((s) => s.code === "holiday_types")
        ?.statuses?.map((c) => ({
          value: c.id,
          label: c.name,
          code: c.code,
        })) ?? [];
        
  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Holiday`}
        size="xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4 ">
          <div className="grid grid-cols-12 gap-x-4">
            <Controller
              name="holidayName"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Holiday Name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter holiday name"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="holidayTypeId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Holiday Type"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={holidayTypes}
                  placeholder="Select priority"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="totalHolidays"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Total Holidays"
                  type="number"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter total holidays"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

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
                  className="col-span-12 lg:col-span-4 sm:col-span-12"
                />
              )}
            />

          </div>
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
      </form>
    </ModalTw>
    </div>
  );
};

export default HolidayAddOrUpdateModal;
