import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import React from "react";

const SalaryStructureComponentDetailsModal = ({
  showDetailsModal,
  setShowDetailsModal,
  selectedSalaryDetails,
}) => {
  return (
    <div>
      {" "}
      <ModalTw
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Salary Components Details"
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <div className="space-y-4">
          {selectedSalaryDetails?.length > 0 ? (
            <div className="space-y-3">
              {selectedSalaryDetails.map((detail, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">
                        {detail.payItem?.itemName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Code: {detail.payItem?.itemCode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ৳
                        {parseFloat(
                          detail.calculatedAmount || 0
                        ).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        (৳{parseFloat(detail.amount || 0).toLocaleString()} +{" "}
                        {detail.percentage}%)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-3 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Total Additional Amount</p>
                  <p className="font-bold text-green-600">
                    ৳
                    {selectedSalaryDetails
                      .reduce(
                        (sum, item) =>
                          sum + parseFloat(item.calculatedAmount || 0),
                        0
                      )
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No salary components found
            </div>
          )}

          <div className="flex justify-end pt-4">
            <ButtonTw
              onClick={() => setShowDetailsModal(false)}
              variant="outline"
            >
              Close
            </ButtonTw>
          </div>
        </div>
      </ModalTw>
    </div>
  );
};

export default SalaryStructureComponentDetailsModal;
