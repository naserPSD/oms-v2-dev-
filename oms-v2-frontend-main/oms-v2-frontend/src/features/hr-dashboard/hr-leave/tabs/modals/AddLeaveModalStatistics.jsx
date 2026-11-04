import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import { FormController as Controller } from "@/components/common/FormController";

const AddLeaveModalStatistics = ({
  showModal,
  handleClose,
  control,
  watch,
  handleSubmit,
  submitForm,
  reset,
  isLoading,
}) => {
  return (
    <div>
      {" "}
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Requisition`}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-2 gap-x-4 ">
            <Controller
              control={control}
              name="itemDescription"
              render={({ field, fieldState }) => (
                <Input
                  label="Requisition"
                  placeholder="Enter Requisition Here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-2"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="quantity"
              render={({ field, fieldState }) => (
                <Input
                  label="Quantity"
                  placeholder="Enter Quantity Here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className=""
                  type="number"
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name="estimatedCost"
              render={({ field, fieldState }) => (
                <Input
                  label="Estimated Cost"
                  placeholder="Enter Estimated Cost Here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className=""
                  type="number"
                  {...field}
                />
              )}
            />

            <div className=" w-full flex justify-center items-center gap-4 col-span-2">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-4 "
                disabled={isLoading}
                loading={isLoading}
              >
                Submit
              </ButtonTw>

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold mt-4 "
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

export default AddLeaveModalStatistics;
