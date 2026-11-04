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
import { XMarkIcon, CalculatorIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { FaCheckCircle } from "react-icons/fa";
import Checkbox from "@/components/ui/Checkbox";

const AddOrUpdateModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
  // errors,
}) => {
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const payItemTypeList =
    dropdowns.statusGroupList?.find((s) => s.code === "pay_item_types")
      ?.statuses ?? [];

  const payItemTCategoryList =
    dropdowns.statusGroupList?.find((s) => s.code === "pay_item_categories")
      ?.statuses ?? [];

  const payItemRecurrenceTypeList =
    dropdowns.statusGroupList?.find((s) => s.code === "pay_item_recurrence_types")
      ?.statuses ?? [];

  const payItemCalculationMethodList =
    dropdowns.statusGroupList?.find((s) => s.code === "pay_item_calculation_methods")
      ?.statuses ?? [];

  const getCalculationTypeName = (id) => {
    const type = payItemCalculationMethodList.find(t => t.id === parseInt(id))
    return type ? type.label : ''
  }

  // Helper to show/hide calc_value field based on calculation type
  const shouldShowCalcValue = () => {
    const calcType = getCalculationTypeName(watch("calculationMethodId"))
    return ['FIXED', 'PERCENTAGE', 'TIERED'].includes(calcType)
  }

  // Helper to show/hide formula field
  const shouldShowFormulaField = () => {
    const calcType = getCalculationTypeName(watch("calculationMethodId"))
    return calcType === 'FORMULA'
  }

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Pay item`}
        size="3xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4 ">
          <div className="grid grid-cols-12 gap-x-4">
            <Controller
              name="itemCode"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Item Code"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Item Code e.g., HRA, PF, TAX, etc."
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="itemName"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Item Name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="e.g., House Rent Allowance, Provident Fund, Tax, etc."
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="payItemTypeId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Pay Item Type"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={payItemTypeList}
                  placeholder="Select Pay Item Type"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="payItemCategoryId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Pay Item Category"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={payItemTCategoryList}
                  placeholder="Select Pay Item Category"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            {/* Calculation Details */}
            <div className="bg-sky-50 dark:bg-slate-800 border p-4 rounded-lg col-span-12 lg:col-span-12 sm:col-span-12 mb-4">
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

                {shouldShowCalcValue() && (
                  <div>
                    <div className="flex">
                      <Controller
                        name="calcValue"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Input
                            type="number"
                            // icon={getCalculationTypeName(watch("calculationMethodId")) === 'PERCENTAGE' ? '%' : '$'}
                            // iconPosition="right"
                            // iconBackground={true}
                            step="0.01"
                            min="0"
                            label={watch("calculationMethodId") && getCalculationTypeName(watch("calculationMethodId")) === 'PERCENTAGE'
                              ? 'Percentage Value *'
                              : 'Fixed Amount *'}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            // placeholder="Enter calculation value"
                            placeholder={getCalculationTypeName(watch("calculationMethodId")) === 'PERCENTAGE' ? 'e.g., 50' : 'e.g., 2000'}
                            className="col-span-12 lg:col-span-6 sm:col-span-12"
                          />
                        )}
                      />
                    </div>
                  </div>
                )}
                {/* 
                {shouldShowFormulaField() && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formula Expression
                    </label>
                    <input
                      type="text"
                      name="formula"
                      value={watch("formula") || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., basic_salary * 0.12"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Use variables like basic_salary, gross_salary, etc.
                    </p>
                  </div>
                )} */}
              </div>
            </div>

            <Controller
              name="recurrenceTypeId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Recurrence Type"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={payItemRecurrenceTypeList}
                  placeholder="Select Recurrence Type"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="recurrenceCount"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type="number"
                  min="1"
                  label="Recurrence Count"
                  hints="Number of times this occurs"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Recurrence Count"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />


            {/* Financial Impact */}
            <div className="bg-sky-50 dark:bg-slate-800 border p-4 rounded-lg col-span-12 lg:col-span-12 sm:col-span-12 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Financial Impact</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">

                    <Controller
                      control={control}
                      name="affectsGrossSalary"
                      render={({ field, fieldState }) => (
                        <Checkbox
                          label="Affects Gross Salary"
                          checked={field.value}
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                          size="sm"
                          color="success"
                          icon={FaCheckCircle}
                          circular
                        />
                      )}
                    />

                    <div className="ml-2 group relative">
                      <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                        If checked, this component will be included in gross salary calculation
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Controller
                      control={control}
                      name="affectsNetSalary"
                      render={({ field, fieldState }) => (
                        <Checkbox
                          label="Affects Net Salary"
                          checked={field.value}
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                          size="sm"
                          color="success"
                          icon={FaCheckCircle}
                          circular
                        />
                      )}
                    />
                    <div className="ml-2 group relative">
                      <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                        If checked, this component will affect the final net salary
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">

                    <Controller
                      control={control}
                      name="isTaxable"
                      render={({ field, fieldState }) => (
                        <Checkbox
                          label="Taxable Component"
                          checked={field.value}
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                          size="sm"
                          color="success"
                          icon={FaCheckCircle}
                          circular
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">

                      <Controller
                        control={control}
                        name="isStatutory"
                        render={({ field, fieldState }) => (
                          <Checkbox
                            label="Statutory Requirement (PF, PT, ESI)"
                            checked={field.value}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            size="sm"
                            color="success"
                            icon={FaCheckCircle}
                            circular
                          />
                        )}
                      />
                    </div>

                    {watch("isStatutory") && (
                      <div>
                        <Controller
                          name="taxSection"
                          control={control}
                          render={({ field, fieldState }) => (
                            <Input
                              label="Tax Section (e.g., 80C)"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                              placeholder="e.g., 80C, 10(14)"
                              className="col-span-12 lg:col-span-6 sm:col-span-12"
                            />
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Controller
              name="minLimit"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type="number"
                  step="0.01"
                  min="0.0"
                  label="Minimum Limit"
                  hints="Minimum Allowed Amount for This Component"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter minimum limit e.g., 1500 (for PF)"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="maxLimit"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type="number"
                  step="0.01"
                  min="0.0"
                  label="Maximum Limit"
                  hints="Maximum Allowed Amount for This Component"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Maximum Limit e.g., 150000 (for PF)"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />


            <Controller
              name="sortOrder"
              control={control}
              render={({ field, fieldState }) => (
                  <Input
                    type="number"
                    min="1"
                    label="Sort Order"
                    hints="Lower Numbers Appear First"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    placeholder="Enter sort order"
                    className="col-span-12 lg:col-span-6 sm:col-span-12"
                  />
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <SwitchButton
                  label="Active"
                  enabled={field.value}
                  onClick={() => field.onChange(!field.value)}
                  enabledText="Yes"
                  disabledText="No"
                  className="col-span-12 lg:col-span-4 sm:col-span-12"
                />
              )}
            />

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
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default AddOrUpdateModal;
