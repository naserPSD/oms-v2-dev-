import { FormController as Controller } from "@/components/common/FormController";
import React from "react";

import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";

const AddOrUpdateRecruitmentStep = ({
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
        title={watch("id") ? "Edit Job Recruitment Step" : "Add Job Recruitment Step"}
        size="md"
        dismissible
        showHeader
        showFooter={false}
        type="default"
        position="center"
      >
        <form
          onSubmit={handleSubmit(submitForm)}
          autoComplete="off"
          className="space-y-4"
        >
          <div className="grid grid-cols-12 gap-4">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  label="Job Recruitment Step Name"
                  placeholder="Enter Job Recruitment Step Name..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12"
                />
              )}
            />

            <div className="col-span-12 flex justify-center items-center gap-4 mt-4">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold"
                disabled={isLoading}
                loading={isLoading}
              >
                Submit
              </ButtonTw>

              <ButtonTw
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
    </div>
  );
};

export default AddOrUpdateRecruitmentStep;
