import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import helpers from "@/utils/helpers";
import React, { useMemo } from "react";
import { useState } from "react";
import AddEmployeeCertificationModal from "../components/general-info/modals/AddEmployeeCertificationModal";
import AddEmployeeSkills from "../components/general-info/modals/AddEmployeeSkills";
import Swal from "sweetalert2";
import RestApi from "@/utils/RestApi";
import { useQueryClient } from "@tanstack/react-query";

const EmployeeSkillAndCertificationTab = ({ employeeId }) => {
  const queryClient = useQueryClient(); // ✅ useQueryClient hook
  const { employeeCertificationsQuery, employeeSkillsQuery } = useHrQueryApi();
  const [openModalName, setOpenModalName] = useState("");
  const [isLoading, setLoading] = useState(false);

  const { data: certificationsResponse, isLoading: isCertificationsFetching } =
    employeeCertificationsQuery(employeeId);

  const certificationsArray = useMemo(
    () => certificationsResponse?.data || [],
    [certificationsResponse?.data],
  );

  const { data: skillsResponse, isLoading: isSkillsFetching } =
    employeeSkillsQuery(employeeId);

  const skillsArray = useMemo(
    () => skillsResponse?.data || [],
    [skillsResponse?.data],
  );

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
          await RestApi.delete(`api/v1/users/delete-certification/${id}`);

          queryClient.invalidateQueries({ queryKey: ["certifications"] });

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
          await RestApi.delete(`api/v1/users/delete-skill/${id}`);

          queryClient.invalidateQueries({ queryKey: ["skills"] });

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

  const isLoadings = isCertificationsFetching || isSkillsFetching;

  return (
    <>
      {/* Certifications Section */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">
            Employee Certifications
          </h4>

          <ButtonTw
            onClick={() => setOpenModal("certification")}
            variant="blue"
            size="sm"
            className="mt-2"
          >
            <i className="fa-solid fa-plus"></i>Add New
          </ButtonTw>
        </div>

        <AddEmployeeCertificationModal
          editItem={editItem}
          showModal={openModalName === "certification"}
          onClose={() => setOpenModal("")}
          employeeId={employeeId}
        />

        {/* Certifications Table */}
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
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoadings ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="text-center">
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-800 h-6 rounded"></div>
                    </td>
                    <td>
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-800 h-6 rounded"></div>
                    </td>
                    <td>
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-800 h-6 rounded"></div>
                    </td>
                    <td className="text-center">
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-800 h-6 rounded"></div>
                    </td>
                    <td className="text-center">
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-800 h-6 rounded"></div>
                    </td>
                    <td className="text-center">
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-800 h-6 rounded"></div>
                    </td>
                    <td className="text-center">
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-800 h-6 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : certificationsArray?.length > 0 ? (
                certificationsArray.map((item, index) => (
                  <tr key={item?.id || index}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-left">{item?.name}</td>
                    <td>{item?.issuingOrganization}</td>
                    <td className="text-center">
                      {helpers.dDate(item?.issueDate)}
                    </td>
                    <td className="text-center">
                      {helpers.dDate(item?.expirationDate)}
                    </td>

                    <td className="text-center">
                      <SimpleTooltip text="Click to view or download attachment">
                        {item?.fileUrl && (
                          <a
                            href={item?.fileUrl}
                            download={true}
                            target="_blank"
                            className="badge badge-circle badge-outline-primary hover:bg-blue-200 dark:hover:bg-gray-600"
                          >
                            <i className="fa-solid fa-download"></i>
                          </a>
                        )}
                      </SimpleTooltip>
                    </td>

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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-4">
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skills Section */}
      <div className="flex flex-col gap-2 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Employee Skills</h4>

          <ButtonTw
            onClick={() => setOpenModal("skill")}
            variant="blue"
            size="sm"
            className="mt-2"
          >
            <i className="fa-solid fa-plus"></i>Add New
          </ButtonTw>
        </div>

        <AddEmployeeSkills
          editItem={editItem}
          showModal={openModalName === "skill"}
          onClose={() => setOpenModal("")}
          employeeId={employeeId}
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
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {isLoadings ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td>
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-800 h-6 rounded"></div>
                    </td>
                    <td>
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-800 h-6 rounded"></div>
                    </td>
                    <td className="text-center">
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-800 h-6 rounded"></div>
                    </td>
                    <td className="text-center">
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-800 h-6 rounded"></div>
                    </td>
                    <td className="text-center">
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-800 h-6 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : skillsArray?.length > 0 ? (
                skillsArray.map((item, index) => (
                  <tr key={item?.id || index}>
                    <td>{item?.skillName}</td>
                    <td>{item?.skillLevel}</td>

                    <td className="text-center">
                      {item?.yearsOfExperience ? (
                        <span className="badge badge-circle badge-outline-secondary">
                          {item?.yearsOfExperience}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="text-center">
                      <span
                        className={`badge badge-rounded ${
                          item?.isTechnical
                            ? "badge-outline-success"
                            : "badge-outline-danger"
                        }`}
                      >
                        {item?.isTechnical ? "Yes" : "No"}
                      </span>
                    </td>

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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 py-4">
                    No Data Found
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

export default EmployeeSkillAndCertificationTab;
