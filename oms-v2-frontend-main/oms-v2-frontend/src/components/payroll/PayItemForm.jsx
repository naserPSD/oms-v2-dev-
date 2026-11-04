'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, CalculatorIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

export default function PayItemForm({ initialData, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        item_code: '',
        item_name: '',
        pay_item_type_id: '',
        pay_item_category_id: '',
        recurrence_type_id: '',
        recurrence_count: 1,
        calculation_type_id: '',
        calc_value: '',
        is_taxable: true,
        is_active: true,
        sort_order: 0,
        affects_gross_salary: true,
        affects_net_salary: true,
        is_statutory: false,
        tax_section: '',
        max_limit: '',
        min_limit: ''
    })

    const [loading, setLoading] = useState(false)
    // const [statusOptions, setStatusOptions] = useState({
    //     payItemTypes: [],
    //     payItemCategories: [],
    //     recurrenceTypes: [],
    //     calculationTypes: []
    // })
    const [statusOptions, setStatusOptions] = useState({
        payItemTypes: [
            { id: 194, name: 'Earning', code: 'EARNING' },
            { id: 195, name: 'Deduction', code: 'DEDUCTION' }
        ],
        payItemCategories: [
            { id: 196, name: 'Basic', code: 'BASIC' },
            { id: 197, name: 'Allowance', code: 'ALLOWANCE' },
            { id: 198, name: 'Bonus', code: 'BONUS' },
            { id: 199, name: 'Deduction', code: 'DEDUCTION' },
            { id: 200, name: 'Variable', code: 'VARIABLE' }
        ],
        recurrenceTypes: [
            { id: 201, name: 'Monthly', code: 'MONTHLY' },
            { id: 202, name: 'Yearly', code: 'YEARLY' },
            { id: 203, name: 'One-Time', code: 'ONE_TIME' }
        ],
        calculationTypes: [
            { id: 204, name: 'FIXED', code: 'FIXED' },
            { id: 205, name: 'PERCENTAGE', code: 'PERCENTAGE' },
            { id: 206, name: 'TIERED', code: 'TIERED' },
            { id: 207, name: 'FORMULA', code: 'FORMULA' }
        ]
    })

    // Fetch status options on component mount
    useEffect(() => {
        fetchStatusOptions()
    }, [])

    // Populate form if editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                item_code: initialData.item_code || '',
                item_name: initialData.item_name || '',
                pay_item_type_id: initialData.pay_item_type_id || '',
                pay_item_category_id: initialData.pay_item_category_id || '',
                recurrence_type_id: initialData.recurrence_type_id || '',
                recurrence_count: initialData.recurrence_count || 1,
                calculation_type_id: initialData.calculation_type_id || '',
                calc_value: initialData.calc_value || '',
                is_taxable: initialData.is_taxable !== undefined ? initialData.is_taxable : true,
                is_active: initialData.is_active !== undefined ? initialData.is_active : true,
                sort_order: initialData.sort_order || 0,
                affects_gross_salary: initialData.affects_gross_salary !== undefined ? initialData.affects_gross_salary : true,
                affects_net_salary: initialData.affects_net_salary !== undefined ? initialData.affects_net_salary : true,
                is_statutory: initialData.is_statutory || false,
                tax_section: initialData.tax_section || '',
                max_limit: initialData.max_limit || '',
                min_limit: initialData.min_limit || ''
            })
        }
    }, [initialData])

    const fetchStatusOptions = async () => {
        try {
            // Fetch status options from your API
            const response = await fetch('/api/payroll/status-options')
            const data = await response.json()
            setStatusOptions(data)
        } catch (error) {
            console.error('Error fetching status options:', error)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                (type === 'number' ? parseFloat(value) || 0 : value)
        }))
    }

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = initialData
                ? `/api/payroll/pay-items/${initialData.id}`
                : '/api/payroll/pay-items'

            const method = initialData ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                throw new Error('Failed to save pay item')
            }

            const result = await response.json()

            if (onSuccess) {
                onSuccess(result.data)
            }

            // Reset form if creating new
            if (!initialData) {
                setFormData({
                    item_code: '',
                    item_name: '',
                    pay_item_type_id: '',
                    pay_item_category_id: '',
                    recurrence_type_id: '',
                    recurrence_count: 1,
                    calculation_type_id: '',
                    calc_value: '',
                    is_taxable: true,
                    is_active: true,
                    sort_order: 0,
                    affects_gross_salary: true,
                    affects_net_salary: true,
                    is_statutory: false,
                    tax_section: '',
                    max_limit: '',
                    min_limit: ''
                })
            }

        } catch (error) {
            console.error('Error saving pay item:', error)
            alert('Error saving pay item. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const getCalculationTypeName = (id) => {
        const type = statusOptions.calculationTypes.find(t => t.id === parseInt(id))
        return type ? type.name : ''
    }

    // Helper to show/hide calc_value field based on calculation type
    const shouldShowCalcValue = () => {
        const calcType = getCalculationTypeName(formData.calculation_type_id)
        return ['FIXED', 'PERCENTAGE', 'TIERED'].includes(calcType)
    }

    // Helper to show/hide formula field
    const shouldShowFormulaField = () => {
        const calcType = getCalculationTypeName(formData.calculation_type_id)
        return calcType === 'FORMULA'
    }

    return (
        <div className="bg-white p-6 rounded-lg text-black">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    {initialData ? 'Edit Pay Item' : 'Create New Pay Item'}
                </h2>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Item Code *
                        </label>
                        <input
                            type="text"
                            name="item_code"
                            value={formData.item_code}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., HRA, PF, TAX"
                            required
                        />
                        <p className="mt-1 text-sm text-gray-500">Unique code for the pay item</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Item Name *
                        </label>
                        <input
                            type="text"
                            name="item_name"
                            value={formData.item_name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., House Rent Allowance"
                            required
                        />
                    </div>
                </div>

                {/* Type and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pay Item Type *
                        </label>
                        <select
                            name="pay_item_type_id"
                            value={formData.pay_item_type_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">Select Type</option>
                            {statusOptions.payItemTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            name="pay_item_category_id"
                            value={formData.pay_item_category_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">Select Category</option>
                            {statusOptions.payItemCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Calculation Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <CalculatorIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Calculation Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Calculation Type *
                            </label>
                            <select
                                name="calculation_type_id"
                                value={formData.calculation_type_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select calculation method</option>
                                {statusOptions.calculationTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {shouldShowCalcValue() && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {getCalculationTypeName(formData.calculation_type_id) === 'PERCENTAGE' ? 'Percentage Value *' : 'Fixed Amount *'}
                                </label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        name="calc_value"
                                        value={formData.calc_value}
                                        onChange={handleChange}
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={getCalculationTypeName(formData.calculation_type_id) === 'PERCENTAGE' ? 'e.g., 50' : 'e.g., 2000'}
                                        required={shouldShowCalcValue()}
                                    />
                                    <span className="bg-gray-100 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md text-gray-500">
                                        {getCalculationTypeName(formData.calculation_type_id) === 'PERCENTAGE' ? '%' : '₹'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {shouldShowFormulaField() && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Formula Expression
                                </label>
                                <input
                                    type="text"
                                    name="formula"
                                    value={formData.formula || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., basic_salary * 0.12"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Use variables like basic_salary, gross_salary, etc.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recurrence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recurrence Type
                        </label>
                        <select
                            name="recurrence_type_id"
                            value={formData.recurrence_type_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select Recurrence</option>
                            {statusOptions.recurrenceTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recurrence Count
                        </label>
                        <input
                            type="number"
                            name="recurrence_count"
                            value={formData.recurrence_count}
                            onChange={handleChange}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-sm text-gray-500">Number of times this occurs</p>
                    </div>
                </div>

                {/* Financial Impact */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Financial Impact</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="affects_gross_salary"
                                    name="affects_gross_salary"
                                    checked={formData.affects_gross_salary}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                                <label htmlFor="affects_gross_salary" className="ml-2 text-sm text-gray-700">
                                    Affects Gross Salary
                                </label>
                                <div className="ml-2 group relative">
                                    <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                                        If checked, this component will be included in gross salary calculation
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="affects_net_salary"
                                    name="affects_net_salary"
                                    checked={formData.affects_net_salary}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                                <label htmlFor="affects_net_salary" className="ml-2 text-sm text-gray-700">
                                    Affects Net Salary
                                </label>
                                <div className="ml-2 group relative">
                                    <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                                        If checked, this component will affect the final net salary
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_taxable"
                                    name="is_taxable"
                                    checked={formData.is_taxable}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                                <label htmlFor="is_taxable" className="ml-2 text-sm text-gray-700">
                                    Taxable Component
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_statutory"
                                    name="is_statutory"
                                    checked={formData.is_statutory}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                                <label htmlFor="is_statutory" className="ml-2 text-sm text-gray-700">
                                    Statutory Requirement (PF, PT, ESI)
                                </label>
                            </div>

                            {formData.is_statutory && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tax Section (e.g., 80C)
                                    </label>
                                    <input
                                        type="text"
                                        name="tax_section"
                                        value={formData.tax_section}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 80C, 10(14)"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Limits and Constraints */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Limit (₹)
                        </label>
                        <input
                            type="number"
                            name="max_limit"
                            value={formData.max_limit}
                            onChange={handleChange}
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 150000 (for PF)"
                        />
                        <p className="mt-1 text-sm text-gray-500">Maximum allowed amount for this component</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Limit (₹)
                        </label>
                        <input
                            type="number"
                            name="min_limit"
                            value={formData.min_limit}
                            onChange={handleChange}
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 0"
                        />
                        <p className="mt-1 text-sm text-gray-500">Minimum required amount</p>
                    </div>
                </div>

                {/* Sorting and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sort Order
                        </label>
                        <input
                            type="number"
                            name="sort_order"
                            value={formData.sort_order}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Display order"
                        />
                        <p className="mt-1 text-sm text-gray-500">Lower numbers appear first</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    id="status_active"
                                    name="is_active"
                                    checked={formData.is_active === true}
                                    onChange={() => handleSelectChange('is_active', true)}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <label htmlFor="status_active" className="ml-2 text-sm text-gray-700">
                                    Active
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    id="status_inactive"
                                    name="is_active"
                                    checked={formData.is_active === false}
                                    onChange={() => handleSelectChange('is_active', false)}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <label htmlFor="status_inactive" className="ml-2 text-sm text-gray-700">
                                    Inactive
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving...
                            </span>
                        ) : (
                            initialData ? 'Update Pay Item' : 'Create Pay Item'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}