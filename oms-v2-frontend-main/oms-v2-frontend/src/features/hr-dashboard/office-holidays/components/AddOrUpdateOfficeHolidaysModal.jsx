import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import DatePicker from "@/components/ui/DatePicker";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";
import { format, parseISO } from "date-fns";
import { t } from "i18next";
import { FormController as Controller } from "@/components/common/FormController";

const AddOrUpdateOfficeHolidaysModal = ({
  showModal,
  handleClose,
  handleSubmit,
  control,
  submitForm,
  isLoading,
  holidayTypeList,
  startDate,
  getTodayDate,
  watch,
}) => {
  return (
    <div>
      {" "}
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={watch("id") ? "Update Office Holiday" : "Add New Office Holiday"}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-1 gap-4">

            <Controller
              name="holidayTypeId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Holiday Type"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={holidayTypeList || []}
                  placeholder="Select holiday type..."
                />
              )}
            />

            <Controller
              control={control}
              name="holidayName"
              render={({ field, fieldState }) => (
                <Input
                  label="Holiday Name"
                  placeholder="Enter holiday name..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  {...field}
                />
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="isRecurring"
                render={({ field, fieldState }) => (
                  <SwitchButton
                    enabled={field.value}
                    onChange={field.onChange}
                    label="Recurring Holiday"
                    className=""
                    error={fieldState.error?.message}
                    enabledText="Yes"
                    disabledText="No"
                  />
                )}
              />

              <Controller
                control={control}
                name="isOfficial"
                render={({ field, fieldState }) => (
                  <SwitchButton
                    enabled={field.value}
                    onChange={field.onChange}
                    label="Official Holiday"
                    className=""
                    error={fieldState.error?.message}
                    enabledText="Yes"
                    disabledText="No"
                  />
                )}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              <Controller
                control={control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="Start Date"
                    options={{
                      dateFormat: "d-m-Y",
                      // minDate: getTodayDate(),
                      defaultDate: field.value
                        ? parseISO(field.value)
                        : getTodayDate(),
                    }}
                    value={field.value}
                    onChange={(date) => {
                      field.onChange(
                        date ? format(parseISO(date), "yyyy-MM-dd") : ""
                      );
                    }}
                    className=""
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="endDate"
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="End Date"
                    options={{
                      dateFormat: "d-m-Y",
                      minDate: startDate ? parseISO(startDate) : getTodayDate(),
                      defaultDate: field.value
                        ? parseISO(field.value)
                        : startDate
                        ? parseISO(startDate)
                        : getTodayDate(),
                    }}
                    value={field.value}
                    onChange={(date) => {
                      field.onChange(
                        date ? format(parseISO(date), "yyyy-MM-dd") : ""
                      );
                    }}
                    className=""
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <div className="flex justify-center items-center gap-4 mt-4">
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

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold"
                onClick={handleClose}
                type="button"
              >
                Cancel
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default AddOrUpdateOfficeHolidaysModal;
