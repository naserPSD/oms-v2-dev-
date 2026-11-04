import { ModalTw } from "@/components/common/ModalTw";
import { attendanceData } from "@/utils/attendanceData";
import { FaClock, FaFingerprint, FaUser } from "react-icons/fa6";
import { HiOutlineDocumentText, HiOutlineSwitchVertical } from "react-icons/hi";
import { MdDateRange } from "react-icons/md";
const HrPendingAttendanceApprovalModal = ({ showModal, handleClose }) => {
  const headerData = [
    { title: "Employee Detail", icon: FaUser },
    { title: "Attendance Date", icon: MdDateRange },
    { title: "Check In / Check Out", icon: FaClock },
    { title: "Applied On", icon: FaFingerprint },
    { title: "Reason / Notes", icon: HiOutlineDocumentText },
  ];
  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={"Pending attendance approval"}
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
                      <div className=" flex items-center gap-2 whitespace-nowrap cursor-pointer">
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
                    {/* in time and out time */}
                    <td>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-${item.statusColor}`}>
                          {item.inTime}
                        </span>{" "}
                        <span className="text-gray-500 ">{item.totalHour}</span>
                        <span className="dark-title-color font-bold">
                          {item.outTime}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ModalTw>
    </div>
  );
};

export default HrPendingAttendanceApprovalModal;
