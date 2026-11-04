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

import SwitchButton from "@/components/ui/SwitchButton";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";

const AddEmployeeSkills = ({
  editItem,
  showModal = false,
  onClose,
  employeeId,
}) => {
  const skillLevelList = useCommonStore((state) => state.skillLevelList);

  // Zod schema with conditional validation
  const schema = z.object({
    id: z.coerce.number().optional(),
    skillName: z.string().min(1, "Skill Name is required"),
    skillLevel: z.string().nullable().optional(),
    yearsOfExperience: z.coerce.number().max(50).nullable().optional(),
    isTechnical: z.boolean().optional(),
  });

  const initialValues = {
    id: "",
    skillName: "",
    skillLevel: null,
    yearsOfExperience: null,
    isTechnical: false,
  };

  // Handle modal close
  const handleClose = () => {
    if (onClose) onClose(); // Call parent's onClose
    reset(initialValues);
  };

  const { handleSubmit, setError, control, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

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

  const { addOrUpdateSkillsMutationWithEmployeeId } = useHrQueryApi({
    reset,
    setError,
    handleClose,
  });

  const submitForm = async (values) => {
    const payload = { ...values };

    await addOrUpdateSkillsMutationWithEmployeeId.mutateAsync({
      payload,
      employee_id: employeeId,
    });
  };

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${editItem ? "Edit" : "Add"} Skill`}
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
                  name="skillName"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Skill Name"
                      placeholder="Enter your Skill Name"
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
                  name="skillLevel"
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label="Skill Level"
                      placeholder="Select Skill Level"
                      options={skillLevelList}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 lg:col-span-6 sm:col-span-12"
                      searchable
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="yearsOfExperience"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Years of Experience"
                      placeholder="Enter your Years of Experience"
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
                  name="isTechnical"
                  render={({ field, fieldState }) => (
                    <SwitchButton
                      enabled={field.value}
                      onChange={field.onChange}
                      label="Is Technical?"
                      className="col-span-12 lg:col-span-4 sm:col-span-12"
                      error={fieldState.error?.message}
                      enabledText="Yes"
                      disabledText="No"
                    />
                  )}
                />
              </div>

              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold"
                disabled={addOrUpdateSkillsMutationWithEmployeeId?.isLoading}
                loading={addOrUpdateSkillsMutationWithEmployeeId?.isLoading}
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

export default AddEmployeeSkills;
