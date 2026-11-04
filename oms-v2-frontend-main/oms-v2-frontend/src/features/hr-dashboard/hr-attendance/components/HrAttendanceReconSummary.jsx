import { Clock } from "lucide-react";
import { FaClock } from "react-icons/fa6";

const HrAttendanceReconSummary = ({ dataArray, className }) => {
  const allValues = [
    dataArray?.reconciliationSummary?.checkIn?.pending || 0,
    dataArray?.reconciliationSummary?.checkIn?.approved || 0,
    dataArray?.reconciliationSummary?.checkIn?.rejected || 0,
    dataArray?.reconciliationSummary?.checkIn?.completed || 0,
    dataArray?.reconciliationSummary?.earlyLeave?.pending || 0,
    dataArray?.reconciliationSummary?.earlyLeave?.approved || 0,
    dataArray?.reconciliationSummary?.earlyLeave?.rejected || 0,
    dataArray?.reconciliationSummary?.earlyLeave?.completed || 0,
  ];
  const maxValue = Math.max(...allValues);
  const totalPending =
    (dataArray?.reconciliationSummary?.checkIn?.pending || 0) +
    (dataArray?.reconciliationSummary?.earlyLeave?.pending || 0);
  const totalApproved =
    (dataArray?.reconciliationSummary?.checkIn?.approved || 0) +
    (dataArray?.reconciliationSummary?.earlyLeave?.approved || 0);
  const totalRejected =
    (dataArray?.reconciliationSummary?.checkIn?.rejected || 0) +
    (dataArray?.reconciliationSummary?.earlyLeave?.rejected || 0);
  const totalRequests = totalPending + totalApproved + totalRejected;

  return (
    <div className="space-y-4">
      {/* KPI Summary Cards in Image 2 Style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Total Requests
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalRequests}
            </span>
            <span className="text-xs text-gray-400">requests</span>
          </div>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/20">
          <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Pending Approval
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {totalPending}
            </span>
            <span className="text-xs text-amber-600/70">requests</span>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Approved
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {totalApproved}
            </span>
            <span className="text-xs text-emerald-600/70">requests</span>
          </div>
        </div>

        <div className="rounded-xl border border-red-100 bg-red-50/50 p-3.5 shadow-xs dark:border-red-900/40 dark:bg-red-950/20">
          <span className="text-[11px] font-medium uppercase tracking-wider text-red-700 dark:text-red-400">
            Rejected
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-700 dark:text-red-300">
              {totalRejected}
            </span>
            <span className="text-xs text-red-600/70">requests</span>
          </div>
        </div>
      </div>

      {/* 2nd */}
      <div className={`grid grid-cols-1 xl:grid-cols-2 gap-6 ${className}`}>
        {/* Check In Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FaClock className="text-blue-500 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Check In Reconciliation
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending approval requests
              </p>
            </div>
          </div>

          <div 
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            }}
          >
            {/* Pending */}
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {dataArray?.reconciliationSummary?.checkIn?.pending || 0}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                Pending
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1 mt-2">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      maxValue > 0
                        ? ((dataArray?.reconciliationSummary?.checkIn
                            ?.pending || 0) /
                            maxValue) *
                          100
                        : 0
                    }% `,
                  }}
                ></div>
              </div>
            </div>

            {/* Approved */}
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {dataArray?.reconciliationSummary?.checkIn?.approved || 0}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                Approved
              </div>
              <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-1 mt-2">
                <div
                  className="bg-green-500 h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      maxValue > 0
                        ? ((dataArray?.reconciliationSummary?.checkIn
                            ?.approved || 0) /
                            maxValue) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Rejected */}
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800">
              <div className="text-xl font-bold text-red-600 dark:text-red-400">
                {dataArray?.reconciliationSummary?.checkIn?.rejected || 0}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                Rejected
              </div>
              <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-1 mt-2">
                <div
                  className="bg-red-500 h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      maxValue > 0
                        ? ((dataArray?.reconciliationSummary?.checkIn
                            ?.rejected || 0) /
                            maxValue) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Completed */}
            <div className="text-center p-3 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-100 dark:border-violet-800">
              <div className="text-xl font-bold text-violet-600 dark:text-violet-400">
                {dataArray?.reconciliationSummary?.checkIn?.completed || 0}
              </div>
              <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mt-1">
                Completed
              </div>
              <div className="w-full bg-violet-200 dark:bg-violet-800 rounded-full h-1 mt-2">
                <div
                  className="bg-violet-500 h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      maxValue > 0
                        ? ((dataArray?.reconciliationSummary?.checkIn
                            ?.completed || 0) /
                            maxValue) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Check Out Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Clock className="text-orange-500 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Check Out Reconciliation
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Early leave requests
              </p>
            </div>
          </div>

          <div 
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            }}
          >
            {/* Pending */}
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800">
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {dataArray?.reconciliationSummary?.earlyLeave?.pending || 0}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
                Pending
              </div>
              <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-1 mt-2">
                <div
                  className="bg-orange-500 h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      maxValue > 0
                        ? ((dataArray?.reconciliationSummary?.earlyLeave
                            ?.pending || 0) /
                            maxValue) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Approved */}
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {dataArray?.reconciliationSummary?.earlyLeave?.approved || 0}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                Approved
              </div>
              <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-1 mt-2">
                <div
                  className="bg-green-500 h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      maxValue > 0
                        ? ((dataArray?.reconciliationSummary?.earlyLeave
                            ?.approved || 0) /
                            maxValue) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Rejected */}
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800">
              <div className="text-xl font-bold text-red-600 dark:text-red-400">
                {dataArray?.reconciliationSummary?.earlyLeave?.rejected || 0}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                Rejected
              </div>
              <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-1 mt-2">
                <div
                  className="bg-red-500 h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      maxValue > 0
                        ? ((dataArray?.reconciliationSummary?.earlyLeave
                            ?.rejected || 0) /
                            maxValue) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Completed */}
            <div className="text-center p-3 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-100 dark:border-violet-800">
              <div className="text-xl font-bold text-violet-600 dark:text-violet-400">
                {dataArray?.reconciliationSummary?.earlyLeave?.completed || 0}
              </div>
              <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mt-1">
                Completed
              </div>
              <div className="w-full bg-violet-200 dark:bg-violet-800 rounded-full h-1 mt-2">
                <div
                  className="bg-violet-500 h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      maxValue > 0
                        ? ((dataArray?.reconciliationSummary?.earlyLeave
                            ?.completed || 0) /
                            maxValue) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrAttendanceReconSummary;

// {/* 3rd */}
//   <div className="flex flex-col lg:flex-row gap-6">
//     {/* Check In Summary */}
//     <div className="w-full lg:w-1/2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
//       <div className="flex items-center gap-3 mb-6">
//         <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//           <FaClock className="text-blue-500 text-xl" />
//         </div>
//         <div>
//           <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
//             Check In Reconciliation
//           </h2>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             Attendance regularization requests
//           </p>
//         </div>
//       </div>

//       <div className="space-y-4">
//         {/* Pending */}
//         <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
//           <div className="flex items-center gap-3">
//             <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
//             <div>
//               <p className="font-medium text-gray-700 dark:text-gray-300">
//                 Pending
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Awaiting approval
//               </p>
//             </div>
//           </div>
//           <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//             {dataArray?.reconciliationSummary?.checkIn?.pending || 0}
//           </div>
//         </div>

//         {/* Approved */}
//         <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
//           <div className="flex items-center gap-3">
//             <div className="w-2 h-8 bg-green-500 rounded-full"></div>
//             <div>
//               <p className="font-medium text-gray-700 dark:text-gray-300">
//                 Approved
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Successfully processed
//               </p>
//             </div>
//           </div>
//           <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//             {dataArray?.reconciliationSummary?.checkIn?.approved || 0}
//           </div>
//         </div>

//         {/* Rejected */}
//         <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800">
//           <div className="flex items-center gap-3">
//             <div className="w-2 h-8 bg-red-500 rounded-full"></div>
//             <div>
//               <p className="font-medium text-gray-700 dark:text-gray-300">
//                 Rejected
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Not approved
//               </p>
//             </div>
//           </div>
//           <div className="text-2xl font-bold text-red-600 dark:text-red-400">
//             {dataArray?.reconciliationSummary?.checkIn?.rejected || 0}
//           </div>
//         </div>

//         {/* Completed */}

//         <div className="flex items-center justify-between p-3 bg-cyan-50 dark:bg-cyan-900/10 rounded-lg border border-cyan-100 dark:border-cyan-800">
//           <div className="flex items-center gap-3">
//             <div className="w-2 h-8 bg-cyan-500 rounded-full"></div>
//             <div>
//               <p className="font-medium text-gray-700 dark:text-gray-300">
//                 Completed
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Total processed
//               </p>
//             </div>
//           </div>
//           <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
//             {dataArray?.reconciliationSummary?.checkIn?.completed || 0}
//           </div>
//         </div>
//       </div>
//     </div>

//     {/* Check Out Summary */}
//     <div className="w-full lg:w-1/2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
//       <div className="flex items-center gap-3 mb-6">
//         <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
//           <Clock className="text-orange-500 text-xl" />
//         </div>
//         <div>
//           <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
//             Check Out Reconciliation
//           </h2>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             Early leave regularization requests
//           </p>
//         </div>
//       </div>

//       <div className="space-y-4">
//         {/* Pending */}
//         <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800">
//           <div className="flex items-center gap-3">
//             <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
//             <div>
//               <p className="font-medium text-gray-700 dark:text-gray-300">
//                 Pending
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Awaiting approval
//               </p>
//             </div>
//           </div>
//           <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
//             {dataArray?.reconciliationSummary?.earlyLeave?.pending || 0}
//           </div>
//         </div>

//         {/* Approved */}
//         <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
//           <div className="flex items-center gap-3">
//             <div className="w-2 h-8 bg-green-500 rounded-full"></div>
//             <div>
//               <p className="font-medium text-gray-700 dark:text-gray-300">
//                 Approved
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Successfully processed
//               </p>
//             </div>
//           </div>
//           <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//             {dataArray?.reconciliationSummary?.earlyLeave?.approved || 0}
//           </div>
//         </div>

//         {/* Rejected */}
//         <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800">
//           <div className="flex items-center gap-3">
//             <div className="w-2 h-8 bg-red-500 rounded-full"></div>
//             <div>
//               <p className="font-medium text-gray-700 dark:text-gray-300">
//                 Rejected
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Not approved
//               </p>
//             </div>
//           </div>
//           <div className="text-2xl font-bold text-red-600 dark:text-red-400">
//             {dataArray?.reconciliationSummary?.earlyLeave?.rejected || 0}
//           </div>
//         </div>

//         {/* Completed */}
//         <div className="flex items-center justify-between p-3 bg-cyan-50 dark:bg-cyan-900/10 rounded-lg border border-cyan-100 dark:border-cyan-800">
//           <div className="flex items-center gap-3">
//             <div className="w-2 h-8 bg-cyan-500 rounded-full"></div>
//             <div>
//               <p className="font-medium text-gray-700 dark:text-gray-300">
//                 Completed
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Total processed
//               </p>
//             </div>
//           </div>
//           <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
//             {dataArray?.reconciliationSummary?.earlyLeave?.completed || 0}
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>

//   {/* 4th */}

//   <div className="space-y-6 mb-4">
//     {/* Top Summary Section */}
//     <div className="flex flex-col lg:flex-row gap-6">
//       {/* Check In Summary */}
//       <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//             <FaClock className="text-blue-500 text-xl" />
//           </div>
//           <div>
//             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
//               Check In Summary
//             </h2>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Today&apos;s check-in statistics
//             </p>
//           </div>
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           {/* On Time */}
//           <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-green-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   On Time
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   {dataArray?.summary?.yesterday?.OntimeCheckInPercentage ||
//                     0}
//                   % up
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//               {dataArray?.summary?.today?.onTimeCheckIn || 0}
//             </div>
//           </div>

//           {/* Late Check In */}
//           <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   Late
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   {dataArray?.summary?.yesterday?.LateCheckInPercentage ||
//                     0}
//                   % less
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
//               {dataArray?.summary?.today?.lateCheckIn || 0}
//             </div>
//           </div>

//           {/* Early Timing */}
//           <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   Early
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   {dataArray?.summary?.yesterday
//                     ?.earlyTimingProgressPercentage || 0}
//                   % progress
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//               {dataArray?.summary?.today?.earlyTiming || 0}
//             </div>
//           </div>

//           {/* Absent */}
//           <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-red-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   Absent
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   {dataArray?.summary?.yesterday?.absentPercentage || 0}%
//                   usual rate
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-red-600 dark:text-red-400">
//               {dataArray?.summary?.today?.absent || 0}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Check Out Summary */}
//       <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
//             <Clock className="text-purple-500 text-xl" />
//           </div>
//           <div>
//             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
//               Check Out Summary
//             </h2>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Today&apos;s check-out statistics
//             </p>
//           </div>
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           {/* On Time Check Out */}
//           <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-green-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   On Time
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Completed schedule
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//               {dataArray?.summary?.today?.onTimeCheckOut || 0}
//             </div>
//           </div>

//           {/* Early Leave */}
//           <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   Early Leave
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Left before time
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
//               {dataArray?.summary?.today?.earlyLeave || 0}
//             </div>
//           </div>

//           {/* Overtime */}
//           <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   Overtime
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Extra hours worked
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
//               {dataArray?.summary?.today?.overtime || 0}
//             </div>
//           </div>

//           {/* Missing Check Out */}
//           <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-red-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   Missing
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   No check-out recorded
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-red-600 dark:text-red-400">
//               {dataArray?.summary?.today?.missingCheckOut || 0}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>

//     {/* Reconciliation Summary Section */}
//     <div className="flex flex-col lg:flex-row gap-6">
//       {/* Check In Reconciliation */}
//       <div className="w-full lg:w-1/2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//             <FileCheck2 className="text-blue-500 text-xl" />
//           </div>
//           <div>
//             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
//               Check In Reconciliation
//             </h2>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Attendance regularization requests
//             </p>
//           </div>
//         </div>

//         <div className="space-y-4">
//           {/* Pending */}
//           <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   Pending
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Awaiting approval
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//               {dataArray?.reconciliationSummary?.checkIn?.pending || 0}
//             </div>
//           </div>

//           {/* Approved */}
//           <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-green-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   Approved
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Successfully processed
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//               {dataArray?.reconciliationSummary?.checkIn?.approved || 0}
//             </div>
//           </div>

//           {/* Rejected */}
//           <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-red-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   Rejected
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Not approved
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-red-600 dark:text-red-400">
//               {dataArray?.reconciliationSummary?.checkIn?.rejected || 0}
//             </div>
//           </div>

//           {/* Completed */}
//           <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   Completed
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Total processed
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
//               {dataArray?.reconciliationSummary?.checkIn?.completed || 0}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Check Out Reconciliation */}
//       <div className="w-full lg:w-1/2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
//             <FileCheck2 className="text-orange-500 text-xl" />
//           </div>
//           <div>
//             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
//               Check Out Reconciliation
//             </h2>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Early leave regularization requests
//             </p>
//           </div>
//         </div>

//         <div className="space-y-4">
//           {/* Pending */}
//           <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   Pending
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Awaiting approval
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
//               {dataArray?.reconciliationSummary?.earlyLeave?.pending || 0}
//             </div>
//           </div>

//           {/* Approved */}
//           <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-green-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   Approved
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Successfully processed
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//               {dataArray?.reconciliationSummary?.earlyLeave?.approved || 0}
//             </div>
//           </div>

//           {/* Rejected */}
//           <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-red-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   Rejected
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Not approved
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-red-600 dark:text-red-400">
//               {dataArray?.reconciliationSummary?.earlyLeave?.rejected || 0}
//             </div>
//           </div>

//           {/* Completed */}
//           <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
//               <div>
//                 <p className="font-medium text-gray-700 dark:text-gray-300">
//                   Completed
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Total processed
//                 </p>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
//               {dataArray?.reconciliationSummary?.earlyLeave?.completed || 0}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>

//   {/* 5 */}
//   <div className="space-y-6 mb-6">
//     {/* Reconciliation Section - Split View */}
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//       {/* Check In Reconciliation */}
//       <div className="bg-theme-light dark:bg-theme-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
//             <FileCheck2 className="text-blue-600 text-lg" />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//               Check In Reconciliation
//             </h3>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Regularization requests
//             </p>
//           </div>
//         </div>

//         <div className="space-y-3">
//           {[
//             {
//               status: "Pending",
//               count: dataArray?.reconciliationSummary?.checkIn?.pending,
//               color: "blue",
//             },
//             {
//               status: "Approved",
//               count: dataArray?.reconciliationSummary?.checkIn?.approved,
//               color: "green",
//             },
//             {
//               status: "Rejected",
//               count: dataArray?.reconciliationSummary?.checkIn?.rejected,
//               color: "red",
//             },
//             {
//               status: "Completed",
//               count: dataArray?.reconciliationSummary?.checkIn?.completed,
//               color: "purple",
//             },
//           ].map((item, index) => (
//             <div
//               key={index}
//               className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
//             >
//               <div className="flex items-center gap-3">
//                 <div
//                   className={`w-3 h-3 rounded-full bg-${item.color}-500`}
//                 ></div>
//                 <span className="font-medium text-gray-700 dark:text-gray-300">
//                   {item.status}
//                 </span>
//               </div>
//               <span
//                 className={`text-lg font-bold text-${item.color}-600 dark:text-${item.color}-400`}
//               >
//                 {item.count || 0}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Check Out Reconciliation */}
//       <div className="bg-theme-light dark:bg-theme-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
//             <FileCheck2 className="text-orange-600 text-lg" />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//               Check Out Reconciliation
//             </h3>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Early leave requests
//             </p>
//           </div>
//         </div>

//         <div className="space-y-3">
//           {[
//             {
//               status: "Pending",
//               count: dataArray?.reconciliationSummary?.earlyLeave?.pending,
//               color: "orange",
//             },
//             {
//               status: "Approved",
//               count: dataArray?.reconciliationSummary?.earlyLeave?.approved,
//               color: "green",
//             },
//             {
//               status: "Rejected",
//               count: dataArray?.reconciliationSummary?.earlyLeave?.rejected,
//               color: "red",
//             },
//             {
//               status: "Completed",
//               count:
//                 dataArray?.reconciliationSummary?.earlyLeave?.completed,
//               color: "purple",
//             },
//           ].map((item, index) => (
//             <div
//               key={index}
//               className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
//             >
//               <div className="flex items-center gap-3">
//                 <div
//                   className={`w-3 h-3 rounded-full bg-${item.color}-500`}
//                 ></div>
//                 <span className="font-medium text-gray-700 dark:text-gray-300">
//                   {item.status}
//                 </span>
//               </div>
//               <span
//                 className={`text-lg font-bold text-${item.color}-600 dark:text-${item.color}-400`}
//               >
//                 {item.count || 0}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   </div>
