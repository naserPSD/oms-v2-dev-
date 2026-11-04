"use client";

import { FormController as Controller } from "@/components/common/FormController";
import React, { useCallback, useEffect, useState } from 'react'
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonStore } from "@/store/useCommonStore";
import Swal from "sweetalert2";
import helpers, { toaster } from "@/utils/helpers";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useDashboardQueryApi } from "@/hooks/queryApi/useDashboardQueryApi";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import { useForm } from "react-hook-form";
import ButtonTw from '@/components/ui/ButtonTw';
import { TimePicker } from '@/components/ui/TimePicker';


const LateRequestModal = ({ showModal, handleClose, setShowModal, initialProps }) => {
    const dropdowns = useCommonStore((state) => state.dropdowns);
    const earlyLeaveReasonList =
        dropdowns.statusGroupList?.find((s) => s.code === "early_leave_reasons")
            ?.statuses ?? [];

    const closeModal = () => {
        handleClose()
        reset(initialValues);
    };


    // Zod schema for service information
    const schema = z
        .object({
            id: z.coerce.number().optional(),
            lateReason: z.string().min(1, "Late Reason is required"),
            inTime: z.string().min(1, "Check In Time is required"),
        });

    const initialValues = {
        id: 0,
        lateReason: '',
        inTime: null,
    };

    const {
        handleSubmit,
        setError,
        setValue,
        control,
        formState: { errors },
        reset,
        watch,
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: initialValues,
        mode: "onChange",
    });

    useEffect(() => {
        if (initialProps) {
            console.log('initialProps', initialProps)
            reset(initialProps);
        } else {
            reset(initialValues);
        }
    }, [initialProps, reset]);


    const {
        useMyAttendanceQuery,
        requestForRemovingLateAttendanceMutation,
    } = useDashboardQueryApi({ reset, setError, handleClose, setShowModal });

    const [isLoading, setIsLoading] = useState(false);

    const submitFormForCheckout = useCallback(
        async (values) => {
            await requestForRemovingLateAttendanceMutation.mutateAsync(values);
        },
        [requestForRemovingLateAttendanceMutation]
    );

    return (
        <div>

            <ModalTw
                show={showModal}
                onClose={closeModal}
                title="Checkout"
                size="md"
                dismissible={true}
                confirmText="Confirm"
                cancelText="Cancel"
                showHeader={false}
                showFooter={false}
            >
                <form className="p-3" onSubmit={handleSubmit(submitFormForCheckout)}>
                    <h2 className="text-2xl font-bold mb-6 text-center">Appeal for changing check-in time</h2>
                    {/* <p className="text-gray-500 mb-4">Do you want to request for removing your late count?</p> */}
                    <div className="grid grid-cols-12 gap-x-4">

                        <Controller
                            control={control}
                            name="lateReason"
                            render={({ field, fieldState }) => (
                                <Input
                                    type="textarea"
                                    label="Please specify reason for late"
                                    placeholder="Enter Late Reason"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    className="col-span-12 lg:col-span-12 sm:col-span-12"
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="inTime"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TimePicker
                                    label="Check In Time"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    className="col-span-6 lg:col-span-6 sm:col-span-6"
                                />
                            )}
                        />

                        <div className="col-span-12 flex justify-center items-center gap-4">
                            <ButtonTw
                                type="submit"
                                size="sm"
                                variant="default"
                                className="w-full font-bold mt-4 col-span-12"
                                disabled={isLoading}
                                loading={isLoading}
                            >
                                Submit
                            </ButtonTw>

                            <ButtonTw
                                size="sm"
                                variant="outline.gray"
                                className="w-full font-bold mt-4 col-span-12"
                                onClick={handleClose}
                            >
                                Cancel
                            </ButtonTw>
                        </div>
                    </div>
                </form>
            </ModalTw>
        </div>
    )
}

export default LateRequestModal
