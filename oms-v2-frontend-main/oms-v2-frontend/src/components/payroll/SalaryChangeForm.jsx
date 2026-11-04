'use client'

import { useState, useEffect } from 'react'
import {
    ArrowUpIcon,
    ArrowDownIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    UserIcon,
    CalendarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline'

export default function SalaryChangeForm({ employeeId, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        emp_id: employeeId,
        event_type: 'SALARY_INCREMENT',
        change_reason: '',
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: '',

        // Old values (will be auto-populated)
        old_grade_id: '',
        old_basic_salary: '',
        old_gross_salary: '',
        old_net_salary: '',

        // New values (user input)
        new_grade_id: '',
        new_basic_salary: '',
        new_gross_salary: '',
        new_net_salary: '',

        // Increment details
        basic_increment_percentage: '',
        basic_increment_amount: '',

        // Component changes
        component_changes: [],

        // Approval
        reference_number: '',
        reference_document: '',
        remarks: ''
    })

    const [employee, setEmployee] = useState(null)
    const [currentStructure, setCurrentStructure] = useState(null)
    const [grades, setGrades] = useState([])
    const [loading, setLoading] = useState(false)
    const [componentModal, setComponentModal] = useState(false)
    const [selectedComponent, setSelectedComponent] = useState(null)

    useEffect(() => {
        if (employeeId) {
            fetchEmployeeDetails()
            fetchGrades()
        }
    }, [employeeId])

    const fetchEmployeeDetails = async () => {
        try {
            const response = await fetch(`/api/payroll/employees/${employeeId}`)
            const data = await response.json()
            setEmployee(data)

            // Fetch current salary structure
            const structureRes = await fetch(`/api/payroll/employees/${employeeId}/current-salary`)
            const structureData = await structureRes.json()
            setCurrentStructure(structureData)

            // Populate old values
            if (structureData) {
                setFormData(prev => ({
                    ...prev,
                    old_grade_id: structureData.grade_id,
                    old_basic_salary: structureData.basic_salary,
                    old_gross_salary: structureData.gross_salary,
                    old_net_salary: structureData.net_salary,
                    // Pre-fill new values with old ones
                    new_grade_id: structureData.grade_id,
                    new_basic_salary: structureData.basic_salary
                }))
            }
        } catch (error) {
            console.error('Error fetching employee:', error)
        }
    }

    const fetchGrades = async () => {
        try {
            const response = await fetch('/api/payroll/grades')
            const data = await response.json()
            setGrades(data)
        } catch (error) {
            console.error('Error fetching grades:', error)
        }
    }

    const calculateIncrement = (newValue, oldValue) => {
        if (!oldValue || oldValue === 0) return { percentage: 0, amount: 0 }

        const amount = newValue - oldValue
        const percentage = (amount / oldValue) * 100

        return {
            percentage: parseFloat(percentage.toFixed(2)),
            amount: parseFloat(amount.toFixed(2))
        }
    }

    const handleBasicSalaryChange = (value) => {
        const newBasic = parseFloat(value) || 0
        const oldBasic = parseFloat(formData.old_basic_salary) || 0

        const increment = calculateIncrement(newBasic, oldBasic)

        setFormData(prev => ({
            ...prev,
            new_basic_salary: value,
            basic_increment_percentage: increment.percentage,
            basic_increment_amount: increment.amount
        }))
    }

    const handleGradeChange = (gradeId) => {
        const selectedGrade = grades.find(g => g.id == gradeId)
        if (selectedGrade) {
            setFormData(prev => ({
                ...prev,
                new_grade_id: gradeId,
                event_type: gradeId !== prev.old_grade_id ? 'PROMOTION' : 'SALARY_INCREMENT'
            }))
        }
    }

    const addComponentChange = () => {
        setComponentModal(true)
    }

    const handleComponentSave = (componentChange) => {
        setFormData(prev => ({
            ...prev,
            component_changes: [...prev.component_changes, componentChange]
        }))
        setComponentModal(false)
        setSelectedComponent(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/payroll/salary-changes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) throw new Error('Failed to save salary change')

            const result = await response.json()

            if (onSuccess) {
                onSuccess(result.data)
            }

        } catch (error) {
            console.error('Error saving salary change:', error)
            alert('Error saving salary change. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const eventTypes = [
        { value: 'JOINING', label: 'Joining', icon: '👤' },
        { value: 'PROMOTION', label: 'Promotion', icon: '📈' },
        { value: 'GRADE_CHANGE', label: 'Grade Change', icon: '🔄' },
        { value: 'SALARY_INCREMENT', label: 'Salary Increment', icon: '💰' },
        { value: 'SPECIAL_INCREMENT', label: 'Special Increment', icon: '🎯' },
        { value: 'ALLOWANCE_CHANGE', label: 'Allowance Change', icon: '📝' },
        { value: 'SALARY_REVISION', label: 'Salary Revision', icon: '📊' },
        { value: 'TRANSFER', label: 'Transfer', icon: '🚚' },
        { value: 'DEMOTION', label: 'Demotion', icon: '📉' },
        { value: 'RESIGNATION', label: 'Resignation', icon: '👋' },
        { value: 'REJOINING', label: 'Rejoining', icon: '🔄' },
        { value: 'OTHER', label: 'Other', icon: '📌' }
    ]

    const getEventTypeIcon = (type) => {
        const event = eventTypes.find(e => e.value === type)
        return event ? event.icon : '📌'
    }

    return (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Salary Change Request</h2>
                    {employee && (
                        <p className="text-gray-600">
                            {employee.first_name} {employee.last_name} • {employee.employee_code}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold text-blue-700">
                        ₹{currentStructure?.net_salary?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-500">Current Net Salary</div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Type and Reason */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Change Type *
                        </label>
                        <select
                            value={formData.event_type}
                            onChange={(e) => setFormData(prev => ({ ...prev, event_type: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {eventTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Change Reason *
                        </label>
                        <input
                            type="text"
                            value={formData.change_reason}
                            onChange={(e) => setFormData(prev => ({ ...prev, change_reason: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Performance based increment, Promotion to Senior Manager"
                            required
                        />
                    </div>
                </div>

                {/* Current vs New Salary Comparison */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Salary Comparison</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Current Salary */}
                        <div className="bg-white p-4 rounded border">
                            <h4 className="font-medium text-gray-700 mb-3">Current Salary</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm text-gray-600">Grade</label>
                                    <p className="font-medium">
                                        {grades.find(g => g.id == formData.old_grade_id)?.grade_name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">Basic Salary</label>
                                    <p className="text-lg font-bold text-gray-900">
                                        ₹{formData.old_basic_salary?.toLocaleString() || '0'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">Gross Salary</label>
                                    <p className="font-medium text-green-700">
                                        ₹{formData.old_gross_salary?.toLocaleString() || '0'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">Net Salary</label>
                                    <p className="font-bold text-blue-700">
                                        ₹{formData.old_net_salary?.toLocaleString() || '0'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* New Salary */}
                        <div className="bg-blue-50 p-4 rounded border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-3">Proposed Salary</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm text-blue-700">New Grade</label>
                                    <select
                                        value={formData.new_grade_id}
                                        onChange={(e) => handleGradeChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Grade</option>
                                        {grades.map(grade => (
                                            <option key={grade.id} value={grade.id}>
                                                {grade.grade_name} (₹{grade.min_salary?.toLocaleString()} - ₹{grade.max_salary?.toLocaleString()})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-blue-700">New Basic Salary *</label>
                                    <div className="flex">
                                        <span className="bg-blue-100 px-3 py-2 border border-r-0 border-blue-300 rounded-l-md text-blue-500">
                                            ₹
                                        </span>
                                        <input
                                            type="number"
                                            value={formData.new_basic_salary}
                                            onChange={(e) => handleBasicSalaryChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-blue-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter new basic salary"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Increment Summary */}
                                {formData.basic_increment_amount !== 0 && (
                                    <div className="mt-4 p-3 bg-white rounded border">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Increment Amount:</span>
                                            <span className={`font-bold ${formData.basic_increment_amount > 0
                                                    ? 'text-green-700'
                                                    : 'text-red-700'
                                                }`}>
                                                {formData.basic_increment_amount > 0 ? '+' : ''}
                                                ₹{Math.abs(formData.basic_increment_amount).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm text-gray-600">Increment Percentage:</span>
                                            <span className={`font-bold ${formData.basic_increment_percentage > 0
                                                    ? 'text-green-700'
                                                    : 'text-red-700'
                                                }`}>
                                                {formData.basic_increment_percentage > 0 ? '+' : ''}
                                                {formData.basic_increment_percentage}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Component Level Changes */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Component Level Changes</h3>
                        <button
                            type="button"
                            onClick={addComponentChange}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                        >
                            + Add Component Change
                        </button>
                    </div>

                    {formData.component_changes.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">No component changes added yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {formData.component_changes.map((change, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-medium">{change.component_name}</span>
                                            <span className="text-sm text-gray-600 ml-2">({change.component_code})</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-gray-700">
                                                ₹{change.old_value?.toLocaleString()} → ₹{change.new_value?.toLocaleString()}
                                            </span>
                                            {change.change_amount > 0 ? (
                                                <ArrowUpIcon className="h-4 w-4 text-green-600 ml-2" />
                                            ) : (
                                                <ArrowDownIcon className="h-4 w-4 text-red-600 ml-2" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Effective Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Effective From *
                        </label>
                        <div className="flex items-center">
                            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <input
                                type="date"
                                value={formData.effective_from}
                                onChange={(e) => setFormData(prev => ({ ...prev, effective_from: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Effective To (Optional)
                        </label>
                        <input
                            type="date"
                            value={formData.effective_to}
                            onChange={(e) => setFormData(prev => ({ ...prev, effective_to: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">For temporary changes only</p>
                    </div>
                </div>

                {/* Reference and Remarks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reference Number (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.reference_number}
                            onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., HR/INC/2024/001"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Remarks
                        </label>
                        <textarea
                            value={formData.remarks}
                            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Additional notes or comments..."
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Submit Salary Change'}
                    </button>
                </div>
            </form>

            {/* Component Change Modal */}
            {componentModal && (
                <ComponentChangeModal
                    onSave={handleComponentSave}
                    onClose={() => {
                        setComponentModal(false)
                        setSelectedComponent(null)
                    }}
                    initialData={selectedComponent}
                />
            )}
        </div>
    )
}