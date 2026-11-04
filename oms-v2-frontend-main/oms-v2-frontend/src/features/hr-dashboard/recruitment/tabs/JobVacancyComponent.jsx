// 1️⃣ ======================= IMPORTS =======================
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
import { jobListFilterConfig } from "./hooks/jobListFilterConfig";
import { useJobListFilters } from "./hooks/useJobListFilters";
import { useJobListTableColumn } from "./hooks/useJobListTableColumn";
import JobVacancyAddOrUpdateModal from "./components/JobVacancyAddOrUpdateModal";
import JobListTable from "./components/JobListTable";
import SetupRecruitmentStepsModal from "./components/SetupRecruitmentStepsModal";
import { ModalTw } from "@/components/common/ModalTw";
import ViewDetailsJobVacancyModal from "./modals/ViewDetailsJobVacancyModal";
import AssignInterviewersModal from "./modals/AssignInterviewersModal";
import CommonTable from "@/components/common/CommonTable";
import JobWeightsModal from "./components/JobWeightsModal";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

// 2️⃣ ======================= CONSTANTS / SCHEMA =======================

// Complete initialValues with all fields from your data
const initialValues = {
  id: 0,
  officeId: null,
  shiftId: null,
  jobTitle: "",
  noOfVacancies: "",
  jobCategoryId: null,
  // employmentStatusId: null,
  applicationDeadline: "",
  //  resumeReceivingOption: 1, // Added missing field
  //  specialInstruction: "",
  // requiredPhoto: false,
  // preferVideoResume: false,
  jobLevel: "", // Added missing field
  jobContext: "",
  jobResponsibilities: "",
  // workplace: "",
  minSalary: "",
  maxSalary: "",
  showSalaryRange: false,
  salaryNegotiable: false,
  //  additionalSalaryInfo: "", // Added missing field
  // preferredEduInstitute: "", // Added missing field
  //  othersEduQualification: "", // Added missing field
  //trainingAndTradeCourse: "", // Added missing field
  //  professionalCertification: "", // Added missing field
  // areaOfExperience: "", // Added missing field
  //  additionalRequirement: "",
  // skills: "",
  // minYearExperience: "",
  // maxYearExperience: "",
  // isApplyFresher: 0, // Added missing field
  // experienceRequired: 1, // Added missing field
  //  gender: "", // Added missing field
  // minAge: "",
  // maxAge: "",
};

// Complete Zod schema with all fields and validation
const schema = z
  .object({
    // Basic Information
    id: z.coerce.number().optional(),
    officeId: z.coerce.number().min(1, "Office is required"),
    shiftId: z.coerce.number().optional(),
    jobTitle: z.string().min(1, "Job Title is required"),
    noOfVacancies: z.coerce.number().min(1, "Vacancy is required"),
    jobCategoryId: z.coerce.number().min(1, "Job Category required"),
    //  employmentStatusId: z.coerce.number().min(1, "Employment Status required"),
    jobLevel: z.coerce.number().min(1, "Job Level is required"),
    // workplace: z.coerce.number().min(1, "Workplace is required"),
    // workplace: z.string().min("Workplace is required"),
    // Dates
    applicationDeadline: z.string().min(1, "Deadline required"),

    // Resume Options
    // resumeReceivingOption: z.coerce
    //   .number()
    //   .min(1, "Resume receiving option required"),
    // requiredPhoto: z.boolean(),
    // preferVideoResume: z.boolean(),

    // Job Details
    jobContext: z.string().min(1, "Job Context is required"),
    jobResponsibilities: z.string().min(1, "Job Responsibilities is required"),

    // Salary Information
    minSalary: z.coerce
      .number()
      .min(0, "Minimum salary must be positive")
      .optional(),
    maxSalary: z.coerce
      .number()
      .min(0, "Maximum salary must be positive")
      .optional(),
    showSalaryRange: z.boolean(),
    salaryNegotiable: z.boolean(),
    //  additionalSalaryInfo: z.string().optional(),

    // Educational Requirements
    // preferredEduInstitute: z.string().optional(),
    // othersEduQualification: z.string().optional(),
    // trainingAndTradeCourse: z.string().optional(),
    //  professionalCertification: z.string().optional(),
    // areaOfExperience: z.string().optional(),

    // Requirements
    // additionalRequirement: z.string().optional(),
    // skills: z.string().min(1, "Skills are required"),

    // Experience
    // minYearExperience: z.coerce
    //   .number()
    //   .min(0, "Minimum experience must be positive")
    //   .optional(),
    // maxYearExperience: z.coerce
    //   .number()
    //   .min(0, "Maximum experience must be positive")
    //   .optional(),
    // isApplyFresher: z.coerce.number().min(0).max(1),
    // experienceRequired: z.coerce.number().min(0).max(1),

    // Age and Gender
    // gender: z.string().optional(),
    // minAge: z.coerce
    //   .number()
    //   .min(18, "Minimum age must be at least 18")
    //   .optional(),
    // maxAge: z.coerce
    //   .number()
    //   .max(70, "Maximum age cannot exceed 70")
    //   .optional(),

    // Additional
    //  specialInstruction: z.string().optional(),
  })
  .refine(
    (data) => {
      // Validate min <= max for salary
      if (data.minSalary && data.maxSalary && data.minSalary > data.maxSalary) {
        return false;
      }
      return true;
    },
    {
      message: "Minimum salary cannot be greater than maximum salary",
      path: ["maxSalary"], // Error will be attached to maxSalary field
    },
  )
  .refine(
    (data) => {
      // Validate min <= max for experience
      if (
        data.minYearExperience &&
        data.maxYearExperience &&
        data.minYearExperience > data.maxYearExperience
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Minimum experience cannot be greater than maximum experience",
      path: ["maxYearExperience"],
    },
  )
  .refine(
    (data) => {
      // Validate min <= max for age
      if (data.minAge && data.maxAge && data.minAge > data.maxAge) {
        return false;
      }
      return true;
    },
    {
      message: "Minimum age cannot be greater than maximum age",
      path: ["maxAge"],
    },
  );

const recruitmentStepIdSchema = z.coerce.number().int().positive();

const recruitmentStepListItemSchema = z
  .object({
    id: recruitmentStepIdSchema,
    name: z.string().default(""),
  })
  .passthrough();

const addOrUpdateJobRecruitmentStepsPayloadSchema = z.object({
  jobId: z.coerce.number().int().positive(),
  jobVacancyId: z.coerce.number().int().positive(),
  jobRecruitmentStepNameIds: z.array(recruitmentStepIdSchema),
});

// 3️⃣ ======================= COMPONENT =======================

const JobVacancyComponent = () => {
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
  const [viewModal, setViewModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showSetupStepsModal, setShowSetupStepsModal] = useState(false);
  const [selectedSetupJob, setSelectedSetupJob] = useState(null);
  const [selectedStepIds, setSelectedStepIds] = useState([]);
  const [savedStepIdsByJob, setSavedStepIdsByJob] = useState({});
  const [allowApiPrefill, setAllowApiPrefill] = useState(false);
  const [showAssignInterviewersModal, setShowAssignInterviewersModal] =
    useState(false);
  const [selectedJobVacancyId, setSelectedJobVacancyId] = useState(null);
  const [selectedJobInterviewers, setSelectedJobInterviewers] = useState([]);
  const [selectedWeights, setSelectedWeights] = useState(null);
  const [jobId, setJObId] = useState(null);
  const [showJobWeightsModal, setShowJobWeightsModal] = useState(false);
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

  const handleView = (job) => {
    setSelectedJob(job);
    setViewModal(true);
  };

  const handleViewClose = () => {
    setViewModal(false);
    setSelectedJob(null);
  };

  // 🧠 ---------- API HOOKS ----------
  const {
    useJobVacancyQuery,
    useActiveJobRecruitmentStepNamesQuery,
    addOrUpdateJobRecruitmentStepsMutation,
    deleteJobVacancyMutation,
    addOrUpdateJobVacancyMutation,
    useJobWeightsQuery,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  // API hooks
  const {
    useOfficeListQuery,
    useJobCategoryListQuery,
    useDesignationListQuery,
    useDepartmentListQuery,
  } = useCommonQueryApi({ reset, setError, handleClose, setShowModal });

  const { data: officeList = [] } = useOfficeListQuery();
  const { data: jobCategoryList = [] } = useJobCategoryListQuery();
  const { data: designationList = [] } = useDesignationListQuery();
  const { data: departmentList = [] } = useDepartmentListQuery();

  const parseStepId = useCallback((rawValue) => {
    const parsed = recruitmentStepIdSchema.safeParse(rawValue);
    return parsed.success ? parsed.data : null;
  }, []);

  const extractSelectedStepIds = useCallback(
    (jobItem) => {
      if (!jobItem) {
        return [];
      }

      const toValidStepIds = (values = []) => {
        if (!Array.isArray(values)) {
          return [];
        }

        return values
          .map((item) =>
            parseStepId(
              typeof item === "object"
                ? (item?.jobRecruitmentStepNameId ??
                    item?.recruitmentStepNameId ??
                    item?.jobRecruitmentStepName?.id ??
                    item?.recruitmentStepName?.id ??
                    item?.stepId ??
                    item?.id)
                : item,
            ),
          )
          .filter(Boolean);
      };

      const fromCommaSeparated = (raw) => {
        if (typeof raw !== "string" || raw.trim() === "") {
          return [];
        }

        return raw
          .split(",")
          .map((item) => parseStepId(item.trim()))
          .filter(Boolean);
      };

      const directIds =
        jobItem?.jobRecruitmentStepNameIds ||
        jobItem?.jobRecruitmentStepNamesIds ||
        jobItem?.jobRecruitmentStepIds ||
        jobItem?.recruitmentStepIds ||
        jobItem?.recruitmentStepsIds ||
        jobItem?.stepIds ||
        [];

      const directIdList = toValidStepIds(directIds);
      if (directIdList.length > 0) {
        return directIdList;
      }

      const commaIdList = [
        ...fromCommaSeparated(jobItem?.jobRecruitmentStepNameIds),
        ...fromCommaSeparated(jobItem?.jobRecruitmentStepIds),
        ...fromCommaSeparated(jobItem?.stepIds),
      ];
      if (commaIdList.length > 0) {
        return commaIdList;
      }

      const relationList =
        jobItem?.jobRecruitmentSteps ||
        jobItem?.recruitmentSteps ||
        jobItem?.jobRecruitmentStepNames ||
        jobItem?.recruitmentStepNames ||
        jobItem?.jobRecruitmentStepMappings ||
        [];

      const relationIdList = toValidStepIds(relationList);
      if (relationIdList.length > 0) {
        return relationIdList;
      }

      // Last fallback: detect any keys that look like step-id collections.
      const candidateArrays = Object.entries(jobItem)
        .filter(([key, value]) => {
          const normalizedKey = key.toLowerCase();
          return (
            Array.isArray(value) &&
            normalizedKey.includes("step") &&
            (normalizedKey.includes("id") || normalizedKey.includes("name"))
          );
        })
        .map(([, value]) => value);

      for (const candidate of candidateArrays) {
        const ids = toValidStepIds(candidate);
        if (ids.length > 0) {
          return ids;
        }
      }

      return [];
    },

    [parseStepId],
  );

  const handleSetupRecruitmentSteps = useCallback(
    (job) => {
      // const jobKey = String(job?.id ?? "");
      // const hasLocalSavedSelection = Object.prototype.hasOwnProperty.call(
      //   savedStepIdsByJob,
      //   jobKey,
      // );

      // const extractedIds = extractSelectedStepIds(job);
      // const initialSelectedIds = hasLocalSavedSelection
      //   ? savedStepIdsByJob[jobKey]
      //   : extractedIds;

      // setAllowApiPrefill(!hasLocalSavedSelection && extractedIds.length === 0);

      setSelectedSetupJob(job);
      setSelectedStepIds(job.jobRecruitmentStepIds);
      setShowSetupStepsModal(true);
    },
    [extractSelectedStepIds, savedStepIdsByJob],
  );

  const handleCloseSetupRecruitmentStepsModal = useCallback(() => {
    setShowSetupStepsModal(false);
    setSelectedSetupJob(null);
    setSelectedStepIds([]);
    setAllowApiPrefill(false);
  }, []);

  const handleSaveRecruitmentSteps = useCallback(
    async (values = {}) => {
      const payload = {
        jobVacancyId: Number(values.jobVacancyId),
        jobRecruitmentStepIds: (values.jobRecruitmentStepIds || [])
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0),
      };
      await addOrUpdateJobRecruitmentStepsMutation.mutateAsync(payload);
      handleCloseSetupRecruitmentStepsModal();
    },
    [
      addOrUpdateJobRecruitmentStepsMutation,
      handleCloseSetupRecruitmentStepsModal,
    ],
  );

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
  } = useJobListFilters(itemsPerPage);

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  //Get Job Weights ......................................

  const { data: jobWeightsData, isLoading: jobWeightsLoading } =
    useJobWeightsQuery(queryParams);

  const jobWeightDataArray = useMemo(
    () => jobWeightsData?.data || [],
    [jobWeightsData?.data],
  );

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useJobVacancyQuery(queryParams);

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data],
  );

  const {
    data: activeStepsResponse,
    isLoading: isLoadingSteps,
  } = useActiveJobRecruitmentStepNamesQuery();

  const stepList = useMemo(() => {
    return (
      activeStepsResponse?.data?.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      }) || []
    );
  }, [activeStepsResponse]);

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
    await addOrUpdateJobVacancyMutation.mutateAsync(values);
  };

  // 🧠 Build filter config
  const employeeInvitationStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_invitation_statuses")
      ?.statuses ?? [];

  // 🧠 Build filter config
  const jobLevelOptions =
    dropdowns.statusGroupList?.find((s) => s.code === "job_levels")?.statuses ??
    [];

  const jobCategoryOptions = jobCategoryList?.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  // 🧠 Build filter config
  const workplaceOptions =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_invitation_statuses")
      ?.statuses ?? [];

  const resumeReceivingOptions =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_invitation_statuses")
      ?.statuses ?? [];

  const employeeStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_statuses")
      ?.statuses ?? [];

  // const attendanceStatus =
  //   dropdowns.statusGroupList?.find((s) => s.code === "asset_statuses")
  //     ?.statuses ?? [];

  const populatedDesignationList = useMemo(() => {
    if (filters.departmentId) {
      const findDepartment = departmentList.find(
        (item) => item.value === filters.departmentId,
      );

      if (findDepartment) {
        return designationList.filter(
          (item) => item.departmentId === findDepartment.value,
        );
      }
    }
    return [];
  }, [filters.departmentId, designationList, departmentList]);

  const filterConfig = useMemo(
    () =>
      jobListFilterConfig({
        officeList,
        departmentList,
        populatedDesignationList,
        employeeInvitationStatusList,
        employeeStatusList,
        activeInactiveList: dropdowns.activeInactiveList,
      }),
    [
      officeList,
      departmentList,
      populatedDesignationList,
      employeeInvitationStatusList,
      employeeStatusList,
      dropdowns.activeInactiveList,
    ],
  );

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
          await deleteJobVacancyMutation.mutateAsync(id);
        }
      });
    },
    [deleteJobVacancyMutation],
  );

  // ─────────────────────────────────────────────────────────────────────

  // 3️⃣ HANDLER — row থেকে id + existing interviewers দুটোই নাও
  const handleAssignInterviewers = useCallback(
    (jobVacancyId, jobInterviewers = []) => {
      setSelectedJobVacancyId(jobVacancyId);
      setSelectedJobInterviewers(jobInterviewers);
      setShowAssignInterviewersModal(true);
    },
    [],
  );

  const handleCloseAssignInterviewersModal = useCallback(() => {
    setShowAssignInterviewersModal(false);
    setSelectedJobVacancyId(null);
    setSelectedJobInterviewers([]);
  }, []);

  // ─────────────────────────────────────────────────────────────────────

  const handleViewWeights = (weights, jobId) => {
    setSelectedWeights(weights); // [] or data
    setJObId(jobId);
    setShowJobWeightsModal(true);
  };

  const handleWeightsClose = () => {
    setShowJobWeightsModal(false);
    setJObId(null);
    setSelectedWeights(null);
  };

  // 🧠 ---------- TABLE ----------
  const columns = useJobListTableColumn({
    handleEdit,
    handleDelete,
    handleView,
    handleSetupRecruitmentSteps,
    handleAssignInterviewers,
    jobWeightDataArray,
    handleViewWeights,
    hasPermission
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
    jobWeightsLoading ||
    addOrUpdateJobVacancyMutation.isLoading ||
    deleteJobVacancyMutation.isLoading;

  const isSavingSteps = addOrUpdateJobRecruitmentStepsMutation.isLoading;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Job Vacancy</h1>
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

          {hasPermission("hr.job_vacancy_add") && (
            <ButtonTw
              onClick={() => {
                const defaultCountry = dropdowns.countryList?.find((c) =>
                  c?.name?.toLowerCase().includes("bangladesh"),
                );
                reset({
                  ...initialValues,
                  countryId: defaultCountry?.id ?? initialValues.countryId,
                  phoneCountryId:
                    defaultCountry?.id ?? initialValues.phoneCountryId,
                });
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

      <CommonTable
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

      <JobVacancyAddOrUpdateModal
        showModal={showModal}
        handleClose={handleClose}
        isLoading={isLoading}
        reset={reset}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        control={control}
        watch={watch}
        jobCategoryOptions={jobCategoryOptions}
        employeeInvitationStatusList={employeeInvitationStatusList}
        jobLevelOptions={jobLevelOptions}
        workplaceOptions={workplaceOptions}
        resumeReceivingOptions={resumeReceivingOptions}
        genderOptions={dropdowns?.genderList}
      />

      <JobWeightsModal
        selectedWeights={selectedWeights}
        showModal={showJobWeightsModal}
        handleClose={handleWeightsClose}
        jobWeightsData={jobWeightsData}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        jobWeightsLoading={jobWeightsLoading}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        jobId={jobId}
        jobWeightDataArray={jobWeightDataArray}
      />

      <SetupRecruitmentStepsModal
        showModal={showSetupStepsModal}
        handleClose={handleCloseSetupRecruitmentStepsModal}
        // stepList={stepList}
        jobVacancyId={selectedSetupJob?.id}
        selectedStepIds={selectedStepIds}
        allowApiPrefill={allowApiPrefill}
        onSave={handleSaveRecruitmentSteps}
        isLoadingSteps={isSavingSteps}
      />

      <ViewDetailsJobVacancyModal
        viewModal={viewModal}
        handleViewClose={handleViewClose}
        selectedJob={selectedJob}
        officeList={officeList}
        jobCategoryList={jobCategoryList}
        jobLevelOptions={jobLevelOptions}
        stepList={stepList}
        statusGroupList={dropdowns?.statusGroupList}
        handleEdit={handleEdit}
        handleAssignInterviewers={handleAssignInterviewers}
        handleSetupRecruitmentSteps={handleSetupRecruitmentSteps}
      />
      <AssignInterviewersModal
        showModal={showAssignInterviewersModal}
        onClose={handleCloseAssignInterviewersModal}
        jobVacancyId={selectedJobVacancyId}
        existingInterviewers={selectedJobInterviewers}
      />
    </div>
  );
};

export default JobVacancyComponent;
