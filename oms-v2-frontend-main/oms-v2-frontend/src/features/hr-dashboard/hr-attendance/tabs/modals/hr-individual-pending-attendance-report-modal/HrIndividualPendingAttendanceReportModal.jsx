import { ModalTw } from "@/components/common/ModalTw";
import { Card } from "@/components/ui/card";
import Image from "next/image";

const HrIndividualPendingAttendanceReportModal = ({
  showModal,
  handleClose,
}) => {
  console.log(handleClose);
  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={"Individual pending attendance report"}
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
            <div>
              <p className="font-bold dark-title-color">Note:</p>
              <p className="title color">
                {" "}
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Harum
                sed voluptatibus ipsam ad assumenda deserunt, accusamus, ipsa,
                quasi labore pariatur at distinctio adipisci tempore animi
                itaque optio consectetur fugiat quibusdam.
              </p>
            </div>
          </Card>
        </div>
      </ModalTw>
    </div>
  );
};

export default HrIndividualPendingAttendanceReportModal;
