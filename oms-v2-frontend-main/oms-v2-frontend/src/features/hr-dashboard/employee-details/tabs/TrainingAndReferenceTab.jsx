// /tabs/EmployeeHistoryTab.jsx
"use client";
import ButtonTw from "@/components/ui/ButtonTw";
import { useState } from "react";
import "react-image-crop/dist/ReactCrop.css";
import { useAuthStore } from "@/store/useAuthStore";
import helpers, { toaster } from "@/utils/helpers";
import RestApi from "@/utils/RestApi";
import Swal from "sweetalert2";
import { getAuthUserInfo } from "@/utils/commonApiFunction";
import { useParams } from "next/navigation";
import { useEmployeeProfileQueryApi } from "@/hooks/queryApi/useEmployeeProfileQueryApi";
import MiniSpinner from "@/shared/loader/MiniSpinner";
import AddEmployeeTrainingModal from "../components/general-info/modals/AddEmployeeTrainingModal";
import AddEmployeeReferences from "../components/general-info/modals/AddEmployeeReferences";
import { useQueryClient } from "@tanstack/react-query";

const TrainingAndReferenceTab = () => {
  const { id } = useParams();
  const queryClient = useQueryClient(); // ✅ useQueryClient hook
  const [isLoading, setLoading] = useState(false);
  const [openModalName, setOpenModalName] = useState("");
  const { useEmployeeTrainingListQuery, useEmployeeReferenceListQuery } =
    useEmployeeProfileQueryApi({});

  const {
    data: employeeTrainingListResponseData,
    isLoading: isEmployeeTrainingListLoading,
  } = useEmployeeTrainingListQuery(id);

  const {
    data: employeeReferenceListResponseData,
    isLoading: isEmployeeReferenceListLoading,
  } = useEmployeeReferenceListQuery(id);

  const employeeTrainingList = employeeTrainingListResponseData?.data || [];
  const employeeReferenceList = employeeReferenceListResponseData?.data || [];

  const deleteTraining = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        customClass: {
          popup: "swal-popup",
          confirmButton: "swal-confirm-btn",
          cancelButton: "swal-cancel-btn",
        },
        buttonsStyling: false,
      });

      if (!result.isConfirmed) return;

      setLoading(true);

      try {
        await RestApi.delete(`api/v1/users/delete-training/${id}`);

        queryClient.invalidateQueries({ queryKey: ["employeeTrainingList"] });

        await Swal.fire({
          title: "Deleted!",
          text: "Training deleted successfully.",
          icon: "success",
          customClass: {
            popup: "swal-popup",
            confirmButton: "swal-ok-btn",
          },
          buttonsStyling: false,
        });
      } catch (error) {
        console.error("Error deleting training:", error);

        Swal.fire({
          title: "Error!",
          text: "Failed to delete training.",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const deleteReference = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        customClass: {
          popup: "swal-popup",
          confirmButton: "swal-confirm-btn",
          cancelButton: "swal-cancel-btn",
        },
        buttonsStyling: false,
      });

      if (!result.isConfirmed) return;

      setLoading(true);

      try {
        await RestApi.delete(`api/v1/users/delete-reference/${id}`);

        queryClient.invalidateQueries({ queryKey: ["employeeReferenceList"] });

        await Swal.fire({
          title: "Deleted!",
          text: "Reference deleted successfully.",
          icon: "success",
          customClass: {
            popup: "swal-popup",
            confirmButton: "swal-ok-btn",
          },
          buttonsStyling: false,
        });
      } catch (error) {
        console.error("Error deleting reference:", error);

        Swal.fire({
          title: "Error!",
          text: "Failed to delete reference.",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const [editItem, setEditItem] = useState(null);

  const editData = (data, modalName) => {
    setEditItem(data);
    setOpenModalName(modalName);
  };

  const setOpenModal = (name) => {
    setEditItem(null);
    setOpenModalName(name);
  };

  if (isEmployeeTrainingListLoading || isEmployeeReferenceListLoading) {
    return (
      <div className="flex justify-center items-center">
        <MiniSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Employee Training</h4>
          <ButtonTw
            onClick={() => setOpenModal("training")}
            variant="blue"
            size="sm"
            className="mt-2"
          >
            <i className="fa-solid fa-plus"></i>Add New
          </ButtonTw>
        </div>

        <AddEmployeeTrainingModal
          editItem={editItem}
          showModal={openModalName === "training"}
          onClose={() => setOpenModal("")}
          id={id}
        />

        {/* Work Experience Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-center">Sl.</th>
                <th className="text-left">Training Name</th>
                <th className="text-left">Training Year</th>
                <th className="text-left">Duration</th>
                <th className="text-center">Description</th>
                <th className="text-center">Address</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employeeTrainingList.length > 0 &&
                employeeTrainingList.map((item, index) => (
                  <tr key={index}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-left">{item.name}</td>
                    <td>{item.trainingYear}</td>
                    <td className="text-center">
                      {item.startDate && item.endDate
                        ? helpers.getYearMonthDayByDates(
                            item.startDate,
                            item.endDate,
                          )
                        : item.startDate && item.isCurrent
                          ? helpers.getYearMonthDayByDates(item.startDate)
                          : item.isCurrent
                            ? "On going"
                            : "-"}
                    </td>
                    <td>{item.description}</td>
                    <td>{item.address}</td>
                    <td>
                      <div className="action">
                        <button
                          onClick={() => editData(item, "training")}
                          type="button"
                          className="btn-action"
                        >
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => deleteTraining(item.id)}
                          type="button"
                          className="btn-action hover:text-red-600"
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* Placeholder row if no data is available */}
              {employeeTrainingList?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400">
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Employee References</h4>

          <ButtonTw
            onClick={() => setOpenModal("reference")}
            variant="blue"
            size="sm"
            className="mt-2"
          >
            <i className="fa-solid fa-plus"></i>Add New
          </ButtonTw>
        </div>
        <AddEmployeeReferences
          editItem={editItem}
          showModal={openModalName === "reference"}
          onClose={() => setOpenModal("")}
          id={id}
        />
        {/* Education details table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Person Info</th>
                <th>Organization</th>
                <th>Relation</th>
                <th>Address</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employeeReferenceList.map((item, index) => (
                <tr key={index}>
                  <td className="text-left">
                    <div className="flex flex-col">
                      <span className="font-semibold">{item.name}</span>
                      <span>{item.designation}</span>
                      <span>{item.phoneWithCallingCode}</span>
                      <span>{item.email}</span>
                    </div>
                  </td>
                  <td>{item.organization}</td>
                  <td>{item.relation}</td>
                  <td>{item.address}</td>
                  <td>
                    <div className="action">
                      <button
                        onClick={() => editData(item, "reference")}
                        type="button"
                        className="btn-action"
                      >
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>
                      <button
                        onClick={() => deleteReference(item.id)}
                        type="button"
                        className="btn-action hover:text-red-600"
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Placeholder row if no data is available */}
              {employeeReferenceList?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400">
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TrainingAndReferenceTab;
