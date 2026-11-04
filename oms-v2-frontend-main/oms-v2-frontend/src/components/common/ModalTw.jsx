"use client";

import { HiOutlineExclamationCircle, HiX } from "react-icons/hi";
import { useEffect, useRef } from "react";

export function ModalTw({
  children,
  title,
  subTitle,
  show,
  isOpen,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  size = "md",
  position = "center",
  type = "default",
  dismissible = true,
  showFooter = true,
  showHeader = true,
  footer,
}) {
  const isVisible = Boolean(show ?? isOpen);
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // if (dismissible && modalRef.current && !modalRef.current.contains(event.target)) {
      //     onClose();
      // }

      if (
        dismissible &&
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !event.target.closest(".flatpickr-calendar") &&
        !event.target.closest(".swal2-container") &&
        !event.target.closest("[data-slot='dropdown-menu-content']") &&
        !event.target.closest("[data-radix-popper-content-wrapper]") &&
        !event.target.closest("[data-slot='dropdown-menu-trigger']")
      ) {
        console.log("Clicked outside modal");
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isVisible, dismissible, onClose]);

  // Close modal on ESC key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (dismissible && event.key === "Escape" && isVisible) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, dismissible, onClose]);

  // Size classes
  const sizeClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  };

  // Position classes (container)
  const positionContainerClasses = {
    "top-left": "items-start justify-start",
    "top-right": "items-start justify-end",
    "top-center": "items-start justify-center",
    "bottom-left": "items-end justify-start",
    "bottom-right": "items-end justify-end",
    "bottom-center": "items-end justify-center",
    "center-left": "items-center justify-start",
    "center-right": "items-center justify-end",
    center: "items-center justify-center",
  };

  // Position classes (modal)
  const positionModalClasses = {
    "top-left": "sm:mt-4 sm:ml-4",
    "top-right": "sm:mt-4 sm:mr-4",
    "top-center": "sm:mt-4",
    "bottom-left": "sm:mb-4 sm:ml-4",
    "bottom-right": "sm:mb-4 sm:mr-4",
    "bottom-center": "sm:mb-4",
    "center-left": "sm:ml-4",
    "center-right": "sm:mr-4",
    center: "",
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-99 overflow-y-auto">
      {/* Improved overlay background */}
      <div
        className="fixed z-99 inset-0 bg-black/50 transition-opacity duration-300"
        style={{
          animation: "fadeIn 0.3s ease-out",
          backdropFilter: "blur(2px)",
        }}
      >

        {/* Modal container */}
        <div
          className={`flex z-99 h-screen overflow-y-auto items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0 ${positionContainerClasses[position]}`}
        >
          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          {/* Modal content */}
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className={`inline-block z-99  transform transition-all sm:my-8 sm:w-full ${sizeClasses[size]} ${positionModalClasses[position]} align-bottom bg-theme-light dark:bg-theme-dark text-left rounded-xl shadow-xl sm:align-middle`}
            style={{
              animation: position.includes("bottom")
                ? "slideUp 0.3s ease-out"
                : position.includes("top")
                  ? "slideDown 0.3s ease-out"
                  : "scaleUp 0.3s ease-out",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
          >
            {/* Header with border bottom */}
            {showHeader && (
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 rounded-t-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className="text-xl font-semibold text-gray-900 dark:text-white"
                      id="modal-headline"
                    >
                      {title}
                    </h3>

                    <p className="text-gray-500 text-sm">
                      {subTitle}
                    </p>
                  </div>
                  {dismissible && (
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-white focus:outline-none"
                      onClick={onClose}
                    >
                      <HiX className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* Body content */}
            <div
              className={`
            px-4 pt-4 pb-4 sm:p-6 sm:pb-4 dark:bg-gray-800 ${!showFooter ? 'rounded-b-xl' : ''} ${!showHeader ? 'rounded-t-xl' : ''}
            `}
            >
              {/* <div
            className={`
            px-4 pt-4 pb-4 sm:p-6 sm:pb-4 dark:bg-gray-800 rounded-b-xl 
            ${children.props.overflowY ? "overflow-y-auto" : ""}
            `}
            style={{
              maxHeight: children.props.overflowY
                ? "calc(100vh - 200px)"
                : "none",
            }}
          > */}
              {type === "confirmation" ? (
                <div className="text-center">
                  <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                  <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                    {children}
                  </h3>
                </div>
              ) : (
                <div className="space-y-4">{children}</div>
              )}
            </div>

            {/* Footer with border top */}
            {showFooter && (
              <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 rounded-b-xl">
                {footer ? (
                  footer
                ) : (
                  <>
                    {onConfirm && (
                      <button
                        onClick={onConfirm}
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        {confirmText}
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                    >
                      {cancelText}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Animation styles */}
        <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes scaleUp {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
      </div>
    </div>
  );
}