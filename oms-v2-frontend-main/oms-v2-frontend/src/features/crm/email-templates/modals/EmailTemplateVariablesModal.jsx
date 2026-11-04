// modals/EmailTemplateVariablesModal.jsx
import { ModalTw } from "@/components/common/ModalTw";
import { Code, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

const EmailTemplateVariablesModal = ({
  showModal,
  onClose,
  template,
}) => {
  const [copiedVariable, setCopiedVariable] = useState(null);

  if (!template) return null;

  const handleCopyVariable = (variable) => {
    navigator.clipboard.writeText(`{{${variable}}}`);
    setCopiedVariable(variable);
    setTimeout(() => setCopiedVariable(null), 2000);
  };

  return (
    <ModalTw
      show={showModal}
      onClose={onClose}
      title={`Template Variables - ${template.name}`}
      size="md"
      dismissible={true}
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            These variables can be used in your template content. Copy and paste them into your template.
          </p>
          
          {template.variables && template.variables.length > 0 ? (
            <div className="space-y-2">
              {template.variables.map((variable, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Code className="h-4 w-4 text-gray-400" />
                    <div>
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {"{{" + variable + "}}"}
                      </code>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyVariable(variable)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {copiedVariable === variable ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Code className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No variables defined for this template</p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            How to use variables:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Copy the variable and paste it in your template content</li>
            <li>• Variables will be replaced with actual values when sending emails</li>
            <li>• Example: {"{{user_name}}"} will be replaced with the actual user's name</li>
          </ul>
        </div>
      </div>
    </ModalTw>
  );
};

export default EmailTemplateVariablesModal;