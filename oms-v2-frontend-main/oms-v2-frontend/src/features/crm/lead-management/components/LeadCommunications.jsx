"use client";
import { FormController as Controller } from "@/components/common/FormController";
import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useForm } from "react-hook-form";
import helpers from "@/utils/helpers";
import { Badge } from "@/components/ui/badge";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const COMMUNICATION_TYPES = [
  { value: "Call", label: "Call" },
  { value: "Appointment", label: "Appointment" },
  { value: "Task", label: "Task" },
];

const COMMUNICATION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_process", label: "In Process" },
  { value: "done", label: "Done" },
];

const LeadCommunications = ({
  communications = [],
  onAdd,
  onUpdate,
  onDelete,
  isLoading = false,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [selectedType, setSelectedType] = useState("Call");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);

  //console.log("communicationstap", communications);

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      activityType: "Call",
      description: "",
      activityDate: "",
      status: "pending",
    },
  });

  const callActivities = useMemo(() => {
    return communications.filter((a) => {
      const type = String(a?.type || a?.activityType || "")
        .trim()
        .toLowerCase();
      return type === "call";
    });
  }, [communications]);

  const appointmentActivities = useMemo(() => {
    return communications.filter((a) => {
      const type = String(a?.type || a?.activityType || "")
        .trim()
        .toLowerCase();
      return type === "appointment" || type === "meeting";
    });
  }, [communications]);

  const taskActivities = useMemo(() => {
    return communications.filter((a) => {
      const type = String(a?.type || a?.activityType || "")
        .trim()
        .toLowerCase();
      return type === "task";
    });
  }, [communications]);

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "in_process":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case "done":
        return "Done";
      case "in_process":
        return "In Process";
      default:
        return "Pending";
    }
  };

  const getActivityId = (activity) => {
    if (!activity) return null;

    let id = activity._id || activity.id || activity.communicationId;

    if (!id) {
      const allKeys = Object.keys(activity);
      for (const key of allKeys) {
        if (key.toLowerCase().includes("id") || key === "_id") {
          id = activity[key];
          break;
        }
      }
    }

    if (!id) return null;

    if (typeof id === "string") {
      const trimmed = id.trim();
      if (trimmed && trimmed !== "[object Object]" && trimmed.length > 0) {
        return trimmed;
      }
    }

    if (id && typeof id === "object") {
      if (id.toString && typeof id.toString === "function") {
        const str = id.toString();
        if (
          str &&
          str !== "[object Object]" &&
          str.length > 0 &&
          str.length === 24
        ) {
          return str.trim();
        }
      }
      const nestedId = id._id || id.id;
      if (nestedId) {
        return String(nestedId).trim();
      }
    }

    if (typeof id === "number") {
      return String(id);
    }

    try {
      const result = String(id).trim();
      if (result && result !== "[object Object]" && result.length > 0) {
        return result;
      }
    } catch (e) {
      console.error("Error converting ID to string:", e);
    }

    return null;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!data.activityType) {
        helpers.toaster("Activity type is required", "error");
        return;
      }
      if (!data.description || data.description.trim() === "") {
        helpers.toaster("Description is required", "error");
        return;
      }
      if (!data.activityDate || data.activityDate.trim() === "") {
        helpers.toaster("Date & Time is required", "error");
        return;
      }

      if (editingActivity) {
        let activityId = null;

        // Try to get ID from editingActivity (which should have _id and id set from handleEdit)
        if (editingActivity._id) {
          if (
            typeof editingActivity._id === "object" &&
            editingActivity._id.toString &&
            typeof editingActivity._id.toString === "function"
          ) {
            activityId = editingActivity._id.toString().trim();
          } else {
            activityId = String(editingActivity._id).trim();
          }
        } else if (editingActivity.id) {
          if (
            typeof editingActivity.id === "object" &&
            editingActivity.id.toString &&
            typeof editingActivity.id.toString === "function"
          ) {
            activityId = editingActivity.id.toString().trim();
          } else {
            activityId = String(editingActivity.id).trim();
          }
        } else {
          activityId = getActivityId(editingActivity);
        }

        if (
          !activityId ||
          activityId === "[object Object]" ||
          activityId.length === 0
        ) {
          console.error(
            "Cannot update: Activity ID is missing or invalid",
            editingActivity,
          );
          helpers.toaster(
            "Cannot update: Activity ID is missing or invalid",
            "error",
          );
          return;
        }

        console.log("Updating communication with ID:", activityId);

        await onUpdate(activityId, {
          type: data.activityType,
          description: data.description,
          activityDate: data.activityDate,
          status: data.status,
        });
        setEditingActivity(null);
        setShowAddForm(false);
      } else {
        await onAdd({
          type: data.activityType,
          description: data.description,
          activityDate: data.activityDate,
          status: data.status,
        });
        setShowAddForm(false);
      }
      reset({
        activityType: selectedType,
        description: "",
        activityDate: "",
        status: "pending",
      });
    } catch (error) {
      console.error("Error submitting communication:", error);
    }
  };

  const handleEdit = (activity, idRef) => {
    if (
      !activity ||
      (typeof activity === "object" && Object.keys(activity).length === 0)
    ) {
      helpers.toaster("Cannot edit: Activity data is missing", "error");
      return;
    }

    let activityId = idRef;

    // If idRef is not available, extract ID from activity object
    if (
      !activityId ||
      activityId === "[object Object]" ||
      activityId.length === 0
    ) {
      // Try to extract from _id (MongoDB standard)
      if (activity._id) {
        if (
          typeof activity._id === "object" &&
          activity._id.toString &&
          typeof activity._id.toString === "function"
        ) {
          activityId = activity._id.toString().trim();
        } else {
          activityId = String(activity._id).trim();
        }
      }
      // Try to extract from id field
      else if (activity.id) {
        if (
          typeof activity.id === "object" &&
          activity.id.toString &&
          typeof activity.id.toString === "function"
        ) {
          activityId = activity.id.toString().trim();
        } else {
          activityId = String(activity.id).trim();
        }
      }
      // Fallback to getActivityId helper
      else {
        activityId = getActivityId(activity);
      }
    }

    if (
      !activityId ||
      activityId === "[object Object]" ||
      activityId.length === 0
    ) {
      console.error("Cannot edit: Activity ID is missing", activity);
      helpers.toaster("Cannot edit: Activity ID is missing", "error");
      return;
    }

    const activityDate = activity.activityDate || activity.createdAt;
    const dateStr = activityDate
      ? new Date(activityDate).toISOString().slice(0, 16)
      : "";

    const activityWithId = {
      ...activity,
      _id: activityId,
      id: activityId,
    };

    setEditingActivity(activityWithId);
    setShowAddForm(true);
    const activityType = activity.type || activity.activityType || "Call";
    setSelectedType(activityType);

    setValue("activityType", activityType);
    setValue("description", activity.description || "");
    setValue("activityDate", dateStr);
    setValue("status", activity.status || "pending");
  };

  const handleDeleteClick = (activity) => {
    if (
      !activity ||
      (typeof activity === "object" && Object.keys(activity).length === 0)
    ) {
      helpers.toaster("Cannot delete: Activity data is missing", "error");
      return;
    }

    setActivityToDelete(activity);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activityToDelete) {
      helpers.toaster("Cannot delete: Activity data is missing", "error");
      setShowDeleteModal(false);
      return;
    }

    let activityId = null;
    if (activityToDelete._id) {
      if (
        typeof activityToDelete._id === "object" &&
        activityToDelete._id.toString
      ) {
        activityId = activityToDelete._id.toString().trim();
      } else {
        activityId = String(activityToDelete._id).trim();
      }
    } else if (activityToDelete.id) {
      if (
        typeof activityToDelete.id === "object" &&
        activityToDelete.id.toString
      ) {
        activityId = activityToDelete.id.toString().trim();
      } else {
        activityId = String(activityToDelete.id).trim();
      }
    } else {
      activityId = getActivityId(activityToDelete);
    }

    if (
      !activityId ||
      activityId === "[object Object]" ||
      activityId.length === 0
    ) {
      helpers.toaster("Cannot delete: Activity ID is missing", "error");
      setShowDeleteModal(false);
      setActivityToDelete(null);
      return;
    }

    try {
      await onDelete(activityId);
      setShowDeleteModal(false);
      setActivityToDelete(null);
    } catch (error) {
      console.error("Error deleting communication:", error);
      helpers.toaster("Failed to delete communication", "error");
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingActivity(null);
    reset({
      activityType: selectedType,
      description: "",
      activityDate: "",
      status: "pending",
    });
  };

  const renderActivityList = (activities, type) => {
    console.log(
      `renderActivityList for ${type}:`,
      activities.length,
      activities,
    );

    if (!activities || activities.length === 0) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
          No {type.toLowerCase()}s yet.
        </div>
      );
    }

    // Filter out null/undefined activities, but allow rendering even without IDs
    const validActivities = activities.filter((activity, index) => {
      if (!activity) {
        console.warn(`Activity at index ${index} is null/undefined`);
        return false;
      }
      return true;
    });

    console.log(
      `Valid activities for ${type}:`,
      validActivities.length,
      "out of",
      activities.length,
    );
    console.log(`Sample activity data:`, validActivities[0]);

    if (validActivities.length === 0) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
          No {type.toLowerCase()}s yet.
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {validActivities.map((activity, index) => {
          // Get the ID - handle MongoDB ObjectId objects and strings
          let activityId = null;

          // Direct access to common MongoDB fields first (most reliable)
          if (activity) {
            // Check _id first (MongoDB standard)
            if (activity._id) {
              // Handle ObjectId object
              if (typeof activity._id === "object" && activity._id.toString) {
                activityId = activity._id.toString().trim();
              } else {
                activityId = String(activity._id).trim();
              }
            }
            // Check id field
            else if (activity.id) {
              if (typeof activity.id === "object" && activity.id.toString) {
                activityId = activity.id.toString().trim();
              } else {
                activityId = String(activity.id).trim();
              }
            }
            // Fallback to getActivityId
            else {
              activityId = getActivityId(activity);
            }
          }

          if (
            !activityId ||
            activityId === "[object Object]" ||
            activityId.length === 0
          ) {
            console.warn(
              "Activity ID not found for activity at index",
              index,
              activity,
            );
            activityId = `temp-${index}-${Date.now()}`;
          }

          // Ensure activity has both _id and id for consistency
          const activityRef = {
            ...activity,
            _id: activityId,
            id: activityId,
          };
          const idRef = activityId;

          return (
            <div
              key={activityId || `activity-${index}`}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activity.description || "No description"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(activity.activityDate || activity.createdAt)}
                    </span>
                    <Badge
                      className={getStatusColor(activity.status || "pending")}
                    >
                      {getStatusLabel(activity.status || "pending")}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEdit(activity, idRef);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteClick(activity);
                    }}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Communication</h3>
          {!showAddForm && (
            <ButtonTw
              onClick={() => {
                setShowAddForm(true);
                setEditingActivity(null);
                reset({
                  activityType: selectedType,
                  description: "",
                  activityDate: "",
                  status: "pending",
                });
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Communication
            </ButtonTw>
          )}
        </div>

        {showAddForm && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="activityType"
                render={({ field }) => (
                  <SelectSearch
                    label="Type"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setSelectedType(value);
                    }}
                    options={COMMUNICATION_TYPES}
                    required
                  />
                )}
              />

              <Controller
                control={control}
                name="activityDate"
                render={({ field }) => (
                  <Input
                    label="Date & Time"
                    type="datetime-local"
                    value={field.value}
                    onChange={field.onChange}
                    required
                  />
                )}
              />
            </div>

            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Input
                  label="Description"
                  placeholder="Enter Description"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  className="mt-4"
                />
              )}
            />

            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Status
              </label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <select
                    {...field}
                    className="block w-full p-2 text-sm text-gray-900 border bg-gray-50 focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    {COMMUNICATION_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <ButtonTw type="submit" disabled={isLoading}>
                {editingActivity ? "Update" : "Add"} Communication
              </ButtonTw>
              <ButtonTw type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </ButtonTw>
            </div>
          </form>
        )}

        <Tabs defaultValue="call" className="mt-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="call">
              Call ({callActivities.length})
            </TabsTrigger>
            <TabsTrigger value="appointment">
              Appointment ({appointmentActivities.length})
            </TabsTrigger>
            <TabsTrigger value="task">
              Task ({taskActivities.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="call" className="mt-3">
            {renderActivityList(callActivities, "Call")}
          </TabsContent>
          <TabsContent value="appointment" className="mt-3">
            {renderActivityList(appointmentActivities, "Appointment")}
          </TabsContent>
          <TabsContent value="task" className="mt-3">
            {renderActivityList(taskActivities, "Task")}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setActivityToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Communication"
        message="Are you sure you want to delete this communication? This action cannot be undone."
      />
    </Card>
  );
};

export default LeadCommunications;
