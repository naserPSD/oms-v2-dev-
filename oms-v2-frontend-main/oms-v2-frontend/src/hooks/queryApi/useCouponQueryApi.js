"use client";

import {
  addOrUpdateCoupon,
  deleteCoupon,
  fetchCouponById,
  fetchCoupons,
  toggleStatusCoupon,
  validateCouponApi,
} from "@/services/subscriptionApi";
import helpers, { toaster } from "@/utils/helpers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCouponQueryApi = ({
  reset = () => {},
  setError = () => {},
  handleClose = () => {},
  setShowModal = () => {},
} = {}) => {
  const queryClient = useQueryClient();
  const COUPONS_QUERY_KEY = ["coupons"];

  const useCouponsQuery = (params = {}) => {
    return useQuery({
      queryKey: ["coupons", params],
      queryFn: () => fetchCoupons(params),
      keepPreviousData: true,
    });
  };

  const useCouponByIdQuery = (id) => {
    return useQuery({
      queryKey: ["coupon", id],
      queryFn: () => fetchCouponById(id),
      enabled: !!id,
    });
  };

  const addOrUpdateCouponMutation = useMutation({
    mutationFn: (variables) => addOrUpdateCoupon(variables, COUPONS_QUERY_KEY),
    onSuccess: (data, variables) => {
      toaster(
        `Coupon ${variables.id ? "updated" : "added"} successfully`,
        "success"
      );
      handleClose();
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error, variables) => {
      console.error("Error saving coupon:", error);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (id) => deleteCoupon(id, COUPONS_QUERY_KEY),
    onSuccess: () => {
      toaster("Coupon deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error) => {
      console.error("Error deleting coupon:", error);
      toaster(error?.response?.data?.message || "Failed to delete coupon", "error");
    },
  });

  const toggleCouponStatusMutation = useMutation({
    mutationFn: (id) => toggleStatusCoupon(id, COUPONS_QUERY_KEY),
    onSuccess: () => {
      toaster("Coupon status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error) => {
      console.error("Error updating coupon status:", error);
      toaster(error?.response?.data?.message || "Failed to update status", "error");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });

  const validateCouponMutation = useMutation({
    mutationFn: (payload) => validateCouponApi(payload),
  });

  return {
    useCouponsQuery,
    useCouponByIdQuery,
    addOrUpdateCouponMutation,
    deleteCouponMutation,
    toggleCouponStatusMutation,
    validateCouponMutation,
  };
};
