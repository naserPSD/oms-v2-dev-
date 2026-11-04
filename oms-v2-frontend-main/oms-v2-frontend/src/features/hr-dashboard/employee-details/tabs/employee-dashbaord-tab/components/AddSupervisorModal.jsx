import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import DatePicker from "@/components/ui/DatePicker";
import SelectSearch from "@/components/ui/SelectSearch";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { zodResolver } from "@/utils/zodResolver";
import { format, isBefore, parseISO } from "date-fns";
import { UserIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const initialValues = {
  id: "",
  supervisorId: "",
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
    supervisorId: z.coerce.number().min(1, "Supervisor is required"),
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

const AddSupervisorModal = ({
  id,
  setShowModal,
  showModal,
  selectedSupervisor,
}) => {
  //...................add Supervisor Start...................//
  const { handleSubmit, setError, control, reset, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });
  //for supervisor.......

  const handleClose = () => {
    reset(initialValues);
    setShowModal(false);
  };

  useEffect(() => {
    if (selectedSupervisor) {
      // form reset or set value
      reset(selectedSupervisor);
    }
  }, [reset, selectedSupervisor]);

  ///api Call
  const { addOrUpdateemployeeHierarchyMutation, useAppEmployeeUsersQuery } =
    useHrQueryApi({
      reset,
      setError,
      handleClose,
      setShowModal,
    });

  const { data: employeeList } = useAppEmployeeUsersQuery();

  // Handle supervisor selection
  const [selectedsupervisorId, setSelectedSupervisorId] = useState(null);

  useEffect(() => {
    if (watch("supervisorId") && employeeList.length > 0) {
      const supervisor = employeeList.find(
        (e) => e.value === watch("supervisorId"),
      );
      setSelectedSupervisorId(supervisor);
    } else {
      setSelectedSupervisorId(null);
    }
  }, [watch("supervisorId"), employeeList]);

  //add Supervisor.........
  const submitForm = async (values) => {
    const payload = {
      ...values,
      empId: Number(id),
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
        title={watch("id") ? "Edit Supervisor" : "Add Supervisor"}
        size="xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-12 gap-x-4">
            <div className="bg-sky-50 dark:bg-slate-800 border p-4 rounded-lg col-span-12 lg:col-span-12 sm:col-span-12 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                Supervisor Information
              </h3>

              <div>
                <Controller
                  control={control}
                  name="supervisorId"
                  render={({ field, fieldState }) => (
                    <div>
                      <SelectSearch
                        label="Select Supervisor"
                        placeholder="Select Supervisor"
                        options={employeeList}
                        value={field.value}
                        onChange={field.onChange}
                        showAvatar={true}
                        showId={true}
                        labelKey="label"
                        valueKey="value"
                        avatarKey="avatarUrl"
                        designationKey="designation"
                        showDesignation={true}
                        idKeyName="code"
                        idKeyLabel="Employee Code"
                        error={fieldState.error?.message}
                      />
                    </div>
                  )}
                />
              </div>

              {selectedsupervisorId && (
                <div className="mt-6 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-start gap-2">
                      <img
                        src={selectedsupervisorId.avatarUrl}
                        alt={selectedsupervisorId.label}
                        className="w-14 h-14 rounded-full border-3 border-gray-300 "
                      />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Employee Name
                        </p>
                        <p className="font-medium">
                          {selectedsupervisorId
                            ? selectedsupervisorId.label
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Employee Code
                      </p>
                      <p className="font-mono font-medium">
                        {selectedsupervisorId ? selectedsupervisorId.code : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Designation
                      </p>
                      <p className="font-medium">
                        {selectedsupervisorId
                          ? selectedsupervisorId.designation
                          : ""}
                      </p>
                    </div>
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

export default AddSupervisorModal;
