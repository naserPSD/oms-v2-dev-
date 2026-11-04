import React from "react";
import { FormController as Controller } from "@/components/common/FormController";
import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import { zodResolver } from "@/utils/zodResolver";
import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaListUl } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { TabItemTw } from "@/components/ui/TabItemTw";
import { IoMdAdd } from "react-icons/io";
import { useRecruitmentQueryApi } from "@/hooks/queryApi/useRecruitmentQueryApi";

const initialValues = {
  id: 0,
  name: "",
};

const schema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Job recruitment step name is required"),
});

const AddOrUpdateJobCategoryTypeModal = ({
  modalShow,
  handleCloseTypeModal,
}) => {
  const TAB_CONFIG = [
    {
      key: "list",
      label: "Job Recruitment Step Name List",
      icon: <FaListUl className="w-4 h-4" />,
    },
    {
      key: "edit",
      label: "Add New Job Recruitment Step Name",
      icon: <IoMdAdd className="w-4 h-4" />,
    },
  ];
  const [activeTab, setActiveTab] = useState("list");

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const {
    // register,
    // formState: { errors },
    setValue,
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

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setShowModal(modalShow);
  }, [modalShow]);

  // Modal handlers
  const handleClose = useCallback(() => {
    reset(initialValues);
    handleCloseTypeModal();
    setActiveTab("list");
    setShowModal(false);
  }, [handleCloseTypeModal, reset]);

  const {
    useJobRecruitmentStepNameQuery,
    addOrUpdateJobRecruitmentStepNameMutation,
    deleteJobRecruitmentStepNameMutation,
  } = useRecruitmentQueryApi({ reset, setError, handleClose, setShowModal });

  const { data: responseData, isLoading: isFetching } =
    useJobRecruitmentStepNameQuery({ page: 1, limit: 100 });

  const stepNames = useMemo(() => {
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData)) return responseData;
    return [];
  }, [responseData]);

  const submitForm = async (values) => {
    await addOrUpdateJobRecruitmentStepNameMutation.mutateAsync(values);
    reset(initialValues);
    setActiveTab("list");
  };

  const handleEdit = (item) => {
    setValue("id", item.id);
    setValue("name", item.name || "");
    setActiveTab("edit");
  };

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
          await deleteJobRecruitmentStepNameMutation.mutateAsync(id);
        }
      });
    },
    [deleteJobRecruitmentStepNameMutation],
  );

  const isLoading =
    isFetching ||
    addOrUpdateJobRecruitmentStepNameMutation.isLoading ||
    deleteJobRecruitmentStepNameMutation.isLoading;

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Job Recruitment Step Name`}
        size="sm"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <div className="flex flex-wrap items-center divide-x text-gray-500 divide-gray-400 font-bold text-xs mb-4 border-b pb-2.5">
          {TAB_CONFIG.map((tab) => (
            <div key={tab.key}>
              <TabItemTw
                active={activeTab === tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={activeTab === tab.key ? "border-b" : ""}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </TabItemTw>
            </div>
          ))}
        </div>

        {activeTab === "list" ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm title-color font-medium">Step Name List</p>
              <ButtonTw
                type="button"
                size="sm"
                variant="blue"
                className="gap-2"
                onClick={() => {
                  reset(initialValues);
                  setActiveTab("edit");
                }}
              >
                <IoMdAdd className="w-4 h-4" /> Add New
              </ButtonTw>
            </div>

            <div className="table-container">
            <table className="table">
              <thead className="text-xs">
                <tr>
                  <th>SL.</th>
                  <th>Step Name</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>

                {isFetching ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2">
                          <Skeleton className="h-4 w-8" />
                        </td>
                        <td className="px-4 py-2">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-2">
                            <Skeleton className="h-6 w-6 rounded" />
                            <Skeleton className="h-6 w-6 rounded" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : stepNames.length > 0 ? (
                    stepNames.map((row, i) => (
                      <tr key={row.id || i}>
                        <td>{i + 1}</td>
                        <td>{row.name || "-"}</td>
                        <td className="text-center">
                          <div className="action flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(row)}
                              className="btn-action text-blue-500 hover:text-blue-700"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
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
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                        No data available
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
            <div className="grid grid-cols-12 gap-x-4">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    label="Job Recruitment Step Name"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    placeholder="Enter job recruitment step name"
                    className="col-span-12"
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
                  type="button"
                  size="sm"
                  variant="outline.gray"
                  className="w-full font-bold mt-4 col-span-12"
                  onClick={() => reset(initialValues)}
                >
                  Reset
                </ButtonTw>
              </div>
            </div>
          </form>
        )}
      </ModalTw>
    </div>
  );
};

export default AddOrUpdateJobCategoryTypeModal;
