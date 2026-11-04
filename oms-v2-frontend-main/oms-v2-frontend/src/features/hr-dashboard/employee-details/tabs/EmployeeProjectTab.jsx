import ButtonTw from "@/components/ui/ButtonTw";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import helpers from "@/utils/helpers";
import React, { useMemo, useState } from "react";
import AddEmployeeProjectModal from "../components/general-info/modals/AddEmployeeProjectModal";
import Swal from "sweetalert2";
import RestApi from "@/utils/RestApi";
import { useQueryClient } from "@tanstack/react-query";

const EmployeeProjectTab = ({ employeeId }) => {
  const queryClient = useQueryClient(); // ✅ useQueryClient hook

  const { employeeProgectQuery } = useHrQueryApi();

  const [openModalName, setOpenModalName] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const editData = (data, modalName) => {
    setEditItem(data);
    setOpenModalName(modalName);
  };

  const setOpenModal = (name) => {
    setEditItem(null);
    setOpenModalName(name);
  };

  const { data: progectResponse, isLoading: isProgectFetching } =
    employeeProgectQuery(employeeId);

  const progectArray = useMemo(
    () => progectResponse?.data || [],
    [progectResponse?.data],
  );

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

          queryClient.invalidateQueries({ queryKey: ["progect"] });

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

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Employee Projects</h4>

          <ButtonTw
            onClick={() => setOpenModal("project")}
            variant="blue"
            size="sm"
            className="mt-2"
          >
            <i className="fa-solid fa-plus"></i>Add New
          </ButtonTw>
        </div>

        <AddEmployeeProjectModal
          editItem={editItem}
          showModal={openModalName === "project"}
          onClose={() => setOpenModal("")}
          employeeId={employeeId}
        />

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-center">Sl.</th>
                <th className="text-left">Project Name</th>
                <th className="text-center">Project Duration</th>
                <th className="text-center">Description</th>
                <th className="text-center">Used Technologies</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {isProgectFetching ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="text-center">
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-800 h-6 rounded"></div>
                    </td>
                    <td>
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-800 h-6 rounded"></div>
                    </td>
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
                  </tr>
                ))
              ) : progectArray?.length > 0 ? (
                progectArray.map((item, index) => (
                  <tr key={item?.id || index}>
                    <td className="text-center">{index + 1}</td>
                    <td>
                      {item.projectUrl ? (
                        <a
                          href={item.projectUrl}
                          target="_blank"
                          className="btn-link"
                        >
                          {item.projectName}{" "}
                          <i className="fa-solid fa-up-right-from-square"></i>
                        </a>
                      ) : (
                        <span>{item.projectName}</span>
                      )}
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
    </>
  );
};

export default EmployeeProjectTab;
