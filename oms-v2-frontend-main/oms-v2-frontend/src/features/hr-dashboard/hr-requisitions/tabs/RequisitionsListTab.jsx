import { FormController as Controller } from "@/components/common/FormController";
import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import CardWithAvatars from "@/components/ui/CardWithAvatars";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
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
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
//import Swal from "sweetalert2";
import { z } from "zod";
import RequisitionListTable from "./components/RequisitionsTable";
import { useRequisitionsListFilters } from "./hooks/useRequisitionsListFilters";
import { useRequisitionsTableColumn } from "./hooks/useRequisitionsTableColumn";
import CardRequisitionsModal from "./modals/CardRequisitionsModal";
import RequisitionListTabChangeStatusModal from "./modals/RequisitionListTabChangeStatusModal";

const initialValues = {
  id: 0,
  itemDescription: "",
  requisitionType: "new",
  quantity: 1,
  estimatedCost: 0,
};
const schema = z.object({
  id: z.coerce.number().optional(),
  itemDescription: z.string().min(1, "Item Description is required"),
  requisitionType: z.enum(["in_stock", "new"]).default("new"),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be greater than or equal to 1"),
  estimatedCost: z.coerce
    .number()
    .min(0, "Estimated Cost cannot be negative")
    .optional()
    .default(0),
});

const RequisitionsListTab = ({ mode = "all", hasPermission }) => {
  // const { t } = useTranslation();
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [requisitionId, setRequisitionId] = useState(null);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [todayRequisitions, setTodayRequisitions] = useState(false);
  const [pendingRequisitions, setPendingRequisitions] = useState(false);
  const [approveRequisitions, setApproveRequisitions] = useState(false);

  const [todayData, setTodayData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [totalData, setTotalData] = useState([]);

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
    useRequisitionQuery,
    useMyRequisitionQuery,
    useRequisitionByStatus,
    useAllPendingRequisitionQuery,
    requisitionStatusChangeMutation,
    //deleteRequisitionMutation,
    addOrUpdateRequisitionMutation,
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

  const isMyRequisitionMode = mode === "my";

  // React Query for data fetching with pagination and search
  const allRequisitionQuery = useRequisitionQuery(queryParams, {
    enabled: !isMyRequisitionMode,
  });

  const myRequisitionQuery = useMyRequisitionQuery(queryParams, {
    enabled: isMyRequisitionMode,
  });

  const requisitionStatusQuery = useRequisitionByStatus({
    enabled: !isMyRequisitionMode,
  });

  const pendingRequisitionQuery = useAllPendingRequisitionQuery(queryParams, {
    enabled: isMyRequisitionMode,
  });

  const responseData = isMyRequisitionMode
    ? myRequisitionQuery.data
    : allRequisitionQuery.data;
  const isFetching = isMyRequisitionMode
    ? myRequisitionQuery.isLoading
    : allRequisitionQuery.isLoading;

  const requistionData = isMyRequisitionMode
    ? pendingRequisitionQuery.data
    : requisitionStatusQuery.data;
  const isRequistionLoading = isMyRequisitionMode
    ? pendingRequisitionQuery.isLoading
    : requisitionStatusQuery.isLoading;

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data],
  );
  const requistionArray = useMemo(
    () => requistionData?.data || [],
    [requistionData?.data],
  );

  const pendingRequisitionList = useMemo(() => {
    const pendingData = pendingRequisitionQuery?.data?.data;
    if (Array.isArray(pendingData?.list)) return pendingData.list;
    if (Array.isArray(pendingData)) return pendingData;
    return [];
  }, [pendingRequisitionQuery?.data?.data]);

  const pagination = responseData?.list?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total } = pagination;

  const listData = useMemo(() => {
    return dataArray.list?.map((item, index) => ({
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
    return await requisitionStatusChangeMutation.mutateAsync(payload);
  };

  // const handleDelete = useCallback(
  //   async (id) => {
  //     Swal.fire({
  //       title: "Are you sure?",
  //       text: "You won't be able to revert this!",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonText: "Yes, delete it!",
  //       customClass: {
  //         popup: "swal-popup",
  //         confirmButton: "swal-confirm-btn",
  //         cancelButton: "swal-cancel-btn",
  //       },
  //       buttonsStyling: false,
  //     }).then(async (result) => {
  //       if (result.isConfirmed) {
  //         await deleteRequisitionMutation.mutateAsync(id);
  //       }
  //     });
  //   },
  //   [deleteRequisitionMutation],
  // );

  const handleEdit = useCallback(
    (item) => {
      reset(item);
      setShowModal(true);
    },
    [reset],
  );

  const handleStatusChange = (item) => {
    setRequisitionId(item.id);
    setSelectedRequisition(item);
    setShowStatusModal(true);
  };

  // TanStack Table columns

  const columns = useRequisitionsTableColumn({
    handleStatusChange,
    handleEdit,
    hasPermission,
  });

  // Create TanStack Table instance
  const table = useReactTable({
    data: listData || [],
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
    isRequistionLoading ||
    addOrUpdateRequisitionMutation.isLoading ||
    requisitionStatusChangeMutation.isLoading;

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
      name: "requisitionType",
      label: "Requisition Type",
      options: [
        { label: "All Types", value: "" },
        { label: "New Purchase", value: "new" },
        { label: "In Stock", value: "in_stock" },
      ],
      placeholder: "Filter by Type",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
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
        <h1 className="title-color font-bold text-lg">Requisition List</h1>
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
          {hasPermission("hr.requisition_list_add") && (
            <ButtonTw
              onClick={() => setShowModal(true)}
              variant="blue"
              className="gap-2"
              size="sm"
            >
              <BiPlus /> Add New
            </ButtonTw>
          )}

          <button className="p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            📄
          </button>
          <button className="p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
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
          title="Today's Requisitions"
          users={dataArray.headers?.today?.users}
          count={dataArray.headers?.today?.count}
          borderColor="border-l-green-500"
          onClick={() => {
            setTodayData(requistionArray?.today?.users || []);
            setTodayRequisitions(true);
          }}
        />

        <CardWithAvatars
          title="Pending Requisitions"
          users={dataArray.headers?.pending?.users}
          count={dataArray.headers?.pending?.count}
          borderColor="border-l-cyan-500"
          onClick={() => {
            setPendingData(
              isMyRequisitionMode
                ? pendingRequisitionList
                : requistionArray?.pending?.users || [],
            );
            setPendingRequisitions(true);
          }}
        />

        <CardWithAvatars
          title="Approved Requisitions today"
          users={dataArray.headers?.approved?.users}
          count={dataArray.headers?.approved?.count}
          borderColor="border-l-purple-500"
          onClick={() => {
            setApprovedData(requistionArray?.approved?.users || []);
            setApproveRequisitions(true);
          }}
        />
        <CardWithAvatars
          title="Total Requisitions"
          users={dataArray.headers?.total?.users}
          count={dataArray.headers?.total?.count}
          borderColor="border-l-orange-500"
          onClick={() => {
            setTotalData(
              requistionArray?.total?.users ||
                dataArray.headers?.total?.users ||
                [],
            );
            setTotalRequisitions(true);
          }}
        />
      </div>

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
              name="requisitionType"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Requisition Type"
                  value={field.value || "new"}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={[
                    { label: "New Purchase", value: "new" },
                    { label: "In Stock", value: "in_stock" },
                  ]}
                  className="col-span-2"
                  placeholder="Select Requisition Type"
                />
              )}
            />

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
      {!isMyRequisitionMode && (
        <RequisitionListTabChangeStatusModal
          show={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedRequisition(null);
          }}
          onSubmit={handleStatusFrom}
          statusOptions={requisitionStatusList}
          isLoading={requisitionStatusChangeMutation.isLoading}
          requisition={selectedRequisition}
        />
      )}
      {/* Card Modal */}

      <CardRequisitionsModal
        showModal={todayRequisitions}
        handleClose={() => setTodayRequisitions(false)}
        title="Today's Requisitions"
        data={todayData}
      />

      <CardRequisitionsModal
        showModal={pendingRequisitions}
        handleClose={() => setPendingRequisitions(false)}
        title="Pending Requisitions"
        data={pendingData}
      />

      <CardRequisitionsModal
        showModal={approveRequisitions}
        handleClose={() => setApproveRequisitions(false)}
        title="Approved Requisitions"
        data={approvedData}
      />
      <CardRequisitionsModal
        showModal={totalRequisitions}
        handleClose={() => setTotalRequisitions(false)}
        title="Total Requisitions"
        data={totalData}
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
