'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    UserIcon,
    CurrencyDollarIcon,
    PlusIcon,
    PencilIcon,
    EyeIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline'
import EmployeeSalaryForm from '@/components/payroll/EmployeeSalaryForm'
import { ModalTw } from '@/components/common/ModalTw'

export default function EmployeesPage() {
    const router = useRouter()
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [showSalaryForm, setShowSalaryForm] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/payroll/employees')
            const data = await response.json()
            setEmployees(data)
        } catch (error) {
            console.error('Error fetching employees:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAssignSalary = (employee) => {
        setSelectedEmployee(employee)
        setShowSalaryForm(true)
    }

    const handleSalaryFormSuccess = (data) => {
        console.log('Salary structure created:', data)
        setShowSalaryForm(false)
        setSelectedEmployee(null)
        // Refresh employees list
        fetchEmployees()
    }

    const filteredEmployees = employees.filter(emp =>
        emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className='flex items-center justify-center h-64'>
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div className="animate-pulse"><span className="text-blue-600 text-2xl">loading...</span></div>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
                <p className="text-gray-600">Manage employee information and salary structures</p>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search employees by name, code, or designation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Employees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
                        {/* Employee Card Header */}
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {employee.first_name} {employee.last_name}
                                    </h3>
                                    <p className="text-sm text-gray-500">{employee.designation?.name}</p>
                                </div>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                    {employee.employee_code}
                                </span>
                            </div>
                        </div>

                        {/* Employee Details */}
                        <div className="p-4">
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center text-sm">
                                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">ID: {employee.id}</span>
                                </div>

                                {employee.current_grade && (
                                    <div className="flex items-center text-sm">
                                        <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-gray-600">
                                            Grade: {employee.current_grade.grade_name}
                                        </span>
                                    </div>
                                )}

                                {employee.current_basic_salary && (
                                    <div className="flex items-center text-sm">
                                        <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-gray-600">
                                            Basic: ₹{employee.current_basic_salary.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between space-x-2">
                                <button
                                    onClick={() => router.push(`/payroll/employees/${employee.id}`)}
                                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 flex items-center justify-center"
                                >
                                    <EyeIcon className="h-4 w-4 mr-1" />
                                    View
                                </button>

                                <button
                                    onClick={() => handleAssignSalary(employee)}
                                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center"
                                >
                                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                    Salary
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredEmployees.length === 0 && (
                <div className="text-center py-12">
                    <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {searchTerm ? 'No employees found matching your search' : 'No employees found'}
                    </p>
                </div>
            )}

            {/* Salary Form Modal */}
            <ModalTw
                show={showSalaryForm}
                onClose={() => {
                    setShowSalaryForm(false)
                    setSelectedEmployee(null)
                }}
                title={`Assign Salary - ${selectedEmployee?.first_name} ${selectedEmployee?.last_name}`}
                size="lg"
            >
                {selectedEmployee && (
                    <EmployeeSalaryForm
                        employeeId={selectedEmployee.id}
                        onSubmit={handleSalaryFormSuccess}
                        onCancel={() => {
                            setShowSalaryForm(false)
                            setSelectedEmployee(null)
                        }}
                    />
                )}
            </ModalTw>
        </div>
    )
}