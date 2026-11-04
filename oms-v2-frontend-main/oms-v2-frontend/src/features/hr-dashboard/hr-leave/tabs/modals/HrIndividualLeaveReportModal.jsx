import { ModalTw } from "@/components/common/ModalTw";
import { Card } from "@/components/ui/card";
import { FileDown } from "lucide-react";
import Image from "next/image";
import HrIndividualLeaveReportModalTable from "../components/HrIndividualLeaveReportModalTable";
const HrIndividualLeaveReportModal = ({ showModal, handleClose }) => {
  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={"Individual leave report"}
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
                <h2 className="text-lg font-semibold dark-title-color ">
                  Last Leave
                </h2>
                <p className="text-blue-600 font-medium ">
                  Wednesday, 01 January 2025
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Time Details */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-medium dark-title-color">Start:</span>
                    <span className="title-color">11:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium dark-title-color">End:</span>
                    <span className="title-color">-----</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium dark-title-color">
                      Duration:
                    </span>
                    <span className="title-color">5 hour 30 min</span>
                  </div>
                </div>
                {/* Middle Column - Leave Type */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-medium dark-title-color">
                      Leave type:
                    </span>
                    <span className="badge badge-rounded badge-outline-primary">
                      Casual Leave
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium dark-title-color">
                      Leave Status:
                    </span>
                    <span className="text-green-600 font-medium">Paid</span>
                  </div>
                </div>
                {/* Right Column - Notes */}
                <div>
                  <h3 className="font-medium dark-title-color mb-3">
                    Notes/Comments:
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Lorem ipsum dolor sit amet consectetur. Urna quam ut mollis
                    eu adipiscing habitasse mauris integer ultrices.
                  </p>
                </div>
              </div>
            </div>
          </Card>
          {/* leave summary */}

          <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4 ">
              <FileDown className="text-primaryColor" />
              <h2 className="text-lg font-semibold dark-title-color">
                Ashik Ahmed’s Leave summary
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Total Allocation */}
              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold title-color dark:text-gray-300">
                    Total Allocation
                  </p>
                  <p className="text-2xl font-bold  flex items-center gap-1">
                    34{" "}
                    {/* <span>
                      <FaArrowAltCircleUp className="text-green-500 pl-1 text-xl" />
                    </span> */}
                  </p>
                  {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                    5.7% up than last day
                  </p> */}
                </div>
              </div>
              {/* Leave Taken */}
              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold title-color dark:text-gray-300 ">
                    Leave Taken
                  </p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    12{" "}
                    {/* <span>
                      <FaArrowAltCircleDown className="text-orange-500 pl-1 text-xl" />
                    </span> */}
                  </p>
                  {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                    17% less than last week
                  </p> */}
                </div>
              </div>
              {/* Leave Balance */}
              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold title-color dark:text-gray-300">
                    Leave Balance
                  </p>
                  <p className="text-2xl font-bold  flex items-center gap-1">
                    05{" "}
                    {/* <span>
                      <TrendingUp className="text-blue-500 pl-1 text-xl" />
                    </span> */}
                  </p>
                  {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                    3.7% Progress rate
                  </p> */}
                </div>
              </div>
              {/* Requested */}
              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold title-color dark:text-gray-300">
                    Requested
                  </p>
                  <p className="text-2xl font-bold  flex items-center gap-1">
                    02{" "}
                    {/* <span>
                      <FaMinusCircle className="text-red-500 pl-1 text-xl" />
                    </span> */}
                  </p>
                  {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                    0.78% usual rate
                  </p> */}
                </div>
              </div>
            </div>
          </div>
          <h2 className=" font-bold dark-title-color my-3 ">
            {" "}
            Attendance Summary
          </h2>
          <HrIndividualLeaveReportModalTable />
        </div>
      </ModalTw>
    </div>
  );
};

export default HrIndividualLeaveReportModal;
