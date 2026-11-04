// src/features/hr-dashboard/job-vacancy/components/AssignInterviewersModal.jsx
"use client";

import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import SelectSearch from "@/components/ui/SelectSearch";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { zodResolver } from "@/utils/zodResolver";
import { useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { X } from "lucide-react";

/* ─── Schema ─────────────────────────────────────────────────── */
const schema = z.object({
  jobVacancyId: z.coerce.number().int().positive(),
  employeeIds: z
    .array(z.coerce.number())
    .min(1, "At least one interviewer is required"),
});

/* ─── Selected Interviewer Card ──────────────────────────────── */
const InterviewerCard = ({ employee, onRemove }) => {
  const avatarUrl = employee?.avatarUrl ?? null;
  const fullName = employee?.label ?? "Unknown";
  const designation = employee?.designation ?? "";
  const code = employee?.code ?? "";

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="relative flex items-center gap-3 p-3 rounded-xl
      border border-gray-200 dark:border-border
      bg-white dark:bg-white/[0.03]
      hover:border-primaryColor/30 dark:hover:border-primaryColor/20
      transition-colors group"
    >
      {/* Avatar */}
      <div
        className="shrink-0 w-10 h-10 rounded-full overflow-hidden
        border-2 border-white dark:border-card shadow-sm"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full bg-primaryColor/15 dark:bg-primaryColor/20
            flex items-center justify-center
            text-xs font-bold text-primaryColor"
          >
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold admin-text truncate">{fullName}</p>
        {designation && (
          <p className="text-xs admin-text-muted truncate">{designation}</p>
        )}
        {code && (
          <p className="text-[10px] admin-text-subtle font-medium">{code}</p>
        )}
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 w-5 h-5 rounded-full
          bg-gray-100 dark:bg-white/[0.06]
          hover:bg-red-100 dark:hover:bg-red-500/15
          text-gray-400 hover:text-red-500 dark:hover:text-red-400
          flex items-center justify-center
          transition-colors"
      >
        <X size={10} />
      </button>
    </div>
  );
};

/* ─── Main Modal ─────────────────────────────────────────────── */
const AssignInterviewersModal = ({
  showModal,
  onClose,
  jobVacancyId,
  existingInterviewers = [],
}) => {
  const handleClose = useCallback(() => {
    reset({ jobVacancyId: jobVacancyId ?? 0, employeeIds: [] });
    onClose();
  }, [jobVacancyId, onClose]);

  const { handleSubmit, control, reset, setError, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      jobVacancyId: jobVacancyId ?? 0,
      employeeIds: [],
    },
  });

  /* Pre-fill existing interviewers when modal opens */
  useEffect(() => {
    if (!showModal) return;
    const existingIds = existingInterviewers
      .filter((iv) => iv?.employee)
      .map((iv) => iv.employeeId);
    reset({
      jobVacancyId: jobVacancyId ?? 0,
      employeeIds: existingIds,
    });
  }, [showModal, jobVacancyId, existingInterviewers]);

  /* ── queries & mutations ── */
  const { useAppEmployeeUsersQuery, addOrUpdateJobInterviewersMutation } =
    useHrQueryApi({ reset, setError, handleClose, setShowModal: () => {} });

  const { data: employeeList = [] } = useAppEmployeeUsersQuery();

  /* watch selected ids to build cards */
  const selectedIds = useWatch({ control, name: "employeeIds" }) ?? [];

  /* build selected employee objects from employeeList */
  const selectedEmployees = selectedIds
    .map((id) =>
      employeeList.find((e) => e.value === id || e.value === String(id)),
    )
    .filter(Boolean);

  /* remove one employee from selection */
  const handleRemove = (empValue) => {
    const next = selectedIds.filter((id) => String(id) !== String(empValue));
    setValue("employeeIds", next, { shouldValidate: true });
  };

  const isLoading =
    addOrUpdateJobInterviewersMutation?.isPending ??
    addOrUpdateJobInterviewersMutation?.isLoading ??
    false;

  const isEdit = existingInterviewers.filter((iv) => iv?.employee).length > 0;

  /* ── submit ── */
  const submitForm = async (values) => {
    await addOrUpdateJobInterviewersMutation.mutateAsync({
      jobVacancyId: jobVacancyId,
      employeeIds: values.employeeIds,
    });
  };

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title={isEdit ? "Update Interviewers" : "Assign Interviewers"}
      size="xl"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="space-y-4">
          {/* Info */}
          <p className="text-sm admin-text-muted">
            {isEdit ? "Updating" : "Assigning"} interviewers for{" "}
            <span className="font-semibold admin-text">
              Vacancy #{jobVacancyId}
            </span>
          </p>

          {/* Employee multiselect */}
          <Controller
            control={control}
            name="employeeIds"
            render={({ field, fieldState }) => (
              <SelectSearch
                multiple={true}
                label="Select Interviewers"
                placeholder="Search and select employees"
                options={employeeList}
                value={field.value}
                onChange={field.onChange}
                showAvatar={true}
                showId={true}
                labelKey="label"
                valueKey="value"
                avatarKey="avatarUrl"
                designationKey="designation"
                showDesignation={true}
                idKeyName="code"
                idKeyLabel="Employee Code"
                error={fieldState.error?.message}
                searchable
              />
            )}
          />

          {/* ── Selected interviewer cards ── */}
          {selectedEmployees.length > 0 && (
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider
                admin-text-subtle mb-2"
              >
                Selected Interviewers ({selectedEmployees.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedEmployees.map((emp) => (
                  <InterviewerCard
                    key={emp.value}
                    employee={emp}
                    onRemove={() => handleRemove(emp.value)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-1">
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
              disabled={isLoading}
              loading={isLoading}
            >
              {isEdit ? "Update Interviewers" : "Assign Interviewers"}
            </ButtonTw>
          </div>
        </div>
      </form>
    </ModalTw>
  );
};

export default AssignInterviewersModal;
