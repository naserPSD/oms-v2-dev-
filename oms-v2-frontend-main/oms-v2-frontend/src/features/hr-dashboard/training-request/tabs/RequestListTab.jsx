import { FormController as Controller } from "@/components/common/FormController";
import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import CardWithAvatars from "@/components/ui/CardWithAvatars";
import DatePicker from "@/components/ui/DatePicker";
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
  trainingType: "Internal",
  quantity: 1,
  startDate: "",
  endDate: "",
  trainingProvider: "",
  locationName: "",
  estimatedCost: 0,
  reason: "",
};
const schema = z.object({
  id: z.coerce.number().optional(),
  itemDescription: z.string().trim().min(1, "Training Name is required"),
  trainingType: z.enum(["Internal", "External"], {
    required_error: "Training Type is required",
  }),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .min(1, "Number of Participants must be at least 1"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  trainingProvider: z.string().optional(),
  locationName: z.string().optional(),
  estimatedCost: z.coerce
    .number()
    .min(0, "Estimated Cost cannot be negative"),
  reason: z.string().optional(),
});

const RequestListTab = () => {
  // const { t } = useTranslation();
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [requisitionId, setRequisitionId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
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
    setValue,
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

  const endDateValue = watch("endDate");

  // Modal handlers
  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  const handleOpenNewRequest = useCallback(() => {
    reset(initialValues);
    setShowModal(true);
  }, [reset]);

  // API hooks
  const {
    useTrainingRequestQuery,
    usePendingTrainingRequestQuery,
    useApprovedTrainingRequestQuery,
    useTrainingRequestsByEmployeeIdQuery,
    trainingRequestStatusChangeMutation,
    deleteTrainingRequestMutation,
    addOrUpdateTrainingRequestMutation,
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

  const queryWithStatus = useMemo(
    () => ({
      ...queryParams,
      ...(!queryParams.statusId && {
        statusCode: "requisition_status_pending",
      }),
    }),
    [queryParams],
  );

  const { data: responseData, isLoading: isFetching } =
    useTrainingRequestQuery(queryWithStatus);

  const { data: pendingResponse } = usePendingTrainingRequestQuery(
    { limit: 100 },
    { enabled: pendingRequisitions }
  );

  const { data: approvedResponse } = useApprovedTrainingRequestQuery(
    { limit: 100 },
    { enabled: approveRequisitions }
  );

  const { data: allRequestsResponse } = useTrainingRequestQuery(
    { limit: 100 },
    { enabled: todayRequisitions || totalRequisitions }
  );

  const { data: historyResponse } = useTrainingRequestsByEmployeeIdQuery(
    selectedEmployee?.employee?.id,
    { limit: 100 },
    { enabled: showHistoryModal && !!selectedEmployee?.employee?.id }
  );

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

  const buildUsersFromList = useCallback((items = []) => {
    const uniqueById = new Map();

    items.forEach((item) => {
      const employee = item?.employee;
      const user = employee?.user;
      const fullName =
        user?.fullName ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        "Unknown User";
      const userId = user?.id ?? employee?.id ?? fullName;

      if (!uniqueById.has(userId)) {
        uniqueById.set(userId, {
          id: userId,
          name: fullName,
          fileUrl: user?.profile?.profilePicture?.url || user?.profilePicture?.url || "",
        });
      }
    });

    return Array.from(uniqueById.values());
  }, []);

  const todayRequestsData = useMemo(() => {
    const todayStr = helpers.dDateUtc(new Date());
    const sourceList = allRequestsResponse?.data?.list || dataArray.list || [];
    return (
      dataArray.headers?.today?.list ??
      dataArray.headers?.today?.data ??
      sourceList.filter((item) => {
        const itemDate = item.requisitionDate || item.preferredTrainingDate || item.createdAt;
        if (!itemDate) return false;
        return helpers.dDateUtc(itemDate) === todayStr;
      })
    );
  }, [dataArray.list, dataArray.headers, allRequestsResponse?.data?.list]);

  const pendingRequestsData = useMemo(
    () =>
      dataArray.list?.filter(
        (item) => item.status?.code === "requisition_status_pending",
      ) ?? [],
    [dataArray.list],
  );

  const totalRequestsData = useMemo(
    () => allRequestsResponse?.data?.list || dataArray.list || [], 
    [dataArray.list, allRequestsResponse?.data?.list]
  );

  const todayRequestUsers = useMemo(
    () => dataArray.headers?.today?.users ?? buildUsersFromList(todayRequestsData),
    [buildUsersFromList, todayRequestsData, dataArray.headers?.today?.users],
  );

  const pendingRequestUsers = useMemo(
    () => dataArray.headers?.pending?.users ?? buildUsersFromList(pendingRequestsData),
    [buildUsersFromList, pendingRequestsData, dataArray.headers?.pending?.users],
  );

  const totalRequestUsers = useMemo(
    () => dataArray.headers?.total?.users ?? buildUsersFromList(totalRequestsData),
    [buildUsersFromList, totalRequestsData, dataArray.headers?.total?.users],
  );

  const submitForm = async (values) => {
    if (addOrUpdateTrainingRequestMutation.isPending) return;
    await addOrUpdateTrainingRequestMutation.mutateAsync({
      ...values,
      startDate: values.startDate || null,
      endDate: values.endDate || null,
      start_date: values.startDate || null,
      end_date: values.endDate || null,
      trainingProvider: values.trainingProvider || null,
      locationName: values.locationName || null,
      reason: values.reason || null,
    });
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

  const handleView = useCallback((item) => {
    setSelectedEmployee(item);
    setShowHistoryModal(true);
  }, []);

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
    handleView,
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
      label: "Request Date",
      placeholder: "Filter by Request Date",
    },
    {
      component: "select",
      name: "statusId",
      label: "Select Request Status",
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
        <h1 className="title-color font-bold text-lg">Request List </h1>
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
            onClick={handleOpenNewRequest}
            variant="blue"
            className="gap-2"
            size="sm"
          >
            <BiPlus /> Add New
          </ButtonTw>

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
          users={todayRequestUsers}
          count={dataArray.headers?.today?.count ?? todayRequestsData.length}
          borderColor="border-l-green-500"
          onClick={() => setTodayRequisitions(true)}
        />
        <CardWithAvatars
          title="Pending Requests"
          users={pendingRequestUsers}
          count={dataArray.headers?.pending?.count ?? pendingRequestsData.length}
          borderColor="border-l-cyan-500"
          onClick={() => setPendingRequisitions(true)}
        />
        <CardWithAvatars
          title="Total Requests"
          users={totalRequestUsers}
          count={dataArray.headers?.total?.count ?? totalRequestsData.length}
          borderColor="border-l-orange-500"
          onClick={() => setTotalRequisitions(true)}
        />
      </div>

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Training Request`}
        size="2xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-12 gap-x-4 gap-y-1">
            <Controller
              control={control}
              name="itemDescription"
              render={({ field, fieldState }) => (
                <Input
                  label="Training Name"
                  placeholder="Select training or enter training name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6"
                  required
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="trainingType"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Training Type"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={[
                    { value: "Internal", label: "Internal" },
                    { value: "External", label: "External" },
                  ]}
                  placeholder="Select Training Type"
                  className="col-span-12 lg:col-span-6"
                  searchable={false}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="quantity"
              render={({ field, fieldState }) => (
                <Input
                  label="Number of Participants"
                  placeholder="Enter number of participants"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6"
                  type="number"
                  min={1}
                  required
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="startDate"
              render={({ field, fieldState }) => {
                return (
                  <DatePicker
                    label="Training Date Range"
                    mode="range"
                    value={[field.value, endDateValue].filter(Boolean)}
                    onChange={(selectedRange) => {
                      if (Array.isArray(selectedRange) && selectedRange.length === 2 && selectedRange[0] && selectedRange[1]) {
                        field.onChange(selectedRange[0]);
                        setValue("endDate", selectedRange[1], { shouldValidate: true, shouldDirty: true });
                      } else {
                        field.onChange("");
                        setValue("endDate", "", { shouldValidate: true, shouldDirty: true });
                      }
                    }}
                    error={fieldState.error?.message}
                    placeholder="Select start and end date"
                    className="col-span-12"
                    clearable
                  />
                );
              }}
            />

            <Controller
              control={control}
              name="trainingProvider"
              render={({ field, fieldState }) => (
                <Input
                  label="Training Provider"
                  placeholder="Enter provider name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="locationName"
              render={({ field, fieldState }) => (
                <Input
                  label="Location Name"
                  placeholder="Enter location (optional)"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6"
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
                  placeholder="Enter estimated cost"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6"
                  type="number"
                  min={0}
                  step="0.01"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="reason"
              render={({ field, fieldState }) => (
                <Input
                  type="textarea"
                  label="Reason / Purpose"
                  placeholder="Why is this training required?"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12"
                  rows={3}
                  {...field}
                />
              )}
            />

            <div className="w-full flex justify-center items-center gap-4 col-span-12">
              <ButtonTw
                type="button"
                size="sm"
                variant="outline.gray"
                className="w-full font-bold mt-4 "
                disabled={addOrUpdateTrainingRequestMutation.isPending}
                onClick={() => reset()}
              >
                Reset
              </ButtonTw>

              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-4 "
                disabled={
                  isLoading || addOrUpdateTrainingRequestMutation.isPending
                }
                loading={
                  isLoading || addOrUpdateTrainingRequestMutation.isPending
                }
              >
                Submit
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
      {/* History Modal */}
      <CardRequisitionsModal
        showModal={showHistoryModal}
        handleClose={() => setShowHistoryModal(false)}
        title={`${selectedEmployee?.employee?.user?.fullName || "Employee"}'s Training History`}
        data={historyResponse?.data?.list || []}
      />
      {/* Card Modal */}
      <CardRequisitionsModal
        showModal={todayRequisitions}
        handleClose={() => setTodayRequisitions(false)}
        title="Today's Training Requests"
        data={todayRequestsData}
      />
      <CardRequisitionsModal
        showModal={pendingRequisitions}
        handleClose={() => setPendingRequisitions(false)}
        title="Pending Training Requests"
        data={pendingResponse?.data?.list ?? pendingRequestsData}
      />
      <CardRequisitionsModal
        showModal={approveRequisitions}
        handleClose={() => setApproveRequisitions(false)}
        title="Approved Training Requests"
        data={approvedResponse?.data?.list ?? (dataArray.list?.filter(
          (item) => item.status?.code === "requisition_status_approved",
        ) ?? [])}
      />
      <CardRequisitionsModal
        showModal={totalRequisitions}
        handleClose={() => setTotalRequisitions(false)}
        title="Total Training Requests"
        data={totalRequestsData}
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
export default RequestListTab;
