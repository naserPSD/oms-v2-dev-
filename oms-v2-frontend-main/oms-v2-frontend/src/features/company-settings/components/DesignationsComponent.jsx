"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { Skeleton } from "@/components/ui/skeleton";
import SwitchButton from "@/components/ui/SwitchButton";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import helpers, { toaster } from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import Swal from "sweetalert2";
import { z } from "zod";

const fakeData = [
  {
    id: 1,
    name: "Graphic Design",
    type: "UI/UX",
    level: "UI/UX",
    active: true,
  },
  {
    id: 2,
    name: "UI/UX Design",
    type: "Core Team",
    level: "",
    active: false,
  },
];

const initialValues = {
  id: "",
  name: "",
  departmentId: null,
  level: null,
  active: true,
};

const DesignationsTable = () => {
  const [data, setData] = useState(fakeData);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const schema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, "Designation name is required"),
    departmentId: z.coerce.number().min(1, "Department is required"),
    level: z.coerce.number().max(99).optional(),
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
    designationsQuery,
    addOrUpdateDesignationMutation,
    deleteDesignationMutation,
    toggleDesignationStatusMutation,
    departmentsQuery
  } =
    useCompanySettingsQueryApi({ reset, setError, handleClose, setShowModal });

  // React Query for data fetching
  const {
    data: departmentList = [],
  } = departmentsQuery;

  const departmentOptions = departmentList.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  // React Query for data fetching
  const {
    data: listData = [],
    isLoading: isFetching,
    status,
    error,
  } = designationsQuery;

  const getNextSerialLevel = () => {
    const list = Array.isArray(listData?.data) ? listData.data : Array.isArray(listData) ? listData : [];
    const numericLevels = list
      .filter((item) => !item?.deletedAt)
      .map((item) => Number(item?.level))
      .filter((lvl) => !isNaN(lvl) && lvl > 0);
    return numericLevels.length > 0 ? Math.max(...numericLevels) + 1 : 1;
  };

  const handleOpenAddModal = () => {
    reset({
      ...initialValues,
      level: getNextSerialLevel(),
    });
    setShowModal(true);
  };

  const submitForm = async (values) => {
    try {
      const formattedName = values.name
        ? values.name.trim().replace(/\b\w/g, (char) => char.toUpperCase())
        : values.name;
      await addOrUpdateDesignationMutation.mutateAsync({
        ...values,
        name: formattedName,
      });
    } catch (error) {
      // Error handling is handled in mutation onError
    }
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
        await deleteDesignationMutation.mutateAsync(id);
      }
    });
  };

  const changeServiceActiveStatus = async (id) => {
    await toggleDesignationStatusMutation.mutateAsync(id);
  };

  const isLoading = isFetching ||
    addOrUpdateDesignationMutation.isLoading ||
    deleteDesignationMutation.isLoading ||
    toggleDesignationStatusMutation.isLoading;


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="title-color font-bold text-lg">Designations</h1>
        <ButtonTw
          onClick={handleOpenAddModal}
          variant="blue"
          className="gap-2"
        >
          <BiPlus /> Add New
        </ButtonTw>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>SL.</th>
              <th>Designation</th>
              <th>Department</th>
              <th className="text-center">Level</th>
              <th className="text-center">Active</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ?
              (
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
              )

              : listData.length > 0 ? (
                listData.map((row, i) => (
                  <tr key={row.id}>
                    <td>{i + 1}</td>
                    <td
                      className="capitalize"
                      style={{ textTransform: "capitalize" }}
                    >
                      {helpers.capitalizeWords(row.name)}
                    </td>
                    <td>{row?.department?.name}</td>
                    <td className="text-center">
                      <span className="badge badge-circle badge-secondary">{row.level}</span>
                    </td>
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
        title={watch("id") ? "Edit Designation" : "Add New Designation"}
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
                  label="Designation Name"
                  placeholder="Enter designation name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 capitalize"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="level"
              render={({ field, fieldState }) => (
                <Input
                  type="number"
                  numberAlignment="left"
                  min={1}
                  label="Designation Level"
                  placeholder="Enter designation level"
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
              name="departmentId"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Department"
                  options={departmentOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-9 sm:col-span-12"
                  placeholder="Select department"
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

export default DesignationsTable;
