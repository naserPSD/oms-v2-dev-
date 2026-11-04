"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import ButtonTw from "@/components/ui/ButtonTw";
import SwitchButton from "@/components/ui/SwitchButton";
import helpers from "@/utils/helpers";
import {
  createStatusGroup,
  updateStatusGroup,
} from "@/services/statusServiceApi";
import { nameToStatusCode } from "../utils/nameToStatusCode";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  isActive: z.boolean().default(true),
});

const StatusGroupModal = ({ showModal, setShowModal, selectedRow }) => {
  const queryClient = useQueryClient();
  const isEdit = Boolean(selectedRow?.id);

  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (selectedRow) {
      setValue("name", selectedRow.name || "");
      setValue("code", selectedRow.code || "");
      setValue("isActive", selectedRow.isActive !== false);
    } else {
      reset({ name: "", code: "", isActive: true });
    }
  }, [selectedRow, setValue, reset]);

  const mutation = useMutation({
    mutationFn: async (values) => {
      const body = {
        name: values.name.trim(),
        code: isEdit
          ? values.code.trim()
          : nameToStatusCode(values.name) || values.code.trim(),
        isActive: values.isActive,
      };
      if (isEdit) {
        return updateStatusGroup(selectedRow.id, body);
      }
      return createStatusGroup(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminStatusGroups"] });
      queryClient.invalidateQueries({ queryKey: ["adminStatusGroupsAll"] });
      helpers.toaster(
        `Status group ${isEdit ? "updated" : "created"} successfully`,
        "success",
      );
      setShowModal(false);
      reset();
    },
    onError: (err) => {
      helpers.toaster(
        err?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} status group`,
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
      title={isEdit ? "Update status group" : "Add status group"}
      size="md"
      dismissible
      showHeader
      showFooter={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
          name="isActive"
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

export default StatusGroupModal;
