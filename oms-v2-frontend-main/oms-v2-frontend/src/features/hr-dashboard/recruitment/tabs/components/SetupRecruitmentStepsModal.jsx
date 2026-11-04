import { FormController as Controller } from "@/components/common/FormController";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import { useForm } from "react-hook-form";
import CheckboxGroup from "@/components/ui/CheckboxGroup";
import { useRouter } from "next/navigation";
import { BiPlus } from "react-icons/bi";
import { ExternalLink } from "lucide-react";
import AddOrUpdateRecruitmentStep from "../modals/AddOrUpdateRecruitmentStep";

// Complete initialValues with all fields from your data
const initialValues = {
  id: 0,
  jobVacancyId: null,
  jobRecruitmentStepIds: [],
};

// Complete Zod schema with all fields and validation
const schema = z
  .object({
    // Basic Information
    id: z.coerce.number().optional(),
    jobVacancyId: z.coerce.number().int().positive({ message: "Job Vacancy is required" }),
    jobRecruitmentStepIds: z.array(z.coerce.number().int()).optional(),
  });

const SetupRecruitmentStepsModal = ({
  showModal,
  handleClose,
  // stepList,
  jobVacancyId,
  selectedStepIds,
  allowApiPrefill = false,
  onSave,
  // isLoadingSteps,
}) => {
  const router = useRouter();
  const [showAddStepModal, setShowAddStepModal] = useState(false);

  // ⚡ Form for setting up vacancy steps
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    reset,
    handleSubmit,
    control,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // ⚡ Form for quickly adding a new recruitment step
  const {
    handleSubmit: handleSubmitNewStep,
    reset: resetNewStep,
    control: controlNewStep,
    watch: watchNewStep,
  } = useForm({
    defaultValues: { id: 0, name: "" },
  });

  const {
    useActiveJobRecruitmentStepNamesQuery,
    useJobRecruitmentStepByIdQuery,
    useJobRecruitmentStepIdsByJobVacancyIdQuery,
    addOrUpdateJobRecruitmentStepMutation,
  } = useHrQueryApi({});

  const {
    data: activeStepsResponse,
    isLoading: isLoadingSteps,
    refetch: refetchActiveSteps,
  } = useActiveJobRecruitmentStepNamesQuery();

  const handleRedirectToStepList = useCallback(() => {
    handleClose?.();
    router.push(
      "/hr-dashboard/recruitment?tab=job_recruitment_step_names&page=1&limit=10",
    );
  }, [router, handleClose]);

  const handleAddNewStepSubmit = async (values) => {
    if (!values?.name?.trim()) return;
    const res = await addOrUpdateJobRecruitmentStepMutation.mutateAsync({
      name: values.name.trim(),
    });
    resetNewStep({ id: 0, name: "" });
    setShowAddStepModal(false);
    await refetchActiveSteps?.();
    const newStepId = res?.data?.id || res?.id;
    if (newStepId) {
      const current = watch("jobRecruitmentStepIds") || [];
      setValue("jobRecruitmentStepIds", [...current, Number(newStepId)]);
    }
  };

  // const { data: stepByIdResponse } = useJobRecruitmentStepByIdQuery(
  //   jobVacancyId,
  //   showModal,
  // );

  const {
    data: jobRecruitmentStepIdsResponse,
    refetch: refetchJobStepIds,
  } = useJobRecruitmentStepIdsByJobVacancyIdQuery(jobVacancyId);

  useEffect(() => {
    if (showModal) {
      refetchActiveSteps?.();
      if (jobVacancyId) {
        refetchJobStepIds?.();
      }
    }
  }, [showModal, jobVacancyId, refetchActiveSteps, refetchJobStepIds]);

  useEffect(() => {
    if (!showModal || !jobVacancyId) return;

    const idsFromProps = (Array.isArray(selectedStepIds) ? selectedStepIds : [])
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);

    const idsFromApi = Array.isArray(jobRecruitmentStepIdsResponse?.data)
      ? jobRecruitmentStepIdsResponse.data
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0)
      : null;

    const finalIds = idsFromApi !== null ? idsFromApi : idsFromProps;

    reset({
      ...initialValues,
      jobVacancyId: Number(jobVacancyId) || null,
      jobRecruitmentStepIds: finalIds,
    });
  }, [
    showModal,
    jobVacancyId,
    selectedStepIds,
    jobRecruitmentStepIdsResponse?.data,
    reset,
  ]);

  // Modal handlers
  const closeModal = useCallback(() => {
    reset(initialValues);
    handleClose();
  }, [handleClose, reset]);

  const submitForm = async (values) => {
    onSave?.({
      jobVacancyId: Number(values.jobVacancyId),
      jobRecruitmentStepIds: (values.jobRecruitmentStepIds || [])
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    });
  };

  const stepList = useMemo(() => {
    return activeStepsResponse?.data?.map(item => {
      return {
        value: Number(item.id),
        label: item.name
      }
    }) || [];
  }, [activeStepsResponse]);

  console.log("stepList========", stepList);

  const jobRecruitmentStepIds = watch("jobRecruitmentStepIds");

  console.log("jobRecruitmentStepIds========", jobRecruitmentStepIds);

  return (
    <ModalTw
      show={showModal}
      onClose={closeModal}
      title="Setup Recruitment Steps"
      subTitle="Select your recruitment steps for further process to this job vacancy"
      size="lg"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >

      <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Recruitment Step Name List
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStepModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primaryColor hover:text-white px-2.5 py-1 rounded-md bg-primaryColor/10 dark:bg-primaryColor/20 hover:bg-primaryColor dark:hover:bg-primaryColor border border-primaryColor/30 dark:border-primaryColor/40 transition-all shadow-xs"
                >
                  <BiPlus size={14} />
                  <span>Add Step</span>
                </button>
                <button
                  type="button"
                  onClick={handleRedirectToStepList}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:text-primaryColor dark:hover:text-white px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-xs"
                >
                  <ExternalLink size={12} />
                  <span>View List</span>
                </button>
              </div>
            </div>

            {isLoadingSteps ? (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/60 dark:bg-gray-900/40 px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                Loading recruitment steps...
              </div>
            ) : stepList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700/80 p-6 text-center space-y-3 bg-gray-50/70 dark:bg-gray-900/40">
                <div className="w-11 h-11 rounded-xl bg-primaryColor/10 dark:bg-primaryColor/25 border border-primaryColor/25 dark:border-primaryColor/40 text-primaryColor flex items-center justify-center mx-auto shadow-xs">
                  <BiPlus size={22} className="text-primaryColor" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    No recruitment steps found
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    Add recruitment steps (e.g. MCQ, Written, Viva) to configure this opening&apos;s hiring pipeline.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2.5 pt-2">
                  <ButtonTw
                    type="button"
                    size="xs"
                    variant="default"
                    onClick={() => setShowAddStepModal(true)}
                    className="font-semibold shadow-sm"
                  >
                    <BiPlus size={14} className="mr-1" /> Add Step Now
                  </ButtonTw>
                  <button
                    type="button"
                    onClick={handleRedirectToStepList}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primaryColor dark:hover:text-white transition-all shadow-xs"
                  >
                    <ExternalLink size={13} />
                    <span>View Full List</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-900/30 p-3">
                <Controller
                  control={control}
                  name="jobRecruitmentStepIds"
                  render={({ field }) => (
                    <CheckboxGroup
                      options={stepList}
                      selectedValues={field.value}
                      onChange={field.onChange}
                      name="steps"
                      size="md"
                      color="primary"
                      circular={false}
                      disabled={false}
                    />
                  )}
                />
              </div>
            )}
          </div>

          <div className="col-span-12 flex justify-center items-center gap-4 mt-4">
            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              className="w-full font-bold"
              disabled={isLoadingSteps}
            >
              Submit
            </ButtonTw>

            <ButtonTw
              type="button"
              size="sm"
              variant="outline.gray"
              className="w-full font-bold"
              onClick={handleClose}
            >
              Cancel
            </ButtonTw>
          </div>
        </div>
      </form>

      <AddOrUpdateRecruitmentStep
        showModal={showAddStepModal}
        handleClose={() => {
          resetNewStep({ id: 0, name: "" });
          setShowAddStepModal(false);
        }}
        isLoading={addOrUpdateJobRecruitmentStepMutation.isLoading}
        reset={resetNewStep}
        handleSubmit={handleSubmitNewStep}
        submitForm={handleAddNewStepSubmit}
        control={controlNewStep}
        watch={watchNewStep}
      />
    </ModalTw>
  );
};

export default SetupRecruitmentStepsModal;
