"use client";
import { FormController as Controller } from "@/components/common/FormController";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useForm } from "react-hook-form";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const LeadContacts = ({ contacts = [], onAdd, onUpdate, onDelete, isLoading }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);


  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      name: "",
      email: "",
      department: "",
      designation: "",
      phone: "",
      alternativePhone: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      if (editingIndex !== null) {
        await onUpdate(editingIndex, data);
        setEditingIndex(null);
        setShowAddForm(false);
      } else {
        await onAdd(data);
        setShowAddForm(false);
      }
      reset();
    } catch (error) {
      // Error is handled by the parent component
      console.error('Error in onSubmit:', error);
    }
  };

  const handleEdit = (index) => {
    const contact = contacts[index];
    if (!contact) return;
    
    reset({
      name: contact.name || "",
      email: contact.email || "",
      department: contact.department || "",
      designation: contact.designation || "",
      phone: contact.phone || "",
      alternativePhone: contact.alternativePhone || "",
    });
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    reset();
    setShowAddForm(false);
    setEditingIndex(null);
  };

  const handleDeleteClick = (index) => {
    setContactToDelete(index);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (contactToDelete !== null) {
      await onDelete(contactToDelete);
      setShowDeleteModal(false);
      setContactToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setContactToDelete(null);
  };

  return (
    <Card className="rounded-2xl shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg font-semibold dark-title-color">Other Contacts</h3>
          {!showAddForm && (
            <ButtonTw
              variant="blue"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Add Contact
            </ButtonTw>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    label="Name"
                    placeholder="enter name"
                    value={field.value}
                    onChange={field.onChange}
                    required
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    label="Email"
                    type="email"
                    placeholder="enter email"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                control={control}
                name="department"
                render={({ field }) => (
                  <Input
                    label="Department"
                    placeholder="enter department"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                control={control}
                name="designation"
                render={({ field }) => (
                  <Input
                    label="Designation"
                    placeholder="enter designation"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <Input
                    label="Phone"
                    placeholder="enter phone number"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                control={control}
                name="alternativePhone"
                render={({ field }) => (
                  <Input
                    label="Alternative Phone"
                    placeholder="enter alternative phone"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <ButtonTw
                type="submit"
                variant="blue"
                size="sm"
                disabled={isLoading}
                loading={isLoading}
              >
                {editingIndex !== null ? "Update" : "Add"} Contact
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

        {/* Contacts List */}
        <div className="space-y-3">
          {!contacts || contacts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No contacts added yet.</p>
          ) : (
            contacts
              .map((contact, index) => {
                // Skip empty or invalid contacts
                if (!contact || (!contact.name && !contact.email && !contact.phone)) {
                  return null;
                }
                
                return (
                  <div
                    key={`contact-${index}-${contact.email || contact.phone || contact.name || index}`}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{contact.name || 'Unnamed Contact'}</div>
                        {(contact.designation || contact.department) && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {contact.designation || ''}
                            {contact.designation && contact.department ? ' - ' : ''}
                            {contact.department || ''}
                          </div>
                        )}
                        <div className="mt-2 space-y-1">
                          {contact.email && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              📧 {contact.email}
                            </div>
                          )}
                          {contact.phone && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              📞 {contact.phone}
                            </div>
                          )}
                          {contact.alternativePhone && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              📱 {contact.alternativePhone}
                            </div>
                          )}
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
          title="Delete Contact"
          message="Are you sure you want to delete this contact? This action cannot be undone."
        />
      </CardContent>
    </Card>
  );
};

export default LeadContacts;

