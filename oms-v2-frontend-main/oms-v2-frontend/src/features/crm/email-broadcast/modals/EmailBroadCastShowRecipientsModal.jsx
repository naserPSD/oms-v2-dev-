import { ModalTw } from "@/components/common/ModalTw";
import { Mail, Users } from "lucide-react";
import React from "react";

const EmailBroadCastShowRecipientsModal = ({
  showRecipientsModal,
  setShowRecipientsModal,
  getFilteredRecipients,
  getModalTitle,
}) => {
  return (
    <div>
      {" "}
      <ModalTw
        show={showRecipientsModal}
        onClose={() => setShowRecipientsModal(false)}
        title={getModalTitle()}
        size="lg"
        dismissible={true}
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {getFilteredRecipients().length > 0 ? (
            getFilteredRecipients().map((recipient, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      recipient.status === "delivered"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {recipient.name}
                    </p>
                    <p className="text-xs text-gray-500">{recipient.email}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    recipient.status === "delivered"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {recipient.status === "delivered" ? "Delivered" : "Bounced"}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No recipients found for this email</p>
            </div>
          )}
        </div>
      </ModalTw>
    </div>
  );
};

export default EmailBroadCastShowRecipientsModal;
