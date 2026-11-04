"use client";
import { ModalTw } from "@/components/common/ModalTw";
import { FaMoneyBillWave, FaUser } from "react-icons/fa6";
import {
  HiOutlineDocumentText,
  HiOutlineOfficeBuilding,
  HiOutlineSwitchVertical,
} from "react-icons/hi";
const CardRequisitionsModal = ({
  showModal,
  handleClose,
  title,
  data = [],
}) => {
  // const [showModal2, setShowModal2] = useState(false);
  const headerData = [
    { title: "Employee Name", icon: FaUser },
    { title: "Requisition", icon: HiOutlineDocumentText },
    { title: "Requisition Code", icon: HiOutlineDocumentText },
    { title: "Type", icon: HiOutlineDocumentText },
    { title: "Department", icon: HiOutlineOfficeBuilding },
    { title: "Estimate Cost", icon: FaMoneyBillWave },
    { title: "Quantity", icon: FaMoneyBillWave },
  ];

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
                {data?.map((item, i) => (
                  <tr key={i}>
                    <td>
                      {" "}
                      <div
                        className=" flex items-center gap-2 whitespace-nowrap cursor-pointer"
                        // onClick={() => setShowModal2(true)}
                      >
                        <img
                          src={item.fileUrl}
                          alt={item.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-semibold dark-title-color">
                            {item.name}
                          </p>
                          {/* <p className="text-xs text-gray-500">{item.id}</p> */}
                        </div>
                      </div>
                    </td>
                    <td>{item.requisitionName}</td>
                    <td>{item.requisitionCode}</td>
                    <td>
                      <span
                        className={`badge badge-pill ${
                          item.requisitionType === "in_stock"
                            ? "badge-outline-success"
                            : "badge-outline-primary"
                        }`}
                      >
                        {item.requisitionType === "in_stock"
                          ? "In Stock"
                          : "New Purchase"}
                      </span>
                    </td>
                    <td>{item.department || "N/A"}</td>
                    <td>{item.cost} ৳</td>
                    <td>{item.quantity || "0"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ModalTw>
      {/* Modal */}
      {/* <HrIndividualLeaveReportModal
        showModal={showModal2}
        handleClose={() => setShowModal2(false)}
      /> */}
    </div>
  );
};

export default CardRequisitionsModal;
