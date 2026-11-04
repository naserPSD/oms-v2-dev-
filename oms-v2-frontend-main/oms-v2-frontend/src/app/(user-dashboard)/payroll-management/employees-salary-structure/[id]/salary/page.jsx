'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
    ArrowLeftIcon,
    CurrencyDollarIcon,
    PlusIcon,
    DocumentTextIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline'
import EmployeeSalaryForm from '@/components/payroll/EmployeeSalaryForm'
import SalaryStructureDetails from '@/components/payroll/SalaryStructureDetails'

export default function EmployeeSalaryPage() {
    const router = useRouter()
    const params = useParams()
    const employeeId = params.id

    const [employee, setEmployee] = useState(null)
    const [salaryStructures, setSalaryStructures] = useState([])
    const [loading, setLoading] = useState(true)
    const [showNewForm, setShowNewForm] = useState(false)
    const [selectedStructure, setSelectedStructure] = useState(null)

    useEffect(() => {
        if (employeeId) {
            fetchEmployeeDetails()
            fetchSalaryStructures()
        }
    }, [employeeId])

    const fetchEmployeeDetails = async () => {
        try {
            const response = await fetch(`/api/payroll/employees/${employeeId}`)
            const data = await response.json()
            setEmployee(data)
        } catch (error) {
            console.error('Error fetching employee:', error)
        }
    }

    const fetchSalaryStructures = async () => {
        try {
            const response = await fetch(`/api/payroll/employees/${employeeId}/salary-structures`)
            const data = await response.json()
            setSalaryStructures(data)
        } catch (error) {
            console.error('Error fetching salary structures:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSalaryFormSuccess = (data) => {
        console.log('Salary structure created:', data)
        setShowNewForm(false)
        // Refresh data
        fetchSalaryStructures()
        fetchEmployeeDetails()
    }

    const getActiveStructure = () => {
        return salaryStructures.find(structure =>
            structure.is_active &&
            (!structure.effective_to || new Date(structure.effective_to) >= new Date())
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={() => router.push(`/payroll/employees/${employeeId}`)}
                        className="mr-4 p-2 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Salary Management</h1>
                        <p className="text-gray-600">
                            {employee?.first_name} {employee?.last_name} • {employee?.employee_code}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowNewForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Salary Structure
                </button>
            </div>

            {/* Current Salary Summary */}
            {employee?.current_basic_salary && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Current Salary</h2>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Basic Salary</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        ₹{employee.current_basic_salary?.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Salary Grade</p>
                                    <p className="text-lg font-medium text-blue-700">
                                        {employee.current_grade?.grade_name || 'Not assigned'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Joining Date</p>
                                    <p className="font-medium">
                                        {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <CurrencyDollarIcon className="h-12 w-12 text-blue-600" />
                    </div>
                </div>
            )}

            {/* Active Salary Structure */}
            {getActiveStructure() && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                        <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900">Active Salary Structure</h2>
                    </div>

                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="font-medium text-green-900">
                                    Effective from {new Date(getActiveStructure().effective_from).toLocaleDateString()}
                                    {getActiveStructure().effective_to && (
                                        <> to {new Date(getActiveStructure().effective_to).toLocaleDateString()}</>
                                    )}
                                </p>
                                {getActiveStructure().remarks && (
                                    <p className="text-sm text-green-700 mt-1">{getActiveStructure().remarks}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedStructure(getActiveStructure())}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                            >
                                View Details
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded p-3">
                                <p className="text-sm text-gray-600">Gross Salary</p>
                                <p className="text-lg font-bold text-green-700">
                                    ₹{getActiveStructure().gross_salary?.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white rounded p-3">
                                <p className="text-sm text-gray-600">Deductions</p>
                                <p className="text-lg font-bold text-red-700">
                                    ₹{getActiveStructure().total_deductions?.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white rounded p-3">
                                <p className="text-sm text-gray-600">Net Salary</p>
                                <p className="text-xl font-bold text-blue-700">
                                    ₹{getActiveStructure().net_salary?.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Salary History */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Salary History</h2>
                    <p className="text-sm text-gray-600">Previous salary structures</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Effective Period
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Basic Salary
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Net Salary
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {salaryStructures.map((structure) => (
                                <tr key={structure.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {new Date(structure.effective_from).toLocaleDateString()}
                                                </div>
                                                {structure.effective_to && (
                                                    <div className="text-xs text-gray-500">
                                                        to {new Date(structure.effective_to).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            ₹{structure.basic_salary?.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-blue-700">
                                            ₹{structure.net_salary?.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${structure.is_active &&
                                                (!structure.effective_to || new Date(structure.effective_to) >= new Date())
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {structure.is_active &&
                                                (!structure.effective_to || new Date(structure.effective_to) >= new Date())
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setSelectedStructure(structure)}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // You can add edit functionality here
                                                    // console.log('Edit structure:', structure.id)
                                                }}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {salaryStructures.length === 0 && (
                    <div className="text-center py-12">
                        <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No salary history found</p>
                    </div>
                )}
            </div>

            {/* New Salary Form */}
            {showNewForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <EmployeeSalaryForm
                                employeeId={employeeId}
                                onSubmit={handleSalaryFormSuccess}
                                onCancel={() => setShowNewForm(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* View Structure Details Modal */}
            {selectedStructure && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Salary Structure Details</h2>
                                    <p className="text-gray-600">
                                        {employee?.first_name} {employee?.last_name} • {selectedStructure.effective_from}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedStructure(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <span className="text-2xl">&times;</span>
                                </button>
                            </div>

                            <SalaryStructureDetails structureId={selectedStructure.id} />

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setSelectedStructure(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}