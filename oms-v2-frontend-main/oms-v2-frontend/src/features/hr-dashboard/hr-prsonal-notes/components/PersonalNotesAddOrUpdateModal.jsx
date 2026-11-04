"use client";

import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import DateTimePicker from "@/components/ui/DateTimePicker";
import Input from "@/components/ui/Input";
import SwitchButton from "@/components/ui/SwitchButton";
import { FormController as Controller } from "@/components/common/FormController";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
const PersonalNotesAddOrUpdateModal = ({
  showModal,
  isLoading,
  watch,
  control,
  handleSubmit,
  submitForm,
  handleClose,
  reset,
}) => {
  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Personal Note`}
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
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Title"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  required
                  placeholder="Enter Note Title"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />
            <Controller
              name="tags"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Tags (comma separated)"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="E.G. Work, Personal"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
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
                      Content
                    </label>
                    <div className="suneditor-wrapper dark:bg-gray-800 dark:text-white rounded-md">
                      <SunEditor
                        setContents={field.value}
                        onChange={field.onChange}
                        height="180px"
                        placeholder="Enter Note Content"
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
                          // Dark mode class for editor content
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
              name="isPinned"
              control={control}
              render={({ field }) => (
                <SwitchButton
                  label="Pinned"
                  enabled={field.value}
                  onClick={() => field.onChange(!field.value)}
                  enabledText="Yes"
                  disabledText="No"
                  className="col-span-12 lg:col-span-3 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="isArchived"
              control={control}
              render={({ field }) => (
                <SwitchButton
                  label="Archived"
                  enabled={field.value}
                  onClick={() => field.onChange(!field.value)}
                  enabledText="Yes"
                  disabledText="No"
                  className="col-span-12 lg:col-span-3 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="reminderAt"
              control={control}
              render={({ field, fieldState }) => (
                <DateTimePicker
                  label="Reminder At"
                  value={field.value}
                  onChange={field.onChange}
                  name="reminderAt"
                  placeholder="Select Reminder Date & Time"
                  size="sm"
                  mode="datetime"
                  options={{
                    dateFormat: "Y-m-d h:i K",
                    time_24hr: false,
                    minDate: "today",
                  }}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  error={fieldState.error?.message}
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

export default PersonalNotesAddOrUpdateModal;
