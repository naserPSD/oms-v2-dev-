import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ModalTw } from "./ModalTw";

// ✅ Configure PDF worker globally
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Reusable attachment preview modal.
 * Supports image and PDF preview.
 *
 * @param {Object} props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object|null} props.attachment - The attachment object from backend
 *   {
 *     fileUrl: string,
 *     filename?: string,
 *     mimeType?: string
 *   }
 */
const AttachmentPreviewModal = ({ show, onClose, attachment }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  if (!attachment) return null;

  const isImage = attachment?.mimeType?.startsWith("image/");
  const isPdf = attachment?.mimeType === "application/pdf";

  const handleDocumentLoad = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  return (
    <ModalTw
      show={show}
      onClose={onClose}
      title={attachment?.filename || "Attachment Preview"}
      size="xl"
      showHeader
      showFooter={false}
    >
      <div className="flex justify-center">
        {!attachment.fileUrl && (
          <p className="py-8 text-center text-sm text-gray-500">
            {attachment.filename || "This file"} is listed on the broadcast. Choose it again in this window to preview the contents.
          </p>
        )}
        {attachment.fileUrl && isImage && (
          <img
            src={attachment.fileUrl}
            alt="Attachment Preview"
            className="max-h-[80vh] object-contain rounded shadow"
          />
        )}

        {attachment.fileUrl && isPdf && (
          <div className="flex flex-col items-center w-full max-h-[80vh] overflow-auto">
            <Document
              file={attachment.fileUrl}
              onLoadSuccess={handleDocumentLoad}
              loading={<p>Loading PDF...</p>}
            >
              <Page pageNumber={pageNumber} />
            </Document>

            {numPages && numPages > 1 && (
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
                  disabled={pageNumber <= 1}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span>
                  Page {pageNumber} of {numPages}
                </span>
                <button
                  onClick={() =>
                    setPageNumber((p) => Math.min(p + 1, numPages))
                  }
                  disabled={pageNumber >= numPages}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {attachment.fileUrl && !isImage && !isPdf && (
          <p className="text-center text-sm text-gray-500">
            Unsupported file type
          </p>
        )}
      </div>
    </ModalTw>
  );
};

export default AttachmentPreviewModal;
