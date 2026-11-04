'use client'

import { useState, useEffect } from 'react'
import { useForm } from '@/hooks/useForm'
import { CalculatorIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import SalaryCalculator from './SalaryCalculator'

export default function EmployeeSalaryForm({ employeeId, onSubmit, onCancel }) {
    const [showCalculator, setShowCalculator] = useState(false)
    const [calculatedSalary, setCalculatedSalary] = useState(null)
    const [grades, setGrades] = useState([])
    const [employee, setEmployee] = useState(null)
    const [loading, setLoading] = useState(false)
    const [validationError, setValidationError] = useState('')

    const { formData, handleChange, setFormData } = useForm({
        emp_id: employeeId || '',
        grade_id: '',
        basic_salary: '',
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: '',
        remarks: '',
        currency: 'INR',
        payment_mode: 'Bank Transfer'
    })

    useEffect(() => {
        fetchGrades()
        if (employeeId) {
            fetchEmployeeDetails()
        }
    }, [employeeId])

    const fetchGrades = async () => {
        try {
            const response = await fetch('/api/payroll/grades?is_active=true')
            const data = await response.json()
            setGrades(data)
        } catch (error) {
            console.error('Error fetching grades:', error)
        }
    }

    const fetchEmployeeDetails = async () => {
        try {
            const response = await fetch(`/api/payroll/employees/${employeeId}`)
            const data = await response.json()
            setEmployee(data)

            // Pre-fill with current grade if available
            if (data.current_grade_id) {
                setFormData(prev => ({
                    ...prev,
                    grade_id: data.current_grade_id,
                    basic_salary: data.current_basic_salary || ''
                }))
            }
        } catch (error) {
            console.error('Error fetching employee:', error)
        }
    }

    const handleCalculate = async () => {
        if (!formData.grade_id || !formData.basic_salary) {
            setValidationError('Please select grade and enter basic salary')
            return
        }

        // Validate basic salary against grade range
        const selectedGrade = grades.find(g => g.id == formData.grade_id)
        if (selectedGrade) {
            const basic = parseFloat(formData.basic_salary)
            if (basic < selectedGrade.min_salary) {
                setValidationError(`Basic salary (₹${basic.toLocaleString()}) is below grade minimum (₹${selectedGrade.min_salary.toLocaleString()})`)
                return
            }
            if (basic > selectedGrade.max_salary) {
                setValidationError(`Basic salary (₹${basic.toLocaleString()}) is above grade maximum (₹${selectedGrade.max_salary.toLocaleString()})`)
                return
            }
        }

        setValidationError('')
        setLoading(true)

        try {
            const response = await fetch('/api/payroll/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grade_id: formData.grade_id,
                    basic_salary: parseFloat(formData.basic_salary)
                })
            })

            if (!response.ok) throw new Error('Calculation failed')

            const result = await response.json()
            setCalculatedSalary(result)
            setShowCalculator(true)

        } catch (error) {
            console.error('Error calculating salary:', error)
            setValidationError('Failed to calculate salary. Please check the inputs.')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!calculatedSalary && !confirm('Salary has not been calculated. Do you want to proceed without calculation?')) {
            return
        }

        const finalData = {
            ...formData,
            gross_salary: calculatedSalary?.totals?.gross_salary || parseFloat(formData.basic_salary),
            total_deductions: calculatedSalary?.totals?.total_deductions || 0,
            net_salary: calculatedSalary?.totals?.net_salary || parseFloat(formData.basic_salary),
            is_approved: false,
            components: calculatedSalary?.components || []
        }

        onSubmit(finalData)
    }

    const getSelectedGrade = () => {
        return grades.find(g => g.id == formData.grade_id)
    }

    const renderBasicSalaryValidation = () => {
        const grade = getSelectedGrade()
        if (!grade || !formData.basic_salary) return null

        const basic = parseFloat(formData.basic_salary)

        if (basic < grade.min_salary) {
            return (
                <div className="flex items-center text-red-600 text-sm mt-1">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    Below grade minimum (₹{grade.min_salary.toLocaleString()})
                </div>
            )
        }

        if (basic > grade.max_salary) {
            return (
                <div className="flex items-center text-red-600 text-sm mt-1">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    Above grade maximum (₹{grade.max_salary.toLocaleString()})
                </div>
            )
        }

        return (
            <div className="text-green-600 text-sm mt-1">
                ✓ Within grade range
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Employee Info Card */}
            {employee && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                        <img
                            src={`https://ui-avatars.com/api/?name=${employee.first_name}+${employee.last_name}&background=3b82f6&color=fff`}
                            alt={employee.first_name}
                            className="h-10 w-10 rounded-full mr-3"
                        />
                        <div>
                            <h3 className="font-semibold text-blue-900">
                                {employee.first_name} {employee.last_name}
                            </h3>
                            <p className="text-sm text-blue-700">
                                {employee.employee_code} • {employee.designation?.name}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Grade Selection */}
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
                            {grades.map(grade => (
                                <option key={grade.id} value={grade.id}>
                                    {grade.grade_name} (₹{grade.min_salary?.toLocaleString()} - ₹{grade.max_salary?.toLocaleString()})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Basic Salary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Basic Salary *
                        </label>
                        <div className="flex">
                            <span className="bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                                ₹
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
                        {renderBasicSalaryValidation()}
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Effective From *
                        </label>
                        <input
                            type="date"
                            name="effective_from"
                            value={formData.effective_from}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Effective To (Optional)
                        </label>
                        <input
                            type="date"
                            name="effective_to"
                            value={formData.effective_to}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">Leave empty for indefinite duration</p>
                    </div>
                </div>

                {/* Currency and Payment */}
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
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="EUR">Euro (€)</option>
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
                            <option value="Online">Online Payment</option>
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
                        placeholder="Any additional notes about this salary structure..."
                        rows="3"
                    />
                </div>

                {/* Validation Error */}
                {validationError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center text-red-800">
                            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                            <p className="font-medium">{validationError}</p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleCalculate}
                            disabled={loading || !formData.grade_id || !formData.basic_salary}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            <CalculatorIcon className="h-4 w-4 mr-2" />
                            {loading ? 'Calculating...' : 'Calculate Salary'}
                        </button>

                        {calculatedSalary && (
                            <div className="flex items-center text-green-700">
                                <span className="font-semibold">
                                    ₹{calculatedSalary.totals?.net_salary?.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-600 ml-2">(Net Salary)</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                        >
                            Save Salary Structure
                        </button>
                    </div>
                </div>
            </form>

            {/* Calculator Modal */}
            {showCalculator && calculatedSalary && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Salary Calculation Preview</h2>
                                    <p className="text-gray-600">Review the calculated salary components</p>
                                </div>
                                <button
                                    onClick={() => setShowCalculator(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <span className="text-2xl">&times;</span>
                                </button>
                            </div>

                            <SalaryCalculator
                                gradeId={formData.grade_id}
                                basicSalary={parseFloat(formData.basic_salary)}
                                components={calculatedSalary.components}
                                totals={calculatedSalary.totals}
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCalculator(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Back to Form
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCalculator(false)
                                        // Auto-submit the form
                                        const form = document.querySelector('form')
                                        form?.requestSubmit()
                                    }}
                                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Use This Calculation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}