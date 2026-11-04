import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import React, { useEffect, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { BiX, BiPlus, BiTrash } from "react-icons/bi";

const AddOrUpdateTaskListModal = ({
  showModal,
  handleClose,
  control,
  handleSubmit,
  submitForm,
  isEditing,
  isLoading,
  dropdowns,
  workspaceOptions,
  taskBoardOptions,
}) => {
  const [tagInput, setTagInput] = useState("");

  // Dynamic fields for task assignees
  const { fields, append, remove } = useFieldArray({
    control,
    name: "taskAssignees",
  });

  // Add new assignee row
  const addAssignee = () => {
    append({
      taskRoleId: 0,
      assignedOnId: 0,
    });
  };

  // Add tag function
  const handleAddTag = (tags, onChange) => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onChange([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Remove tag function
  const handleRemoveTag = (tags, onChange, index) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags);
  };

  // Handle tag input key press
  const handleTagKeyPress = (e, tags, onChange) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(tags, onChange);
    }
  };

  useEffect(() => {
    if (showModal && fields.length === 0 && !isEditing) {
      append({
        taskRoleId: 0,
        assignedOnId: 0,
      });
    }
  }, [showModal, fields.length, append, isEditing]);

  // Reset tags when modal closes
  useEffect(() => {
    if (!showModal) {
      setTagInput("");
    }
  }, [showModal]);
  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title={isEditing ? "Edit Task" : "Create New Task"}
      size="2xl"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task Card */}
            <Controller
              name="cardId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Task Card"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={dropdowns.taskCards || []}
                  placeholder="Select Task Card"
                />
              )}
            />

            {/* Parent Task */}
            <Controller
              name="parentTaskId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Parent Task"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={dropdowns.parentTaskList || []}
                  placeholder="Select Parent Task (Optional)"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority */}
            <Controller
              name="priorityId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Task Priority"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={dropdowns.taskPriorities || []}
                  placeholder="Select Task Priority"
                />
              )}
            />

            {/* Serial Number */}
            <Controller
              control={control}
              name="serial"
              render={({ field, fieldState }) => (
                <Input
                  label="Serial Number"
                  type="number"
                  placeholder="Enter Serial Number..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  min={1}
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name="dueDate"
              render={({ field, fieldState }) => (
                <Input
                  label="Due Date"
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="workspaceId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Workspace"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={workspaceOptions}
                  placeholder="Select workspace..."
                  required
                />
              )}
            />
            <Controller
              name="boardId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Board"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={taskBoardOptions}
                  placeholder="Select Board..."
                  required
                />
              )}
            />
          </div>

          {/* Task Assignees - Dynamic Fields (Improved Design) */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Task Assignees
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Assign Team Members with Specific Roles to This Task
                </p>
              </div>
              <ButtonTw
                type="button"
                variant="outline"
                size="sm"
                onClick={addAssignee}
                className="gap-2"
              >
                <BiPlus />
                Add More
              </ButtonTw>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <div className="grid grid-cols-12 gap-4 items-end">
                    {/* Task Role - 5 columns */}
                    <div className="col-span-5">
                      <Controller
                        control={control}
                        name={`taskAssignees.${index}.taskRoleId`}
                        render={({ field: roleField, fieldState }) => (
                          <div>
                            <SelectSearch
                              label={`Role ${index + 1}`}
                              value={roleField.value}
                              onChange={roleField.onChange}
                              options={dropdowns.taskAssigneeRole || []}
                              placeholder="Select Role (e.g., Assignee, Reviewer)"
                              error={fieldState.error?.message}
                            />
                          </div>
                        )}
                      />
                    </div>

                    {/* Assigned To - 5 columns */}
                    <div className="col-span-5">
                      <Controller
                        control={control}
                        name={`taskAssignees.${index}.assignedOnId`}
                        render={({ field: assigneeField, fieldState }) => (
                          <div>
                            <SelectSearch
                              label={`Assignee ${index + 1}`}
                              value={assigneeField.value}
                              onChange={assigneeField.onChange}
                              options={dropdowns.employees || []}
                              placeholder="Select Team Member"
                              error={fieldState.error?.message}
                              showAvatar={true}
                              showId={true}
                              labelKey="label"
                              valueKey="value"
                              avatarKey="avatarUrl"
                              idKey="employeeId"
                            />
                          </div>
                        )}
                      />
                    </div>

                    {/* Action Buttons - 2 columns */}
                    <div className="col-span-2 flex gap-2 items-center justify-end h-full">
                      {/* Add Button - Show only on last row */}
                      {index === fields.length - 1 && (
                        <ButtonTw
                          type="button"
                          variant="success"
                          size="sm"
                          onClick={addAssignee}
                          className="h-10 w-10 flex items-center justify-center"
                          title="Add another assignee"
                        >
                          <BiPlus size={16} />
                        </ButtonTw>
                      )}

                      {/* Remove Button - Show only if more than one row exists */}
                      {fields.length > 1 && (
                        <ButtonTw
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => remove(index)}
                          className="h-10 w-10 flex items-center justify-center"
                          title="Remove this assignee"
                        >
                          <BiTrash size={16} />
                        </ButtonTw>
                      )}
                    </div>
                  </div>

                  {/* Helper text for selected values */}
                  {fields[index]?.taskRoleId > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {`Role: ${
                          dropdowns.taskAssigneeRole?.find(
                            (r) => r.value === fields[index].taskRoleId,
                          )?.label || "Not selected"
                        } | `}
                        {`Assignee: ${
                          dropdowns.employees?.find(
                            (e) => e.value === fields[index].assignedOnId,
                          )?.label || "Not selected"
                        }`}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            {fields.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Assignees:{" "}
                      <span className="font-bold">{fields.length}</span>
                    </p>
                    {/* <p className="text-xs text-gray-500 mt-1">
                      {
                        fields.filter(
                          (f) => f.taskRoleId > 0 && f.assignedOnId > 0
                        ).length
                      }{" "}
                      assigned,
                      {` ${
                        fields.filter(
                          (f) => f.taskRoleId === 0 || f.assignedOnId === 0
                        ).length
                      } pending selection`}
                    </p> */}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Click + to add more assignees
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Task Tags */}
          <Controller
            name="taskTags"
            control={control}
            render={({ field, fieldState }) => (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Task Tags
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Add Tags to Categorize and Filter Tasks (Press Enter to Add)
                  </p>
                </div>

                {/* Tag Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) =>
                      handleTagKeyPress(e, field.value, field.onChange)
                    }
                    placeholder="Type Tag and Press Enter..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <ButtonTw
                    type="button"
                    variant="outline"
                    onClick={() => handleAddTag(field.value, field.onChange)}
                    disabled={!tagInput.trim()}
                  >
                    Add Tag
                  </ButtonTw>
                </div>

                {/* Tags Display */}
                {field.value && field.value.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {field.value.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-lg text-sm transition-all hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        <span className="font-medium">#{tag}</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveTag(field.value, field.onChange, index)
                          }
                          className="ml-1 hover:text-blue-600 dark:hover:text-blue-200"
                          title="Remove tag"
                        >
                          <BiX size={16} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">
                      No tags added yet
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add tags to better organize this task
                    </p>
                  </div>
                )}

                {fieldState.error?.message && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Task Name */}
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Input
                label="Task Name"
                placeholder="Enter Task Name..."
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />

          {/* Description */}
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                  <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                </label>
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Enter Task Description..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
                {fieldState.error?.message && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Date Fields */}
          {/* <div className="grid grid-cols-1  gap-4">
           

         <Controller
              control={control}
              name="completedAt"
              render={({ field, fieldState }) => (
                <Input
                  label="Completed At"
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  {...field}
                />
              )}
            /> 
          </div> */}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <ButtonTw
              type="submit"
              variant="blue"
              className="flex-1"
              disabled={isLoading}
              loading={isLoading}
            >
              {isEditing ? "Update Task" : "Create Task"}
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

export default AddOrUpdateTaskListModal;
