'use client';

import React, { useState } from "react";
import TokenDashboardSection from "./TokenDashboardSection";
import TokenListOverview from "./TokenListOverview";
import DataFilter from "@/components/common/DataFilter";
import helpers from "@/utils/helpers";
import { getTimezones } from "@/utils/timezones";

const TokenDashboard = () => {

  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show"
  );


  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search office name, email, phone...",
    },
    {
      component: "select",
      name: "timezone",
      label: "Timezone",
      options: getTimezones(),
      placeholder: "Filter by Timezone",
    },
    {
      component: "clear",
    },
  ];

  return (
    <div className="container mx-auto my-4 space-y-4">
      <h2 className="text-xl font-bold dark-title-color ">Token Management Dashboard</h2>

      <TokenDashboardSection />

      {/* Filter Bar */}
      <DataFilter
        showFilter={showFilter === "show"}
        // filters={filters}
        // onFilterChange={handleFilterChange}
        // onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
      // hasActiveFilters={hasActiveFilters}
      />

      <TokenListOverview />
    </div>
  );
};

export default TokenDashboard;
