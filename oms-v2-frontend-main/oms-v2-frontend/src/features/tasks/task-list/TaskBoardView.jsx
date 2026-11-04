import SimpleTooltip from "@/components/ui/SimpleTooltip";
import helpers from "@/utils/helpers";
import {
  Calendar,
  Eye,
  MessageSquare,
  Pencil,
  Tag,
  Trash2,
} from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";

// 🟢 DND KIT IMPORTS
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import { useTasksQueryApi } from "@/hooks/queryApi/useTasksQueryApi";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Avatar from "@/components/ui/Avatar";
// ================================
// 🔹 Draggable Column Wrapper
// ================================
const DraggableColumn = ({ id, children }) => {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children({ dragListeners: listeners })}
    </div>
  );
};

// ================================
// 🔹 Main Board View
// ================================
const TaskBoardView = ({
  tasks,
  onEdit,
  onDelete,
  onAddTask,
  onViewAssignees,
  onViewComments,
  cardListsData,
  selectedBoardId,
  
}) => {
  // 🔑 SOURCE OF TRUTH
  const [columns, setColumns] = useState([]);

  const workspaceId = useParams()?.id;

  // API hooks
  const { updateTaskCardSerial} = useTasksQueryApi({
    reset: () => {},
    setError: () => {},
    handleClose: () => {},
    setShowModal: () => {},
  });

  

  // 🔹 Group tasks by card
  const groupedTasks = cardListsData.reduce((acc, card) => {
    acc[card.name] = tasks.filter(
      (task) => task.assignees?.length > 0 && task.card?.name === card.name,
    );
    return acc;
  }, {});

  // API data → local state
  useEffect(() => {
    if (cardListsData?.length) {
      const sorted = [...cardListsData].sort((a, b) => a.serial - b.serial);
      setColumns(sorted);
    }
  }, [cardListsData]);

  // 🔹 Drag End Handler (Column Serial Change)
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = columns.findIndex((c) => c.id === active.id);
    const newIndex = columns.findIndex((c) => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(columns, oldIndex, newIndex);

    // ✅ UI FIXED HERE
    setColumns(newOrder);

    // ✅ SERIAL PAYLOAD
    const payload = newOrder.map((card, index) => ({
      id: card.id,
      serial: index + 1,
    }));

    console.log("Updated Card Serial:", payload);

    // 🔁 API CALL (await added)
    try {
      await updateTaskCardSerial.mutateAsync({
        cards: payload,
        workspaceId,
        boardId: selectedBoardId,
      });
    } catch (error) {
      console.error("Error updating card serial:", error);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={columns.map((c) => c.id)}
        strategy={rectSortingStrategy}
      >
        <div className="flex gap-x-4 overflow-y-auto h-auto scrollbar-thin ">
          {columns.map((card) => {
            const tasks = groupedTasks[card.name] || [];

            return (
              <DraggableColumn key={card.id} id={card.id}>
                {({ dragListeners }) => (
                  <div className="space-y-4 border rounded-xl p-4 bg-gray-200 dark:bg-gray-700 w-[320px] h-auto mb-24">
                    {/* HEADER (DRAG HANDLE) */}
                    <div
                      {...dragListeners}
                      className="flex items-center justify-between cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: card.color }}
                        />
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {card.name}
                        </h3>
                      </div>

                      <span className="text-xs bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {tasks.length} Total
                      </span>
                    </div>

                    {/* ADD TASK */}
                    <button
                      onClick={() => onAddTask(card.id)}
                      className="w-full text-white py-1 rounded-full font-medium flex items-center justify-center gap-1 cursor-pointer"
                      style={{ backgroundColor: card.color }}
                    >
                      <span className="text-lg">＋</span>
                      Add New Task
                    </button>

                    {/* TASK LIST */}
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onViewAssignees={onViewAssignees}
                          onViewComments={onViewComments}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </DraggableColumn>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};

// ================================
// 🔹 Task Card Component
// ================================
const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onViewAssignees,
  onViewComments,
}) => {
  const priorityColor = {
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    primary:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    secondary: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  const priorityClass =
    priorityColor[task.priority?.colorName] || priorityColor.secondary;

  const authUser = useAuthStore((state) => state.user);

  const isTaskAssigneeAdminOrEditor = (task) => {
    if (!authUser?.id || !task) return false;
    if (
      authUser?.appUseCase === "Admin" ||
      authUser?.role?.name?.toLowerCase() === "admin" ||
      authUser?.role?.name?.toLowerCase() === "super admin"
    ) {
      return true;
    }
    const creatorId = task?.creatorId || task?.createdById || task?.creator?.id;
    if (creatorId && Number(creatorId) === Number(authUser.id)) {
      return true;
    }
    if (!task?.assignees || task.assignees.length === 0) {
      return true;
    }
    const assignee = task.assignees?.find(
      (a) => a?.assignedOn?.user?.id === authUser.id || a?.assignedOn?.userId === authUser.id,
    );
    return !assignee || assignee?.taskRoleId === 87 || assignee?.taskRoleId === 88;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${priorityClass}`}
          >
            {task.priority?.name}
          </span>
        </div>

        <h5 className="mt-2 font-semibold text-gray-800 dark:text-gray-200 text-sm">
          {task.name}
        </h5>
      </div>

      {/* Body */}
      <div className="px-4 py-2">
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded text-xs"
              >
                <Tag size={10} className="mr-1" />
                {tag.name}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs text-gray-500">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {/* Assignees */}

            <SimpleTooltip text={`${task.assignees?.length || 0} assignees`}>
              <button
                onClick={() => onViewAssignees(task)}
                className="flex items-center cursor-pointer"
              >
                {task.assignees?.slice(0, 3).map((assignee, index) => {
                  const user = assignee.assignedOn.user;
                  const profileUrl = user?.profile?.profilePicture?.fileUrl;

                  const overlapClass = index !== 0 ? "-ml-3.5" : "";

                  return profileUrl ? (
                    <img
                      key={user.id}
                      src={profileUrl}
                      alt={user?.fullName}
                      className={`w-7 h-7 rounded-full object-cover border-2 border-white ${overlapClass}`}
                      style={{ zIndex: 10 - index }}
                    />
                  ) : (
                    <div
                      key={user.id}
                      className={overlapClass}
                      style={{ zIndex: 10 - index }}
                    >
                      <Avatar
                        text={helpers.avatarText(user?.fullName)}
                        color="info"
                        size="md"
                      />
                    </div>
                  );
                })}

                {task.assignees?.length > 3 && (
                  <span className="-ml-3.5 w-8 h-8 flex items-center justify-center text-xs font-medium bg-gray-200 rounded-full border-2 border-white">
                    +{task.assignees.length - 3}
                  </span>
                )}
              </button>
            </SimpleTooltip>

            {/* Comments */}
            <SimpleTooltip text={`${task.comments?.length || 0} comments`}>
              <button
                onClick={() => onViewComments(task)}
                className="flex items-center gap-1 hover:text-green-500"
              >
                <MessageSquare size={14} />
                <span>{task.comments?.length || 0}</span>
              </button>
            </SimpleTooltip>

            {/* Due Date */}
            {task.dueDate && (
              <SimpleTooltip text={`Due: ${helpers.dDate(task.dueDate)}`}>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{helpers.dDate(task.dueDate)}</span>
                </div>
              </SimpleTooltip>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <SimpleTooltip text="View Task">
              <button
                onClick={() => onEdit(task, true)} // 👈 view = true
                className="icon-btn icon-btn-outlined-primary icon-btn-sm"
              >
                <Eye size={14} />
              </button>
            </SimpleTooltip>

            {isTaskAssigneeAdminOrEditor(task) && (
              <SimpleTooltip text="Edit Task">
                <button
                  onClick={() => onEdit(task)}
                  className="icon-btn icon-btn-outlined-info icon-btn-sm"
                >
                  <Pencil size={14} />
                </button>
              </SimpleTooltip>
            )}

            {isTaskAssigneeAdminOrEditor(task) && (
              <SimpleTooltip text="Delete Task">
                <button
                  onClick={() => onDelete(task.id)}
                  className="icon-btn icon-btn-outlined-danger icon-btn-sm"
                >
                  <Trash2 size={14} />
                </button>
              </SimpleTooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskBoardView;
