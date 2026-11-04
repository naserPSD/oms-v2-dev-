import ButtonTw from "@/components/ui/ButtonTw";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import React, { useMemo, useState } from "react";
import AddEmployeeDocument from "../hr-dashboard/employee-details/components/general-info/modals/AddEmployeeDocument";
import Swal from "sweetalert2";

const MyProfileDocuments = ({ employeeId }) => {
  const [previewFile, setPreviewFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Add Modal Open
  const handleAdd = () => {
    // setEditItem(null);
    setShowModal(true);
  };

  // Close Modal
  const handleClose = () => {
    setShowModal(false);
    //setEditItem(null);
  };
  const handlePreview = (fileUrl) => {
    setPreviewFile(fileUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setPreviewFile(null);
    setIsModalOpen(false);
  };

  const {
    employeeDocumentsFileQuery,
    companyDocumentsWithoutPaginationQuery,
    deleteDocumenFiletMutation,
  } = useHrQueryApi();

  // React Master Data Query (Without pagination & search)
  const { data: responsemasterData, isLoading: isCompanyDataFetching } =
    companyDocumentsWithoutPaginationQuery();

  const companyDocumentsList = useMemo(() => {
    return responsemasterData?.data || [];
  }, [responsemasterData]);

  const companyDocumentsOptions = useMemo(() => {
    return companyDocumentsList.map((item) => ({
      label: item.documentName,
      value: item.id,
    }));
  }, [companyDocumentsList]);

  // get Documet fILE qUERY...........
  const { data: responseData, isLoading: isFetching } =
    employeeDocumentsFileQuery(employeeId);

  const dataArray = useMemo(() => {
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData)) return responseData;
    return [];
  }, [responseData]);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: "swal-popup",
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteDocumenFiletMutation.mutateAsync(id);
      }
    });
  };

  const isLoading = isCompanyDataFetching || isFetching;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Employee Documents</h4>

          <ButtonTw
            onClick={handleAdd}
            variant="blue"
            size="sm"
            className="mt-2"
          >
            <i className="fa-solid fa-plus"></i> Add New
          </ButtonTw>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-center">Sl.</th>
                <th>Documents Type</th>
                <th>Document</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="text-center animate-pulse bg-gray-800 h-6 rounded"></td>
                    <td className="text-center animate-pulse bg-gray-800 h-6 rounded"></td>
                    <td className="text-center animate-pulse bg-gray-800 h-6 rounded"></td>
                     <td className="text-center animate-pulse bg-gray-800 h-6 rounded"></td>
                  </tr>
                ))
              ) : dataArray?.length > 0 ? (
                dataArray.map((doc, index) => (
                  <tr key={doc.id}>
                    <td className="text-start">
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td>{doc?.companyDocument?.documentName}</td>

                    <td className="text-start">
                      {doc?.media?.fileUrl || doc?.media?.filename ? (
                        <button
                          onClick={() =>
                            handlePreview(
                              doc?.media?.fileUrl ||
                                `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/static/${doc?.media?.filename}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <i className="fa-solid fa-file fa-lg"></i>
                        </button>
                      ) : (
                        "No File"
                      )}
                    </td>

                    <td className="text-center">
                      <div className="action flex justify-center gap-2">
                        <button
                          type="button"
                          className="btn-action hover:text-red-600"
                          onClick={() => handleDelete(doc?.id)}
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AddEmployeeDocument
        showModal={showModal}
        // editItem={editItem}
        employeeId={employeeId}
        onClose={handleClose}
        isLoading={isLoading}
        companyDocumentsOptions={companyDocumentsOptions}
        setShowModal={setShowModal}
      />

      {/* Modal */}

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        fileUrl={previewFile}
      />
    </>
  );
};

export default MyProfileDocuments;

const FilePreviewModal = ({ isOpen, onClose, fileUrl }) => {
  if (!isOpen) return null;

  const fileName = fileUrl?.split("/").pop();

  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName || "file";
      link.target = "_blank"; // Fallback for cross-origin

      // Some browsers require the link to be in the DOM
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-80">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto relative shadow-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xl font-bold"
        >
          ✕
        </button>

        {/* File Preview */}
        <div className="mt-4 mb-4 flex justify-center">
          {fileUrl?.endsWith(".pdf") ? (
            <iframe
              src={fileUrl}
              title="PDF Preview"
              className="w-full h-[70vh] border rounded"
            />
          ) : (
            <img
              src={fileUrl}
              alt="Preview"
              className="w-full h-auto max-h-[70vh] object-contain rounded border"
            />
          )}
        </div>

        {/* Download Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition cursor-pointer"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};
