import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import { FormController as Controller } from "@/components/common/FormController";
import { useState } from "react";
import SelectSearch from "@/components/ui/SelectSearch";

const AddOrUpdateTaskCardModal = ({
  showModal,
  handleClose,
  isEditing,
  control,
  handleSubmit,
  submitForm,
  isLoading,
  workspaceOptions,
  taskBoardOptions,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Predefined color options - organized by color groups
  const colorOptions = [
    // Grayscale
    [
      "#ffffff",
      "#f8fafc",
      "#e2e8f0",
      "#cbd5e1",
      "#94a3b8",
      "#64748b",
      "#475569",
      "#334155",
      "#1e293b",
      "#0f172a",
      "#000000",
    ],

    // Reds
    [
      "#fef2f2",
      "#fecaca",
      "#fca5a5",
      "#f87171",
      "#ef4444",
      "#dc2626",
      "#b91c1c",
      "#991b1b",
      "#7f1d1d",
    ],

    // Oranges
    [
      "#fff7ed",
      "#fed7aa",
      "#fdba74",
      "#fb923c",
      "#f97316",
      "#ea580c",
      "#c2410c",
      "#9a3412",
      "#7c2d12",
    ],

    // Yellows
    [
      "#fefce8",
      "#fef08a",
      "#fde047",
      "#facc15",
      "#eab308",
      "#ca8a04",
      "#a16207",
      "#854d0e",
      "#713f12",
    ],

    // Greens
    [
      "#f0fdf4",
      "#bbf7d0",
      "#86efac",
      "#4ade80",
      "#22c55e",
      "#16a34a",
      "#15803d",
      "#166534",
      "#14532d",
    ],

    // Blues
    [
      "#eff6ff",
      "#dbeafe",
      "#bfdbfe",
      "#93c5fd",
      "#60a5fa",
      "#3b82f6",
      "#2563eb",
      "#1d4ed8",
      "#1e40af",
    ],

    // Purples
    [
      "#faf5ff",
      "#e9d5ff",
      "#d8b4fe",
      "#c084fc",
      "#a855f7",
      "#9333ea",
      "#7e22ce",
      "#6b21a8",
      "#581c87",
    ],

    // Pinks
    [
      "#fdf2f8",
      "#fbcfe8",
      "#f9a8d4",
      "#f472b6",
      "#ec4899",
      "#db2777",
      "#be185d",
      "#9d174d",
      "#831843",
    ],
  ];

  //const allColors = colorOptions.flat();

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={isEditing ? "Edit Task Card" : "Create New Task Card"}
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
                  label="Task Card Name"
                  placeholder="Enter Task Card Name..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  required
                  {...field}
                />
              )}
            />

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
                  required
                  min={1}
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

            {/* Enhanced Color Picker */}
            <Controller
              control={control}
              name="color"
              render={({ field, fieldState }) => (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      <span>Color</span>
                      <span className="text-red-500 font-bold leading-none select-none">*</span>
                    </span>
                  </label>

                  {/* Color Input with Preview and Picker Toggle */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer shadow-sm"
                        style={{ backgroundColor: field.value }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="absolute -right-2 -top-2 w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center shadow-lg"
                      >
                        ⌵
                      </button>
                    </div>

                    <div className="flex-1">
                      <Input
                        placeholder="#ffffff"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  {/* Color Picker Dropdown */}
                  {showColorPicker && (
                    <div className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-full max-w-sm">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-sm">Choose a color</h4>
                        <button
                          type="button"
                          onClick={() => setShowColorPicker(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Color Groups */}
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {colorOptions.map((colorGroup, groupIndex) => (
                          <div
                            key={groupIndex}
                            className="flex gap-1 justify-between"
                          >
                            {colorGroup.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-6 h-6 rounded border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform ${
                                  field.value === color
                                    ? "ring-2 ring-blue-500 ring-offset-2"
                                    : ""
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                  field.onChange(color);
                                  setShowColorPicker(false);
                                }}
                                title={color}
                              />
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Custom Color Input */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Custom Color
                        </label>
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-full h-8 cursor-pointer rounded"
                        />
                      </div>
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

            {/* Active Status */}
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="active"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Active Task Card
                  </label>
                </div>
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
                {isEditing ? "Update Task Card" : "Create Task Card"}
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
    </div>
  );
};

export default AddOrUpdateTaskCardModal;
