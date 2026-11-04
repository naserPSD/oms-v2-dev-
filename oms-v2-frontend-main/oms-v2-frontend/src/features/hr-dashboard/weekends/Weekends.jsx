"use client";
// 1️⃣ ======================= IMPORTS =======================
import { FormController as Controller } from "@/components/common/FormController";
import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import ButtonTw from "@/components/ui/ButtonTw";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SelectSearch from "@/components/ui/SelectSearch";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import { formatTime } from "@/utils/formatTime";
import helpers from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import { Building2, Calendar, Clock, Edit, MapPin, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";
import { useEmployeeInvitationFilters } from "../employee-invitation/hooks/useEmployeeInvitationFilters";

// 2️⃣ ======================= CONSTANTS / SCHEMA =======================

const initialValues = {
  id: 0,
  saturday: false,
  sunday: false,
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  officeId: null,
};
const schema = z.object({
  id: z.coerce.number().optional(),
  officeId: z.coerce.number().min(1, "Office is required"),
  saturday: z.boolean().optional().default(false),
  sunday: z.boolean().optional().default(false),
  monday: z.boolean().optional().default(false),
  tuesday: z.boolean().optional().default(false),
  wednesday: z.boolean().optional().default(false),
  thursday: z.boolean().optional().default(false),
  friday: z.boolean().optional().default(false),
});

const days = [
  { name: "saturday", label: "Saturday" },
  { name: "sunday", label: "Sunday" },
  { name: "monday", label: "Monday" },
  { name: "tuesday", label: "Tuesday" },
  { name: "wednesday", label: "Wednesday" },
  { name: "thursday", label: "Thursday" },
  { name: "friday", label: "Friday" },
];
// 3️⃣ ======================= COMPONENT =======================

const Weekends = () => {
  // const { t } = useTranslation();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;

  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  // const [currentPage, setCurrentPage] = useState(initialPage);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);

  // ⚡ Form
  const {
    // register,
    // formState: { errors },
    // setValue,
    handleSubmit,
    control,
    watch,
    reset,
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

  // 🧠 ---------- API HOOKS ----------
  const {
    useWeekendsQuery,
    addOrUpdateWeekendMutation,
    deleteWeekendMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  // API hooks
  const { useOfficeListQuery } = useCommonQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  const { data: officeList = [] } = useOfficeListQuery();
  // const { data: designationList = [] } = useDesignationListQuery();

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
  } = useEmployeeInvitationFilters(itemsPerPage);

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useWeekendsQuery(queryParams);

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
    return dataArray.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  // 📝 Create handler
  const submitForm = async (values) => {
    await addOrUpdateWeekendMutation.mutateAsync(values);
  };

  // 📝 Edit handler
  const handleEdit = useCallback(
    (item) => {
      reset(item);
      setShowModal(true);
    },
    [reset],
  );

  // 🧹 Delete handler
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
          await deleteWeekendMutation.mutateAsync(id);
        }
      });
    },
    [deleteWeekendMutation],
  );

  const getActiveDays = (item) => {
    return days.filter((day) => item[day.name]).map((day) => day.label);
  };

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Name, Email, Phone...",
    },
    {
      component: "select",
      name: "officeId",
      label: "Select Office",
      options: officeList || [],
      placeholder: "Filter by Office",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
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
      name: "status",
      label: "Select Status",
      options: dropdowns.activeInactiveList || [],
      placeholder: "Filter by Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
    },
  ];

  const isLoading =
    isFetching ||
    // addOrUpdatePersonalNoteMutation.isLoading ||
    deleteWeekendMutation.isLoading;
  // toggleArchivePersonalNoteMutation.isLoading ||
  // togglePinPersonalNoteMutation.isLoading;
  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Weekends List</h1>
        <div className="flex gap-2">
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
          >
            <BiPlus /> Add Weekends
          </ButtonTw>
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
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={"Add Weekends"}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
            <Controller
              name="officeId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Select Office"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={officeList || []}
                  placeholder="Select Office Here..."
                  className="col-span-1 lg:col-span-3 md:col-span-2"
                />
              )}
            />
            {days.map((day) => (
              <Controller
                key={day.name}
                name={day.name}
                control={control}
                render={({ field }) => (
                  <SwitchButton
                    label={day.label}
                    enabled={field.value}
                    onClick={() => field.onChange(!field.value)}
                    // enabledText="Weekend"
                    // disabledText="Working Day"
                  />
                )}
              />
            ))}
          </div>

          <div className="flex gap-4 mt-4">
            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              className="w-full font-bold"
              disabled={isLoading}
              loading={isLoading}
            >
              Save
            </ButtonTw>

            <ButtonTw
              type="button"
              size="sm"
              variant="outline.gray"
              className="w-full font-bold"
              onClick={() => reset()}
            >
              Reset
            </ButtonTw>
          </div>
        </form>
      </ModalTw>

      {/* Weekend Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {listData.map((item) => (
          <Card
            key={item.id}
            className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    {item.office?.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Office ID: {item.officeId}
                  </p>
                </div>
                {/* <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Active
                </Badge> */}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Weekend Days */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-red-500" />
                  Weekend Days:
                </div>
                <div className="flex flex-wrap gap-2">
                  {getActiveDays(item).map((day, index) => (
                    <span
                      key={index}
                      className="badge badge-pill badge-outline-danger"
                    >
                      {day}
                    </span>
                  ))}
                  {getActiveDays(item).length === 0 && (
                    <span className="text-sm text-gray-500">
                      No weekend days set
                    </span>
                  )}
                </div>
              </div>

              {/* Office Hours */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-purple-500" />
                  Office Hours:
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <span className="text-gray-600">Start:</span>
                    <div className="font-medium">
                      {formatTime(item.office?.startTime)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-600">End:</span>
                    <div className="font-medium">
                      {formatTime(item.office?.endTime)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex justify-between items-center pt-3 border-t">
                <div className="text-xs text-gray-500">
                  Created: {helpers.dDate(item.createdAt)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {listData.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Weekend Policies Found
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first weekend policy.
            </p>
            <Button onClick={() => setShowModal(true)}>
              <BiPlus className="mr-2" />
              Add Weekend Policy
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

export default Weekends;
