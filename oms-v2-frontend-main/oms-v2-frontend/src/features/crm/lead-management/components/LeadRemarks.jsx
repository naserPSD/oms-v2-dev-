"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useForm } from "react-hook-form";
import helpers from "@/utils/helpers";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const LeadRemarks = ({ remarks = [], onAdd, onUpdate, onDelete, isLoading, userMap = null }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [remarkToDelete, setRemarkToDelete] = useState(null);

  // Prevent hydration mismatch by only rendering dates on client
  useEffect(() => {
    setIsMounted(true);
  }, []);


  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      remark: "",
    },
  });

  const onSubmit = async (data) => {
    if (editingIndex !== null) {
      // For updates, wait for the update to complete, then hide the form
      try {
        await onUpdate(editingIndex, data);
        // Hide form after successful update
        setEditingIndex(null);
        setShowAddForm(false);
        reset({ remark: "" }); // Explicitly reset to empty string
      } catch (error) {
        // If update fails, keep form open
        console.error("Error updating remark:", error);
      }
    } else {
      onAdd(data);
      setShowAddForm(false);
      reset({ remark: "" }); // Explicitly reset to empty string
    }
  };

  const handleEdit = (index) => {
    const remark = remarks[index];
    reset({
      remark: remark?.remark || remark?.text || remark?.message || remark?.content || "",
    });
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    reset({ remark: "" }); // Explicitly reset to empty string
    setShowAddForm(false);
    setEditingIndex(null);
  };

  const handleAddClick = () => {
    setEditingIndex(null);
    reset({ remark: "" });
    setShowAddForm(true);
  };

  const handleDeleteClick = (index) => {
    setRemarkToDelete(index);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (remarkToDelete !== null) {
      await onDelete(remarkToDelete);
      setShowDeleteModal(false);
      setRemarkToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setRemarkToDelete(null);
  };

  return (
    <Card className="rounded-2xl shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg font-semibold dark-title-color">Remarks</h3>
          {!showAddForm && (
            <ButtonTw
              variant="blue"
              size="sm"
              onClick={handleAddClick}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Add Remark
            </ButtonTw>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Controller
              control={control}
              name="remark"
              render={({ field }) => (
                <Input
                  label="Remark"
                  placeholder="enter remark"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  className="!mb-0"
                />
              )}
            />

            <div className="flex gap-2 mt-4">
              <ButtonTw
                type="submit"
                variant="blue"
                size="sm"
                disabled={isLoading}
                loading={isLoading}
              >
                {editingIndex !== null ? "Update" : "Add"} Remark
              </ButtonTw>
              <ButtonTw
                type="button"
                variant="outline.gray"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </ButtonTw>
            </div>
          </form>
        )}

        {/* Remarks List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {!remarks || !Array.isArray(remarks) || remarks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No remarks added yet.</p>
          ) : (
            remarks
              .map((remark, index) => {
                // Try multiple possible field names for the remark text
                const remarkText = remark?.remark || 
                                  remark?.text || 
                                  remark?.message || 
                                  remark?.content ||
                                  (typeof remark === 'string' ? remark : '') ||
                                  '';
                
                // Don't render if remark has no text or is just an empty object
                if (!remarkText || (!remarkText.trim() && Object.keys(remark || {}).length === 0)) {
                  console.warn(`Skipping remark at index ${index} - no text found:`, remark);
                  return null;
                }
                
                return (
                  <div
                    key={`remark-${index}-${remark?.createdAt || remark?._id || index}`}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">●</span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {remarkText}
                            </p>
                            {remark?.createdAt && isMounted && (() => {
                              const userId = remark?.createdBy?.toString() || remark?.createdBy;
                              // Try multiple ways to get user info from userMap
                              let userInfo = null;
                              if (userMap && userId) {
                                const userIdStr = String(userId).trim();
                                const userIdNum = Number(userId);
                                const isValidNum = !isNaN(userIdNum) && isFinite(userIdNum);
                                
                                // If userMap is a Map
                                if (userMap instanceof Map) {
                                  userInfo = userMap.get(userIdStr) || 
                                            (isValidNum ? userMap.get(userIdNum) : null) ||
                                            userMap.get(String(userIdStr)) ||
                                            userMap.get(String(userIdNum));
                                  
                                  // Also try searching through all entries if direct lookup fails
                                  if (!userInfo) {
                                    for (const [key, value] of userMap.entries()) {
                                      const keyStr = String(key);
                                      const keyNum = Number(key);
                                      if (keyStr === userIdStr || 
                                          (isValidNum && !isNaN(keyNum) && keyNum === userIdNum) ||
                                          (isValidNum && keyStr === String(userIdNum)) ||
                                          (isValidNum && String(keyNum) === userIdStr)) {
                                        userInfo = value;
                                        break;
                                      }
                                    }
                                  }
                                } else if (typeof userMap === 'object' && userMap !== null) {
                                  // If userMap is a plain object
                                  userInfo = userMap[userIdStr] || 
                                            (isValidNum ? userMap[userIdNum] : null) ||
                                            userMap[String(userIdStr)] ||
                                            userMap[String(userIdNum)];
                                  
                                  // Also try searching through all keys if direct lookup fails
                                  if (!userInfo) {
                                    const keys = Object.keys(userMap);
                                    for (const key of keys) {
                                      const keyStr = String(key);
                                      const keyNum = Number(key);
                                      if (keyStr === userIdStr || 
                                          (isValidNum && !isNaN(keyNum) && keyNum === userIdNum) ||
                                          (isValidNum && keyStr === String(userIdNum)) ||
                                          (isValidNum && String(keyNum) === userIdStr)) {
                                        userInfo = userMap[key];
                                        break;
                                      }
                                    }
                                  }
                                }
                              }
                              return (
                                <p className="text-xs text-gray-500 mt-1">
                                  {helpers.dDateTime(remark.createdAt)}
                                  {userInfo ? (
                                    <span className="ml-2">
                                      • {userInfo.name || 'Unknown User'}
                                    </span>
                                  ) : userId ? (
                                    <span className="ml-2 text-gray-400">
                                      • by User ID: {userId}
                                    </span>
                                  ) : null}
                                </p>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ButtonTw
                          variant="gray"
                          size="sm"
                          onClick={() => handleEdit(index)}
                          className="p-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </ButtonTw>
                        <ButtonTw
                          variant="red"
                          size="sm"
                          onClick={() => handleDeleteClick(index)}
                          className="p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </ButtonTw>
                      </div>
                    </div>
                  </div>
                );
              })
              .filter(Boolean) // Remove null entries
          )}
        </div>

        <DeleteConfirmationModal
          show={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Remark"
          message="Are you sure you want to delete this remark? This action cannot be undone."
        />
      </CardContent>
    </Card>
  );
};

export default LeadRemarks;

