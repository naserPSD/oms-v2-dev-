'use client'

import { useState, useEffect } from 'react'
import {
    ChartBarIcon,
    CurrencyDollarIcon,
    CalculatorIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline'

// interface SalaryComponent {
//     id: number
//     item_code: string
//     item_name: string
//     calculation_method: string
//     amount: number
//     percentage: number | null
//     is_taxable: boolean
// }

// interface SalaryTotals {
//     gross_salary: number
//     total_deductions: number
//     net_salary: number
//     taxable_income: number
//     total_tax: number
// }

// interface SalaryCalculatorProps {
//     gradeId: number
//     basicSalary: number
//     onCalculate?: (totals: SalaryTotals) => void
// }

export default function SalaryCalculator({
    gradeId,
    basicSalary,
    onCalculate
}) {
    const [components, setComponents] = useState([])
    const [totals, setTotals] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (gradeId && basicSalary > 0) {
            calculateSalary()
        }
    }, [gradeId, basicSalary])

    const calculateSalary = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/payroll/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grade_id: gradeId, basic_salary: basicSalary })
            })

            const data = await response.json()
            setComponents(data.components)
            setTotals(data.totals)

            if (onCalculate) {
                onCalculate(data.totals)
            }
        } catch (error) {
            console.error('Error calculating salary:', error)
        } finally {
            setLoading(false)
        }
    }

    const earnings = components.filter(c =>
        ['BASIC', 'HRA', 'DA', 'CA', 'MA', 'SA'].includes(c.item_code)
    )
    const deductions = components.filter(c =>
        ['PF', 'PT', 'TAX', 'ESI'].includes(c.item_code)
    )

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 text-black border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-blue-900">Salary Calculation</h3>
                        <p className="text-blue-700 text-sm">Based on Grade rules and basic salary</p>
                    </div>
                    <CalculatorIcon className="h-8 w-8 text-blue-600" />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Earnings Section */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <BanknotesIcon className="h-5 w-5 mr-2 text-green-600" />
                            Earnings ₹{earnings.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                        </h4>
                        <div className="space-y-2">
                            {earnings.map((component) => (
                                <div key={component.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <div>
                                        <span className="font-medium">{component.item_name}</span>
                                        {component.percentage && (
                                            <span className="text-sm text-gray-600 ml-2">{component.percentage}%</span>
                                        )}
                                    </div>
                                    <span className="font-semibold">₹{component.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Deductions Section */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <CurrencyDollarIcon className="h-5 w-5 mr-2 text-red-600" />
                            Deductions (₹{deductions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()})
                        </h4>
                        <div className="space-y-2">
                            {deductions.map((component) => (
                                <div key={component.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                    <div>
                                        <span className="font-medium">{component.item_name}</span>
                                        {component.percentage && (
                                            <span className="text-sm text-gray-600 ml-2">{component.percentage}%</span>
                                        )}
                                    </div>
                                    <span className="font-semibold">₹{component.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    {totals && (
                        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                            <h4 className="font-semibold text-gray-900 flex items-center">
                                <ChartBarIcon className="h-5 w-5 mr-2 text-gray-600" />
                                Salary Summary
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Gross Salary:</span>
                                        <span className="font-semibold">₹{totals.gross_salary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Deductions:</span>
                                        <span className="font-semibold text-red-600">₹{totals.total_deductions.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2">
                                        <span className="text-gray-800 font-medium">Net Salary:</span>
                                        <span className="text-green-600 font-bold text-lg">
                                            ₹{totals.net_salary.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Taxable Income:</span>
                                        <span className="font-semibold">₹{totals.taxable_income.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Income Tax:</span>
                                        <span className="font-semibold text-red-600">₹{totals.total_tax.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}