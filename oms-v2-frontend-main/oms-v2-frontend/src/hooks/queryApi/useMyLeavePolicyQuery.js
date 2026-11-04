"use client";

import { fetchMyLeavePolicy } from "@/services/hrServiceApi";
import { useQuery } from "@tanstack/react-query";

/**
 * Standalone leave-policy query.
 * Kept outside useHrQueryApi.js to avoid circular-import / undefined named-export issues.
 */
export const useMyLeavePolicyQuery = (enabled = true) => {
  const hasToken =
    typeof window !== "undefined" &&
    !!(localStorage.getItem("accessToken") || localStorage.getItem("token"));

  return useQuery({
    queryKey: ["my-leave-policy"],
    queryFn: () => fetchMyLeavePolicy(),
    enabled: Boolean(enabled && hasToken),
    keepPreviousData: true,
    staleTime: 60 * 1000,
    retry: false,
  });
};

export default useMyLeavePolicyQuery;
