// PrifleRightSide.jsx
"use client";
import TabContent from "@/components/ui/TabContent";
import TabItem from "@/components/ui/TabItem";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import AttendanceTab from "./tabs/AttendanceTab";
import EmployeeHistoryTab from "./tabs/EmployeeHistoryTab";
import DocumentsTab from "./tabs/DocumentsTab";
import WorkExperienceAndEducationTab from "./tabs/WorkExperienceAndEducationTab";
import SalaryAndPayrollTab from "./tabs/SalaryAndPayrollTab";
import GeneralInfoTab from "./tabs/GeneralInfoTab";

const ProfileRightSide = () => {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);

  const TAB_CONFIG = [
    {
      key: "generalInfo",
      label: "General Info",
      icon: `<i className="fa-solid fa-circle-info"></i>`,
      component: <GeneralInfoTab />,
    },
    {
      key: "attendance",
      label: "Attendance",
      icon: `<i className="fa-solid fa-calendar-days"></i>`,
      component: <AttendanceTab />,
    },
    {
      key: "employeeHistory",
      label: "Employee History",
      icon: `<i className="fa-regular fa-file"></i>`,
      component: <EmployeeHistoryTab />,
    },
    {
      key: "workExperience",
      label: "Work Experience & Education",
      icon: `<i className="fa-solid fa-briefcase"></i>`,
      component: <WorkExperienceAndEducationTab />,
    },
    {
      key: "salaryPayroll",
      label: "Salary & Payroll",
      icon: `<i className="fa-solid fa-wallet"></i>`,
      component: <SalaryAndPayrollTab />,
    },
    {
      key: "documents",
      label: "Documents",
      icon: `<i className="fa-solid fa-file"></i>`,
      component: <DocumentsTab />,
    },
    {
      key: "settings",
      label: "Settings",
      icon: `<i className="fa-solid fa-gear"></i>`,
      component: null,
    },
  ];

  const [activeTab, setActiveTab] = useState(TAB_CONFIG[0].key);

  return (
    <>
      <div className="min-w-[411px] sm:w-full flex-1 profile-card">
        <div className="flex flex-col">
          <ul className="list-none w-full flex flex-row bg flex-wrap gap-y-2 ">
            {TAB_CONFIG.map((tab) => (
              <li
                className="border-r border-gray-300 dark:border-gray-700 gap-2"
                key={tab.key}
              >
                {/* <button onClick={() => setActiveTab(tab.key)} className={`flex flex-row items-center gap-2 cursor-pointer btn hover:bg-blue-300 dark:hover:text-gray-700 font-bold leading-[16px] py-[15px] px-[10px] rounded-none text-[12px] 2xl:text-[16px] w-full ${activeTab === tab.key
                                        ? "bg-blue-200 text-gray-700"
                                        : "bg-white text-gray-700 dark:bg-theme-dark dark:text-gray-500"
                                    }`}>
                                    <span dangerouslySetInnerHTML={{ __html: tab.icon }} />
                                    <span className="text-nowrap">{tab.label}</span>
                                </button> */}

                <TabItem
                  active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span dangerouslySetInnerHTML={{ __html: tab.icon }} />
                  <span>{tab.label}</span>
                </TabItem>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative w-full mt-4">
          {/* generalInfo Tab Content */}
          {TAB_CONFIG.map((tab) => (
            <TabContent
              key={tab.key}
              className={`flex flex-col`}
              active={activeTab === tab.key}
            >
              {tab.component}
            </TabContent>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProfileRightSide;
