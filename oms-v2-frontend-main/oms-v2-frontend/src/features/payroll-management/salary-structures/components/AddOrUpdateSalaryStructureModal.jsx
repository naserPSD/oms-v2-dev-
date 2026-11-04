// src/features/payroll/salary-structures/components/AddOrUpdateSalaryStructureModal.jsx
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";
import { useFieldArray, useWatch } from "react-hook-form";
import { BiSave, BiPlus, BiTrash } from "react-icons/bi";
import { useState, useEffect, useCallback } from 'react'
import { CalculatorIcon, UserIcon, CalendarIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline'
import { getActiveSalaryGradeRuleList } from "@/services/payrollRelatedApi";

const AddOrUpdateSalaryStructureModal = ({
  showModal,
  handleClose,
  isEditing,
  control,
  handleSubmit,
  submitForm,
  isLoading,
  employeeList,
  gradeList = [],
  payItemList = [],
  watch,
  setError,
  clearErrors,
  setValue,
  errors,
  reset,
}) => {
  // Dynamic fields for salary structure details
  const { fields, append, remove } = useFieldArray({
    control,
    name: "empSalaryStructureDetails",
  });

  // Watch basic salary and details for real-time calculation
  const basicSalary = useWatch({ control, name: "basicSalary" }) || 0;
  const gradeId = useWatch({ control, name: "gradeId" });
  const details = useWatch({ control, name: "empSalaryStructureDetails" }) || [];

  // Add new salary detail row
  const addSalaryDetail = () => {
    append({
      payItemId: 0,
      amount: 0,
      percentage: 0,
      calculatedAmount: 0,
      componentName: '',
      payItemType: '',
    });
  };

  // Calculate amount based on basic salary and percentage or fixed amount
  const calculateAmount = useCallback((amount, percentage, basicSalary) => {
    const fixedAmount = parseFloat(amount) || 0;
    const percentValue = parseFloat(percentage) || 0;
    const basic = parseFloat(basicSalary) || 0;

    // If fixed amount > 0, use it directly (prioritize fixed amount over percentage)
    if (fixedAmount > 0) {
      return fixedAmount;
    }
    
    // Otherwise, calculate based on percentage
    if (percentValue > 0) {
      return basic * (percentValue / 100);
    }
    
    return 0;
  }, []);

  // Effect to update all calculated amounts when basic salary changes
  useEffect(() => {
    const recalculateAllAmounts = () => {
      details.forEach((detail, index) => {
        if (detail) {
          const calculated = calculateAmount(
            detail.amount || 0,
            detail.percentage || 0,
            basicSalary
          );
          console.log(`Calculated amount for detail ${index}: ${calculated}`);
          setValue(`empSalaryStructureDetails.${index}.calculatedAmount`, calculated);
        }
      });
    };

    recalculateAllAmounts();
  }, [basicSalary, calculateAmount, setValue]);

  // Recalculate specific row when its amount or percentage changes
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      // Check if the changed field is amount or percentage
      if (name && (name.includes('amount') || name.includes('percentage'))) {
        // Extract index from field name
        const match = name.match(/empSalaryStructureDetails\.(\d+)\.(amount|percentage)/);
        if (match) {
          const index = parseInt(match[1]);
          const currentDetail = details[index];

          if (currentDetail) {
            const calculated = calculateAmount(
              currentDetail.amount || 0,
              currentDetail.percentage || 0,
              basicSalary
            );
            setValue(`empSalaryStructureDetails.${index}.calculatedAmount`, calculated);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, details, basicSalary, calculateAmount, setValue]);

  // Initialize with one default row when modal opens
  useEffect(() => {
    if (showModal && fields.length === 0 && !isEditing) {
      append({
        payItemId: 0,
        amount: 0,
        percentage: 0,
        calculatedAmount: 0,
        componentName: '',
        payItemType: '',
      });
    }
  }, [showModal, fields.length, append, isEditing]);

  // Helper function to get filtered pay items for a specific row
  const getFilteredPayItemsForRow = (currentIndex) => {
    // Get all payItemIds from other rows
    const otherPayItemIds = details
      .filter((_, index) => index !== currentIndex) // Exclude current row
      .map(detail => detail?.payItemId)
      .filter(Boolean); // Filter out undefined/null/0

    return (payItemList ?? [])
      // .filter(item => item.payItemCategoryId !== 196)
      .filter(item => !otherPayItemIds.includes(Number(item.value)))
      .map(item => {
        if (!item.value) return item;
        return {
          ...item,
          value: Number(item.value),
        }
      });
  };

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Handle employee selection
  useEffect(() => {
    if (watch('empId') && employeeList.length > 0) {
      const emp = employeeList.find(e => e.value === watch('empId'));
      setSelectedEmployee(emp);
    } else {
      setSelectedEmployee(null);
    }
  }, [watch('empId'), employeeList]);

  // Function to handle pay item selection and fetch grade rules
  const handlePayItemChange = async (index, payItemId) => {
    const currentGradeId = watch('gradeId');

    if (currentGradeId && payItemId) {
      try {
        // Fetch grade rule data
        const result = await getActiveSalaryGradeRuleList({
          gradeId: currentGradeId,
          payItemId: payItemId,
        });

        if (result?.data) {
          // Set component name
          const selectedOption = payItemList.find(opt => opt.value === payItemId);
          setValue(`empSalaryStructureDetails.${index}.componentName`, selectedOption?.label || '');

          const amount = parseFloat(result.data.fixedAmount) || 0;
          const percentage = result.data.percentage || 0;
          const calculated = calculateAmount(amount, percentage, basicSalary);

          // Check if this is a new row (both amount and percentage are empty/zero)
          const isNewRow = !details[index]?.amount && !details[index]?.percentage;

          if (isEditing && !isNewRow) {
            // During editing of existing rows, only set calculated amount
            setValue(`empSalaryStructureDetails.${index}.calculatedAmount`, calculated);
            setValue(`empSalaryStructureDetails.${index}.payItemType`, result.data.payItemType);
            return;
          }

          // Update form values (for new rows or when not editing)
          setValue(`empSalaryStructureDetails.${index}.amount`, amount);
          setValue(`empSalaryStructureDetails.${index}.percentage`, percentage);

          // Recalculate based on new values
          setValue(`empSalaryStructureDetails.${index}.calculatedAmount`, calculated);
          setValue(`empSalaryStructureDetails.${index}.payItemType`, result.data.payItemType);

        }
      } catch (error) {
        console.error('Error fetching grade rule:', error);
        // Reset values if API fails
        setValue(`empSalaryStructureDetails.${index}.amount`, 0);
        setValue(`empSalaryStructureDetails.${index}.percentage`, 0);
        setValue(`empSalaryStructureDetails.${index}.calculatedAmount`, 0);
        setValue(`empSalaryStructureDetails.${index}.payItemType`, '');
        setValue(`empSalaryStructureDetails.${index}.componentName`, '');
      }
    }
  };

  // Custom calculation for each row display
  const getRowCalculatedAmount = useCallback((index) => {
    const currentDetail = details[index] || {};
    return calculateAmount(
      currentDetail.amount || 0,
      currentDetail.percentage || 0,
      basicSalary
    );
  }, [details, basicSalary, calculateAmount]);

  // Calculate total earnings (Earning type components)
  const totalEarnings = useCallback(() => {
    return details.reduce((sum, detail, index) => {
      if (detail.payItemType === 'Earning') {
        return sum + getRowCalculatedAmount(index);
      }
      return sum;
    }, 0);
  }, [details, getRowCalculatedAmount]);


  // Calculate total deductions (Deduction type components)
  const totalDeductions = useCallback(() => {
    return details.reduce((sum, detail, index) => {
      if (detail.payItemType === 'Deduction') {
        return sum + getRowCalculatedAmount(index);
      }
      return sum;
    }, 0);
  }, [details, getRowCalculatedAmount]);

  // setValue('grossSalary', totalEarnings() - totalDeductions() + parseFloat(basicSalary || 0));

  useEffect(() => {
    // setValue('grossSalary', (parseFloat(basicSalary || 0) + totalEarnings()).toFixed(2));
    setValue('grossSalary', (totalEarnings()).toFixed(2));
    setValue('totalDeductions', totalDeductions().toFixed(2));
    // setValue('netSalary', (parseFloat(basicSalary || 0) + totalEarnings() - totalDeductions()).toFixed(2));
    setValue('netSalary', (totalEarnings() - totalDeductions()).toFixed(2));
  }, [totalEarnings, totalDeductions, basicSalary, setValue]);

  const validateBasicSalaryByGrade = useCallback(
    (salary, selectedGradeId) => {
      if (!selectedGradeId) return true;

      const grade = gradeList.find(
        (g) => g.value === selectedGradeId || g.id === selectedGradeId,
      );
      if (!grade) return true;

      const value = parseFloat(salary || 0);
      const min = Number(grade.minSalary || 0);
      const max = Number(grade.maxSalary || 0);

      if (value < min || value > max) {
        return `Basic Salary must be between ${min.toLocaleString()} and ${max.toLocaleString()} for ${grade.label || grade.gradeName || "this grade"}`;
      }

      return true;
    },
    [gradeList],
  );

  useEffect(() => {
    if (!gradeId) return;

    /** 🔹 Revalidate basic salary immediately */
    const result = validateBasicSalaryByGrade(basicSalary, gradeId);
    if (result !== true) {
      setError("basicSalary", { type: "manual", message: result });
    } else {
      if (clearErrors) clearErrors("basicSalary");
    }

    /** 🔹 Re-fetch grade rules for ALL pay items */
    details.forEach((detail, index) => {
      if (detail?.payItemId) {
        handlePayItemChange(index, detail.payItemId);
      }
    });
  }, [gradeId, basicSalary, validateBasicSalaryByGrade, setError, clearErrors]);

  
  useEffect(() => {
    const selectedOption = payItemList.find(opt => opt.payItemCategoryId === 196);
    console.log('Validating Basic Salary Pay Item:', selectedOption);
    const index = 0; // Assuming first row is for Basic Salary
    if (!selectedOption) return;
    setValue(`empSalaryStructureDetails.${index}.payItemId`, selectedOption?.value || '');
    setValue(`empSalaryStructureDetails.${index}.componentName`, selectedOption?.label || '');

    // Update form values
    setValue(`empSalaryStructureDetails.${index}.amount`, basicSalary);
    setValue(`empSalaryStructureDetails.${index}.percentage`, 0);

    // Recalculate based on new values
    setValue(`empSalaryStructureDetails.${index}.calculatedAmount`, basicSalary);
    setValue(`empSalaryStructureDetails.${index}.payItemType`, 'Earning');

  }, [basicSalary, setValue, payItemList]);

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title={isEditing ? "Edit Salary Structure" : "Add New Salary Structure"}
      subTitle="Define salary structure for employee"
      size="3xl"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(submitForm)}>

        <div className="bg-sky-50 dark:bg-slate-800 border p-4 rounded-lg col-span-12 lg:col-span-12 sm:col-span-12 mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
            Employee Information
          </h3>

          <div>
            <Controller
              control={control}
              name="empId"
              render={({ field, fieldState }) => (
                <div>
                  <SelectSearch
                    label="Select Employee"
                    placeholder="Select Employee"
                    options={employeeList}
                    value={field.value}
                    onChange={field.onChange}
                    showAvatar={true}
                    showId={true}
                    labelKey="label"
                    valueKey="value"
                    avatarKey="avatarUrl"
                    idKeyName="code"
                    idKeyLabel="Employee Code"
                    error={fieldState.error?.message}
                  />
                </div>
              )}
            />
          </div>

          {selectedEmployee && (
            <div className="mt-6 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-start gap-2">
                  <img
                    src={selectedEmployee.avatarUrl}
                    alt={selectedEmployee.label}
                    className="w-14 h-14 rounded-full border-3 border-gray-300 "
                  />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Employee Name</p>
                    <p className="font-medium">
                      {selectedEmployee ? selectedEmployee.label : ''}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Employee Code</p>
                  <p className="font-mono font-medium">{selectedEmployee ? selectedEmployee.code : ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Designation</p>
                  <p className="font-medium">{selectedEmployee ? selectedEmployee.designation : ''}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-12 gap-x-4">

          {/* Grade Selection */}
          <Controller
            control={control}
            name="gradeId"
            render={({ field, fieldState }) => (
              <SelectSearch
                label="Salary Grade"
                options={gradeList}
                placeholder="Select Salary Grade"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                size="sm"
                className="col-span-12 lg:col-span-6 sm:col-span-12"
                searchable
              />
            )}
          />

          <Controller
            control={control}
            name="basicSalary"
            rules={{
              validate: (value) => validateBasicSalaryByGrade(value, watch("gradeId")),
            }}
            render={({ field, fieldState }) => (
              <Input
                type="number"
                min="0"
                label="Basic Salary"
                placeholder="Enter Basic Salary Amount"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
              />
            )}
          />

          <Controller
            control={control}
            name="effectiveFrom"
            render={({ field, fieldState }) => (
              <Input
                type="date"
                label="Effective From"
                placeholder="Select Effective From Date"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6 sm:col-span-12"
              />
            )}
          />

          <Controller
            control={control}
            name="effectiveTo"
            render={({ field, fieldState }) => (
              <Input
                type="date"
                label="Effective To"
                placeholder="Select Effective to Date"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6 sm:col-span-12"
              />
            )}
          />

          {/* Salary Structure Details */}
          <div className="bg-sky-50 dark:bg-slate-800 border p-4 rounded-lg col-span-12 lg:col-span-12 sm:col-span-12 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                {/* <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  <CalculatorIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Additional Salary Components
                </h3> */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <CalculatorIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Additional Salary Components
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Add Salary Components with Amount and Percentage
                </p>
              </div>
              <ButtonTw
                type="button"
                variant="outline"
                size="sm"
                onClick={addSalaryDetail}
                className="gap-2"
              >
                <BiPlus />
                Add More
              </ButtonTw>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => {
                const currentDetail = details[index] || {};
                const calculatedAmount = getRowCalculatedAmount(index);
                // Compute the disabled state as a boolean (evaluate the condition here)
                const selectedOption = payItemList.find(opt => opt.value === currentDetail.payItemId && opt.payItemCategoryId === 196);
                const isDisabled = selectedOption;  // true if no matching pay item (disable the field), false otherwise (enable it)

                return (
                  <div
                    key={field.id}
                    className="p-4 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-md"
                  >
                    <div className="flex items-center">
                      <div
                        className="grid gap-3 w-full"
                        style={{
                          gridTemplateColumns: "repeat(auto-fit, minmax(40px, 1fr))",
                        }}
                      >
                        {/* Pay Item */}
                        <div className="">
                          <Controller
                            control={control}
                            name={`empSalaryStructureDetails.${index}.payItemId`}
                            render={({ field, fieldState }) => {

                              return (
                              <SelectSearch
                                id={`payItem-${index}`}
                                label={`Pay Item ${index + 1}`}
                                onChange={(val) => {
                                  field.onChange(val);
                                  console.log('currentDetail', currentDetail);
                                  if (currentDetail.payItemId) {
                                    const selectedOption = payItemList.find(opt => opt.value === currentDetail.payItemId && opt.payItemCategoryId === 196);
                                    if (selectedOption) {
                                      // If Basic Salary pay item is changed, update basic salary
                                      setValue('basicSalary', currentDetail.calculatedAmount || 0);
                                    }
                                  }

                                  handlePayItemChange(index, val);
                                }}
                                options={getFilteredPayItemsForRow(index)} // Use filtered options
                                placeholder="Select Pay Item"
                                value={field.value}
                                error={fieldState.error?.message}
                                disabled={isDisabled}
                              />
                            )}}
                          />
                        </div>

                        {/* Fixed Amount */}
                        <div className="">
                          <Controller
                            control={control}
                            name={`empSalaryStructureDetails.${index}.amount`}
                            render={({ field, fieldState }) => (
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                label="Fixed Amount"
                                placeholder="0.00"
                                value={field.value}
                                onChange={(val) => {
                                  field.onChange(val);
                                  console.log('currentDetail', currentDetail);
                                  if (currentDetail.payItemId) {
                                    const selectedOption = payItemList.find(opt => opt.value === currentDetail.payItemId && opt.payItemCategoryId === 196);
                                  console.log('selectedOption', selectedOption);
                                    if (selectedOption) {
                                      // If Basic Salary pay item is changed, update basic salary
                                      setValue('basicSalary', val);
                                    }
                                  }

                                }}
                                error={fieldState.error?.message}
                                disabled={isDisabled}
                              />
                            )}
                          />
                        </div>

                        {/* Percentage */}
                        <div className="">
                          <Controller
                            control={control}
                            name={`empSalaryStructureDetails.${index}.percentage`}
                            render={({ field, fieldState }) => {
                              return (
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  label="Percentage"
                                  hints="Percentage on Basic Salary"
                                  placeholder="0"
                                  value={field.value}
                                  onChange={field.onChange}
                                  disabled={isDisabled}
                                  error={fieldState.error?.message}
                                  icon={<span>%</span>}
                                  iconPosition="right"
                                  iconBackground={true}
                                />
                              );
                            }}
                          />
                        </div>

                        {/* Calculated Amount */}
                        <div className="">
                          <Input
                            type="number"
                            step="0.01"
                            label="Calculated Amount"
                            labelClassName="truncate"
                            placeholder="0.00"
                            value={calculatedAmount}
                            onChange={() => { }} // Read-only
                            disabled
                            className=""
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 items-center justify-center pl-2 mt-[-20px]">
                          {index === fields.length - 1 && (
                            <button
                              type="button"
                              onClick={addSalaryDetail}
                              className="icon-btn icon-btn-success"
                            >
                              <BiPlus size={18} />
                            </button>
                          )}
                          {fields.length > 1 && !isDisabled && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="icon-btn icon-btn-danger"
                            >
                              <BiTrash size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currentDetail.payItemType === 'Earning' && (
                          <span className="badge badge-pill badge-outline-success">Earning</span>
                        )}
                        {currentDetail.payItemType === 'Deduction' && (
                          <span className="badge badge-pill badge-outline-danger">Deduction</span>
                        )}

                        {currentDetail.percentage > 0 && currentDetail.amount === 0
                          ? `Calculation: ${currentDetail.percentage}% of Basic Salary (${basicSalary}) = ${calculatedAmount.toFixed(2)}`
                          : currentDetail.amount > 0
                            ? `Fixed Amount: ${currentDetail.amount}`
                            : "Enter amount or percentage"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card-gradient-secondary mt-4 p-3 rounded-lg dark:border-gray-600 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <CalculatorIcon className="h-5 w-5 mr-2 text-blue-600" />
                Salary Summary
              </h3>

              {/* Earnings Section */}
              <h4 className="text-md font-semibold text-green-600 mt-3">Earnings</h4>
              {/* <div className="flex justify-between items-center mt-1 ml-4">
                <span className="text-sm text-gray-900 dark:text-gray-400">Basic Salary:</span>
                <span className="text-sm font-medium">{parseFloat(basicSalary || 0).toFixed(2)}</span>
              </div> */}
              {details.filter(detail => detail.payItemType === 'Earning').map((detail, filteredIndex) => {
                const originalIndex = details.indexOf(detail);
                const calculatedAmount = getRowCalculatedAmount(originalIndex);
                return (
                  <div key={filteredIndex} className="flex justify-between items-center mt-1 ml-4">
                    <span className="text-sm text-gray-900 dark:text-gray-400">
                      {detail.componentName || 'Unnamed Component'}
                    </span>
                    <span className="text-sm font-medium">
                      {calculatedAmount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
              <div className="flex justify-between items-center mt-1 border-t border-gray-300">
                <span className="text-sm text-gray-900 dark:text-gray-400">Total Earnings:</span>
                <span className="text-sm font-bold text-green-600">
                  {(totalEarnings()).toFixed(2)}
                </span>
              </div>

              {/* Deductions Section */}
              <h4 className="text-md font-semibold text-red-600 mt-3">Deductions</h4>
              {details.filter(detail => detail.payItemType === 'Deduction').map((detail, filteredIndex) => {
                const originalIndex = details.indexOf(detail);
                const calculatedAmount = getRowCalculatedAmount(originalIndex);
                return (
                  <div key={filteredIndex} className="flex justify-between items-center mt-1 ml-4">
                    <span className="text-sm text-gray-900 dark:text-gray-400">
                      {detail.componentName || 'Unnamed Component'}
                    </span>
                    <span className="text-sm font-medium">
                      {calculatedAmount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-900 dark:text-gray-400">Total Deductions:</span>
                <span className="text-sm font-bold text-red-600">
                  {totalDeductions().toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center mt-1 border-t border-gray-600 dark:border-blue-600">
                <span className="text-sm text-gray-900 dark:text-gray-400">Net Salary:</span>
                <span className="text-sm font-bold text-green-600">
                  {(totalEarnings() - totalDeductions()).toFixed(2)}
                </span>
              </div>
            </div>

          </div>

          {/* Remarks */}
          <Controller
            control={control}
            name="remarks"
            render={({ field, fieldState }) => (
              <Input
                type="textarea"
                label="Remarks"
                placeholder="Enter Any Remarks or Notes..."
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-9 sm:col-span-12"
              />
            )}
          />

          <Controller
            control={control}
            name="isActive"
            render={({ field, fieldState }) => (
              <SwitchButton
                enabled={field.value}
                onChange={field.onChange}
                label="Active"
                className="col-span-12 lg:col-span-3 sm:col-span-12"
                error={fieldState.error?.message}
                enabledText="Yes"
                disabledText="No"
              />
            )}
          />

          {/* Action Buttons */}
          <div className="col-span-12 flex justify-center items-center gap-4">
            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              className="w-full font-bold mt-4 col-span-12"
              disabled={isLoading}
              loading={isLoading}
            >
              {isEditing
                ? "Update Salary Structure"
                : "Create Salary Structure"}
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
  );
};

export default AddOrUpdateSalaryStructureModal;