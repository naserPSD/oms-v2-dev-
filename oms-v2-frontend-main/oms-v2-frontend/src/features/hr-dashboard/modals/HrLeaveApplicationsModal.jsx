"use client";
import { useState } from "react";
import { ModalTw } from "@/components/common/ModalTw";
import { attendanceData } from "@/utils/attendanceData";
import { FaClock, FaFingerprint, FaUser } from "react-icons/fa6";
import { HiOutlineDocumentText, HiOutlineSwitchVertical } from "react-icons/hi";
import HrIndividualLeaveReportModal from "../hr-leave/tabs/modals/HrIndividualLeaveReportModal";
const HrLeaveApplicationsModal = ({ showModal, handleClose }) => {
  const [showModal2, setShowModal2] = useState(false);

  const headerData = [
    { title: "Employee detail", icon: FaUser },
    { title: "Applied on", icon: FaFingerprint },
    { title: "Date & Duration", icon: FaClock },
    { title: "Notes/Reasons", icon: HiOutlineDocumentText },
  ];
  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={"Leave Applications"}
        size="3xl"
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
          {/* Table */}
          <div className="table-container max-h-[70vh] overflow-y-auto sidebar-scroll ">
            <table className="table">
              <thead>
                <tr>
                  {headerData.map(({ title, icon: IconComponent }) => (
                    <th key={title}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-3 h-3 text-gray-400 " />
                          <span className="whitespace-nowrap">{title}</span>
                        </div>
                        <HiOutlineSwitchVertical className="text-gray-500 w-4 h-4" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendanceData?.map((item, i) => (
                  <tr key={i}>
                    <td>
                      {" "}
                      <div
                        className=" flex items-center gap-2 whitespace-nowrap cursor-pointer"
                        onClick={() => setShowModal2(true)}
                      >
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-semibold dark-title-color">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center  flex-col ">
                        <p className="dark-title-color font-semibold">
                          01 Jan 2025
                        </p>
                        <p className="title-color">15 days ago</p>
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center  flex-col ">
                        <p className="dark-title-color font-semibold">
                          01 Jan 2025
                        </p>
                        <p className="title-color">15 days ago</p>
                      </div>
                    </td>

                    <td>{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ModalTw>{" "}
      {/* Modal */}
      <HrIndividualLeaveReportModal
        showModal={showModal2}
        handleClose={() => setShowModal2(false)}
      />
    </div>
  );
};

export default HrLeaveApplicationsModal;
