// /tabs/EmployeeHistoryTab.jsx
"use client";
import ButtonTw from "@/components/ui/ButtonTw";
import { useState } from "react";
import "react-image-crop/dist/ReactCrop.css";
import AddWorkExperienceModal from "./modals/AddWorkExperienceModal";
import { useAuthStore } from "@/store/useAuthStore";
import helpers, { toaster } from "@/utils/helpers";
import RestApi from "@/utils/RestApi";
import Swal from 'sweetalert2'
import { getAuthUserInfo } from "@/utils/commonApiFunction";
import AddEducationModal from "./modals/AddEducationModal";
import { useTheme } from "next-themes";

const WorkExperienceAndEducationTab = () => {
  const [workExperienceOpen, setWorkExperienceOpen] = useState(false);

  const { theme, setTheme } = useTheme()

  const user = useAuthStore((state) => state.user);
  const [openModalName, setOpenModalName] = useState('');
  const [isLoading, setLoading] = useState(false);

  const deleteWorkExperience = async (id) => {
    // Logic to delete work experience by id
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: 'swal-popup',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
      },
      buttonsStyling: false
    }).then( async(result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await RestApi.delete(`/users/delete-work-experience/${id}`);
          await getAuthUserInfo(setLoading);
          // toaster('Work experience deleted successfully', 'success');
          Swal.fire({
            title: "Deleted!",
            text: "Work experience deleted successfully.",
            icon: "success"
          });
        } catch (error) {
          console.error("Error deleting work experience:", error);
          // helpers.handleApiValidationError(error, setError);
        } finally {
          setLoading(false);
        }
        
      }
    });
    
  };

  const deleteEducation = async (id) => {
    // Logic to delete work experience by id
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: 'swal-popup',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await RestApi.delete(`/users/delete-education/${id}`);
          await getAuthUserInfo(setLoading);
          // toaster('Work experience deleted successfully', 'success');
          Swal.fire({
            title: "Deleted!",
            text: "Education deleted successfully.",
            icon: "success"
          });
        } catch (error) {
          console.error("Error deleting item:", error);
          // helpers.handleApiValidationError(error, setError);
        } finally {
          setLoading(false);
        }

      }
    });

  };

  const [editItem, setEditItem] = useState(null);

  const editData = (data, modalName) => {
    console.log("Editing data:", data);
    setEditItem(data);
    setOpenModalName(modalName || 'workExperience');
  };

  const setOpenModal = (name) => {
    setEditItem(null);
    setOpenModalName(name);
  };

  const getTotalWorkExperience = () => {
    let totalExperienceMonths = 0

     user?.userWorkExperiences?.forEach((experience) => {
      const startDate = new Date(experience.startDate);
      const endDate = experience.endDate ? new Date(experience.endDate) : new Date();
      const diffInTime = endDate - startDate;
      const diffInMonths = Math.floor(diffInTime / (1000 * 60 * 60 * 24 * 30));
      totalExperienceMonths += diffInMonths;
    });

    return helpers.getMonthsToYear(totalExperienceMonths)
  }

  return (
    <>
      <div className="flex flex-col gap-2">

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Work Experience (Total: {getTotalWorkExperience()})</h4>
          <ButtonTw onClick={() => setOpenModal('workExperience')} variant="blue" size="sm" className="mt-2"><i className="fa-solid fa-plus"></i>Add New</ButtonTw>
        </div>
        <AddWorkExperienceModal editItem={editItem} showModal={openModalName === 'workExperience'} onClose={() => setOpenModal('')} />

        {/* Work Experience Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-center">Sl.</th>
                <th className="text-center">Company Name</th>
                <th className="text-center">Designation</th>
                <th className="text-center">Responsibility</th>
                <th className="text-center">Job Duration</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {user?.userWorkExperiences?.map((experience, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">{experience.companyName}</td>
                  <td>{experience.jobTitle}</td>
                  <td>{experience.responsibility}</td>
                  <td className="text-center">
                    {experience.endDate ? helpers.getYearMonthsByDates(experience.startDate, experience.endDate) : helpers.getYearMonthsByDates(experience.startDate)}
                  </td>
                  <td>
                    <div className="action">
                      <button onClick={() => editData(experience, 'workExperience')} type="button" className="btn-action">
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
              {user?.userWorkExperiences?.length === 0 && (
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
          <h4 className="font-bold text-lg title-color">Education Details</h4>
          <ButtonTw
            onClick={() => setOpenModal('education')}
            variant="blue"
            size="sm"
            className="mt-2"
          >
            <i className="fa-solid fa-plus"></i>Add New
          </ButtonTw>
        </div>

        <AddEducationModal editItem={editItem} showModal={openModalName === 'education'} onClose={() => setOpenModal('')} />

        {/* Education details table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Education Level</th>
                <th>Group</th>
                <th>Institute Name</th>
                <th>Passing Year</th>
                <th className="text-center">Result</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>

              {user?.educations?.map((education, index) => (
                <tr key={index}>
                  <td className="text-center">{education.educationLevelName}</td>
                  <td>{education.groupName}</td>
                  <td>{education.instituteName}</td>
                  <td className="text-center">{education.yearOfPassing}</td>
                  <td className="text-center">{`${education.result} (${education.resultTypeName})`}</td>
                  <td>
                    <div className="action">
                      <button onClick={() => editData(education, 'education')} type="button" className="btn-action">
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
              {user?.userWorkExperiences?.length === 0 && (
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
