"use client";
import React from "react";
import { ModalTw } from "@/components/common/ModalTw";

const DeleteConfirmationModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item? This action cannot be undone."
}) => {
  return (
    <ModalTw
      show={show}
      onClose={onClose}
      title={title}
      type="confirmation"
      size="sm"
      footer={
        <>
          <button
            onClick={onConfirm}
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Yes, Delete
          </button>
          <button
            onClick={onClose}
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
          >
            Cancel
          </button>
        </>
      }
    >
      {message}
    </ModalTw>
  );
};

export default DeleteConfirmationModal;

