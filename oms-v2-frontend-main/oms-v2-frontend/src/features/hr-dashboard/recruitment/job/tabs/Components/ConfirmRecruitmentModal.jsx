"use client";

import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import DatePicker from "@/components/ui/DatePicker";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { zodResolver } from "@/utils/zodResolver";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

/* ─── Schema ───────────────────────── */
const schema = z.object({
  applicantId: z.coerce.number().min(1, "Applicant is required"),
  currentBasicSalary: z.coerce.number().min(1, "Salary is required"),
  employeeCode: z.string().min(1, "Employee code is required"),
  designationId: z.coerce.number().min(1, "Designation is required"),
  officeId: z.coerce.number().min(1, "Office is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
});

/* ─── Component ───────────────────── */
const ConfirmRecruitmentModal = ({ showModal, onClose, applicant }) => {
  const INITIAL = {
    applicantId: applicant?.id ?? 0,
    currentBasicSalary: "",
    employeeCode: "",
    designationId: null,
    officeId: null,
    joiningDate: "",
  };

  const handleClose = useCallback(() => {
    reset(INITIAL);
    onClose();
  }, [onClose, applicant]);

  const { handleSubmit, control, reset, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: INITIAL,
    mode: "onChange",
  });

  /* ─── Queries ───────────────────── */
  const { useOfficeListQuery, useDesignationListQuery } = useCommonQueryApi({
    reset,
    setError,
    handleClose,
  });

  const { data: officeList = [] } = useOfficeListQuery();
  const { data: designationList = [] } = useDesignationListQuery();

  const { confirmRecruitmentMutation } = useHrQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal: () => {},
  });

  /* ─── Prefill ───────────────────── */
  useEffect(() => {
    if (!showModal) return;

    reset({
      ...INITIAL,
      applicantId: applicant?.id ?? 0,
    });
  }, [showModal, applicant]);

  /* ─── Submit ───────────────────── */
  const submitForm = async (values) => {
    await confirmRecruitmentMutation.mutateAsync(values);
  };

  const applicantName = applicant
    ? `${applicant.firstName ?? ""} ${applicant.lastName ?? ""}`.trim()
    : "";

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title="Confirm Recruitment"
      size="xl"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="grid grid-cols-12 gap-2">
          {/* Applicant Info */}
          {applicantName && (
            <div className="col-span-12">
              <p className="text-sm admin-text-muted">
                Confirm recruitment for{" "}
                <span className="font-semibold text-primaryColor">
                  {applicantName}
                </span>
              </p>
            </div>
          )}

          {/* Employee Code */}
          <Controller
            control={control}
            name="employeeCode"
            render={({ field, fieldState }) => (
              <Input
                label="Employee Code"
                placeholder="EMP-001"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
              />
            )}
          />

          {/* Salary */}
          <Controller
            control={control}
            name="currentBasicSalary"
            render={({ field, fieldState }) => (
              <Input
                type="number"
                label="Current Basic Salary"
                placeholder="Enter salary"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
              />
            )}
          />

          {/* Designation */}
          <Controller
            control={control}
            name="designationId"
            render={({ field, fieldState }) => (
              <SelectSearch
                label="Designation"
                options={designationList}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
                placeholder="Select designation"
              />
            )}
          />

          {/* Office */}
          <Controller
            control={control}
            name="officeId"
            render={({ field, fieldState }) => (
              <SelectSearch
                label="Office"
                options={officeList}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
                placeholder="Select office"
              />
            )}
          />

          {/* Joining Date */}
          <Controller
            control={control}
            name="joiningDate"
            render={({ field, fieldState }) => (
              <DatePicker
                type="date"
                label="Joining Date"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12 lg:col-span-6"
              />
            )}
          />

          {/* Buttons */}
          <div className="col-span-12 flex justify-end gap-3 mt-4">
            <ButtonTw
              type="button"
              variant="outline.gray"
              size="sm"
              onClick={handleClose}
              disabled={confirmRecruitmentMutation?.isLoading}
            >
              Cancel
            </ButtonTw>

            <ButtonTw
              type="submit"
              variant="default"
              size="sm"
              loading={confirmRecruitmentMutation?.isLoading}
              disabled={confirmRecruitmentMutation?.isLoading}
            >
              Confirm Recruitment
            </ButtonTw>
          </div>
        </div>
      </form>
    </ModalTw>
  );
};

export default ConfirmRecruitmentModal;
