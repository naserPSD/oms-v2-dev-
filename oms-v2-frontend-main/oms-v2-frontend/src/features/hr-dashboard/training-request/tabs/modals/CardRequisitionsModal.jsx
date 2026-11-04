"use client";
import { ModalTw } from "@/components/common/ModalTw";
import { FaMoneyBillWave, FaUser } from "react-icons/fa6";
import {
  HiOutlineDocumentText,
  HiOutlineOfficeBuilding,
  HiOutlineSwitchVertical,
} from "react-icons/hi";
const CardRequisitionsModal = ({ showModal, handleClose, title, data = [] }) => {
  const headerData = [
    { title: "Employee Name", icon: FaUser },
    { title: "Training Name", icon: HiOutlineDocumentText },
    { title: "Department", icon: HiOutlineOfficeBuilding },
    { title: "Location", icon: HiOutlineOfficeBuilding },
    { title: "Estimate Cost", icon: FaMoneyBillWave },
  ];

  const getDepartmentName = (item) => {
    const department =
      item?.employee?.department?.name ||
      item?.department?.name ||
      item?.department ||
      item?.employee?.department ||
      "N/A";

    return typeof department === "string" ? department : department?.name || "N/A";
  };

  const getDisplayName = (item) => {
    const employee = item?.employee ?? {};
    const user = employee.user ?? item?.user ?? {};
    return (
      user.fullName ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      item?.employeeName ||
      item?.name ||
      "Unknown Employee"
    );
  };

  const getEmployeeCode = (item) => {
    const employee = item?.employee ?? {};
    return employee.employeeCode || item?.employeeCode || "N/A";
  };

  const getAvatarUrl = (item) => {
    const employee = item?.employee ?? {};
    const user = employee.user ?? item?.user ?? {};
    return (
      user?.profile?.profilePicture?.url ||
      user?.profilePicture?.url ||
      "/images/default-avatar.png"
    );
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "N/A";
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return String(value);
    return `${numericValue.toLocaleString()} ৳`;
  };

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={title}
        size="4xl"
        onConfirm={handleClose}
        dismissible={true}
        confirmText="Confirm"
        cancelText="Cancel"
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <div>
          <div className="table-container max-h-[70vh] overflow-y-auto sidebar-scroll">
            <table className="table">
              <thead>
                <tr>
                  {headerData.map(({ title, icon: IconComponent }) => (
                    <th key={title} className="align-middle">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-3 h-3 text-gray-400" />
                          <span className="whitespace-nowrap">{title}</span>
                        </div>
                        <HiOutlineSwitchVertical className="text-gray-500 w-4 h-4" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No requests found.
                    </td>
                  </tr>
                ) : (
                  data.map((item, i) => {
                    const fullName = getDisplayName(item);
                    const departmentName = getDepartmentName(item);
                    const trainingName = item?.itemDescription || item?.name || "N/A";
                    const estimatedCost = formatCurrency(item?.estimatedCost ?? 0);

                    return (
                      <tr key={item?.id ?? i} className="align-middle">
                        <td className="align-middle">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <img
                              src={getAvatarUrl(item)}
                              alt={fullName}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 dark:text-white">
                                {fullName}
                              </p>
                              <p className="text-xs text-gray-500">{getEmployeeCode(item)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="align-middle whitespace-nowrap">{trainingName}</td>
                        <td className="align-middle whitespace-nowrap">{departmentName}</td>
                        <td className="align-middle whitespace-nowrap">{item.locationName || "N/A"}</td>
                        <td className="align-middle whitespace-nowrap">{estimatedCost}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ModalTw>
    </div>
  );
};

export default CardRequisitionsModal;
