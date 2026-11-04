"use client";

import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Checkbox from "@/components/ui/Checkbox";
import { fetchImportableEmailTemplates } from "@/services/emailTemplateApi";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const ImportEmailTemplateModal = ({ show, onClose, onImport, isImporting }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewId, setPreviewId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["email-templates", "importable"],
    queryFn: fetchImportableEmailTemplates,
    enabled: show,
  });

  const templates = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    return [];
  }, [data]);

  const preview = templates.find((template) => template.id === previewId) || null;
  const allSelected =
    templates.length > 0 && selectedIds.length === templates.length;

  useEffect(() => {
    if (!show) {
      setSelectedIds([]);
      setPreviewId(null);
    }
  }, [show]);

  const toggleAll = (checked) => {
    setSelectedIds(checked ? templates.map((template) => template.id) : []);
  };

  const toggleOne = (id, checked) => {
    setSelectedIds((current) => {
      if (checked) return current.includes(id) ? current : [...current, id];
      return current.filter((item) => item !== id);
    });
  };

  return (
    <ModalTw
      show={show}
      onClose={onClose}
      title="Import Master Email Template"
      size="5xl"
      dismissible
      showHeader
      showFooter={false}
    >
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
        Select the master templates to copy into this company. Click a template
        name to preview it.
      </p>

      {isLoading ? (
        <p className="py-6 text-sm text-gray-500">Loading templates...</p>
      ) : templates.length === 0 ? (
        <p className="py-6 text-sm text-gray-500">
          No subscriber templates are available to import yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 border-b border-gray-200 pb-2 dark:border-gray-700">
              <Checkbox
                id="import-select-all"
                size="sm"
                checked={allSelected}
                onCheckedChange={toggleAll}
                label="Select all"
              />
            </div>
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {templates.map((template) => {
                const checked = selectedIds.includes(template.id);
                const isPreview = previewId === template.id;
                return (
                  <div
                    key={template.id}
                    className={`flex items-start gap-3 rounded-md border p-3 ${
                      isPreview
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <Checkbox
                      id={`import-template-${template.id}`}
                      size="sm"
                      checked={checked}
                      onCheckedChange={(value) => toggleOne(template.id, value)}
                    />
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setPreviewId(template.id)}
                    >
                      <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {template.name}
                      </span>
                      <span className="block truncate text-xs text-gray-500">
                        {template.subject}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="mt-0.5 text-gray-500 hover:text-blue-600"
                      title="View template"
                      onClick={() => setPreviewId(template.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="min-h-80 rounded-md border border-gray-200 dark:border-gray-700">
            {preview ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-gray-200 px-3 py-2 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {preview.name}
                  </p>
                  <p className="text-xs text-gray-500">{preview.subject}</p>
                </div>
                <iframe
                  title={preview.name}
                  className="h-72 w-full flex-1 bg-white"
                  sandbox=""
                  srcDoc={preview.content || "<p>This template has no content.</p>"}
                />
              </div>
            ) : (
              <div className="flex h-full min-h-72 items-center justify-center px-4 text-center text-sm text-gray-500">
                Click a template name to view it.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <ButtonTw
          type="button"
          variant="blue"
          className="flex-1 gap-2"
          disabled={selectedIds.length === 0 || isImporting}
          loading={isImporting}
          onClick={() => onImport(selectedIds)}
        >
          <Download className="h-4 w-4" />
          Import{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
        </ButtonTw>
        <ButtonTw
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={isImporting}
        >
          Cancel
        </ButtonTw>
      </div>
    </ModalTw>
  );
};

export default ImportEmailTemplateModal;
