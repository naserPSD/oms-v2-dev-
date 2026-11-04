"use client";

import { FormController as Controller } from "@/components/common/FormController";
import React, { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";

import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { Textarea } from "@/components/ui/textarea";

/* ─── Schema ───────────────────────── */
const schema = z.object({
  id: z.coerce.number().optional(),
  applicantId: z.coerce.number().min(1, "Applicant is required"),
  description: z.string().min(1, "Remark is required"),
});

/* ─── Component ───────────────────── */
const AddApplicantRemarksModal = ({ showModal, onClose, applicant }) => {
  const INITIAL = {
    id: 0,
    applicantId: applicant?.id ?? 0,
    description: "",
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

  const { addApplicantRemarkMutation } = useHrQueryApi({
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
    await addApplicantRemarkMutation.mutateAsync(values);
  };

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title="Add Applicant Remark"
      size="lg"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="grid grid-cols-12 gap-2">
          {/* Applicant Info */}
          {applicant && (
            <div className="col-span-12">
              <p className="text-lg admin-text-muted">
                Add Remark for{" "}
                <span className="font-semibold text-primaryColor">
                  {applicant?.name}
                </span>
              </p>
            </div>
          )}

          {/* Remark */}
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <Textarea
                label="Description"
                placeholder="Enter Description"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12"
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
              disabled={addApplicantRemarkMutation?.isLoading}
            >
              Cancel
            </ButtonTw>

            <ButtonTw
              type="submit"
              variant="default"
              size="sm"
              loading={addApplicantRemarkMutation?.isLoading}
              disabled={addApplicantRemarkMutation?.isLoading}
            >
              Add Remark
            </ButtonTw>
          </div>
        </div>
      </form>
    </ModalTw>
  );
};

export default AddApplicantRemarksModal;
