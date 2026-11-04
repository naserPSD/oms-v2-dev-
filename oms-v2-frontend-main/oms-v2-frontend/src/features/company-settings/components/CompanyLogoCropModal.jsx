import React, { useRef, useState, useEffect } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { toaster } from "@/utils/helpers";

function centerAspectCrop(mediaWidth, mediaHeight, targetAspect = 1) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      targetAspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export const getCroppedFile = async (
  image,
  pixelCrop,
  baseFileName = "logo",
  fileType = "image/jpeg",
  maxOutputDimension = 800,
  maxCroppedSize = 300 * 1024
) => {
  if (!image || !pixelCrop || !pixelCrop.width || !pixelCrop.height) return null;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const naturalCropW = Math.max(1, Math.round(pixelCrop.width * scaleX));
  const naturalCropH = Math.max(1, Math.round(pixelCrop.height * scaleY));

  // Limit maximum dimension so logo remains high-DPI sharp while keeping file size small
  let targetWidth = naturalCropW;
  let targetHeight = naturalCropH;
  if (targetWidth > maxOutputDimension || targetHeight > maxOutputDimension) {
    if (targetWidth >= targetHeight) {
      targetHeight = Math.max(
        1,
        Math.round((targetHeight * maxOutputDimension) / targetWidth)
      );
      targetWidth = maxOutputDimension;
    } else {
      targetWidth = Math.max(
        1,
        Math.round((targetWidth * maxOutputDimension) / targetHeight)
      );
      targetHeight = maxOutputDimension;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    targetWidth,
    targetHeight
  );

  const toBlobAsync = (canvasObj, type, quality) =>
    new Promise((resolve) => canvasObj.toBlob(resolve, type, quality));

  let outputType = fileType;
  let quality = 0.92;
  let blob = await toBlobAsync(canvas, outputType, quality);

  // If PNG is over maxCroppedSize (PNG cannot be compressed via quality arg), convert to JPEG
  if (blob && blob.size > maxCroppedSize && outputType === "image/png") {
    outputType = "image/jpeg";
    blob = await toBlobAsync(canvas, outputType, quality);
  }

  // Iteratively reduce quality until under maxCroppedSize (300KB)
  while (blob && blob.size > maxCroppedSize && quality > 0.4) {
    quality = Math.max(0.4, Number((quality - 0.1).toFixed(2)));
    blob = await toBlobAsync(canvas, outputType, quality);
  }

  // If still above maxCroppedSize, downscale canvas
  if (blob && blob.size > maxCroppedSize) {
    const smallerCanvas = document.createElement("canvas");
    smallerCanvas.width = Math.round(targetWidth * 0.75);
    smallerCanvas.height = Math.round(targetHeight * 0.75);
    const smallerCtx = smallerCanvas.getContext("2d");
    if (smallerCtx) {
      smallerCtx.imageSmoothingQuality = "high";
      smallerCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
      const smallerBlob = await toBlobAsync(smallerCanvas, "image/jpeg", 0.75);
      if (smallerBlob) {
        blob = smallerBlob;
        outputType = "image/jpeg";
      }
    }
  }

  if (!blob) return null;

  const ext =
    outputType === "image/png"
      ? "png"
      : outputType === "image/webp"
      ? "webp"
      : "jpg";
  const cleanName = baseFileName.replace(/\.[^/.]+$/, "");
  return new File([blob], `${cleanName}.${ext}`, { type: outputType });
};

const CropCanvasPreview = ({ imageRef, crop, className, style }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (
      !canvasRef.current ||
      !imageRef.current ||
      !crop ||
      !crop.width ||
      !crop.height
    ) {
      return;
    }
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = "high";

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
  }, [imageRef, crop]);

  return <canvas ref={canvasRef} className={className} style={style} />;
};

const CompanyLogoCropModal = ({
  isOpen,
  onClose,
  sourceFile,
  onApply,
  isSaving = false,
  maxSize = 15 * 1024 * 1024,
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [currentFile, setCurrentFile] = useState(sourceFile);

  const sidebarImgRef = useRef(null);
  const invoiceImgRef = useRef(null);
  const replaceInputRef = useRef(null);

  const [sidebarCrop, setSidebarCrop] = useState();
  const [sidebarCompletedCrop, setSidebarCompletedCrop] = useState(null);
  const [updateSidebar, setUpdateSidebar] = useState(true);

  const [invoiceCrop, setInvoiceCrop] = useState();
  const [invoiceCompletedCrop, setInvoiceCompletedCrop] = useState(null);
  const [updateInvoice, setUpdateInvoice] = useState(true);
  const [invoiceAspectMode, setInvoiceAspectMode] = useState("3:1"); // "3:1", "2:1", "16:9", "freeform"

  useEffect(() => {
    if (sourceFile) {
      setCurrentFile(sourceFile);
      const url = URL.createObjectURL(sourceFile);
      setImageSrc(url);
      setUpdateSidebar(true);
      setUpdateInvoice(true);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImageSrc(null);
      setCurrentFile(null);
    }
  }, [sourceFile]);

  if (!isOpen || !imageSrc) return null;

  const originalType = currentFile?.type || "image/jpeg";
  const outputMime =
    originalType === "image/png" || originalType === "image/webp"
      ? originalType
      : "image/jpeg";

  const onSidebarImageLoad = (e) => {
    const { width: imgW, height: imgH } = e.currentTarget;
    sidebarImgRef.current = e.currentTarget;
    if (imgW && imgH) {
      const initialCrop = centerAspectCrop(imgW, imgH, 1);
      setSidebarCrop(initialCrop);
      setSidebarCompletedCrop(convertToPixelCrop(initialCrop, imgW, imgH));
    }
  };

  const onInvoiceImageLoad = (e) => {
    const { width: imgW, height: imgH } = e.currentTarget;
    invoiceImgRef.current = e.currentTarget;
    if (imgW && imgH) {
      initInvoiceCrop(imgW, imgH, invoiceAspectMode);
    }
  };

  const initInvoiceCrop = (imgW, imgH, mode) => {
    if (mode === "freeform") {
      const freeCrop = {
        unit: "%",
        x: 5,
        y: 15,
        width: 90,
        height: 70,
      };
      setInvoiceCrop(freeCrop);
      setInvoiceCompletedCrop(convertToPixelCrop(freeCrop, imgW, imgH));
    } else {
      let aspect = undefined;
      if (mode === "16:9") aspect = 16 / 9;
      if (mode === "3:1") aspect = 3;
      if (mode === "2:1") aspect = 2;

      if (aspect) {
        const aspectCrop = centerAspectCrop(imgW, imgH, aspect);
        setInvoiceCrop(aspectCrop);
        setInvoiceCompletedCrop(convertToPixelCrop(aspectCrop, imgW, imgH));
      }
    }
  };

  const handleInvoiceAspectChange = (mode) => {
    setInvoiceAspectMode(mode);
    if (invoiceImgRef.current) {
      const { width: imgW, height: imgH } = invoiceImgRef.current;
      initInvoiceCrop(imgW, imgH, mode);
    }
  };

  const handleResetSidebarCrop = () => {
    if (sidebarImgRef.current) {
      const { width: imgW, height: imgH } = sidebarImgRef.current;
      const initialCrop = centerAspectCrop(imgW, imgH, 1);
      setSidebarCrop(initialCrop);
      setSidebarCompletedCrop(convertToPixelCrop(initialCrop, imgW, imgH));
    }
  };

  const handleResetInvoiceCrop = () => {
    if (invoiceImgRef.current) {
      const { width: imgW, height: imgH } = invoiceImgRef.current;
      initInvoiceCrop(imgW, imgH, invoiceAspectMode);
    }
  };

  const handleReplaceFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const effectiveLimit = Math.max(maxSize || 0, 15 * 1024 * 1024);
    if (file.size > effectiveLimit) {
      const maxMB = (effectiveLimit / (1024 * 1024)).toFixed(0);
      toaster(`Selected image exceeds ${maxMB}MB limit`, "error");
      return;
    }

    if (imageSrc && imageSrc.startsWith("blob:")) {
      URL.revokeObjectURL(imageSrc);
    }

    setCurrentFile(file);
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    e.target.value = "";
  };

  const handleApplyBoth = async () => {
    if (!updateSidebar && !updateInvoice) {
      toaster("Please select at least one logo to update", "warning");
      return;
    }

    let croppedSidebarFile = null;
    let croppedInvoiceFile = null;

    try {
      const baseName = (currentFile?.name || "logo").replace(/\.[^/.]+$/, "");

      if (updateSidebar && sidebarImgRef.current) {
        const cropPix =
          sidebarCompletedCrop ||
          (sidebarCrop
            ? convertToPixelCrop(
                sidebarCrop,
                sidebarImgRef.current.width,
                sidebarImgRef.current.height
              )
            : null);

        if (cropPix && cropPix.width && cropPix.height) {
          croppedSidebarFile = await getCroppedFile(
            sidebarImgRef.current,
            cropPix,
            `${baseName}_sidebar`,
            outputMime,
            600,
            300 * 1024
          );
        }
      }

      if (updateInvoice && invoiceImgRef.current) {
        const cropPix =
          invoiceCompletedCrop ||
          (invoiceCrop
            ? convertToPixelCrop(
                invoiceCrop,
                invoiceImgRef.current.width,
                invoiceImgRef.current.height
              )
            : null);

        if (cropPix && cropPix.width && cropPix.height) {
          croppedInvoiceFile = await getCroppedFile(
            invoiceImgRef.current,
            cropPix,
            `${baseName}_invoice`,
            outputMime,
            800,
            300 * 1024
          );
        }
      }

      if (updateSidebar && !croppedSidebarFile) {
        toaster("Sidebar crop area is invalid", "error");
        return;
      }

      if (updateInvoice && !croppedInvoiceFile) {
        toaster("Invoice crop area is invalid", "error");
        return;
      }

      await onApply({
        originalFile: currentFile,
        sidebarFile: croppedSidebarFile,
        invoiceFile: croppedInvoiceFile,
        updateSidebar,
        updateInvoice,
      });
    } catch (err) {
      console.error("Failed to apply crops:", err);
      toaster("Error processing cropped images", "error");
    }
  };

  const getAspectNumeric = () => {
    if (invoiceAspectMode === "16:9") return 16 / 9;
    if (invoiceAspectMode === "3:1") return 3;
    if (invoiceAspectMode === "2:1") return 2;
    return undefined; // freeform
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-semibold">
              <i className="fa-solid fa-crop-simple"></i>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Crop Company & Invoice Logos
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Adjust both croppers on the same screen to save sidebar and invoice logos together
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Modal Body - 2 Columns on same screen */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUMN 1: SIDEBAR LOGO CROPPER */}
            <div
              className={`flex flex-col bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl p-4 border transition-all ${
                updateSidebar
                  ? "border-blue-200 dark:border-blue-900/60 ring-1 ring-blue-500/10 shadow-xs"
                  : "border-gray-200 dark:border-gray-700/60 opacity-60"
              }`}
            >
              {/* Header / Controls */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200/80 dark:border-gray-700/60">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={updateSidebar}
                    onChange={(e) => setUpdateSidebar(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-sm border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <i className="fa-regular fa-square text-xs text-blue-600 dark:text-blue-400"></i>
                    Sidebar Logo
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-md">
                    Square 1:1
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handleResetSidebarCrop}
                  disabled={!updateSidebar}
                  className="text-xs text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  title="Reset to center crop"
                >
                  <i className="fa-solid fa-arrows-rotate text-[10px]"></i>
                  Reset
                </button>
              </div>

              {/* Crop Canvas Area */}
              <div className="relative flex items-center justify-center bg-gray-900/5 dark:bg-black/50 rounded-xl p-3 min-h-[260px] max-h-[340px] overflow-hidden border border-gray-200 dark:border-gray-700 select-none">
                <ReactCrop
                  crop={sidebarCrop}
                  onChange={(_, percentCrop) => setSidebarCrop(percentCrop)}
                  onComplete={(c) => setSidebarCompletedCrop(c)}
                  aspect={1}
                  keepSelection
                  disabled={!updateSidebar}
                  className="max-h-[320px] max-w-full rounded-lg overflow-hidden shadow-sm"
                >
                  <img
                    ref={sidebarImgRef}
                    src={imageSrc}
                    alt="Sidebar Logo Crop"
                    onLoad={onSidebarImageLoad}
                    style={{
                      maxHeight: "320px",
                      maxWidth: "100%",
                      display: "block",
                    }}
                  />
                </ReactCrop>
              </div>

              {/* Live Preview Section */}
              <div className="mt-4 pt-3 border-t border-gray-200/80 dark:border-gray-700/60">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 flex items-center justify-between">
                  <span>Sidebar Preview</span>
                  <span className="text-[10px] font-normal normal-case text-gray-400">
                    Square & Circular appearance
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-800">
                  {/* Square Nav Icon Preview */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden p-1 shadow-2xs">
                      {sidebarCompletedCrop ? (
                        <CropCanvasPreview
                          imageRef={sidebarImgRef}
                          crop={sidebarCompletedCrop}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <i className="fa-solid fa-image text-gray-400 text-sm"></i>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Nav Icon</span>
                  </div>

                  {/* Circular Avatar Preview */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden p-1 shadow-2xs">
                      {sidebarCompletedCrop ? (
                        <CropCanvasPreview
                          imageRef={sidebarImgRef}
                          crop={sidebarCompletedCrop}
                          className="w-full h-full object-contain rounded-full"
                        />
                      ) : (
                        <i className="fa-solid fa-image text-gray-400 text-sm"></i>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Circle</span>
                  </div>

                  {/* Context Note */}
                  <div className="flex-1 text-[11px] text-gray-500 dark:text-gray-400 pl-2 border-l border-gray-100 dark:border-gray-800">
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Top-Left Navigation
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-0.5 leading-snug">
                      Displayed on collapsed/expanded dashboard menus and browser favicons.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: INVOICE LOGO CROPPER */}
            <div
              className={`flex flex-col bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl p-4 border transition-all ${
                updateInvoice
                  ? "border-emerald-200 dark:border-emerald-900/60 ring-1 ring-emerald-500/10 shadow-xs"
                  : "border-gray-200 dark:border-gray-700/60 opacity-60"
              }`}
            >
              {/* Header / Controls */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200/80 dark:border-gray-700/60">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={updateInvoice}
                    onChange={(e) => setUpdateInvoice(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm border-gray-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <i className="fa-solid fa-file-invoice text-xs text-emerald-600 dark:text-emerald-400"></i>
                    Invoice Logo
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md">
                    Custom Size
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handleResetInvoiceCrop}
                  disabled={!updateInvoice}
                  className="text-xs text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  title="Reset to initial crop"
                >
                  <i className="fa-solid fa-arrows-rotate text-[10px]"></i>
                  Reset
                </button>
              </div>

              {/* Aspect Ratio Toolbar for Invoice */}
              <div className="flex items-center gap-1.5 mb-2.5 p-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800">
                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-400 px-2">
                  Aspect:
                </span>
                {[
                  { id: "freeform", label: "Freeform (Any Size)", icon: "fa-crop-simple" },
                  { id: "16:9", label: "16:9", icon: null },
                  { id: "3:1", label: "3:1 Banner", icon: null },
                  { id: "2:1", label: "2:1 Wide", icon: null },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleInvoiceAspectChange(item.id)}
                    disabled={!updateInvoice}
                    className={`py-1 px-2.5 text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 ${
                      invoiceAspectMode === item.id
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold shadow-2xs border border-emerald-200 dark:border-emerald-800"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {item.icon && <i className={`fa-solid ${item.icon} text-[10px]`}></i>}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Crop Canvas Area */}
              <div className="relative flex items-center justify-center bg-gray-900/5 dark:bg-black/50 rounded-xl p-3 min-h-[260px] max-h-[340px] overflow-hidden border border-gray-200 dark:border-gray-700 select-none">
                <ReactCrop
                  crop={invoiceCrop}
                  onChange={(_, percentCrop) => setInvoiceCrop(percentCrop)}
                  onComplete={(c) => setInvoiceCompletedCrop(c)}
                  aspect={getAspectNumeric()}
                  keepSelection
                  disabled={!updateInvoice}
                  className="max-h-[320px] max-w-full rounded-lg overflow-hidden shadow-sm"
                >
                  <img
                    ref={invoiceImgRef}
                    src={imageSrc}
                    alt="Invoice Logo Crop"
                    onLoad={onInvoiceImageLoad}
                    style={{
                      maxHeight: "320px",
                      maxWidth: "100%",
                      display: "block",
                    }}
                  />
                </ReactCrop>
              </div>

              {/* Live Preview Section */}
              <div className="mt-4 pt-3 border-t border-gray-200/80 dark:border-gray-700/60">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 flex items-center justify-between">
                  <span>Invoice Header Preview</span>
                  <span className="text-[10px] font-normal normal-case text-gray-400">
                    Simulated printed document header
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-800">
                  {/* Cropped Logo in Invoice Header Box */}
                  <div className="h-14 max-w-[200px] min-w-[100px] flex items-center justify-start bg-gray-50 dark:bg-gray-800/60 px-2 py-1 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    {invoiceCompletedCrop ? (
                      <CropCanvasPreview
                        imageRef={invoiceImgRef}
                        crop={invoiceCompletedCrop}
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <i className="fa-solid fa-file-invoice text-gray-400 text-sm"></i>
                    )}
                  </div>

                  {/* Mock Invoice Text */}
                  <div className="text-right text-[10px] text-gray-400 dark:text-gray-400 font-mono leading-tight">
                    <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">INVOICE</p>
                    <p>#INV-2026-001</p>
                    <p className="text-[9px]">Original Copy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gray-50/70 dark:bg-gray-900/90 border-t border-gray-100 dark:border-gray-800">
          {/* Left: Change Source Image File */}
          <div className="flex items-center gap-3">
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleReplaceFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => replaceInputRef.current?.click()}
              disabled={isSaving}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <i className="fa-solid fa-image text-xs"></i>
              Choose Different Image
            </button>
            {currentFile?.name && (
              <span className="text-[11px] text-gray-400 truncate max-w-[180px]">
                {currentFile.name} ({(currentFile.size / 1024).toFixed(0)} KB)
              </span>
            )}
          </div>

          {/* Right: Cancel & Apply */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyBoth}
              disabled={isSaving || (!updateSidebar && !updateInvoice)}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                  <span>Saving Logos...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-crop-simple text-xs"></i>
                  <span>
                    Apply & Save {updateSidebar && updateInvoice ? "Both Logos" : "Selected Logo"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogoCropModal;
