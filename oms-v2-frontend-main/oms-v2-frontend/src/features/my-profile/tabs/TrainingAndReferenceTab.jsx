// /tabs/EmployeeHistoryTab.jsx
"use client";
import ButtonTw from "@/components/ui/ButtonTw";
import { useState } from "react";
import "react-image-crop/dist/ReactCrop.css";
import AddWorkExperienceModal from "./modals/AddWorkExperienceModal";
import { useAuthStore } from "@/store/useAuthStore";
import helpers, { toaster } from "@/utils/helpers";
import RestApi from "@/utils/RestApi";
import Swal from "sweetalert2";
import { getAuthUserInfo } from "@/utils/commonApiFunction";
import AddEducationModal from "./modals/AddEducationModal";
import { useTheme } from "next-themes";
import AddTrainingModal from "./modals/AddTrainingModal";
import AddReferenceModal from "./modals/AddReferenceModal";

const TrainingAndReferenceTab = () => {
  const [workExperienceOpen, setWorkExperienceOpen] = useState(false);

  const { theme, setTheme } = useTheme();

  const user = useAuthStore((state) => state.user);
  const [openModalName, setOpenModalName] = useState("");
  const [isLoading, setLoading] = useState(false);

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
        await RestApi.delete(`/api/v1/users/delete-training/${id}`);

        await getAuthUserInfo(); // no need to pass setLoading

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
        await RestApi.delete(`/api/v1/users/delete-reference/${id}`);

        await getAuthUserInfo();

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

  const getTotalWorkExperience = () => {
    let totalExperienceMonths = 0;

    user?.userWorkExperiences?.forEach((experience) => {
      const startDate = new Date(experience.startDate);
      const endDate = experience.endDate
        ? new Date(experience.endDate)
        : new Date();
      const diffInTime = endDate - startDate;
      const diffInMonths = Math.floor(diffInTime / (1000 * 60 * 60 * 24 * 30));
      totalExperienceMonths += diffInMonths;
    });

    return helpers.getMonthsToYear(totalExperienceMonths);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Training</h4>

          {!user?.profileCompleted && (
            <ButtonTw
              onClick={() => setOpenModal("training")}
              variant="blue"
              size="sm"
              className="mt-2"
            >
              <i className="fa-solid fa-plus"></i>Add New
            </ButtonTw>
          )}
        </div>
        <AddTrainingModal
          editItem={editItem}
          showModal={openModalName === "training"}
          onClose={() => setOpenModal("")}
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
                {!user?.profileCompleted && (
                  <th className="text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {user?.userTrainings?.length > 0 &&
                user?.userTrainings?.map((item, index) => (
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
                    {!user?.profileCompleted && (
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
                    )}
                  </tr>
                ))}

              {/* Placeholder row if no data is available */}
              {user?.userTrainings.length === 0 && (
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
          <h4 className="font-bold text-lg title-color">References</h4>

          {!user?.profileCompleted && (
            <ButtonTw
              onClick={() => setOpenModal("reference")}
              variant="blue"
              size="sm"
              className="mt-2"
            >
              <i className="fa-solid fa-plus"></i>Add New
            </ButtonTw>
          )}
        </div>

        <AddReferenceModal
          editItem={editItem}
          showModal={openModalName === "reference"}
          onClose={() => setOpenModal("")}
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
                {!user?.profileCompleted && (
                  <th className="text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {user?.userReferences?.map((item, index) => (
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
                  {!user?.profileCompleted && (
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
                  )}
                </tr>
              ))}

              {/* Placeholder row if no data is available */}
              {user?.userReferences?.length === 0 && (
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
