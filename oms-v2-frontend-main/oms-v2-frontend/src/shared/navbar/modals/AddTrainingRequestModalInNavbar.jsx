"use client";

import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import DatePicker from "@/components/ui/DatePicker";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import { zodResolver } from "@/utils/zodResolver";
import { useCallback, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toaster } from "@/utils/helpers";

const initialValues = {
  id: 0,
  itemDescription: "",
  trainingType: "Internal",
  quantity: 1,
  startDate: "",
  endDate: "",
  courseDuration: "",
  trainingProvider: "",
  locationName: "",
  estimatedCost: 0,
  reason: "",
  remarks: "",
};

const schema = z.object({
  id: z.coerce.number().optional(),
  itemDescription: z
    .string()
    .trim()
    .min(1, "Training Name is required")
    .max(255, "Maximum 255 characters allowed"),
  trainingType: z.enum(["Internal", "External"], {
    required_error: "Training Type is required",
  }),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .min(1, "Number of Participants must be at least 1"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  courseDuration: z.string().optional(),
  trainingProvider: z
    .string()
    .max(255, "Maximum 255 characters allowed")
    .optional(),
  locationName: z
    .string()
    .max(255, "Maximum 255 characters allowed")
    .optional(),
  estimatedCost: z.coerce.number().min(0, "Estimated Cost cannot be negative"),
  reason: z.string().max(255, "Maximum 255 characters allowed").optional(),
  remarks: z.string().max(255, "Maximum 255 characters allowed").optional(),
});

const AddTrainingRequestModalInNavbar = ({
  showModal,
  handleClose,
  setShowModal,
  editData = null,
  isView = false,
}) => {
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const trainingTypeList = useMemo(
    () =>
      dropdowns.statusGroupList
        ?.find((group) => group.name?.trim().toLowerCase() === "training types")
        ?.statuses?.filter((status) =>
          ["Internal", "External"].includes(status.name),
        )
        .map((status) => ({ value: status.name, label: status.name })) ?? [],
    [dropdowns.statusGroupList],
  );

  const {
    reset,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (showModal && editData) {
      reset({
        id: editData.id,
        itemDescription: editData.itemDescription || "",
        trainingType: editData.trainingType || editData.trainingTypeName || "Internal",
        quantity: editData.quantity || 1,
        startDate: editData.startDate || editData.start_date || "",
        endDate: editData.endDate || editData.end_date || "",
        courseDuration: editData.courseDuration || editData.course_duration || editData.duration || "",
        trainingProvider: editData.trainingProvider || "",
        locationName: editData.locationName || "",
        estimatedCost: editData.estimatedCost || 0,
        reason: editData.reason || "",
        remarks: editData.remarks || "",
      });
    } else if (showModal && !editData) {
      reset(initialValues);
    }
  }, [showModal, editData, reset]);

  const closeModal = useCallback(() => {
    reset(initialValues);
    handleClose();
  }, [handleClose, reset]);

  const { addOrUpdateTrainingRequestMutation } = useHrQueryApi({
    reset,
    setError,
    handleClose: closeModal,
    setShowModal,
  });

  const submitForm = async (values) => {
    try {
      await addOrUpdateTrainingRequestMutation.mutateAsync({
        ...values,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
        start_date: values.startDate || null,
        end_date: values.endDate || null,
        trainingProvider: values.trainingProvider || null,
        locationName: values.locationName || null,
        reason: values.reason || null,
        remarks: values.remarks || null,
        courseDuration: values.courseDuration || null,
      });
      toaster(`Training request ${editData ? "updated" : "added"} successfully`, "success");
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  const endDateValue = watch("endDate");
  const isSubmitting = addOrUpdateTrainingRequestMutation.isPending;

  return (
    <ModalTw
      show={showModal}
      onClose={closeModal}
      title={isView ? "View Training Request" : editData ? "Edit Training Request" : "Add New Training Request"}
      size="2xl"
      dismissible={!isSubmitting}
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <fieldset disabled={isView} className="grid grid-cols-12 gap-x-4 gap-y-1">
          <Controller
            control={control}
            name="itemDescription"
            render={({ field, fieldState }) => (
              <Input
                label="Training Name"
                placeholder="Select training or enter training name"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
                required
                maxLength={255}
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="trainingType"
            render={({ field, fieldState }) => (
              <SelectSearch
                label="Training Type"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                options={trainingTypeList}
                placeholder="Select Training Type"
                className="col-span-12 lg:col-span-6"
                searchable={false}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="quantity"
            render={({ field, fieldState }) => (
              <Input
                label="Number of Participants"
                placeholder="Enter number of participants"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
                type="number"
                min={1}
                required
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="courseDuration"
            render={({ field, fieldState }) => (
              <Input
                label="Duration (in days)"
                placeholder="e.g. 5"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
                type="number"
                min={0}
                step={1}
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="startDate"
            render={({ field, fieldState }) => (
              <DatePicker
                label="Training Date Range"
                mode="range"
                value={[field.value, endDateValue].filter(Boolean)}
                onChange={(selectedRange) => {
                  if (
                    Array.isArray(selectedRange) &&
                    selectedRange.length === 2 &&
                    selectedRange[0] &&
                    selectedRange[1]
                  ) {
                    field.onChange(selectedRange[0]);
                    setValue("endDate", selectedRange[1], {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  } else {
                    field.onChange("");
                    setValue("endDate", "", {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }}
                error={fieldState.error?.message}
                placeholder="Select start and end date"
                className="col-span-12"
                clearable
              />
            )}
          />

          <Controller
            control={control}
            name="trainingProvider"
            render={({ field, fieldState }) => (
              <Input
                label="Training Provider"
                placeholder="Enter provider name"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
                maxLength={255}
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="locationName"
            render={({ field, fieldState }) => (
              <Input
                label="Location Name"
                placeholder="Enter location (optional)"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
                maxLength={255}
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="estimatedCost"
            render={({ field, fieldState }) => (
              <Input
                label="Estimated Cost"
                placeholder="Enter estimated cost"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
                type="number"
                min={0}
                step="0.01"
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="reason"
            render={({ field, fieldState }) => (
              <Input
                type="textarea"
                label="Reason / Purpose"
                placeholder="Why is this training required?"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                disabled={isView}
                className="col-span-12"
                rows={3}
                maxLength={255}
                {...field}
              />
            )}
          />

        </fieldset>
        <div className="col-span-12 flex w-full items-center justify-center gap-4 mt-4">
          <ButtonTw
            type="button"
            size="sm"
            variant="outline"
            className="w-full font-bold"
            disabled={isSubmitting}
            onClick={isView ? closeModal : () => reset(initialValues)}
          >
            {isView ? "Close" : "Reset"}
          </ButtonTw>
          {!isView && (
            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              className="w-full font-bold"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {editData ? "Update" : "Submit"}
            </ButtonTw>
          )}
        </div>
      </form>
    </ModalTw>
  );
};

export default AddTrainingRequestModalInNavbar;
