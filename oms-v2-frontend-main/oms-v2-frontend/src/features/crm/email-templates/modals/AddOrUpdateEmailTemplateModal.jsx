// modals/AddOrUpdateEmailTemplateModal.jsx
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";
import { FormController as Controller } from "@/components/common/FormController";
import { BiSave } from "react-icons/bi";
import EmailTemplateContentEditor from "../components/EmailTemplateContentEditor";

const CATEGORY_OPTIONS = [
  { value: "onboarding", label: "Onboarding" },
  { value: "authentication", label: "Authentication" },
  { value: "newsletter", label: "Newsletter" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "billing", label: "Billing" },
  { value: "support", label: "Support" },
  { value: "marketing", label: "Marketing" },
  { value: "product", label: "Product" },
  { value: "calendar", label: "Calendar" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" },
];

const AddOrUpdateEmailTemplateModal = ({
  showModal,
  handleClose,
  isEditing,
  control,
  watch,
  handleSubmit,
  submitForm,
  isLoading,
  errors,
  editorKey,
  variables = [],
  mode = "company",
}) => {
  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title={isEditing ? "Edit Email Template" : "Create New Email Template"}
      size="4xl"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <div>
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  label="Template Name"
                  placeholder="Enter Template Name..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  required
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="category"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Category"
                  placeholder="Select Category"
                  options={CATEGORY_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  required
                  searchable
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
                placeholder="Enter Email Subject..."
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                required
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <Input
                type="textarea"
                label="Description"
                placeholder="Enter Template Description..."
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                rows={2}
                {...field}
              />
            )}
          />

          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="status"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Status"
                  placeholder="Select Status"
                  options={STATUS_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  required
                  searchable={false}
                />
              )}
            />

            <Controller
              control={control}
              name="isDefault"
              render={({ field }) => (
                <SwitchButton
                  label="Default Template"
                  enabled={Boolean(field.value)}
                  onChange={field.onChange}
                  enabledText="Yes"
                  disabledText="No"
                  color="success"
                  size="sm"
                  className="[&_label]:!mb-2 [&_button]:mt-1"
                />
              )}
            />
          </div>

          {mode === "master" && (
            <Controller
              control={control}
              name="availableForSubscriber"
              render={({ field }) => (
                <SwitchButton
                  label="Available for Subscriber"
                  enabled={Boolean(field.value)}
                  onChange={field.onChange}
                  enabledText="Yes"
                  disabledText="No"
                  color="primary"
                  size="sm"
                  className="mb-5 [&_label]:!mb-2"
                />
              )}
            />
          )}

          <Controller
            control={control}
            name="content"
            render={({ field, fieldState }) => (
              <EmailTemplateContentEditor
                editorKey={editorKey}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                extraVariables={variables}
              />
            )}
          />

          <div className="flex gap-3 pt-2">
            <ButtonTw
              type="submit"
              variant="blue"
              className="flex-1 gap-2"
              disabled={isLoading}
              loading={isLoading}
            >
              <BiSave />
              {isEditing ? "Update Template" : "Create Template"}
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

export default AddOrUpdateEmailTemplateModal;
