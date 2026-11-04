"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/store/useAuthStore";
import { zodResolver } from "@/utils/zodResolver";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
const initialValues = {
  id: "",
  name: "",
  url: "",
};
const AddNoteModal = ({ showModal, handleClose }) => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  const schema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, "Note is required"),
    url: z
      .string()
      .url({ message: "URL is not valid" })
      .min(1, "url is required"),
  });

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const submitForm = async (values) => {
    console.log(values);
  };

  return (
    <div>
      {" "}
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={("Add Notes")}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-12 gap-x-4">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  label="Note Description"
                  placeholder="Enter Note Description"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="url"
              render={({ field, fieldState }) => (
                <Input
                  type="url"
                  label="Note URL"
                  placeholder="Enter Note Url"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12"
                  {...field}
                />
              )}
            />

            <div className="col-span-12 flex justify-center items-center gap-4">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-4 col-span-12"
                // disabled={isLoading}
                // loading={isLoading}
              >
                Save
              </ButtonTw>

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold mt-4 col-span-12"
                onClick={() => reset()}
              >
                Reset
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default AddNoteModal;
