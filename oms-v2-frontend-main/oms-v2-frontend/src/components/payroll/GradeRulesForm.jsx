// src/features/payroll/GradeRulesForm.jsx
"use client";

import { FormController as Controller } from "@/components/common/FormController";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import DatePicker from "@/components/ui/DatePicker";
import SwitchButton from "@/components/ui/SwitchButton";
import ButtonTw from "@/components/ui/ButtonTw";
import Checkbox from "@/components/ui/Checkbox";
import { PlusIcon, TrashIcon, CalculatorIcon } from "@heroicons/react/24/outline";

/**
 * Props:
 *  - gradeId (optional) : preset grade id
 *  - initialData (optional) : when editing; should include { grade_id, rules: [...] }
 *  - onSuccess (optional)
 *  - onCancel (optional)
 *
 * Notes:
 *  - SelectSearch expects objects { value, label } on change. Controller will convert to primitive id for form state.
 *  - DatePicker returns a string date "YYYY-MM-DD".
 *  - SwitchButton returns boolean.
 */

// --- Zod schema ---
const RuleSchema = z.object({
    pay_item_id: z.coerce.number().min(1, "Pay item is required"),
    min_basic: z.coerce.number().min(0, "Minimum basic is required"),
    max_basic: z.coerce.number().min(0, "Maximum basic is required"),
    calculation_method: z.enum(["PERCENTAGE", "FIXED", "FORMULA", "RANGE"]),
    percentage: z
        .optional()
        .nullable()
        .refine((v) => v === null || typeof v === "number", "Invalid percentage"),
    fixed_amount: z
        .optional()
        .nullable()
        .refine((v) => v === null || typeof v === "number", "Invalid fixed amount"),
    formula: z.string().optional().nullable(),
    effective_from: z.string().min(1, "Effective from is required"),
    effective_to: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
    remarks: z.string().optional().nullable(),
});

const FormSchema = z.object({
    grade_id: z.coerce.number().min(1, "Salary grade is required"),
    rules: z
        .array(RuleSchema)
        .min(1, "At least one rule is required")
        .nonempty("At least one rule is required"),
});

export default function GradeRulesForm({ gradeId: propGradeId, initialData, onSuccess, onCancel }) {
    const [payItemsRaw, setPayItemsRaw] = useState([]);
    const [gradesRaw, setGradesRaw] = useState([]);
    const [loading, setLoading] = useState(false);

    // Map API data into SelectSearch options { value, label }
    const payItemOptions = useMemo(
        () =>
            payItemsRaw.map((p) => ({
                value: Number(p.id),
                label: `${p.item_code} - ${p.item_name}`,
                meta: p, // keep original for convenience
            })),
        [payItemsRaw]
    );

    const gradeOptions = useMemo(
        () =>
            gradesRaw.map((g) => ({
                value: Number(g.id),
                label: `${g.grade_name} (${g.min_salary?.toLocaleString?.() || g.min_salary} - ${g.max_salary?.toLocaleString?.() || g.max_salary})`,
                meta: g,
            })),
        [gradesRaw]
    );

    // Default values for the form (works for create)
    const defaultValues = {
        grade_id: propGradeId ? Number(propGradeId) : null,
        rules: [],
    };

    // Initialize form with zodResolver
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues,
        mode: "onChange",
    });

    // UseFieldArray for dynamic rules
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "rules",
    });

    // Fetch pay items
    useEffect(() => {
        const fetchPayItems = async () => {
            try {
                const res = await fetch("/api/payroll/pay-items?is_active=true");
                if (!res.ok) throw new Error("Failed to fetch pay items");
                const data = await res.json();
                // if your API returns { data: [...] } adjust accordingly
                setPayItemsRaw(Array.isArray(data) ? data : data.data ?? []);
            } catch (err) {
                console.error("fetchPayItems error:", err);
            }
        };

        const fetchGrades = async () => {
            try {
                const res = await fetch("/api/payroll/grades?is_active=true");
                if (!res.ok) throw new Error("Failed to fetch grades");
                const data = await res.json();
                setGradesRaw(Array.isArray(data) ? data : data.data ?? []);
            } catch (err) {
                console.error("fetchGrades error:", err);
            }
        };

        fetchPayItems();
        if (!propGradeId) fetchGrades();
    }, [propGradeId]);

    // If initialData provided (edit mode), populate form
    useEffect(() => {
        if (initialData) {
            // Map rules into shape expected by our form schema
            const mappedRules = (initialData.rules || []).map((r) => ({
                pay_item_id: Number(r.pay_item_id ?? r.payItemId ?? r.payItem?.id),
                min_basic: r.min_basic ?? r.minBasic ?? 0,
                max_basic: r.max_basic ?? r.maxBasic ?? 0,
                calculation_method: r.calculation_method ?? r.calculationMethod ?? "PERCENTAGE",
                percentage: r.percentage ?? null,
                fixed_amount: r.fixed_amount ?? null,
                formula: r.formula ?? "",
                effective_from: r.effective_from ?? r.effectiveFrom ?? new Date().toISOString().split("T")[0],
                effective_to: r.effective_to ?? r.effectiveTo ?? null,
                is_active: typeof r.is_active !== "undefined" ? !!r.is_active : true,
                remarks: r.remarks ?? "",
            }));

            reset({
                grade_id: Number(initialData.grade_id ?? propGradeId ?? initialData.gradeId ?? null),
                rules: mappedRules,
            });

            // Ensure field array matches mappedRules
            replace(mappedRules);
        } else {
            // if create mode and a gradeId prop exists prefill it
            if (propGradeId) setValue("grade_id", Number(propGradeId));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData, propGradeId, setValue, reset, replace]);

    // Helper to add a new rule
    const addRule = () => {
        append({
            pay_item_id: null,
            min_basic: "",
            max_basic: "",
            calculation_method: "PERCENTAGE",
            percentage: null,
            fixed_amount: null,
            formula: "",
            effective_from: new Date().toISOString().split("T")[0],
            effective_to: null,
            is_active: true,
            remarks: "",
        });
    };

    // Submit handler
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const payload = {
                grade_id: Number(data.grade_id),
                rules: data.rules.map((r) => ({
                    pay_item_id: Number(r.pay_item_id),
                    min_basic: Number(r.min_basic),
                    max_basic: Number(r.max_basic),
                    calculation_method: r.calculation_method,
                    percentage: r.percentage !== null ? Number(r.percentage) : null,
                    fixed_amount: r.fixed_amount !== null ? Number(r.fixed_amount) : null,
                    formula: r.formula || null,
                    effective_from: r.effective_from,
                    effective_to: r.effective_to || null,
                    is_active: !!r.is_active,
                    remarks: r.remarks || "",
                })),
            };

            const url = initialData ? `/api/payroll/grade-rules/${initialData.id}` : "/api/payroll/grade-rules";
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to save grade rules");
            }

            const result = await res.json();
            if (onSuccess) onSuccess(result.data ?? result);
        } catch (err) {
            console.error("submit error:", err);
            alert(err?.message || "Error saving grade rules");
        } finally {
            setLoading(false);
        }
    };

    // small helper to find option object for SelectSearch value prop
    const findOption = (options, value) => options.find((o) => Number(o.value) === Number(value)) ?? null;

    return (
        <div className="p-6 dark:bg-theme-dark border bg-theme-light rounded-lg shadow text-theme-dark dark:text-theme-light">
            <div className="mb-6">
                <h2 className="text-xl font-semibold">{initialData ? "Edit Grade Rules" : "Create Grade Rules"}</h2>
                <p className="text-gray-600 text-sm">Define salary calculation rules for this grade</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Grade selection (only if gradeId not provided) */}
                {!propGradeId && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Grade *</label>
                        <Controller
                            control={control}
                            name="grade_id"
                            render={({ field, fieldState }) => (
                                <SelectSearch
                                    value={findOption(gradeOptions, field.value)}
                                    onChange={(opt) => field.onChange(opt?.value ?? null)}
                                    options={gradeOptions}
                                    placeholder="Select a grade"
                                />
                            )}
                        />
                        {errors.grade_id && <p className="text-sm text-red-600 mt-1">{errors.grade_id.message}</p>}
                    </div>
                )}

                {/* Rules list */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Salary Components Rules</h3>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={addRule} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 flex items-center">
                                <PlusIcon className="h-4 w-4 mr-1" />
                                Add Rule
                            </button>
                        </div>
                    </div>

                    {fields.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <CalculatorIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">No rules added yet</p>
                            <button type="button" onClick={addRule} className="mt-2 text-blue-600 hover:text-blue-800 font-medium">
                                Add your first rule
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {fields.map((fieldItem, index) => {
                                // Watch this specific rule to conditionally render fields
                                const rulePath = `rules.${index}`;
                                const calcMethod = watch(`${rulePath}.calculation_method`);

                                return (
                                    <div key={fieldItem.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    Rule #{index + 1}
                                                </h4>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                aria-label={`Remove rule ${index + 1}`}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            {/* Pay Item */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Item *</label>
                                                <Controller
                                                    control={control}
                                                    name={`rules.${index}.pay_item_id`}
                                                    render={({ field, fieldState }) => (
                                                        <SelectSearch
                                                            value={findOption(payItemOptions, field.value)}
                                                            onChange={(opt) => field.onChange(opt?.value ?? null)}
                                                            options={payItemOptions}
                                                            placeholder="Select Pay Item"
                                                        />
                                                    )}
                                                />
                                                {errors?.rules?.[index]?.pay_item_id && (
                                                    <p className="text-xs text-red-600 mt-1">{errors.rules[index].pay_item_id.message}</p>
                                                )}
                                            </div>

                                            {/* Calculation Method */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Method *</label>
                                                <Controller
                                                    control={control}
                                                    name={`rules.${index}.calculation_method`}
                                                    render={({ field }) => (
                                                        <select
                                                            value={field.value}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="PERCENTAGE">Percentage of Basic</option>
                                                            <option value="FIXED">Fixed Amount</option>
                                                            <option value="FORMULA">Formula</option>
                                                            <option value="RANGE">Range-based</option>
                                                        </select>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            {/* Min Basic */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Basic Salary *</label>
                                                <div className="flex">
                                                    <span className="bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md text-gray-500">₹</span>
                                                    <Controller
                                                        control={control}
                                                        name={`rules.${index}.min_basic`}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="number"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-r-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="e.g., 100000"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                {errors?.rules?.[index]?.min_basic && (
                                                    <p className="text-xs text-red-600 mt-1">{errors.rules[index].min_basic.message}</p>
                                                )}
                                            </div>

                                            {/* Max Basic */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Basic Salary *</label>
                                                <div className="flex">
                                                    <span className="bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md text-gray-500">₹</span>
                                                    <Controller
                                                        control={control}
                                                        name={`rules.${index}.max_basic`}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="number"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-r-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="e.g., 150000"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                {errors?.rules?.[index]?.max_basic && (
                                                    <p className="text-xs text-red-600 mt-1">{errors.rules[index].max_basic.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Calculation value area */}
                                        <div className="mb-4">
                                            {calcMethod === "PERCENTAGE" && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Percentage of Basic Salary *</label>
                                                    <div className="flex items-center">
                                                        <Controller
                                                            control={control}
                                                            name={`rules.${index}.percentage`}
                                                            render={({ field }) => (
                                                                <input
                                                                    {...field}
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="e.g., 50"
                                                                />
                                                            )}
                                                        />
                                                        <span className="ml-2 text-gray-600">%</span>
                                                    </div>
                                                </div>
                                            )}

                                            {calcMethod === "FIXED" && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Amount *</label>
                                                    <div className="flex">
                                                        <span className="bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md text-gray-500">₹</span>
                                                        <Controller
                                                            control={control}
                                                            name={`rules.${index}.fixed_amount`}
                                                            render={({ field }) => (
                                                                <input
                                                                    {...field}
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-r-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="e.g., 2000"
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {calcMethod === "FORMULA" && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Formula Expression</label>
                                                    <Controller
                                                        control={control}
                                                        name={`rules.${index}.formula`}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="text"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="e.g., basic_salary * 0.12"
                                                            />
                                                        )}
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">Use variables: basic_salary, gross_salary, etc.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Dates */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Effective From *</label>
                                                <Controller
                                                    control={control}
                                                    name={`rules.${index}.effective_from`}
                                                    render={({ field }) => (
                                                        <DatePicker value={field.value} onChange={(v) => field.onChange(v)} />
                                                    )}
                                                />
                                                {errors?.rules?.[index]?.effective_from && (
                                                    <p className="text-xs text-red-600 mt-1">{errors.rules[index].effective_from.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Effective To (Optional)</label>
                                                <Controller
                                                    control={control}
                                                    name={`rules.${index}.effective_to`}
                                                    render={({ field }) => (
                                                        <DatePicker value={field.value} onChange={(v) => field.onChange(v)} />
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Remarks + Active */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                                <Controller
                                                    control={control}
                                                    name={`rules.${index}.remarks`}
                                                    render={({ field }) => (
                                                        <textarea
                                                            {...field}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Any additional notes about this rule..."
                                                            rows="2"
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className="flex items-center justify-end">
                                                <Controller
                                                    control={control}
                                                    name={`rules.${index}.is_active`}
                                                    render={({ field }) => (
                                                        <div className="flex items-center gap-3">
                                                            <label className="text-sm font-medium text-gray-700">Active</label>
                                                            <SwitchButton enabled={!!field.value} onClick={(val) => field.onChange(!!val)} enabledText="Yes" disabledText="No" />
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={() => {
                                reset(defaultValues);
                                if (onCancel) onCancel();
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            disabled={loading || isSubmitting}
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={loading || isSubmitting}
                        className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading || isSubmitting ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving...
                            </span>
                        ) : initialData ? "Update Grade Rules" : "Save Grade Rules"}
                    </button>
                </div>
            </form>
        </div>
    );
}
