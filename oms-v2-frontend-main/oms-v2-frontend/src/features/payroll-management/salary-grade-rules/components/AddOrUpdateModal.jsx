import React from "react";
import { FormController as Controller } from "@/components/common/FormController";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import SwitchButton from "@/components/ui/SwitchButton";
import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import FileUpload from "@/components/ui/FileUpload";
import DatePicker from "@/components/ui/DatePicker";
import { parseISO } from "date-fns/parseISO";
import { format } from "date-fns/format";
import SelectSearch from "@/components/ui/SelectSearch";
import { useCommonStore } from "@/store/useCommonStore";
import {
  XMarkIcon,
  CalculatorIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const AddOrUpdateModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
  setValue,
  dropdowns,
  // errors,
}) => {
  // const dropdowns = useCommonStore((state) => state.dropdowns);

  const payItemCalculationMethodList =
    dropdowns.statusGroupList?.find(
      (s) => s.code === "pay_item_calculation_methods",
    )?.statuses ?? [];

  const calculationMethodId = watch("calculationMethodId");
  const id = watch("id");

  const shouldShowPercentage = calculationMethodId == 205;
  const shouldShowFixed = calculationMethodId == 204;
  const shouldShowFormula = calculationMethodId == 206;
  const shouldShowRange = calculationMethodId == 207;

  const getCalculationTypeName = (id) => {
    const type = payItemCalculationMethodList.find(
      (t) => t.id === parseInt(id),
    );
    return type ? type.label : "";
  };

  // Helper to show/hide calc_value field based on calculation type
  const shouldShowCalcValue = () => {
    const calcType = getCalculationTypeName(watch("calculationMethodId"));
    return ["FIXED", "PERCENTAGE", "TIERED"].includes(calcType);
  };

  // Helper to show/hide formula field
  const shouldShowFormulaField = () => {
    const calcType = getCalculationTypeName(watch("calculationMethodId"));
    return calcType === "FORMULA";
  };
  const shouldShowRangeField = () => {
    const calcType = getCalculationTypeName(watch("calculationMethodId"));
    return calcType === "RANGE";
  };

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Salary Grade Rule`}
        size="3xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        {/* FORM */}
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-12 gap-4">
            {/* Salary Grade */}
            <div className="col-span-12 sm:col-span-6">
              <Controller
                name="gradeId"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Salary Grade"
                    value={field.value}
                    // onChange={field.onChange}
                    onChange={(val) => {
                      field.onChange(val);
                      const selected = dropdowns.activeSalaryGradeList?.find(
                        (d) => Number(d.value) === Number(val),
                      );
                      if (selected) {
                        // set values (strings are fine for number inputs)
                        setValue("minBasic", selected.minSalary ?? "");
                        setValue("maxBasic", selected.maxSalary ?? "");
                      } else {
                        setValue("minBasic", "");
                        setValue("maxBasic", "");
                      }
                    }}
                    error={fieldState.error?.message}
                    options={dropdowns.activeSalaryGradeList}
                    placeholder="Select Salary Grade"
                    className="col-span-12 lg:col-span-6 sm:col-span-12"
                  />
                )}
              />
            </div>

            {/* Pay Item */}
            <div className="col-span-12 sm:col-span-6">
              <Controller
                name="payItemId"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Rule Apply on Pay Item"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    options={dropdowns.activePayItemList}
                    placeholder="Select pay Item"
                    className="col-span-12 lg:col-span-6 sm:col-span-12"
                  />
                )}
              />
            </div>

            {/* Min Basic */}
            <div className="col-span-12 sm:col-span-6">
              <Controller
                name="minBasic"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Min Basic"
                    placeholder="Enter Minimum Basic"
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            {/* Max Basic */}
            <div className="col-span-12 sm:col-span-6">
              <Controller
                name="maxBasic"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Max Basic"
                    placeholder="Enter Maximum Basic"
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            {/* Calculation Details */}
            <div className="bg-sky-50 dark:bg-slate-800  border p-4 rounded-lg col-span-12 lg:col-span-12 sm:col-span-12 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CalculatorIcon className="h-5 w-5 mr-2 text-blue-600" />
                Calculation Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Controller
                    name="calculationMethodId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <SelectSearch
                        label="Calculation Method *"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        options={payItemCalculationMethodList}
                        placeholder="Select Calculation Method"
                        className="col-span-12 lg:col-span-6 sm:col-span-12"
                      />
                    )}
                  />
                </div>

                {shouldShowFixed && (
                  <div>
                    <div className="flex">
                      <Controller
                        name="fixedAmount"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Input
                            type="number"
                            // icon={'৳'}
                            // iconPosition="right"
                            // iconBackground={true}
                            step="0.01"
                            min="0"
                            label={"Fixed Amount *"}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            // placeholder="Enter calculation value"
                            placeholder={"e.g., 2000"}
                            className="col-span-12 lg:col-span-6 sm:col-span-12"
                          />
                        )}
                      />
                    </div>
                  </div>
                )}

                {shouldShowPercentage && (
                  <div>
                    <div className="flex">
                      <Controller
                        name="percentage"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Input
                            type="number"
                            icon={"%"}
                            iconPosition="right"
                            iconBackground={true}
                            step="0.01"
                            min="0"
                            label={"Percentage of Basic (%) *"}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            // placeholder="Enter calculation value"
                            placeholder={"e.g., 10"}
                            className="col-span-12 lg:col-span-6 sm:col-span-12"
                          />
                        )}
                      />
                    </div>
                  </div>
                )}

                {shouldShowFormula && (
                  <div className="md:col-span-2">
                    <Controller
                      name="formula"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Input
                          {...field}
                          label="Formula Expression"
                          hints="Use variables like basic_salary, gross_salary, etc."
                          placeholder="Enter Formula Expression"
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Calculation Method */}
            {/* <div className="col-span-12 sm:col-span-6">
              <Controller
                name="calculationMethodId"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    {...field}
                    label="Calculation Method"
                    options={payItemCalculationMethodList}
                    placeholder="Select Method"
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div> */}

            {/* {shouldShowPercentage && (
              <div className="col-span-12 sm:col-span-6">
                <Controller
                  name="percentage"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      type="number"
                      label="Percentage (%)"
                      placeholder="Enter percentage"
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>
            )}

            {shouldShowFixed && (
              <div className="col-span-12 sm:col-span-6">
                <Controller
                  name="fixedAmount"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      type="number"
                      label="Fixed Amount"
                      placeholder="Enter fixed amount"
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>
            )}

            {shouldShowFormula && (
              <div className="col-span-12">
                <Controller
                  name="formula"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      label="Formula"
                      placeholder="Enter formula expression"
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>
            )} */}

            {/* Effective From */}
            <div className="col-span-12 sm:col-span-6">
              <Controller
                name="effectiveFrom"
                control={control}
                render={({ field, fieldState }) => (
                  <DatePicker
                    {...field}
                    label="Effective From"
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            {/* Effective To */}
            <div className="col-span-12 sm:col-span-6">
              <Controller
                name="effectiveTo"
                control={control}
                render={({ field }) => (
                  <DatePicker {...field} label="Effective To (optional)" />
                )}
              />
            </div>

            {/* Remarks */}
            <div className="col-span-12">
              <Controller
                name="remarks"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="textarea"
                    label="Remarks"
                    placeholder="Enter Remarks"
                  />
                )}
              />
            </div>

            {/* Active Status */}
            <div className="col-span-12 sm:col-span-6">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <SwitchButton
                    enabled={field.value}
                    onClick={() => field.onChange(!field.value)}
                    label="Active"
                  />
                )}
              />
            </div>
          </div>

          <div className="col-span-12 flex justify-center items-center gap-4">
            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              className="w-full font-bold mt-4 col-span-12"
              disabled={isLoading}
              loading={isLoading}
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
        </form>
      </ModalTw>
    </div>
  );
};

export default AddOrUpdateModal;
