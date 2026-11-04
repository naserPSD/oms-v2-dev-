// src/features/payroll-management/salary-structures/components/SalaryStructureDetailsModal.jsx
import { ModalTw } from "@/components/common/ModalTw";
import { CalculatorIcon, UserIcon, CalendarIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import Link from "next/link";

const SalaryStructureDetailsModal = ({
  showModal,
  handleClose,
  salaryStructureData, // Assuming data is passed as prop
  employeeList,
  gradeList = [],
  payItemList = [],
}) => {
  console.log('salaryStructureData', salaryStructureData)
  const {
    empId,
    gradeId,
    basicSalary,
    effectiveFrom,
    effectiveTo,
    salaryStructureDetails = [],
    remarks,
    isActive,
  } = salaryStructureData || {};

  const selectedEmployee = employeeList.find(e => e.value === empId);
  const selectedGrade = gradeList.find(g => g.value === gradeId);

  // Calculate totals
  const totalEarnings = salaryStructureDetails
    .filter(detail => detail?.payItem?.payItemTypeId === 194)
    .reduce((sum, detail) => sum + parseFloat(detail.calculatedAmount || 0), 0);

  const totalDeductions = salaryStructureDetails
    .filter(detail => detail?.payItem?.payItemTypeId === 195)
    .reduce((sum, detail) => sum + parseFloat(detail.calculatedAmount || 0), 0);
  const grossSalary = (totalEarnings - totalDeductions);

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title="Salary Structure Details"
      subTitle="View salary structure information"
      size="3xl"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-6">
        {/* Employee Information */}
        <div className="bg-sky-50 dark:bg-slate-800 border p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
            Employee Information
          </h3>

          {selectedEmployee && (
            <div className="p-4 rounded-lg bg-white dark:bg-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href={`/hr-dashboard/employee/${selectedEmployee.value}`} className="flex items-center justify-start gap-2 hover:bg-sky-300/50 p-1 rounded-lg">
                  <img
                    src={selectedEmployee.avatarUrl}
                    alt={selectedEmployee.label}
                    className="w-14 h-14 rounded-full border-3 border-gray-300"
                  />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Employee Name</p>
                    <p className="font-medium">{selectedEmployee.label}</p>
                  </div>
                </Link>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Employee Code</p>
                  <p className="font-mono font-medium">{selectedEmployee.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Designation</p>
                  <p className="font-medium">{selectedEmployee.designation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Salary Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Salary Grade
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedGrade?.label || 'N/A'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Basic Salary
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {parseFloat(basicSalary || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Effective From
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {effectiveFrom ? new Date(effectiveFrom).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Effective To
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {effectiveTo ? new Date(effectiveTo).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Salary Components */}
        <div className="bg-sky-50 dark:bg-slate-800 border p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <CalculatorIcon className="h-5 w-5 mr-2 text-blue-600" />
            Salary Components
          </h3>

          <div className="space-y-3">
            {salaryStructureDetails.map((detail, index) => (
              <div
                key={index}
                className={`p-4 bg-white dark:bg-gray-700 rounded-lg border shadow-sm ${
                  detail?.payItem?.payItemTypeId === 194
                    ? 'border-green-300 dark:border-green-600'
                    : 'border-red-300 dark:border-red-600'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Component Name
                    </label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {detail?.payItem?.itemName || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fixed Amount
                    </label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {parseFloat(detail.amount || 0).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Percentage
                    </label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {detail.percentage || 0}%
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Calculated Amount
                    </label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {parseFloat(detail.calculatedAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    detail?.payItem?.payItemTypeId === 194
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
                  }`}>
                    {detail.payItemType}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {detail.percentage > 0
                      ? `Calculation: ${detail.percentage}% of Basic Salary`
                      : detail.amount > 0
                        ? `Fixed Amount: ${detail.amount}`
                        : "No calculation"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Summary */}
        <div className="card-gradient-secondary p-4 rounded-lg dark:border-gray-600 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <CalculatorIcon className="h-5 w-5 mr-2 text-blue-600" />
            Salary Summary
          </h3>

          {/* Earnings Section */}
          <h4 className="text-md font-semibold text-green-600 mt-3">Earnings</h4>
          {/* <div className="flex justify-between items-center mt-1 ml-4">
            <span className="text-sm text-gray-900 dark:text-gray-400">Basic Salary:</span>
            <span className="text-sm font-medium">{parseFloat(basicSalary || 0).toLocaleString()}</span>
          </div> */}
          {/* {salaryStructureDetails.filter(detail => detail?.payItem?.payItemTypeId === 'Earning').map((detail, index) => ( */}
          {salaryStructureDetails.filter(detail => detail?.payItem?.payItemTypeId === 194).map((detail, index) => (
            <div key={index} className="flex justify-between items-center mt-1 ml-4">
              <span className="text-sm text-gray-900 dark:text-gray-400">
                {detail?.payItem?.itemName || 'Unnamed Component'}
              </span>
              <span className="text-sm font-medium">
                {parseFloat(detail.calculatedAmount || 0).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center mt-1 border-t border-gray-300">
            <span className="text-sm text-gray-900 dark:text-gray-400">Total Earnings:</span>
            <span className="text-sm font-bold text-green-600">
              {(totalEarnings).toLocaleString()}
            </span>
          </div>

          {/* Deductions Section */}
          <h4 className="text-md font-semibold text-red-600 mt-3">Deductions</h4>
          {/* {salaryStructureDetails.filter(detail => detail.payItemType === 'Deduction').map((detail, index) => ( */}
          {salaryStructureDetails.filter(detail => detail?.payItem?.payItemTypeId === 195).map((detail, index) => (
            <div key={index} className="flex justify-between items-center mt-1 ml-4">
              <span className="text-sm text-gray-900 dark:text-gray-400">
                {detail?.payItem?.itemName || 'Unnamed Component'}
              </span>
              <span className="text-sm font-medium">
                {parseFloat(detail.calculatedAmount || 0).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-900 dark:text-gray-400">Total Deductions:</span>
            <span className="text-sm font-bold text-red-600">
              {totalDeductions.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center mt-1 border-t border-gray-600 dark:border-blue-600">
            <span className="text-sm text-gray-900 dark:text-gray-400">Net Salary:</span>
            <span className="text-sm font-bold text-green-600">
              {grossSalary.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Remarks and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Remarks
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {remarks || 'No remarks'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </ModalTw>
  );
};

export default SalaryStructureDetailsModal;