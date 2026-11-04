"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";

import { useCommonStore } from "@/store/useCommonStore";

import { zodResolver } from "@/utils/zodResolver";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { BiPlus } from "react-icons/bi";
import Swal from "sweetalert2";
import { z } from "zod";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";

import { useSearchParams } from "next/navigation";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { FaFilter } from "react-icons/fa";
import CommonTable from "@/components/common/CommonTable";
import Pagination from "@/components/common/Pagination";
import DataFilter from "@/components/common/DataFilter";
import { useServiceFilter } from "./useServiceFilter";
import { useServiceTableColumn } from "./useServiceTableColumn";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import helpers from "@/utils/helpers";
import { checkServiceDuplicate } from "@/services/companySettingsApi";

const ServiceListComponent = ({ hasPermission }) => {
  //const { t } = useTranslation();
  //const user = useAuthStore((state) => state.user);
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const serviceTypeList =
    dropdowns.statusGroupList?.find((s) => s.code === "company_service_types")
      ?.statuses ?? [];
  const [showModal, setShowModal] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);

  // Zod schema for service information
  const schema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, "Service name is required"),
    typeId: z.coerce.number().min(1, "Service type is required"),
    // name: z.string().optional(),
    // typeId: z.coerce.number().optional(),
    isActive: z.boolean().default(true),
  });

  const initialValues = {
    id: 0,
    name: "",
    typeId: null,
    isActive: true,
  };

  const {
    // register,
    handleSubmit,
    setError,
    // setValue,
    control,
    // formState: { errors },
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

  // 🧠 ---------- FILTERS ----------
  const {
    filters,
    globalFilter,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearAllFilters,
    queryParams,
    setGlobalFilter,
  } = useServiceFilter(itemsPerPage);

  const {
    servicesQuery,
    addOrUpdateServiceMutation,
    deleteServiceMutation,
    toggleServiceStatusMutation,
  } = useCompanySettingsQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  // React Query for data fetching
  const {
    data: dataArray = [],
    isLoading: isFetching,
    // status,
    // error,
  } = servicesQuery(queryParams);

  // ✅ Fix 1: flatStatusArray কে useMemo এ রাখুন
  const flatStatusArray = useMemo(() => {
    if (!dropdowns?.statusGroupList) return [];
    return dropdowns.statusGroupList.flatMap((group) =>
      group.statuses.map((status) => ({ ...status })),
    );
  }, [dropdowns?.statusGroupList]);

  const pagination = dataArray?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total } = pagination;

  // ✅ Fix 2: listData এখন সঠিকভাবে cache হবে
  const listData = useMemo(() => {
    return (dataArray?.data || []).map((item) => {
      const type = flatStatusArray?.find((p) => p.value === item.typeId);
      return { ...item, typeName: type?.label };
    });
  }, [dataArray?.data, flatStatusArray]);

  const submitForm = async (values) => {
    setIsCheckingDuplicate(true);
    let isDuplicate = false;
    try {
      isDuplicate = await checkServiceDuplicate({
        name: values.name.trim(),
        typeId: Number(values.typeId),
        id: values.id || undefined,
      });
    } catch {
      setError("name", {
        type: "validate",
        message: "Could not verify this name. Please try again.",
      });
      setIsCheckingDuplicate(false);
      return;
    }
    setIsCheckingDuplicate(false);

    if (isDuplicate) {
      setError("name", {
        type: "validate",
        message: "A product or service with this name and type already exists.",
      });
      return;
    }

    try {
      await addOrUpdateServiceMutation.mutateAsync(values);
    } catch (error) {
      console.error("Failed to add or update service:", error);
    }
  };

  const handleEdit = useCallback(
    (item) => {
      reset(item);
      setShowModal(true);
    },
    [reset],
  );

  const changeServiceActiveStatus = useCallback(
    async (id) => {
      try {
        await toggleServiceStatusMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to change service status:", error);
      }
    },
    [toggleServiceStatusMutation],
  );

  const handleDelete = useCallback(
    async (id) => {
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
          try {
            await deleteServiceMutation.mutateAsync(id);
          } catch (error) {
            Swal.fire({
              title: "Error!",
              text: error?.response?.data?.message || "Something went wrong while deleting the record. (Server Error 500)",
              icon: "error",
              customClass: {
                popup: "swal-popup",
                confirmButton: "swal-confirm-btn",
              },
              buttonsStyling: false,
            });
          }
        }
      });
    },
    [deleteServiceMutation]
  );

  // TanStack Table columns

  const columns = useServiceTableColumn({
    handleEdit,
    handleDelete,
    changeServiceActiveStatus,
    hasPermission,
  });

  // Create TanStack Table instance
  const table = useReactTable({
    data: listData || [],
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeDirection: "rtl",
  });

  const isLoading =
    isFetching ||
    isCheckingDuplicate ||
    addOrUpdateServiceMutation.isLoading ||
    deleteServiceMutation.isLoading ||
    toggleServiceStatusMutation.isLoading;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="title-color font-bold text-lg">
          Product & Service List
        </h1>
        <div className="flex gap-x-2">
          {hasPermission(
            "settings.company_settings_product_&_service_list_add",
          ) && (
            <ButtonTw
              onClick={() => setShowModal(true)}
              variant="blue"
              className="gap-2"
            >
              <BiPlus /> Add New
            </ButtonTw>
          )}
        </div>
      </div>

      <CommonTable
        table={table}
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={
          watch("id") ? "Edit Product / Service" : "Add New Product / Service"
        }
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
                  label="Name"
                  placeholder="Enter Name"
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
                  label="Type"
                  options={serviceTypeList}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-9 sm:col-span-12"
                  placeholder="Select Type"
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

export default ServiceListComponent;
