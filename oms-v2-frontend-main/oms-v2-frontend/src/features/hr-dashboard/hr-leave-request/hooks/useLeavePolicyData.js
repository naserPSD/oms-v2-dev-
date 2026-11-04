"use client";

import { useMyLeavePolicyQuery } from "@/hooks/queryApi/useMyLeavePolicyQuery";
import { useMemo } from "react";

export const useLeavePolicyData = (enabled = true) => {
  // Single source: fetchMyLeavePolicy already merges policy / types+requests with used days
  const {
    data: responseData,
    isLoading,
    isFetching: isPolicyFetching,
    isError,
  } = useMyLeavePolicyQuery(enabled);

  const policyData = useMemo(() => {
    const apiPolicy = responseData?.data;
    if (
      apiPolicy?.leaveOverview &&
      Object.keys(apiPolicy.leaveOverview).length
    ) {
      return apiPolicy;
    }
    return null;
  }, [responseData?.data]);

  const leaveOverview = policyData?.leaveOverview || {};
  const totalData = policyData?.total || {};
  const leaveRows = Object.entries(leaveOverview).map(([name, stats]) => ({
    name,
    ...stats,
  }));

  const hasData = leaveRows.length > 0;

  return {
    leaveOverview,
    totalData,
    leaveRows,
    isLoading: !hasData && isLoading,
    isFetching: isPolicyFetching,
    isPolicyError: isError && !hasData,
    showApiWarning: false,
  };
};
