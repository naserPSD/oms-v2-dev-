import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from '@/components/common/ModalTw';
import React, { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@/utils/zodResolver';
import Input from "@/components/ui/Input";
import RestApi from "@/utils/RestApi";
import helpers, { toaster } from "@/utils/helpers";
import { useTranslation } from 'next-i18next'
import ButtonTw from '@/components/ui/ButtonTw copy';
import FileUpload from '@/components/ui/FileUpload';
import { useCommonStore } from '@/store/useCommonStore';
import SelectSearch from '@/components/ui/SelectSearch';
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css';
import Image from "next/image";
import { RadioButton } from '@/components/ui/RadioButton';
import AvatarUpload from '@/components/ui/AvatarUpload';
import RadioGroup from '@/components/ui/RadioGroup';
import { useAuthStore } from '@/store/useAuthStore';
import { getAuthUserInfo } from '@/utils/commonApiFunction';
import DatePicker from '@/components/ui/DatePicker';
import { parseISO, isValid } from "date-fns";
import SwitchButton from '@/components/ui/SwitchButton';

const AddEmployeeHistoryModal = ({ editItem, showModal = false, onClose }) => {

    const { t } = useTranslation()
    const user = useAuthStore((state) => state.user);
    const dropdowns = useCommonStore((state) => state.dropdowns);

    const countryList = dropdowns.countryList?.map(c => ({ value: c.id, label: c.name })) || [];

    const educationLevelList = dropdowns.statusGroupList?.find(s => s.code === 'education_level')?.statuses ?? [];
    // const educationLevelList = dropdowns.statusGroupList?.find(s => s.code === 'education_levels')?.statuses ?? [];
    const educationGroupList = dropdowns.statusGroupList?.find(s => s.code === 'education_group')?.statuses ?? [];
    const resultTypeList = dropdowns.statusGroupList?.find(s => s.code === 'education_result_types')?.statuses ?? [];

    // const [showModal, setInternalShowModal] = useState(false);
    const [internalShowModal, setInternalShowModal] = useState(showModal);
    const [isLoading, setLoading] = useState(false);

    // Handle modal close
    const handleClose = () => {
        if (onClose) onClose(); // Call parent's onClose
    };

    // Zod schema with conditional validation
    const schema = z.object({
        id: z.coerce.number().optional(),
        educationLevelId: z.coerce.number().min(1, 'Education Level is required'),
        groupId: z.coerce.number().default(null).optional(),
        instituteName: z.string().nullable().optional(),
        isForeignInstitute: z.boolean(),
        instituteCountryId: z.coerce.number().optional(),
        duration: z.coerce.number().optional(),
        isCurrent: z.boolean(),
        yearOfPassing: z.coerce.number().optional(),
        resultTypeId: z.coerce.number().optional(),
        result: z.string().optional(),
        serial: z.coerce.number().optional(),
    });

    const initialValues = {
        id: '',
        userId: user?.id | 0,
        instituteName: '',
        isForeignInstitute: false,
        instituteCountryId: null,
        educationLevelId: null,
        groupId: null,
        duration: null,
        isCurrent: false,
        yearOfPassing: null,
        resultTypeId: null,
        result: '',
        serial: null,
    }

    const {
        register,
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

    // Add this effect:
    useEffect(() => {
        if (editItem) {
            reset({
                ...editItem
            });
        } else {
            reset(initialValues);
        }
    }, [editItem, reset]);

    // Handle form submit
    const submitForm = async (values) => {
        // console.log('values', values)
        setLoading(true);
        try {

            await RestApi.post(`/api/v1/users/add-or-update-education`, values);
            setInternalShowModal(false);
            await getAuthUserInfo(setLoading)

            handleClose();
            toaster(`Education ${editItem ? 'updated' : 'added'} successfully`, 'success');
        } catch (error) {
            helpers.handleApiValidationError(error, setError);
        } finally {
            setLoading(false);
        }
    };

    const isForeignInstitute = watch("isForeignInstitute");
    const isCurrent = watch("isCurrent");

    useEffect(() => {
        console.log('isForeignInstitute', isForeignInstitute)
        if (!isForeignInstitute) {
            setValue("instituteCountryId", "");
        }
    }, [isForeignInstitute, setValue]);

    return (
        <div>
            <ModalTw
                show={showModal}
                onClose={handleClose}
                title={`${editItem ? 'Edit' : 'Add'} Employee History`}
                size="2xl"
                onConfirm={handleClose}
                dismissible={true}
                confirmText="Confirm"
                cancelText="Cancel"
                showHeader={true}
                showFooter={false}
                type="default"
                position="center"
            >

                <form className="p-3" onSubmit={handleSubmit(submitForm)}>
                    {/* <h2 className="card-title font-bold mb-2">Basic Information</h2> */}
                    {/* <p className="text-gray-500 mb-4">Please fill in your details to get started</p> */}
                    <div className="flex flex-row gap-[80px]">
                        <div className="container">

                            <div className="grid grid-cols-12 gap-x-4">

                                <Controller
                                    control={control}
                                    name="educationLevelId"
                                    render={({ field, fieldState }) => (
                                        <SelectSearch
                                            label="Educational Level"
                                            options={educationLevelList}
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            className="col-span-12 lg:col-span-6 sm:col-span-12"
                                            placeholder="Select Educational Level"
                                            searchable
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="groupId"
                                    render={({ field, fieldState }) => (
                                        <SelectSearch
                                            label="Educational Group"
                                            options={educationGroupList}
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            className="col-span-12 lg:col-span-6 sm:col-span-12"
                                            placeholder="Select Educational Group"
                                            searchable
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="instituteName"
                                    render={({ field, fieldState }) => (
                                        <Input
                                            label="Institute Name"
                                            placeholder="Enter your Institute Name"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            className="col-span-12 lg:col-span-6 sm:col-span-12"
                                            {...field}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="isForeignInstitute"
                                    render={({ field, fieldState }) => (
                                        <SwitchButton
                                            enabled={field.value}
                                            onChange={field.onChange}
                                            label="Is Foreign Institute?"
                                            className="col-span-12 lg:col-span-4 sm:col-span-12"
                                            error={fieldState.error?.message}
                                            enabledText="Yes"
                                            disabledText="No"
                                        />
                                    )}
                                />

                                {isForeignInstitute && (
                                    <Controller
                                        control={control}
                                        name="instituteCountryId"
                                        render={({ field, fieldState }) => (
                                            <SelectSearch
                                                label="Institute Country"
                                                options={countryList}
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={fieldState.error?.message}
                                                className="col-span-12 lg:col-span-6 sm:col-span-12"
                                                placeholder="Select Institute Country"
                                                searchable
                                            />
                                        )}
                                    />
                                )}

                                <Controller
                                    control={control}
                                    name="duration"
                                    render={({ field, fieldState }) => (
                                        <Input
                                            label="Duration (in years)"
                                            placeholder="Enter your Duration"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            className="col-span-12 lg:col-span-6 sm:col-span-12"
                                            {...field}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="isCurrent"
                                    render={({ field, fieldState }) => (
                                        <SwitchButton
                                            label="Is Current Education?"
                                            enabled={field.value}
                                            onChange={field.onChange}
                                            className="col-span-12 lg:col-span-4 sm:col-span-12"
                                            error={fieldState.error?.message}
                                            enabledText="Yes"
                                            disabledText="No"
                                        />
                                    )}
                                />


                                {!isCurrent && (
                                    <Controller
                                        control={control}
                                        name="yearOfPassing"
                                        render={({ field, fieldState }) => (
                                            <Input
                                                label="Year of Passing"
                                                placeholder="Enter your Year of Passing"
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={fieldState.error?.message}
                                                className="col-span-12 lg:col-span-6 sm:col-span-12"
                                                {...field}
                                            />
                                        )}
                                    />
                                )}

                                {!isCurrent && (
                                    <Controller
                                        control={control}
                                        name="resultTypeId"
                                        render={({ field, fieldState }) => (
                                            <SelectSearch
                                                label="Result Type"
                                                placeholder="Select Result Type"
                                                options={resultTypeList}
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={fieldState.error?.message}
                                                className="col-span-12 lg:col-span-6 sm:col-span-12"
                                                searchable
                                            />
                                        )}
                                    />
                                )}

                                {!isCurrent && (
                                    <Controller
                                        control={control}
                                        name="result"
                                        render={({ field, fieldState }) => (
                                            <Input
                                                label="Result"
                                                placeholder="Enter your Result"
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={fieldState.error?.message}
                                                className="col-span-12 lg:col-span-6 sm:col-span-12"
                                                {...field}
                                            />
                                        )}
                                    />
                                )}

                                <Controller
                                    control={control}
                                    name="serial"
                                    render={({ field, fieldState }) => (
                                        <Input
                                            label="Serial"
                                            placeholder="Enter your serial"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            className="col-span-12 lg:col-span-6 sm:col-span-12"
                                            {...field}
                                        />
                                    )}
                                />

                            </div>

                            <ButtonTw type="submit" size="sm" variant="default" className="w-full font-bold" disabled={isLoading} loading={isLoading}>
                                Submit
                            </ButtonTw>
                        </div>
                    </div>
                </form>
            </ModalTw>
        </div>
    )
}

export default AddEmployeeHistoryModal