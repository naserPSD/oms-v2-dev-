// /tabs/EmployeeHistoryTab.jsx
"use client";
import ButtonTw from "@/components/ui/ButtonTw";
import { useState } from "react";
import "react-image-crop/dist/ReactCrop.css";
import { useParams } from "next/navigation";
import { useEmployeeProfileQueryApi } from "@/hooks/queryApi/useEmployeeProfileQueryApi";
import MiniSpinner from "@/shared/loader/MiniSpinner";
import AddEmployeeWorkExperience from "../components/general-info/modals/AddEmployeeWorkExperience";
import helpers from "@/utils/helpers";
import AddEmployeeEducationModal from "../components/general-info/modals/AddEmployeeEducationModal";
import Swal from "sweetalert2";
import RestApi from "@/utils/RestApi";
import { getAuthUserInfo } from "@/utils/commonApiFunction";

const WorkExperienceAndEducationTab = () => {
  const { id } = useParams();
  const [openModalName, setOpenModalName] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const editData = (data, modalName) => {
    setEditItem(data);
    setOpenModalName(modalName || "workExperience");
  };

  const setOpenModal = (name) => {
    setEditItem(null);
    setOpenModalName(name);
  };

  const { useEmployeeWorkExperienceListQuery, useEmployeeEducationListQuery } =
    useEmployeeProfileQueryApi({});

  const {
    data: employeeWorkExperienceListResponseData,
    isLoading: isEmployeeWorkExperienceListLoading,
  } = useEmployeeWorkExperienceListQuery(id);

  const {
    data: employeeEducationListResponseData,
    isLoading: isEmployeeEducationListLoading,
  } = useEmployeeEducationListQuery(id);

  const employeeWorkExperienceList =
    employeeWorkExperienceListResponseData?.data || [];
  const employeeEducationList = employeeEducationListResponseData?.data || [];

  const deleteWorkExperience = async (id) => {
    try {
      // 1. Show confirmation dialog
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

      // 2. If user confirms
      if (result.isConfirmed) {
        setLoading(true);

        try {
          // 3. Call API to delete
          await RestApi.delete(`/api/v1/users/delete-work-experience/${id}`);

          // 4. Refresh user info
          await getAuthUserInfo(setLoading);

          // 5. Show success message
          await Swal.fire({
            title: "Deleted!",
            text: "Work experience deleted successfully.",
            icon: "success",
            customClass: {
              popup: "swal-popup",
              confirmButton: "swal-ok-btn",
            },
            buttonsStyling: false,
          });
        } catch (error) {
          console.error("Error deleting work experience:", error);

          // 6. Show error message to user
          Swal.fire({
            title: "Error!",
            text: "Failed to delete work experience.",
            icon: "error",
            customClass: {
              popup: "swal-popup",
              confirmButton: "swal-ok-btn",
            },
            buttonsStyling: false,
          });
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const deleteEducation = async (id) => {
    console.log("Deleting education:", id);

    try {
      // 1. Show confirmation dialog
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

      // 2. If user confirms
      if (result.isConfirmed) {
        setLoading(true);
        try {
          // 3. Delete via API
          await RestApi.delete(`/api/v1/users/delete-education/${id}`);

          // 4. Refresh user info
          await getAuthUserInfo(setLoading);

          // 5. Show success popup
          await Swal.fire({
            title: "Deleted!",
            text: "Education deleted successfully.",
            icon: "success",
            customClass: {
              popup: "swal-popup",
              confirmButton: "swal-ok-btn",
            },
            buttonsStyling: false,
          });
        } catch (error) {
          console.error("Error deleting education:", error);

          // 6. Show error popup to user
          Swal.fire({
            title: "Error!",
            text: "Failed to delete education.",
            icon: "error",
            customClass: {
              popup: "swal-popup",
              confirmButton: "swal-ok-btn",
            },
            buttonsStyling: false,
          });
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  if (isEmployeeWorkExperienceListLoading || isEmployeeEducationListLoading) {
    return (
      <div className="flex justify-center items-center">
        <MiniSpinner />
      </div>
    );
  }

  const getTotalWorkExperience = () => {
    let totalExperienceMonths = 0;

    employeeWorkExperienceList?.forEach((experience) => {
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
          <h4 className="font-bold text-lg title-color">
            Employee Work Experience (Total: {getTotalWorkExperience()})
          </h4>
          <ButtonTw
            onClick={() => setOpenModal("workExperience")}
            variant="blue"
            size="sm"
            className="mt-2"
          >
            <i className="fa-solid fa-plus"></i>Add New
          </ButtonTw>
        </div>

        <AddEmployeeWorkExperience
          editItem={editItem}
          showModal={openModalName === "workExperience"}
          onClose={() => setOpenModal("")}
          id={id}
        />

        {/* Work Experience Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-center">Sl.</th>
                <th className="text-left">Company Name</th>
                <th className="text-left">Designation</th>
                <th className="text-left">Responsibility</th>
                <th className="text-center">Job Duration</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employeeWorkExperienceList?.map((experience, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-left">{experience.companyName}</td>
                  <td>{experience.jobTitle}</td>
                  <td>{experience.responsibility}</td>
                  <td className="text-center">
                    {experience.endDate
                      ? helpers.getYearMonthsByDates(
                          experience.startDate,
                          experience.endDate,
                        )
                      : helpers.getYearMonthsByDates(experience.startDate)}
                  </td>
                  <td>
                    <div className="action">
                      <button
                        onClick={() => editData(experience, "workExperience")}
                        type="button"
                        className="btn-action"
                      >
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>
                      <button
                        onClick={() => deleteWorkExperience(experience.id)}
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
              {employeeWorkExperienceList?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400">
                    No Work Experience Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">
            Employee Education Details
          </h4>
          <ButtonTw
            onClick={() => setOpenModal("education")}
            variant="blue"
            size="sm"
            className="mt-2"
          >
            <i className="fa-solid fa-plus"></i>Add New
          </ButtonTw>
        </div>

        <AddEmployeeEducationModal
          editItem={editItem}
          showModal={openModalName === "education"}
          onClose={() => setOpenModal("")}
          id={id}
        />

        {/* Education details table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Education Level</th>
                <th>Group</th>
                <th>Institute Name</th>
                <th className="text-center">Passing Year</th>
                <th className="text-center">Result</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employeeEducationList?.map((education, index) => (
                <tr key={index}>
                  <td className="text-left">
                    {education?.educationLevel?.name}
                  </td>
                  <td>{education?.group?.name}</td>
                  <td>{education.instituteName}</td>
                  <td className="text-center">{education.yearOfPassing}</td>
                  <td className="text-center">{`${education.result} (${education?.resultType?.name})`}</td>
                  <td>
                    <div className="action">
                      <button
                        onClick={() => editData(education, "education")}
                        type="button"
                        className="btn-action"
                      >
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>
                      <button
                        onClick={() => deleteEducation(education.id)}
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
              {employeeEducationList?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400">
                    No Education Available
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

export default WorkExperienceAndEducationTab;
