"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import ButtonTw from "@/components/ui/ButtonTw";
import SwitchButton from "@/components/ui/SwitchButton";
import helpers from "@/utils/helpers";
import { createStatus, updateStatus } from "@/services/statusServiceApi";
import { nameToStatusCode } from "../utils/nameToStatusCode";

const schema = z.object({
  status_group_id: z.string().min(1, "Status group is required"),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  color_name: z.string().optional(),
  serial: z.coerce.number().optional(),
  is_active: z.boolean().default(true),
});

const StatusModal = ({
  showModal,
  setShowModal,
  selectedRow,
  statusGroupOptions = [],
}) => {
  const queryClient = useQueryClient();
  const isEdit = Boolean(selectedRow?.id);

  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status_group_id: "",
      name: "",
      code: "",
      color_name: "",
      serial: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (selectedRow) {
      setValue(
        "status_group_id",
        String(
          selectedRow.statusGroup?.id ??
            selectedRow.status_group_id ??
            "",
        ),
      );
      setValue("name", selectedRow.name || "");
      setValue("code", selectedRow.code || "");
      setValue("color_name", selectedRow.colorName || "");
      setValue(
        "serial",
        selectedRow.serial !== null && selectedRow.serial !== undefined
          ? String(selectedRow.serial)
          : "",
      );
      setValue("is_active", selectedRow.isActive !== false);
    } else {
      reset({
        status_group_id: "",
        name: "",
        code: "",
        color_name: "",
        serial: "",
        is_active: true,
      });
    }
  }, [selectedRow, setValue, reset]);

  const mutation = useMutation({
    mutationFn: async (values) => {
      const body = {
        status_group_id: Number(values.status_group_id),
        name: values.name.trim(),
        code: isEdit
          ? values.code.trim()
          : nameToStatusCode(values.name) || values.code.trim(),
        color_name: values.color_name?.trim() || undefined,
        is_active: values.is_active,
      };
      if (values.serial !== "" && values.serial !== undefined) {
        body.serial = Number(values.serial);
      }
      if (isEdit) {
        return updateStatus(selectedRow.id, body);
      }
      return createStatus(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminStatuses"] });
      helpers.toaster(
        `Status ${isEdit ? "updated" : "created"} successfully`,
        "success",
      );
      setShowModal(false);
      reset();
    },
    onError: (err) => {
      helpers.toaster(
        err?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} status`,
        "error",
      );
    },
  });

  const onSubmit = (values) => mutation.mutate(values);

  return (
    <ModalTw
      show={showModal}
      onClose={() => {
        setShowModal(false);
        reset();
      }}
      title={isEdit ? "Update status" : "Add status"}
      size="md"
      dismissible
      showHeader
      showFooter={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <Controller
          name="status_group_id"
          control={control}
          render={({ field, fieldState }) => (
            <SelectSearch
              label="Status group"
              options={statusGroupOptions}
              value={field.value}
              onChange={(val) => field.onChange(val ?? "")}
              error={fieldState.error?.message}
              placeholder="Search status group..."
              searchable
              clearable={false}
              useDropdownPortal
              className="!mb-0"
              required
            />
          )}
        />
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              label="Name"
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                if (!isEdit) {
                  setValue("code", nameToStatusCode(value), {
                    shouldValidate: true,
                  });
                }
              }}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="code"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              label="Code"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              disabled
              description={
                isEdit
                  ? "Code cannot be changed after creation."
                  : "Generated automatically from name."
              }
            />
          )}
        />
        <Controller
          name="color_name"
          control={control}
          render={({ field }) => (
            <Input
              label="Color name"
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. success, danger"
            />
          )}
        />
        <Controller
          name="serial"
          control={control}
          render={({ field }) => (
            <Input
              type="number"
              label="Serial"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <SwitchButton
              label="Active"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <ButtonTw
            type="button"
            variant="outline"
            onClick={() => {
              setShowModal(false);
              reset();
            }}
          >
            Cancel
          </ButtonTw>
          <ButtonTw type="submit" loading={mutation.isPending}>
            {isEdit ? "Update" : "Create"}
          </ButtonTw>
        </div>
      </form>
    </ModalTw>
  );
};

export default StatusModal;
