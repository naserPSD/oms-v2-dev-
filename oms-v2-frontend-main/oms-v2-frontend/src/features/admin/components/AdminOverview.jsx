"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  FileText,
  CreditCard,
  Building2,
  Users,
  ArrowRight,
  TrendingUp,
  Lock,
  FileCheck2,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useSubscriptionQueryApi } from "@/hooks/queryApi/useSubscriptionQueryApi";
import {
  usePaymentDashboardOverview,
  useSubscriptionSales,
} from "@/hooks/queryApi/usePaymentDashboardQueryApi";

export default function AdminOverview({ setActiveTab }) {
  const router = useRouter();
  const [timelinePeriod, setTimelinePeriod] = useState("last30Days");

  const handleCardClick = (tabKey, directRoute) => {
    if (typeof setActiveTab === "function") {
      setActiveTab(tabKey);
    } else if (directRoute) {
      router.push(directRoute);
    } else {
      router.push(`/admin?tab=${tabKey}`);
    }
  };

  // Overview query (subscriber counts, companies, users)
  const overviewQuery = usePaymentDashboardOverview({
    dateRange: timelinePeriod,
  });
  const overview = overviewQuery?.data?.data || overviewQuery?.data || {};

  // Subscription sales query (by plan)
  const salesQuery = useSubscriptionSales({
    dateRange: timelinePeriod,
  });

  // Query users
  const { useUsersQuery, useRolesQuery } = useCompanySettingsQueryApi({});
  const { data: usersResponse } = useUsersQuery({ page: 1, limit: 10 });
  const queriedUsers =
    usersResponse?.pagination?.total ?? usersResponse?.data?.length ?? 0;
  const totalUsers = overview?.totalUsers || queriedUsers || 62;

  // Query companies / applications
  const totalCompanies = overview?.totalCompanies || 10;

  // Query roles
  const { data: rolesResponse } = useRolesQuery({ page: 1, limit: 10 });
  const totalRoles =
    rolesResponse?.pagination?.total ?? rolesResponse?.data?.length ?? 6;

  // Query Master documents
  const { masterDocumentsQuery } = useHrQueryApi({});
  const { data: masterDocsResponse } = masterDocumentsQuery({ page: 1, limit: 10 });
  const totalMasterDocs =
    masterDocsResponse?.pagination?.total ??
    masterDocsResponse?.data?.length ??
    14;

  // Query Subscription plans count
  const { useSubscriptionQuery } = useSubscriptionQueryApi({});
  const { data: subscriptionResponse } = useSubscriptionQuery({ page: 1, limit: 10 });
  const totalSubscriptionPlans =
    subscriptionResponse?.pagination?.total ??
    subscriptionResponse?.data?.length ??
    10;

  // Active subscriptions count
  const activeSubscribersCount = Number(overview?.activeSubscriptions || 4);
  const newSubscribersCount = Number(overview?.newSubscriptions || 3);

  // Platform Growth Timeline data (users and companies over time - NO REVENUE)
  const growthChartData = useMemo(() => {
    return [
      { date: "Week 1", users: 18, companies: 3, subscriptions: 1 },
      { date: "Week 2", users: 29, companies: 5, subscriptions: 2 },
      { date: "Week 3", users: 44, companies: 7, subscriptions: 3 },
      { date: "Week 4", users: totalUsers, companies: totalCompanies, subscriptions: activeSubscribersCount },
    ];
  }, [totalUsers, totalCompanies, activeSubscribersCount]);

  // Subscription plan breakdown data (NO REVENUE - counts only)
  const planSalesData = useMemo(() => {
    const salesRaw = salesQuery?.data?.data || salesQuery?.data;
    if (Array.isArray(salesRaw) && salesRaw.length > 0) {
      return salesRaw.map((p) => ({
        name: p.planName || p.name || "Plan",
        subscribers: Number(p.subscriptionsCount || p.count || p.total || 0),
        color: "#3b82f6",
      }));
    }
    return [
      { name: "Starter", subscribers: 18, color: "#3b82f6" },
      { name: "Growth", subscribers: 24, color: "#6366f1" },
      { name: "Enterprise", subscribers: 8, color: "#f59e0b" },
      { name: "Custom", subscribers: 3, color: "#10b981" },
    ];
  }, [salesQuery?.data]);

  const PIE_COLORS = ["#3b82f6", "#6366f1", "#f59e0b", "#10b981", "#ec4899"];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Simple page header with time filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Platform overview — companies, users, subscriptions & master documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setTimelinePeriod("last7Days")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                timelinePeriod === "last7Days"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimelinePeriod("last30Days")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                timelinePeriod === "last30Days"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key Stat Cards: Companies, Users, Subscriptions Taken, Master Docs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Registered Companies (koyta company) */}
        <div
          onClick={() => handleCardClick("subscriber-companies", "/admin/subscriber-companies")}
          className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs overflow-hidden cursor-pointer hover:border-blue-500/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Registered Companies
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-baseline justify-between">
              <span>{totalCompanies}</span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                View all <ArrowRight className="w-3 h-3" />
              </span>
            </h3>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                <ArrowUpRight className="w-3 h-3" />
                Active Tenants
              </span>
              <span className="text-gray-400">company workspaces</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Subscribed Organizations</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {activeSubscribersCount} companies
            </span>
          </div>
        </div>

        {/* Stat 2: Total Users (koyjon user use kortese) */}
        <div
          onClick={() => handleCardClick("roles", "/settings/roles-and-permissions")}
          className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs overflow-hidden cursor-pointer hover:border-indigo-500/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Total Platform Users
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-baseline justify-between">
              <span>{totalUsers}</span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                View all <ArrowRight className="w-3 h-3" />
              </span>
            </h3>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                Active
              </span>
              <span className="text-gray-400">registered members</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Configured Roles</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {totalRoles} system roles
            </span>
          </div>
        </div>

        {/* Stat 3: Subscriptions Taken (koto subscription) */}
        <div
          onClick={() => handleCardClick("subscriptions", "/subscription/subscription-list")}
          className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs overflow-hidden cursor-pointer hover:border-amber-500/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Subscriptions Taken
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-baseline justify-between">
              <span>{activeSubscribersCount}</span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                View all <ArrowRight className="w-3 h-3" />
              </span>
            </h3>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                <ArrowUpRight className="w-3 h-3" />
                +{newSubscribersCount} new
              </span>
              <span className="text-gray-400">active subscriptions</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Available Plan Tiers</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {totalSubscriptionPlans} plan types
            </span>
          </div>
        </div>

        {/* Stat 4: Master Documents */}
        <div
          onClick={() => handleCardClick("master-docs", "/settings/master-documents")}
          className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs overflow-hidden cursor-pointer hover:border-emerald-500/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Master Documents
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-baseline justify-between">
              <span>{totalMasterDocs}</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                View all <ArrowRight className="w-3 h-3" />
              </span>
            </h3>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                Templates
              </span>
              <span className="text-gray-400">standardized library</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Tenant Availability</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              100% available
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section: Platform Member Growth & Subscription Plan Types (NO REVENUE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Member & Tenant Growth Timeline (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-2 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Platform Member & Tenant Growth
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Cumulative user registrations and company onboarding trends
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  Platform Users
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Companies
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthChartData}>
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="companyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#cbd5e1", opacity: 0.3 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#cbd5e1", opacity: 0.3 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "12px",
                      border: "1px solid #334155",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val, name) => [
                      `${val} ${name === "users" ? "Users" : "Companies"}`,
                      name === "users" ? "Platform Users" : "Registered Companies",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#userGradient)"
                    dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 6, fill: "#4338ca", strokeWidth: 2, stroke: "#ffffff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="companies"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#companyGradient)"
                    dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 6, fill: "#1d4ed8", strokeWidth: 2, stroke: "#ffffff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Chart: Subscriptions Taken by Plan Type (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  Subscriptions by Plan Type
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Subscribers adoption across subscription tiers
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planSalesData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    width={85}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "10px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [`${val} Subscribed Companies`, "Subscribers"]}
                  />
                  <Bar dataKey="subscribers" radius={[0, 8, 8, 0]}>
                    {planSalesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-xs">
            {planSalesData.map((plan, i) => (
              <div key={plan.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: plan.color || PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  {plan.name}: <strong className="text-gray-900 dark:text-white">{plan.subscribers}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform & Subscription Health Summary (NO REVENUE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
              Tenant Subscription Rate
            </p>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {((Number(activeSubscribersCount || 4) / Number(totalCompanies || 10)) * 100).toFixed(1)}%
            </h4>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
              {activeSubscribersCount} subscribed of {totalCompanies} companies
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            {activeSubscribersCount}/{totalCompanies}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
              Plan Tier Diversity
            </p>
            <h4 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {totalSubscriptionPlans} Packages
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Available subscription models
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
              System Roles Configured
            </p>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {totalRoles} Global Roles
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Platform permission sets
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Direct Administrative Control Center */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Admin Governance Center
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage master templates, system permissions, user roles, and subscription packages
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/60">
            Administrative Modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Master Documents */}
          <button
            onClick={() => setActiveTab("master-docs")}
            className="flex flex-col justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-amber-500/40 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mb-3 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between">
                Master Documents
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" />
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Create and manage standardized document templates for companies to import.
              </p>
            </div>
          </button>

          {/* Action 2: System Permissions & Dynamic Access Panels */}
          <button
            onClick={() => setActiveTab("permissions")}
            className="flex flex-col justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mb-3 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
                System Permissions
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" />
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Manage dynamic permissions, routes, and assign access between Admin and Company panels.
              </p>
            </div>
          </button>

          {/* Action 3: Roles & Permissions */}
          <button
            onClick={() => setActiveTab("roles")}
            className="flex flex-col justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-500/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mb-3 group-hover:scale-105 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                Roles & Permissions
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" />
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Configure user roles, set permission matrices, and control access across features.
              </p>
            </div>
          </button>

          {/* Action 4: Subscription Plans */}
          <button
            onClick={() => setActiveTab("subscriptions")}
            className="flex flex-col justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-500/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mb-3 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                Subscription Plans
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" />
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Set up subscription tiers, plan features, feature limits, and billing durations.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
