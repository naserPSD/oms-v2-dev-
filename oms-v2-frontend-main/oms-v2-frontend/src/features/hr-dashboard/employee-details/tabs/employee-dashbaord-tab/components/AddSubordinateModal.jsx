import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import DatePicker from "@/components/ui/DatePicker";
import SelectSearch from "@/components/ui/SelectSearch";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { zodResolver } from "@/utils/zodResolver";
import { format, isBefore, parseISO } from "date-fns";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const initialValues = {
  id: "",
  empId: "",
  startDate: "",
  endDate: "",
};

const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const schema = z
  .object({
    id: z.coerce.number(),
    empId: z.coerce.number().min(1, "Employeee is required"),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((val) => {
        const today = getTodayDate();
        const selectedDate = parseISO(val);
        return !isBefore(selectedDate, today);
      }, "Start date cannot be in the past"),

    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      // endDate empty হলে skip করবে
      if (!data.endDate) return true;

      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    },
  );

const AddSubordinateModal = ({
  id,
  setShowModal,
  showModal,
  selectedSubordinate,
}) => {
  const { handleSubmit, setError, control, reset, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = () => {
    reset(initialValues);
    setShowModal(false);
  };

  useEffect(() => {
    if (selectedSubordinate) {
      // form reset or set value
      reset(selectedSubordinate);
    }
  }, [reset, selectedSubordinate]);

  ///api Call
  const { addOrUpdateemployeeHierarchyMutation, useAppEmployeeUsersQuery } =
    useHrQueryApi({
      reset,
      setError,
      handleClose,
      setShowModal,
    });

  const { data: employeeList } = useAppEmployeeUsersQuery();

  // Handle subordinate selection
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    if (watch("empId") && employeeList.length > 0) {
      const emp = employeeList.find((e) => e.value === watch("empId"));
      setSelectedEmployee(emp);
    } else {
      setSelectedEmployee(null);
    }
  }, [watch("empId"), employeeList]);

  //add Supervisor.........
  const submitForm = async (values) => {
    const payload = {
      ...values,
      supervisorId: Number(id),
    };
    if (!payload.endDate) {
      delete payload.endDate;
    }
    await addOrUpdateemployeeHierarchyMutation.mutateAsync(payload);
  };
  const startDate = watch("startDate");
  return (
    <div>
      {/* ........SupperVisor Modal......... */}
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={watch("id") ? "Edit Subordinate" : "Add Subordinate"}
        size="xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-12 gap-x-4">
            <div className="bg-sky-50 dark:bg-slate-800 border p-4 rounded-lg col-span-12 mb-4">
              <h3 className="font-semibold mb-4">Subordinate Information</h3>

              <Controller
                control={control}
                name="empId"
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Select Subordinate"
                    placeholder="Select Subordinate"
                    options={employeeList}
                    value={field.value}
                    onChange={field.onChange}
                    showAvatar
                    showId
                    labelKey="label"
                    valueKey="value"
                    avatarKey="avatarUrl"
                    designationKey="designation"
                    showDesignation
                    idKeyName="code"
                    idKeyLabel="Employee Code"
                    error={fieldState.error?.message}
                  />
                )}
              />

              {selectedEmployee && (
                <div className="mt-6 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedEmployee.avatarUrl}
                      alt={selectedEmployee.label}
                      className="w-14 h-14 rounded-full border"
                    />
                    <div>
                      <p className="text-sm text-gray-500">Employee Name</p>
                      <p className="font-medium">{selectedEmployee.label}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Employee Code</p>
                    <p className="font-mono font-medium">
                      {selectedEmployee.code}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Designation</p>
                    <p className="font-medium">
                      {selectedEmployee.designation}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Controller
              control={control}
              name="startDate"
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
                      date ? format(parseISO(date), "yyyy-MM-dd") : "",
                    );
                  }}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
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
                      date ? format(parseISO(date), "yyyy-MM-dd") : "",
                    );
                  }}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  error={fieldState.error?.message}
                />
              )}
            />

            <div className="col-span-12 flex justify-center items-center gap-4">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-4 col-span-12"
                disabled={addOrUpdateemployeeHierarchyMutation?.isLoading}
                loading={addOrUpdateemployeeHierarchyMutation?.isLoading}
              >
                Submit
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

export default AddSubordinateModal;
