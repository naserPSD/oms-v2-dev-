"use client";
import React from "react";
import { ModalTw } from "@/components/common/ModalTw";

const DeleteConfirmationModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  title = "Delete this item?",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
}) => {
  return (
    <ModalTw
      show={show}
      onClose={onClose}
      title={title}
      type="confirmation"
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            onClick={onClose}
            disabled={isLoading}
            type="button"
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            type="button"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[70px]"
          >
            {isLoading ? "Deleting..." : confirmText}
          </button>
        </div>
      }
    >
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {message}
      </div>
    </ModalTw>
  );
};

export default DeleteConfirmationModal;

