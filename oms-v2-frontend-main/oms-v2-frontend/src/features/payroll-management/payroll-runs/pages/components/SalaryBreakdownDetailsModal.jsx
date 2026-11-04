// src/features/payroll-management/salary-structures/components/SalaryBreakdownDetailsModal.jsx
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import helpers from "@/utils/helpers";
import {
  CalculatorIcon,
  UserIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import { GrCurrency } from "react-icons/gr";
import Link from "next/link";
import ButtonTw from "@/components/ui/ButtonTw";
import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import { useEffect, useMemo, useRef } from "react";
import SwitchButton from "@/components/ui/SwitchButton";

const SalaryBreakdownDetailsModal = ({
  showModal,
  handleClose,
  itemData,
  onPayNow,
  control,
  watch,
  setValue,
  handleSubmit,
  calculateUpdatedAmounts,
}) => {
  const formRef = useRef(null);
  // console.log('itemData', itemData)

  // Create a separate submit handler
  const handleFormSubmit = (data) => {
    // console.log('Form submitted with data:', data);
    onPayNow(data);
  };

  // Trigger form submission
  const triggerSubmit = () => {
    // You can either trigger the submit event or click the hidden submit button
    if (formRef.current) {
      // Option 1: Direct form submission
      formRef.current.requestSubmit();

      // Option 2: If you have a hidden submit button
      // submitButtonRef.current?.click();
    }
  };

  // Watch the form fields for changes
  const extraAmount = watch("extraAmount") || 0;
  const penaltiesAmount = watch("penaltiesAmount") || 0;
  const penaltyApply = watch("penaltyApply") || false;
  const payingAmount = watch("payingAmount") || 0;

  // Calculate dynamic amounts whenever fields change
  const dynamicAmounts = useMemo(() => {
    if (!itemData) return { payable: 0, paid: 0, due: 0, remaining: 0 };

    const baseNetSalary = itemData.netSalary || 0;
    const currentPaid = itemData.paid || 0;

    const amounts = calculateUpdatedAmounts(
      baseNetSalary,
      extraAmount,
      penaltyApply ? penaltiesAmount : 0,
      currentPaid,
    );

    // Calculate remaining amount
    const remaining = Math.max(0, amounts.due - payingAmount);

    return { ...amounts, remaining };
  }, [
    itemData,
    extraAmount,
    penaltiesAmount,
    penaltyApply,
    payingAmount,
    calculateUpdatedAmounts,
  ]);

  // Destructure dynamic amounts
  const {
    payable: dynamicPayable,
    paid: dynamicPaid,
    due: dynamicDue,
    remaining: dynamicRemaining,
  } = dynamicAmounts;

  // Set initial values only when itemData changes
  useEffect(() => {
    setValue("payable", dynamicPayable);
    setValue("paid", dynamicPaid);
    setValue("due", dynamicDue);
    setValue("payingAmount", dynamicDue);
  }, [itemData?.id]); // Only depend on itemData.id, not dynamicPayable

  const {
    employee = {},
    basicSalary = 0,
    totalEarnings = 0,
    totalDeductions = 0,
    netSalary = 0,
    payable = 0,
    paid = 0,
    due = 0,
    workingDays = 0,
    presentDays = 0,
    absentDays = 0,
    paidDays = 0,
    // extraAmount = 0,
    // penaltiesAmount = 0,
    // penaltyApply = false,
    remarks,
    paymentStatus = {},
    payrollRun = {},
    salaryStructure = {},
    month,
    year,
    breakdowns = [],
  } = itemData || {};

  // Separate breakdowns by type
  const earningBreakdowns = breakdowns.filter(
    (b) => b?.payItem?.payItemTypeId === 194,
  );
  const deductionBreakdowns = breakdowns.filter(
    (b) => b?.payItem?.payItemTypeId === 195,
  );

  const selectedEmployee = employee?.user
    ? {
        value: employee.id,
        label: employee.user.fullName,
        code: employee.employeeCode,
        designation: employee.designation?.name,
        joiningDate: employee.joiningDate,
        grade: salaryStructure?.grade?.gradeName,
        avatarUrl: employee.user.profile?.profilePicture?.fileUrl,
      }
    : null;

  const grossSalary = netSalary;

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title="Salary Breakdown Details"
      subTitle="View salary breakdown information"
      size="3xl"
      dismissible={true}
      showHeader={true}
      showFooter={true}
      type="default"
      position="center"
      footer={
        paymentStatus?.code !== "payment_status_paid" && (
          <div className="flex justify-end gap-3">
            <ButtonTw onClick={handleClose} variant="light" size="base">
              Close
            </ButtonTw>
            <ButtonTw
              onClick={triggerSubmit}
              icon={<GrCurrency />}
              variant="green"
              size="base"
            >
              Pay Now
            </ButtonTw>
          </div>
        )
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} ref={formRef}>
        <div className="space-y-6">
          {/* Payroll Run Information */}
          <div className="bg-blue-50 dark:bg-slate-800 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
              Payroll Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Payroll Code
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {payrollRun?.payrollCode || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Period
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {helpers.monthNumberToName(month)}/{year}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Payment Status
                </p>
                <span
                  className={`badge badge-rounded badge-outline-${paymentStatus?.colorName} text-[14px]`}
                >
                  {paymentStatus?.name || "N/A"}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Salary Structure Valid
                </p>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  {salaryStructure?.effectiveFrom
                    ? new Date(
                        salaryStructure.effectiveFrom,
                      ).toLocaleDateString()
                    : "N/A"}{" "}
                  to{" "}
                  {salaryStructure?.effectiveTo
                    ? new Date(salaryStructure.effectiveTo).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Employee Information */}
          {selectedEmployee && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-200 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="font-bold text-white mb-5 flex items-center text-lg">
                  <UserIcon className="h-6 w-6 mr-3" />
                  Employee Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                  {/* Employee Profile */}
                  <Link
                    href={`/hr-dashboard/employee/${selectedEmployee.value}`}
                    className="lg:col-span-2 group"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full flex items-center">
                      <div className="flex items-center gap-3 w-full">
                        <img
                          src={selectedEmployee.avatarUrl}
                          alt={selectedEmployee.label}
                          className="w-16 h-16 rounded-full border-4 border-blue-200 dark:border-blue-400 shadow-md flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                            Employee Name
                          </p>
                          <p className="text-base font-bold text-gray-900 dark:text-white truncate">
                            {selectedEmployee.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                            {selectedEmployee.code}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Designation */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                        Designation
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                        {selectedEmployee.designation || "N/A"}
                      </p>
                    </div>
                    <div className="mt-3 h-1 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></div>
                  </div>

                  {/* Joining Date */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                        Joining Date
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                        {selectedEmployee.joiningDate
                          ? new Date(
                              selectedEmployee.joiningDate,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="mt-3 h-1 bg-gradient-to-r from-green-400 to-transparent rounded-full"></div>
                  </div>

                  {/* Grade */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                        Grade
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                        {selectedEmployee.grade || "N/A"}
                      </p>
                    </div>
                    <div className="mt-3 h-1 bg-gradient-to-r from-purple-400 to-transparent rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attendance and Working Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Working Days
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {workingDays}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Present Days
              </label>
              <p className="text-lg font-semibold text-green-600">
                {presentDays}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Absent Days
              </label>
              <p className="text-lg font-semibold text-red-600">{absentDays}</p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paid Days
              </label>
              <p className="text-lg font-semibold text-blue-600">
                {parseFloat(paidDays).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Salary Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Basic Salary
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {helpers.formatCurrency(basicSalary)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gross Salary
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {helpers.formatCurrency(salaryStructure?.grossSalary)}
              </p>
            </div>
          </div>

          {/* Salary Components Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <CalculatorIcon className="h-5 w-5 mr-2 text-blue-600" />
              Salary Components Breakdown
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Earnings Card */}
              {earningBreakdowns.length > 0 && (
                <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-800 dark:to-emerald-800  px-4 py-3">
                    <h4 className="text-white font-semibold text-md flex items-center">
                      <span className="inline-block w-2 h-2 bg-white rounded-full mr-2"></span>
                      Earnings
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {earningBreakdowns.map((breakdown, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-100 dark:border-green-800 hover:border-green-300 dark:hover:border-green-600 transition-all hover:shadow-sm"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {breakdown?.payItem?.itemName || "N/A"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 ml-3">
                            <span className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              {breakdown?.payItem?.itemCode}
                            </span>
                            {breakdown?.payItem?.isStatutory && (
                              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                                Statutory
                              </span>
                            )}
                            {breakdown?.payItem?.isTaxable && (
                              <span className="text-xs font-semibold px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 rounded-full">
                                Taxable
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">
                            {helpers.formatCurrency(breakdown.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-300 dark:border-green-600">
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        Total Earnings
                      </p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">
                        {helpers.formatCurrency(totalEarnings)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Deductions Card */}
              {deductionBreakdowns.length > 0 && (
                <div className="bg-linear-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-gradient-to-r from-red-400 to-rose-400 dark:from-red-900 dark:to-orange-900 px-4 py-3">
                    <h4 className="text-white font-semibold text-md flex items-center">
                      <span className="inline-block w-2 h-2 bg-white rounded-full mr-2"></span>
                      Deductions
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {deductionBreakdowns.map((breakdown, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-100 dark:border-red-800 hover:border-red-300 dark:hover:border-red-600 transition-all hover:shadow-sm"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {breakdown?.payItem?.itemName || "N/A"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 ml-3">
                            <span className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              {breakdown?.payItem?.itemCode}
                            </span>
                            {breakdown?.payItem?.isStatutory && (
                              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                                Statutory
                              </span>
                            )}
                            {breakdown?.payItem?.taxSection && (
                              <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded-full">
                                {breakdown.payItem.taxSection}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-bold text-red-600 dark:text-red-400">
                            {helpers.formatCurrency(breakdown.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 mt-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-600">
                      <p className="font-semibold text-red-700 dark:text-red-300">
                        Total Deductions
                      </p>
                      <p className="text-lg font-bold text-red-700 dark:text-red-300">
                        {parseFloat(totalDeductions || 0).toLocaleString(
                          "en-IN",
                          { maximumFractionDigits: 2 },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Salary Summary */}
          <div className="card-gradient-secondary p-4 rounded-lg dark:border-gray-600 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
              <CalculatorIcon className="h-5 w-5 mr-2 text-blue-600" />
              Salary Breakdown
            </h3>

            <div className="space-y-3">
              {/* Total Earnings */}
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Total Earnings
                </span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {helpers.formatCurrency(totalEarnings)}
                </span>
              </div>

              {/* Extra Amount */}
              {extraAmount > 0 && (
                <div className="flex justify-between items-center p-3 ml-4">
                  <span className="text-sm text-gray-900 dark:text-gray-300">
                    Extra Amount
                  </span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    +{helpers.formatCurrency(extraAmount)}
                  </span>
                </div>
              )}

              {/* Total Deductions */}
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                  Total Deductions
                </span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  {helpers.formatCurrency(totalDeductions)}
                </span>
              </div>

              {/* Penalties */}
              {penaltiesAmount > 0 && (
                <div className="flex justify-between items-center p-3 ml-4">
                  <span className="text-sm text-gray-900 dark:text-gray-300">
                    Penalties {penaltyApply ? "(Applied)" : "(Not Applied)"}
                  </span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    -{helpers.formatCurrency(penaltiesAmount)}
                  </span>
                </div>
              )}

              {/* Net Salary */}
              <div className="flex justify-between items-center p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg border-2 border-blue-400 dark:border-blue-600">
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  Net Salary
                </span>
                <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {helpers.formatCurrency(netSalary)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-x-4">
            <Controller
              name="remarks"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type="text"
                  label="Remarks"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Remarks"
                  hints="You can add remarks overall to this employee salary."
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="extraAmount"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type="number"
                  step="0.01"
                  label="Extra Amount"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter extra amount"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="penaltiesAmount"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type="number"
                  step="0.01"
                  label="Penalties Amount"
                  hints="You can apply penalties to this employee salary or reduce it."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter penalties amount"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="penaltyApply"
              control={control}
              render={({ field }) => (
                <SwitchButton
                  label="Penalties Apply"
                  enabled={field.value}
                  onClick={() => field.onChange(!field.value)}
                  enabledText="Yes"
                  disabledText="No"
                  className="col-span-12 lg:col-span-4 sm:col-span-12"
                />
              )}
            />
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payable Amount
                </label>
                {(extraAmount > 0 || penaltiesAmount > 0) && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Updated
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {helpers.formatCurrency(dynamicPayable)}
                </p>
                {(extraAmount > 0 || penaltiesAmount > 0) &&
                  payable !== dynamicPayable && (
                    <p className="text-xs text-gray-500 mt-1">
                      Original: {helpers.formatCurrency(payable)}
                    </p>
                  )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Previously Paid Amount
              </label>
              <p className="text-lg font-semibold text-green-600">
                {helpers.formatCurrency(dynamicPaid)}
              </p>
              {paid !== dynamicPaid && (
                <p className="text-xs text-gray-500 mt-1">
                  Original: {helpers.formatCurrency(paid)}
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Previously Due Amount
                </label>
                {(extraAmount > 0 || penaltiesAmount > 0) && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Updated
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold text-red-600">
                  {helpers.formatCurrency(dynamicDue)}
                </p>
                {(extraAmount > 0 || penaltiesAmount > 0) &&
                  due !== dynamicDue && (
                    <p className="text-xs text-gray-500 mt-1">
                      Original: {helpers.formatCurrency(due)}
                    </p>
                  )}
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <Controller
                name="payingAmount"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    type="number"
                    step="0.01"
                    label="Paying Amount"
                    labelClassName="text-sm font-semibold text-green-700 dark:text-green-400"
                    hints="Enter the amount you wish to pay now."
                    value={field.value}
                    onChange={field.onChange}
                    size="lg"
                    error={fieldState.error?.message}
                    placeholder="Enter paying amount"
                    className="col-span-12 lg:col-span-6 sm:col-span-12"
                  />
                )}
              />
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remaining Amount
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {helpers.formatCurrency(dynamicRemaining)}
              </p>
            </div>
          </div>
        </div>
      </form>
    </ModalTw>
  );
};

export default SalaryBreakdownDetailsModal;
