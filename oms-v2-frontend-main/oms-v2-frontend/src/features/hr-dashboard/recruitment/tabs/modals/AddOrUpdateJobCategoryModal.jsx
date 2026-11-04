import React from "react";
import { FormController as Controller } from "@/components/common/FormController";
import SwitchButton from "@/components/ui/SwitchButton";
import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";

const AddOrUpdateJobCategoryModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
}) => {
  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Job Category`}
        size="sm"
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
                  label="Job Category Name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Job Category Name"
                  className="col-span-12"
                />
              )}
            />

            <div className="col-span-12">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <SwitchButton
                    onClick={() => field.onChange(!field.value)}
                    enabled={Boolean(field.value)}
                    enabledText="Active"
                    disabledText="Inactive"
                    label="Status"
                    className="flex items-center gap-2"
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
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default AddOrUpdateJobCategoryModal;
