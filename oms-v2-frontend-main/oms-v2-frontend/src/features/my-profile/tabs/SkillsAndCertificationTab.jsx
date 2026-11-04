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

const SkillsAndCertificationTab = () => {
  const { theme, setTheme } = useTheme();

  const user = useAuthStore((state) => state.user);
  const [openModalName, setOpenModalName] = useState("");
  const [isLoading, setLoading] = useState(false);

  const deleteCertification = async (id) => {
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

      if (result.isConfirmed) {
        setLoading(true);

        try {
          await RestApi.delete(`/api/v1/users/delete-certification/${id}`);

          await getAuthUserInfo(); // no need to pass setLoading here

          await Swal.fire({
            title: "Deleted!",
            text: "Certification deleted successfully.",
            icon: "success",
            customClass: {
              popup: "swal-popup",
              confirmButton: "swal-ok-btn",
            },
            buttonsStyling: false,
          });
        } catch (error) {
          console.error("Error deleting certification:", error);

          Swal.fire({
            title: "Error!",
            text: "Failed to delete certification.",
            icon: "error",
          });
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const deleteSkill = async (id) => {
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

      if (result.isConfirmed) {
        setLoading(true);

        try {
          await RestApi.delete(`/api/v1/users/delete-skill/${id}`);

          await getAuthUserInfo();

          await Swal.fire({
            title: "Deleted!",
            text: "Skill deleted successfully.",
            icon: "success",
            customClass: {
              popup: "swal-popup",
              confirmButton: "swal-ok-btn",
            },
            buttonsStyling: false,
          });
        } catch (error) {
          console.error("Error deleting skill:", error);

          Swal.fire({
            title: "Error!",
            text: "Failed to delete skill.",
            icon: "error",
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

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Certifications</h4>

          {!user?.profileCompleted && (
            <ButtonTw
              onClick={() => setOpenModal("certification")}
              variant="blue"
              size="sm"
              className="mt-2"
            >
              <i className="fa-solid fa-plus"></i>Add New
            </ButtonTw>
          )}
        </div>
        <AddCertificationModal
          editItem={editItem}
          showModal={openModalName === "certification"}
          onClose={() => setOpenModal("")}
        />

        {/* Work Experience Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-center">Sl.</th>
                <th className="text-left">Certification Name</th>
                <th className="text-left">Issuing Organization</th>
                <th className="text-center">Issue Date</th>
                <th className="text-center">Expiration Date</th>
                <th className="text-center">Attachment</th>
                {!user?.profileCompleted && (
                  <th className="text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {user?.userCertifications?.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-left">{item.name}</td>
                  <td>{item.issuingOrganization}</td>
                  <td>{helpers.dDate(item.issueDate)}</td>
                  <td>{helpers.dDate(item.expirationDate)}</td>
                  <td className="text-center">
                    <SimpleTooltip text="Click to view or download attachment">
                      {item.attachmentMedia && (
                        <a
                          href={item.attachmentMedia?.fileUrl}
                          download={true}
                          target="_blank"
                          className="badge badge-circle badge-outline-primary hover:bg-blue-200 dark:hover:bg-gray-600"
                        >
                          <i className="fa-solid fa-download"></i>
                        </a>
                      )}
                    </SimpleTooltip>
                  </td>
                  {!user?.profileCompleted && (
                    <td>
                      <div className="action">
                        <button
                          onClick={() => editData(item, "certification")}
                          type="button"
                          className="btn-action"
                        >
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => deleteCertification(item.id)}
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
              {user?.userCertifications?.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400">
                    No Certifications Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Skills</h4>

          {!user?.profileCompleted && (
            <ButtonTw
              onClick={() => setOpenModal("skill")}
              variant="blue"
              size="sm"
              className="mt-2"
            >
              <i className="fa-solid fa-plus"></i>Add New
            </ButtonTw>
          )}
        </div>

        <AddSkillModal
          editItem={editItem}
          showModal={openModalName === "skill"}
          onClose={() => setOpenModal("")}
        />

        {/* Skills table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Level</th>
                <th className="text-center">Year of Experience</th>
                <th className="text-center">Technical</th>

                {!user?.profileCompleted && (
                  <th className="text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {user?.userSkills?.map((item, index) => (
                <tr key={index}>
                  <td>{item.skillName}</td>
                  <td>{item.skillLevel}</td>
                  <td className="text-center">
                    {item.yearsOfExperience && (
                      <span
                        className={`badge badge-circle badge-outline-secondary`}
                      >
                        {item.yearsOfExperience}
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge badge-rounded ${item.isTechnical ? "badge-outline-success" : "badge-outline-danger"}`}
                    >
                      {item.isTechnical ? "Yes" : "No"}
                    </span>
                  </td>

                  {!user?.profileCompleted && (
                    <td>
                      <div className="action">
                        <button
                          onClick={() => editData(item, "skill")}
                          type="button"
                          className="btn-action"
                        >
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => deleteSkill(item.id)}
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
              {user?.userSkills?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400">
                    No Skills Available
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

export default SkillsAndCertificationTab;
