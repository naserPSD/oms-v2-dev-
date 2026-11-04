"use client";

import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import DatePicker from "@/components/ui/DatePicker";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { zodResolver } from "@/utils/zodResolver";
import { isBefore, parseISO } from "date-fns";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LeavePolicyOverviewPanel from "@/features/hr-dashboard/hr-leave-request/components/LeavePolicyOverviewPanel";

const initialValues = {
  id: 0,
  leaveTypeId: "",
  startDate: "",
  endDate: "",
};

const LeaveRequestModalInNavbar = ({ showModal, handleClose }) => {
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const localDate = (value) => {
    const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const schema = z.object({
    id: z.coerce.number().optional(),
    leaveTypeId: z.coerce.number().min(1, "Leave type is required"),
    reason: z.string().min(1, "Reason is required"),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((val) => {
        const today = getTodayDate();
        const selectedDate = parseISO(val);
        return !isBefore(selectedDate, today);
      }, "Start date cannot be in the past"),
    endDate: z.string().min(1, "End date is required"),
  }).superRefine((values, ctx) => {
    if (!values.startDate || !values.endDate) return;
    const start = parseISO(String(values.startDate).slice(0, 10));
    const end = parseISO(String(values.endDate).slice(0, 10));
    if (isBefore(end, start)) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date cannot be before the start date",
      });
    }
  });

  const { reset, handleSubmit, control, watch, setValue, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const startDate = watch("startDate");

  const { leaveTypesQuery, addOrUpdateLeaveRequestMutation } =
    useHrQueryApi({
      reset,
      setError,
      handleClose,
    });

  const { data: leaveTypesResponse } = leaveTypesQuery();
  const leaveTypeOptions = useMemo(
    () =>
      (leaveTypesResponse?.data || []).map((item) => ({
        label: item.year ? `${item.name} (${item.year})` : item.name,
        value: item.id,
      })),
    [leaveTypesResponse?.data],
  );

  const toIsoDate = (dateStr, endOfDay = false) => {
    if (!dateStr) return dateStr;
    let base = String(dateStr).trim();
    if (base.includes("T")) base = base.split("T")[0];
    const dayFirst = base.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dayFirst) {
      base = `${dayFirst[3]}-${dayFirst[2].padStart(2, "0")}-${dayFirst[1].padStart(2, "0")}`;
    }
    return endOfDay ? `${base}T23:59:59` : `${base}T00:00:00`;
  };

  const submitForm = async (values) => {
    const payload = {
      ...values,
      leaveTypeId: Number(values.leaveTypeId),
      startDate: toIsoDate(values.startDate),
      endDate: toIsoDate(values.endDate, true),
    };

    if (!payload.id || payload.id === 0) {
      delete payload.id;
    }

    await addOrUpdateLeaveRequestMutation.mutateAsync(payload);
  };

  const isLoading = addOrUpdateLeaveRequestMutation.isPending;

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title="Request Leave"
        size="7xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit(submitForm)}
          className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40"
        >
          <div className="mb-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Leave details
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pick this year&apos;s leave type, then choose the dates.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 ">
            <Controller
              control={control}
              name="leaveTypeId"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Leave Type"
                  required={true}
                  placeholder="Select leave type"
                  options={leaveTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-2"
                />
              )}
            />
            <Controller
              control={control}
              name="reason"
              render={({ field, fieldState }) => (
                <Input
                  label="Reason"
                  required={true}
                  placeholder="Enter reason here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-2"
                  {...field}
                  type="textarea"
                />
              )}
            />
            <Controller
              control={control}
              name="startDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Start Date"
                  required={true}
                  minDate={getTodayDate()}
                  options={{
                    dateFormat: "d-m-Y",
                    defaultDate: field.value
                      ? parseISO(field.value)
                      : getTodayDate(),
                  }}
                  value={field.value}
                  onChange={(date) => {
                    const nextStart = date || "";
                    field.onChange(nextStart);
                    const currentEnd = watch("endDate");
                    if (
                      nextStart &&
                      currentEnd &&
                      String(currentEnd).slice(0, 10) <
                        String(nextStart).slice(0, 10)
                    ) {
                      setValue("endDate", "");
                    }
                  }}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="endDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  key={startDate || "end-date"}
                  label="End Date"
                  required={true}
                  minDate={startDate ? localDate(startDate) : getTodayDate()}
                  options={{
                    dateFormat: "d-m-Y",
                    defaultDate: field.value
                      ? parseISO(field.value)
                      : startDate
                        ? parseISO(startDate)
                        : getTodayDate(),
                  }}
                  value={field.value}
                  onChange={(date) => {
                    field.onChange(date || "");
                  }}
                  error={fieldState.error?.message}
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
        <div className="min-w-0 max-h-[70vh] overflow-y-auto pr-1">
          <LeavePolicyOverviewPanel />
        </div>
        </div>
      </ModalTw>
    </div>
  );
};

export default LeaveRequestModalInNavbar;
