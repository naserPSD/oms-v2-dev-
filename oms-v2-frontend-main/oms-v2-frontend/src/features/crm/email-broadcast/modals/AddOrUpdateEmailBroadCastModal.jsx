"use client";

import AttachmentPreviewModal from "@/components/common/AttachmentPreviewModal";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import DatePicker from "@/components/ui/DatePicker";
import FileUpload from "@/components/ui/FileUpload";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";
import EmailTemplateContentEditor from "@/features/crm/email-templates/components/EmailTemplateContentEditor";
import { fetchBroadcastRecipients } from "@/services/emailBroadcastApi";
import { fetchCompanyEmailTemplates } from "@/services/emailTemplateApi";
import { useQuery } from "@tanstack/react-query";
import { Paperclip, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormController as Controller } from "@/components/common/FormController";
import { BiSend } from "react-icons/bi";

const RECIPIENT_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "selected", label: "Selected Users" },
  { value: "custom", label: "Custom Emails" },
];

const mimeFromName = (name = "") => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg"].includes(ext)) return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "gif") return "image/gif";
  if (ext === "webp") return "image/webp";
  if (ext === "pdf") return "application/pdf";
  return "application/octet-stream";
};

const unwrapTemplates = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const AddOrUpdateEmailBroadCastModal = ({
  showModal,
  handleClose,
  isEditing,
  control,
  watch,
  setValue,
  handleSubmit,
  submitForm,
  isLoading,
  editorKey,
  onEditorKeyChange,
}) => {
  const recipientType = watch("recipientType");
  const isScheduled = watch("isScheduled");
  const scheduleMinDate = useMemo(
    () => (isScheduled ? new Date() : null),
    [isScheduled],
  );
  const selectedFiles = watch("attachments") || [];
  const existingAttachments = watch("existingAttachments") || [];
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    return () => {
      if (preview?.fileUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(preview.fileUrl);
      }
    };
  }, [preview]);

  const openFilePreview = (file) => {
    const fileUrl = URL.createObjectURL(file);
    setPreview({
      filename: file.name,
      mimeType: file.type || mimeFromName(file.name),
      fileUrl,
    });
  };

  const openSavedPreview = (file) => {
    setPreview({
      filename: file.name,
      mimeType: mimeFromName(file.name),
      fileUrl: file.fileUrl || "",
      savedOnly: !file.fileUrl,
    });
  };

  const closePreview = () => {
    if (preview?.fileUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(preview.fileUrl);
    }
    setPreview(null);
  };

  const addFiles = (files) => {
    const incoming = files?.length ? Array.from(files) : [];
    if (!incoming.length) return;
    const merged = [...selectedFiles];
    incoming.forEach((file) => {
      const alreadyAdded = merged.some(
        (item) =>
          item.name === file.name &&
          item.size === file.size &&
          item.lastModified === file.lastModified,
      );
      if (!alreadyAdded) merged.push(file);
    });
    setValue("attachments", merged, { shouldDirty: true });
  };

  const { data: templateResponse } = useQuery({
    queryKey: ["email-templates", "company", "broadcast-picker"],
    queryFn: () => fetchCompanyEmailTemplates({ page: 1, limit: 100 }),
    enabled: showModal,
  });

  const { data: recipientResponse } = useQuery({
    queryKey: ["email-broadcasts", "recipients"],
    queryFn: fetchBroadcastRecipients,
    enabled: showModal && recipientType === "selected",
  });

  const userOptions = useMemo(() => {
    const payload = recipientResponse?.data;
    const rows = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];
    return rows.map((person) => ({
      value: String(person.userId),
      label: `${person.name} (${person.email})`,
    }));
  }, [recipientResponse]);

  const templateOptions = useMemo(() => {
    return unwrapTemplates(templateResponse).map((template) => ({
      value: String(template.id),
      label: template.name,
      template,
    }));
  }, [templateResponse]);

  const applyTemplate = (templateId) => {
    const selected = templateOptions.find(
      (option) => option.value === String(templateId),
    )?.template;
    if (!selected) return;
    setValue("subject", selected.subject || "", { shouldValidate: true });
    setValue("message", selected.content || "", { shouldValidate: true });
    onEditorKeyChange?.(`template-${selected.id}-${Date.now()}`);
  };

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title={isEditing ? "Edit Broadcast" : "Compose Broadcast"}
      size="4xl"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <div>
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="templateId"
              render={({ field }) => (
                <SelectSearch
                  label="Start from Template"
                  placeholder="Choose a company template"
                  options={templateOptions}
                  value={field.value ? String(field.value) : ""}
                  onChange={(value) => {
                    field.onChange(value);
                    applyTemplate(value);
                  }}
                  searchable
                />
              )}
            />

            <Controller
              control={control}
              name="recipientType"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Recipient Type"
                  placeholder="Select recipients"
                  options={RECIPIENT_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  required
                  searchable={false}
                />
              )}
            />
          </div>

          <Controller
            control={control}
            name="subject"
            render={({ field, fieldState }) => (
              <Input
                label="Email Subject"
                placeholder="Enter email subject..."
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                required
                {...field}
              />
            )}
          />

          {recipientType === "selected" && (
            <Controller
              control={control}
              name="recipientUserIds"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Recipients"
                  placeholder="Select company users"
                  options={userOptions}
                  value={(field.value || []).map(String)}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  multiple
                  searchable
                />
              )}
            />
          )}

          {recipientType === "custom" && (
            <Controller
              control={control}
              name="customEmails"
              render={({ field, fieldState }) => (
                <Input
                  type="textarea"
                  label="Custom Email Addresses"
                  placeholder="user1@example.com, user2@example.com"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  rows={3}
                  {...field}
                />
              )}
            />
          )}

          <FileUpload
            id="broadcast-attachments"
            name="attachments"
            label="Attachments"
            multiple
            description="Choose one or more files. Each file is added to the list below."
            onChange={addFiles}
          />

          {(existingAttachments.length > 0 || selectedFiles.length > 0) && (
            <div className="mb-5 space-y-2">
              {existingAttachments.map((file, index) => (
                <div
                  key={`saved-${file.name}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700"
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm text-gray-700 hover:text-blue-600 dark:text-gray-200"
                    onClick={() => openSavedPreview(file)}
                  >
                    <Paperclip className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">{file.name}</span>
                    {file.size && (
                      <span className="shrink-0 text-xs text-gray-500">
                        {file.size}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-red-500"
                    onClick={() =>
                      setValue(
                        "existingAttachments",
                        existingAttachments.filter((_, itemIndex) => itemIndex !== index),
                        { shouldDirty: true },
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {selectedFiles.map((file, index) => (
                <div
                  key={`new-${file.name}-${file.lastModified}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700"
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm text-gray-700 hover:text-blue-600 dark:text-gray-200"
                    onClick={() => openFilePreview(file)}
                  >
                    <Paperclip className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">{file.name}</span>
                    <span className="shrink-0 text-xs text-gray-500">
                      {file.size < 1024
                        ? `${file.size} B`
                        : file.size < 1024 * 1024
                          ? `${(file.size / 1024).toFixed(1)} KB`
                          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-red-500"
                    onClick={() =>
                      setValue(
                        "attachments",
                        selectedFiles.filter((_, itemIndex) => itemIndex !== index),
                        { shouldDirty: true },
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <AttachmentPreviewModal
            show={Boolean(preview)}
            onClose={closePreview}
            attachment={
              preview?.savedOnly
                ? {
                    filename: preview.filename,
                    mimeType: "application/octet-stream",
                    fileUrl: "",
                  }
                : preview
            }
          />

          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="isScheduled"
              render={({ field }) => (
                <SwitchButton
                  label="Schedule Email"
                  enabled={Boolean(field.value)}
                  onChange={field.onChange}
                  enabledText="Yes"
                  disabledText="No"
                  color="primary"
                  size="sm"
                  className="mb-5 [&_label]:!mb-2 [&_button]:mt-1"
                />
              )}
            />

            {isScheduled && (
              <Controller
                control={control}
                name="scheduleTime"
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="Send At"
                    name="scheduleTime"
                    enableTime
                    time24hr={false}
                    clearable
                    required
                    size="md"
                    minDate={scheduleMinDate}
                    placeholder="Select date and time"
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
            )}
          </div>

          <Controller
            control={control}
            name="message"
            render={({ field, fieldState }) => (
              <EmailTemplateContentEditor
                editorKey={editorKey}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                extraVariables={[]}
              />
            )}
          />

          <div className="mt-2 flex gap-3">
            <ButtonTw
              type="submit"
              variant="blue"
              className="flex-1 gap-2"
              disabled={isLoading}
              loading={isLoading}
            >
              <BiSend />
              {isEditing
                ? "Update Email"
                : isScheduled
                  ? "Schedule Email"
                  : "Send Email"}
            </ButtonTw>
            <ButtonTw
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </ButtonTw>
          </div>
        </div>
      </form>
    </ModalTw>
  );
};

export default AddOrUpdateEmailBroadCastModal;
