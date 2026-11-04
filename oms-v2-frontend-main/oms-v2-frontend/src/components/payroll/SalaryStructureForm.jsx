"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalculatorIcon,
  UserIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";

export default function SalaryStructureForm({
  employeeId,
  initialData,
  onSuccess,
  onCancel,
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    emp_id: employeeId || "",
    grade_id: "",
    basic_salary: "",
    effective_from: new Date().toISOString().split("T")[0],
    effective_to: "",
    remarks: "",
    currency: "INR",
    payment_mode: "Bank Transfer",
  });

  const [employees, setEmployees] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [calculatedSalary, setCalculatedSalary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (!employeeId) {
      fetchEmployees();
    }
    fetchGrades();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        emp_id: initialData.emp_id || employeeId || "",
        grade_id: initialData.grade_id || "",
        basic_salary: initialData.basic_salary || "",
        effective_from:
          initialData.effective_from || new Date().toISOString().split("T")[0],
        effective_to: initialData.effective_to || "",
        remarks: initialData.remarks || "",
        currency: initialData.currency || "INR",
        payment_mode: initialData.payment_mode || "Bank Transfer",
      });

      if (initialData.grade_id) {
        const grade = grades.find((g) => g.id === initialData.grade_id);
        if (grade) setSelectedGrade(grade);
      }
    }
  }, [initialData, grades]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/payroll/employees?is_active=true");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await fetch("/api/payroll/grades?is_active=true");
      const data = await response.json();
      setGrades(data);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // When grade changes, update selected grade
    if (name === "grade_id") {
      const grade = grades.find((g) => g.id == value);
      setSelectedGrade(grade);
      setCalculatedSalary(null); // Reset calculation
    }
  };

  const calculateSalary = async () => {
    if (!formData.grade_id || !formData.basic_salary) {
      alert("Please select grade and enter basic salary");
      return;
    }

    setCalculating(true);
    try {
      const response = await fetch("/api/payroll/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade_id: formData.grade_id,
          basic_salary: parseFloat(formData.basic_salary),
          effective_date: formData.effective_from,
        }),
      });

      if (!response.ok) throw new Error("Calculation failed");

      const result = await response.json();
      setCalculatedSalary(result);
    } catch (error) {
      console.error("Error calculating salary:", error);
      alert("Failed to calculate salary. Please check the inputs.");
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!calculatedSalary) {
      if (
        !confirm(
          "Salary has not been calculated. Do you want to proceed without calculation?",
        )
      ) {
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        gross_salary: calculatedSalary?.totals?.gross_salary || 0,
        total_deductions: calculatedSalary?.totals?.total_deductions || 0,
        net_salary:
          calculatedSalary?.totals?.net_salary ||
          parseFloat(formData.basic_salary),
        is_approved: false,
        components: calculatedSalary?.components || [],
      };

      const url = initialData
        ? `/api/payroll/salary-structures/${initialData.id}`
        : "/api/payroll/salary-structures";

      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save salary structure");

      const result = await response.json();

      if (onSuccess) {
        onSuccess(result.data);
      } else {
        router.push("/payroll/salary-structures");
      }
    } catch (error) {
      console.error("Error saving salary structure:", error);
      alert("Error saving salary structure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateBasicSalary = () => {
    if (!selectedGrade || !formData.basic_salary) return true;

    const basic = parseFloat(formData.basic_salary);
    const min = selectedGrade.min_salary;
    const max = selectedGrade.max_salary;

    return basic >= min && basic <= max;
  };

  const getBasicSalaryValidation = () => {
    if (!selectedGrade || !formData.basic_salary) return null;

    const basic = parseFloat(formData.basic_salary);
    const min = selectedGrade.min_salary;
    const max = selectedGrade.max_salary;

    if (basic < min) {
      return {
        valid: false,
        message: `Below grade minimum (₹${min.toLocaleString()})`,
      };
    }

    if (basic > max) {
      return {
        valid: false,
        message: `Above grade maximum (₹${max.toLocaleString()})`,
      };
    }

    return {
      valid: true,
      message: "Within grade range ✓",
    };
  };

  return (
    <div className="bg-white text-black rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? "Edit Salary Structure" : "Create Salary Structure"}
        </h2>
        <p className="text-gray-600 text-sm">
          Define salary structure for employee
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Selection (only if not passed) */}
        {!employeeId && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-blue-900">
                Employee Information
              </h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee *
              </label>
              <select
                name="emp_id"
                value={formData.emp_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_code} - {emp.first_name} {emp.last_name}
                    {emp.designation && ` (${emp.designation})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Grade and Basic Salary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary Grade *
            </label>
            <select
              name="grade_id"
              value={formData.grade_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Grade</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.grade_name} (₹{grade.min_salary?.toLocaleString()} - ₹
                  {grade.max_salary?.toLocaleString()})
                </option>
              ))}
            </select>
            {selectedGrade && (
              <p className="mt-1 text-sm text-gray-500">
                Grade Range: ₹{selectedGrade.min_salary?.toLocaleString()} - ₹
                {selectedGrade.max_salary?.toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Basic Salary *
            </label>
            <div className="relative">
              <div className="flex">
                <span className="bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                  <CurrencyRupeeIcon className="h-5 w-5" />
                </span>
                <input
                  type="number"
                  name="basic_salary"
                  value={formData.basic_salary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 120000"
                  step="0.01"
                  required
                />
              </div>
              {formData.basic_salary && selectedGrade && (
                <div
                  className={`mt-1 text-sm ${getBasicSalaryValidation()?.valid ? "text-green-600" : "text-red-600"}`}
                >
                  {getBasicSalaryValidation()?.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Effective Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effective From *
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="effective_from"
                value={formData.effective_from}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effective To (Optional)
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="effective_to"
                value={formData.effective_to}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Leave empty for indefinite duration
            </p>
          </div>
        </div>

        {/* Currency and Payment Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="BDT">Bangladeshi Taka (৳)</option>
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
              <option value="JPY">Japanese Yen (¥)</option>
              <option value="AUD">Australian Dollar ($)</option>
              <option value="CAD">Canadian Dollar ($)</option>
              <option value="CHF">Swiss Franc (CHF)</option>
              <option value="CNY">Chinese Yuan (¥)</option>
              <option value="HKD">Hong Kong Dollar (HK$)</option>
              <option value="SGD">Singapore Dollar (S$)</option>
              <option value="MYR">Malaysian Ringgit (RM)</option>
              <option value="NZD">New Zealand Dollar (NZ$)</option>
              <option value="PHP">Philippine Peso (₱)</option>
              <option value="KRW">South Korean Won (₩)</option>
              <option value="THB">Thai Baht (฿)</option>
              <option value="VND">Vietnamese Dong (₫)</option>
              <option value="IDR">Indonesian Rupiah (Rp)</option>
              <option value="RUB">Russian Ruble (₽)</option>
              <option value="CZK">Czech Koruna (Kč)</option>
              <option value="HUF">Hungarian Forint (Ft)</option>
              <option value="PLN">Polish Złoty (zł)</option>
              <option value="SEK">Swedish Krona (kr)</option>
              <option value="NOK">Norwegian Krone (kr)</option>
              <option value="DKK">Danish Krone (kr)</option>
              <option value="KWD">Kuwaiti Dinar (د.ك)</option>
              <option value="SAR">Saudi Riyal (ر.س)</option>
              <option value="AED">UAE Dirham (د.إ)</option>
              <option value="QAR">Qatari Rial (ر.ق)</option>
              <option value="BHD">Bahraini Dinar (د.ب)</option>
              <option value="OMR">Omani Rial (ر.ع)</option>
              <option value="EGP">Egyptian Pound (ج.م)</option>
              <option value="JOD">Jordanian Dinar (د.ا)</option>
              <option value="KES">Kenyan Shilling (Ksh)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Mode
            </label>
            <select
              name="payment_mode"
              value={formData.payment_mode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Online Payment">Online Payment</option>
            </select>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks
          </label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes or remarks..."
            rows="3"
          />
        </div>

        {/* Calculate Button */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-900 flex items-center">
                <CalculatorIcon className="h-5 w-5 mr-2 text-blue-600" />
                Salary Calculation
              </h3>
              <p className="text-sm text-gray-600">
                Calculate salary based on grade rules
              </p>
            </div>
            <button
              type="button"
              onClick={calculateSalary}
              // disabled={!formData.grade_id || !formData.basic_salary || calculating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {calculating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Calculating...
                </>
              ) : (
                "Calculate Salary"
              )}
            </button>
          </div>
        </div>

        {/* Calculation Results */}
        {calculatedSalary && (
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <h4 className="font-semibold text-green-800 mb-3">
              Calculation Results
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Gross Salary</p>
                <p className="text-lg font-bold text-green-700">
                  ₹{calculatedSalary.totals.gross_salary?.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Total Deductions</p>
                <p className="text-lg font-bold text-red-700">
                  ₹{calculatedSalary.totals.total_deductions?.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Net Salary</p>
                <p className="text-lg font-bold text-blue-700">
                  ₹{calculatedSalary.totals.net_salary?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="text-sm">
              <p className="text-gray-600">
                Components: {calculatedSalary.components?.length || 0} items
                calculated
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !validateBasicSalary()}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : initialData ? (
              "Update Structure"
            ) : (
              "Create Structure"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
