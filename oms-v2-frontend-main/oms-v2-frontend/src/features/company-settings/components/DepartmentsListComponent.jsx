"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { Skeleton } from "@/components/ui/skeleton";
import SwitchButton from "@/components/ui/SwitchButton";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import { useAuthStore } from "@/store/useAuthStore";
import { useCommonStore } from "@/store/useCommonStore";
import helpers, { toaster } from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BiPlus } from "react-icons/bi";
import Swal from "sweetalert2";
import { z } from "zod";

const initialValues = {
  id: "",
  name: "",
  description: "",
  parentId: null,
  isActive: true,
};

const DepartmentsListTable = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const [showModal, setShowModal] = useState(false);

  const schema = z.object({
    id: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.number().int().positive().optional(),
    ),
    name: z.string().trim().min(1, "Department name is required"),
    description: z
      .string()
      .max(255, "Description must be shorter than or equal to 255 characters")
      .optional()
      .or(z.literal("")),
    parentId: z.coerce.number().optional(),
    isActive: z.boolean().default(true),
  });

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

  const handleClose = () => {
    reset(initialValues);
    setShowModal(false);
  };

  const handleEdit = (item) => {
    reset(item);
    setShowModal(true);
  };

  const {
    departmentsQuery,
    addOrUpdateDepartmentMutation,
    deleteDepartmentMutation,
    toggleDepartmentStatusMutation,
  } = useCompanySettingsQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  // React Query for data fetching
  const {
    data: listData = [],
    isLoading: isFetching,
    status,
    error,
  } = departmentsQuery;

  // const parentDepartmentsList = listData.filter((item, index) => !item.parentId);
  const parentList =
    listData?.map((item) => ({
      value: item.id,
      label: item.name,
    })) ?? [];

  const submitForm = async (values) => {
    await addOrUpdateDepartmentMutation.mutateAsync(values);
  };

  const handleDelete = async (id) => {
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
        await deleteDepartmentMutation.mutateAsync(id);
      }
    });
  };

  const changeServiceActiveStatus = async (id) => {
    await toggleDepartmentStatusMutation.mutateAsync(id);
  };

  const isLoading =
    isFetching ||
    addOrUpdateDepartmentMutation.isLoading ||
    deleteDepartmentMutation.isLoading ||
    toggleDepartmentStatusMutation.isLoading;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="title-color font-bold text-lg">Departmentssss</h1>
        <ButtonTw
          onClick={() => setShowModal(true)}
          variant="blue"
          className="gap-2"
        >
          <BiPlus /> Add New
        </ButtonTw>
      </div>

      <div className="table-container">
        <table className="table">
          <thead className="text-xs">
            <tr>
              <th className="">SL.</th>
              <th className="">Name</th>
              <th className="">Description</th>
              <th className="">Parent</th>
              <th className="text-center">Active</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Skeleton className="h-6 w-12 rounded-full mx-auto" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </td>
                </tr>
              ))
            ) : listData.length > 0 ? (
              listData.map((row, i) => (
                <tr key={row.id}>
                  <td>{i + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.description}</td>
                  <td>{row?.parent && row?.parent?.name}</td>
                  <td className="text-center">
                    <SwitchButton
                      onClick={() => changeServiceActiveStatus(row.id)}
                      enabled={row.isActive}
                      enabledText="Yes"
                      disabledText="No"
                      className="!mb-0"
                    />
                  </td>
                  <td className="text-center">
                    <div className="action">
                      <button
                        onClick={() => handleEdit(row)}
                        className="btn-action text-blue-500 hover:text-blue-700"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="btn-action text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={watch("id") ? "Edit Department" : "Add New Department"}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-12 gap-x-4">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  label="Department Name"
                  placeholder="Enter department name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <Input
                  type="textarea"
                  label="Description"
                  placeholder="Enter Description"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12"
                  maxLength={255}
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="parentId"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Parent Department"
                  options={parentList}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-9 sm:col-span-12"
                  placeholder="Select parent department"
                  searchable
                />
              )}
            />

            <Controller
              control={control}
              name="isActive"
              render={({ field, fieldState }) => (
                <SwitchButton
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Active"
                  className="col-span-12 lg:col-span-3 sm:col-span-12"
                  error={fieldState.error?.message}
                  enabledText="Yes"
                  disabledText="No"
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
                onClick={() => reset()}
              >
                Reset
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default DepartmentsListTable;
