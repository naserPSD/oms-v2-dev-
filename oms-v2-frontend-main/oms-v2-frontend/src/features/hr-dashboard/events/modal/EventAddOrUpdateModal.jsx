import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import DatePicker from "@/components/ui/DatePicker";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";
import { useCommonStore } from "@/store/useCommonStore";
import { format } from "date-fns";
import { parseISO } from "date-fns/parseISO";
import { FormController as Controller } from "@/components/common/FormController";

const EventAddOrUpdateModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
  getTodayDate,
  // errors,
}) => {
  const startDate = watch("startDatetime");
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const eventTypeList =
    dropdowns.statusGroupList?.find((s) => s.code === "event_types")
      ?.statuses || [];

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Event`}
        size="xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          <div className="grid grid-cols-12 gap-x-4 gap-y-4">
            {/* Event Title */}
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Event Title"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Event Title"
                  className="col-span-12"
                  required
                />
              )}
            />

            {/* Event Description */}
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type={"text-area"}
                  label="Description"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Event Description"
                  className="col-span-12"
                  rows={3}
                />
              )}
            />

            {/* Event Type */}
            <Controller
              name="eventTypeId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Event Type"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={eventTypeList.map((type) => ({
                    value: type.id,
                    label: type.name,
                  }))}
                  placeholder="Select Event Type"
                  className="col-span-12 lg:col-span-6"
                  required
                />
              )}
            />

            {/* Location */}
            <Controller
              name="location"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Location"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Event Location"
                  className="col-span-12 lg:col-span-6"
                />
              )}
            />

            {/* All Day Event Switch */}
            <Controller
              name="isAllDay"
              control={control}
              render={({ field }) => (
                <SwitchButton
                  label="All Day Event"
                  enabled={field.value}
                  onClick={() => field.onChange(!field.value)}
                  enabledText="Yes"
                  disabledText="No"
                  className="col-span-12 lg:col-span-6"
                />
              )}
            />

            {/* Start Date & Time */}
            <Controller
              control={control}
              name="startDatetime"
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Start Date"
                  options={{
                    dateFormat: "d-m-Y",
                    minDate: getTodayDate(),
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
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="endDatetime"
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
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  error={fieldState.error?.message}
                />
              )}
            />

            {/* Action Buttons */}
            <div className="col-span-12 flex justify-center items-center gap-4 pt-4">
              <ButtonTw
                type="submit"
                size="sm"
                variant="blue"
                className="w-full font-bold"
                disabled={isLoading}
                loading={isLoading}
              >
                {watch("id") ? "Update Event" : "Create Event"}
              </ButtonTw>

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold"
                onClick={() => reset()}
                type="button"
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

export default EventAddOrUpdateModal;
