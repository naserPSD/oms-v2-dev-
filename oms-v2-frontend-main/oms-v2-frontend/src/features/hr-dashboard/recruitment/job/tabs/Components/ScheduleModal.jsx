// src/features/hr-dashboard/recruitment/job/tabs/Components/ScheduleModal.jsx
"use client";

import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { zodResolver } from "@/utils/zodResolver";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

/* ─── Schema ─────────────────────────────────────────────────── */
const schema = z.object({
  id: z.coerce.number().optional(),
  jobVacancyId: z.coerce.number().min(1),
  jobApplicantId: z.coerce.number().min(1, "Applicant is required"),
  interviewerIds: z
    .array(z.coerce.number())
    .min(1, "At least one interviewer required"),
  scheduleDatetime: z.string().min(1, "Schedule date & time is required"),
  locationType: z.enum(["Office", "Online"]),
  url: z.string().optional(),
  officeId: z.coerce.number().optional(),
  interviewCompleted: z.boolean().optional(),
});

const LOCATION_OPTIONS = [
  { value: "Online", label: "Online" },
  { value: "Office", label: "Office" },
];

/* ─── Component ──────────────────────────────────────────────── */
const ScheduleModal = ({
  showModal,
  onClose,
  jobVacancyId,
  applicant, // selected applicant row
  existingSchedule, // prefill data if editing
}) => {
  const INITIAL = {
    id: 0,
    jobVacancyId: Number(jobVacancyId),
    jobApplicantId: applicant?.id ?? 0,
    interviewerIds: [],
    scheduleDatetime: "",
    locationType: "Online",
    url: "",
    officeId: null,
    interviewCompleted: false,
  };

  console.log("applicant :", applicant);

  const handleClose = useCallback(() => {
    reset(INITIAL);
    onClose();
  }, [onClose, jobVacancyId, applicant]);

  const { handleSubmit, control, reset, watch, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: INITIAL,
    mode: "onChange",
  });

  const { useOfficeListQuery, useJobInterviewersQuery } = useCommonQueryApi({
    reset,
    setError,
    handleClose,
  });

  const { data: officeList = [] } = useOfficeListQuery();

  const { data: jobInterviewers = [] } = useJobInterviewersQuery(jobVacancyId);

  const interviewerOptions = useMemo(() => {
    return jobInterviewers.map((item) => ({
      value: item.id,
      label: item?.employee?.user?.fullName || "N/A",
      designation: item?.employee?.designation?.name || "",
      avatarUrl: item?.employee?.user?.profile?.profilePicture?.fileUrl || "",
    }));
  }, [jobInterviewers]);

  const locationType = watch("locationType");



  useEffect(() => {
    if (!showModal) return;

    if (existingSchedule) {
      const interviewerIds =
        applicant?.jobApplicantInterviewers?.map(
          (iv) => iv?.jobInterviewerId,
        ) ?? [];

      reset({
        ...INITIAL,
        id: existingSchedule?.id,
        jobVacancyId: Number(jobVacancyId),
        jobApplicantId: applicant?.id ?? 0,

        interviewerIds, // ✅ PERFECT MATCH

        scheduleDatetime: existingSchedule?.scheduleDatetime
          ? new Date(existingSchedule.scheduleDatetime)
              .toISOString()
              .slice(0, 16)
          : "",

        locationType: existingSchedule?.locationType ?? "Online",
        url: existingSchedule?.url ?? "",
        officeId: existingSchedule?.officeId ?? null,

        interviewCompleted: existingSchedule?.interviewCompleted ?? false,
      });
    } else {
      reset({
        ...INITIAL,
        jobApplicantId: applicant?.id ?? 0,
      });
    }
  }, [showModal, existingSchedule, applicant, jobVacancyId]);

  /* queries */
  const { addOrUpdateScheduleMutation } = useHrQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal: () => {},
  });

  // const { data: employeeList = [] } = useAppEmployeeUsersQuery();

  // console.log("employeeList :",employeeList);

  const isLoading =
    addOrUpdateScheduleMutation?.isPending ??
    addOrUpdateScheduleMutation?.isLoading ??
    false;
  const isEdit = !!existingSchedule?.id;

  const submitForm = async (values) => {
    await addOrUpdateScheduleMutation.mutateAsync(values);
  };

  const applicantName = applicant
    ? `${applicant.firstName ?? ""} ${applicant.lastName ?? ""}`.trim()
    : "";

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title="Interview Schedule"
      size="2xl"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="grid grid-cols-12 gap-x-4">
          {/* Applicant info */}
          {applicantName && (
            <div className="col-span-12 mb-2">
              <p className="text-sm admin-text-muted">
                Scheduling interview for{" "}
                <span className="font-semibold text-primaryColor">
                  {applicantName}
                </span>
              </p>
            </div>
          )}

          {/* Location Type */}
          <Controller
            control={control}
            name="locationType"
            render={({ field, fieldState }) => (
              <SelectSearch
                label="Location Type"
                options={LOCATION_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
                placeholder="Select location type"
                disabled={applicant?.jobInterviewSchedule?.interviewCompleted}
              />
            )}
          />

          {/* Interview Link — show only for Online */}
          {locationType === "Online" && (
            <Controller
              control={control}
              name="url"
              render={({ field, fieldState }) => (
                <Input
                  label="Interview Link"
                  placeholder="https://meet.google.com/..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6"
                  disabled={applicant?.jobInterviewSchedule?.interviewCompleted}
                />
              )}
            />
          )}
          {/* Office Name */}
          {locationType === "Office" && (
            <Controller
              control={control}
              name="officeId"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Office Name"
                  options={officeList}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6"
                  placeholder="Select Office Name"
                  disabled={applicant?.jobInterviewSchedule?.interviewCompleted}
                />
              )}
            />
          )}

          {/* Schedule Datetime */}
          <Controller
            control={control}
            name="scheduleDatetime"
            render={({ field, fieldState }) => (
              <Input
                label="Date & Time"
                type="datetime-local"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
                disabled={applicant?.jobInterviewSchedule?.interviewCompleted}
              />
            )}
          />

          {/* Interviewers */}
          <Controller
            control={control}
            name="interviewerIds"
            render={({ field, fieldState }) => (
              <SelectSearch
                label="Interviewers"
                placeholder="Select interviewers"
                options={interviewerOptions} // ✅ FIXED
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
                labelKey="label"
                valueKey="value"
                avatarKey="avatarUrl"
                designationKey="designation"
                showAvatar
                showDesignation
                searchable
                multiple
                disabled={applicant?.jobInterviewSchedule?.interviewCompleted}
              />
            )}
          />
          {/* Mark as Completed */}
          <Controller
            control={control}
            name="interviewCompleted"
            render={({ field }) => (
              <SwitchButton
                label="Mark as Completed"
                enabled={field.value}
                onClick={() => field.onChange(!field.value)}
                enabledText="Yes"
                disabledText="No"
                className="col-span-12 lg:col-span-6 mt-2"
                disabled={applicant?.jobInterviewSchedule?.interviewCompleted}
              />
            )}
          />

          {/* Buttons */}
          <div className="col-span-12 flex gap-3 justify-end mt-4">
            <ButtonTw
              type="button"
              size="sm"
              variant="outline.gray"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </ButtonTw>
            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              disabled={
                isLoading || applicant?.jobInterviewSchedule?.interviewCompleted
              }
              loading={isLoading}
            >
              {isEdit ? "Update Schedule" : "Save Schedule"}
            </ButtonTw>
          </div>
        </div>
      </form>
    </ModalTw>
  );
};

export default ScheduleModal;
