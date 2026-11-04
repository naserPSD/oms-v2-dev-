// src/features/hr-dashboard/employee/JobRecruitment.jsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaLaptop, FaUsers } from "react-icons/fa";

import { TabItemTw } from "@/components/ui/TabItemTw";
import JobCategoriesTab from "./tabs/JobCategoriesTab";
import JobVacancyComponent from "./tabs/JobVacancyComponent";
import JobRecruitmentStepComponent from "./tabs/JobRecruitmentStepComponent";

const TAB_CONFIG = [
  {
    key: "job-vacancies",
    label: "Job Vacancies",
    icon: <FaUsers className="w-4 h-4" />,
    component: <JobVacancyComponent />,
  },
  {
    key: "job-categories",
    label: "Job Categories",
    icon: <FaLaptop className="w-4 h-4" />,
    component: <JobCategoriesTab />,
  },

  {
    key: "job_recruitment_step_names",
    label: "Job Recruitment Step Names",
    icon: <FaUsers className="w-4 h-4" />,
    component: <JobRecruitmentStepComponent />,
  },
];
const JobRecruitment = () => {
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

export default JobRecruitment;
