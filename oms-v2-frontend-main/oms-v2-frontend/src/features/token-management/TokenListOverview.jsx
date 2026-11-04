"use client";
import { TabItemTw } from "@/components/ui/TabItemTw";
import { attendanceData } from "@/utils/attendanceData";
import { tokenList } from "@/utils/dumyData";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const TAB_CONFIG = [
  {
    key: "all",
    label: "All",
    component: (
      <div>
        {/* Responsive Table */}
        <div className="table-container">
          {/* Desktop Table */}
          <table className="table">
            <thead>
              <tr>
                <th>Issue ID</th>
                <th>Subject</th>
                <th>Problem Area</th>
                <th className="text-center">Status</th>
                <th className="text-center">Created</th>
                <th className="text-center">Assigned Person</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {tokenList.map((item, i) => (
                <tr key={i}>
                  <td>#{item.id}</td>
                  <td>{item.subject}</td>
                  <td>{item.description}</td>
                  <td className="text-center">
                    <span
                      className={`whitespace-nowrap text-theme-light-text  px-3 rounded-full py-1 pb-1.5  bg-${item.statusColor}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                  {/* {item.createdAt} */}
                  {new Date().toDateString()}
                  </td>
                  <td className="flex items-center flex-wrap gap-2">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-semibold dark-title-color">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">{item.office}</p>
                    </div>
                  </td>
                  <td>
                    <div className="action">
                      <button type="button" className="btn-action">
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>
                      <button
                        type="button"
                        className="btn-action hover:text-red-600"
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    key: "open",
    label: "Open",
    component: <div>Open</div>,
  },
  {
    key: "in-progress",
    label: "In Progress",
    component: <div>In Progress</div>,
  },
  {
    key: "closed",
    label: "Closed",
    component: <div>Closed</div>,
  },
  {
    key: "resolved",
    label: "Resolved",
    component: <div>Resolved</div>,
  },
];
const TokenListOverview = () => {
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
    <div className="">
      <div className="dark:bg-theme-dark bg-theme-light  rounded-lg shadow-md p-4">
        {/* Header */}
        <div className="flex items-center flex-wrap justify-between gap-4 mb-4 mt-2">
          <h2 className="font-bold title-color text-lg">
            Token overview
          </h2>
          <div className="flex flex-wrap items-center divide-x text-gray-500 divide-gray-400 font-bold text-xs ">
            {TAB_CONFIG.map((tab) => (
              <div key={tab.key} className="">
                <TabItemTw
                  active={activeTab === tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={activeTab === tab.key ? "border-b" : ""}
                >
                  <span>{tab.label}</span>
                </TabItemTw>
              </div>
            ))}
          </div>

          {/* Tab Content */}
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1 border px-2 py-1 rounded-full text-sm title-color cursor-pointer">
            <span>📅</span> <span>{new Date().toDateString()}</span>
          </div>
          <span className="text-sm text-secondaryColor pl-2 font-semibold">
            Total: 3
          </span>
        </div>
        <div className="mt-4">
          {TAB_CONFIG.find((tab) => tab.key === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default TokenListOverview;
