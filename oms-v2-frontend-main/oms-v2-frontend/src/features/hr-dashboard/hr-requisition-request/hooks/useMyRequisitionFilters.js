import { useRequisitionsListFilters } from "../../hr-requisitions/tabs/hooks/useRequisitionsListFilters";

export const useMyRequisitionFilters = (itemsPerPage) => {
  return useRequisitionsListFilters(itemsPerPage);
};
