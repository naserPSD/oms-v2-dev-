'use client'

import { useState, useEffect } from 'react'
import {
    CurrencyDollarIcon,
    BanknotesIcon,
    ReceiptPercentIcon,
    ChartBarIcon,
    DocumentTextIcon,
    CalendarIcon,
    UserIcon
} from '@heroicons/react/24/outline'

export default function SalaryStructureDetails({ structureId }) {
    const [structure, setStructure] = useState(null)
    const [details, setDetails] = useState([])
    const [employee, setEmployee] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (structureId) {
            fetchStructureDetails()
        }
    }, [structureId])

    const fetchStructureDetails = async () => {
        try {
            setLoading(true)

            // Fetch structure
            const structureRes = await fetch(`/api/payroll/salary-structures/${structureId}`)
            const structureData = await structureRes.json()
            setStructure(structureData)

            // Fetch structure details
            const detailsRes = await fetch(`/api/payroll/salary-structures/${structureId}/details`)
            const detailsData = await detailsRes.json()
            setDetails(detailsData)

            // Fetch employee info
            if (structureData.emp_id) {
                const empRes = await fetch(`/api/payroll/employees/${structureData.emp_id}`)
                const empData = await empRes.json()
                setEmployee(empData)
            }

        } catch (error) {
            console.error('Error fetching structure details:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!structure) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Salary structure not found</p>
            </div>
        )
    }

    // Separate earnings and deductions
    const earnings = details.filter(item =>
        item.pay_item?.pay_item_type_id === 194
    )
    const deductions = details.filter(item =>
        item.pay_item?.pay_item_type_id === 195
    )

    // Calculate totals
    const totalEarnings = earnings.reduce((sum, item) => sum + (item.amount || 0), 0)
    const totalDeductions = deductions.reduce((sum, item) => sum + (item.amount || 0), 0)
    const netSalary = totalEarnings - totalDeductions

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white text-black rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Salary Structure Details</h1>
                        <p className="text-gray-600">Complete breakdown of salary components</p>
                    </div>

                    <div className="text-right">
                        <div className="text-lg font-bold text-blue-700">
                            ₹{structure.net_salary?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Net Salary</div>
                    </div>
                </div>

                {/* Employee Info */}
                {employee && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center mb-3">
                            <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="font-medium text-blue-900">Employee Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Employee Name</p>
                                <p className="font-medium">
                                    {employee.first_name} {employee.last_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Employee Code</p>
                                <p className="font-mono font-medium">{employee.employee_code}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Designation</p>
                                <p className="font-medium">{employee.designation?.name}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Structure Info */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                            <p className="text-sm text-gray-600">Basic Salary</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                            ₹{structure.basic_salary?.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <BanknotesIcon className="h-5 w-5 text-green-600 mr-2" />
                            <p className="text-sm text-gray-600">Gross Salary</p>
                        </div>
                        <p className="text-xl font-bold text-green-700">
                            ₹{structure.gross_salary?.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <ReceiptPercentIcon className="h-5 w-5 text-red-600 mr-2" />
                            <p className="text-sm text-gray-600">Deductions</p>
                        </div>
                        <p className="text-xl font-bold text-red-700">
                            ₹{structure.total_deductions?.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <ChartBarIcon className="h-5 w-5 text-blue-600 mr-2" />
                            <p className="text-sm text-gray-600">Effective Period</p>
                        </div>
                        <p className="font-medium">
                            {new Date(structure.effective_from).toLocaleDateString()}
                            {structure.effective_to && (
                                <>
                                    <span className="mx-2">to</span>
                                    {new Date(structure.effective_to).toLocaleDateString()}
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Earnings Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <BanknotesIcon className="h-6 w-6 text-green-600 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900">Earnings</h2>
                    </div>
                    <div className="text-lg font-bold text-green-700">
                        ₹{totalEarnings.toLocaleString()}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Component
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Calculation
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tax Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {earnings.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {item.pay_item?.item_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {item.pay_item?.item_code}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm">
                                            {item.calculation_method === 'PERCENTAGE' && item.percentage && (
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                    {item.percentage}% of Basic
                                                </span>
                                            )}
                                            {item.calculation_method === 'FIXED' && (
                                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                                    Fixed Amount
                                                </span>
                                            )}
                                            {item.calculation_method === 'FORMULA' && (
                                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                                    Formula-based
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${item.pay_item?.is_taxable
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                            }`}>
                                            {item.pay_item?.is_taxable ? 'Taxable' : 'Non-Taxable'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-gray-900">
                                            ₹{item.amount?.toLocaleString()}
                                        </div>
                                        {item.percentage && (
                                            <div className="text-sm text-gray-500">
                                                ({item.percentage}%)
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Deductions Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <ReceiptPercentIcon className="h-6 w-6 text-red-600 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900">Deductions</h2>
                    </div>
                    <div className="text-lg font-bold text-red-700">
                        ₹{totalDeductions.toLocaleString()}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Component
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statutory
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {deductions.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {item.pay_item?.item_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {item.pay_item?.item_code}
                                                {item.pay_item?.tax_section && (
                                                    <span className="ml-2 text-blue-600">
                                                        ({item.pay_item.tax_section})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm">
                                            {item.calculation_method === 'PERCENTAGE' && item.percentage && (
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                    {item.percentage}% of Basic
                                                </span>
                                            )}
                                            {item.calculation_method === 'FIXED' && (
                                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                                    Fixed Amount
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${item.pay_item?.is_statutory
                                                ? 'bg-orange-100 text-orange-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {item.pay_item?.is_statutory ? 'Statutory' : 'Non-Statutory'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-red-700">
                                            ₹{item.amount?.toLocaleString()}
                                        </div>
                                        {item.percentage && (
                                            <div className="text-sm text-gray-500">
                                                ({item.percentage}%)
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center mb-2">
                            <BanknotesIcon className="h-5 w-5 text-green-600 mr-2" />
                            <p className="text-sm text-gray-600">Total Earnings</p>
                        </div>
                        <p className="text-2xl font-bold text-green-700">
                            ₹{totalEarnings.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center mb-2">
                            <ReceiptPercentIcon className="h-5 w-5 text-red-600 mr-2" />
                            <p className="text-sm text-gray-600">Total Deductions</p>
                        </div>
                        <p className="text-2xl font-bold text-red-700">
                            ₹{totalDeductions.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center mb-2">
                            <CurrencyDollarIcon className="h-5 w-5 text-blue-600 mr-2" />
                            <p className="text-sm text-gray-600">Net Payable</p>
                        </div>
                        <p className="text-3xl font-bold text-blue-700">
                            ₹{netSalary.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <DocumentTextIcon className="h-5 w-5 text-gray-600 mr-2" />
                            <p className="text-sm font-medium text-gray-700">Remarks</p>
                        </div>
                        <p className="text-gray-600">
                            {structure.remarks || 'No remarks provided'}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <CalendarIcon className="h-5 w-5 text-gray-600 mr-2" />
                            <p className="text-sm font-medium text-gray-700">Validity</p>
                        </div>
                        <p className="text-gray-600">
                            {structure.effective_to
                                ? `Valid until ${new Date(structure.effective_to).toLocaleDateString()}`
                                : 'Currently active (no end date)'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}