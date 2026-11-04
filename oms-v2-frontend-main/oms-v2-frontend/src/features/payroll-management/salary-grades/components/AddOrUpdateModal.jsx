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

const AddOrUpdateModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
  setValue,
  getTodayDate,
  // errors,
}) => {
  const startDate = watch("startDate");
  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Salary Grade`}
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
              name="gradeName"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Salary Grade Name"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    const nameField = (e.target.value || "").trim();
                    const sanitizedValue = nameField.replace(/[-\/\s]/g, "_");
                    setValue("gradeCode", `${sanitizedValue.toLowerCase()}`);
                  }}
                  error={fieldState.error?.message}
                  placeholder="(e.g., Grade A/1, Grade B/2, etc.)"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="gradeCode"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Salary Grade Code"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Salary Grade Code"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="level"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type="number"
                  min="0"
                  label="Level"
                  hints="Lower Numbers Indicate Higher Ranks"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Level"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="minSalary"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type="number"
                  step="0.01"
                  min="0.0"
                  label="Minimum Basic Salary"
                  hints="Minimum Allowed Amount for This Grade"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Minimum Basic Salary"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="maxSalary"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type="number"
                  step="0.01"
                  min="0.0"
                  label="Maximum Basic Salary"
                  hints="Maximum Allowed Amount for This Grade"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Maximum Basic Salary"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type="textarea"
                  label="Description"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Description"
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

export default AddOrUpdateModal;
