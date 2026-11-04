// src/features/hr-dashboard/employee/HrEmployee.jsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaList } from "react-icons/fa";
import { TabItemTw } from "@/components/ui/TabItemTw";
import JobVanciesComponent from "./JobVacancies/JobVanciesComponent";
import JobCategoriesComponent from "./JobCategories/JobCategoriesComponent";
import JobRecruitmentStepComponent from "./JobRecruitmentStep/JobRecruitmentStepComponent";

const TAB_CONFIG = [
  {
    key: "job-vacancies",
    label: "Job Vacancies",
    icon: <FaList className="w-4 h-4" />,
    component: <JobVanciesComponent />,
  },
  {
    key: "job-categories",
    label: "Job Categories",
    icon: <FaList className="w-4 h-4" />,
    component: <JobCategoriesComponent />,
  },
  {
    key: "job-recruitment-step-names",
    label: "Job Recruitment Step Names",
    icon: <FaList className="w-4 h-4" />,
    component: <JobRecruitmentStepComponent />,
  },
];
const NewHrRecruitment = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(TAB_CONFIG[0].key);

  // Initialize active tab from URL params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && TAB_CONFIG.some((tab) => tab.key === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    // Update URL without page reload
    router.push(`?tab=${tabKey}`, { scroll: false });
  };

  return (
    <div className="my-6">
      {/* Tabs */}

      <div className="flex flex-wrap items-center divide-x text-gray-500 divide-gray-400 font-bold text-xs mb-4 border-b pb-2.5">
        {TAB_CONFIG.map((tab) => (
          <div key={tab.key}>
            <TabItemTw
              active={activeTab === tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={activeTab === tab.key ? "border-b" : ""}
            >
              {tab.icon}
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

export default NewHrRecruitment;
