// src/features/subscription/coupons/components/CouponAddOrUpdateModal.jsx
"use client";

import React, { useEffect, useState } from "react";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import SwitchButton from "@/components/ui/SwitchButton";
import DatePicker from "@/components/ui/DatePicker";
import { fetchActiveSubscriptions } from "@/services/subscriptionApi";
import {
  Sparkles,
  Ticket,
  Percent,
  Calendar,
  Layers,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function CouponAddOrUpdateModal({
  show,
  onClose,
  initialData,
  onSubmit,
  isSubmitting,
}) {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    id: 0,
    code: "",
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    currency: "BDT",
    minimumAmount: "",
    appliesTo: "all",
    applicablePlans: [],
    maxRedemptions: "",
    maxUsesPerCompany: 1,
    firstTimeOnly: false,
    validFrom: "",
    validUntil: "",
    isActive: true,
    isRedeemable: true,
  });

  const [errors, setErrors] = useState({});
  const [plans, setPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  // Fetch active plans for selection
  useEffect(() => {
    let mounted = true;
    setIsLoadingPlans(true);
    fetchActiveSubscriptions()
      .then((res) => {
        if (!mounted) return;
        const list = res?.data?.data || res?.data || [];
        setPlans(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.warn("Failed to load plans for coupon selection", err);
      })
      .finally(() => {
        if (mounted) setIsLoadingPlans(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Sync initialData when modal opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || 0,
        code: initialData.code || "",
        name: initialData.name || "",
        description: initialData.description || "",
        discountType: initialData.discountType || "percentage",
        discountValue:
          initialData.discountValue !== undefined && initialData.discountValue !== null
            ? String(initialData.discountValue)
            : "",
        currency: initialData.currency || "BDT",
        minimumAmount:
          initialData.minimumAmount !== undefined && initialData.minimumAmount !== null
            ? String(initialData.minimumAmount)
            : "",
        appliesTo: initialData.appliesTo || "all",
        applicablePlans: Array.isArray(initialData.applicablePlans)
          ? initialData.applicablePlans
          : [],
        maxRedemptions:
          initialData.maxRedemptions !== undefined && initialData.maxRedemptions !== null
            ? String(initialData.maxRedemptions)
            : "",
        maxUsesPerCompany:
          initialData.maxUsesPerCompany !== undefined && initialData.maxUsesPerCompany !== null
            ? Number(initialData.maxUsesPerCompany)
            : 1,
        firstTimeOnly: Boolean(initialData.firstTimeOnly),
        isActive: initialData.isActive !== undefined ? Boolean(initialData.isActive) : true,
        isRedeemable:
          initialData.isRedeemable !== undefined ? Boolean(initialData.isRedeemable) : true,
        validFrom: initialData.validFrom
          ? initialData.validFrom.slice(0, 10)
          : "",
        validUntil: initialData.validUntil
          ? initialData.validUntil.slice(0, 10)
          : "",
      });
      setErrors({});
    } else {
      setFormData({
        id: 0,
        code: "",
        name: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        currency: "BDT",
        minimumAmount: "",
        appliesTo: "all",
        applicablePlans: [],
        maxRedemptions: "",
        maxUsesPerCompany: 1,
        firstTimeOnly: false,
        validFrom: "",
        validUntil: "",
        isActive: true,
        isRedeemable: true,
      });
      setErrors({});
    }
  }, [initialData, show]);

  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "OFFER-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code }));
    setErrors((prev) => ({ ...prev, code: undefined }));
  };

  const handlePlanToggle = (planId) => {
    setFormData((prev) => {
      const current = prev.applicablePlans || [];
      const updated = current.includes(planId)
        ? current.filter((id) => id !== planId)
        : [...current, planId];
      return { ...prev, applicablePlans: updated };
    });
    setErrors((prev) => ({ ...prev, applicablePlans: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.code?.trim()) {
      newErrors.code = "Coupon code is required";
    }
    if (!formData.name?.trim()) {
      newErrors.name = "Coupon name is required";
    }
    if (
      !formData.discountValue ||
      isNaN(Number(formData.discountValue)) ||
      Number(formData.discountValue) <= 0
    ) {
      newErrors.discountValue = "Valid discount value is required";
    } else if (
      formData.discountType === "percentage" &&
      Number(formData.discountValue) > 100
    ) {
      newErrors.discountValue = "Percentage discount cannot exceed 100%";
    }
    if (
      formData.appliesTo === "specific_plans" &&
      (!formData.applicablePlans || formData.applicablePlans.length === 0)
    ) {
      newErrors.applicablePlans = "Select at least one applicable plan";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...(formData.id ? { id: formData.id } : {}),
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      currency: formData.currency || "BDT",
      minimumAmount: formData.minimumAmount
        ? Number(formData.minimumAmount)
        : null,
      appliesTo: formData.appliesTo,
      applicablePlans:
        formData.appliesTo === "specific_plans"
          ? formData.applicablePlans
          : null,
      maxRedemptions: formData.maxRedemptions
        ? Number(formData.maxRedemptions)
        : null,
      maxUsesPerCompany: formData.maxUsesPerCompany
        ? Number(formData.maxUsesPerCompany)
        : 1,
      firstTimeOnly: Boolean(formData.firstTimeOnly),
      isActive: Boolean(formData.isActive),
      isRedeemable: Boolean(formData.isRedeemable),
      validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : null,
      validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
    };

    onSubmit(payload);
  };

  return (
    <ModalTw
      show={show}
      onClose={onClose}
      title={isEditing ? "Edit Subscription Coupon" : "Create Subscription Offer Coupon"}
      size="2xl"
      position="center"
      showFooter={false}
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[78vh] overflow-y-auto px-1 py-1">
        {/* Section 1: Basic Information */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            <Ticket className="w-4 h-4 text-blue-500" />
            <span>Basic Offer Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  <Sparkles className="w-3 h-3" /> Generate Code
                </button>
              </div>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }));
                  setErrors((prev) => ({ ...prev, code: undefined }));
                }}
                placeholder="e.g. SUMMER25, LAUNCH50"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-mono uppercase tracking-wider text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Offer / Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Summer Special 25% Off"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description / Terms
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Apply to all plans during checkout. Limited time promotional coupon."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Section 2: Discount & Pricing */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              <Percent className="w-4 h-4 text-emerald-500" />
              <span>Discount & Pricing Configuration</span>
            </div>
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
              {formData.discountType === "percentage" ? "Percentage Offer" : "Fixed Deduction"}
            </span>
          </div>

          {/* Discount Type: Sleek Segmented Switch Track */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-gray-200/60 dark:bg-gray-800/80 rounded-xl border border-gray-300/50 dark:border-gray-700/60">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, discountType: "percentage" }));
                  setErrors((prev) => ({ ...prev, discountValue: undefined }));
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  formData.discountType === "percentage"
                    ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/30"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Percent className="w-3.5 h-3.5" /> Percentage Discount
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, discountType: "fixed" }));
                  setErrors((prev) => ({ ...prev, discountValue: undefined }));
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  formData.discountType === "fixed"
                    ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs border border-blue-500/30"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Fixed Amount
              </button>
            </div>
          </div>

          {/* Balanced 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discount Value */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.discountValue}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, discountValue: e.target.value }));
                    setErrors((prev) => ({ ...prev, discountValue: undefined }));
                  }}
                  placeholder={formData.discountType === "percentage" ? "e.g. 25" : "e.g. 500"}
                  className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 pr-12 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="absolute right-2.5 top-2 pointer-events-none px-2 py-0.5 rounded text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                  {formData.discountType === "percentage" ? "%" : formData.currency}
                </div>
              </div>
              {errors.discountValue && (
                <p className="text-xs text-red-500 mt-1">{errors.discountValue}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="BDT">BDT (৳ Bangladeshi Taka)</option>
                <option value="USD">USD ($ US Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Minimum Amount & Live Interactive Offer Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Purchase Amount (Optional)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  value={formData.minimumAmount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, minimumAmount: e.target.value }))}
                  placeholder="0 (No minimum restriction)"
                  className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 pr-14 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="absolute right-2.5 top-2 pointer-events-none px-2 py-0.5 rounded text-xs font-medium text-gray-500 dark:text-gray-400">
                  {formData.currency}
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="h-10 mt-5 md:mt-0 px-3.5 py-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold shrink-0">
                Summary:
              </span>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 truncate">
                {formData.discountValue
                  ? formData.discountType === "percentage"
                    ? `${formData.discountValue}% discount off total`
                    : `${formData.discountValue} ${formData.currency} flat deduction`
                  : "Enter discount value"}
                {formData.minimumAmount ? ` • Min ${formData.minimumAmount} ${formData.currency}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Scope & Usage Limits */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            <Layers className="w-4 h-4 text-purple-500" />
            <span>Scope & Usage Limits</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Plan Applicability
            </label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800 dark:text-gray-200">
                <input
                  type="radio"
                  name="appliesTo"
                  value="all"
                  checked={formData.appliesTo === "all"}
                  onChange={() => setFormData((prev) => ({ ...prev, appliesTo: "all", applicablePlans: [] }))}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>All Subscription Plans</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800 dark:text-gray-200">
                <input
                  type="radio"
                  name="appliesTo"
                  value="specific_plans"
                  checked={formData.appliesTo === "specific_plans"}
                  onChange={() => setFormData((prev) => ({ ...prev, appliesTo: "specific_plans" }))}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Specific Plans Only</span>
              </label>
            </div>

            {formData.appliesTo === "specific_plans" && (
              <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Select which plans this coupon applies to:
                </p>
                {isLoadingPlans ? (
                  <p className="text-xs text-gray-500">Loading plans...</p>
                ) : plans.length === 0 ? (
                  <p className="text-xs text-gray-500">No active plans available</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {plans.map((p) => {
                      const selected = (formData.applicablePlans || []).includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handlePlanToggle(p.id)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                            selected
                              ? "bg-blue-500/15 border-blue-500 text-blue-800 dark:text-blue-200"
                              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-semibold">{p.name}</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              {p.monthlyPrice || 0} BDT/mo • {p.yearlyPrice || 0} BDT/yr
                            </p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                              selected
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {selected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {errors.applicablePlans && (
                  <p className="text-xs text-red-500 mt-1">{errors.applicablePlans}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Redemptions Limit (Optional)
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxRedemptions}
                onChange={(e) => setFormData((prev) => ({ ...prev, maxRedemptions: e.target.value }))}
                placeholder="e.g. 100 (leave empty for unlimited)"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Uses Per Company
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxUsesPerCompany}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, maxUsesPerCompany: Number(e.target.value) || 1 }))
                }
                placeholder="1"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Validity & Dates */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Offer Validity Period</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <DatePicker
                label="Valid From"
                name="validFrom"
                value={formData.validFrom}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, validFrom: date || "" }))
                }
                placeholder="Select Start Date"
                clearable={true}
                className="mb-0"
              />
            </div>

            <div>
              <DatePicker
                label="Valid Until"
                name="validUntil"
                value={formData.validUntil}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, validUntil: date || "" }))
                }
                placeholder="Select End Date"
                clearable={true}
                className="mb-0"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Activation & Restrictions */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>Activation & Restrictions</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60">
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">First-Time Subscriber Only</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Restrict this offer exclusively to companies making their initial plan purchase.
                </p>
              </div>
              <SwitchButton
                enabled={formData.firstTimeOnly}
                onChange={(val) => setFormData((prev) => ({ ...prev, firstTimeOnly: val }))}
                enabledText="Yes"
                disabledText="No"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60">
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Redeemable at Checkout</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Allow customers to enter and apply this code during online checkout.
                </p>
              </div>
              <SwitchButton
                enabled={formData.isRedeemable}
                onChange={(val) => setFormData((prev) => ({ ...prev, isRedeemable: val }))}
                enabledText="Yes"
                disabledText="No"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60">
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Active Status</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Enable or temporarily deactivate this coupon campaign across the entire system.
                </p>
              </div>
              <SwitchButton
                enabled={formData.isActive}
                onChange={(val) => setFormData((prev) => ({ ...prev, isActive: val }))}
                enabledText="Yes"
                disabledText="No"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <ButtonTw
            type="button"
            variant="alternative"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4"
          >
            Cancel
          </ButtonTw>

          <ButtonTw
            type="submit"
            variant="blue"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="px-6"
          >
            {isEditing ? "Update Coupon" : "Create Coupon"}
          </ButtonTw>
        </div>
      </form>
    </ModalTw>
  );
}
