import React, { useEffect, useState, useMemo } from "react";
import { FormController as Controller } from "@/components/common/FormController";

import "suneditor/dist/css/suneditor.min.css";

import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import { format } from "date-fns/format";
import SelectSearch from "@/components/ui/SelectSearch";
import { UserIcon, Info, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Award } from "lucide-react";
import helpers from "@/utils/helpers";
import Avatar from "@/components/ui/Avatar";

const AddOrUpdateModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
  employeeList,
  dropdowns,
  setValue,
  promotionEvents = [],
  initialValues,
  basicSalary,
  designationList = [],
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Handle employee selection
  useEffect(() => {
    const empId = watch("employeeId");
    if (empId && employeeList?.length > 0) {
      const emp = employeeList.find((e) => Number(e.value) === Number(empId));
      setSelectedEmployee(emp || null);
    } else {
      setSelectedEmployee(null);
    }
  }, [watch("employeeId"), employeeList]);

  const actionStatusId = watch("actionStatusId");
  const selectedGradeId = watch("newGradeId");
  const oldBasicSalary = watch("oldBasicSalary");

  // Determine movement type
  const {
    isPromotion,
    isDemotion,
    isIncrement,
    isDecrement,
    isPromotionWithoutIncrement,
    selectedEvent,
  } = useMemo(() => {
    const event = promotionEvents?.find(
      (e) => Number(e.value ?? e.id) === Number(actionStatusId),
    );
    const code = event?.code || "";
    const name = (event?.label || event?.name || "").toLowerCase();

    return {
      selectedEvent: event,
      isPromotion:
        code === "employee_events_promotion" ||
        Number(actionStatusId) === 235 ||
        name === "promotion",
      isDemotion:
        code === "employee_events_demotion" ||
        Number(actionStatusId) === 269 ||
        Number(actionStatusId) === 219 ||
        name === "demotion",
      isIncrement:
        code === "employee_events_salary_increment" ||
        Number(actionStatusId) === 236 ||
        Number(actionStatusId) === 213 ||
        (name.includes("increment") && !name.includes("without")),
      isDecrement:
        code === "employee_events_salary_decrement" ||
        Number(actionStatusId) === 270 ||
        name.includes("decrement"),
      isPromotionWithoutIncrement:
        code.includes("promotion_without_increment") ||
        Number(actionStatusId) === 237 ||
        name.includes("without increment"),
    };
  }, [actionStatusId, promotionEvents]);

  // Sync basic salary when employee selection brings active salary structure
  useEffect(() => {
    if (basicSalary?.basicSalary) {
      setValue("oldBasicSalary", basicSalary.basicSalary);
    }

    if (basicSalary?.gradeId) {
      setValue("oldGradeId", basicSalary.gradeId);
      if (!selectedGradeId) {
        setValue("newGradeId", basicSalary.gradeId);

        const selectedGrade = dropdowns.activeSalaryGradeList?.find(
          (d) => Number(d.value) === Number(basicSalary.gradeId),
        );

        if (selectedGrade && !watch("newBasicSalary")) {
          const minSalary = Number(selectedGrade.minSalary || 0);
          const maxSalary = Number(selectedGrade.maxSalary || 0);
          const oldSalary = Number(basicSalary.basicSalary || 0);

          let finalSalary = oldSalary >= minSalary ? oldSalary : minSalary;
          if (finalSalary > maxSalary && maxSalary > 0) {
            finalSalary = maxSalary;
          }

          setValue("newBasicSalary", finalSalary);
        }
      }
    }
  }, [basicSalary, dropdowns.activeSalaryGradeList, selectedGradeId, setValue, watch]);

  // Current selected grade info for range display
  const currentGradeObj = useMemo(() => {
    if (!selectedGradeId) return null;
    return dropdowns.activeSalaryGradeList?.find(
      (g) => Number(g.value) === Number(selectedGradeId),
    );
  }, [selectedGradeId, dropdowns.activeSalaryGradeList]);

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Employee Movement / Promotion`}
        size="2xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          {/* Select Promotion Event */}
          <Controller
            name="actionStatusId"
            control={control}
            rules={{ required: "Promotion / Movement Event is required" }}
            render={({ field, fieldState }) => (
              <SelectSearch
                label="Select Movement Event Type *"
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  // Contextual cleanup when switching event types without wiping employee or dates
                  const targetEvent = promotionEvents?.find(
                    (e) => Number(e.value ?? e.id) === Number(val),
                  );
                  const targetCode = targetEvent?.code || "";
                  const targetName = (targetEvent?.label || targetEvent?.name || "").toLowerCase();

                  const willBeIncrement =
                    targetCode === "employee_events_salary_increment" ||
                    Number(val) === 236 ||
                    (targetName.includes("increment") && !targetName.includes("without"));

                  const willBeDecrement =
                    targetCode === "employee_events_salary_decrement" ||
                    Number(val) === 270 ||
                    targetName.includes("decrement");

                  if (willBeIncrement || willBeDecrement) {
                    setValue("newDesignationId", "");
                  }
                }}
                error={fieldState.error?.message}
                options={promotionEvents || []}
                placeholder="Select Movement Event (Promotion, Demotion, Increment, Decrement)..."
                className="col-span-12"
              />
            )}
          />

          {/* Contextual Guidance Banner */}
          {actionStatusId && (
            <div>
              {isPromotion && (
                <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold block text-sm mb-0.5">Promotion Movement</span>
                    Select the new higher designation and updated salary/grade. Old basic salary will be replaced by the new basic salary and salary structure details will be recalculated.
                  </div>
                </div>
              )}
              {isDemotion && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                  <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold block text-sm mb-0.5">Demotion Movement</span>
                    Reassign employee to an adjusted designation or lower grade. <strong>A mandatory justification reason is required</strong> for audit and HR governance.
                  </div>
                </div>
              )}
              {isIncrement && (
                <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                  <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold block text-sm mb-0.5">Salary Increment</span>
                    Increase the employee basic salary. Designation remains unchanged. New salary must be greater than current basic salary.
                  </div>
                </div>
              )}
              {isDecrement && (
                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  <ArrowDownRight className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold block text-sm mb-0.5">Salary Decrement</span>
                    Decrease employee basic salary. Designation remains unchanged. <strong>A mandatory justification reason is required</strong>.
                  </div>
                </div>
              )}
              {isPromotionWithoutIncrement && (
                <div className="flex items-start gap-2.5 p-3.5 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-xl text-xs text-cyan-800 dark:text-cyan-300">
                  <Award className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold block text-sm mb-0.5">Promotion without Increment</span>
                    Update employee title / designation while keeping existing salary grade and basic compensation intact.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Content */}
          {actionStatusId && (
            <div className="grid grid-cols-12 gap-4">
              {/* Employee Selection Section */}
              <div className="bg-sky-50 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700 p-4 rounded-xl col-span-12">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center text-sm">
                  <UserIcon className="h-4 w-4 mr-2 text-blue-600" />
                  Employee Information
                </h3>

                <Controller
                  control={control}
                  name="employeeId"
                  rules={{ required: "Employee is required" }}
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label="Select Employee *"
                      placeholder="Select Employee..."
                      options={employeeList || []}
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
                  )}
                />

                {selectedEmployee && (
                  <div className="mt-4 p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        {selectedEmployee.avatarUrl ? (
                          <img
                            src={selectedEmployee.avatarUrl}
                            alt={selectedEmployee.label}
                            className="w-10 h-10 rounded-full border border-gray-200"
                          />
                        ) : (
                          <Avatar
                            text={helpers.avatarText(selectedEmployee.label)}
                            color="info"
                            size="sm"
                          />
                        )}
                        <div>
                          <p className="text-xs text-gray-500">Employee Name</p>
                          <p className="font-medium text-xs text-gray-900 dark:text-white">
                            {selectedEmployee.label}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Employee Code</p>
                        <p className="font-mono font-medium text-xs text-gray-900 dark:text-white">
                          {selectedEmployee.code || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Current Designation</p>
                        <p className="font-medium text-xs text-blue-600 dark:text-blue-400">
                          {selectedEmployee.designation || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Designation Selector: Shown for Promotion, Demotion, Promotion without Increment */}
              {(isPromotion || isDemotion || isPromotionWithoutIncrement) && (
                <div className="col-span-12">
                  <Controller
                    name="newDesignationId"
                    control={control}
                    rules={{
                      required: "New Designation is required",
                      validate: (val) => {
                        if (
                          selectedEmployee?.designationId &&
                          Number(val) === Number(selectedEmployee.designationId)
                        ) {
                          return "New designation must be different from current designation";
                        }
                        return true;
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <SelectSearch
                        label="New Designation *"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        options={designationList || []}
                        placeholder="Select New Designation..."
                      />
                    )}
                  />
                </div>
              )}

              {/* Salary Grade: Shown for Promotion, Demotion, Increment, Decrement */}
              {(isPromotion || isDemotion || isIncrement || isDecrement) && (
                <div className="col-span-12 sm:col-span-6">
                  <Controller
                    name="newGradeId"
                    control={control}
                    rules={{ required: "Salary Grade is required" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <SelectSearch
                          label="Salary Grade *"
                          value={field.value}
                          onChange={(val) => {
                            field.onChange(val);

                            const selected = dropdowns.activeSalaryGradeList?.find(
                              (d) => Number(d.value) === Number(val),
                            );

                            if (selected) {
                              const minSalary = Number(selected.minSalary || 0);
                              const maxSalary = Number(selected.maxSalary || 0);
                              const oldSalary = Number(watch("oldBasicSalary") || 0);

                              let finalSalary = oldSalary >= minSalary ? oldSalary : minSalary;
                              if (finalSalary > maxSalary && maxSalary > 0) {
                                finalSalary = maxSalary;
                              }
                              setValue("newBasicSalary", finalSalary);
                            }
                          }}
                          error={fieldState.error?.message}
                          options={dropdowns.activeSalaryGradeList || []}
                          placeholder="Select Salary Grade..."
                        />
                        {currentGradeObj && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                            Range: ৳{Number(currentGradeObj.minSalary || 0).toLocaleString()} - ৳{Number(currentGradeObj.maxSalary || 0).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              )}

              {/* Old Basic Salary: Read-only display */}
              {(isPromotion || isDemotion || isIncrement || isDecrement) && (
                <div className="col-span-12 sm:col-span-6">
                  <Controller
                    name="oldBasicSalary"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Input
                        label="Current Basic Salary"
                        type="number"
                        step="0.01"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        placeholder="Current Basic Salary"
                        disabled={true}
                      />
                    )}
                  />
                </div>
              )}

              {/* New Basic Salary */}
              {(isPromotion || isDemotion || isIncrement || isDecrement) && (
                <div className="col-span-12">
                  <Controller
                    name="newBasicSalary"
                    control={control}
                    rules={{
                      required: "New Basic Salary is required",
                      min: { value: 0, message: "Salary cannot be negative" },
                      validate: (value) => {
                        const newSal = Number(value || 0);
                        const oldSal = Number(oldBasicSalary || 0);

                        if (isIncrement && oldSal > 0 && newSal <= oldSal) {
                          return `Increment requires new salary (${newSal}) to be greater than current basic salary (${oldSal})`;
                        }

                        if (isDecrement && oldSal > 0 && newSal >= oldSal) {
                          return `Decrement requires new salary (${newSal}) to be less than current basic salary (${oldSal})`;
                        }

                        if (currentGradeObj) {
                          const minSal = Number(currentGradeObj.minSalary || 0);
                          const maxSal = Number(currentGradeObj.maxSalary || 0);
                          if (minSal > 0 && newSal < minSal) {
                            return `Salary cannot be less than grade minimum (৳${minSal.toLocaleString()})`;
                          }
                          if (maxSal > 0 && newSal > maxSal) {
                            return `Salary cannot exceed grade maximum (৳${maxSal.toLocaleString()})`;
                          }
                        }

                        return true;
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <Input
                        label="New Basic Salary *"
                        type="number"
                        step="0.01"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        placeholder="Enter New Basic Salary..."
                      />
                    )}
                  />
                </div>
              )}

              {/* Promotion / Action Date */}
              <div className="col-span-12 sm:col-span-6">
                <Controller
                  control={control}
                  name="promotionDate"
                  rules={{ required: "Action / Promotion date is required" }}
                  render={({ field, fieldState }) => (
                    <DatePicker
                      label="Movement / Action Date *"
                      options={{ dateFormat: "d-m-Y" }}
                      value={field.value}
                      onChange={(date) =>
                        field.onChange(format(date, "yyyy-MM-dd"))
                      }
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>

              {/* Effective Date */}
              <div className="col-span-12 sm:col-span-6">
                <Controller
                  control={control}
                  name="effectiveDate"
                  rules={{
                    required: "Effective date is required",
                    validate: (value) => {
                      const promotionDate = watch("promotionDate");
                      if (!promotionDate || !value) return true;

                      const eff = new Date(value).getTime();
                      const prom = new Date(promotionDate).getTime();

                      return (
                        eff >= prom ||
                        "Effective date must be the same or after the Action / Promotion date"
                      );
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <DatePicker
                      label="Effective Date *"
                      options={{ dateFormat: "d-m-Y" }}
                      value={field.value}
                      onChange={(date) =>
                        field.onChange(format(date, "yyyy-MM-dd"))
                      }
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>

              {/* Optional End Date */}
              <div className="col-span-12">
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field, fieldState }) => (
                    <DatePicker
                      label="End Date (Optional)"
                      options={{ dateFormat: "d-m-Y" }}
                      value={field.value}
                      onChange={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>

              {/* Reason Field */}
              <div className="col-span-12">
                <Controller
                  control={control}
                  name="reason"
                  rules={
                    isDemotion || isDecrement
                      ? { required: "A justification reason is mandatory for Demotion or Decrement" }
                      : {}
                  }
                  render={({ field, fieldState }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reason {isDemotion || isDecrement ? <span className="text-red-500">* (Mandatory for Demotion/Decrement)</span> : "(Optional)"}
                      </label>
                      <textarea
                        {...field}
                        rows={4}
                        placeholder={
                          isDemotion || isDecrement
                            ? "Provide mandatory justification and performance/governance notes..."
                            : "Write notes, approval reference, or reasons..."
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none text-sm"
                      />
                      {fieldState.error?.message && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Submit & Reset Buttons */}
              <div className="col-span-12 flex justify-center items-center gap-4 pt-2">
                <ButtonTw
                  type="submit"
                  size="md"
                  variant="blue"
                  className="w-full font-bold"
                  disabled={isLoading}
                  loading={isLoading}
                >
                  Submit Movement Record
                </ButtonTw>

                <ButtonTw
                  size="md"
                  variant="outline.gray"
                  className="w-full font-bold"
                  onClick={() => reset(initialValues)}
                >
                  Reset Form
                </ButtonTw>
              </div>
            </div>
          )}
        </form>
      </ModalTw>
    </div>
  );
};

export default AddOrUpdateModal;
