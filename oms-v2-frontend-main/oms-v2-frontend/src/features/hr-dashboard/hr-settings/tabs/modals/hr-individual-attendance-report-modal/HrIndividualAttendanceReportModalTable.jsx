import { attendanceData } from "@/utils/attendanceData";
import { FaDesktop } from "react-icons/fa";
import { FaClock, FaFingerprint } from "react-icons/fa6";
import { HiOutlineDocumentText, HiOutlineSwitchVertical } from "react-icons/hi";
const HrIndividualAttendanceReportModalTable = () => {
  const headerData = [
    { title: "Date ", icon: FaClock },
    { title: "Status", icon: FaFingerprint },
    { title: "Check In & Out", icon: FaClock },
    { title: "Device & Ip", icon: FaDesktop },
    { title: "Notes/Reasons", icon: HiOutlineDocumentText },
  ];
  return (
    <div>
      {" "}
      <div className="table-container max-h-[60vh] overflow-y-auto sidebar-scroll ">
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
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className={`text-${item.statusColor}`}>
                      {item.inTime}
                    </span>{" "}
                    <span className="text-gray-500 ">{item.totalHour}</span>
                    <span className="dark-title-color font-bold">
                      {item.outTime}
                    </span>
                  </div>
                </td>
                <td className="text-center">
                  <span
                    className={`text-white px-3  py-1 whitespace-nowrap rounded-full text-sm font-medium bg-${item.statusColor}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>{item.overTime || "-----"}</td>
                <td>
                  <p className="inline-flex items-center gap-2 dark-title-color">
                    <FaDesktop /> {item.desktopName}
                  </p>
                  <p className="dark-title-color">
                    <span className="font-bold">IP:</span>
                    {item.ip}
                  </p>
                </td>
                <td>{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HrIndividualAttendanceReportModalTable;
