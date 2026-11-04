import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    convertToPixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { toaster, resolveImageUrl } from "@/utils/helpers";

/** Above dashboard chrome (z-50) and tab/table content in split profile layouts */
const AVATAR_MODAL_Z = "z-[10050]";

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

const AvatarUpload = ({
    value,
    onChange,
    shape = "circle",
    size = 120,
    width,
    height,
    label = "Upload Avatar",
    error,
    disabled = false,
    id,
    className = "",
    icon,
    clearable = true,
    showUploadIcon = true,
    uploadIconPosition = "top-left",
    maxUploadSize = 15 * 1024 * 1024, // 15MB selection limit
    maxSize = 15 * 1024 * 1024, // backward compatible prop
    maxCroppedSize = 300 * 1024, // 300KB maximum size after crop
    maxOutputDimension = 600, // 600x600 px maximum resolution for sharp profile photos
    accept = "image/jpeg,image/png,image/gif,image/webp",
    aspect = 1,
    allowCropAspectOptions = false,
    defaultCropMode = "square",
    onCropModeChange,
    loading = false,
    instruction,
    align,
    showCropButton = false,
    cropButtonLabel = "Choose & Crop Photo",
}) => {
    const inputRef = useRef(null);
    const imgRef = useRef(null);
    const [preview, setPreview] = useState(value && typeof value === "string" ? value : null);
    const [imgError, setImgError] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showCrop, setShowCrop] = useState(false);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [srcImage, setSrcImage] = useState(null);
    const [originalFileName, setOriginalFileName] = useState("");
    const [originalFileType, setOriginalFileType] = useState("image/jpeg");
    const [internalError, setInternalError] = useState("");

    const [currentCropMode, setCurrentCropMode] = useState(
        aspect === undefined || defaultCropMode === "invoice" ? "invoice" : "square"
    );
    const [currentAspect, setCurrentAspect] = useState(
        defaultCropMode === "invoice" ? undefined : aspect
    );

    useEffect(() => {
        setCurrentAspect(aspect);
    }, [aspect]);

    // Icon size is 40% of avatar size
    const iconSize = Math.round(size * 0.4);

    // Position classes for upload icon
    const positionClasses = {
        'top-left': 'top-1 left-1',
        'top-right': 'top-1 right-1',
        'bottom-left': 'bottom-1 left-1',
        'bottom-right': 'bottom-1 right-1',
    };

    const resolvedPreview = resolveImageUrl(preview);

    useEffect(() => {
        if (typeof value === "string") {
            setPreview(value);
            setImgError(false);
        }
        if (!value) {
            setPreview(null);
            setImgError(false);
        }
    }, [value]);

    useEffect(() => {
        if (!showCrop && !showModal) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [showCrop, showModal]);

    const onImageLoad = (e) => {
        const { width: imgW, height: imgH } = e.currentTarget;
        imgRef.current = e.currentTarget;
        if (imgW && imgH) {
            if (currentAspect) {
                const initialCrop = centerAspectCrop(imgW, imgH, currentAspect);
                setCrop(initialCrop);
                setCompletedCrop(convertToPixelCrop(initialCrop, imgW, imgH));
            } else {
                const freeCrop = {
                    unit: "%",
                    x: 5,
                    y: 10,
                    width: 90,
                    height: 80,
                };
                setCrop(freeCrop);
                setCompletedCrop(convertToPixelCrop(freeCrop, imgW, imgH));
            }
        }
    };

    const handleModeSwitch = (mode) => {
        setCurrentCropMode(mode);
        const nextAspect = mode === "square" ? 1 : undefined;
        setCurrentAspect(nextAspect);
        if (onCropModeChange) {
            onCropModeChange(mode);
        }
        if (imgRef.current) {
            const { width: imgW, height: imgH } = imgRef.current;
            if (mode === "square") {
                const initialCrop = centerAspectCrop(imgW, imgH, 1);
                setCrop(initialCrop);
                setCompletedCrop(convertToPixelCrop(initialCrop, imgW, imgH));
            } else {
                const freeCrop = {
                    unit: "%",
                    x: 5,
                    y: 10,
                    width: 90,
                    height: 80,
                };
                setCrop(freeCrop);
                setCompletedCrop(convertToPixelCrop(freeCrop, imgW, imgH));
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input immediately so user can select the same file again
        e.target.value = "";

        // 1. File type validation - only images accepted
        const isImage =
            file.type.startsWith("image/") ||
            /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(file.name);

        if (!isImage) {
            const msg = "Invalid file type. Only image files (JPG, PNG, GIF, WebP) are allowed.";
            setInternalError(msg);
            toaster(msg, "error");
            return;
        }

        // 2. Max file selection size validation (e.g. 15MB)
        const effectiveUploadLimit = Math.max(
            maxUploadSize || 0,
            maxSize || 0,
            15 * 1024 * 1024
        );
        if (file.size > effectiveUploadLimit) {
            const maxMB = (effectiveUploadLimit / (1024 * 1024)).toFixed(0);
            const msg = `File size exceeds ${maxMB}MB limit. Please choose a smaller file.`;
            setInternalError(msg);
            toaster(msg, "error");
            return;
        }

        setInternalError("");

        const url = URL.createObjectURL(file);
        setSrcImage(url);
        setOriginalFileName(file.name);
        setOriginalFileType(file.type || "image/jpeg");
        setShowCrop(true);
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (!disabled && !loading) inputRef.current?.click();
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setPreview(null);
        setImgError(false);
        setInternalError("");
        onChange && onChange(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handlePreviewClick = (e) => {
        e.stopPropagation();
        setShowModal(true);
    };

    // Crop utility: resizes to maxOutputDimension and dynamically compresses to <= maxCroppedSize (300KB)
    const getCroppedImg = async (image, pixelCrop, fileType = "image/jpeg") => {
        if (!image || !pixelCrop || !pixelCrop.width || !pixelCrop.height) return null;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const naturalCropW = Math.max(1, Math.round(pixelCrop.width * scaleX));
        const naturalCropH = Math.max(1, Math.round(pixelCrop.height * scaleY));

        // Limit maximum dimensions (e.g. 600px) so output avatar is high-DPI sharp but not unnecessarily huge
        let targetWidth = naturalCropW;
        let targetHeight = naturalCropH;
        if (targetWidth > maxOutputDimension || targetHeight > maxOutputDimension) {
            if (targetWidth >= targetHeight) {
                targetHeight = Math.max(1, Math.round((targetHeight * maxOutputDimension) / targetWidth));
                targetWidth = maxOutputDimension;
            } else {
                targetWidth = Math.max(1, Math.round((targetWidth * maxOutputDimension) / targetHeight));
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

        // If PNG is too large (canvas PNG export doesn't compress with quality), switch to JPEG
        if (blob && blob.size > maxCroppedSize && outputType === "image/png") {
            outputType = "image/jpeg";
            blob = await toBlobAsync(canvas, outputType, quality);
        }

        // Iteratively lower quality until blob is under maxCroppedSize (default 300KB)
        while (blob && blob.size > maxCroppedSize && quality > 0.4) {
            quality = Math.max(0.4, Number((quality - 0.1).toFixed(2)));
            blob = await toBlobAsync(canvas, outputType, quality);
        }

        // If still over limit, downscale canvas dimensions
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

        return { blob, outputType };
    };

    const handleCropOk = async () => {
        if (!imgRef.current) return;

        const currentPixelCrop =
            completedCrop && completedCrop.width && completedCrop.height
                ? completedCrop
                : crop
                ? convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height)
                : null;

        if (!currentPixelCrop || !currentPixelCrop.width || !currentPixelCrop.height) {
            return;
        }

        try {
            const preferredMime =
                originalFileType === "image/png" || originalFileType === "image/webp"
                    ? originalFileType
                    : "image/jpeg";

            const cropResult = await getCroppedImg(
                imgRef.current,
                currentPixelCrop,
                preferredMime
            );

            if (!cropResult || !cropResult.blob) {
                toaster("Failed to crop image. Please try again.", "error");
                return;
            }

            const { blob: croppedBlob, outputType: finalMime } = cropResult;

            const croppedUrl = URL.createObjectURL(croppedBlob);
            setPreview(croppedUrl);
            setImgError(false);
            setInternalError("");

            if (srcImage && srcImage.startsWith("blob:")) {
                URL.revokeObjectURL(srcImage);
            }
            setSrcImage(null);
            setShowCrop(false);

            const ext = finalMime === "image/png" ? "png" : finalMime === "image/webp" ? "webp" : "jpg";
            const baseName = (originalFileName || "avatar").replace(/\.[^/.]+$/, "");
            const fileName = `${baseName}_cropped.${ext}`;
            const croppedFile = new File([croppedBlob], fileName, { type: finalMime });

            onChange && onChange(croppedFile);
        } catch (err) {
            console.error("Error cropping image:", err);
            toaster("Error cropping image", "error");
        }
    };

    const handleCropCancel = () => {
        if (srcImage && srcImage.startsWith("blob:")) {
            URL.revokeObjectURL(srcImage);
        }
        setSrcImage(null);
        setShowCrop(false);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const hasValidImage = Boolean(resolvedPreview && !imgError);
    const isCenter = align === "center" || (!align && !label);
    const alignClasses = isCenter ? "items-center text-center" : "items-start text-left";

    return (
        <div className={`mb-4 flex flex-col ${alignClasses} ${className}`}>
            {label && <span className="mb-2 text-sm font-medium text-gray-900 dark:text-white">{label}</span>}
            <div
                className={`relative flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                    ${shape === "circle" ? "rounded-full" : "rounded-xl"}
                    ${isCenter ? "mx-auto" : ""}
                `}
                style={{
                    width: width || (shape === "rectangle" ? Math.round(size * 1.5) : size),
                    height: height || (shape === "rectangle" ? Math.round(size * 0.75) : size),
                    cursor: disabled || loading ? "not-allowed" : "pointer",
                    overflow: "hidden",
                }}
                tabIndex={0}
                aria-label={label || "Avatar"}
                id={id}
                onClick={handleClick}
            >
                {/* Upload icon */}
                {showUploadIcon && (
                    <button
                        type="button"
                        className={`absolute z-20 w-[30px] h-[30px] flex items-center justify-center bg-gray-200/90 hover:bg-gray-300 dark:bg-gray-700/90 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 transition-colors rounded-full shadow-sm cursor-pointer ${positionClasses[uploadIconPosition]}`}
                        onClick={handleClick}
                        tabIndex={-1}
                        aria-label="Upload image"
                        title="Upload image"
                        disabled={disabled || loading}
                    >
                        <i className="fa-solid fa-camera text-xs"></i>
                    </button>
                )}

                {/* Clear icon */}
                {hasValidImage && clearable && (
                    <button
                        type="button"
                        className="absolute top-1 left-1 z-20 w-[25px] h-[25px] flex items-center justify-center bg-gray-200/90 hover:bg-red-500 hover:text-white text-gray-700 transition-colors rounded-full shadow-sm cursor-pointer"
                        onClick={handleClear}
                        tabIndex={-1}
                        aria-label="Clear"
                        title="Remove image"
                        disabled={disabled || loading}
                    >
                        <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                )}

                {/* Loading Spinner Overlay */}
                {loading && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                        <i className="fa-solid fa-circle-notch fa-spin text-white text-xl"></i>
                    </div>
                )}

                {hasValidImage ? (
                    <img
                        src={resolvedPreview}
                        alt="Avatar Preview"
                        className={`object-contain w-full h-full ${shape === "circle" ? "rounded-full" : "rounded-xl"} cursor-pointer p-1`}
                        onClick={handlePreviewClick}
                        onError={() => setImgError(true)}
                        title="Click to view full image"
                    />
                ) : (
                    <span className="flex items-center justify-center w-full h-full cursor-pointer">
                        {icon
                            ? <span style={{ fontSize: iconSize }}>{icon}</span>
                            : <span style={{ fontSize: iconSize }}><i className="fa-solid fa-user"></i></span>
                        }
                    </span>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={disabled || loading}
                />
            </div>

            {/* Optional Crop / Upload trigger button */}
            {showCropButton && (
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={disabled || loading}
                    className="mt-2.5 py-1.5 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/60 cursor-pointer border border-blue-100 dark:border-blue-900/40"
                >
                    <i className="fa-solid fa-crop-simple text-[11px]"></i>
                    <span>{cropButtonLabel}</span>
                </button>
            )}

            {/* Instruction / Helper text */}
            {instruction && (
                <p
                    className={`text-[11px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-[240px] ${
                        isCenter ? "text-center mx-auto" : "text-left"
                    }`}
                >
                    {instruction}
                </p>
            )}

            {/* Validation / Error text */}
            {(error || internalError) && (
                <span
                    className={`text-xs text-red-500 font-medium mt-1.5 leading-relaxed max-w-[260px] block ${
                        isCenter ? "text-center mx-auto" : "text-left"
                    }`}
                >
                    {error || internalError}
                </span>
            )}

            {typeof document !== "undefined" &&
                showModal &&
                hasValidImage &&
                createPortal(
                    <div
                        className={`fixed inset-0 ${AVATAR_MODAL_Z} flex items-center justify-center bg-black/70 transition-opacity duration-300 backdrop-blur-[2px] p-4`}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Avatar preview"
                        onClick={() => setShowModal(false)}
                    >
                        <div
                            className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-2 border border-gray-200 dark:border-gray-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={resolvedPreview}
                                alt="Full Avatar"
                                className="block max-w-[85vw] max-h-[85vh] object-contain"
                                style={{ borderRadius: shape === "circle" ? "50%" : "8px" }}
                            />
                            <button
                                type="button"
                                className="absolute -top-3 -right-3 bg-gray-900 text-white hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                                onClick={() => setShowModal(false)}
                                aria-label="Close"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>,
                    document.body,
                )}

            {typeof document !== "undefined" &&
                showCrop &&
                srcImage &&
                createPortal(
                    <div
                        className={`fixed inset-0 ${AVATAR_MODAL_Z} flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="avatar-crop-title"
                        onClick={handleCropCancel}
                    >
                        <div
                            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col isolate"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                                <div>
                                    <h3
                                        id="avatar-crop-title"
                                        className="text-base font-semibold text-gray-900 dark:text-white"
                                    >
                                        Crop Image
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Adjust and crop your image
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCropCancel}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                    aria-label="Close"
                                >
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            <div className="p-4 sm:p-6 flex items-center justify-center bg-gray-100 dark:bg-gray-950/60 overflow-hidden select-none">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={currentAspect}
                                    circularCrop={shape === "circle" && currentCropMode === "square"}
                                    keepSelection
                                    className="max-h-[55vh] max-w-full rounded-lg overflow-hidden shadow-md"
                                >
                                    <img
                                        ref={imgRef}
                                        src={srcImage}
                                        alt="Crop Preview"
                                        onLoad={onImageLoad}
                                        style={{ maxHeight: "55vh", maxWidth: "100%", display: "block" }}
                                    />
                                </ReactCrop>
                            </div>

                            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                                    onClick={handleCropCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                                    onClick={handleCropOk}
                                >
                                    <i className="fa-solid fa-crop-simple text-xs"></i>
                                    Apply Crop
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
};

export default AvatarUpload;