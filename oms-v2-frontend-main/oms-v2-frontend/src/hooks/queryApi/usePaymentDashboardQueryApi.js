"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getOverview,
  getPaymentStatistics,
  getRevenueTrend,
  getSubscriptionSales,
  getSubscriptionStatistics,
  getTransactions,
} from "@/services/paymentDashboardApi";

const useDashboardQuery = (key, queryFn, filters, options = {}) =>
  useQuery({
    queryKey: ["payment-dashboard", key, filters],
    queryFn: () => queryFn(filters),
    enabled: options.enabled !== false,
    ...options,
  });

export const usePaymentDashboardOverview = (filters, options) =>
  useDashboardQuery("overview", getOverview, filters, options);

export const usePaymentRevenueTrend = (filters, options) =>
  useDashboardQuery("revenue-trend", getRevenueTrend, filters, options);

export const useSubscriptionSales = (filters, options) =>
  useDashboardQuery("subscription-sales", getSubscriptionSales, filters, options);

export const usePaymentStatistics = (filters, options) =>
  useDashboardQuery("payment-statistics", getPaymentStatistics, filters, options);

export const useSubscriptionStatistics = (filters, options) =>
  useDashboardQuery("subscription-statistics", getSubscriptionStatistics, filters, options);

export const usePaymentTransactions = (filters, options) =>
  useDashboardQuery("transactions", getTransactions, filters, options);