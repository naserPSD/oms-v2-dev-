"use client";
import { TabItemTw } from "@/components/ui/TabItemTw";
import AttendanceTab from "@/features/my-profile/tabs/AttendanceTab";

import SalaryAndPayrollTab from "./SalaryAndPayrollTab";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaInfoCircle, FaProjectDiagram } from "react-icons/fa";
import {
  FaBook,
  FaBriefcase,
  FaCalendarDays,
  FaCertificate,
  FaFile,
  FaGear,
  FaWallet,
} from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";
import TrainingAndReferenceTab from "./TrainingAndReferenceTab";
import EmployeeHistoryTab from "./EmployeeHistoryTab";
import WorkExperienceAndEducationTab from "./WorkExperienceAndEducationTab";
import MyProfileDocuments from "@/features/my-profile/MyProfileDocuments";
import EmployeeSkillAndCertificationTab from "./EmployeeSkillAndCertificationTab";
import EmployeeProjectTab from "./EmployeeProjectTab";
import GeneralInfoTab from "./GeneralInfoTab";
import EmployeePaymentHistory from "./EmployeePaymentHistory";
import EmployeeAssetDetail from "./EmployeeAssetDetail";

const EmployeeDetailsAllTab = ({ id }) => {
  const TAB_CONFIG = [
    // {
    //   key: "employeeDashboard",
    //   label: "Employee Dashboard",
    //   icon: <MdDashboard />,
    //   component: <EmployeeDashboardTab />,
    // },
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
    },
    {
      key: "employeeAssetDetails",
      label: "Asset",
      icon: <FaFile />,
      component: <EmployeeAssetDetail employeeId={id} />,
    },

    {
      key: "workExperience",
      label: "Work Experience & Education",
      icon: <FaBriefcase />,
      component: <WorkExperienceAndEducationTab />,
    },
    {
      key: "projects",
      label: "Projects",
      icon: <FaProjectDiagram />,
      component: <EmployeeProjectTab employeeId={id} />,
    },
    {
      key: "skillsAndCertifications",
      label: "Skills & Certifications",
      icon: <FaCertificate />,
      component: <EmployeeSkillAndCertificationTab employeeId={id} />,
    },
    {
      key: "trainingAndReference",
      label: "Training & Reference",
      icon: <FaBook />,
      component: <TrainingAndReferenceTab />,
    },
    {
      key: "salaryPayroll",
      label: "Salary & Payroll",
      icon: <FaWallet />,
      component: <SalaryAndPayrollTab />,
    },

    {
      key: "documents",
      label: "Documents",
      icon: <FaFile />,
      component: <MyProfileDocuments employeeId={id} />,
    },

    {
      key: "payment History",
      label: "Payment History",
      icon: <FaFile />,
      component: <EmployeePaymentHistory employeeId={id} />,
    },
    {
      key: "employeeHistory",
      label: "Employee History",
      icon: <FaFile />,
      component: <EmployeeHistoryTab employeeId={id} />,
    },
  ];

  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(TAB_CONFIG[0].key);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && TAB_CONFIG.some((tab) => tab.key === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    router.push(`?tab=${tabKey}`, { scroll: false });
  };

  return (
    <div className="text-gray-900 dark:text-gray-100">
      {/* Tabs */}
      <div className="flex flex-wrap items-center divide-x divide-gray-400 dark:divide-gray-600 font-bold text-xs mb-4 border-b border-gray-300 dark:border-gray-600 pb-2.5">
        {TAB_CONFIG.map((tab) => (
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
        {TAB_CONFIG.find((tab) => tab.key === activeTab)?.component}
      </div>
    </div>
  );
};

export default EmployeeDetailsAllTab;
