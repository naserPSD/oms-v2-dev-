import { useState } from 'react'

export function useForm(initialState = {}) {
    const [formData, setFormData] = useState(initialState)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                (type === 'number' ? parseFloat(value) || 0 : value)
        }))

        // Mark field as touched
        setTouched(prev => ({
            ...prev,
            [name]: true
        }))

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleBlur = (e) => {
        const { name } = e.target
        setTouched(prev => ({
            ...prev,
            [name]: true
        }))
    }

    const setFieldValue = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const setMultipleFields = (fields) => {
        setFormData(prev => ({
            ...prev,
            ...fields
        }))
    }

    const resetForm = () => {
        setFormData(initialState)
        setErrors({})
        setTouched({})
    }

    const validateForm = (validationRules = {}) => {
        const newErrors = {}

        Object.keys(validationRules).forEach(fieldName => {
            const rule = validationRules[fieldName]
            const value = formData[fieldName]

            if (rule.required && (value === '' || value === null || value === undefined)) {
                newErrors[fieldName] = rule.message || `${fieldName} is required`
            }

            if (rule.pattern && value && !rule.pattern.test(value)) {
                newErrors[fieldName] = rule.message || `${fieldName} is invalid`
            }

            if (rule.min && value < rule.min) {
                newErrors[fieldName] = rule.message || `${fieldName} must be at least ${rule.min}`
            }

            if (rule.max && value > rule.max) {
                newErrors[fieldName] = rule.message || `${fieldName} must be at most ${rule.max}`
            }

            if (rule.custom && rule.custom(value) !== true) {
                newErrors[fieldName] = rule.message || rule.custom(value)
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const getFieldError = (fieldName) => {
        return touched[fieldName] ? errors[fieldName] : ''
    }

    return {
        formData,
        setFormData,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        setMultipleFields,
        resetForm,
        validateForm,
        getFieldError
    }
}