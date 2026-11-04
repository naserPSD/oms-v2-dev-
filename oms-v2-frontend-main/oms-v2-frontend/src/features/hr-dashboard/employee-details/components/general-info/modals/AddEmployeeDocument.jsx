import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import FileUpload from "@/components/ui/FileUpload";
import SelectSearch from "@/components/ui/SelectSearch";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { zodResolver } from "@/utils/zodResolver";
//import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

// Zod schema with conditional validation
const schema = z.object({
  id: z.coerce.number().optional(),
  companyDocumentId: z.coerce.number().min(1, "Company Document is required"),
  documentFile: z
    .any()
    .refine((file) => file instanceof File, "Attachment is required"),
});

const initialValues = {
  id: "",
  companyDocumentId: "",
  documentFile: null,
};

const AddEmployeeDocument = ({
  // editItem,
  employeeId,
  showModal = false,
  onClose,
  isLoading,
  companyDocumentsOptions,
  setShowModal,
}) => {
  const { handleSubmit, control, reset, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });
  // Handle modal close
  const handleClose = () => {
    if (onClose) onClose();
    reset(initialValues); // Call parent's onClose
  };

  const { addOrUpdateDocumentFileMutationWithEmployeeId } = useHrQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  // Add this effect:
  // useEffect(() => {
  //   if (editItem) {
  //     reset({
  //       ...editItem,
  //     });
  //   } else {
  //     reset(initialValues);
  //   }
  // }, [editItem, reset]);

  const submitForm = async (values) => {
    const formData = new FormData();

    formData.append("companyDocumentId", values.companyDocumentId);

    if (values.documentFile) {
      formData.append("documentFile", values.documentFile);
    }

    await addOrUpdateDocumentFileMutationWithEmployeeId.mutateAsync({
      payload: formData,
      employee_id: employeeId,
    });
  };

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`Add Document`}
        size="lg"
        onConfirm={handleClose}
        dismissible={true}
        confirmText="Confirm"
        cancelText="Cancel"
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form className="p-3" onSubmit={handleSubmit(submitForm)}>
          <div className="">
            <Controller
              control={control}
              name="companyDocumentId"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Company Document"
                  options={companyDocumentsOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-9 sm:col-span-12"
                  placeholder="Select Company Document"
                  searchable
                />
              )}
            />

            <Controller
              control={control}
              name="documentFile"
              render={({ field, fieldState }) => (
                <FileUpload
                  {...field}
                  label="Attachment"
                  accept="image/*,application/pdf"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  error={fieldState.error?.message}
                  size="sm"
                  clearable
                />
              )}
            />
          </div>

          <div className="col-span-12 flex justify-center items-center gap-4">
            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              className="w-full font-bold mt-4 col-span-12 "
              disabled={isLoading}
              loading={isLoading}
            >
              Submit
            </ButtonTw>

            <ButtonTw
              size="sm"
              variant="outline.gray"
              className="w-full font-bold mt-4 col-span-12"
              onClick={() => reset(initialValues)}
            >
              Reset
            </ButtonTw>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default AddEmployeeDocument;
