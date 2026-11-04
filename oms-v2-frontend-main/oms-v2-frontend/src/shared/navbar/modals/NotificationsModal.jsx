import { ModalTw } from "@/components/common/ModalTw";
import { FaUserCheck, FaMoneyBillWave, FaRegCalendarAlt } from "react-icons/fa";
import { AiOutlineWarning, AiOutlineCheckCircle } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaBell } from "react-icons/fa6";

const notifications = [
  {
    id: 1,
    icon: <FaBell className="text-blue-500 w-5 h-5" />,
    title: "Some employees have",
    highlight: "not marked their attendance today.",
    description:
      "Please review the attendance log and follow up with them. Ensure compliance with company attendance policies.",
    time: "5H",
  },
  {
    id: 2,
    icon: <FaRegCalendarAlt className="text-cyan-500 w-5 h-5" />,
    title: "The following employees",
    highlight: "have submitted leave applications for upcoming dates.",
    description:
      "Please review their leave balance and approve/reject requests accordingly.",
    time: "5H",
  },
  {
    id: 3,
    icon: <AiOutlineWarning className="text-red-500 w-5 h-5" />,
    title: "Rejecting a leave request,",
    highlight:
      "ensure to communicate the reason clearly to avoid employee dissatisfaction.",
    description: "",
    time: "5H",
  },
  {
    id: 4,
    icon: <AiOutlineCheckCircle className="text-green-500 w-5 h-5" />,
    title: "Approve/reject",
    highlight: "pending leave requests and update records.",
    description: "",
    time: "5H",
  },
  {
    id: 5,
    icon: <FaMoneyBillWave className="text-amber-500 w-5 h-5" />,
    title: "The finance team will process salary",
    highlight: "disbursement on [Date].",
    description: "Ensure all details are correct before submission.",
    time: "5H",
  },
];
const NotificationsModal = ({ showModal, handleClose }) => {
  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title={"Notifications"}
      size="xl"
      onConfirm={handleClose}
      dismissible={true}
      confirmText="Confirm"
      cancelText="Cancel"
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-3">
        {notifications.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 bg-white dark:bg-theme-dark shadow-sm rounded-lg p-4 border"
          >
            {/* Icon */}
            <div className="mt-1 border rounded-full flex flex-col items-center justify-center p-1.5">{item.icon}</div>

            {/* Content */}
            <div className="flex-1">
              <p className="text-sm text-theme-dark-text dark:text-theme-light-text">
                <span className="font-semibold">{item.title} </span>
                <span className="">{item.highlight}</span>
              </p>
              {item.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {item.description}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">{item.time}</p>
            </div>

            {/* Menu */}
            <button className="text-gray-400 hover:text-gray-600">
              <BsThreeDotsVertical />
            </button>
          </div>
        ))}
      </div>
    </ModalTw>
  );
};

export default NotificationsModal;
