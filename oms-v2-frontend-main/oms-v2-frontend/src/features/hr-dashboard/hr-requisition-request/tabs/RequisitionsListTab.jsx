"use client";
import { FormController as Controller } from "@/components/common/FormController";
import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import helpers, { toaster } from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";
import RequisitionListTable from "../../hr-requisitions/tabs/components/RequisitionsTable";
import RequisitionListTabChangeStatusModal from "../../hr-requisitions/tabs/modals/RequisitionListTabChangeStatusModal";
import { useMyRequisitionFilters } from "../hooks/useMyRequisitionFilters";
import { useMyRequisitionTableColumns } from "../hooks/useMyRequisitionTableColumns";

const initialValues = {
  id: 0,
  itemDescription: "",
  quantity: 1,
  estimatedCost: 0,
};

const schema = z.object({
  id: z.coerce.number().optional(),
  itemDescription: z.string().min(1, "Item Description is required"),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be greater than or equal to 1"),
  estimatedCost: z.coerce
    .number()
    .min(1, "Estimated Cost must be greater than or equal to 1"),
});

const RequisitionsListTab = () => {
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [requisitionId, setRequisitionId] = useState(null);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const requisitionStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "requisition_statuses")
      ?.statuses ?? [];

  const [sorting, setSorting] = useState([]);

  const { reset, handleSubmit, control, watch, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  const {
    useMyRequisitionQuery,
    useAllPendingRequisitionQuery,
    requisitionStatusChangeMutation,
    deleteRequisitionMutation,
    addOrUpdateRequisitionMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  const { useDepartmentListQuery } = useCommonQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  const { data: departmentList = [] } = useDepartmentListQuery();

  const {
    filters,
    globalFilter,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearAllFilters,
    queryParams,
    setGlobalFilter,
  } = useMyRequisitionFilters(itemsPerPage);

  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  const { data: responseData, isLoading: isFetching } =
    useMyRequisitionQuery(queryParams);
  useAllPendingRequisitionQuery(queryParams);

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data],
  );

  const pagination = responseData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total } = pagination;

  const listData = useMemo(() => {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  const submitForm = async (values) => {
    try {
      await addOrUpdateRequisitionMutation.mutateAsync(values);
    } catch (err) {
      // Handled by RestApi toaster
    }
  };

  const handleStatusFrom = async (values) => {
    const payload = { ...values, id: requisitionId };
    try {
      await requisitionStatusChangeMutation.mutateAsync(payload);
    } catch (err) {
      // Handled by RestApi toaster
    }
  };

  const handleDelete = useCallback(
    async (itemOrId) => {
      const id = typeof itemOrId === "object" ? itemOrId?.id : itemOrId;
      const status = typeof itemOrId === "object" ? itemOrId?.status?.code : null;
      const isPending =
        typeof itemOrId !== "object" ||
        status === "requisition_status_pending" ||
        (!status && itemOrId?.statusId === 138);

      if (!isPending) {
        toaster(
          "Approved requisitions cannot be deleted. Only pending requisitions can be deleted.",
          "error",
        );
        return;
      }

      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        customClass: {
          popup: "swal-popup",
          confirmButton: "swal-confirm-btn",
          cancelButton: "swal-cancel-btn",
        },
        buttonsStyling: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteRequisitionMutation.mutateAsync(id);
          } catch (err) {
            // Already handled by RestApi (toast notification displayed)
          }
        }
      });
    },
    [deleteRequisitionMutation],
  );

  const handleEdit = useCallback(
    (item) => {
      const status = item?.status?.code;
      const isPending =
        status === "requisition_status_pending" ||
        (!status && item?.statusId === 138);

      if (!isPending) {
        const statusLabel =
          item?.status?.name ||
          item?.status?.code?.replace("requisition_status_", "") ||
          "processed";
        toaster(
          `This requisition cannot be modified because its status is already "${statusLabel}". Only pending requisitions can be edited.`,
          "error",
        );
        return;
      }

      reset(item);
      setShowModal(true);
    },
    [reset],
  );

  const handleStatusChange = (item) => {
    setRequisitionId(item.id);
    setShowStatusModal(true);
  };

  const columns = useMyRequisitionTableColumns({
    handleStatusChange,
    handleEdit,
    handleDelete,
  });

  const table = useReactTable({
    data: listData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeDirection: "rtl",
  });

  const isLoading =
    isFetching ||
    addOrUpdateRequisitionMutation.isLoading ||
    requisitionStatusChangeMutation.isLoading ||
    deleteRequisitionMutation.isLoading;

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Name, Email, Phone...",
    },
    {
      component: "select",
      name: "departmentId",
      label: "Select Department",
      options: departmentList || [],
      placeholder: "Filter by Department",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "datePicker",
      name: "requisitionDate",
      label: "Requisition Date",
      placeholder: "Filter by Requisition Date",
    },
    {
      component: "datePicker",
      name: "approvedDate",
      label: "Approved Date",
      placeholder: "Filter by Approved Date",
    },
    {
      component: "select",
      name: "statusId",
      label: "Select Requisition Status",
      options: requisitionStatusList || [],
      placeholder: "Filter by Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between my-5 flex-wrap gap-2">
        <h1 className="title-color font-bold text-lg">My Requisitions List</h1>
        <div className="flex gap-2 flex-wrap">
          <SimpleTooltip
            title={showFilter === "show" ? "Hide" : "Show"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw
              onClick={() => toggleFilter()}
              variant="alternative"
              className="gap-2"
            >
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>
          <ButtonTw
            onClick={() => setShowModal(true)}
            variant="blue"
            className="gap-2"
            size="sm"
          >
            <BiPlus /> Add New
          </ButtonTw>

          <button className="p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            📄
          </button>
          <button className="p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            🖨️
          </button>
        </div>
      </div>

      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Requisition`}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-2 gap-x-4 ">
            <Controller
              control={control}
              name="itemDescription"
              render={({ field, fieldState }) => (
                <Input
                  label="Requisition"
                  placeholder="Enter Requisition Here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-2"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="quantity"
              render={({ field, fieldState }) => (
                <Input
                  label="Quantity"
                  placeholder="Enter Quantity Here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className=""
                  type="number"
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name="estimatedCost"
              render={({ field, fieldState }) => (
                <Input
                  label="Estimated Cost"
                  placeholder="Enter Estimated Cost Here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className=""
                  type="number"
                  {...field}
                />
              )}
            />

            <div className=" w-full flex justify-center items-center gap-4 col-span-2">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-4 "
                disabled={isLoading}
                loading={isLoading}
              >
                Submit
              </ButtonTw>

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold mt-4 "
                onClick={() => reset()}
              >
                Reset
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>

      <RequisitionListTabChangeStatusModal
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSubmit={handleStatusFrom}
        statusOptions={requisitionStatusList}
        isLoading={requisitionStatusChangeMutation.isLoading}
      />

      <RequisitionListTable
        table={table}
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
};

export default RequisitionsListTab;
