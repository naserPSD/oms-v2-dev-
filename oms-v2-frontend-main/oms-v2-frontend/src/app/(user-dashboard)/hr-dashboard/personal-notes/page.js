import HrPersonalNotes from "@/features/hr-dashboard/hr-prsonal-notes/HrPersonalNotes";
import React, { Suspense } from "react";

export const metadata = {
  title: "Personal Notes | Sanzio",
  description: "View and manage personal notes.",
};

const NotesPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HrPersonalNotes />
    </Suspense>
  );
};

export default NotesPage;
