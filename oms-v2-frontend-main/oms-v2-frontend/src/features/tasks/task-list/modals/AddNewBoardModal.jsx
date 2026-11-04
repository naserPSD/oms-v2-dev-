import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import { z } from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/utils/zodResolver";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { useCommonStore } from "@/store/useCommonStore";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCallback } from "react";

// 2️⃣ ======================= CONSTANTS / SCHEMA =======================

const taskBoardsSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Board name is required"),
  viewTypeId: z.coerce.number().min(1, "View type is required"),
});

const initialValues = {
  id: 0,
  name: "",
  viewTypeId: null,
};

const AddNewBoardModal = ({
  showModal,
  selectedTaskDetails,
  setShowBoardDetails,
  setSelectedTaskDetails,
  refetchBoardLists,
}) => {
  // ⚡ Form
  const {
    handleSubmit,
    control,

    reset,
    setError,
  } = useForm({
    resolver: zodResolver(taskBoardsSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowBoardDetails(false);
    setSelectedTaskDetails(null);
  }, [reset, setShowBoardDetails, setSelectedTaskDetails]);

  // 🧠 ---------- API HOOKS ----------
  const { addOrUpdateTaskBoardMutation } = useHrQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal: setShowBoardDetails,
  });

  const dropdowns = useCommonStore((state) => state.dropdowns);

  const taskBoardViewType =
    dropdowns.statusGroupList?.find((s) => s.code === "task_board_view_types")
      ?.statuses ?? [];
  dropdowns.taskBoardViewType = taskBoardViewType;

  // 📝 Create/Update handler
  const submitForm = async (values) => {
    try {
      const payload = {
        ...values,
        workspaceId: selectedTaskDetails,
      };
      await addOrUpdateTaskBoardMutation.mutateAsync(payload);
      refetchBoardLists();
    } catch (error) {
      console.error("Error submitting task board:", error);
    }
  };

  const isLoading = addOrUpdateTaskBoardMutation?.isLoading;

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title="Create New Task Board"
      size="md"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="space-y-4">
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Input
                label="Board Name"
                placeholder="Enter Board Name..."
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                required
                {...field}
              />
            )}
          />

          <Controller
            name="viewTypeId"
            control={control}
            render={({ field, fieldState }) => (
              <SelectSearch
                label="View Type"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                options={dropdowns.taskBoardViewType}
                placeholder="Select View Type..."
                required
              />
            )}
          />

          <div className="flex gap-3 pt-2">
            <ButtonTw
              type="submit"
              variant="blue"
              className="flex-1"
              disabled={isLoading}
              loading={isLoading}
            >
              Create Board
            </ButtonTw>

            <ButtonTw
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </ButtonTw>
          </div>
        </div>
      </form>
    </ModalTw>
  );
};

export default AddNewBoardModal;
