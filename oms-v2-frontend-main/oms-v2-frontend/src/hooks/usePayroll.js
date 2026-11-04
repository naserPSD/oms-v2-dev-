import { useState, useEffect, useCallback } from 'react'

export function usePayroll() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const calculateSalary = useCallback(async (gradeId, basicSalary, effectiveDate = null) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/payroll/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grade_id: gradeId,
                    basic_salary: basicSalary,
                    effective_date: effectiveDate
                })
            })

            if (!response.ok) {
                throw new Error('Failed to calculate salary')
            }

            const data = await response.json()
            return data

        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchGradeRules = useCallback(async (gradeId) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/payroll/grades/${gradeId}/rules`)
            if (!response.ok) throw new Error('Failed to fetch grade rules')

            const data = await response.json()
            return data

        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const saveSalaryStructure = useCallback(async (structureData) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/payroll/salary-structures', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(structureData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save salary structure')
            }

            const data = await response.json()
            return data

        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const updateSalaryStructure = useCallback(async (structureId, structureData) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/payroll/salary-structures/${structureId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(structureData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update salary structure')
            }

            const data = await response.json()
            return data

        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchEmployeeSalaryStructures = useCallback(async (employeeId) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/payroll/employees/${employeeId}/salary-structures`)
            if (!response.ok) throw new Error('Failed to fetch salary structures')

            const data = await response.json()
            return data

        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchPayItems = useCallback(async (params = {}) => {
        setLoading(true)
        setError(null)

        try {
            const queryString = new URLSearchParams(params).toString()
            const response = await fetch(`/api/payroll/pay-items${queryString ? `?${queryString}` : ''}`)

            if (!response.ok) throw new Error('Failed to fetch pay items')

            const data = await response.json()
            return data

        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchSalaryGrades = useCallback(async (params = {}) => {
        setLoading(true)
        setError(null)

        try {
            const queryString = new URLSearchParams(params).toString()
            const response = await fetch(`/api/payroll/grades${queryString ? `?${queryString}` : ''}`)

            if (!response.ok) throw new Error('Failed to fetch salary grades')

            const data = await response.json()
            return data

        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchEmployees = useCallback(async (params = {}) => {
        setLoading(true)
        setError(null)

        try {
            const queryString = new URLSearchParams(params).toString()
            const response = await fetch(`/api/payroll/employees${queryString ? `?${queryString}` : ''}`)

            if (!response.ok) throw new Error('Failed to fetch employees')

            const data = await response.json()
            return data

        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchSalaryStructureDetails = useCallback(async (structureId) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/payroll/salary-structures/${structureId}/details`)
            if (!response.ok) throw new Error('Failed to fetch structure details')

            const data = await response.json()
            return data

        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const approveSalaryStructure = useCallback(async (structureId, approvedBy) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/payroll/salary-structures/${structureId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved_by: approvedBy })
            })

            if (!response.ok) throw new Error('Failed to approve salary structure')

            const data = await response.json()
            return data

        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const generatePayslip = useCallback(async (structureId, month, year) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/payroll/salary-structures/${structureId}/payslip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month, year })
            })

            if (!response.ok) throw new Error('Failed to generate payslip')

            const data = await response.json()
            return data

        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        loading,
        error,
        calculateSalary,
        fetchGradeRules,
        saveSalaryStructure,
        updateSalaryStructure,
        fetchEmployeeSalaryStructures,
        fetchPayItems,
        fetchSalaryGrades,
        fetchEmployees,
        fetchSalaryStructureDetails,
        approveSalaryStructure,
        generatePayslip
    }
}