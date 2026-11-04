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

const NoticeAddOrUpdateModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
  getTodayDate,
  // errors,
}) => {
  const startDate = watch("startDate");
  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Notice`}
        size="3xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)} className="pace-sy-4 ">
          <div className="grid grid-cols-12 gap-x-4">
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Title"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Notice Title"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="priority"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Priority"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={[
                    { value: "Low", label: "Low" },
                    { value: "Normal", label: "Normal" },
                    { value: "High", label: "High" },
                  ]}
                  placeholder="Select Priority"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="pageRoute"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Page Route"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Page Route"
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

            <Controller
              control={control}
              name="startDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Start Date"
                  options={{
                    dateFormat: "d-m-Y",
                    minDate: getTodayDate(),
                    defaultDate: field.value
                      ? parseISO(field.value)
                      : getTodayDate(),
                  }}
                  value={field.value}
                  onChange={(date) => {
                    field.onChange(
                      date ? format(parseISO(date), "yyyy-MM-dd") : ""
                    );
                  }}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="endDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  label="End Date"
                  options={{
                    dateFormat: "d-m-Y",
                    minDate: startDate ? parseISO(startDate) : getTodayDate(),
                    defaultDate: field.value
                      ? parseISO(field.value)
                      : startDate
                      ? parseISO(startDate)
                      : getTodayDate(),
                  }}
                  value={field.value}
                  onChange={(date) => {
                    field.onChange(
                      date ? format(parseISO(date), "yyyy-MM-dd") : ""
                    );
                  }}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="attachment"
              render={({ field, fieldState }) => (
                <FileUpload
                  {...field}
                  label="Attachment"
                  accept="image/*,application/pdf"
                  className="col-span-12"
                  error={fieldState.error?.message}
                  size="sm"
                  clearable
                />
              )}
            />
            <div className="col-span-12 lg:col-span-12 sm:col-span-12 mb-4">
              <Controller
                name="content"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Content *
                    </label>
                    <div className="suneditor-wrapper dark:bg-gray-800 dark:text-white rounded-md">
                      <SunEditor
                        setContents={field.value}
                        onChange={field.onChange}
                        height="180px"
                        placeholder="Enter Notice Content"
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

export default NoticeAddOrUpdateModal;
