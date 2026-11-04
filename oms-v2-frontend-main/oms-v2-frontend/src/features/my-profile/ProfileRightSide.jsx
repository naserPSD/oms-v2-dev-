// // PrifleRightSide.jsx

"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useMemo, useState } from "react";
import AttendanceTab from "./tabs/AttendanceTab";
import DocumentsTab from "./tabs/DocumentsTab";
import EmployeeHistoryTab from "./tabs/EmployeeHistoryTab";
import GeneralInfoTab from "./tabs/GeneralInfoTab";
import SalaryAndPayrollTab from "./tabs/SalaryAndPayrollTab";
import WorkExperienceAndEducationTab from "./tabs/WorkExperienceAndEducationTab";

import { FaInfoCircle, FaProjectDiagram } from "react-icons/fa";

import { TabItemTw } from "@/components/ui/TabItemTw";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FaBook,
  FaBriefcase,
  FaCalendarDays,
  FaCertificate,
  FaFile,
  FaWallet,
} from "react-icons/fa6";
import ProjectTab from "./tabs/ProjectTab";
import SkillsAndCertificationTab from "./tabs/SkillsAndCertificationTab";
import TrainingAndReferenceTab from "./tabs/TrainingAndReferenceTab";
import PaymentHistory from "./tabs/PaymentHistory";
import AssetDetails from "./tabs/modals/AssetDetails";

const ProfileRightSide = () => {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions) || [];
  const pathname = usePathname();
  const isAdminProfile =
    user?.appUseCase === "Admin" || pathname?.startsWith("/admin/my-profile");
  const grantedAccess = permissions.filter(
    (code) => code && code !== "*" && code !== "super_admin" && code !== "all",
  );

  const TAB_CONFIG = [
    {
      key: "generalInfo",
      label: "General Info",
      icon: <FaInfoCircle />,
      component: <GeneralInfoTab />,
    },
    {
      key: "attendance",
      label: "Attendance",
      icon: <FaCalendarDays />,
      component: <AttendanceTab />,
      access: ["hr.attendance", "hr.attendance_list", "hr.attendance_list_view"],
    },
    {
      key: "assetDetails",
      label: "Asset",
      icon: <FaFile />,
      component: <AssetDetails />,
      access: [
        "hr.employee_asset_allocations_add",
        "hr.employee_asset_allocations_edit",
        "hr.employee_asset_allocations_delete",
      ],
    },
    {
      key: "workExperience",
      label: "Work Experience & Education",
      icon: <FaBriefcase />,
      component: <WorkExperienceAndEducationTab />,
      access: ["hr.employee_list"],
    },

    {
      key: "projects",
      label: "Projects",
      icon: <FaProjectDiagram />,
      component: <ProjectTab />,
      access: ["task_workspaces", "task_workspaces.launch_pad"],
    },
    {
      key: "skillsAndCertifications",
      label: "Skills & Certifications",
      icon: <FaCertificate />,
      component: <SkillsAndCertificationTab />,
      access: ["hr.employee_list"],
    },
    {
      key: "trainingAndReference",
      label: "Training & Reference",
      icon: <FaBook />,
      component: <TrainingAndReferenceTab />,
      access: ["hr.training_request"],
    },

    {
      key: "salaryPayroll",
      label: "Salary & Payroll",
      icon: <FaWallet />,
      component: <SalaryAndPayrollTab />,
      access: [
        "payroll_management.salary_structures",
        "payroll_management.salary_structures_view",
        "payroll_management.employee_payroll_runs",
        "payroll_management.employee_payroll_runs_view",
      ],
    },
    {
      key: "documents",
      label: "Documents",
      icon: <FaFile />,
      component: <DocumentsTab />,
      hideForAdmin: true,
    },

    {
      key: "payment History",
      label: "Payment History",
      icon: <FaFile />,
      component: <PaymentHistory />,
      access: [
        "payroll_management.employee_payroll_runs",
        "payroll_management.employee_payroll_runs_view",
        "payroll_management.salary_structures",
        "payroll_management.salary_structures_view",
      ],
    },
    {
      key: "employeeHistory",
      label: "Employee History",
      icon: <FaFile />,
      component: <EmployeeHistoryTab />,
    },
  ];

  const visibleTabs = useMemo(
    () =>
      TAB_CONFIG.filter((tab) => {
        if (!isAdminProfile) return true;
        if (tab.hideForAdmin) return false;
        if (!tab.access?.length) return true;
        return tab.access.some((code) => grantedAccess.includes(code));
      }),
    [isAdminProfile, grantedAccess],
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.key || "generalInfo");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && visibleTabs.some((tab) => tab.key === tabParam)) {
      setActiveTab(tabParam);
      return;
    }
    if (visibleTabs[0] && !visibleTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [searchParams, visibleTabs, activeTab]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    router.push(`?tab=${tabKey}`, { scroll: false });
  };

  return (
    <div className="text-gray-900 dark:text-gray-100">
      {/* Tabs */}
      <div className="flex flex-wrap items-center divide-x divide-gray-400 dark:divide-gray-600 font-bold text-xs mb-4 border-b border-gray-300 dark:border-gray-600 pb-2.5">
        {visibleTabs.map((tab) => (
          <div key={tab.key} className="my-1.5">
            <TabItemTw
              active={activeTab === tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`${
                activeTab === tab.key
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span className="text-gray-600 dark:text-gray-300">
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </TabItemTw>
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {visibleTabs.find((tab) => tab.key === activeTab)?.component}
      </div>
    </div>
  );
};

export default ProfileRightSide;
// "use client";
// import { useAuthStore } from "@/store/useAuthStore";
// import { useEffect, useState } from "react";
// import AttendanceTab from "./tabs/AttendanceTab";
// import DocumentsTab from "./tabs/DocumentsTab";
// import EmployeeHistoryTab from "./tabs/EmployeeHistoryTab";
// import GeneralInfoTab from "./tabs/GeneralInfoTab";
// import SalaryAndPayrollTab from "./tabs/SalaryAndPayrollTab";
// import WorkExperienceAndEducationTab from "./tabs/WorkExperienceAndEducationTab";

// import { FaInfoCircle } from "react-icons/fa";

// import { TabItemTw } from "@/components/ui/TabItemTw";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   FaBriefcase,
//   FaCalendarDays,
//   FaFile,
//   FaGear,
//   FaWallet,
// } from "react-icons/fa6";
// const ProfileRightSide = () => {
//   const user = useAuthStore((state) => state.user);
//   const [loading, setLoading] = useState(false);

//   const TAB_CONFIG = [
//     // {
//     //   key: "employeeDashboard",
//     //   label: "Employee Dashboard",
//     //   icon: <MdDashboard />,
//     //   component: <EmployeeDashboardTab />,
//     // },
//     {
//       key: "generalInfo",
//       label: "General Info",
//       icon: <FaInfoCircle />,
//       component: <GeneralInfoTab />,
//     },
//     {
//       key: "attendance",
//       label: "Attendance",
//       icon: <FaCalendarDays />,
//       component: <AttendanceTab />,
//     },
//     {
//       key: "employeeHistory",
//       label: "Employee History",
//       icon: <FaFile />,
//       component: <EmployeeHistoryTab />,
//     },
//     {
//       key: "workExperience",
//       label: "Work Experience & Education",
//       icon: <FaBriefcase />,
//       component: <WorkExperienceAndEducationTab />,
//     },
//     {
//       key: "salaryPayroll",
//       label: "Salary & Payroll",
//       icon: <FaWallet />,
//       component: <SalaryAndPayrollTab />,
//     },
//     {
//       key: "documents",
//       label: "Documents",
//       icon: <FaFile />,
//       component: <DocumentsTab />,
//     },
//     {
//       key: "settings",
//       label: "Settings",
//       icon: <FaGear />,
//       component: null,
//     },
//   ];

//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [activeTab, setActiveTab] = useState(TAB_CONFIG[0].key);

//   useEffect(() => {
//     const tabParam = searchParams.get("tab");
//     if (tabParam && TAB_CONFIG.some((tab) => tab.key === tabParam)) {
//       setActiveTab(tabParam);
//     }
//   }, [searchParams]);

//   const handleTabChange = (tabKey) => {
//     setActiveTab(tabKey);
//     router.push(`?tab=${tabKey}`, { scroll: false });
//   };

//   return (
//     <div className="text-gray-900 dark:text-gray-100">
//       {/* Tabs */}
//       <div className="flex flex-wrap items-center divide-x divide-gray-400 dark:divide-gray-600 font-bold text-xs mb-4 border-b border-gray-300 dark:border-gray-600 pb-2.5">
//         {TAB_CONFIG.map((tab) => (
//           <div key={tab.key} className="my-1.5">
//             <TabItemTw
//               active={activeTab === tab.key}
//               onClick={() => handleTabChange(tab.key)}
//               className={`${
//                 activeTab === tab.key
//                   ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
//                   : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
//               }`}
//             >
//               <span className="text-gray-600 dark:text-gray-300">
//                 {tab.icon}
//               </span>
//               <span>{tab.label}</span>
//             </TabItemTw>
//           </div>
//         ))}
//       </div>

//       {/* Tab Content */}
//       <div className="mt-4">
//         {TAB_CONFIG.find((tab) => tab.key === activeTab)?.component}
//       </div>
//     </div>
//   );
// };

// export default ProfileRightSide;
