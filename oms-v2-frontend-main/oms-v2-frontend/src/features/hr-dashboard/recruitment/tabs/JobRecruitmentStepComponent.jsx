// 1️⃣ ======================= IMPORTS =======================
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
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
import { useJobRecruitmentStepFilter } from "./hooks/useJobRecruitmentStepFilter";
import { useRecruitmentStepTableColumn } from "./hooks/useRecruitmentStepTableColumn";
import RecruitmentTable from "./components/RecruitmentTable";
import AddOrUpdateRecruitmentStep from "./modals/AddOrUpdateRecruitmentStep";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

// 2️⃣ ======================= CONSTANTS / SCHEMA =======================
const initialValues = {
  id: 0,
  name: "",
};

const schema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Name is required").max(255),
});

// 3️⃣ ======================= COMPONENT =======================

const JobRecruitmentStepComponent = () => {
  // 🧠 ---------- STORES / HOOKS / STATES ----------
  // const { t } = useTranslation();
  const { hasPermission } = useCommonFunctions();
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

  // 🧠 ---------- API HOOKS ----------
  const {
    jobRecruitmentStepsQuery,
    addOrUpdateJobRecruitmentStepMutation,
    deleteJobRecruitmentStepMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  // API hooks
  // const {
  //  // useOfficeListQuery,
  //   useDesignationListQuery,
  //   useDepartmentListQuery,
  // } = useCommonQueryApi({ reset, setError, handleClose, setShowModal });

  // const { data: officeList = [] } = useOfficeListQuery();
  // const { data: designationList = [] } = useDesignationListQuery();
  // const { data: departmentList = [] } = useDepartmentListQuery();

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
  } = useJobRecruitmentStepFilter(itemsPerPage);

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
    jobRecruitmentStepsQuery(queryParams);

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

  const submitForm = async (values) => {
    const parsedId = Number(values?.id);
    const payload = {
      name: values?.name?.trim(),
      id: Number.isInteger(parsedId) && parsedId > 0 ? parsedId : 0,
    };

    await addOrUpdateJobRecruitmentStepMutation.mutateAsync(payload);
  };

  // 🧠 Build filter config
  // const employeeInvitationStatusList =
  //   dropdowns.statusGroupList?.find((s) => s.code === "emp_invitation_statuses")
  //     ?.statuses ?? [];
  // const employeeStatusList =
  //   dropdowns.statusGroupList?.find((s) => s.code === "emp_statuses")
  //     ?.statuses ?? [];

  //   const attendanceStatus =
  //     dropdowns.statusGroupList?.find((s) => s.code === "asset_statuses")
  //       ?.statuses ?? [];

  // const populatedDesignationList = useMemo(() => {
  //   if (filters.departmentId) {
  //     const findDepartment = departmentList.find(
  //       (item) => item.value === filters.departmentId,
  //     );

  //     if (findDepartment) {
  //       return designationList.filter(
  //         (item) => item.departmentId === findDepartment.value,
  //       );
  //     }
  //   }
  //   return [];
  // }, [filters.departmentId, designationList, departmentList]);

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Name, Email, Phone...",
    },
    // {
    //   component: "datePicker",
    //   name: "startDate",
    //   label: "Created Date",
    //   placeholder: "Filter by Created Date",
    // },
    // {
    //   component: "select",
    //   name: "officeId",
    //   label: "Select Office",
    //   options: officeList || [],
    //   placeholder: "Filter by Office",
    //   className: "col-span-12 lg:col-span-3 sm:col-span-12",
    // },
    // {
    //   component: "select",
    //   name: "departmentId",
    //   label: "Select Department",
    //   options: departmentList || [],
    //   placeholder: "Filter by Department",
    //   className: "col-span-12 lg:col-span-3 sm:col-span-12",
    // },
    // {
    //   component: "select",
    //   name: "designationId",
    //   label: "Select Designation",
    //   options: populatedDesignationList || [],
    //   placeholder: "Filter by Designation",
    //   className: "col-span-12 lg:col-span-3 sm:col-span-12",
    // },
    // {
    //   component: "select",
    //   name: "employmentStatusId",
    //   label: "Select Employment Status",
    //   options: employeeInvitationStatusList || [],
    //   placeholder: "Filter by Employment Status",
    //   className: "col-span-12 lg:col-span-3 sm:col-span-12",
    // },
    // {
    //   component: "select",
    //   name: "employeeStatusId",
    //   label: "Select Employee Status",
    //   options: employeeStatusList || [],
    //   placeholder: "Filter by Employee Status",
    //   className: "col-span-12 lg:col-span-3 sm:col-span-12",
    // },
    // {
    //   component: "select",
    //   name: "status",
    //   label: "Select Status",
    //   options: activeInactiveList || [],
    //   placeholder: "Filter by Status",
    //   className: "col-span-12 lg:col-span-3 sm:col-span-12",
    // },
    {
      component: "clear",
    },
  ];

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
          await deleteJobRecruitmentStepMutation.mutateAsync(id);
        }
      });
    },
    [deleteJobRecruitmentStepMutation],
  );

  // 🧠 ---------- TABLE ----------
  // 🧠 Custom hook for TanStack Table columns
  const columns = useRecruitmentStepTableColumn({
    handleEdit,
    handleDelete,
    hasPermission,
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
    addOrUpdateJobRecruitmentStepMutation.isLoading ||
    deleteJobRecruitmentStepMutation.isLoading;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">
          Job Recruitment Step Name
        </h1>
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
          {hasPermission("hr.job_recruitment_step_name_add") && (
            <ButtonTw
              onClick={() => {
                reset(initialValues);
                setShowModal(true);
              }}
              variant="blue"
              className="gap-2"
            >
              <BiPlus /> Add New
            </ButtonTw>
          )}
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

      <RecruitmentTable
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

      <AddOrUpdateRecruitmentStep
        showModal={showModal}
        handleClose={handleClose}
        isLoading={isLoading}
        reset={reset}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        control={control}
        watch={watch}
      />
    </div>
  );
};

export default JobRecruitmentStepComponent;
