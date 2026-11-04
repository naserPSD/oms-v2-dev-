import CrmTasksPage from "@/features/crm/tasks/CrmTasksPage";
import React from "react";

export const metadata = {
  title: "CRM Tasks & Follow-ups | Revinr OMS",
  description: "View upcoming tasks, follow-ups, and review previous completed activities.",
};

const CRMTasksRoutePage = () => {
  return <CrmTasksPage />;
};

export default CRMTasksRoutePage;
