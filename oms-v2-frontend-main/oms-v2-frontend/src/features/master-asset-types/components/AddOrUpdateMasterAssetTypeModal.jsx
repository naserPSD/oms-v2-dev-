"use client";
import React, { useEffect } from "react";
import helpers from "@/utils/helpers";
import { FormController as Controller } from "@/components/common/FormController";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import ButtonTw from "@/components/ui/ButtonTw";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addOrUpdateAssetType } from "@/services/hrServiceApi";

const schema = z.object({
  id: z.any().optional(),
  name: z.string().min(1, { message: "Name is required" }),
});

const AddOrUpdateMasterAssetTypeModal = ({ showModal, setShowModal, selectedAsset }) => {
  const queryClient = useQueryClient();
  
  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id: null,
      name: "",
    },
  });

  useEffect(() => {
    if (selectedAsset) {
      setValue("id", selectedAsset.value);
      setValue("name", selectedAsset.label);
    } else {
      reset();
    }
  }, [selectedAsset, setValue, reset]);

  const addOrUpdateMutation = useMutation({
    mutationFn: addOrUpdateAssetType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["globalAssetTypes"] });
      helpers.toaster(`Asset type ${selectedAsset ? "updated" : "added"} successfully`, "success");
      setShowModal(false);
    },
    onError: () => {
      helpers.toaster(`Failed to ${selectedAsset ? "update" : "add"} asset type`, "error");
    },
  });

  const onSubmit = async (data) => {
    await addOrUpdateMutation.mutateAsync(data);
  };

  const handleClose = () => {
    setShowModal(false);
    reset();
  };

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title={`${selectedAsset ? "Update" : "Add New"} Asset Type`}
      size="md"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              label="Asset Type Name"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              placeholder="Enter Asset Type name"
              required={true}
            />
          )}
        />
        
        <div className="flex justify-end gap-3 mt-6">
          <ButtonTw
            type="button"
            size="sm"
            variant="outline.gray"
            onClick={handleClose}
          >
            Cancel
          </ButtonTw>
          <ButtonTw
            type="submit"
            size="sm"
            variant="default"
            disabled={addOrUpdateMutation.isPending}
            loading={addOrUpdateMutation.isPending}
          >
            {selectedAsset ? "Update" : "Submit"}
          </ButtonTw>
        </div>
      </form>
    </ModalTw>
  );
};

export default AddOrUpdateMasterAssetTypeModal;
