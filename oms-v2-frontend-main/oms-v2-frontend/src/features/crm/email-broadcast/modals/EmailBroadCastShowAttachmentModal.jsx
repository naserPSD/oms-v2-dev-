import { ModalTw } from "@/components/common/ModalTw";
import { Paperclip } from "lucide-react";
import React from "react";

const EmailBroadCastShowAttachmentModal = ({
  showAttachmentsModal,
  setShowAttachmentsModal,
  currentEmail,
  getModalTitle,
}) => {
  return (
    <div>
      {" "}
      <ModalTw
        show={showAttachmentsModal}
        onClose={() => setShowAttachmentsModal(false)}
        title={getModalTitle()}
        size="md"
        dismissible={true}
      >
        <div className="space-y-3">
          {currentEmail?.attachmentDetails?.length > 0 ? (
            currentEmail.attachmentDetails.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Paperclip className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500">{attachment.size}</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                  Download
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Paperclip className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No attachments found for this email</p>
            </div>
          )}
        </div>
      </ModalTw>
    </div>
  );
};

export default EmailBroadCastShowAttachmentModal;
