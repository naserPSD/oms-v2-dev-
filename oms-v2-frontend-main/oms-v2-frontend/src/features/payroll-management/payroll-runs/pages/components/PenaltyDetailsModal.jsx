// src/features/payroll-management/salary-structures/components/PenaltyDetailsModal.jsx
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import helpers from "@/utils/helpers";
import { CalculatorIcon, UserIcon, CalendarIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { GrCurrency } from "react-icons/gr";
import Link from "next/link";
import ButtonTw from "@/components/ui/ButtonTw";
import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import { useEffect, useMemo, useRef, useState } from "react";
import SwitchButton from "@/components/ui/SwitchButton";
import { usePayrollQueryApi } from "@/hooks/queryApi/usePayrollQueryApi";
import { zodResolver } from "@/utils/zodResolver";
import { z } from "zod";
import CommonTable from "@/components/common/CommonTable";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table";

const initialValues = {
  id: 0,
  remarks: "",
  extraAmount: 0,
  penaltiesAmount: 0,
  payable: 0,
  paid: 0,
  due: 0,
  payingAmount: 0,
  newDueAmount: 0,
  penaltyApply: true,
};

const PenaltyDetailsModal = ({
  showModal,
  handleClose,
  itemData,
}) => {

  const salaryStructureSchema = z.object({
    id: z.coerce.number().optional(),
    remarks: z.string().nullable().optional(),
    extraAmount: z.coerce.number().optional(),
    penaltiesAmount: z.coerce.number().optional(),
    payable: z.coerce.number().optional(),
    paid: z.coerce.number().optional(),
    due: z.coerce.number().optional(),
    payingAmount: z.coerce.number().optional(),
    newDueAmount: z.coerce.number().optional(),
    penaltyApply: z.boolean().optional(),
  });

  // ⚡ Form
  const {
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(salaryStructureSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // 🧠 ---------- API HOOKS ----------
  const {
    useEmployeePenaltiesListQuery,
  } = usePayrollQueryApi({ reset, setError, handleClose });

  console.log('itemData in PenaltyDetailsModal', itemData)

  // Only build params when we have itemData, otherwise pass an empty object
  const mergeItemData = itemData
    ? {
        empId: itemData.empId,
        month: itemData.month,
        year: itemData.year,
      }
    : {};

  // React Query for data fetching
  const {
    data: responseData,
    isLoading: isFetching,
    refetch,
  } = useEmployeePenaltiesListQuery(mergeItemData);
  // React Query for data fetching

  console.log('responseData', responseData)

  const penaltiesData = useMemo(
    () => responseData?.data?.data || [],
    [responseData?.data?.data]
  );

  const totalPenalties = useMemo(
    () => responseData?.data?.total || 0,
    [responseData?.data?.total]
  );

  const totalAmount = useMemo(
    () => penaltiesData.reduce((sum, item) => sum + (item.amount || 0), 0),
    [penaltiesData]
  );

  // Build table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "Serial No.",
        size: 50,
        cell: ({ row }) => <div className="text-center text-sm">{row.index + 1}</div>,
      },
      {
        accessorKey: "entryStatus",
        header: "Penalty Type",
        cell: ({ row }) => (
          <span className={`badge badge-rounded badge-outline-${row.original.entryStatus?.colorName || 'secondary'}`}>
            {row.original.entryStatus?.name || "-"}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "entryTime",
        header: "Entry Time",
        cell: ({ row }) => (
          <div className="text-right font-semibold text-red-600">
            {helpers.dDateTime(row.original.entryTime)}
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <div className="text-right font-semibold text-red-600">
            {helpers.formatCurrency(row.original.amount || 0)}
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "details",
        header: "Details",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
            {row.original.details || "-"}
          </div>
        ),
        size: 150,
      },
      // {
      //   accessorKey: "createdAt",
      //   header: "Created Date",
      //   cell: ({ row }) => (
      //     <div className="text-xs text-gray-500">
      //       {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : "-"}
      //     </div>
      //   ),
      //   size: 100,
      // },
    ],
    []
  );

  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data: penaltiesData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });


  const formRef = useRef(null);
  // console.log('itemData', itemData)

  const handleFormSubmit = (data) => {
    console.log("Form Submitted Data:", data);
  }

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title="Penalty Details"
      subTitle="View penalty details information"
      size="4xl"
      dismissible={true}
      showHeader={true}
      showFooter={true}
      type="default"
      position="center"
      // footer={
      //   paymentStatus?.code !== 'payment_status_paid' && (
      //     <div className="flex justify-end gap-3">
      //       <ButtonTw onClick={handleClose} variant="light" size="base">Close</ButtonTw>
      //       <ButtonTw onClick={triggerSubmit} icon={<GrCurrency />} variant="green" size="base">Pay Now</ButtonTw>
      //     </div>
      //   )
      // }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} ref={formRef}>
        <div className="space-y-6">

          {/* Penalty Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Penalties */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Penalties</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-200 mt-1">{totalPenalties}</p>
                </div>
                <CalculatorIcon className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-300">Total Penalty Amount</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-200 mt-1">{helpers.formatCurrency(totalAmount)}</p>
                </div>
                {/* <CurrencyRupeeIcon className="w-8 h-8 text-red-400 opacity-50" /> */}
              </div>
            </div>

            {/* Month/Year Info */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Period</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-200 mt-1">
                    {helpers.monthNumberToName(itemData?.month)}/{itemData?.year}
                  </p>
                </div>
                <CalendarIcon className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
            </div>
          </div>

          {/* Penalties Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Penalty Records</h3>
            </div>
            {penaltiesData.length > 0 ? (
              <CommonTable
                table={table}
                isFetching={isFetching}
                columns={columns}
                hasActiveFilters={false}
              />
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No penalties found for this period</p>
              </div>
            )}
          </div>

        </div>
      </form>
    </ModalTw>
  );
};

export default PenaltyDetailsModal;