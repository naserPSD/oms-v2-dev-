// /tabs/SalaryAndPayrollTab.jsx
"use client";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useEmployeeProfileQueryApi } from "@/hooks/queryApi/useEmployeeProfileQueryApi";
import { useParams } from "next/navigation";

const SalaryAndPayrollTab = () => {
  const { id } = useParams();

  const { useFetchEmployeeSalaryGradeQuery } = useEmployeeProfileQueryApi({});

  const { data: salaryGradeInfo, refetch, isFetching } =
    useFetchEmployeeSalaryGradeQuery(id);

  const responseData = salaryGradeInfo?.data || {};
  const { structure = {}, details = [] } = responseData;

  const loading = isFetching;

  // Format currency
  const formatCurrency = (value) => {
    return parseFloat(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Separate earnings and deductions
  const earnings = details.filter(
    (item) => item.payItem?.payItemType?.name === "Earning"
  );
  const deductions = details.filter(
    (item) => item.payItem?.payItemType?.name === "Deduction"
  );

  // Calculate totals
  const totalEarnings = earnings.reduce(
    (sum, item) => sum + parseFloat(item.calculatedAmount || 0),
    0
  );
  const totalDeductions = deductions.reduce(
    (sum, item) => sum + parseFloat(item.calculatedAmount || 0),
    0
  );
  const netSalary = structure.netSalary
    ? parseFloat(structure.netSalary)
    : totalEarnings - totalDeductions;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Basic Salary
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(structure.basicSalary)}
          </div>
        </div>
        <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800 p-4 shadow-sm">
          <div className="text-sm text-green-700 dark:text-green-600">
            Gross Earnings
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-600">
            {formatCurrency(structure.grossSalary || totalEarnings)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Deductions
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-500">
            {formatCurrency(structure.totalDeductions || totalDeductions)}
          </div>
        </div>
        <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800 p-4 shadow-sm">
          <div className="text-sm text-green-700 dark:text-green-400">
            Net Salary
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(netSalary)}
          </div>
        </div>
      </div>

      {/* Effective Period & Status */}
      <div className="flex flex-wrap items-center gap-4 text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Effective From:</span>
          <span className="font-medium">
            {new Date(structure.effectiveFrom).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Effective To:</span>
          <span className="font-medium">
            {structure.effectiveTo
              ? new Date(structure.effectiveTo).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
              : "Ongoing"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Status:</span>
          {structure.isActive ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Salary Components Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b">
          <h4 className="font-semibold text-gray-700 dark:text-gray-200">
            Salary Components
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sl.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Item Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Taxable
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 card-gradient-secondary">
              {/* Earnings Section */}
              {earnings.length > 0 ? (
                earnings.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.payItem?.itemCode || "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <SimpleTooltip text={item.payItem?.isStatutory ? "Statutory component" : "Non-statutory"}>
                        <span
                          className="cursor-help border-b border-dotted border-gray-400"
                        >
                          {item.payItem?.itemName || "-"}
                          {item.percentage !== "0.00" && (
                            <span className="ml-1 text-xs text-gray-500">
                              ({item.percentage}%)
                            </span>
                          )}
                        </span>
                      </SimpleTooltip>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Earning
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.calculatedAmount)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                      {item.payItem?.isTaxable ? (
                        <span className="badge badge-rounded badge-outline-danger">
                          Yes
                        </span>
                      ) : (
                        <span className="badge badge-rounded badge-outline-secondary">
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No earnings found
                  </td>
                </tr>
              )}

              {/* Total Gross Salary Row */}
              <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                <td colSpan={4} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                  Total Gross Salary
                </td>
                <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                  {formatCurrency(totalEarnings)}
                </td>
                <td></td>
              </tr>

              {/* Deductions Section */}
              {deductions.length > 0 && (
                <>
                  {deductions.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.payItem?.itemCode || "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <SimpleTooltip text={item.payItem?.isStatutory ? "Statutory component" : "Non-statutory"}>
                          <span
                            className="cursor-help border-b border-dotted border-gray-400"
                          >
                            {item.payItem?.itemName || "-"}
                            {item.percentage !== "0.00" && (
                              <span className="ml-1 text-xs text-gray-500">
                                ({item.percentage}%)
                              </span>
                            )}
                          </span>
                        </SimpleTooltip>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
                          Deduction
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-red-600 dark:text-red-500">
                        - {formatCurrency(item.calculatedAmount)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                        {item.payItem?.isTaxable ? (
                          <span className="badge badge-rounded badge-outline-danger">
                            Yes
                          </span>
                        ) : (
                          <span className="badge badge-rounded badge-outline-secondary">
                            No
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Total Deductions Row */}
                  <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                    <td colSpan={4} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      Total Deductions
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-500">
                      - {formatCurrency(totalDeductions)}
                    </td>
                    <td></td>
                  </tr>
                </>
              )}

              {/* If no deductions, still show total deductions row with zero */}
              {deductions.length === 0 && (
                <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                  <td colSpan={4} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                    Total Deductions
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-500">
                    - 0.00
                  </td>
                  <td></td>
                </tr>
              )}

              {/* Net Salary Row */}
              <tr className="bg-green-50 dark:bg-green-900/20 font-bold">
                <td colSpan={4} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                  Net Salary
                </td>
                <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                  {formatCurrency(netSalary)}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalaryAndPayrollTab;