"use client";
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import { useForm } from "react-hook-form";
import { useSubscriptionQueryApi } from "@/hooks/queryApi/useSubscriptionQueryApi";
import usePaymentHistory from "@/features/subscription/payments/payment-history/hooks/usePaymentHistory";
import SubscriptionCard from "./components/SubscriptionCard";
import SubscriptionAddOrUpdateModal from "./components/SubscriptionAddOrUpdateModal";
import UserSubscriptionFormModal from "./components/UserSubscriptionFormModal";
import CompanyCurrentPlanCard from "./components/CompanyCurrentPlanCard";

const initialValues = {
  id: 0,
  name: "",
  slug: "",
  description: "",
  monthlyPrice: 0,
  yearlyPrice: 0,
  perUserYearlyPrice: 0,
  currency: "",
  billingCycle: "monthly",
  features: "",
  isActive: true,
  trialDays: 0,
  sortOrder: 0,
};

const schema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Plan name is required"),
  slug: z.string(),
  description: z.string().min(1, "Description is required"),
  monthlyPrice: z.coerce.number().min(0),
  yearlyPrice: z.coerce.number().min(0),
  perUserYearlyPrice: z.coerce.number().min(0),
  currency: z.string().min(1, "Currency is required"),
  billingCycle: z.string(),
  features: z.string().optional(),
  isActive: z.boolean().optional(),
  trialDays: z.coerce.number().min(0),
  sortOrder: z.coerce.number().optional(),
});

const getPaymentPlan = (payment) =>
  payment?.plan || payment?.subscriptionPlan || payment?.subscription?.plan;

const getPaymentPlanId = (payment) => {
  const plan = getPaymentPlan(payment);
  return (
    payment?.subscriptionPlanId ??
    payment?.subscription_plan_id ??
    payment?.planId ??
    payment?.plan_id ??
    plan?.id
  );
};

const getPaymentPlanName = (payment) => {
  const plan = getPaymentPlan(payment);
  return (
    payment?.subscriptionName ??
    payment?.subscription_name ??
    payment?.planName ??
    payment?.plan_name ??
    plan?.name
  );
};

const getPaymentBillingCycle = (payment) =>
  payment?.billingCycle ||
  payment?.billing_cycle ||
  payment?.subscriptionBillingCycle ||
  getPaymentPlan(payment)?.billingCycle;

const isSuccessfulPayment = (payment) => {
  const status = String(
    payment?.paymentStatus ??
      payment?.payment_status ??
      payment?.transactionStatus ??
      payment?.transaction_status ??
      payment?.status ??
      "",
  ).toLowerCase();
  return ["paid", "success", "succeeded"].includes(status);
};

const ActiveSubscriptionPlan = () => {
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedSubscribePlan, setSelectedSubscribePlan] = useState(null);

  const { reset, handleSubmit, control, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const { reset: resetUserForm, handleSubmit: handleUserSubmit, control: userControl } = useForm({
    defaultValues: {},
  });

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  const handleUserModalClose = useCallback(() => {
    resetUserForm({});
    setShowUserModal(false);
    setSelectedSubscribePlan(null);
  }, [resetUserForm]);

  const handleSubscribe = useCallback((plan) => {
    setSelectedSubscribePlan(plan);
    setShowUserModal(true);
  }, []);

  const handleEdit = useCallback(
    (plan) => {
      const features =
        typeof plan.features === "object"
          ? `<p>${JSON.stringify(plan.features)}</p>`
          : plan.features ?? "";
      reset({ ...initialValues, ...plan, features });
      setShowModal(true);
    },
    [reset],
  );

  const {
    useActiveSubscriptionQuery,
    useCurrentCompanySubscriptionQuery,
    addOrUpdateSubscriptionMutation,
    addUserSubscriptionMutation,
  } = useSubscriptionQueryApi({ handleClose, setShowModal, reset });

  const { data: responseData, isLoading } = useActiveSubscriptionQuery();
  const { data: companySubData, isLoading: isCompanySubLoading } =
    useCurrentCompanySubscriptionQuery();
  const { data: paymentHistory } = usePaymentHistory();

  const plans = useMemo(() => responseData?.data || [], [responseData?.data]);
  const companySub = companySubData?.data;

  const currentPlan = useMemo(() => {
    // 1. Company's current locked subscription (trial or purchased)
    if (companySub?.hasSubscription && companySub?.plan) {
      return {
        id: companySub.plan.id,
        name: companySub.plan.name,
        description: companySub.plan.description,
        billingCycle: companySub.plan.billingCycle || "Monthly",
        price: companySub.plan.monthlyPrice || companySub.plan.price,
        currency: companySub.plan.currency || "BDT",
        minUsers: companySub.plan.minUsers,
        maxUsers: companySub.plan.maxUsers,
        trialDays: companySub.plan.trialDays,
        isTrial: companySub.isTrial,
        isPurchased: companySub.isPurchased,
        isExpired: companySub.isExpired,
        daysRemaining: companySub.daysRemaining,
        startDate: companySub.subscription?.startDate,
        endDate: companySub.subscription?.endDate,
        paymentMethod: companySub.subscription?.paymentMethod,
        statusCode: companySub.subscription?.statusCode,
        statusName: companySub.subscription?.statusName,
      };
    }

    // 2. Fallback to latest successful payment from payment history
    if (!Array.isArray(paymentHistory) || paymentHistory.length === 0) return null;

    const successfulPayments = paymentHistory.filter(isSuccessfulPayment);
    if (successfulPayments.length === 0) return null;

    const sorted = [...successfulPayments].sort((a, b) => {
      const timeA = new Date(a.paidAt || a.paid_at || a.createdAt || 0).getTime();
      const timeB = new Date(b.paidAt || b.paid_at || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    const latestPayment = sorted[0];

    return {
      id: getPaymentPlanId(latestPayment),
      name: getPaymentPlanName(latestPayment),
      billingCycle: getPaymentBillingCycle(latestPayment),
      isPurchased: true,
      isTrial: false,
      isExpired: false,
    };
  }, [companySub, paymentHistory]);

  const submitForm = async (values) => {
    await addOrUpdateSubscriptionMutation.mutateAsync(values);
  };

  const submitUserForm = async (values) => {
    await addUserSubscriptionMutation.mutateAsync(values, {
      onSuccess: () => {
        handleUserModalClose();
      }
    });
  };

  return (
    <>
      <CompanyCurrentPlanCard currentPlan={currentPlan} />
      <SubscriptionCard
        data={plans}
        isFetching={isLoading || isCompanySubLoading}
        onEdit={handleEdit}
        onSubscribe={handleSubscribe}
        currentPlan={currentPlan}
      />
      <SubscriptionAddOrUpdateModal
        showModal={showModal}
        handleClose={handleClose}
        isLoading={addOrUpdateSubscriptionMutation.isLoading}
        reset={reset}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        control={control}
        watch={watch}
        setValue={setValue}
      />
      <UserSubscriptionFormModal
        showModal={showUserModal}
        handleClose={handleUserModalClose}
        isLoading={addUserSubscriptionMutation?.isLoading}
        reset={resetUserForm}
        handleSubmit={handleUserSubmit}
        submitForm={submitUserForm}
        control={userControl}
        selectedPlan={selectedSubscribePlan}
      />
    </>
  );
};

export default ActiveSubscriptionPlan;
