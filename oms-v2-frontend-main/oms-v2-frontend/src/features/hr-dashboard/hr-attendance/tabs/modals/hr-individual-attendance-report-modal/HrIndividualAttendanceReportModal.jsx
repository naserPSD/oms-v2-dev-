import { ModalTw } from "@/components/common/ModalTw";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import Image from "next/image";
import {
  FaArrowAltCircleDown,
  FaArrowAltCircleUp,
  FaMinusCircle,
} from "react-icons/fa";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { HiOutlineDesktopComputer } from "react-icons/hi";
import HrIndividualAttendanceReportModalTable from "./HrIndividualAttendanceReportModalTable";

const HrIndividualAttendanceReportModal = ({ showModal, handleClose }) => {
  console.log(handleClose);
  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={"Individual attendance report"}
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
          <Card className={"bg-white dark:bg-gray-900 p-4 mb-3"}>
            {/* Employee Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src="/assets/images/avatar/1.png"
                    alt="Ashik Ahmed"
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-semibold dark-title-color">
                    Ashik Ahmed
                  </h1>
                  <p className="text-sm text-gray-600">
                    Employee ID: 122031058
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm font-medium dark-title-color">
                    Sr. Software Engineer
                  </span>
                </div>
                <p className="text-sm text-gray-600">Department: IT</p>
              </div>
            </div>

            {/* Leave Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-x-4">
                <p className="text-blue-600 font-medium ">
                  Wednesday, 01 January 2025
                </p>
                <div className="flex items-center gap-2">
                  <button className="bg-theme-light dark:bg-theme-dark-text  rounded-full w-5 h-5 flex items-center justify-center ">
                    <FaAngleLeft size={14} />{" "}
                  </button>
                  <button className="dark:bg-theme-dark-text  bg-theme-light rounded-full w-5 h-5  flex items-center justify-center ">
                    <FaAngleRight size={14} />{" "}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Time Details */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium dark-title-color">
                      Check In:
                    </span>
                    <span className="title-color">11:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium dark-title-color">
                      Check Out:
                    </span>
                    <span className="title-color">-----</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium dark-title-color">
                      Work Hour:
                    </span>
                    <span className="title-color">5 hour 30 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium dark-title-color">
                      Over Time:
                    </span>
                    <span className="title-color">5 hour 30 min</span>
                  </div>
                </div>
                {/* Middle Column - Leave Type */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-around  items-center">
                    <span className="font-medium dark-title-color">
                      Status:
                    </span>
                    <span className="badge badge-rounded badge-outline-primary">
                      Casual Leave
                    </span>
                  </div>
                  <div className="flex justify-around  items-center">
                    <span className="font-medium dark-title-color">
                      <HiOutlineDesktopComputer size={18} />
                    </span>
                    <div className="flex flex-col">
                      <span>Desktop MBH 2030</span>
                      <span className="title-color">
                        <strong>IP:</strong> 192.168.1.1
                      </span>
                    </div>
                  </div>
                </div>
                {/* Right Column - Notes */}
                <div>
                  <h3 className="font-medium dark-title-color mb-3">
                    Notes/Comments:
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Lorem ipsum dolor sit amet consectetur. Urna quam ut mollis
                    eu adipiscing habitasse.
                  </p>
                </div>
              </div>
            </div>
          </Card>
          {/* Todays Summary */}
          <div className="flex items-center gap-x-4 mb-2">
            <p className="text-blue-600 font-medium ">January 2025</p>
            <div className="flex items-center gap-2">
              <button className="bg-theme-light dark:bg-theme-dark-text  rounded-full w-5 h-5 flex items-center justify-center ">
                <FaAngleLeft size={14} />{" "}
              </button>
              <button className="dark:bg-theme-dark-text  bg-theme-light rounded-full w-5 h-5  flex items-center justify-center ">
                <FaAngleRight size={14} />{" "}
              </button>
            </div>
          </div>
          <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            {/* <div className="flex items-center gap-2 mb-4 ">
              <FileDown className="text-primaryColor" />
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 ">
                Todays Summary
              </h2>
            </div> */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* On time */}
              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    On time
                  </p>
                  <p className="text-2xl font-bold  flex items-center gap-1">
                    34{" "}
                    <span>
                      <FaArrowAltCircleUp className="text-green-500 pl-1 text-xl" />
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    5.7% up than last day
                  </p>
                </div>
              </div>
              {/* Late check in */}
              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 ">
                    Late check in
                  </p>
                  <p className="text-2xl font-bold  flex items-center gap-1">
                    12{" "}
                    <span>
                      <FaArrowAltCircleDown className="text-orange-500 pl-1 text-xl" />
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    17% less than last week
                  </p>
                </div>
              </div>
              {/* Early timing */}
              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Early timing
                  </p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    05{" "}
                    <span>
                      <TrendingUp className="text-blue-500 pl-1 text-xl" />
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    3.7% Progress rate
                  </p>
                </div>
              </div>
              {/* Absent */}
              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Absent
                  </p>
                  <p className="text-2xl font-bold  flex items-center gap-1">
                    02{" "}
                    <span>
                      <FaMinusCircle className="text-red-500 pl-1 text-xl" />
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    0.78% usual rate
                  </p>
                </div>
              </div>
            </div>
          </div>
          <h2 className=" font-bold dark-title-color my-3 ">
            {" "}
            Attendance Summary
          </h2>
          <HrIndividualAttendanceReportModalTable />
        </div>
      </ModalTw>
    </div>
  );
};

export default HrIndividualAttendanceReportModal;
