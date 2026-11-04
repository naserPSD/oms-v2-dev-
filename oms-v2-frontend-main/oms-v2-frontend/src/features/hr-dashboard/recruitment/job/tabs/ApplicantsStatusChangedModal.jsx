// "use client";

import ButtonTw from "@/components/ui/ButtonTw";

import { ModalTw } from "@/components/common/ModalTw";
// import ButtonTw from "@/components/ui/ButtonTw";

// export default function ApplicantsStatusChangedModal({
//   show,
//   onClose,
//   onSubmit,
//   stepOptions = [],
//   isLoading,
//   applicantName,
// }) {
//   const handleConfirm = async () => {
//     const firstStep = stepOptions?.[0];

//     if (!firstStep) return;

//     const payload = {
//       jobRecruitmentStepNameId: firstStep.stepId, // 🔥 0 index step
//     };

//     await onSubmit(payload);
//     onClose();
//   };

//   const firstStepName = stepOptions?.[0]?.stepName;

//   return (
//     <ModalTw
//       show={show}
//       onClose={onClose}
//       title="Update Recruitment Step"
//       size="lg"
//       dismissible
//       showHeader
//       showFooter={false}
//       type="default"
//       position="center"
//       className="dark:bg-gray-800"
//     >
//       <div className="py-6 px-2">
//         {/* Icon & Title Section */}
//         <div className="flex items-start gap-4 mb-6">
//           <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
//             <svg
//               className="w-6 h-6 text-blue-600 dark:text-blue-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M13 10V3L4 14h7v7l9-11h-7z"
//               />
//             </svg>
//           </div>
//           <div className="flex-1">
//             <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//               Confirm moving the applicant to the{" "}
//               <span className="font-bold text-xl">{firstStepName}</span> recruitment
//               stage.
//             </p>
//             <p className="text-sm text-gray-600 dark:text-gray-300">
//               You are about to move{" "}
//               <span className="font-medium text-gray-900 dark:text-white text-lg">
//                 {applicantName}
//               </span>{" "}
//               to the next recruitment step.
//             </p>
//           </div>
//         </div>

//         {/* Information Card */}
//         <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
//           <div className="flex items-start gap-3">
//             <svg
//               className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//             <div>
//               <p className="text-sm text-gray-700 dark:text-gray-300">
//                 This action will:
//               </p>
//               <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
//                 <li className="flex items-center gap-2">
//                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
//                   Move {applicantName} to the next recruitment stage
//                 </li>
//                 {/* <li className="flex items-center gap-2">
//                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
//                   Notify relevant team members
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
//                   Update the applicants status
//                 </li> */}
//               </ul>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-3">
//           <ButtonTw
//             type="button"
//             size="sm"
//             variant="default"
//             className="flex-1 font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm transition-all duration-200"
//             onClick={handleConfirm}
//             disabled={isLoading}
//             loading={isLoading}
//           >
//             {isLoading ? "Moving..." : "Confirm Move"}
//           </ButtonTw>

//           <ButtonTw
//             type="button"
//             size="sm"
//             variant="outline.gray"
//             className="flex-1 font-semibold border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
//             onClick={onClose}
//             disabled={isLoading}
//           >
//             Cancel
//           </ButtonTw>
//         </div>

//         {/* Optional: Progress Indicator */}
//         {isLoading && (
//           <div className="mt-4">
//             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
//               <div
//                 className="bg-blue-600 h-1 rounded-full animate-pulse"
//                 style={{ width: "60%" }}
//               ></div>
//             </div>
//             <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
//               Please wait while we update the status...
//             </p>
//           </div>
//         )}
//       </div>
//     </ModalTw>
//   );
// }


export default function ApplicantsStatusChangedModal({
  show,
  onClose,
  onSubmit,
  isLoading,
  modalData, // 👈 নতুন
}) {
  const handleConfirm = async () => {
    if (!modalData?.nextStep) return;

    const payload = {
      jobRecruitmentStepNameId: modalData.nextStep.stepId, // dynamic step id
      id: modalData.applicantId, 
    };

    await onSubmit(payload);
    onClose();
  };

  const nextStepName = modalData?.nextStep?.stepName || "Next Step";

  return (
    <ModalTw
      show={show}
      onClose={onClose}
      title="Update Recruitment Step"
      size="lg"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
      className="dark:bg-gray-800"
    >
      <div className="py-6 px-2">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Confirm moving the applicant to the <span className="font-bold text-xl">{nextStepName}</span> recruitment stage.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You are about to move <span className="font-medium text-gray-900 dark:text-white text-lg">{modalData?.applicantName}</span> to the next recruitment step.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <ButtonTw
            type="button"
            size="sm"
            variant="default"
            className="flex-1 font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm transition-all duration-200"
            onClick={handleConfirm}
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? "Moving..." : "Confirm Move"}
          </ButtonTw>

          <ButtonTw
            type="button"
            size="sm"
            variant="outline.gray"
            className="flex-1 font-semibold border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </ButtonTw>
        </div>
      </div>
    </ModalTw>
  );
}
