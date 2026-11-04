import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import { useTasksQueryApi } from "@/hooks/queryApi/useTasksQueryApi";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const AddWorkSpace = ({ showModal, onClose, workspaceData }) => {
  const isEditMode = !!workspaceData; // true if workspaceData exists

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      id: null,
      name: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (workspaceData && showModal) {
      reset({
        id: workspaceData.id, // ✅ IMPORTANT
        name: workspaceData.name || "",
        description: workspaceData.description || "",
        isActive: workspaceData.isActive ?? true,
      });
    }

    if (!workspaceData && showModal) {
      reset({
        id: null,
        name: "",
        description: "",
        isActive: true,
      });
    }
  }, [workspaceData, showModal, reset]);

  const { addWorkSpace } = useTasksQueryApi({
    reset,
    setError: () => {},
    handleClose: onClose,
    setShowModal: showModal,
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...(data.id && { id: data.id }), // ✅ SAFE
        name: data.name,
        description: data.description,
        isActive: true,
      };
      console.log("all Data :", payload);

      await addWorkSpace.mutateAsync(payload);
    } catch (error) {
      console.error("Error submitting workspace:", error);
    }
  };
  return (
    <ModalTw
      show={showModal}
      onClose={onClose}
      title={isEditMode ? "Edit Workspace" : "Add Workspace"}
      size="lg"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Workspace Name */}
          <Controller
            control={control}
            name="name"
            rules={{ required: "Workspace name is required" }}
            render={({ field, fieldState }) => (
              <Input
                label="Workspace Name"
                placeholder="Enter workspace name..."
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />

          {/* Description */}
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <Input
                label="Description"
                placeholder="Enter workspace description..."
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 ">
          <div className="flex gap-2">
            <ButtonTw variant="outline" onClick={onClose} type="button">
              Cancel
            </ButtonTw>

            <ButtonTw variant="blue" type="submit">
              {isEditMode ? "Update Workspace" : "Add Workspace"}
            </ButtonTw>
          </div>
        </div>
      </form>
    </ModalTw>
  );
};

export default AddWorkSpace;
