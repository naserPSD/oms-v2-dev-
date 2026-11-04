import { FormController as Controller } from "@/components/common/FormController";
import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import CardWithAvatars from "@/components/ui/CardWithAvatars";
import Input from "@/components/ui/Input";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import helpers from "@/utils/helpers";
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
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";
import RequisitionListTable from "./components/RequisitionsTable";
import { useRequisitionsListFilters } from "./hooks/useRequisitionsListFilters";
import { useRequisitionsTableColumn } from "./hooks/useRequisitionsTableColumn";
import CardRequisitionsModal from "./modals/CardRequisitionsModal";
import RequisitionListTabChangeStatusModal from "./modals/RequisitionListTabChangeStatusModal";

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

const ApprovedListTab = () => {
  // const { t } = useTranslation();
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

  const [todayRequisitions, setTodayRequisitions] = useState(false);
  const [pendingRequisitions, setPendingRequisitions] = useState(false);
  const [approveRequisitions, setApproveRequisitions] = useState(false);
  const [totalRequisitions, setTotalRequisitions] = useState(false);
  const requisitionStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "requisition_statuses")
      ?.statuses ?? [];
  const [sorting, setSorting] = useState([]);

  const {
    // register,
    // formState: { errors },
    // setValue,
    reset,
    handleSubmit,
    control,
    watch,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Modal handlers
  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  // API hooks
  const {
    useTrainingRequestQuery,
    trainingRequestStatusChangeMutation,
    deleteTrainingRequestMutation,
    addOrUpdateTrainingRequestMutation,
    // useOfficeListQuery
    // toggleArchivePersonalNoteMutation,
    // togglePinPersonalNoteMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  // API hooks
  const { useDepartmentListQuery } = useCommonQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  const { data: departmentList = [] } = useDepartmentListQuery();

  // 🧠 ---------- FILTERS ----------
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
  } = useRequisitionsListFilters(itemsPerPage);

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // React Query for data fetching with pagination and search
  const queryWithStatus = useMemo(
    () => ({
      ...queryParams,
      statusCode: "requisition_status_approved",
    }),
    [queryParams],
  );

  const { data: responseData, isLoading: isFetching } =
    useTrainingRequestQuery(queryWithStatus);

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
    return (
      dataArray.list?.map((item, index) => ({
        ...item,
        sl: (currentPage - 1) * itemsPerPage + index + 1,
      })) ?? []
    );
  }, [dataArray, currentPage, itemsPerPage]);

  const submitForm = async (values) => {
    await addOrUpdateTrainingRequestMutation.mutateAsync(values);
  };
  const handleStatusFrom = async (values) => {
    const payload = { ...values, id: requisitionId };
    await trainingRequestStatusChangeMutation.mutateAsync(payload);
  };

  const handleDelete = useCallback(
    async (id) => {
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
          await deleteTrainingRequestMutation.mutateAsync(id);
        }
      });
    },
    [deleteTrainingRequestMutation],
  );

  const handleEdit = useCallback(
    (item) => {
      reset(item);
      setShowModal(true);
    },
    [reset],
  );

  const handleStatusChange = (item) => {
    setRequisitionId(item.id);
    setShowStatusModal(true);
  };

  // TanStack Table columns

  const columns = useRequisitionsTableColumn({
    handleStatusChange,
    handleEdit,
    handleDelete,
  });

  // Create TanStack Table instance
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
    addOrUpdateTrainingRequestMutation.isLoading ||
    trainingRequestStatusChangeMutation.isLoading ||
    deleteTrainingRequestMutation.isLoading;

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Name, Email, Phone...",
    },

    // {
    //   component: "select",
    //   name: "designationId",
    //   label: "Select Designation",
    //   options: designationList || [],
    //   placeholder: "Filter by Designation",
    //   className: "col-span-12 lg:col-span-3 sm:col-span-12",
    // },
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
      label: "Approved Date",
      placeholder: "Filter by Approved Date",
    },
    {
      component: "clear",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between my-5 flex-wrap gap-2">
        <h1 className="title-color font-bold text-lg">Approved List</h1>
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

          <button className="px-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            📄
          </button>
          <button className="px-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            🖨️
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 my-6">
        <CardWithAvatars
          title="Today's Requests"
          users={dataArray.headers?.today?.users}
          count={dataArray.headers?.today?.count}
          borderColor="border-l-green-500"
          onClick={() => setTodayRequisitions(true)}
        />
        <CardWithAvatars
          title="Total Requests"
          users={dataArray.headers?.total?.users}
          count={dataArray.headers?.total?.count}
          borderColor="border-l-orange-500"
          onClick={() => setTotalRequisitions(true)}
        />
      </div>

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Training Request`}
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
                  label="Training Name"
                  placeholder="Enter training name..."
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
                  placeholder="Enter estimated cost here..."
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
        isLoading={trainingRequestStatusChangeMutation.isLoading}
      />
      {/* Card Modal */}
      <CardRequisitionsModal
        showModal={todayRequisitions}
        handleClose={() => setTodayRequisitions(false)}
        title="Today's Training Requests"
        data={dataArray.list?.filter(
          (item) => item.status?.code === "requisition_status_completed",
        ) ?? []}
      />
      <CardRequisitionsModal
        showModal={pendingRequisitions}
        handleClose={() => setPendingRequisitions(false)}
        title="Pending Training Requests"
        data={dataArray.list?.filter(
          (item) => item.status?.code === "requisition_status_pending",
        ) ?? []}
      />
      <CardRequisitionsModal
        showModal={approveRequisitions}
        handleClose={() => setApproveRequisitions(false)}
        title="Approved Training Requests"
        data={dataArray.list?.filter(
          (item) => item.status?.code === "requisition_status_approved",
        ) ?? []}
      />
      <CardRequisitionsModal
        showModal={totalRequisitions}
        handleClose={() => setTotalRequisitions(false)}
        title="Total Training Requests"
        data={dataArray.list ?? []}
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
export default ApprovedListTab;
