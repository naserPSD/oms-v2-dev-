"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import helpers from "@/utils/helpers";
import { getPaymentHistory } from "../services/paymentHistoryApi";

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  lastPage: 1,
  resultRows: 0,
};

const normalizePaymentHistoryData = (payload) => {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.data)) return payload.data;

    const directItemFields = [
      "id",
      "plan",
      "planName",
      "subscriptionPlan",
      "transactionId",
      "tranId",
      "amount",
      "totalAmount",
      "paidAt",
      "paymentStatus",
      "invoiceNumber",
    ];

    const hasPaymentShape = directItemFields.some((key) => Object.hasOwn(payload, key));
    return hasPaymentShape ? [payload] : [];
  }

  return [];
};

export default function usePaymentHistory() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(() => helpers.perPageListItems());
  const [search, setSearchValue] = useState("");
  const [sort, setSort] = useState("paidAt:desc");
  const [invoiceNo, setInvoiceNoState] = useState("");
  const [transactionId, setTransactionIdState] = useState("");
  const [paymentStatus, setPaymentStatusState] = useState("");
  const [paymentDate, setPaymentDateState] = useState([]);

  const query = useQuery({
    queryKey: [
      "subscriptionPaymentHistory",
      { page, limit, search, sort, invoiceNo, transactionId, paymentStatus, paymentDate },
    ],
    queryFn: () =>
      getPaymentHistory({
        page,
        limit,
        search,
        sort,
        invoiceNo,
        transactionId,
        paymentStatus,
        paymentDate,
      }),
    keepPreviousData: true,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const response = query.data;
  const normalizedData = useMemo(() => normalizePaymentHistoryData(response?.data ?? response), [response]);

  const filteredData = useMemo(() => {
    let list = normalizedData;

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter((item) => {
        const inv = String(
          item.invoiceNumber ||
            item.invoice_number ||
            item.invoiceId ||
            item.id ||
            "",
        ).toLowerCase();
        const tran = String(
          item.transactionId ||
            item.tranId ||
            item.stripePaymentIntentId ||
            item.stripe_payment_intent_id ||
            "",
        ).toLowerCase();
        const plan = String(
          item.planName ||
            item.plan?.name ||
            item.subscriptionPlan?.name ||
            "",
        ).toLowerCase();
        const client = String(
          item.clientName ||
            item.customerName ||
            item.user?.email ||
            `${item.user?.firstName || ""} ${item.user?.lastName || ""}`.trim() ||
            "",
        ).toLowerCase();

        return (
          inv.includes(q) ||
          tran.includes(q) ||
          plan.includes(q) ||
          client.includes(q)
        );
      });
    }

    if (invoiceNo) {
      const q = invoiceNo.toLowerCase().trim();
      list = list.filter((item) => {
        const inv = String(
          item.invoiceNumber ||
            item.invoice_number ||
            item.invoiceId ||
            item.stripeInvoiceId ||
            item.id ||
            "",
        ).toLowerCase();
        return inv.includes(q);
      });
    }

    if (transactionId) {
      const q = transactionId.toLowerCase().trim();
      list = list.filter((item) => {
        const tran = String(
          item.transactionId ||
            item.tranId ||
            item.stripePaymentIntentId ||
            item.stripe_payment_intent_id ||
            "",
        ).toLowerCase();
        return tran.includes(q);
      });
    }

    if (paymentStatus) {
      const q = paymentStatus.toLowerCase().trim();
      list = list.filter((item) => {
        const status = String(item.paymentStatus || item.status || "").toLowerCase();
        return status === q;
      });
    }

    if (Array.isArray(paymentDate) && paymentDate.length > 0) {
      const [start, end] = paymentDate;
      list = list.filter((item) => {
        const dateVal = item.paidAt || item.paid_at;
        if (!dateVal) return false;
        try {
          const d = new Date(dateVal).toISOString().slice(0, 10);
          if (start && end) return d >= start && d <= end;
          if (start) return d >= start;
          if (end) return d <= end;
        } catch {
          return false;
        }
        return true;
      });
    }

    return list;
  }, [normalizedData, search, invoiceNo, transactionId, paymentStatus, paymentDate]);

  const hasActiveFilters = Boolean(
    search ||
      invoiceNo ||
      transactionId ||
      paymentStatus ||
      (Array.isArray(paymentDate) && paymentDate.length > 0 && paymentDate.some(Boolean)),
  );

  const clearAllFilters = () => {
    setSearchValue("");
    setInvoiceNoState("");
    setTransactionIdState("");
    setPaymentStatusState("");
    setPaymentDateState([]);
    setPage(1);
  };

  const pagination = response?.pagination || {
    ...DEFAULT_PAGINATION,
    page,
    limit,
    total: filteredData.length,
    resultRows: filteredData.length,
    lastPage: Math.max(1, Math.ceil(filteredData.length / Math.max(limit, 1))),
  };

  return {
    data: filteredData,
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    page,
    limit,
    search,
    sort,
    invoiceNo,
    transactionId,
    paymentStatus,
    paymentDate,
    hasActiveFilters,
    setPage,
    setLimit: (value) => {
      setLimit(Number(value));
      setPage(1);
    },
    setSearch: (value) => {
      setSearchValue(value);
      setPage(1);
    },
    setSort: (value) => {
      setSort(value);
      setPage(1);
    },
    setInvoiceNo: (value) => {
      setInvoiceNoState(value);
      setPage(1);
    },
    setTransactionId: (value) => {
      setTransactionIdState(value);
      setPage(1);
    },
    setPaymentStatus: (value) => {
      setPaymentStatusState(value);
      setPage(1);
    },
    setPaymentDate: (value) => {
      setPaymentDateState(value);
      setPage(1);
    },
    clearAllFilters,
  };
}