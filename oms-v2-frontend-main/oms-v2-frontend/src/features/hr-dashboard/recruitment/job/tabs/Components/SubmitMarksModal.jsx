// src/features/hr-dashboard/recruitment/job/tabs/Components/SubmitMarksModal.jsx
"use client";

import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useAuthStore } from "@/store/useAuthStore";
import { zodResolver } from "@/utils/zodResolver";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

/* ─── Schema ─────────────────────────────────────────────────── */
const markSchema = z.object({
  markings: z.array(
    z.object({
      jobInterviewWeightId: z.number(),
      weightName: z.string(),
      weightValue: z.number(),
      weightMarking: z
        .string()
        .refine((val) => val === "" || !isNaN(Number(val)), {
          message: "Must be a number",
        })
        .refine((val) => val === "" || Number(val) >= 0, {
          message: "Must be >= 0",
        }),
    }),
  ),
});

/* ─── Component ──────────────────────────────────────────────── */
const SubmitMarksModal = ({ showModal, onClose, scheduleId }) => {
  const authUser = useAuthStore((state) => state.user);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const { useWeightDistributionQuery, submitMarksMutation } = useHrQueryApi({
    handleClose,
  });

  const { data: response, isLoading } = useWeightDistributionQuery(
    showModal ? scheduleId : null,
  );

  const matrix = response?.data?.matrix ?? response?.matrix ?? [];
  const interviewersFromApi =
    response?.data?.interviewers ?? response?.interviewers ?? [];

  /* ── Find current user as interviewer ── */
  const currentInterviewer = useMemo(() => {
    if (!authUser?.id) return null;
    return interviewersFromApi.find((iv) => iv.userId === authUser.id) ?? null;
  }, [interviewersFromApi, authUser?.id]);

  /* ── Build default markings from matrix ── */
  const defaultMarkings = useMemo(() => {
    if (!matrix.length) return [];
    return matrix.map((row) => {
      const interviewerId = currentInterviewer?.jobInterviewerId;
      const jobInterviewWeightId =
        row.scores?.[interviewerId]?.jobInterviewWeightId ??
        row.jobInterviewWeightId ??
        row.id ??
        null;
      const existingMark = row.scores?.[interviewerId]?.weightMarking ?? "";
      return {
        jobInterviewWeightId: Number(jobInterviewWeightId),
        weightName: row.weightName,
        weightValue: row.weightValue,
        weightMarking:
          existingMark !== null && existingMark !== undefined
            ? String(existingMark)
            : "",
      };
    });
  }, [matrix, currentInterviewer]);

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(markSchema),
    defaultValues: { markings: defaultMarkings },
  });

  /* ── Reset form when data loads ── */
  useEffect(() => {
    if (defaultMarkings.length > 0) {
      reset({ markings: defaultMarkings });
    }
  }, [defaultMarkings]);

  const markings = watch("markings");

  const totalMarks = useMemo(
    () => markings?.reduce((sum, m) => sum + (Number(m?.weightMarking) || 0), 0),
    [markings],
  );

  const totalMaxMarks = useMemo(
    () => matrix.reduce((sum, row) => sum + (row.weightValue || 0), 0),
    [matrix],
  );

  const handleMarkChange = (index, value, maxValue) => {
    let val = value;
    if (val !== "") {
      const num = Number(val);
      if (!isNaN(num)) {
        if (num < 0) val = "0";
        if (num > maxValue) val = String(maxValue);
      }
    }
    setValue(`markings.${index}.weightMarking`, val, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    if (!currentInterviewer?.jobInterviewerId) return;
    const markingPayload = data.markings
      .filter((m) => m.jobInterviewWeightId)
      .map((m) => ({
        jobInterviewWeightId: Number(m.jobInterviewWeightId),
        weightMarking: Number(m.weightMarking) || 0,
      }));
    if (!markingPayload.length) return;
    await submitMarksMutation.mutateAsync({
      jobInterviewScheduleId: scheduleId,
      jobInterviewerId: currentInterviewer.jobInterviewerId,
      markings: markingPayload,
    });
  };

  const isSubmitting =
    submitMarksMutation?.isPending ?? submitMarksMutation?.isLoading ?? false;

  /* ── Not an interviewer ── */
  const isNotInterviewer =
    !isLoading && interviewersFromApi.length > 0 && !currentInterviewer;

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title="Submit Interview Marks"
      size="xl"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-primaryColor/30 border-t-primaryColor rounded-full animate-spin" />
        </div>
      ) : isNotInterviewer ? (
        <div className="py-8 text-center">
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
            You are not assigned as an interviewer for this schedule.
          </p>
          <ButtonTw
            size="sm"
            variant="outline.gray"
            className="mt-4"
            onClick={handleClose}
          >
            Close
          </ButtonTw>
        </div>
      ) : matrix.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm admin-text-muted">
            Interview weights have not been configured for this schedule.
          </p>
          <ButtonTw
            size="sm"
            variant="outline.gray"
            className="mt-4"
            onClick={handleClose}
          >
            Close
          </ButtonTw>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {matrix.map((row, index) => {
            const currentValue = watch(`markings.${index}.weightMarking`);
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium admin-text truncate">
                    {row.weightName}
                  </p>
                  <p className="text-xs admin-text-subtle">
                    Max: {row.weightValue}
                  </p>
                </div>
                <div className="w-28">
                  <Input
                    type="number"
                    size="sm"
                    min={0}
                    max={row.weightValue}
                    step={1}
                    placeholder="0"
                    value={currentValue || ""}
                    onChange={(value) =>
                      handleMarkChange(index, value, row.weightValue)
                    }
                    error={errors?.markings?.[index]?.weightMarking?.message}
                  />
                </div>
                <span className="text-xs admin-text-subtle shrink-0 w-12 text-right">
                  / {row.weightValue}
                </span>
              </div>
            );
          })}

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-border">
            <span className="text-sm font-semibold admin-text">Total</span>
            <span className="text-sm font-bold text-primaryColor">
              {totalMarks} / {totalMaxMarks}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <ButtonTw
              type="button"
              size="sm"
              variant="outline.gray"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </ButtonTw>
            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Submit Marks
            </ButtonTw>
          </div>
        </form>
      )}
    </ModalTw>
  );
};

export default SubmitMarksModal;
