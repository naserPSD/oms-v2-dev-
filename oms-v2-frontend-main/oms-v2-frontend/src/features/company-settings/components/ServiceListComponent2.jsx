"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useCommonStore } from "@/store/useCommonStore";
import helpers, { toaster } from "@/utils/helpers";
import RestApi from "@/utils/RestApi";
import { zodResolver } from "@/utils/zodResolver";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BiPlus } from "react-icons/bi";
import Swal from "sweetalert2";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServices } from "@/hooks/queryApi/useCompanySettingsQueryApi";

const fetchServices = async () => {
  const { data } = await RestApi.get(`/application/get-app-services`, {
    cache: { next: { revalidate: 3 } } // 👈 next.js caching
  });
  return data.data;
};

const addOrUpdateService = async (serviceData) => {
  await RestApi.post(`/application/add-or-update-service`, serviceData);
};

const deleteService = async (id) => {
  await RestApi.delete(`/application/delete-service/${id}`);
};

const toggleServiceStatus = async (id) => {
  await RestApi.patch(`/application/change-service-active-status/${id}`);
};

const ServiceListComponent2 = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const queryClient = useQueryClient();

  // const [isFetching, setIsFetching] = useState(false);
  // const [appServiceList, setAppServiceList] = useState(false);

  // React Query for data fetching
  const {
    data: appServiceList = [],
    isLoading: isFetching,
    isError,
    status, // Add this
    error, // Add this
  } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  // Mutations
  const addOrUpdateMutation = useMutation({
    mutationFn: addOrUpdateService,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['services'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['services']);

      // Optimistically update the cache
      queryClient.setQueryData(['services'], (old) => {
        if (!old) return [variables];
        const exists = old.some(item => item.id === variables.id);
        return exists
          ? old.map(item => item.id === variables.id ? variables : item)
          : [...old, variables];
      });

      handleClose();

      // Return context with previous services
      return { previousData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving service:", error);
      // Rollback on error
      if (context?.previousData) queryClient.setQueryData(['services'], context.previousData);

      // ✅ Keep user input values when resetting form
      reset(variables);

      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      // queryClient.invalidateQueries({ queryKey: ['services'] });
      // queryClient.invalidateQueries({ queryKey: ['services'], refetchType: 'none' });
    },
    onSuccess: (data, variables) => {
      toaster(
        variables.id ? "Service updated successfully" : "Service added successfully",
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ['services'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['services']);

      // Snapshot the previous value
      const previousServices = queryClient.getQueryData(['services']);

      // Optimistically remove the service
      queryClient.setQueryData(['services'], (old) =>
        old?.filter(service => service.id !== id) || []
      );

      // Return context with previous services
      return { previousServices };
    },
    onError: (err, id, context) => {
      console.error("Error deleting service:", err);

      // Rollback on error
      if (context?.previousServices) {
        queryClient.setQueryData(['services'], context.previousServices);
      }

      toaster("Failed to delete service", "error");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      // queryClient.invalidateQueries(['services']);

      // Optional: Soft update cache instead
      // queryClient.refetchQueries(['services'], { cancelRefetch: false });

      queryClient.invalidateQueries({ queryKey: ['services'], refetchType: 'none' });

      // This ensures cache is marked as stale but doesn't force immediate reload
      // queryClient.invalidateQueries(['services'], {
      //   exact: true,
      //   refetchActive: false, // Don't refetch active observers
      //   refetchInactive: false // Don't refetch inactive observers
      // });
    },
    onSuccess: () => {
      toaster("Service deleted successfully", "success");
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleServiceStatus,
    onMutate: async (id) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(['services']);

      // Snapshot the previous value
      const previousServices = queryClient.getQueryData(['services']);

      // Optimistically update to the new value
      queryClient.setQueryData(['services'], (old) =>
        old?.map(service =>
          service.id === id
            ? { ...service, isActive: !service.isActive }
            : service
        ) || []
      );

      // Return a context object with the snapshotted value
      return { previousServices };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, id, context) => {
      console.error("Error toggling service status:", err);
      if (context?.previousServices) {
        queryClient.setQueryData(['services'], context.previousServices);
      }
      toaster("Failed to update service status", "error");
    },
    // Always refetch after error or success:
    onSettled: () => {
      // queryClient.invalidateQueries(['services']);

      // Optional: Soft update cache instead
      // queryClient.refetchQueries(['services'], { cancelRefetch: false });

      queryClient.invalidateQueries({ queryKey: ['services'], refetchType: 'none' });

      // This ensures cache is marked as stale but doesn't force immediate reload
      // queryClient.invalidateQueries(['services'], {
      //   exact: true,
      //   refetchActive: false, // Don't refetch active observers
      //   refetchInactive: false // Don't refetch inactive observers
      // });
    },
    onSuccess: () => {
      toaster("Service status changed successfully", "success");
    }
  });

  const serviceTypeList = dropdowns.statusGroupList?.find(s => s.code === 'education_level')?.statuses ?? [];
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Zod schema for service information
  const schema = z.object({
    id: z.coerce.number().optional(),
    // name: z.string().min(1, "Service name is required"),
    // typeId: z.coerce.number().min(1, "Service type is required"),
    name: z.string().optional(),
    typeId: z.coerce.number().optional(),
    isActive: z.boolean().default(true),
  });

  const initialValues = {
    id: 0,
    name: "",
    typeId: null,
    isActive: true,
  };

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


  const { servicesQuery, addOrUpdateServiceMutation } =
    useServices({ reset, setError, handleClose, setShowModal });

  const submitForm = async (values) => {
    await addOrUpdateMutation.mutateAsync(values);
    // await addOrUpdateServiceMutation.mutateAsync(values);
  };

  const handleEdit = (item) => {
    reset(item);
    setShowModal(true);
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
        await deleteMutation.mutateAsync(id);
      }
    });
  };

  const changeServiceActiveStatus = async (id) => {
    await toggleStatusMutation.mutateAsync(id);
  };

  const isLoading = isFetching ||
    addOrUpdateMutation.isLoading ||
    deleteMutation.isLoading ||
    toggleStatusMutation.isLoading;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="title-color font-bold text-lg">Service List</h1>
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
          <thead className=" text-xs">
            <tr>
              <th>SL.</th>
              <th>Name</th>
              <th>Type</th>
              <th className="text-center">Active</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : appServiceList.length > 0 ? (
              appServiceList.map((row, i) => (
                <tr key={row.id}>
                  <td>0{i + 1}</td>
                  <td>{row.name}</td>
                  <td>
                    <span
                      className={`badge badge-rounded ${row.type === "Technical"
                        ? "badge-outline-success"
                        : "badge-outline-primary"
                        }`}
                    >
                      {row?.type?.name}
                    </span>
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
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
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
        title={editingId ? "Edit Service" : "Add New Service"}
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
                  label="Service Name"
                  placeholder="Enter service name"
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
              name="typeId"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Service Type"
                  options={serviceTypeList}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-9 sm:col-span-12"
                  placeholder="Select service type"
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

export default ServiceListComponent2;