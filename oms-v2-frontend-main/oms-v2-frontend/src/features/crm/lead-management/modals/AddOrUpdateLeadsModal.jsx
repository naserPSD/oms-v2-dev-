import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import React from "react";
import { FormController as Controller } from "@/components/common/FormController";
import { useCommonStore } from "@/store/useCommonStore";
import helpers from "@/utils/helpers";
import {
  LEAD_TYPES,
  COMPANY_TYPES,
  PRIORITY_STATUSES,
  CLIENT_STATUSES,
  LEAD_SOURCES,
  LEAD_STATUSES,
} from "../constants/leadConstants";

const AddOrUpdateLeadsModal = ({
  showModal,
  handleClose,
  control,
  watch,
  setValue,
  handleSubmit,
  submitForm,
  isLoading,
  reset,
  editSection = null, // 'company' to show only company fields
  employees = [], // Employees list for Account Manager dropdown
  isClientView = false,
}) => {
  const dropdowns = useCommonStore((state) => state.dropdowns);

  // Convert employees to SelectSearch options format
  const employeeOptions = React.useMemo(() => {
    if (!employees || employees.length === 0) return [];
    
    return employees.map((employee) => {
      // Get user ID - prioritize user.id, fallback to user.userId or employee.id
      const userId = employee.user?.id?.toString() || 
                     employee.user?.userId?.toString() || 
                     employee.id?.toString() || 
                     "";
      
      // Get user name
      const userName = employee.user?.fullName || 
                       `${employee.user?.firstName || ""} ${employee.user?.lastName || ""}`.trim() ||
                       "Unknown User";
      
      return {
        value: userId,
        label: userName,
      };
    }).filter(option => option.value); // Filter out entries without valid IDs
  }, [employees]);

  // Dynamic lead source options from database status groups
  const leadSourceOptions = React.useMemo(() => {
    const group = dropdowns?.statusGroupList?.find(
      (s) => s.code === "lead_sources" || s.name?.toLowerCase().includes("lead source")
    );
    if (group?.statuses?.length > 0) {
      return group.statuses.map((s) => ({ value: s.name, label: s.name }));
    }
    return LEAD_SOURCES;
  }, [dropdowns?.statusGroupList]);

  const formRef = React.useRef(null);

  const isClient =
    isClientView ||
    watch("leadStatus") === "Converted" ||
    ["customer", "partner", "vendor"].includes(watch("clientStatus"));

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={
          editSection === 'company' 
            ? "Update Company Information" 
            : editSection === 'contact'
            ? "Update Key Contact Person"
            : `${watch("id") ? "Update" : "Add New"} ${isClient ? "Client" : "Lead"}`
        }
        size="2xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form 
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(
              submitForm, 
              (errors) => {
                console.log("Form validation errors:", errors);
                if (Object.keys(errors).length > 0) {
                  const errorFields = Object.keys(errors);

                  // Auto-scroll to first error field
                  setTimeout(() => {
                    const firstErrorField = errorFields[0];
                    const el = formRef.current?.querySelector(`[name="${firstErrorField}"]`) ||
                               formRef.current?.querySelector('.border-red-500');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.focus?.();
                    } else {
                      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 50);
                }
              }
            )(e);
          }}
        >
          <div className="space-y-4">
            {/* Company Information Section - Hide when editing contact only */}
            {editSection !== 'contact' && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Controller
                control={control}
                name="leadType"
                rules={{ required: "Lead type is required" }}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label={
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <span>Select Lead Type</span>
                        <span className="text-red-500 font-bold leading-none select-none">*</span>
                      </span>
                    }
                    options={LEAD_TYPES}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="select lead type"
                    error={fieldState.error?.message}
                    searchable={false}
                    className="!mb-0"
                  />
                )}
              />

              <Controller
                control={control}
                name="name"
                rules={{ required: "Company name is required" }}
                render={({ field, fieldState }) => (
                  <Input
                    label={
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <span>Company Name</span>
                        <span className="text-red-500 font-bold leading-none select-none">*</span>
                      </span>
                    }
                    placeholder="Enter Company Name"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="companyType"
                rules={{ required: "Company type is required" }}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label={
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <span>Company Type</span>
                        <span className="text-red-500 font-bold leading-none select-none">*</span>
                      </span>
                    }
                    options={COMPANY_TYPES}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Select Company Type"
                    error={fieldState.error?.message}
                    searchable={false}
                    className="!mb-0"
                  />
                )}
              />

              <Controller
                control={control}
                name="website"
                render={({ field, fieldState }) => (
                  <Input
                    label="Website"
                    type="url"
                    placeholder="Enter Website (e.g., https://example.com)"
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="priorityStatus"
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Priority Status"
                    options={PRIORITY_STATUSES}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Select Priority Status"
                    error={fieldState.error?.message}
                    searchable={false}
                    className="!mb-0"
                  />
                )}
              />

              <Controller
                control={control}
                name="clientStatus"
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Client Status"
                    options={CLIENT_STATUSES}
                    value={field.value || ""}
                    onChange={(val) => {
                      field.onChange(val);
                      if (["customer", "partner", "vendor"].includes(val) && setValue) {
                        setValue("leadStatus", "Converted");
                      } else if ((val === "lead" || val === "prospect") && setValue && !watch("id")) {
                        setValue("leadStatus", "Active");
                      }
                    }}
                    placeholder="Select Client Status"
                    error={fieldState.error?.message}
                    searchable={false}
                    className="!mb-0"
                  />
                )}
              />

              <Controller
                control={control}
                name="leadSource"
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Source"
                    options={leadSourceOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Enter Source"
                    error={fieldState.error?.message}
                    searchable={false}
                    className="!mb-0"
                  />
                )}
              />

              <Controller
                control={control}
                name="dealValue"
                render={({ field, fieldState }) => (
                  <Input
                    label="Deal Value"
                    type="number"
                    placeholder="Enter Deal Value"
                    value={field.value || ""}
                    onChange={(val) => {
                      const numValue = val === "" ? "" : (parseFloat(val) || 0);
                      field.onChange(numValue);
                    }}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="assignedTo"
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Account Manager"
                    options={employeeOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Search and Select Account Manager"
                    error={fieldState.error?.message}
                    searchable={true}
                    className="!mb-0"
                  />
                )}
              />

              {/* Show Lead Status only when editing company info */}
              {editSection === 'company' && (
                <Controller
                  control={control}
                  name="leadStatus"
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label="Status"
                      options={LEAD_STATUSES}
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Select Status"
                      error={fieldState.error?.message}
                      searchable={false}
                      className="!mb-0"
                    />
                  )}
                />
              )}
            </div>
            )}

            {/* Key Contact Info Section - Show when editing contact or full form */}
            {(editSection === 'contact' || editSection !== 'company') && (
            <div className={editSection === 'contact' ? '' : 'border-t pt-4 mt-4'}>
              <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
                Key Contact Info
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <Controller
                  control={control}
                  name="contactName"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Name"
                      placeholder="Enter Name"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="contactEmail"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Email"
                      type="email"
                      placeholder="Enter Email"
                      value={field.value || ""}
                      onChange={(val) => field.onChange(val || "")}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="contactDepartment"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Department"
                      placeholder="Enter Department"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="contactDesignation"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Designation"
                      placeholder="Enter Designation"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="contactPhone"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Phone"
                      placeholder="Enter Phone Number"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="contactAlternativePhone"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Alternative Phone"
                      placeholder="Enter Alternative Phone Number"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>
            </div>
            )}

            {/* Action Buttons */}
            <div className="w-full flex justify-center items-center gap-4 mt-6 pt-4 border-t">
              <ButtonTw
                type="button"
                size="sm"
                variant="outline.gray"
                className="w-full font-bold"
                onClick={handleClose}
              >
                Cancel
              </ButtonTw>

              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold"
                disabled={isLoading}
                loading={isLoading}
              >
                Save
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default AddOrUpdateLeadsModal;
