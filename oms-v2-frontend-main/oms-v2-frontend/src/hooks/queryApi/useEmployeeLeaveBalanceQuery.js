"use client";

import { fetchEmployeeLeaveBalance } from "@/services/hrServiceApi";
import { useQuery } from "@tanstack/react-query";

export const useEmployeeLeaveBalanceQuery = (empId, enabled = true) => {
  return useQuery({
    queryKey: ["employee-leave-balance", empId],
    queryFn: () => fetchEmployeeLeaveBalance(empId),
    enabled: Boolean(empId) && Boolean(enabled),
    staleTime: 15 * 1000,
  });
};
