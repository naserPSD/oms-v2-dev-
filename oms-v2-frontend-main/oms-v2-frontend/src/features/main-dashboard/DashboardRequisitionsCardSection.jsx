"use client";

import { ModalTw } from "@/components/common/ModalTw";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import helpers from "@/utils/helpers";
import Link from "next/link";
import { useState } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { IoBagHandle } from "react-icons/io5";
import { MdCalendarToday } from "react-icons/md";

const DashboardRequisitionsCardSection = ({ requisitionData }) => {
  const requisitions = requisitionData?.requisitions || [];
  const count = requisitions?.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [requisitionId, setRequisitionId] = useState(null);

  const { useSingleRequisitionQuery } = useHrQueryApi({});

  // ✅ Only fetch when requisitionId exists
  const { data: responseData, isLoading: isFetching } =
    useSingleRequisitionQuery(requisitionId, {
      enabled: !!requisitionId,
    });

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? count - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === count - 1 ? 0 : prev + 1));
  };

  const currentItem = requisitions[currentIndex];

  return (
    <div className="flex items-center flex-wrap gap-3">
      <div className="dark:bg-theme-dark bg-theme-light dark:text-theme-light-text text-theme-dark-text border rounded-md flex-1">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 py-1 px-4 border-b text-xs font-bold text-gray-500">
          <p className="inline-flex gap-2">
            {" "}
            <IoBagHandle className="text-pink-500 text-sm" /> Items in list
          </p>

          <p className="text-gray-900 dark:text-theme-light-text font-bold text-lg">
            {count || 0}
          </p>
        </div>

        {/* Body */}
        <div className="px-4  space-y-4">
          {currentItem ? (
            <>
              <div className="flex items-center justify-between pt-2.5 pb-1">
                <button
                  onClick={handlePrev}
                  className="size-7 bg-gray-100 dark:bg-gray-600 rounded-full p-2.5 dark-title-color flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500 transition duration-150 ease-in-out cursor-pointer"
                >
                  <FaAngleLeft className="dark-title-color text-xl" />
                </button>

                <p className="dark-title-color dark:text-theme-light-text text-sm text-center flex-1 mx-2">
                  {currentItem.employeeName}’s {currentItem.itemDescription}
                </p>

                <button
                  onClick={handleNext}
                  className="size-7 bg-gray-100 dark:bg-gray-600 rounded-full p-2.5 dark-title-color flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500 transition duration-150 ease-in-out cursor-pointer"
                >
                  <FaAngleRight className="dark-title-color text-xl" />
                </button>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-400 text-xs font-bold">
                  {String(currentIndex + 1).padStart(2, "0")} of{" "}
                  {String(count).padStart(2, "0")}
                </p>
                <p className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                  <MdCalendarToday />{" "}
                  {helpers.dDateTime(currentItem.requisitionDate)}
                </p>
              </div>

              {/* Buttons Row */}
              <div className="flex justify-end gap-2 border-t py-2 ">
                <button
                  onClick={() => {
                    setRequisitionId(currentItem.id);
                    setShowModal(true);
                  }}
                  className="bg-secondaryColor hover:bg-secondaryColor/90 text-white rounded-full text-xs px-4 py-1.5  font-bold transition cursor-pointer"
                >
                  View Details
                </button>
                <Link
                  href="/hr-dashboard/requisitions"
                  className="bg-primaryColor hover:bg-primaryColor-700 text-white rounded-full text-xs px-4 py-1.5 font-bold transition"
                >
                  View All
                </Link>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-4 text-sm">
              No requisitions found
            </p>
          )}
        </div>
      </div>

      <ModalTw
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Requisition Details"
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        {isFetching ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : responseData?.data ? (
          <div className="text-sm text-gray-700 dark:text-gray-200 space-y-3">
            <div className="flex justify-between">
              <p className="font-semibold">Requisition No:</p>
              <p>{responseData.data.requisitionNo}</p>
            </div>

            <div className="flex justify-between">
              <p className="font-semibold">Item Description:</p>
              <p>{responseData.data.itemDescription}</p>
            </div>

            <div className="flex justify-between">
              <p className="font-semibold">Quantity:</p>
              <p>{responseData.data.quantity}</p>
            </div>

            <div className="flex justify-between">
              <p className="font-semibold">Estimated Cost:</p>
              <p>{Number(responseData.data.estimatedCost).toLocaleString()}</p>
            </div>

            <div className="flex justify-between">
              <p className="font-semibold">Requisition Date:</p>
              <p>
                {new Date(
                  responseData.data.requisitionDate
                ).toLocaleDateString()}
              </p>
            </div>

            <div className="flex justify-between">
              <p className="font-semibold">Approved Date:</p>
              <p>
                {responseData.data.approvedDate
                  ? new Date(
                      responseData.data.approvedDate
                    ).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            <div className="flex justify-between">
              <p className="font-semibold">Status ID:</p>
              <p>{responseData.data.statusId}</p>
            </div>

            <div>
              <p className="font-semibold">Remarks:</p>
              <p className="text-gray-600 dark:text-gray-300">
                {responseData.data.remarks || "No remarks"}
              </p>
            </div>

            <div className="pt-3 border-t text-xs text-gray-500 dark:text-gray-400">
              <p>
                Created:{" "}
                {new Date(responseData.data.createdAt).toLocaleString()}
              </p>
              <p>
                Updated:{" "}
                {new Date(responseData.data.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No data available.</p>
        )}
      </ModalTw>
    </div>
  );
};

export default DashboardRequisitionsCardSection;
