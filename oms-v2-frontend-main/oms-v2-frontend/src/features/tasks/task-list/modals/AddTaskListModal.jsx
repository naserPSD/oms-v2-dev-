import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import DatePicker from "@/components/ui/DatePicker";
import React, { useEffect, useState } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { BiX, BiPlus, BiTrash, BiInfoCircle } from "react-icons/bi";

const AddTaskListModal = ({
  showModal,
  handleClose,
  control,
  handleSubmit,
  submitForm,
  isEditing,
  isLoading,
  dropdowns,
  canEditTask,
}) => {
  const [tagInput, setTagInput] = useState("");

  // 🔒 View-only mode
  const isReadOnly = isEditing && !canEditTask;

  // Dynamic fields for task assignees
  const { fields, append, remove } = useFieldArray({
    control,
    name: "taskAssignees",
  });

  // Watch assignees dynamically for live preview and filtering
  const watchedAssignees = useWatch({
    control,
    name: "taskAssignees",
  });

  const employeeCount = (dropdowns?.employees || []).length;

  const selectedEmployeeIds = (watchedAssignees || [])
    ?.map((f) => f?.assignedOnId)
    ?.filter((id) => id && id > 0);

  const getEmployeeOptions = (currentIndex) => {
    const currentId = watchedAssignees?.[currentIndex]?.assignedOnId;
    return (dropdowns?.employees || []).filter((emp) => {
      return (
        emp.value === currentId ||
        !selectedEmployeeIds?.includes(emp.value)
      );
    });
  };

  const addAssignee = () => {
    if (isReadOnly) return;
    append({ taskRoleId: 0, assignedOnId: 0 });
  };

  const handleAddTag = (tags, onChange) => {
    if (isReadOnly) return;
    const currentTags = Array.isArray(tags) ? tags : [];
    const trimmed = tagInput.trim();
    if (trimmed && !currentTags.includes(trimmed)) {
      onChange([...currentTags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tags, onChange, index) => {
    if (isReadOnly) return;
    const currentTags = Array.isArray(tags) ? tags : [];
    onChange(currentTags.filter((_, i) => i !== index));
  };

  const handleTagKeyPress = (e, tags, onChange) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(tags, onChange);
    }
  };

  useEffect(() => {
    if (showModal && fields.length === 0 && !isEditing && employeeCount > 0) {
      append({ taskRoleId: 0, assignedOnId: 0 });
    }
  }, [showModal, fields.length, append, isEditing, employeeCount]);

  useEffect(() => {
    if (!showModal) setTagInput("");
  }, [showModal]);

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title={
        isEditing
          ? canEditTask
            ? "Edit Task"
            : "View Task"
          : "Create New Task"
      }
      size="2xl"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="space-y-6">
          {/* Task Name - Primary Field at Top */}
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Input
                label="Task Name"
                required
                disabled={isReadOnly}
                placeholder="Enter Task Name..."
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />

          {/* Basic Information: Task Card & Parent Task */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task Card - Always visible and selectable */}
            <Controller
              name="cardId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Task Card"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isReadOnly}
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
                  label="Parent Task (Optional)"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isReadOnly}
                  error={fieldState.error?.message}
                  options={dropdowns.parentTaskList || []}
                  placeholder="Select Parent Task (Optional)"
                  clearable={true}
                />
              )}
            />
          </div>

          {/* Schedule & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority */}
            <Controller
              name="priorityId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Task Priority"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isReadOnly}
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
                  required
                  placeholder="Enter Serial Number..."
                  value={field.value}
                  disabled={isReadOnly}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  min={1}
                  {...field}
                />
              )}
            />

            {/* Due Date */}
            <Controller
              control={control}
              name="dueDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Due Date"
                  required
                  placeholder="Select Due Date"
                  value={field.value || ""}
                  disabled={isReadOnly}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  clearable={true}
                  compact={true}
                  inputClassName="h-[38px] min-h-[38px] text-xs"
                />
              )}
            />
          </div>

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
                  rows={3}
                  disabled={isReadOnly}
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

          {/* Task Assignees - Dynamic Fields */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Task Assignees
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Assign Team Members with Specific Roles to This Task (Optional)
                </p>
              </div>

              {!isReadOnly && employeeCount > 0 && (
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
              )}
            </div>

            {/* Information notice when company has 0 employees */}
            {employeeCount === 0 && (
              <div className="flex items-start gap-3 p-3.5 mb-4 text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg text-amber-800 dark:text-amber-300">
                <BiInfoCircle className="w-5 h-5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    No Team Members Found in this Company
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                    Task assignees are loaded from your company's Employee List. You have not registered any employees in HR yet for this company. You can safely save this task without assignees, or register employees first in HR.
                  </p>
                  <a
                    href="/hr-dashboard/employee?tab=employee-list"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    + Add Employee in HR &rarr;
                  </a>
                </div>
              </div>
            )}

            {fields.length === 0 ? (
              <div className="text-center py-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No assignees added yet (optional)
                </p>
                {!isReadOnly && employeeCount > 0 && (
                  <ButtonTw
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAssignee}
                    className="mt-2 gap-1 text-xs"
                  >
                    <BiPlus /> Add Assignee
                  </ButtonTw>
                )}
              </div>
            ) : (
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
                                disabled={isReadOnly}
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
                            <SelectSearch
                              label={`Assignee ${index + 1}`}
                              value={assigneeField.value}
                              onChange={assigneeField.onChange}
                              options={getEmployeeOptions(index)}
                              placeholder="Select Team Member"
                              error={fieldState.error?.message}
                              disabled={isReadOnly}
                              showAvatar={true}
                              showId={true}
                              labelKey="label"
                              valueKey="value"
                              avatarKey="avatarUrl"
                              idKeyName="code"
                              idKeyLabel="Code"
                              showDesignation={true}
                              designationKey="designation"
                              emptyAction={{
                                label: "+ Add Employee in HR",
                                href: "/hr-dashboard/employee?tab=employee-list",
                              }}
                            />
                          )}
                        />
                      </div>

                      {/* Action Buttons - 2 columns */}
                      <div className="col-span-2 flex gap-2 items-center justify-end h-full">
                        {/* Add Button - Show only on last row */}
                        {!isReadOnly && index === fields.length - 1 && (
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

                        {/* Remove Button */}
                        {!isReadOnly && (
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
                    {watchedAssignees?.[index]?.taskRoleId > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {`Role: ${
                            dropdowns.taskAssigneeRole?.find(
                              (r) => r.value === watchedAssignees[index].taskRoleId,
                            )?.label || "Not selected"
                          } | `}
                          {`Assignee: ${
                            dropdowns.employees?.find(
                              (e) => e.value === watchedAssignees[index].assignedOnId,
                            )?.label || "Not selected"
                          }`}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {fields.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Assignees:{" "}
                      <span className="font-bold">{fields.length}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Click + to Add More Assignees
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
                    disabled={isReadOnly}
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
                    disabled={!tagInput.trim() || isReadOnly}
                  >
                    Add Tag
                  </ButtonTw>
                </div>

                {/* Tags Display */}
                {Array.isArray(field.value) && field.value.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {field.value.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-lg text-sm transition-all hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        <span className="font-medium">#{tag}</span>
                        <button
                          type="button"
                          disabled={isReadOnly}
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
                      No Tags Added Yet
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add Tags to Better Organize This Task
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {(!isEditing || canEditTask) && (
              <ButtonTw
                type="submit"
                variant="blue"
                className="flex-1"
                loading={isLoading}
              >
                {isEditing ? "Update Task" : "Create Task"}
              </ButtonTw>
            )}

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

export default AddTaskListModal;
