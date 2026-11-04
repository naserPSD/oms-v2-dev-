// src/features/hr-dashboard/recruitment/job/tabs/AllApplicantsTab.jsx
"use client";

import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
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
import ViewJobApplicantModal from "../../tabs/modals/ViewJobApplicantModal";
import ApplicantsStatusChangedModal from "./ApplicantsStatusChangedModal";
import AddOrUpdateApplicantModal from "./Components/AddOrUpdateApplicantModal";
import { useJobApplicantColumns } from "./hooks/useJobApplicantColumns";
import { useJobApplicantFilters } from "./hooks/useJobApplicantFilters";

/* ─── Schema ─────────────────────────────────────────────────── */
const schema = z.object({
  id: z.coerce.number().optional(),
  jobVacancyId: z.coerce.number().min(1, "Job vacancy is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    .regex(/^\d+$/, "Phone must contain only digits"),
  phoneCountryId: z.coerce.number().min(1, "Country code is required"),
  expectedSalary: z.coerce.number().optional(),
  summary: z.string().optional(),
  // cvMediaId: z.any().optional(),
  cvFile: z.any().optional(),
});

/* ─── Component ──────────────────────────────────────────────── */
const AllApplicantsTab = ({ jobId }) => {
  const searchParams = useSearchParams();
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);

  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    () => localStorage.getItem("applicantFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalData, setModalData] = useState({
    applicantId: null,
    applicantName: null,
    nextStep: null,
  });

  /* ── Filter hook (extracted) ── */
  const {
    filters,
    globalFilter,
    setGlobalFilter,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearAllFilters,
    queryParams,
  } = useJobApplicantFilters(itemsPerPage, jobId);

  /* ── Form ── */
  const INITIAL_VALUES = {
    id: 0,
    jobVacancyId: Number(jobId),
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneCountryId: null,
    // expectedSalary: null,
    summary: "",
    // cvMediaId: null,
    cvFile: null,
    jobRecruitmentStepNameId: null,
    // officeId: null,
    // employeeId: null,
    // jobInterviewScheduleId: null,
    // interviewRating: null,
  };

  const { handleSubmit, setError, control, reset, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: INITIAL_VALUES,
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    reset(INITIAL_VALUES);
    setShowModal(false);
  }, [reset, jobId]);

  const handleEdit = useCallback(
    (row) => {
      reset({ ...INITIAL_VALUES, ...row, jobVacancyId: Number(jobId) });
      setShowModal(true);
    },
    [reset, jobId],
  );

  /* ── API hooks ── */
  const { useOfficeListQuery } = useCommonQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });
  const { data: officeList = [] } = useOfficeListQuery();

  const {
    useJobApplicantsQuery,
    addOrUpdateJobApplicantMutation,
    deleteJobApplicantMutation,
    useJobRecruitmentStepsByVacancyIdQuery,
    updateJobApplicantRecruitmentStatusMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  const { data: stepsResponse, isLoading: isLoadingSteps } =
    useJobRecruitmentStepsByVacancyIdQuery(jobId);

  const steps = useMemo(() => {
    let list = [];
    if (Array.isArray(stepsResponse)) list = stepsResponse;
    else if (Array.isArray(stepsResponse?.data)) list = stepsResponse.data;
    else if (Array.isArray(stepsResponse?.data?.data)) list = stepsResponse.data.data;
    else if (Array.isArray(stepsResponse?.items)) list = stepsResponse.items;
    else if (Array.isArray(stepsResponse?.results)) list = stepsResponse.results;

    return list
      .map((item) => ({
        ...item,
        stepId: item?.stepId ?? item?.step?.id ?? item?.id,
        stepName: item?.stepName ?? item?.step?.name ?? item?.name ?? "",
      }))
      .filter((s) => s.stepId && s.stepName);
  }, [stepsResponse]);

  const { data: responseData, isLoading: isFetching } =
    useJobApplicantsQuery(queryParams);

  const dataArray = useMemo(() => responseData?.data || [], [responseData]);
  const pagination = useMemo(
    () =>
      responseData?.pagination || { page: 1, total: 0, limit: 10, lastPage: 1 },
    [responseData],
  );

  const listData = useMemo(
    () =>
      dataArray.map((item, i) => ({
        ...item,
        sl: (currentPage - 1) * itemsPerPage + i + 1,
      })),
    [dataArray, currentPage, itemsPerPage],
  );

  /* ── Submit ── */

  const submitForm = async (values) => {
    const phoneCountry = dropdowns?.countryList?.find(
      (c) => Number(c.id) === Number(values.phoneCountryId),
    );
    const callingCodeDigits = String(phoneCountry?.callingCode || "").replace(
      /\D/g,
      "",
    );
    const phoneDigits = String(values.phone || "").trim();

    if (!phoneCountry || !callingCodeDigits) {
      setError("phoneCountryId", {
        type: "manual",
        message: "Country code is required",
      });
      return;
    }
    if (!/^\d+$/.test(phoneDigits)) {
      setError("phone", {
        type: "manual",
        message: "Phone must contain only digits",
      });
      return;
    }
    const maxLocalDigits = Math.max(1, 15 - callingCodeDigits.length);
    if (phoneDigits.length > maxLocalDigits) {
      setError("phone", {
        type: "manual",
        message: `Phone is too long (max ${maxLocalDigits} digits)`,
      });
      return;
    }

    const mergeData = {
      ...values,
      phone: phoneDigits,
      jobVacancyId: Number(jobId),
      id: values.id ?? 0,
    };

    const formData = new FormData();

    Object.entries(mergeData).forEach(([key, value]) => {
      if (key === "cvFile") {
        if (value) {
          formData.append("cvFile", value);
        }
      } else {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      }
    });

    await addOrUpdateJobApplicantMutation.mutateAsync(formData);
  };

  /* ── Delete ── */
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
        if (result.isConfirmed)
          await deleteJobApplicantMutation.mutateAsync(id);
      });
    },
    [deleteJobApplicantMutation],
  );

  const handleStatusFrom = async (payloadFromModal) => {
    try {
      await updateJobApplicantRecruitmentStatusMutation.mutateAsync(
        payloadFromModal,
      );
      setShowStatusModal(false);
    } catch (error) {
      console.error("Status update failed:", error);
      // optional: error toast
    }
  };

  const handleView = (applicant) => {
    setSelectedApplicant(applicant);
    setViewModal(true);
  };
  const handleViewClose = () => {
    setViewModal(false);
    setSelectedApplicant(null);
  };
  const handleViewCV = (fileUrl) => window.open(fileUrl, "_blank");

  const handleStatusChange = (item, nextStep) => {
    const fullName =
      `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim() || "-";

    setModalData({
      applicantId: item.id,
      applicantName: fullName,
      nextStep: nextStep, // এইটা dynamic হবে
    });

    setShowStatusModal(true);
  };

  /* ── Columns ── */
  const columns = useJobApplicantColumns({
    handleEdit,
    handleDelete,
    handleView,
    handleViewCV,
    handleStatusChange,
    steps,
  });

  /* ── Table ── */
  const table = useReactTable({
    data: listData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const toggleFilter = () =>
    setShowFilter((p) => {
      const next = p === "show" ? "hide" : "show";
      localStorage.setItem("applicantFilter", next);
      return next;
    });

  const isLoading =
    isFetching || addOrUpdateJobApplicantMutation.isLoading || isLoadingSteps;

  /* ── Filter config ── */
  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search by name, email…",
      className: "col-span-12 lg:col-span-4",
    },
    {
      component: "select",
      name: "officeId",
      label: "Select Office",
      options: officeList || [],
      placeholder: "Filter by Office",
      className: "col-span-12 lg:col-span-3",
    },
    { component: "clear" },
  ];

  /* ── Render ── */
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            All Applicants
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
            {pagination.total} applicant{pagination.total !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="flex gap-2">
          <SimpleTooltip
            text={showFilter === "show" ? "Hide filters" : "Show filters"}
          >
            <ButtonTw
              onClick={toggleFilter}
              variant="alternative"
              className="gap-2"
            >
              <FaFilter size={13} />
            </ButtonTw>
          </SimpleTooltip>
          <ButtonTw
            onClick={() => setShowModal(true)}
            variant="blue"
            className="gap-2"
          >
            <BiPlus size={16} /> Add New
          </ButtonTw>
        </div>
      </div>

      {/* Filters */}
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="rounded-xl overflow-hidden shadow-sm [&_.table-container]:border-gray-200 dark:[&_.table-container]:border-gray-700 [&_.table-container]:rounded-xl">
        <CommonTable
          table={table}
          isFetching={isFetching}
          itemsPerPage={itemsPerPage}
          columns={columns}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={pagination.total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Modals */}
      <AddOrUpdateApplicantModal
        showModal={showModal}
        handleClose={handleClose}
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        control={control}
        watch={watch}
        reset={reset}
        dropdowns={dropdowns}
      />

      <ApplicantsStatusChangedModal
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSubmit={handleStatusFrom}
        modalData={modalData} // 👈 এখন এখানে dynamic data
        isLoading={updateJobApplicantRecruitmentStatusMutation?.isLoading}
      />

      <ViewJobApplicantModal
        viewModal={viewModal}
        handleViewClose={handleViewClose}
        selectedApplicant={selectedApplicant}
      />
    </div>
  );
};

export default AllApplicantsTab;
