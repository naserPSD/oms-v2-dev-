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
import AddSkillModal from "./modals/AddSkillModal";
import { Badge } from "@/components/ui/badge";
import AddCertificationModal from "./modals/AddCertificationModal";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AddProjectModal from "./modals/AddProjectModal";

const ProjectTab = () => {
  const { theme, setTheme } = useTheme();

  const user = useAuthStore((state) => state.user);
  const [openModalName, setOpenModalName] = useState("");
  const [isLoading, setLoading] = useState(false);

  const deleteProject = async (id) => {
    try {
      // 1. Show confirmation popup
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
          // 3. Delete API call
          await RestApi.delete(`/api/v1/users/delete-project/${id}`);

          // 4. Refresh user info
          await getAuthUserInfo(setLoading);

          // 5. Success popup
          await Swal.fire({
            title: "Deleted!",
            text: "Project deleted successfully.",
            icon: "success",
            customClass: {
              popup: "swal-popup",
              confirmButton: "swal-ok-btn",
            },
            buttonsStyling: false,
          });
        } catch (error) {
          console.error("Error deleting project:", error);

          // 6. Show error popup
          Swal.fire({
            title: "Error!",
            text: "Failed to delete project.",
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
          <h4 className="font-bold text-lg title-color">Projects</h4>

          {!user?.profileCompleted && (
            <ButtonTw
              onClick={() => setOpenModal("project")}
              variant="blue"
              size="sm"
              className="mt-2"
            >
              <i className="fa-solid fa-plus"></i>Add New
            </ButtonTw>
          )}
        </div>
        <AddProjectModal
          editItem={editItem}
          showModal={openModalName === "project"}
          onClose={() => setOpenModal("")}
        />

        {/* Work Experience Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-center">Sl.</th>
                <th className="text-left">Project Name</th>
                {/* <th className="text-left">Project URL</th> */}
                <th className="text-center">Project Duration</th>
                <th className="text-center">Description</th>
                <th className="text-center">Used Technologies</th>
                {!user?.profileCompleted && (
                  <th className="text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {user?.userProjects?.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  {/* <td className="text-left">{item.projectName}</td> */}
                  <td>
                    {/* <a href={item.projectUrl} target="_blank" className="btn-action text-blue-500 hover:text-blue-700">
                      {item.projectName}
                    </a> */}
                    {item.projectUrl && (
                      <a
                        href={item.projectUrl}
                        target="_blank"
                        className="btn-link"
                      >
                        {item.projectName}{" "}
                        <i className="fa-solid fa-up-right-from-square"></i>
                      </a>
                    )}
                    {!item.projectUrl && <span>{item.projectName}</span>}
                  </td>
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
                  <td>{item.usedTechnologies}</td>
                  {/* <td className="text-center">
                    <SimpleTooltip text="Click to view or download attachment">
                      {item.attachmentMedia && (
                        <a href={item.attachmentMedia?.fileUrl} download={true} target="_blank" className="badge badge-circle badge-outline-primary hover:bg-blue-200 dark:hover:bg-gray-600">
                          <i className="fa-solid fa-download"></i>
                        </a>
                      )}
                    </SimpleTooltip>
                  </td> */}
                  {!user?.profileCompleted && (
                    <td>
                      <div className="action">
                        <button
                          onClick={() => editData(item, "project")}
                          type="button"
                          className="btn-action"
                        >
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => deleteProject(item.id)}
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
              {user?.userProjects?.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400">
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

export default ProjectTab;
