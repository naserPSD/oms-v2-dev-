import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import DatePicker from "@/components/ui/DatePicker";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";
import { format, parseISO, addDays, eachDayOfInterval, isValid } from "date-fns";
import { t } from "i18next";
import { FormController as Controller } from "@/components/common/FormController";
import { useEffect, useState } from "react";
import { CalendarDays, X } from "lucide-react";

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
  setValue,
  watch,
  getValues,
}) => {
  const [holidayDates, setHolidayDates] = useState([]);

  // Watch for changes in startDate and dayCount
  const watchedStartDate = watch("startDate");
  const watchedDayCount = watch("dayCount");
  const watchedId = watch("id");

  // Calculate holiday dates whenever startDate or dayCount changes
  useEffect(() => {
    if (watchedStartDate && watchedDayCount && parseInt(watchedDayCount) > 0) {
      try {
        const start = parseISO(watchedStartDate);
        const dayCount = parseInt(watchedDayCount);
        const existingDates = getValues("holidayDates") || [];
        const existingDatesAreValid = existingDates.every((date, index) => {
          const parsedDate = parseISO(date);
          return (
            isValid(parsedDate) &&
            format(parsedDate, "yyyy-MM-dd") === date &&
            (!index || existingDates[index - 1] < date)
          );
        });

        if (
          existingDates.length === dayCount &&
          existingDates[0] === watchedStartDate &&
          existingDates[existingDates.length - 1] === getValues("endDate") &&
          existingDatesAreValid
        ) {
          setHolidayDates(
            existingDates.map(date => {
              const parsedDate = parseISO(date);
              return {
                date: parsedDate,
                formattedDate: format(parsedDate, "dd-MM-yyyy"),
                dayName: format(parsedDate, "EEEE"),
              };
            }),
          );
          return;
        }

        // Generate array of dates from start date to end date
        const endDate = addDays(start, dayCount - 1);
        const dates = eachDayOfInterval({ start, end: endDate });

        // Format dates for display
        const formattedDates = dates.map(date => ({
          date: date,
          formattedDate: format(date, "dd-MM-yyyy"),
          dayName: format(date, "EEEE")
        }));

        // Store only the date strings in YYYY-MM-DD format for API
        const dateStrings = dates.map(date => format(date, "yyyy-MM-dd"));

        // Set holidayDates state for display
        setHolidayDates(formattedDates);

        // Set the actual date strings in the form for submission
        setValue("holidayDates", dateStrings);
        setValue("endDate", format(endDate, "yyyy-MM-dd"));

      } catch (error) {
        console.error("Error calculating holiday dates:", error);
        setValue("holidayDates", []);
        setHolidayDates([]);
      }
    } else {
      setValue("holidayDates", []);
      setHolidayDates([]);
    }
  }, [watchedStartDate, watchedDayCount, getValues, setValue]);

  const handleRemoveDate = (dateToRemove) => {
    const updatedDates = holidayDates.filter(
      item => item.formattedDate !== dateToRemove.formattedDate,
    );
    const dateStrings = updatedDates.map(item => format(item.date, "yyyy-MM-dd"));

    setHolidayDates(updatedDates);
    setValue("holidayDates", dateStrings);
    setValue("dayCount", updatedDates.length ? String(updatedDates.length) : "");
    setValue("startDate", dateStrings[0] || "");
    setValue("endDate", dateStrings[dateStrings.length - 1] || "");
  };

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={watchedId ? "Update Office Holiday" : "Add New Office Holiday"}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-1 gap-2">
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
                  placeholder="Select Holiday Type..."
                />
              )}
            />

            <Controller
              control={control}
              name="holidayName"
              render={({ field, fieldState }) => (
                <Input
                  label="Holiday Name"
                  placeholder="Enter Holiday Name..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  {...field}
                />
              )}
            />

            <div className="grid sm:grid-cols-9">
              <Controller
                control={control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="Starts From"
                    options={{
                      dateFormat: "d-m-Y",
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
                    error={fieldState.error?.message}
                    className="col-span-5"
                  />
                )}
              />

              <div className="col-span-1"></div>

              <Controller
                control={control}
                name="dayCount"
                render={({ field, fieldState }) => (
                  <Input
                    label="Day Count"
                    type="number"
                    placeholder="Enter Day Count (e.g. 1)"
                    hints="Number of holiday days"
                    min="1"  // Minimum value
                    max="365" // Maximum value (optional)
                    step="1"  // Step increment
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-3"
                    {...field}
                  />
                )}
              />
            </div>

            {/* Holiday Dates List */}
            {holidayDates.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Holiday Dates ({holidayDates.length} {holidayDates.length === 1 ? 'day' : 'days'})
                  </h3>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {holidayDates.map((holiday, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {holiday.formattedDate}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {holiday.dayName}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDate(holiday)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                        aria-label={`Remove ${holiday.formattedDate}`}
                      >
                        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>

                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    From {holidayDates[0]?.formattedDate} ({holidayDates[0]?.dayName}) to{' '}
                    {holidayDates[holidayDates.length - 1]?.formattedDate} ({holidayDates[holidayDates.length - 1]?.dayName})
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-center items-center gap-4 mt-4">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold"
                disabled={isLoading || holidayDates.length === 0}
                loading={isLoading}
              >
                Save {holidayDates.length > 0 ? `(${holidayDates.length} days)` : ''}
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