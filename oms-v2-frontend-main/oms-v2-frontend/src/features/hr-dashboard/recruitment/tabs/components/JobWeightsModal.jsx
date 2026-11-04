import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useCallback, useMemo, useState } from "react";
import { BiPlus } from "react-icons/bi";
import JobWeightTable from "./JobWeightTable";
import Pagination from "@/components/common/Pagination";
import { useJobWeightTableColumn } from "../hooks/useJobWeightTableColumn";
import Swal from "sweetalert2";
import { zodResolver } from "@/utils/zodResolver";
import { useForm } from "react-hook-form";
import z from "zod";
import Input from "@/components/ui/Input";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";

// 2️⃣ ======================= CONSTANTS / SCHEMA =======================

// Complete initialValues with all fields from your data
const initialValues = {
  id: 0,
  weightName: "",
  weightValue: null,
};
// Complete Zod schema with all fields and validation
const schema = z.object({
  id: z.coerce.number().optional(),
  weightName: z.string().min(1, "Weight name is required"),
  weightValue: z.coerce.number().min(0, "Weight must be positive"),
});

const JobWeightsModal = ({
  // selectedWeights,
  jobWeightDataArray,
  showModal,
  handleClose,
  currentPage,
  itemsPerPage,
  jobWeightsData,
  jobWeightsLoading,
  setCurrentPage,
  setItemsPerPage,
  jobId,
}) => {
  const [showJobWeightsModal, setShowJobWeightsModal] = useState(false);

  const {
    // register,
    // formState: { errors },
    // setValue,
    reset,
    handleSubmit,
    control,
    watch,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Modal handlers
  const handleJobWeightsClose = useCallback(() => {
    reset(initialValues);
    setShowJobWeightsModal(false);
  }, [reset]);

  const { addOrUpdateJobWeightMutation, deleteJobWeightMutation } =
    useHrQueryApi({
      reset,
      setError,
      handleClose: handleJobWeightsClose,
      setShowModal: setShowJobWeightsModal,
    });

  const submitForm = async (values) => {
    const payload = {
      jobVacancyId: jobId, // external jobId
      weightName: values.weightName,
      weightValue: Number(values.weightValue),
    };
    if (values.id) {
      payload.id = values.id;
    }
    await addOrUpdateJobWeightMutation.mutateAsync(payload);
  };

  // For Only Table Data..............................
  const pagination = jobWeightsData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total } = pagination;

  const listData = useMemo(() => {
    const filteredData = (jobWeightDataArray || []).filter(
      (item) => item.jobVacancyId === jobId,
    );

    return filteredData.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [jobWeightDataArray, jobId, currentPage, itemsPerPage]);

  const handleEdit = useCallback(
    (item) => {
      reset(item);
      setShowJobWeightsModal(true);
    },
    [reset],
  );

  // 🧹 Delete handler
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
          await deleteJobWeightMutation.mutateAsync(id);
        }
      });
    },
    [deleteJobWeightMutation],
  );

  const columns = useJobWeightTableColumn({
    handleEdit,
    handleDelete,
  });

  // Create TanStack Table instance
  const table = useReactTable({
    data: listData || [],
    columns,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeDirection: "rtl",
  });

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={"Job Weights"}
        size="4xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <div className="flex items-center justify-between my-5">
          <h1 className="title-color font-bold text-lg"></h1>
          <div className="flex gap-2">
            <ButtonTw
              onClick={() => {
                setShowJobWeightsModal(true);
              }}
            >
              <BiPlus /> Add Job Weights
            </ButtonTw>
          </div>
        </div>
        {/* Filter Bar */}
        <JobWeightTable
          table={table}
          isFetching={jobWeightsLoading}
          itemsPerPage={itemsPerPage}
          columns={columns}
          // hasActiveFilters={hasActiveFilters}
        />
        <Pagination
          currentPage={currentPage}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        {/* ................Add And Update Job Weight..................... */}

        <div>
          <ModalTw
            show={showJobWeightsModal}
            onClose={handleJobWeightsClose}
            title={watch("id") ? "Edit Job Weight" : "Add Job Weight"}
            size="lg"
            dismissible
            showHeader
            showFooter={false}
          >
            <form onSubmit={handleSubmit(submitForm)} className="p-4">
              {/* Section: Basic Information */}
              <div className="grid grid-cols-12 gap-y-2">
                {/* Job Title */}
                <Controller
                  control={control}
                  name="weightName"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Job Weights Name"
                      placeholder="Enter Job Weights Name"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 "
                      required
                    />
                  )}
                />

                {/* Vacancy */}
                <Controller
                  control={control}
                  name="weightValue"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Job Weights Value"
                      type="number"
                      placeholder="Enter Job Weights Value"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="col-span-12 pr-1"
                      required
                    />
                  )}
                />
              </div>
              {/* Form Actions */}
              <div className="flex  gap-x-2">
                <ButtonTw
                  type="submit"
                  size="md"
                  variant="default"
                  className="w-full  mt-4 col-span-12 py-1.5"
                  loading={addOrUpdateJobWeightMutation?.isLoading}
                >
                  {watch("id") ? "Update Job Weight" : "Add Job Weight"}
                </ButtonTw>

                <ButtonTw
                  type="button"
                  size="md"
                  variant="outline.gray"
                  className="w-full  mt-4 col-span-12 py-1.5"
                  onClick={() => reset()}
                >
                  Reset
                </ButtonTw>
              </div>
            </form>
          </ModalTw>
        </div>
      </ModalTw>
    </div>
  );
};

export default JobWeightsModal;
