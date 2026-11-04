import { useEffect, useState } from "react";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import RadioButton from "@/components/ui/RadioButton";
import { useTasksQueryApi } from "@/hooks/queryApi/useTasksQueryApi";

const TASK_STATUS = {
  PENDING: 223,
  IN_PROGRESS: 224,
  COMPLETED: 225,
};

const TaskStatusModalChange = ({
  showModal,
  onClose,
  selectedTaskDetails,
  refetch,
  // onUpdateStatus, // 🔥 parent থেকে API call function আসবে
}) => {
  const [selectedStatus, setSelectedStatus] = useState(null);

  const { updateTaskStatusMutation } = useTasksQueryApi({
    reset: () => {},
    setError: () => {},
    handleClose: onClose,
    setShowModal: showModal,
  });

  // Modal open হলে current status set হবে
  useEffect(() => {
    if (selectedTaskDetails?.taskStatusId === TASK_STATUS.PENDING) {
      setSelectedStatus(null); // 🔥 very important
    } else {
      setSelectedStatus(Number(selectedTaskDetails?.taskStatusId));
    }
  }, [selectedTaskDetails]);

  // 🎯 Only allowed options
  const statusOptions = [
    {
      label: "In Progress",
      value: TASK_STATUS.IN_PROGRESS,
      disabled: selectedTaskDetails?.taskStatusId === TASK_STATUS.IN_PROGRESS,
    },
    {
      label: "Completed",
      value: TASK_STATUS.COMPLETED,
      disabled: selectedTaskDetails?.taskStatusId === TASK_STATUS.COMPLETED,
    },
  ];
  // Submit handler
  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;

    const payload = {
      id: selectedTaskDetails.id,
      taskStatusId: selectedStatus,
    };

    // API call
    await updateTaskStatusMutation.mutateAsync(payload);
    refetch();
    selectedTaskDetails.taskStatusId = payload.taskStatusId;
    // onClose();
  };

  // console.log("selectedStatus :", selectedStatus);

  return (
    <ModalTw
      show={showModal}
      onClose={onClose}
      title="Change Task Status"
      size="lg"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-6">
        {/* 🔹 Task Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Task Name</p>
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            {selectedTaskDetails?.name}
          </p>

          <p className="mt-2 text-sm text-gray-500">Current Status</p>
          <span
            className={`badge badge-rounded badge-outline-${selectedTaskDetails?.taskStatus?.colorName}`}
          >
            {selectedTaskDetails?.taskStatus?.name}
          </span>
        </div>

        {/* 🔹 Status Radio */}
        <div>
          <RadioButton
            options={statusOptions}
            name="taskStatus"
            value={selectedStatus}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              console.log("Changed to:", newValue);
              setSelectedStatus(newValue);
            }}
            label="Update Status"
            variant="card"
            direction="horizontal"
            color="yellow"
            size="md"
          />
        </div>

        {/* 🔹 Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-600">
          <ButtonTw variant="outline" onClick={onClose}>
            Cancel
          </ButtonTw>

          <ButtonTw
            variant="blue"
            disabled={
              !selectedStatus ||
              selectedStatus === selectedTaskDetails?.taskStatusId
            }
            onClick={handleUpdateStatus}
          >
            Update Status
          </ButtonTw>
        </div>
      </div>
    </ModalTw>
  );
};

export default TaskStatusModalChange;
