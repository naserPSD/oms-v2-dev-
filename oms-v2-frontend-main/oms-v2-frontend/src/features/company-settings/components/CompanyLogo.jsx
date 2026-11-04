import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import { toaster, resolveImageUrl } from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import CompanyLogoCropModal from "./CompanyLogoCropModal";

const MAX_UPLOAD_SIZE = 15 * 1024 * 1024; // 15MB selection limit
const MAX_CROPPED_SIZE = 300 * 1024; // 300KB compressed limit
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const validateImage = (value) => {
  if (value instanceof File) {
    return (
      ALLOWED_IMAGE_TYPES.includes(value.type) ||
      value.type.startsWith("image/")
    );
  }
  return true;
};

const validateFileSize = (value) => {
  if (value instanceof File) {
    return value.size <= MAX_UPLOAD_SIZE;
  }
  return true;
};

const schema = z.object({
  companyLogo: z
    .any()
    .refine(
      (value) =>
        value instanceof File ||
        (typeof value === "string" && value.trim().length > 0),
      { message: "Company Logo is required" },
    )
    .refine(validateImage, {
      message: "Only image files (JPG, PNG, GIF, WebP) are allowed",
    })
    .refine(validateFileSize, {
      message: "File size must not exceed 15MB",
    }),
  invoiceLogo: z
    .any()
    .optional()
    .refine(validateImage, {
      message: "Only image files (JPG, PNG, GIF, WebP) are allowed",
    })
    .refine(validateFileSize, {
      message: "File size must not exceed 15MB",
    }),
});

const CompanyLogo = ({ dataArray, hasPermission }) => {
  const [activeTab, setActiveTab] = useState("sidebar"); // "sidebar" | "invoice"

  // Dual Crop Modal state
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  // Full-size preview modal
  const [fullViewUrl, setFullViewUrl] = useState(null);

  const fileInputRef = useRef(null);

  const initialValues = {
    companyLogo: null,
    invoiceLogo: null,
  };

  const { handleSubmit, control, reset, setError, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const { uploadLogoMutation, uploadInvoiceLogoMutation } =
    useCompanySettingsQueryApi({
      reset,
      setError,
    });

  const isUploadingSidebar =
    uploadLogoMutation.isPending || uploadLogoMutation.isLoading;
  const isUploadingInvoice =
    uploadInvoiceLogoMutation.isPending || uploadInvoiceLogoMutation.isLoading;
  const isUploading = isUploadingSidebar || isUploadingInvoice;

  useEffect(() => {
    if (dataArray) {
      reset({
        companyLogo: resolveImageUrl(dataArray?.logoMedia?.fileUrl) || null,
        invoiceLogo: resolveImageUrl(dataArray?.invoiceLogoMedia?.fileUrl) || null,
      });
    }
  }, [reset, dataArray]);

  const hasSidebarLogo = Boolean(
    dataArray?.logoMediaId ||
      dataArray?.logoMedia?.fileUrl ||
      dataArray?.logoMedia?.id ||
      watch("companyLogo"),
  );

  const hasInvoiceLogo = Boolean(
    dataArray?.invoiceLogoMediaId ||
      dataArray?.invoiceLogoMedia?.fileUrl ||
      dataArray?.invoiceLogoMedia?.id ||
      watch("invoiceLogo"),
  );

  const currentSidebarPreview = resolveImageUrl(watch("companyLogo"));
  const currentInvoicePreview = resolveImageUrl(watch("invoiceLogo"));

  const handleSidebarUpload = async (file) => {
    if (!file) {
      return;
    }

    if (file instanceof File) {
      if (file.size > MAX_UPLOAD_SIZE) {
        setError("companyLogo", {
          type: "manual",
          message: "File size must not exceed 15MB",
        });
        toaster("File size must not exceed 15MB", "error");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("companyLogo", file);
        await uploadLogoMutation.mutateAsync(formData);
      } catch (error) {
        console.error("Sidebar logo upload failed", error);
      }
    }
  };

  const handleInvoiceUpload = async (file) => {
    if (!file) {
      return;
    }

    if (file instanceof File) {
      if (file.size > MAX_UPLOAD_SIZE) {
        setError("invoiceLogo", {
          type: "manual",
          message: "File size must not exceed 15MB",
        });
        toaster("File size must not exceed 15MB", "error");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("invoiceLogo", file);
        await uploadInvoiceLogoMutation.mutateAsync(formData);
      } catch (error) {
        console.error("Invoice logo upload failed", error);
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be selected again
    e.target.value = "";

    const isImage =
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(file.name);

    if (!isImage) {
      toaster("Invalid file type. Only image files are allowed.", "error");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      toaster("File size exceeds 15MB limit. Please choose a smaller file.", "error");
      return;
    }

    setSelectedImageFile(file);
    setIsCropModalOpen(true);
  };

  const handleApplyBothCrops = async ({
    originalFile,
    sidebarFile,
    invoiceFile,
    updateSidebar,
    updateInvoice,
  }) => {
    try {
      const formData = new FormData();

      // 1. Original Photo
      const rawOriginal = originalFile || selectedImageFile;
      if (rawOriginal instanceof File) {
        formData.append("originalLogo", rawOriginal);
      }

      // 2. Square shape for company profile photo
      if (updateSidebar && sidebarFile instanceof File) {
        setValue("companyLogo", sidebarFile);
        formData.append("companyLogo", sidebarFile);
      }

      // 3. Rectangular shape for invoice
      if (updateInvoice && invoiceFile instanceof File) {
        setValue("invoiceLogo", invoiceFile);
        formData.append("invoiceLogo", invoiceFile);
      }

      await uploadLogoMutation.mutateAsync(formData);
      setIsCropModalOpen(false);
      setSelectedImageFile(null);
    } catch (err) {
      console.error("Failed to upload logos:", err);
    }
  };

  const onSubmit = async (data) => {
    if (activeTab === "sidebar") {
      if (data.companyLogo instanceof File) {
        await handleSidebarUpload(data.companyLogo);
      }
    } else {
      if (data.invoiceLogo instanceof File) {
        await handleInvoiceUpload(data.invoiceLogo);
      }
    }
  };

  const canEditLogo = hasPermission
    ? hasPermission("settings.company_settings_logo_edit")
    : true;

  const triggerUpload = (e) => {
    e?.stopPropagation();
    if (!canEditLogo || isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[280px] flex flex-col items-center gap-3.5 px-5 py-4
          bg-white dark:bg-gray-900
          border border-gray-100 dark:border-gray-800
          rounded-2xl shadow-xs"
      >
        {/* Header Tabs */}
        <div className="w-full flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("sidebar")}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "sidebar"
                ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <i className="fa-regular fa-square text-[11px]"></i>
            <span>Sidebar</span>
            {hasSidebarLogo && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("invoice")}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "invoice"
                ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <i className="fa-solid fa-file-invoice text-[11px]"></i>
            <span>Invoice</span>
            {hasInvoiceLogo && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>

        {/* Description / Alerts */}
        {activeTab === "sidebar" ? (
          !hasSidebarLogo && (
            <p className="w-full rounded-lg bg-red-50 px-2 py-1.5 text-center text-[11px] font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
              Sidebar logo is required
            </p>
          )
        ) : (
          <p className="w-full rounded-lg bg-blue-50/70 dark:bg-blue-950/30 px-2 py-1 text-center text-[11px] font-medium text-blue-700 dark:text-blue-300">
            {hasInvoiceLogo
              ? "Custom invoice logo active"
              : "Optional · Defaults to sidebar logo"}
          </p>
        )}

        {/* TAB 1: SIDEBAR LOGO */}
        {activeTab === "sidebar" && (
          <div className="flex flex-col items-center w-full">
            <div
              className="relative flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800 transition-colors w-[160px] h-[160px] overflow-hidden cursor-pointer group"
              onClick={triggerUpload}
              title="Click to choose image & crop both logos"
            >
              {/* Camera Upload Button */}
              {canEditLogo && (
                <button
                  type="button"
                  onClick={triggerUpload}
                  disabled={isUploadingSidebar}
                  className="absolute bottom-1 right-1 z-20 w-[30px] h-[30px] flex items-center justify-center bg-gray-200/90 hover:bg-gray-300 dark:bg-gray-700/90 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 transition-colors rounded-full shadow-xs cursor-pointer"
                  title="Upload image"
                >
                  <i className="fa-solid fa-camera text-xs"></i>
                </button>
              )}

              {/* Loading Spinner */}
              {isUploadingSidebar && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                  <i className="fa-solid fa-circle-notch fa-spin text-white text-xl"></i>
                </div>
              )}

              {/* Logo Preview or Placeholder */}
              {currentSidebarPreview ? (
                <img
                  src={currentSidebarPreview}
                  alt="Sidebar Logo Preview"
                  className="object-contain w-full h-full p-2 rounded-2xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullViewUrl(currentSidebarPreview);
                  }}
                  title="Click to view full image"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-2">
                  <i className="fa-regular fa-square text-3xl mb-1"></i>
                  <span className="text-[11px] font-medium">Upload Logo</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-center leading-relaxed text-gray-400 dark:text-gray-500 mt-2">
              Square 1:1 · Up to 15MB (Auto-compressed to &lt;300KB)
              <br />
              Used in top-left sidebar navigation
            </p>
          </div>
        )}

        {/* TAB 2: INVOICE LOGO */}
        {activeTab === "invoice" && (
          <div className="flex flex-col items-center w-full">
            <div
              className="relative flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800 transition-colors w-[210px] h-[120px] overflow-hidden cursor-pointer group"
              onClick={triggerUpload}
              title="Click to choose image & crop both logos"
            >
              {/* Camera Upload Button */}
              {canEditLogo && (
                <button
                  type="button"
                  onClick={triggerUpload}
                  disabled={isUploadingInvoice}
                  className="absolute bottom-1 right-1 z-20 w-[30px] h-[30px] flex items-center justify-center bg-gray-200/90 hover:bg-gray-300 dark:bg-gray-700/90 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 transition-colors rounded-full shadow-xs cursor-pointer"
                  title="Upload image"
                >
                  <i className="fa-solid fa-camera text-xs"></i>
                </button>
              )}

              {/* Loading Spinner */}
              {isUploadingInvoice && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                  <i className="fa-solid fa-circle-notch fa-spin text-white text-xl"></i>
                </div>
              )}

              {/* Logo Preview or Placeholder */}
              {currentInvoicePreview ? (
                <img
                  src={currentInvoicePreview}
                  alt="Invoice Logo Preview"
                  className="object-contain w-full h-full p-2 rounded-2xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullViewUrl(currentInvoicePreview);
                  }}
                  title="Click to view full image"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-2">
                  <i className="fa-solid fa-file-invoice text-3xl mb-1"></i>
                  <span className="text-[11px] font-medium">Upload Invoice Logo</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-center leading-relaxed text-gray-400 dark:text-gray-500 mt-2">
              Custom Size / Freeform · Up to 15MB (Auto-compressed to &lt;300KB)
              <br />
              Used on printed invoices & receipts
            </p>
          </div>
        )}

        {/* Upload Action Button */}
        {canEditLogo && (
          <button
            type="button"
            onClick={triggerUpload}
            disabled={isUploading}
            className="w-full py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/60 cursor-pointer border border-blue-100 dark:border-blue-900/40"
          >
            <i className="fa-solid fa-crop-simple text-[11px]"></i>
            <span>Upload & Crop Logos</span>
          </button>
        )}
      </form>

      {/* Full Preview Modal */}
      {fullViewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[2px] p-4"
          onClick={() => setFullViewUrl(null)}
        >
          <div
            className="relative z-50 bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-2 border border-gray-200 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fullViewUrl}
              alt="Full Logo View"
              className="block max-w-[85vw] max-h-[85vh] object-contain rounded-lg"
            />
            <button
              type="button"
              className="absolute -top-3 -right-3 bg-gray-900 text-white hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
              onClick={() => setFullViewUrl(null)}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* Dual Crop Modal (Sidebar + Invoice Croppers on the SAME screen) */}
      <CompanyLogoCropModal
        isOpen={isCropModalOpen}
        onClose={() => {
          setIsCropModalOpen(false);
          setSelectedImageFile(null);
        }}
        sourceFile={selectedImageFile}
        onApply={handleApplyBothCrops}
        isSaving={isUploading}
        maxSize={MAX_UPLOAD_SIZE}
      />
    </>
  );
};

export default CompanyLogo;
