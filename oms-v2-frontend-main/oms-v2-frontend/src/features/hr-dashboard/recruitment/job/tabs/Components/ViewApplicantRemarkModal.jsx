"use client";
import React, { useMemo } from "react";
import { ModalTw } from "@/components/common/ModalTw";
import Image from "next/image";
import ButtonTw from "@/components/ui/ButtonTw";

const ViewApplicantRemarkModal = ({ showModal, onClose, viewReamrk = [] }) => {
  // ── Group remarks by creator ──
  const groupedRemarks = useMemo(() => {
    const map = {};
    viewReamrk?.forEach((remark) => {
      const creatorId = remark.creator.id;
      if (!map[creatorId]) {
        map[creatorId] = {
          creator: remark.creator,
          remarks: [],
        };
      }
      map[creatorId].remarks.push(remark);
    });
    return Object.values(map);
  }, [viewReamrk]);

  return (
    <ModalTw
      show={showModal}
      onClose={onClose}
      title="Applicant Remarks"
      size="2xl"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      {viewReamrk?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 dark:bg-gray-900 dark:text-gray-300">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-full p-4 mb-4">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            No remarks available
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Be the first to add a remark
          </p>
        </div>
      ) : (
        <>
          <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {groupedRemarks?.map((group, idx) => (
              <div
                key={group.creator.id}
                className="group animate-slideIn"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Creator info card */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div
                      className=""
                      style={{ padding: "2px", margin: "-2px" }}
                    />
                    <Image
                      src={group.creator.profilePicture.fileUrl}
                      alt={group.creator.name}
                      width={44}
                      height={44}
                      className="rounded-full object-cover ring-2 ring-white shadow-md dark:ring-gray-700 dark:shadow-black/30"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                      {group.creator.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-400">
                      {group.remarks.length}{" "}
                      {group.remarks.length === 1 ? "remark" : "remarks"}
                    </p>
                  </div>
                </div>

                {/* Remarks timeline */}
                <div className="ml-14 space-y-3 relative">
                  {/* Vertical timeline line */}
                  <div className="" />

                  {group.remarks.map((remark, remarkIdx) => (
                    <div
                      key={remark.id}
                      className="relative animate-fadeInUp"
                      style={{ animationDelay: `${remarkIdx * 50}ms` }}
                    >
                      {/* Timeline dot */}

                      {/* Remark card */}
                      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
                          {remark.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <svg
                            className="w-3 h-3 text-gray-400 dark:text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(remark.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {idx < groupedRemarks.length - 1 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 my-6" />
                )}
              </div>
            ))}
          </div>

          <style jsx>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateX(-20px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }

            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .animate-slideIn {
              animation: slideIn 0.4s ease-out forwards;
            }

            .animate-fadeInUp {
              animation: fadeInUp 0.3s ease-out forwards;
            }

            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }

            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%);
            }
          `}</style>
        </>
      )}

      {/* Close button */}
      <div className="flex justify-end mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <ButtonTw onClick={onClose}>Close</ButtonTw>
      </div>
    </ModalTw>
  );
};

export default ViewApplicantRemarkModal;
