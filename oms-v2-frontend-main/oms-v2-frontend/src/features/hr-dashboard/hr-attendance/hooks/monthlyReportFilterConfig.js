// hooks/monthlyReportFilterConfig.js
export const monthlyReportFilterConfig = ({
  officeList,
  departmentList,
  designationList,
}) => {
  // Generate month options (last 12 months)
  const getMonthOptions = () => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      months.push({ value, label });
    }
    return months;
  };

  return [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Name, Email, Phone...",
    },
    {
      component: "select",
      name: "officeId",
      label: "Select Office",
      options: officeList || [],
      placeholder: "Filter by Office",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "departmentId",
      label: "Select Department",
      options: departmentList || [],
      placeholder: "Filter by Department",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },

    {
      component: "select",
      name: "designationId",
      label: "Select Designation",
      options: designationList,
      placeholder: "Filter by Designation",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },

    {
      component: "select",
      name: "month",
      label: "Select Month",
      type: "select",
      options: getMonthOptions(),
      placeholder: "Select Month",
    },
  ];
};
